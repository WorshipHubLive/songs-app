import { accentClasses } from './accent-classes';

describe('accentClasses', () => {
  it('cycles through primary, secondary, accent by index', () => {
    expect(accentClasses(0).border).toBe('border-l-primary');
    expect(accentClasses(1).border).toBe('border-l-secondary');
    expect(accentClasses(2).border).toBe('border-l-accent');
    expect(accentClasses(3).border).toBe('border-l-primary');
  });

  it('returns the matching text and tint classes for the same accent', () => {
    const accent = accentClasses(1);
    expect(accent).toEqual({ border: 'border-l-secondary', text: 'text-secondary', tint: 'bg-secondary/15' });
  });

  it('wraps negative-safe for any non-negative song id', () => {
    expect(accentClasses(9).border).toBe('border-l-primary');
    expect(accentClasses(10).border).toBe('border-l-secondary');
  });
});
