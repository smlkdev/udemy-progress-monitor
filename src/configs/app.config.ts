const config = {
  github: {
    workBranch: "heads/master",
    announcementRule: "*/5 * * * *",
    pushDelay: 1800,
  },
  logger: {
    outputFilePath: "/tmp/log/combined.log",
  },
  app: {
    ignoredKeys: ["image"],
    tocPath: "README.md",
    syncRule: "*/20 * * * *",
  },
};

export default config;
