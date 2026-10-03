import { computed, Injectable, signal } from '@angular/core';
import { COURSES } from '../data/courses';
import { CartItem } from '../models/course';

const STORAGE_KEY = 'course-catalog.cart.v1';
export const MAX_QUANTITY = 99;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly state = signal<readonly CartItem[]>(this.restore());
  readonly items = this.state.asReadonly();
  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.course.price * item.quantity, 0));
  readonly storageWarning = signal('');

  quantity(courseId: number): number {
    return this.items().find(item => item.course.id === courseId)?.quantity ?? 0;
  }

  add(courseId: number): void {
    const course = COURSES.find(item => item.id === courseId);
    if (!course) return;
    const quantity = this.quantity(courseId);
    if (quantity >= MAX_QUANTITY) return;
    this.commit(quantity
      ? this.items().map(item => item.course.id === courseId ? { ...item, quantity: quantity + 1 } : item)
      : [...this.items(), { course, quantity: 1 }]);
  }

  remove(courseId: number): void {
    this.commit(this.items().filter(item => item.course.id !== courseId));
  }

  setQuantity(courseId: number, quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return;
    this.commit(this.items().map(item => item.course.id === courseId ? { ...item, quantity } : item));
  }

  clear(): void { this.commit([]); }

  private commit(items: readonly CartItem[]): void {
    this.state.set(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(item => ({ courseId: item.course.id, quantity: item.quantity }))));
      this.storageWarning.set('');
    } catch {
      this.storageWarning.set('Браузер не разрешил сохранить корзину. После перезагрузки изменения могут пропасть.');
    }
  }

  private restore(): readonly CartItem[] {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(raw)) return [];
      const restored = new Map<number, CartItem>();
      for (const entry of raw) {
        if (!entry || typeof entry !== 'object') continue;
        const course = COURSES.find(item => item.id === entry.courseId);
        if (!course || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > MAX_QUANTITY) continue;
        // Стоимость и описание берём из каталога, а не из localStorage.
        if (!restored.has(course.id)) restored.set(course.id, { course, quantity: entry.quantity });
      }
      return [...restored.values()];
    } catch {
      return [];
    }
  }
}
