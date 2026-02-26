"use strict";

(function registerStorageFirebaseAdapterModule() {
    function sfaBuildFirebaseUrl(baseUrl, path = "_") {
        return `${baseUrl}${path}.json`;
    }

    function sfaGetFirebaseEntityPath(path = "_", entityId = "") {
        const normalizedPath = String(path || "_").replace(/\/+$/, "");
        const normalizedId = encodeURIComponent(String(entityId));
        return `${normalizedPath}/${normalizedId}`;
    }

    function sfaNormalizeFirebaseArrayPayload(payload) {
        if (Array.isArray(payload)) {
            return payload.filter((item) => item !== null && item !== undefined);
        }

        if (payload && typeof payload === "object") {
            return Object.values(payload).filter(
                (item) => item !== null && item !== undefined
            );
        }

        return [];
    }

    function sfaGetRandomInt(min, max) {
        const normalizedMin = Math.ceil(min);
        const normalizedMax = Math.floor(max);
        const range = normalizedMax - normalizedMin + 1;

        if (
            window.crypto &&
            typeof window.crypto.getRandomValues === "function" &&
            range > 0
        ) {
            const values = new Uint32Array(1);
            window.crypto.getRandomValues(values);
            return normalizedMin + (values[0] % range);
        }

        return normalizedMin + Math.floor(Math.random() * range);
    }

    function sfaGenerateCollisionSafeId(existingItems = []) {
        const knownIds = new Set();

        if (Array.isArray(existingItems)) {
            existingItems.forEach((item) => {
                const numericId = Number(item && item.id);
                if (Number.isSafeInteger(numericId)) {
                    knownIds.add(numericId);
                }
            });
        }

        for (let attempt = 0; attempt < 10; attempt++) {
            const timestampPart = Date.now() * 1000000;
            const randomPart = sfaGetRandomInt(0, 999999);
            const candidateId = timestampPart + randomPart;

            if (Number.isSafeInteger(candidateId) && !knownIds.has(candidateId)) {
                return candidateId;
            }
        }

        return Date.now() * 1000 + sfaGetRandomInt(0, 999);
    }

    async function sfaFirebaseGetArraySafe(path = "_", options = {}, dependencies = {}) {
        const {
            context = "data",
            errorMessage = `Could not load ${context}. Please try again.`,
            showErrorMessage = true,
        } = options;

        const {
            firebaseGetItem,
            normalizeFirebaseArrayPayload = sfaNormalizeFirebaseArrayPayload,
            errorPolicy = window.StorageErrorPolicy,
        } = dependencies;

        if (typeof firebaseGetItem !== "function") {
            throw new Error("firebaseGetArraySafe requires a firebaseGetItem dependency.");
        }

        try {
            const payload = await firebaseGetItem(path);
            return {
                data: normalizeFirebaseArrayPayload(payload),
                error: null,
            };
        } catch (error) {
            if (
                errorPolicy &&
                typeof errorPolicy.handleSafeArrayReadError === "function"
            ) {
                return errorPolicy.handleSafeArrayReadError(error, {
                    context,
                    errorMessage,
                    showErrorMessage,
                });
            }

            console.error(`Failed to load ${context}:`, error);
            return {
                data: [],
                error,
            };
        }
    }

    window.StorageFirebaseAdapter = Object.freeze({
        buildFirebaseUrl: sfaBuildFirebaseUrl,
        getFirebaseEntityPath: sfaGetFirebaseEntityPath,
        normalizeFirebaseArrayPayload: sfaNormalizeFirebaseArrayPayload,
        getRandomInt: sfaGetRandomInt,
        generateCollisionSafeId: sfaGenerateCollisionSafeId,
        firebaseGetArraySafe: sfaFirebaseGetArraySafe,
    });
})();
