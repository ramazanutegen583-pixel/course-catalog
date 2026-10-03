import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PreferencesService } from './preferences.service';
import { COURSES } from '../data/courses';
import { COURSE_TRANSLATIONS, EN, KK } from '../data/translations';

describe('Language and currency preferences', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to Kazakh and tenge, saves choices independently', () => {
    const service = new PreferencesService();
    expect(service.language()).toBe('kk');
    expect(service.currency()).toBe('KZT');
    service.setLanguage('en');
    expect(service.currency()).toBe('KZT');
    service.setCurrency('USD');
    const restored = new PreferencesService();
    expect(restored.language()).toBe('en');
    expect(restored.currency()).toBe('USD');
    expect(restored.text().cart).toBe('Cart');
    restored.setLanguage('kk');
    expect(restored.currency()).toBe('USD');
    expect(restored.text().cart).toBe('Себет');
  });

  it('falls back for malformed preferences and rejects unsupported values', () => {
    for (const raw of ['{broken', 'null', '{"language":"xx","currency":"RUB"}']) {
      localStorage.setItem('course-catalog.preferences.v1', raw);
      const service = new PreferencesService();
      service.setLanguage('ru'); service.setCurrency('EUR');
      expect(service.language()).toBe('kk');
      expect(service.currency()).toBe('KZT');
    }
  });

  it('formats prices and rounds USD per unit so visible lines match the total', () => {
    const service = new PreferencesService();
    service.setLanguage('en');
    expect(service.price(68370)).toContain('68,370');
    expect(service.price(68370)).toContain('₸');
    service.setCurrency('USD');
    expect(service.price(68370)).toBe('$154.71');
    expect(service.price(68370, 3)).toBe('$464.13');
    const items = [{ course: COURSES[0], quantity: 3 }, { course: COURSES[1], quantity: 2 }];
    expect(service.totalMinor(items)).toBe(15471 * 3 + 10674 * 2);
    const original = service.totalMinor(items);
    service.setCurrency('KZT'); service.setCurrency('USD');
    expect(service.totalMinor(items)).toBe(original);
  });

  it('has complete interface and course translations', () => {
    expect(Object.keys(KK).sort()).toEqual(Object.keys(EN).sort());
    for (const language of ['kk', 'en'] as const) {
      for (const course of COURSES) {
        const translation = COURSE_TRANSLATIONS[language][course.id];
        expect(translation.title.length).toBeGreaterThan(0);
        expect(translation.description.length).toBeGreaterThan(0);
        expect(translation.topics).toHaveLength(course.topics.length);
      }
    }
  });

  it('keeps preferences usable when storage is blocked', () => {
    const service = new PreferencesService();
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Blocked'); });
    try {
      service.setLanguage('en'); service.setCurrency('USD');
      expect(service.text().catalog).toBe('Course catalog');
      expect(service.price(68370)).toBe('$154.71');
      expect(service.storageFailed()).toBe(true);
    } finally { spy.mockRestore(); }
  });
});
