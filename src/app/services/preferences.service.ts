import { computed, Injectable, signal } from '@angular/core';
import { COURSE_TRANSLATIONS, EN, KK, Language, TranslationKey } from '../data/translations';
import { CartItem, Category, Course } from '../models/course';

export type Currency = 'KZT' | 'USD';
export const USD_KZT_RATE = 441.91;
export const RATE_SOURCE = 'https://nationalbank.kz/en/exchangerates/ezhednevnye-oficialnye-rynochnye-kursy-valyut';
const KEY = 'course-catalog.preferences.v1';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly initial = this.restore();
  private readonly languageState = signal<Language>(this.initial.language);
  private readonly currencyState = signal<Currency>(this.initial.currency);
  readonly language = this.languageState.asReadonly();
  readonly currency = this.currencyState.asReadonly();
  readonly storageFailed = signal(false);
  readonly text = computed(() => this.language() === 'kk' ? KK : EN);
  readonly rateSource = RATE_SOURCE;
  private readonly formatter = computed(() => new Intl.NumberFormat(this.language() === 'kk' ? 'kk-KZ' : 'en-US', {
    style: 'currency', currency: this.currency(), currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: this.currency() === 'KZT' ? 0 : 2,
    maximumFractionDigits: this.currency() === 'KZT' ? 0 : 2,
  }));

  setLanguage(value: string): void {
    if (value !== 'kk' && value !== 'en') return;
    this.languageState.set(value);
    this.save();
  }
  setCurrency(value: string): void {
    if (value !== 'KZT' && value !== 'USD') return;
    this.currencyState.set(value);
    this.save();
  }
  course(course: Course) { return COURSE_TRANSLATIONS[this.language()][course.id]; }
  category(category: Category): string {
    const keys: Record<Category, TranslationKey> = { 'Разработка': 'development', 'Дизайн': 'design', 'Аналитика': 'analytics' };
    return this.text()[keys[category]];
  }
  level(course: Course): string { return course.level === 'С нуля' ? this.text().beginner : this.text().intermediate; }

  /** Base prices are whole KZT. Round each USD unit price to cents before multiplying. */
  unitMinor(kzt: number, currency: Currency = this.currency()): number {
    return currency === 'USD' ? Math.round(kzt * 100 / USD_KZT_RATE) : kzt * 100;
  }
  totalMinor(items: readonly CartItem[], currency: Currency = this.currency()): number {
    return items.reduce((sum, item) => sum + this.unitMinor(item.course.price, currency) * item.quantity, 0);
  }
  moneyMinor(minor: number): string { return this.formatter().format(minor / 100); }
  price(kzt: number, quantity = 1): string { return this.moneyMinor(this.unitMinor(kzt) * quantity); }

  private restore(): { language: Language; currency: Currency } {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      return { language: value?.language === 'en' ? 'en' : 'kk', currency: value?.currency === 'USD' ? 'USD' : 'KZT' };
    } catch { return { language: 'kk', currency: 'KZT' }; }
  }
  private save(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify({ language: this.language(), currency: this.currency() }));
      this.storageFailed.set(false);
    } catch { this.storageFailed.set(true); }
  }
}
