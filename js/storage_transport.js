"use strict";

(function registerStorageTransportModule() {
    function stNormalizeFetchOptions(options = {}) {
        const normalizedOptions = { ...options };

        // Defensive normalization in case a caller accidentally uses `header` instead of `headers`.
        if (
            normalizedOptions.header &&
            !normalizedOptions.headers &&
            typeof normalizedOptions.header === "object"
        ) {
            normalizedOptions.headers = normalizedOptions.header;
        }

        delete normalizedOptions.header;
        return normalizedOptions;
    }

    function stParseResponsePayload(responseText) {
        if (typeof responseText !== "string" || responseText.trim() === "") {
            return null;
        }

        try {
            return JSON.parse(responseText);
        } catch (error) {
            return responseText;
        }
    }

    async function stFetchJson(
        url,
        options = {},
        context = "fetchJson",
        errorPolicy = window.StorageErrorPolicy
    ) {
        let response;

        try {
            response = await fetch(url, stNormalizeFetchOptions(options));
        } catch (error) {
            if (
                errorPolicy &&
                typeof errorPolicy.createNetworkError === "function"
            ) {
                throw errorPolicy.createNetworkError(context, error);
            }

            const networkError = new Error(`${context} network error: ${error.message}`);
            networkError.cause = error;
            throw networkError;
        }

        const responseText = await response.text();
        const payload = stParseResponsePayload(responseText);

        if (!response.ok) {
            if (
                errorPolicy &&
                typeof errorPolicy.createFetchHttpError === "function"
            ) {
                throw errorPolicy.createFetchHttpError(response, context, payload);
            }

            const fallbackError = new Error(
                `${context} failed with status ${response.status}`
            );
            fallbackError.status = response.status;
            fallbackError.context = context;
            fallbackError.payload = payload;
            throw fallbackError;
        }

        return payload;
    }

    window.StorageTransport = Object.freeze({
        normalizeFetchOptions: stNormalizeFetchOptions,
        parseResponsePayload: stParseResponsePayload,
        fetchJson: stFetchJson,
    });
})();
