import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { Course } from '../../models/course';
import { CartService, MAX_QUANTITY } from '../../services/cart.service';
import { CourseService } from '../../services/course.service';
import { PreferencesService } from '../../services/preferences.service';

interface DetailState { course?: Course; loading: boolean; error: string; }

@Component({
  selector: 'app-course-detail', standalone: true,
  imports: [AsyncPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="back-link" routerLink="/catalog">← {{ i18n.text().backCatalog }}</a>
    @if (state$ | async; as state) {
      @if (state.loading) { <p class="empty-state" role="status">{{ i18n.text().loadingCourse }}</p> }
      @else if (state.error) { <p class="notice" role="alert">{{ i18n.text().courseError }}</p> }
      @else if (state.course; as course) {
        <section class="detail-layout">
          <div><p class="eyebrow">{{ i18n.category(course.category) }} / {{ i18n.level(course) }}</p><h1>{{ i18n.course(course).title }}</h1><p class="lead">{{ i18n.course(course).description }}</p><h2>{{ i18n.text().learn }}</h2><ol class="topics">@for (topic of i18n.course(course).topics; track topic) { <li>{{ topic }}</li> }</ol></div>
          <aside class="purchase-panel"><div [class]="'detail-cover ' + course.color" aria-hidden="true">{{ course.symbol }}</div><p class="course-meta">{{ course.hours }} {{ i18n.text().hours }} · {{ i18n.text().pace }}</p><strong class="price">{{ i18n.price(course.price) }}</strong><button class="button full" (click)="cart.add(course.id)" [disabled]="cart.quantity(course.id) >= maxQuantity">{{ cart.quantity(course.id) ? i18n.text().anotherSeat : i18n.text().add }}</button>@if (cart.quantity(course.id)) { <a class="in-cart" routerLink="/cart" aria-live="polite">{{ i18n.text().inCart }} {{ cart.quantity(course.id) }} · {{ i18n.text().goCart }} →</a> }<p class="muted">{{ i18n.text().oneSeat }}</p></aside>
        </section>
      } @else { <div class="empty-state"><h1>{{ i18n.text().courseMissing }}</h1><a routerLink="/catalog">{{ i18n.text().backCatalog }}</a></div> }
    }
  `,
})
export class CourseDetailComponent {
  readonly i18n = inject(PreferencesService);
  readonly cart = inject(CartService);
  readonly maxQuantity = MAX_QUANTITY;
  private readonly courses = inject(CourseService);
  readonly state$ = inject(ActivatedRoute).paramMap.pipe(
    map(params => params.get('id') ?? ''),
    distinctUntilChanged(),
    switchMap(id => (/^[1-9]\d*$/.test(id) ? this.courses.getCourse(Number(id)) : of(undefined)).pipe(
      map((course): DetailState => ({ course, loading: false, error: '' })),
      startWith<DetailState>({ loading: true, error: '' }),
      catchError(() => of<DetailState>({ loading: false, error: 'Не удалось загрузить курс.' })),
    )),
  );
}
