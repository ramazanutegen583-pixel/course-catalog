import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreferencesService } from '../services/preferences.service';

@Component({
  selector: 'app-not-found', standalone: true, imports: [RouterLink],
  template: '<section class="empty-state"><p class="eyebrow">404</p><h1>{{ i18n.text().notFound }}</h1><a class="button" routerLink="/catalog">{{ i18n.text().backCatalog }}</a></section>',
})
export class NotFoundComponent { readonly i18n = inject(PreferencesService); }
