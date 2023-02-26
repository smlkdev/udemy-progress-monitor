const config = {
  github: {
    workBranch: "heads/master",
    announcementRule: "*/1 * * * *",
    pushDelay: 1800,
  },
  logger: {
    outputFilePath: "/tmp/log/combined.log",
  },
  app: {
    ignoredKeys: ["image"],
    tocPath: "README.md",
    syncRule: "*/5 * * * *",
  },
};

export default config;
