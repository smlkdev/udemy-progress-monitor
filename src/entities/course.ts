import templateService from "../services/template.service";

import {
  CourseInfoResponse,
  CourseProgressResponse,
  CurriculumEntry,
  CurriculumTemplateExtension,
  CurriculumType,
} from "./udemy";

export class Course {
  public id: number;

  // info
  public image: string;
  public instructor: string;
  public publishedTitle: string;
  public title: string;

  // progress
  public completedIds: number[];
  public firstCompletionTime: Date;

  // curriculum
  public curriculum: (CurriculumEntry & CurriculumTemplateExtension)[];
  public curriculumProgressIds: number[];

  public constructor(
    id: number,
    info: CourseInfoResponse,
    progress: CourseProgressResponse,
    curriculum: CurriculumEntry[]
  ) {
    this.id = id;
    this.convertInfo(info);
    this.convertProgress(progress);
    this.convertCurriculum(curriculum);
  }

  public get repoPageContent() {
    return templateService.renderCoursePage(this);
  }

  public get repoPagePath() {
    return `${this.publishedTitle}__${this.id}/README.md`;
  }

  public get progressBarValue() {
    return Math.round((this.completedIds.length / this.curriculumProgressIds.length) * 100);
  }

  private convertInfo(data: CourseInfoResponse) {
    this.title = data.title;
    this.image = data.image_125_H;
    this.publishedTitle = data.published_title;
    // take the shortest name for the instructor
    this.instructor = data.visible_instructors.sort(
      (a, b) => a.display_name.length - b.display_name.length
    )[0].display_name;
  }

  private convertProgress(data: CourseProgressResponse) {
    // do not take assignments ids into account just like on udemy
    this.completedIds = [...data.completed_lecture_ids, ...data.completed_quiz_ids];
    this.firstCompletionTime = data.first_completion_time;
  }

  private convertCurriculum(data: CurriculumEntry[]) {
    // add additional data for latertemplate
    this.curriculum = data.map((e) => ({
      ...e,
      ...{
        finished: this.completedIds.includes(e.id),
        isChapter: e._class === CurriculumType.Chapter,
      },
    }));
    // take all ids with proper _class
    this.curriculumProgressIds = data
      .filter((entry) => [CurriculumType.Lecture, CurriculumType.Quiz].includes(entry._class))
      .map((entry) => entry.id);
  }
}
