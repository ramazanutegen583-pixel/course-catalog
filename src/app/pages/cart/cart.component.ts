import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, MAX_QUANTITY } from '../../services/cart.service';
import { Currency, PreferencesService } from '../../services/preferences.service';

@Component({
  selector: 'app-cart', standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  readonly i18n = inject(PreferencesService);
  readonly cart = inject(CartService);
  readonly maxQuantity = MAX_QUANTITY;
  private readonly fb = inject(FormBuilder);
  readonly receipt = signal<{ name: string; total: number; count: number; totals: Record<Currency, number> } | null>(null);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S(?:[\s\S]*\S)?/), Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s()\-]+$/), control => {
      const digits = String(control.value ?? '').replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15 ? null : { phoneLength: true };
    }]],
  });

  invalid(field: 'name' | 'email' | 'phone'): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  updateQuantity(id: number, event: Event, normalize = true): void {
    const input = event.target as HTMLInputElement;
    this.cart.setQuantity(id, Number(input.value));
    if (normalize) input.value = String(this.cart.quantity(id));
  }

  checkout(): void {
    const { name, email, phone } = this.form.getRawValue();
    this.form.setValue({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.cart.count()) return;
    // Демонстрация: в реальном проекте сначала дождитесь успешного ответа API.
    this.receipt.set({
      name: this.form.controls.name.value, total: this.cart.total(), count: this.cart.count(),
      totals: { KZT: this.i18n.totalMinor(this.cart.items(), 'KZT'), USD: this.i18n.totalMinor(this.cart.items(), 'USD') },
    });
    this.cart.clear();
    this.form.reset();
  }
}
