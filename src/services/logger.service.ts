import * as winston from "winston";

import config from "../configs/app.config";

const { timestamp, colorize, printf } = winston.format;

const customLevelInfo = winston.format((info) => ({ ...info, level: info.level.toUpperCase().padEnd(7) }));
const brightWhite = (text: string) => "\u001b[33m" + text + "\u001b[0m";

const customFormat = printf(({ timestamp, level, message, ...rest }) => {
  return `${timestamp} | ${level} ${brightWhite(message)} ~ ${rest ? JSON.stringify(rest) : ""}`;
});

const logger = winston.createLogger({
  level: "silly",
  format: winston.format.combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customLevelInfo(),
    colorize(),
    customFormat
  ),
  transports: [
    new winston.transports.File({ filename: config.logger.outputFilePath }),
    new winston.transports.Console(),
  ],
});

export default logger;
