const PASSWORD_HASH_CONFIG = Object.freeze({
    algorithm: "PBKDF2",
    hash: "SHA-256",
    iterations: 120000,
    keyLengthBits: 256,
    saltLengthBytes: 16,
    version: "pbkdf2-sha256-v1",
});

/**
 * Returns the browser Web Crypto API instance.
 *
 * @returns {Crypto}
 * @throws {Error} When Web Crypto is unavailable.
 */
function getWebCryptoOrThrow() {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
        return window.crypto;
    }
    throw new Error("Web Crypto API is not available in this browser.");
}

/**
 * Converts bytes into a hex string.
 *
 * @param {Uint8Array} bytes - Raw binary data.
 * @returns {string} Hexadecimal representation.
 */
function bytesToHex(bytes) {
    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Converts a hex string to bytes.
 *
 * @param {string} hexString - Even-length hex string.
 * @returns {Uint8Array}
 * @throws {Error} When input is not valid hex.
 */
function hexToBytes(hexString) {
    if (typeof hexString !== "string" || hexString.length % 2 !== 0) {
        throw new Error("Invalid hex string.");
    }

    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
    }
    return bytes;
}

/**
 * Performs a constant-time comparison for equal-length strings.
 *
 * @param {string} a - First value.
 * @param {string} b - Second value.
 * @returns {boolean}
 */
function timingSafeEqual(a, b) {
    if (typeof a !== "string" || typeof b !== "string") {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }

    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

/**
 * Normalizes email values used for auth comparisons.
 *
 * @param {string} email - Raw email input.
 * @returns {string} Lowercased, trimmed email or empty string.
 */
function normalizeAuthEmail(email) {
    if (typeof email !== "string") {
        return "";
    }
    return email.trim().toLowerCase();
}

/**
 * Checks whether a normalized email already exists in a user list.
 *
 * @param {Array<Object>} usersList - User records to inspect.
 * @param {string} emailToCheck - Candidate email value.
 * @param {{excludeId?: number|string}} [options={}] - Optional id to ignore.
 * @returns {boolean}
 */
function doesEmailExist(usersList, emailToCheck, options = {}) {
    if (!Array.isArray(usersList)) {
        return false;
    }

    const normalizedMail = normalizeAuthEmail(emailToCheck);
    if (normalizedMail === "") {
        return false;
    }

    const hasExcludeId = Object.prototype.hasOwnProperty.call(options, "excludeId");
    const excludeId = hasExcludeId ? options.excludeId : null;

    return usersList.some((user) => {
        if (!user || typeof user !== "object") {
            return false;
        }

        if (hasExcludeId && user.id === excludeId) {
            return false;
        }

        return normalizeAuthEmail(user.mail) === normalizedMail;
    });
}

/**
 * Backward-compatible duplicate-email check for legacy call sites.
 *
 * @param {string} mailToCheck - Candidate email value.
 * @param {Array<Object>} usersList - Optional user list override.
 * @returns {boolean}
 */
function checkMailExist(mailToCheck, usersList) {
    const sourceUsers = Array.isArray(usersList)
        ? usersList
        : typeof users !== "undefined" && Array.isArray(users)
            ? users
            : [];
    return doesEmailExist(sourceUsers, mailToCheck);
}

/**
 * Derives a password hash using PBKDF2-SHA256.
 *
 * @param {string} password - Plain password input.
 * @param {string} saltHex - Salt encoded as hex.
 * @param {number} iterations - PBKDF2 iteration count.
 * @returns {Promise<string>} Derived hash as hex.
 */
async function derivePasswordHash(password, saltHex, iterations) {
    if (typeof password !== "string" || password.length === 0) {
        throw new Error("Password must be a non-empty string.");
    }

    const cryptoApi = getWebCryptoOrThrow();
    const encoder = new TextEncoder();
    const keyMaterial = await cryptoApi.subtle.importKey(
        "raw",
        encoder.encode(password),
        PASSWORD_HASH_CONFIG.algorithm,
        false,
        ["deriveBits"]
    );

    const derivedBits = await cryptoApi.subtle.deriveBits(
        {
            name: PASSWORD_HASH_CONFIG.algorithm,
            salt: hexToBytes(saltHex),
            iterations,
            hash: PASSWORD_HASH_CONFIG.hash,
        },
        keyMaterial,
        PASSWORD_HASH_CONFIG.keyLengthBits
    );

    return bytesToHex(new Uint8Array(derivedBits));
}

/**
 * Creates secure password credentials for a new user.
 *
 * @param {string} plainPassword - Plain password input.
 * @returns {Promise<{passwordHash: string, passwordSalt: string, passwordHashIterations: number, passwordHashVersion: string}>}
 */
async function createPasswordCredentials(plainPassword) {
    const cryptoApi = getWebCryptoOrThrow();
    const saltBytes = cryptoApi.getRandomValues(
        new Uint8Array(PASSWORD_HASH_CONFIG.saltLengthBytes)
    );
    const passwordSalt = bytesToHex(saltBytes);
    const passwordHash = await derivePasswordHash(
        plainPassword,
        passwordSalt,
        PASSWORD_HASH_CONFIG.iterations
    );

    return {
        passwordHash,
        passwordSalt,
        passwordHashIterations: PASSWORD_HASH_CONFIG.iterations,
        passwordHashVersion: PASSWORD_HASH_CONFIG.version,
    };
}

/**
 * Identifies users that still store legacy plaintext passwords.
 *
 * @param {Object} user - User record to check.
 * @returns {boolean}
 */
function isLegacyPlaintextPasswordUser(user) {
    return (
        user &&
        typeof user === "object" &&
        typeof user.password === "string" &&
        user.password.length > 0 &&
        (!user.passwordHash || typeof user.passwordHash !== "string")
    );
}

/**
 * Verifies that a user contains the secure password fields.
 *
 * @param {Object} user - User record to validate.
 * @returns {boolean}
 */
function hasSecurePasswordCredentials(user) {
    return (
        user &&
        typeof user.passwordHash === "string" &&
        user.passwordHash.length > 0 &&
        typeof user.passwordSalt === "string" &&
        user.passwordSalt.length > 0
    );
}

/**
 * Ensures secure-password metadata exists on a user record.
 *
 * @param {Object} user - User record to normalize in place.
 * @returns {boolean} True when metadata was modified.
 */
function normalizePasswordMetadata(user) {
    if (!hasSecurePasswordCredentials(user)) {
        return false;
    }

    let changed = false;

    if (
        typeof user.passwordHashIterations !== "number" ||
        !Number.isInteger(user.passwordHashIterations) ||
        user.passwordHashIterations <= 0
    ) {
        user.passwordHashIterations = PASSWORD_HASH_CONFIG.iterations;
        changed = true;
    }

    if (typeof user.passwordHashVersion !== "string" || user.passwordHashVersion.length === 0) {
        user.passwordHashVersion = PASSWORD_HASH_CONFIG.version;
        changed = true;
    }

    return changed;
}

/**
 * Migrates users from plaintext password storage to hashed credentials.
 *
 * @param {Array<Object>} users - User collection to migrate in place.
 * @returns {Promise<{changed: boolean}>}
 */
async function migrateLegacyPlaintextPasswords(users) {
    if (!Array.isArray(users)) {
        return { changed: false };
    }

    let changed = false;

    for (const user of users) {
        if (isLegacyPlaintextPasswordUser(user)) {
            const credentials = await createPasswordCredentials(user.password);
            delete user.password;
            Object.assign(user, credentials);
            changed = true;
            continue;
        }

        if (normalizePasswordMetadata(user)) {
            changed = true;
        }
    }

    return { changed };
}

/**
 * Verifies a plaintext password against stored hashed credentials.
 *
 * @param {Object} user - User record containing password metadata.
 * @param {string} plainPassword - Candidate plaintext password.
 * @returns {Promise<boolean>}
 */
async function verifyPasswordCredentials(user, plainPassword) {
    if (!hasSecurePasswordCredentials(user)) {
        return false;
    }

    const iterations =
        typeof user.passwordHashIterations === "number" &&
        Number.isInteger(user.passwordHashIterations) &&
        user.passwordHashIterations > 0
            ? user.passwordHashIterations
            : PASSWORD_HASH_CONFIG.iterations;

    const candidateHash = await derivePasswordHash(
        plainPassword,
        user.passwordSalt,
        iterations
    );

    return timingSafeEqual(user.passwordHash, candidateHash);
}
