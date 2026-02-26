"use strict";

(function registerStorageCompatFallbacksModule() {
    function resolveStorageModule(moduleName, createFallback) {
        const moduleRef = window[moduleName];
        if (moduleRef) {
            return moduleRef;
        }

        console.warn(
            `${moduleName} missing. Falling back to compatibility implementation.`
        );
        if (typeof createFallback === "function") {
            return createFallback();
        }

        throw new Error(
            `Missing ${moduleName}. Ensure storage module scripts are loaded before js/storage.js.`
        );
    }

    function createStorageErrorPolicyFallback() {
        const fallbackGetResponseErrorDetail = (payload) => {
            if (!payload) return "";
            if (typeof payload === "string") return payload;
            if (typeof payload === "object") {
                if (typeof payload.message === "string") return payload.message;
                if (typeof payload.error === "string") return payload.error;
            }
            return "";
        };

        const fallbackCreateFetchHttpError = (response, context, payload) => {
            const statusText = response.statusText ? ` ${response.statusText}` : "";
            const detail = fallbackGetResponseErrorDetail(payload);
            const detailSuffix = detail ? `: ${detail}` : "";
            const error = new Error(
                `${context} failed with status ${response.status}${statusText}${detailSuffix}`
            );
            error.status = response.status;
            error.context = context;
            error.payload = payload;
            return error;
        };

        const fallbackCreateNetworkError = (context, cause) => {
            const networkError = new Error(`${context} network error: ${cause.message}`);
            networkError.cause = cause;
            return networkError;
        };

        const fallbackShowGlobalUserMessage = (message) => {
            if (!message) return;
            if (typeof window.showUserMessage === "function") {
                try {
                    window.showUserMessage(message);
                    return;
                } catch (error) {
                    console.error("showUserMessage failed:", error);
                }
            }
            alert(message);
        };

        const fallbackHandleSafeArrayReadError = (error, options = {}) => {
            const {
                context = "data",
                errorMessage = `Could not load ${context}. Please try again.`,
                showErrorMessage = true,
            } = options;

            console.error(`Failed to load ${context}:`, error);
            if (showErrorMessage) {
                fallbackShowGlobalUserMessage(errorMessage);
            }
            return { data: [], error };
        };

        return Object.freeze({
            getResponseErrorDetail: fallbackGetResponseErrorDetail,
            createFetchHttpError: fallbackCreateFetchHttpError,
            createNetworkError: fallbackCreateNetworkError,
            showGlobalUserMessage: fallbackShowGlobalUserMessage,
            handleSafeArrayReadError: fallbackHandleSafeArrayReadError,
        });
    }

    function createStorageTransportFallback() {
        const fallbackNormalizeFetchOptions = (options = {}) => {
            const normalizedOptions = { ...options };
            if (
                normalizedOptions.header &&
                !normalizedOptions.headers &&
                typeof normalizedOptions.header === "object"
            ) {
                normalizedOptions.headers = normalizedOptions.header;
            }
            delete normalizedOptions.header;
            return normalizedOptions;
        };

        const fallbackParseResponsePayload = (responseText) => {
            if (typeof responseText !== "string" || responseText.trim() === "") {
                return null;
            }
            try {
                return JSON.parse(responseText);
            } catch (error) {
                return responseText;
            }
        };

        const fallbackFetchJson = async (
            url,
            options = {},
            context = "fetchJson",
            errorPolicy
        ) => {
            const policy = errorPolicy || createStorageErrorPolicyFallback();
            let response;

            try {
                response = await fetch(url, fallbackNormalizeFetchOptions(options));
            } catch (error) {
                throw policy.createNetworkError(context, error);
            }

            const responseText = await response.text();
            const payload = fallbackParseResponsePayload(responseText);

            if (!response.ok) {
                throw policy.createFetchHttpError(response, context, payload);
            }

            return payload;
        };

        return Object.freeze({
            normalizeFetchOptions: fallbackNormalizeFetchOptions,
            parseResponsePayload: fallbackParseResponsePayload,
            fetchJson: fallbackFetchJson,
        });
    }

    function createStorageFirebaseAdapterFallback() {
        const fallbackBuildFirebaseUrl = (baseUrl, path = "_") => {
            return `${baseUrl}${path}.json`;
        };

        const fallbackGetFirebaseEntityPath = (path = "_", entityId = "") => {
            const normalizedPath = String(path || "_").replace(/\/+$/, "");
            const normalizedId = encodeURIComponent(String(entityId));
            return `${normalizedPath}/${normalizedId}`;
        };

        const fallbackNormalizeFirebaseArrayPayload = (payload) => {
            if (Array.isArray(payload)) {
                return payload.filter((item) => item !== null && item !== undefined);
            }
            if (payload && typeof payload === "object") {
                return Object.values(payload).filter(
                    (item) => item !== null && item !== undefined
                );
            }
            return [];
        };

        const fallbackGetRandomInt = (min, max) => {
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
        };

        const fallbackGenerateCollisionSafeId = (existingItems = []) => {
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
                const candidateId = Date.now() * 1000000 + fallbackGetRandomInt(0, 999999);
                if (Number.isSafeInteger(candidateId) && !knownIds.has(candidateId)) {
                    return candidateId;
                }
            }
            return Date.now() * 1000 + fallbackGetRandomInt(0, 999);
        };

        const fallbackFirebaseGetArraySafe = async (
            path = "_",
            options = {},
            dependencies = {}
        ) => {
            const {
                context = "data",
                errorMessage = `Could not load ${context}. Please try again.`,
                showErrorMessage = true,
            } = options;

            const {
                firebaseGetItem,
                normalizeFirebaseArrayPayload:
                    normalizePayload = fallbackNormalizeFirebaseArrayPayload,
                errorPolicy = window.StorageErrorPolicy || createStorageErrorPolicyFallback(),
            } = dependencies;

            if (typeof firebaseGetItem !== "function") {
                throw new Error(
                    "firebaseGetArraySafe requires a firebaseGetItem dependency."
                );
            }

            try {
                const payload = await firebaseGetItem(path);
                return { data: normalizePayload(payload), error: null };
            } catch (error) {
                return errorPolicy.handleSafeArrayReadError(error, {
                    context,
                    errorMessage,
                    showErrorMessage,
                });
            }
        };

        return Object.freeze({
            buildFirebaseUrl: fallbackBuildFirebaseUrl,
            getFirebaseEntityPath: fallbackGetFirebaseEntityPath,
            normalizeFirebaseArrayPayload: fallbackNormalizeFirebaseArrayPayload,
            getRandomInt: fallbackGetRandomInt,
            generateCollisionSafeId: fallbackGenerateCollisionSafeId,
            firebaseGetArraySafe: fallbackFirebaseGetArraySafe,
        });
    }

    window.StorageCompatFallbacks = Object.freeze({
        resolveModule: resolveStorageModule,
        createStorageErrorPolicyFallback,
        createStorageTransportFallback,
        createStorageFirebaseAdapterFallback,
    });
})();
