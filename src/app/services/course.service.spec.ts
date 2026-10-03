import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CourseService } from './course.service';

describe('CourseService', () => {
  afterEach(() => vi.useRealTimers());

  it('delays results and combines normalized title search with category', async () => {
    vi.useFakeTimers();
    const service = new CourseService();
    const received = vi.fn();
    const subscription = service.getCourses({ query: '  ANGULAR ', category: 'Разработка' }).subscribe(received);
    await vi.advanceTimersByTimeAsync(449);
    expect(received).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(received.mock.calls[0][0].map((course: { id: number }) => course.id)).toEqual([1]);
    subscription.unsubscribe();
    const empty = firstValueFrom(service.getCourses({ query: 'Angular', category: 'Дизайн' }));
    await vi.advanceTimersByTimeAsync(450);
    expect(await empty).toEqual([]);
  });

  it('returns undefined for unknown course IDs', async () => {
    vi.useFakeTimers();
    const result = firstValueFrom(new CourseService().getCourse(999));
    await vi.advanceTimersByTimeAsync(350);
    expect(await result).toBeUndefined();
  });

  it('searches translated titles in Kazakh and English', async () => {
    vi.useFakeTimers();
    for (const query of ['ДЕРЕКТЕРДІ ТАЛДАУҒА', 'data analysis']) {
      const result = firstValueFrom(new CourseService().getCourses({ query }));
      await vi.advanceTimersByTimeAsync(450);
      expect((await result).map(course => course.id)).toEqual([3]);
    }
  });
});
