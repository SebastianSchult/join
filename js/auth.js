const PASSWORD_HASH_CONFIG = Object.freeze({
    algorithm: "PBKDF2",
    hash: "SHA-256",
    iterations: 120000,
    keyLengthBits: 256,
    saltLengthBytes: 16,
    version: "pbkdf2-sha256-v1",
});

function getWebCryptoOrThrow() {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
        return window.crypto;
    }
    throw new Error("Web Crypto API is not available in this browser.");
}

function bytesToHex(bytes) {
    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

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

function normalizeAuthEmail(email) {
    if (typeof email !== "string") {
        return "";
    }
    return email.trim().toLowerCase();
}

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

function checkMailExist(mailToCheck, usersList) {
    const sourceUsers = Array.isArray(usersList)
        ? usersList
        : typeof users !== "undefined" && Array.isArray(users)
            ? users
            : [];
    return doesEmailExist(sourceUsers, mailToCheck);
}

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

function isLegacyPlaintextPasswordUser(user) {
    return (
        user &&
        typeof user === "object" &&
        typeof user.password === "string" &&
        user.password.length > 0 &&
        (!user.passwordHash || typeof user.passwordHash !== "string")
    );
}

function hasSecurePasswordCredentials(user) {
    return (
        user &&
        typeof user.passwordHash === "string" &&
        user.passwordHash.length > 0 &&
        typeof user.passwordSalt === "string" &&
        user.passwordSalt.length > 0
    );
}

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
