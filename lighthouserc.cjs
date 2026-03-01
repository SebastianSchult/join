const DEFAULT_A11Y_MIN_SCORE = 0.7;
const rawA11yMinScore = Number(process.env.A11Y_MIN_SCORE);
const a11yMinScore =
  Number.isFinite(rawA11yMinScore)
    ? Math.min(Math.max(rawA11yMinScore, 0), 1)
    : DEFAULT_A11Y_MIN_SCORE;
const A11Y_PAGE_EXCEPTIONS = [
  // Add temporary page-level exceptions only with:
  // - linked issue number
  // - owner
  // - expiry date
  // Example:
  // {
  //   matchingUrlPattern: ".*\\/contacts\\.html$",
  //   minScore: 0.65,
  //   issue: "#123",
  //   owner: "@team",
  //   expiresOn: "2026-06-30",
  // },
];
const a11yAssertionMatrix = A11Y_PAGE_EXCEPTIONS.map((exception) => ({
  matchingUrlPattern: exception.matchingUrlPattern,
  assertions: {
    "categories:accessibility": [
      "error",
      {
        minScore: Number.isFinite(Number(exception.minScore))
          ? Math.min(Math.max(Number(exception.minScore), 0), 1)
          : a11yMinScore,
      },
    ],
  },
}));

module.exports = {
  ci: {
    collect: {
      startServerCommand: "python3 -m http.server 4173",
      startServerReadyPattern: "Serving HTTP on",
      startServerReadyTimeout: 20000,
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
      },
      url: [
        "http://127.0.0.1:4173/index.html",
        "http://127.0.0.1:4173/summary.html",
        "http://127.0.0.1:4173/board.html",
        "http://127.0.0.1:4173/contacts.html",
        "http://127.0.0.1:4173/addTask.html",
      ],
    },
    assert: {
      assertions: {
        "categories:accessibility": [
          "error",
          {
            minScore: a11yMinScore,
          },
        ],
      },
      ...(a11yAssertionMatrix.length > 0
        ? {
            assertMatrix: a11yAssertionMatrix,
          }
        : {}),
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
