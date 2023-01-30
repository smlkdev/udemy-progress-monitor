import logger from "./logger";
import * as schedule from "node-schedule";

logger.info("info test message");

const job = schedule.scheduleJob("*/5 * * * * *", () => {
  logger.info("tick tock");
});
