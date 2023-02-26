import { RequestError } from "@octokit/request-error";
import { Octokit } from "@octokit/rest";
import * as scheduler from "node-schedule";

import config from "../configs/app.config";

import { GitHubCredentials, TreeObject } from "../entities/github";

import logger from "./logger.service";

class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  private queue = new Map<string, TreeObject>();

  private pushJob: scheduler.Job;

  public async init({ token, owner, repo }: GitHubCredentials) {
    this.octokit = new Octokit({
      auth: token,
    });
    this.owner = owner;
    this.repo = repo;

    scheduler.scheduleJob("announcement", config.github.announcementRule, () => this.showInfo());
  }

  public async getContent(filePath: string) {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
      });
      if (!Array.isArray(response.data)) {
        if (response.data.type === "file") {
          return response.data.content;
        }
      }
    } catch (e) {
      this.handleError(e, this.getContent.name);
      if (e instanceof RequestError) {
        if (e.status === 404) {
          return undefined;
        }
      }
    }
    return null;
  }

  public handleError(e: Error, srcFn: string) {
    type errorProperty = "message" | "name" | "requestUrl" | "status" | "srcFn";
    const details: Partial<Record<errorProperty, unknown>> = {
      message: e.message,
      name: e.name,
      srcFn,
    };

    if (e instanceof RequestError) {
      details.requestUrl = e.request.url;
      details.status = e.status;
    }
    logger.error(details);
  }

  public enqueue(filePath: string, content: string): boolean {
    const tree: TreeObject = {
      path: filePath,
      mode: "100644",
      type: "blob",
      content: content,
    };

    // accept new file
    if (!this.queue.has(filePath)) {
      this.queue.set(filePath, tree);
      logger.info(`Queued new file`, { filePath });
      this.updateJob();
      return true;
    }

    // replace existing file because of different content
    if (this.queue.get(filePath).content !== content) {
      this.queue.set(filePath, tree);
      logger.info(`Replaced existing file in the queue`, { filePath });
      this.updateJob();
      return true;
    }

    // otherwise
    return false;
  }

  private showInfo() {
    if (this.pushJob && this.pushJob.nextInvocation()) {
      const secondsLeft = Math.round((this.pushJob.nextInvocation().getTime() - new Date().getTime()) / 1000);
      logger.info("Next push", { secondsLeft });
    }
  }

  private updateJob() {
    const startTime = new Date(Date.now() + config.github.pushDelay * 1000);

    if (!this.pushJob) {
      this.pushJob = scheduler.scheduleJob("pushJob", startTime, () => this.push());
      return;
    }
    this.pushJob.cancel();
    this.pushJob.schedule(startTime);
    logger.info("Rescheduled push job", { changedFiles: [...this.queue.keys()] });
  }

  private async push() {
    if (!this.queue.size) {
      logger.warn(`No data in the queue, ignoring`);
      return;
    }

    try {
      const branchSHA = await this.ghGetSHARef();
      const treeSHA = await this.ghCreateTree(branchSHA);
      const commitSHA = await this.ghCreateCommit(`update ${this.queue.size} file(s)`, treeSHA, branchSHA);
      const data = await this.ghUpdateRef(commitSHA);

      if (data.status === 200) {
        logger.info("Push success", { latestCommitSha: data.data.object.sha, url: data.data.object.url });
        this.queue.clear();
      }
    } catch (e) {
      this.handleError(e, this.push.name);
    }
  }

  private ghGetSHARef() {
    return this.octokit.rest.git
      .getRef({
        owner: this.owner,
        repo: this.repo,
        ref: config.github.workBranch,
      })
      .then((r) => r.data.object.sha);
  }

  private ghCreateTree(baseTree: string) {
    return this.octokit.rest.git
      .createTree({
        owner: this.owner,
        repo: this.repo,
        tree: [...this.queue.values()],
        base_tree: baseTree,
      })
      .then((r) => r.data.sha);
  }

  private ghCreateCommit(commitMsg: string, treeSHA: string, parentSHA: string) {
    return this.octokit.rest.git
      .createCommit({
        owner: this.owner,
        repo: this.repo,
        message: commitMsg,
        tree: treeSHA,
        parents: [parentSHA],
      })
      .then((r) => r.data.sha);
  }

  private ghUpdateRef(commitSHA: string) {
    return this.octokit.rest.git.updateRef({
      owner: this.owner,
      repo: this.repo,
      ref: config.github.workBranch,
      sha: commitSHA,
    });
  }
}

export default new GitHubService();
