import type { Product } from './types';

export function calculateDiscountedPrice(product: Product): number {
  if (!product.discount_type || product.discount_value <= 0) {
    return product.price;
  }

  if (product.discount_type === 'percentage') {
    return product.price * (1 - product.discount_value / 100);
  } else if (product.discount_type === 'fixed') {
    return product.price - product.discount_value;
  }

  return product.price;
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('ar-IQ')} د.ع`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
