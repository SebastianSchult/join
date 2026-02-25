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
    "no-undef": "error",
    "no-redeclare": "error",
  },
};
