export interface UdemyItem {
  _class: string;
  id: number;
}

export interface UdemyResponse<T = void> {
  count: number;
  next: string | null;
  previous: string | null;
  results: (T & UdemyItem)[];
}

export interface CourseProgressResponse {
  completed_assignment_ids: number[];
  completed_lecture_ids: number[];
  completed_quiz_ids: number[];
  first_completion_time: Date;
}

export interface CourseInfoResponse {
  image_125_H: string;
  published_title: string;
  title: string;
  visible_instructors: Instructor[];
}

export interface Instructor {
  _class: string;
  display_name: string;
  image_50x50: string;
  initials: string;
  job_title: string;
  name: string;
  title: string;
  url: string;
}

export interface CurriculumEntry extends UdemyItem {
  _class: CurriculumType;
  title: string;
}

export enum CurriculumType {
  Chapter = "chapter",
  Lecture = "lecture",
  Practice = "practice",
  Quiz = "quiz",
}

export interface CurriculumTemplateExtension {
  isChapter: boolean;
  finished: boolean;
}
