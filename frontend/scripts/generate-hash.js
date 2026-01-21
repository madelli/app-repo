#!/usr/bin/env node
/**
 * Password Hash Generator
 *
 * Generates SHA-256 hash for use in auth.js VALID_PASSWORD_HASH
 *
 * Usage:
 *   node scripts/generate-hash.js <password>
 *   node scripts/generate-hash.js portal2026
 *
 * Copy the output hash to src/utils/auth.js
 */

import { createHash } from "crypto";

function generateHash(text) {
  return createHash("sha256").update(text).digest("hex");
}

const password = process.argv[2];

if (!password) {
  console.log("Usage: node scripts/generate-hash.js <password>");
  console.log("Example: node scripts/generate-hash.js portal2026");
  process.exit(1);
}

const hash = generateHash(password);

console.log("");
console.log("Password:", password);
console.log("SHA-256 Hash:", hash);
console.log("");
console.log("Copy this hash to src/utils/auth.js:");
console.log(`const VALID_PASSWORD_HASH = "${hash}";`);
console.log("");
