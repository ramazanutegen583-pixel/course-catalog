import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CartService } from './services/cart.service';
import { PreferencesService } from './services/preferences.service';

@Component({
  selector: 'app-root', standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" [routerLink]="[]" fragment="main">{{ i18n.text().skip }}</a>
    <header class="header"><div class="container header-inner">
      <a class="brand" routerLink="/catalog"><span class="brand-icon" aria-hidden="true">p.</span>praktika<span class="brand-dot">/</span></a>
      <nav [attr.aria-label]="i18n.text().navigation">
        <a routerLink="/catalog" routerLinkActive="active">{{ i18n.text().catalog }}</a>
        <a routerLink="/cart" routerLinkActive="active">{{ i18n.text().cart }} <span class="count">{{ cart.count() }}</span></a>
      </nav>
      <div class="preferences">
        <label>{{ i18n.text().language }}
          <select [value]="i18n.language()" (change)="i18n.setLanguage($any($event.target).value)">
            <option value="kk" lang="kk">Қазақша</option><option value="en" lang="en">English</option>
          </select>
        </label>
        <label>{{ i18n.text().currency }}
          <select [value]="i18n.currency()" (change)="i18n.setCurrency($any($event.target).value)">
            <option value="KZT">₸ KZT</option><option value="USD">$ USD</option>
          </select>
        </label>
      </div>
    </div></header>
    <main id="main" class="container" tabindex="-1">
      @if (cart.storageWarning()) { <p class="notice" role="status">{{ i18n.text().storageError }}</p> }
      @if (i18n.storageFailed()) { <p class="notice" role="status">{{ i18n.text().settingsError }}</p> }
      <router-outlet />
    </main>
    <footer class="container footer">
      <div class="footer-top"><span>praktika / {{ i18n.text().tagline }}</span><span>{{ i18n.text().project }}</span></div>
      <p class="rate-note">{{ i18n.text().rateNote }} <a [href]="i18n.rateSource" target="_blank" rel="noopener noreferrer">{{ i18n.text().rateSource }} ↗</a></p>
    </footer>
  `,
})
export class AppComponent {
  readonly cart = inject(CartService);
  readonly i18n = inject(PreferencesService);
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly navigation = toSignal(this.router.events.pipe(filter(event => event instanceof NavigationEnd)));

  constructor() {
    effect(() => {
      this.navigation();
      const text = this.i18n.text();
      this.document.documentElement.lang = this.i18n.language();
      const path = this.router.url.split(/[?#]/)[0];
      const title = path === '/cart' ? text.cart : path.startsWith('/course/') ? text.aboutCourse : path === '/catalog' || path === '/' ? text.catalog : text.notFound;
      this.title.setTitle(title + ' · Praktika');
    });
  }
}
