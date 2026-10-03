import { Injectable } from '@angular/core';
import { defer, delay, Observable, of } from 'rxjs';
import { COURSES } from '../data/courses';
import { COURSE_TRANSLATIONS } from '../data/translations';
import { Category, Course } from '../models/course';

export interface CourseFilter { query?: string; category?: Category | ''; }

@Injectable({ providedIn: 'root' })
export class CourseService {
  getCourses({ query = '', category = '' }: CourseFilter = {}): Observable<readonly Course[]> {
    return defer(() => {
      const normalized = query.trim().toLocaleLowerCase('ru');
      return of(COURSES.filter(course =>
        [course.title, COURSE_TRANSLATIONS.kk[course.id].title, COURSE_TRANSLATIONS.en[course.id].title]
          .some(title => title.toLocaleLowerCase('ru').includes(normalized)) &&
        (!category || course.category === category),
      ));
    }).pipe(delay(450));
  }

  getCourse(id: number): Observable<Course | undefined> {
    return of(COURSES.find(course => course.id === id)).pipe(delay(350));
  }
}
