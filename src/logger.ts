import * as winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "/tmp/log/combined.log" }), new winston.transports.Console()],
});

export default logger;
