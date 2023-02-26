import * as dotenv from "dotenv";

import githubService from "./services/github.service";
import logger from "./services/logger.service";
import udemy from "./services/udemy.service";

import App from "./app";

dotenv.config();

const api = process.env.UDEMY_API_TOKEN;
const user = process.env.UDEMY_PRIVATE_TOKEN;
const github = {
  token: process.env.GITHUB_ACCESS_TOKEN,
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO,
};

if (!user || !api || Object.values(github).some((v) => v === undefined)) {
  logger.error("No envs found!");
  process.exit(1);
}

githubService.init(github);
udemy.init(api, user);

new App();
