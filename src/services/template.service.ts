import Mustache from "mustache";

import { Course } from "../entities/course";

import courseDetails from "../templates/course-details.mustache";
import tocRow from "../templates/toc-row.mustache";
import toc from "../templates/toc.mustache";

export class TemplateService {
  constructor(
    private tocTemplate = toc,
    private tocRowTemplate = tocRow,
    private courseDetailsTemplate = courseDetails
  ) {
    this.extendStringPrototype();
  }

  private extendStringPrototype(): void {
    String.prototype.base64 = function (this: string) {
      return Buffer.from(this).toString("base64");
    };
    String.prototype.base64d = function (this: string) {
      return Buffer.from(this, "base64").toString();
    };
  }

  public renderToC(data: Course[]) {
    const finished = data.filter((c) => c.firstCompletionTime);
    const pending = data.filter((c) => c.completedIds.length > 0 && !c.firstCompletionTime);
    const notStarted = data.filter((c) => c.completedIds.length === 0);

    const mappedData = {
      coursesCount: {
        finished: finished.length,
        pending: pending.length,
        notStarted: notStarted.length,
      },
      details: {
        finished,
        pending,
        notStarted,
      },
    };

    return Mustache.render(this.tocTemplate, mappedData, { row: this.tocRowTemplate });
  }

  public renderCoursePage(data: Course) {
    return Mustache.render(this.courseDetailsTemplate, data);
  }
}

export default new TemplateService();
