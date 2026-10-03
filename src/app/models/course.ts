export type Category = 'Разработка' | 'Дизайн' | 'Аналитика';

export interface Course {
  readonly id: number;
  readonly title: string;
  readonly category: Category;
  /** Базовая цена в целых тенге (KZT). */
  readonly price: number;
  readonly hours: number;
  readonly level: string;
  readonly description: string;
  readonly topics: readonly string[];
  readonly symbol: string;
  readonly color: 'mint' | 'peach' | 'lavender';
}

export interface CartItem {
  readonly course: Course;
  readonly quantity: number;
}
