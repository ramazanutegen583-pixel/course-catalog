import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartService, MAX_QUANTITY } from './cart.service';
import { COURSES } from '../data/courses';

describe('CartService', () => {
  beforeEach(() => { localStorage.clear(); TestBed.resetTestingModule(); });

  it('merges courses, updates totals and removes items', () => {
    const cart = TestBed.inject(CartService);
    cart.add(1); cart.add(1); cart.add(2);
    expect(cart.items()).toHaveLength(2);
    expect(cart.count()).toBe(3);
    expect(cart.total()).toBe(COURSES[0].price * 2 + COURSES[1].price);
    cart.setQuantity(1, 4);
    cart.remove(2);
    expect(cart.total()).toBe(COURSES[0].price * 4);
    cart.clear();
    expect(cart.count()).toBe(0);
    expect(cart.total()).toBe(0);
  });

  it('restores quantities after reload using catalog prices', () => {
    const cart = TestBed.inject(CartService);
    cart.add(1); cart.setQuantity(1, 3);
    TestBed.resetTestingModule();
    const restored = TestBed.inject(CartService);
    expect(restored.quantity(1)).toBe(3);
    expect(restored.total()).toBe(COURSES[0].price * 3);
  });

  it('ignores corrupted JSON, invalid entries and duplicate IDs', () => {
    localStorage.setItem('course-catalog.cart.v1', '{broken');
    expect(TestBed.inject(CartService).items()).toEqual([]);
    TestBed.resetTestingModule();
    localStorage.setItem('course-catalog.cart.v1', JSON.stringify([
      null, { courseId: 999, quantity: 1 }, { courseId: 2, quantity: -2 },
      { courseId: 3, quantity: 1.5 }, { courseId: 4, quantity: '2' },
      { courseId: 1, quantity: 2, price: 1 }, { courseId: 1, quantity: 5 },
    ]));
    const cart = TestBed.inject(CartService);
    expect(cart.items()).toHaveLength(1);
    expect(cart.total()).toBe(COURSES[0].price * 2);
  });

  it('rejects invalid quantities and respects the upper limit', () => {
    const cart = TestBed.inject(CartService);
    cart.add(1); cart.add(-1);
    for (const value of [0, -1, NaN, Infinity, 1.2, MAX_QUANTITY + 1]) cart.setQuantity(1, value);
    expect(cart.quantity(1)).toBe(1);
    cart.setQuantity(1, MAX_QUANTITY); cart.add(1);
    expect(cart.quantity(1)).toBe(MAX_QUANTITY);
  });

  it('keeps the cart usable when storage is unavailable', () => {
    const cart = TestBed.inject(CartService);
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    try {
      cart.add(1);
      expect(cart.count()).toBe(1);
      expect(cart.storageWarning()).not.toBe('');
    } finally { spy.mockRestore(); }
  });
});
