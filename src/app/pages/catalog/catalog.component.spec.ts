import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogComponent } from './catalog.component';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course';

describe('Live search', () => {
  afterEach(() => { TestBed.resetTestingModule(); vi.useRealTimers(); });

  it('debounces input, suppresses equivalent queries and cancels stale requests', async () => {
    vi.useFakeTimers();
    const cancelled = vi.fn();
    const getCourses = vi.fn(() => new Observable<readonly Course[]>(() => cancelled));
    TestBed.configureTestingModule({ providers: [{ provide: CourseService, useValue: { getCourses } }] });
    const page = TestBed.runInInjectionContext(() => new CatalogComponent());
    const subscription = page.state$.subscribe();
    expect(getCourses).toHaveBeenCalledTimes(1);
    page.search.setValue('Ang');
    await vi.advanceTimersByTimeAsync(100);
    page.search.setValue('Angular');
    await vi.advanceTimersByTimeAsync(299);
    expect(getCourses).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(getCourses).toHaveBeenLastCalledWith({ query: 'angular', category: '' });
    expect(cancelled).toHaveBeenCalledTimes(1);
    page.search.setValue(' ANGULAR ');
    await vi.advanceTimersByTimeAsync(300);
    expect(getCourses).toHaveBeenCalledTimes(2);
    page.category.setValue('Разработка');
    expect(getCourses).toHaveBeenLastCalledWith({ query: 'angular', category: 'Разработка' });
    expect(cancelled).toHaveBeenCalledTimes(2);
    subscription.unsubscribe();
    expect(cancelled).toHaveBeenCalledTimes(3);
  });
});
