export function formatPrice(n: number, perMonth = false): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    const str = m % 1 === 0 ? m.toString() : m.toFixed(1);
    return `${str} مليون ج.م${perMonth ? ' / شهر' : ''}`;
  }
  return `${n.toLocaleString('en-US')} ج.م${perMonth ? ' / شهر' : ''}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatArea(n: number): string {
  return `${n} م²`;
}
