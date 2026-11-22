import { BLUEPRINT_LIMITS } from '../types';

export function formatMoney(amount: number, currency: 'MMK' | 'USD' = 'MMK'): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(safe);
  }
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(safe)} MMK`;
}

export function clampStr(val: string | undefined, max: number): string {
  return (val ?? '').trim().slice(0, max);
}

export function sanitizeSlug(val: string): string {
  const cleaned = val
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return cleaned || 'my-company';
}

export function sanitizeId(val: string): string {
  const cleaned = val.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  return cleaned || `id_${Date.now()}`;
}

export function clampNumber(val: unknown, min = 0, max = 100000000000): number {
  const num = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function exportCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escapeCell = (cell: string | number) => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function isValidBlueprintId(id: string): boolean {
  return id.length >= 1 && id.length <= 128 && BLUEPRINT_LIMITS.idPattern.test(id);
}
