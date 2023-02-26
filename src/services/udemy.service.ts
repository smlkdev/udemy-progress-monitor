import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

import { CourseInfoResponse, CourseProgressResponse, CurriculumEntry, UdemyResponse } from "../entities/udemy";

import logger from "./logger.service";

class ApiService {
  private axiosUdemyAPI: AxiosInstance;
  private axiosUdemyUSER: AxiosInstance;

  public init(apiToken: string, userToken: string) {
    this.axiosUdemyAPI = axios.create({
      baseURL: "https://www.udemy.com/api-2.0/",
      withCredentials: true,
      headers: {
        Authorization: `Basic ${apiToken}`,
      },
    });

    this.axiosUdemyUSER = axios.create({
      baseURL: "https://www.udemy.com/api-2.0/users/me/",
      withCredentials: true,
      headers: {
        cookie: `access_token=${userToken}`,
      },
    });
  }

  public fetchProgress(courseId: number) {
    const url = `subscribed-courses/${courseId}/progress/`;
    const config: AxiosRequestConfig = {
      params: {
        "fields[course]":
          "completed_lecture_ids,completed_quiz_ids,last_seen_page,completed_assignment_ids,first_completion_time",
        page: 1,
        page_size: 10,
        is_archived: false,
      },
    };

    return this.f<CourseProgressResponse>(this.axiosUdemyUSER, url, config);
  }

  public fetchSubscribedCoursesIds() {
    const url = `subscribed-courses/`;
    const config: AxiosRequestConfig = {
      params: {
        "fields[course]": "id",
        page: 1,
        page_size: 10,
        is_archived: false,
      },
    };

    return this.f<UdemyResponse>(this.axiosUdemyUSER, url, config).then((response) =>
      response.results.map((course) => course.id)
    );
  }

  public fetchInfo(courseId: number) {
    const url = `courses/${courseId}/`;
    const config: AxiosRequestConfig = {
      params: {
        "fields[course]": "title,image_125_H,published_title,visible_instructors",
        page: 1,
        page_size: 100,
        is_archived: false,
      },
    };
    return this.f<CourseInfoResponse>(this.axiosUdemyAPI, url, config);
  }

  public fetchCurriculum(courseId: number) {
    const url = `courses/${courseId}/public-curriculum-items/`;
    const config: AxiosRequestConfig = {
      params: {
        "fields[lecture]": "id,title",
        "fields[quiz]": "id,title",
        "fields[chapter]": "id,title",
        page: 1,
        page_size: 1000,
        is_archived: false,
      },
    };

    return this.f<UdemyResponse<CurriculumEntry>>(this.axiosUdemyAPI, url, config).then((response) => response.results);
  }

  private f<T>(i: AxiosInstance, url: string, config: AxiosRequestConfig): Promise<T> {
    return i.get<T>(url, config).then((r) => r.data);
  }

  public handleError(e: AxiosError | Error) {
    if (axios.isAxiosError(e)) {
      logger.error(e.message);
    } else {
      logger.error(e.message);
    }
  }
}

export default new ApiService();
