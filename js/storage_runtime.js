"use strict";

window.StorageRuntime = window.StorageRuntime || (function createStorageRuntime() {
  const joinAppConfig = window.JOIN_APP_CONFIG || {};
  const storageCompatFallbacks = window.StorageCompatFallbacks || null;

  function getCompatFallbackFactory(factoryName) {
    if (!storageCompatFallbacks || typeof factoryName !== "string") {
      return undefined;
    }

    const fallbackFactory = storageCompatFallbacks[factoryName];
    if (typeof fallbackFactory === "function") {
      return fallbackFactory;
    }

    return undefined;
  }

  function resolveStorageFacadeModule(moduleName, fallbackFactoryName) {
    const moduleRef = window[moduleName];
    if (moduleRef) {
      return moduleRef;
    }

    const fallbackFactory = getCompatFallbackFactory(fallbackFactoryName);
    if (
      storageCompatFallbacks &&
      typeof storageCompatFallbacks.resolveModule === "function"
    ) {
      return storageCompatFallbacks.resolveModule(moduleName, fallbackFactory);
    }

    if (typeof fallbackFactory === "function") {
      console.warn(
        `${moduleName} missing. Falling back to compatibility implementation.`
      );
      return fallbackFactory();
    }

    throw new Error(
      `Missing ${moduleName}. Ensure storage module scripts are loaded before js/storage.js.`
    );
  }

  function getConfigValue(key, fallback = "") {
    const value = joinAppConfig[key];
    if (typeof value === "string") {
      return value.trim();
    }
    return fallback;
  }

  function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) {
      return "";
    }
    return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  }

  function assertConfig(requiredKeys) {
    const missing = requiredKeys.filter((key) => {
      const value = joinAppConfig[key];
      return typeof value !== "string" || value.trim() === "";
    });

    if (missing.length > 0) {
      throw new Error(
        `Missing JOIN_APP_CONFIG values: ${missing.join(", ")}. Create js/config.js from js/config.example.js.`
      );
    }
  }

  return {
    config: joinAppConfig,
    StorageErrorPolicy: resolveStorageFacadeModule(
      "StorageErrorPolicy",
      "createStorageErrorPolicyFallback"
    ),
    StorageTransport: resolveStorageFacadeModule(
      "StorageTransport",
      "createStorageTransportFallback"
    ),
    StorageFirebaseAdapter: resolveStorageFacadeModule(
      "StorageFirebaseAdapter",
      "createStorageFirebaseAdapterFallback"
    ),
    STORAGE_TOKEN: getConfigValue("STORAGE_TOKEN"),
    STORAGE_URL: getConfigValue(
      "STORAGE_URL",
      "https://remote-storage.developerakademie.org/item"
    ),
    BASE_URL: normalizeBaseUrl(getConfigValue("BASE_URL")),
    FIREBASE_TASKS_ID: getConfigValue("FIREBASE_TASKS_ID"),
    FIREBASE_USERS_ID: getConfigValue("FIREBASE_USERS_ID"),
    assertConfig,
  };
})();
