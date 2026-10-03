import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { CATEGORIES } from '../../data/courses';
import { Category, Course } from '../../models/course';
import { CourseService } from '../../services/course.service';
import { CartService, MAX_QUANTITY } from '../../services/cart.service';
import { PreferencesService } from '../../services/preferences.service';

interface CatalogState { courses: readonly Course[]; loading: boolean; error: string; }

@Component({
  selector: 'app-catalog', standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './catalog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  readonly i18n = inject(PreferencesService);
  private readonly courseService = inject(CourseService);
  readonly cart = inject(CartService);
  readonly categories = CATEGORIES;
  readonly maxQuantity = MAX_QUANTITY;
  readonly search = new FormControl('', { nonNullable: true });
  readonly category = new FormControl<Category | ''>('', { nonNullable: true });

  readonly state$ = combineLatest([
    this.search.valueChanges.pipe(
      map(value => value.trim().toLocaleLowerCase('ru')),
      debounceTime(300),
      distinctUntilChanged(),
      startWith(''),
    ),
    this.category.valueChanges.pipe(startWith(this.category.value), distinctUntilChanged()),
  ]).pipe(
    switchMap(([query, category]) => this.courseService.getCourses({ query, category }).pipe(
      map((courses): CatalogState => ({ courses, loading: false, error: '' })),
      startWith<CatalogState>({ courses: [], loading: true, error: '' }),
      catchError(() => of<CatalogState>({ courses: [], loading: false, error: 'Не удалось загрузить курсы. Попробуйте изменить поиск.' })),
    )),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  reset(): void { this.search.setValue(''); this.category.setValue(''); }
}
