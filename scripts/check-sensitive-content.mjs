#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const KEYWORD_FILE = "scripts/sensitive-keywords.txt";
const ALLOWLIST_FILES = new Set([KEYWORD_FILE, "scripts/check-sensitive-content.mjs"]);
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

function scanPath(relativePath, keywords) {
  const haystack = relativePath.toLowerCase();
  return keywords
    .filter((keyword) => haystack.includes(keyword.toLowerCase()))
    .map((keyword) => ({ file: relativePath, line: 1, keyword }));
}

const keywords = await readKeywords();
const files = await walk(ROOT);
const matches = [];

for (const relativePath of files) {
  if (ALLOWLIST_FILES.has(relativePath)) continue;

  matches.push(...scanPath(relativePath, keywords));
  const content = await fs.readFile(path.join(ROOT, relativePath), "utf8");
  matches.push(...scanContent(relativePath, content, keywords));
}

if (matches.length > 0) {
  console.error("Sensitive content check failed. Remove or fictionalize the following matches:");
  for (const match of matches) {
    console.error(`- ${match.file}:${match.line} contains "${match.keyword}"`);
  }
  process.exit(1);
}

console.log(`Sensitive content check passed. Scanned ${files.length} text files against ${keywords.length} banned keywords.`);
