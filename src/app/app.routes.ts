import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalog' },
  { path: 'catalog', loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent) },
  { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
  { path: 'course/:id', loadComponent: () => import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent) },
  { path: '**', loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent) },
];
