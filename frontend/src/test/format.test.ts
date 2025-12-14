import { describe, it, expect } from 'vitest';
import { formatPrice } from '../utils/format';

describe('formatPrice', () => {
    it('formats numbers correctly', () => {
        expect(formatPrice(10)).toBe('10.00');
        expect(formatPrice(10.5)).toBe('10.50');
        expect(formatPrice(0)).toBe('0.00');
    });

    it('formats strings correctly', () => {
        expect(formatPrice('10')).toBe('10.00');
        expect(formatPrice('10.5')).toBe('10.50');
        expect(formatPrice('0')).toBe('0.00');
    });

    it('handles invalid inputs gracefully', () => {
        expect(formatPrice(null)).toBe('0.00');
        expect(formatPrice(undefined)).toBe('0.00');
        expect(formatPrice('abc')).toBe('0.00');
        expect(formatPrice({})).toBe('0.00');
        expect(formatPrice([])).toBe('0.00');
    });
});
