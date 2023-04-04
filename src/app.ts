import _ from "lodash";
import * as scheduler from "node-schedule";

import config from "./configs/app.config";

import { Course } from "./entities/course";

import ignoreKeyCustomizer from "./utils/ignore-key.customizer";

import githubService from "./services/github.service";
import logger from "./services/logger.service";
import templateService from "./services/template.service";
import udemyService from "./services/udemy.service";

class App {
  private courses: Course[] = [];

  public constructor() {
    this.init();
  }

  private init() {
    udemyService
      .fetchSubscribedCoursesIds()
      .then((ids) => Promise.all(ids.map((id) => this.summonCourse(id))))
      .then((courses) => {
        this.courses.push(...courses);
        this.createSyncSchedule();
      })
      .catch((e) => udemyService.handleError(e));
  }

  private async summonCourse(id: number): Promise<Course> {
    try {
      const [info, progress, curriculum] = await Promise.all([
        udemyService.fetchInfo(id),
        udemyService.fetchProgress(id),
        udemyService.fetchCurriculum(id),
      ]);

      return new Course(id, info, progress, curriculum);
    } catch (e) {
      udemyService.handleError(e);
    }
  }

  private getCourse(courseId: number) {
    return this.courses.find((c) => c.id === courseId);
  }

  private createSyncSchedule() {
    for (const { id, firstCompletionTime } of this.courses) {
      const syncRule = firstCompletionTime ? config.app.syncRuleCompletedCourse : config.app.syncRule;
      const job = scheduler.scheduleJob(id.toString(), syncRule, () => this.sync(id));
      job.invoke();
    }
  }

  private async sync(id: number) {
    logger.info("Syncing", { id });
    const current = this.getCourse(id);
    const next = await this.summonCourse(id);
    const remotePage = await githubService.getContent(current.repoPagePath);

    if (!next) {
      logger.error("Fetching latest course data failed", { id });
      return;
    }

    if (
      remotePage === undefined ||
      (remotePage && remotePage.base64d() !== next.repoPageContent) ||
      !this.isSynced(current, next)
    ) {
      const result = githubService.enqueue(next.repoPagePath, next.repoPageContent);
      this.courses[this.courses.findIndex((c) => current.id === c.id)] = next;

      if (result) {
        const remoteToC = await githubService.getContent(config.app.tocPath);

        if (remoteToC === undefined || (remoteToC && remoteToC.base64d() !== templateService.renderToC(this.courses))) {
          githubService.enqueue(config.app.tocPath, templateService.renderToC(this.courses));
        }
      }
    }
  }

  private isSynced(c1: Course, c2: Course): boolean {
    return _.isEqualWith(c1, c2, ignoreKeyCustomizer(config.app.ignoredKeys));
  }
}

export default App;
