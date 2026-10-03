import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CartComponent } from './cart.component';
import { CartService } from '../../services/cart.service';

describe('Checkout', () => {
  beforeEach(() => { localStorage.clear(); TestBed.resetTestingModule(); });
  const create = () => TestBed.runInInjectionContext(() => new CartComponent());

  it('updates valid typed quantities and restores invalid input on blur', () => {
    const page = create();
    page.cart.add(1);
    const input = document.createElement('input');
    input.type = 'number';
    input.addEventListener('input', event => page.updateQuantity(1, event, false));
    input.addEventListener('blur', event => page.updateQuantity(1, event));
    input.value = '4';
    input.dispatchEvent(new Event('input'));
    expect(page.cart.quantity(1)).toBe(4);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('');
    expect(page.cart.quantity(1)).toBe(4);
    input.dispatchEvent(new Event('blur'));
    expect(input.value).toBe('4');
  });

  it('blocks invalid orders and exposes validation errors', () => {
    const page = create();
    page.cart.add(1);
    page.form.setValue({ name: '   ', email: 'invalid', phone: '123' });
    page.checkout();
    expect(page.receipt()).toBeNull();
    expect(page.cart.count()).toBe(1);
    expect(page.invalid('name')).toBe(true);
    expect(page.invalid('email')).toBe(true);
    expect(page.invalid('phone')).toBe(true);
  });

  it('creates a demo receipt, clears saved cart and resets personal data', () => {
    const page = create();
    page.cart.add(1); page.cart.add(1);
    const total = page.cart.total();
    page.form.setValue({ name: '  Анна  ', email: 'anna@example.com', phone: '+998 90 123 45 67' });
    page.checkout();
    expect(page.receipt()).toMatchObject({ name: 'Анна', count: 2, total });
    expect(page.receipt()?.totals.KZT).toBe(total * 100);
    expect(page.receipt()?.totals.USD).toBe(page.i18n.unitMinor(total / 2, 'USD') * 2);
    expect(page.form.getRawValue()).toEqual({ name: '', email: '', phone: '' });
    TestBed.resetTestingModule();
    expect(TestBed.inject(CartService).count()).toBe(0);
  });

  it('blocks checkout when cart is empty', () => {
    const page = create();
    page.form.setValue({ name: 'Анна', email: 'anna@example.com', phone: '+998901234567' });
    page.checkout();
    expect(page.receipt()).toBeNull();
  });
});
