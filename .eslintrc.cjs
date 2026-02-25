module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "script",
  },
  globals: {
    Viewer: "readonly",
    Cookiebot: "readonly",
  },
  rules: {
    // Single-file linting in this multi-script project triggers many false
    // positives for cross-file globals; bundle lint keeps no-undef enforced.
    "no-undef": "off",
    "no-redeclare": "error",
  },
};
