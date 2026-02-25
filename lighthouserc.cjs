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
            minScore: 0.5,
          },
        ],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
