import logger from "./logger";
import * as schedule from "node-schedule";

logger.info("info test message");

schedule.scheduleJob("*/5 * * * * *", () => {
  logger.info("tick tock final v0");
});
