module.exports = {
  ignoreFiles: ["node_modules/**", ".lighthouseci/**"],
  overrides: [
    {
      files: [
        "assets/css/addTask.base.css",
        "assets/css/animation.css",
        "assets/css/board.base.css",
        "assets/css/board.components.css",
        "assets/css/contacts.base.css",
        "assets/css/summary.base.css",
        "assets/css/summary.components.css",
      ],
      rules: {
        "declaration-block-no-duplicate-properties": null,
      },
    },
    {
      files: [
        "assets/css/navigation.css",
        "assets/css/summary.responsive.css",
      ],
      rules: {
        "declaration-block-no-shorthand-property-overrides": null,
      },
    },
  ],
  rules: {
    "at-rule-no-unknown": true,
    "block-no-empty": true,
    "color-no-invalid-hex": true,
    "declaration-block-no-duplicate-properties": [
      true,
      {
        ignore: [
          "consecutive-duplicates",
          "consecutive-duplicates-with-different-values",
        ],
      },
    ],
    "declaration-block-no-shorthand-property-overrides": true,
    "font-family-no-duplicate-names": true,
    "function-calc-no-unspaced-operator": true,
    "property-no-unknown": [
      true,
      {
        ignoreProperties: ["text-wrap"],
      },
    ],
    "selector-anb-no-unmatchable": true,
    "string-no-newline": true,
    "unit-no-unknown": true,
  },
};
