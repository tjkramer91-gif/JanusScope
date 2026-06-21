#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const KEYWORD_FILE = "scripts/sensitive-keywords.txt";
const APPROVAL_FILE = "scripts/synthetic-data-approvals.json";
const ALLOWLIST_FILES = new Set([KEYWORD_FILE, APPROVAL_FILE, "scripts/check-sensitive-content.mjs"]);
const SKIP_DIRS = new Set([
  ".git",
  ".next",
  ".vercel",
  ".data",
  "node_modules",
  "uploads",
  "storage",
  "documents",
  "exports",
  "reports",
  "tmp",
  "temp",
]);
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".csv",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const TEXT_BASENAMES = new Set([".env.example", ".gitignore"]);
const ALLOW_START_PATTERN = /<!--\s*sensitive-content-check:\s*allow-start\s*-->/i;
const ALLOW_END_PATTERN = /<!--\s*sensitive-content-check:\s*allow-end\s*-->/i;
const GENERIC_PATTERNS = [
  {
    id: "company-like-name",
    severity: "error",
    pattern:
      /\b[A-Z][A-Za-z0-9&' -]{2,80}\s(?:LLC|Inc|Corp|Corporation|Company|Co\.|Partners|Group|Builders|Construction|Architects?|Engineering|Consulting|Properties|Services)\b/g,
    reason: "Unapproved company-like name",
  },
  {
    id: "postal-address",
    severity: "error",
    pattern:
      /\b\d{2,5}\s+[A-Z][A-Za-z0-9.'-]*(?:\s+[A-Z][A-Za-z0-9.'-]*){0,5}\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct|Place|Pl|Terrace|Ter)\b/g,
    reason: "Unapproved address-like string",
  },
  {
    id: "email-address",
    severity: "error",
    pattern: /\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}\b/gi,
    reason: "Unapproved email address",
  },
  {
    id: "phone-number",
    severity: "error",
    pattern: /\b(?:\+?1[-. (]*)?(?:\d{3}[-. )]+\d{3}[-. ]+\d{4}|\d{3}-\d{4})\b/g,
    reason: "Unapproved phone number",
  },
  {
    id: "currency",
    severity: "warning",
    pattern: /\$\s?\d[\d,]*(?:\.\d{2})?/g,
    reason: "Hardcoded dollar amount review warning",
  },
  {
    id: "unit-count",
    severity: "warning",
    pattern: /\b\d{2,4}\s+Units?\b/g,
    reason: "Hardcoded unit-count review warning",
  },
];

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function isTextFile(relativePath) {
  const baseName = path.basename(relativePath);
  return TEXT_BASENAMES.has(baseName) || TEXT_EXTENSIONS.has(path.extname(relativePath).toLowerCase());
}

async function readKeywords() {
  const raw = await fs.readFile(path.join(ROOT, KEYWORD_FILE), "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

async function readApprovals() {
  const raw = await fs.readFile(path.join(ROOT, APPROVAL_FILE), "utf8");
  const parsed = JSON.parse(raw);
  return new Set(Object.keys(parsed.approvedFiles ?? {}));
}

async function walk(directory, files = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = normalizePath(path.relative(ROOT, absolutePath));

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        await walk(absolutePath, files);
      }
      continue;
    }

    if (entry.isFile() && isTextFile(relativePath)) {
      files.push(relativePath);
    }
  }
  return files;
}

function scanContent(relativePath, content, keywords) {
  const matches = [];
  const lines = content.split(/\r?\n/);
  let allowBlock = false;

  for (const [index, line] of lines.entries()) {
    if (ALLOW_START_PATTERN.test(line)) {
      allowBlock = true;
      continue;
    }
    if (ALLOW_END_PATTERN.test(line)) {
      allowBlock = false;
      continue;
    }
    if (allowBlock) continue;

    const haystack = line.toLowerCase();
    for (const keyword of keywords) {
      if (haystack.includes(keyword.toLowerCase())) {
        matches.push({ file: relativePath, line: index + 1, keyword });
      }
    }
  }

  return matches;
}

function isSafeReservedEmail(value) {
  return /\.(example|invalid|local)$/i.test(value);
}

function isSafeReservedPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55501") || digits.startsWith("155501");
}

function scanGenericPatterns(relativePath, content, approvedFiles) {
  if (approvedFiles.has(relativePath)) return [];

  const matches = [];
  const lines = content.split(/\r?\n/);
  let allowBlock = false;

  for (const rule of GENERIC_PATTERNS) {
    allowBlock = false;
    for (const [index, line] of lines.entries()) {
      if (ALLOW_START_PATTERN.test(line)) {
        allowBlock = true;
        continue;
      }
      if (ALLOW_END_PATTERN.test(line)) {
        allowBlock = false;
        continue;
      }
      if (allowBlock) continue;
      const found = [...line.matchAll(rule.pattern)];
      for (const match of found) {
        const value = match[0];
        if (rule.id === "email-address" && isSafeReservedEmail(value)) continue;
        if (rule.id === "phone-number" && isSafeReservedPhone(value)) continue;
        matches.push({
          file: relativePath,
          line: index + 1,
          keyword: value,
          reason: rule.reason,
          severity: rule.severity,
        });
      }
    }
  }

  return matches;
}

function scanPath(relativePath, keywords) {
  const haystack = relativePath.toLowerCase();
  return keywords
    .filter((keyword) => haystack.includes(keyword.toLowerCase()))
    .map((keyword) => ({ file: relativePath, line: 1, keyword, severity: "error", reason: "Banned keyword in file path" }));
}

const keywords = await readKeywords();
const approvedFiles = await readApprovals();
const files = await walk(ROOT);
const matches = [];
const warnings = [];

for (const relativePath of files) {
  if (ALLOWLIST_FILES.has(relativePath)) continue;

  matches.push(...scanPath(relativePath, keywords));
  const content = await fs.readFile(path.join(ROOT, relativePath), "utf8");
  matches.push(...scanContent(relativePath, content, keywords).map((match) => ({ ...match, severity: "error", reason: "Banned keyword in file content" })));
  for (const match of scanGenericPatterns(relativePath, content, approvedFiles)) {
    if (match.severity === "error") {
      matches.push(match);
    } else {
      warnings.push(match);
    }
  }
}

if (matches.length > 0) {
  console.error("Sensitive content check failed. Remove or replace the following matches with approved synthetic data:");
  for (const match of matches) {
    console.error(`- ${match.file}:${match.line} ${match.reason}: "${match.keyword}"`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn("Sensitive content check warnings. Review these hardcoded demo values before shipping:");
  for (const warning of warnings) {
    console.warn(`- ${warning.file}:${warning.line} ${warning.reason}: "${warning.keyword}"`);
  }
}

console.log(
  `Sensitive content check passed. Scanned ${files.length} text files against ${keywords.length} banned keywords and ${GENERIC_PATTERNS.length} generic pattern rules.`,
);
