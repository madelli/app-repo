/**
 * Local Authentication Utility
 *
 * Provides offline password verification using SHA-256 hashing.
 * No network requests - all validation is performed locally.
 *
 * Security notes:
 * - Password hash is stored in this file (can be moved to env vars)
 * - Uses Web Crypto API for SHA-256 hashing
 * - Authentication state stored in sessionStorage (cleared on tab close)
 */

// Pre-computed SHA-256 hash of the access code
// Default: "portal2026" → SHA-256 hash below
// To generate a new hash: node scripts/generate-hash.js <your-password>
const VALID_PASSWORD_HASH =
  "09ddc5ca1d9317a325857b8bcd44cee9ea23fadb939801e64cda7dd32887ee0a";

// Session storage key for authentication state
const AUTH_KEY = "portal_auth";
const AUTH_TIMESTAMP_KEY = "portal_auth_ts";

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate SHA-256 hash of a string
 * Uses Web Crypto API (available in all modern browsers)
 */
export async function generateHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

/**
 * Verify password against stored hash
 * Returns true if password matches, false otherwise
 */
export async function verifyPassword(password) {
  if (!password || typeof password !== "string") {
    return false;
  }

  try {
    const inputHash = await generateHash(password.trim());
    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(inputHash, VALID_PASSWORD_HASH);
  } catch {
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Check if user is currently authenticated
 * Validates both auth flag and session timeout
 */
export function isAuthenticated() {
  try {
    const authFlag = sessionStorage.getItem(AUTH_KEY);
    const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP_KEY);

    if (authFlag !== "true" || !timestamp) {
      return false;
    }

    // Check session timeout
    const authTime = parseInt(timestamp, 10);
    const now = Date.now();

    if (now - authTime > SESSION_TIMEOUT) {
      // Session expired, clear auth
      clearAuth();
      return false;
    }

    return true;
  } catch {
    // sessionStorage not available
    return false;
  }
}

/**
 * Set authentication state after successful login
 */
export function setAuthenticated() {
  try {
    sessionStorage.setItem(AUTH_KEY, "true");
    sessionStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // sessionStorage not available - auth will be memory-only
    console.warn("sessionStorage not available");
  }
}

/**
 * Clear authentication state (logout)
 */
export function clearAuth() {
  try {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_TIMESTAMP_KEY);
  } catch {
    // Ignore errors
  }
}

/**
 * Refresh session timestamp (call on user activity)
 */
export function refreshSession() {
  if (isAuthenticated()) {
    try {
      sessionStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Get remaining session time in milliseconds
 */
export function getSessionTimeRemaining() {
  try {
    const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP_KEY);
    if (!timestamp) return 0;

    const authTime = parseInt(timestamp, 10);
    const remaining = SESSION_TIMEOUT - (Date.now() - authTime);
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}
