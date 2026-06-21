#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const KEYWORD_FILE = "scripts/sensitive-keywords.txt";
const TARGET_PATHS = [
  ".data/subscope-db.json",
  ".data/uploads",
  "documents",
  "exports",
  "reports",
  "storage",
  "uploads",
];
const TEXT_EXTENSIONS = new Set([
  ".csv",
  ".html",
  ".json",
  ".md",
  ".txt",
  ".yaml",
  ".yml",
]);
const MAX_BYTES = 2 * 1024 * 1024;
const GENERIC_PATTERNS = [
  {
    id: "company-like-name",
    pattern:
      /\b[A-Z][A-Za-z0-9&' -]{2,80}\s(?:LLC|Inc|Corp|Corporation|Company|Co\.|Partners|Group|Builders|Construction|Architects?|Engineering|Consulting|Properties|Services)\b/g,
    reason: "Company-like name",
  },
  {
    id: "postal-address",
    pattern:
      /\b\d{2,5}\s+[A-Z][A-Za-z0-9.'-]*(?:\s+[A-Z][A-Za-z0-9.'-]*){0,5}\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct|Place|Pl|Terrace|Ter)\b/g,
    reason: "Address-like string",
  },
  {
    id: "email-address",
    pattern: /\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}\b/gi,
    reason: "Email address",
  },
  {
    id: "phone-number",
    pattern: /\b(?:\+?1[-. (]*)?(?:\d{3}[-. )]+\d{3}[-. ]+\d{4}|\d{3}-\d{4})\b/g,
    reason: "Phone number",
  },
  {
    id: "currency",
    pattern: /\$\s?\d[\d,]*(?:\.\d{2})?/g,
    reason: "Dollar amount",
  },
  {
    id: "unit-count",
    pattern: /\b\d{2,4}\s+Units?\b/g,
    reason: "Unit count",
  },
];

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function isSafeReservedEmail(value) {
  return /\.(example|invalid|local)$/i.test(value);
}

function isSafeReservedPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55501") || digits.startsWith("155501");
}

async function exists(absolutePath) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function readKeywords() {
  const raw = await fs.readFile(path.join(ROOT, KEYWORD_FILE), "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function isTextFile(relativePath) {
  return TEXT_EXTENSIONS.has(path.extname(relativePath).toLowerCase());
}

async function walk(absolutePath, files = []) {
  const stat = await fs.stat(absolutePath);
  if (stat.isFile()) {
    const relativePath = normalizePath(path.relative(ROOT, absolutePath));
    if (isTextFile(relativePath) && stat.size <= MAX_BYTES) files.push(relativePath);
    return files;
  }

  if (!stat.isDirectory()) return files;

  const entries = await fs.readdir(absolutePath, { withFileTypes: true });
  for (const entry of entries) {
    await walk(path.join(absolutePath, entry.name), files);
  }
  return files;
}

function scanLine(relativePath, line, lineNumber, keywords) {
  const matches = [];
  const lowerLine = line.toLowerCase();

  for (const keyword of keywords) {
    if (lowerLine.includes(keyword.toLowerCase())) {
      matches.push({ file: relativePath, line: lineNumber, reason: "Banned keyword", value: keyword });
    }
  }

  for (const rule of GENERIC_PATTERNS) {
    for (const match of line.matchAll(rule.pattern)) {
      const value = match[0];
      if (rule.id === "email-address" && isSafeReservedEmail(value)) continue;
      if (rule.id === "phone-number" && isSafeReservedPhone(value)) continue;
      matches.push({ file: relativePath, line: lineNumber, reason: rule.reason, value });
    }
  }

  return matches;
}

function scanPath(relativePath, keywords) {
  const lowerPath = relativePath.toLowerCase();
  return keywords
    .filter((keyword) => lowerPath.includes(keyword.toLowerCase()))
    .map((keyword) => ({ file: relativePath, line: 1, reason: "Banned keyword in file path", value: keyword }));
}

const keywords = await readKeywords();
const files = [];
for (const target of TARGET_PATHS) {
  const absolutePath = path.join(ROOT, target);
  if (await exists(absolutePath)) {
    await walk(absolutePath, files);
  }
}

const matches = [];
for (const relativePath of files) {
  matches.push(...scanPath(relativePath, keywords));
  const content = await fs.readFile(path.join(ROOT, relativePath), "utf8");
  content.split(/\r?\n/).forEach((line, index) => {
    matches.push(...scanLine(relativePath, line, index + 1, keywords));
  });
}

if (matches.length > 0) {
  console.error("Runtime sensitive-data check failed. Purge local uploads, exports, reports, or database rows before building or demoing:");
  for (const match of matches) {
    console.error(`- ${match.file}:${match.line} ${match.reason}: "${match.value}"`);
  }
  process.exit(1);
}

console.log(`Runtime sensitive-data check passed. Scanned ${files.length} local runtime text files.`);
