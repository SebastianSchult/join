"use strict";

(function registerStorageErrorPolicyModule() {
    function sepGetResponseErrorDetail(payload) {
        if (!payload) {
            return "";
        }

        if (typeof payload === "string") {
            return payload;
        }

        if (typeof payload === "object") {
            if (typeof payload.message === "string") {
                return payload.message;
            }
            if (typeof payload.error === "string") {
                return payload.error;
            }
        }

        return "";
    }

    function sepCreateFetchHttpError(response, context, payload) {
        const statusText = response.statusText ? ` ${response.statusText}` : "";
        const detail = sepGetResponseErrorDetail(payload);
        const detailSuffix = detail ? `: ${detail}` : "";
        const error = new Error(
            `${context} failed with status ${response.status}${statusText}${detailSuffix}`
        );

        error.status = response.status;
        error.context = context;
        error.payload = payload;
        return error;
    }

    function sepCreateNetworkError(context, cause) {
        const networkError = new Error(`${context} network error: ${cause.message}`);
        networkError.cause = cause;
        return networkError;
    }

    function sepShowGlobalUserMessage(message) {
        if (!message) {
            return;
        }

        if (typeof window.showUserMessage === "function") {
            try {
                window.showUserMessage(message);
                return;
            } catch (error) {
                console.error("showUserMessage failed:", error);
            }
        }

        const toastId = "joinGlobalMessageToast";
        const existingToast = document.getElementById(toastId);
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement("div");
        toast.id = toastId;
        toast.setAttribute("role", "alert");
        toast.textContent = message;
        toast.style.position = "fixed";
        toast.style.bottom = "24px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.backgroundColor = "#2a3647";
        toast.style.color = "#fff";
        toast.style.padding = "12px 18px";
        toast.style.borderRadius = "10px";
        toast.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.25)";
        toast.style.zIndex = "9999";
        toast.style.fontSize = "14px";
        document.body.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, 3200);
    }

    function sepHandleSafeArrayReadError(error, options = {}) {
        const {
            context = "data",
            errorMessage = `Could not load ${context}. Please try again.`,
            showErrorMessage = true,
        } = options;

        console.error(`Failed to load ${context}:`, error);
        if (showErrorMessage) {
            sepShowGlobalUserMessage(errorMessage);
        }
        return {
            data: [],
            error,
        };
    }

    window.StorageErrorPolicy = Object.freeze({
        getResponseErrorDetail: sepGetResponseErrorDetail,
        createFetchHttpError: sepCreateFetchHttpError,
        createNetworkError: sepCreateNetworkError,
        showGlobalUserMessage: sepShowGlobalUserMessage,
        handleSafeArrayReadError: sepHandleSafeArrayReadError,
    });
})();
