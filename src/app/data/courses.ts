import { Category, Course } from '../models/course';

export const CATEGORIES: readonly Category[] = ['Разработка', 'Дизайн', 'Аналитика'];

export const COURSES: readonly Course[] = [
  { id: 1, title: 'Angular: от основ до приложения', category: 'Разработка', price: 68370, hours: 32, level: 'Средний', symbol: 'ng', color: 'mint', description: 'Соберите полноценное приложение: от первого компонента до маршрутизации, реактивных форм и работы с API.', topics: ['Standalone-компоненты и DI', 'Angular Router', 'RxJS и HTTP', 'Reactive Forms', 'Тестирование приложения'] },
  { id: 2, title: 'Дизайн интерфейсов в Figma', category: 'Дизайн', price: 47170, hours: 24, level: 'С нуля', symbol: 'Fi', color: 'peach', description: 'Превратите идею в понятный интерфейс. Освойте композицию, типографику и интерактивные прототипы.', topics: ['Композиция и сетки', 'Типографика', 'Компоненты и варианты', 'Прототипирование'] },
  { id: 3, title: 'Python для анализа данных', category: 'Аналитика', price: 57770, hours: 28, level: 'С нуля', symbol: 'Py', color: 'lavender', description: 'Научитесь очищать данные, находить закономерности и представлять результаты в наглядных графиках.', topics: ['Основы Python', 'NumPy и pandas', 'Очистка данных', 'Визуализация и выводы'] },
  { id: 4, title: 'TypeScript на практике', category: 'Разработка', price: 36570, hours: 18, level: 'Средний', symbol: 'TS', color: 'lavender', description: 'Пишите предсказуемый код и находите ошибки до запуска. Разберите типизацию на реальных задачах.', topics: ['Типы и интерфейсы', 'Generics', 'Сужение типов', 'Типизация API'] },
  { id: 5, title: 'Дизайн-системы: от идеи до библиотеки', category: 'Дизайн', price: 63070, hours: 26, level: 'Средний', symbol: 'Ds', color: 'mint', description: 'Создайте систему визуальных правил и компонентов, которая помогает продукту расти последовательно.', topics: ['Аудит интерфейса', 'Дизайн-токены', 'Библиотека компонентов', 'Документация'] },
  { id: 6, title: 'SQL: язык ваших данных', category: 'Аналитика', price: 41870, hours: 20, level: 'С нуля', symbol: 'SQL', color: 'peach', description: 'От первого SELECT до аналитических запросов: научитесь получать точные ответы из базы данных.', topics: ['SELECT и фильтрация', 'JOIN и связи', 'Агрегации', 'Оконные функции'] },
];
