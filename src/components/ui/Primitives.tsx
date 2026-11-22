import React, { useEffect } from 'react';
import { ArrowLeft, Download, Plus, Search, X } from 'lucide-react';

export interface HubTile {
  id: string;
  label: string;
  icon: React.ReactNode;
  accentTone?: 'burgundy' | 'emerald' | 'amber' | 'sky' | 'rose' | 'slate';
  countText?: string;
}

const TONE_MAP: Record<NonNullable<HubTile['accentTone']>, string> = {
  burgundy: 'bg-[#F8EFF1] text-[#5C1622]',
  emerald: 'bg-[#ECFDF5] text-[#15803D]',
  amber: 'bg-[#FFFBEB] text-[#B45309]',
  sky: 'bg-[#F0F9FF] text-[#0369A1]',
  rose: 'bg-[#FFF1F2] text-[#BE123C]',
  slate: 'bg-[#F4F2F2] text-[#3E3537]',
};

export function ModuleHub({
  title,
  subtitle,
  tiles,
  onSelect,
}: {
  title: string;
  subtitle: string;
  tiles: HubTile[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1A1415] text-balance">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[#6E6365] leading-relaxed">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8 justify-items-center">
        {tiles.map((tile) => {
          const tone = TONE_MAP[tile.accentTone ?? 'burgundy'];
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => onSelect(tile.id)}
              className="group flex flex-col items-center w-full max-w-[168px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C1622] rounded-2xl p-2 transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="w-[88px] h-[88px] rounded-2xl bg-white border border-[#E7DFDF] shadow-[0_1px_2px_rgba(26,20,21,0.04)] group-hover:border-[#5C1622]/40 group-hover:shadow-[0_6px_18px_rgba(92,22,34,0.08)] flex items-center justify-center transition-all duration-150">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}>
                  {tile.icon}
                </div>
              </div>
              <span className="mt-3 text-[13.5px] font-medium text-[#1A1415] group-hover:text-[#5C1622] transition-colors text-center leading-snug">
                {tile.label}
              </span>
              {tile.countText && (
                <span className="mt-0.5 text-[11.5px] text-[#6E6365] tabular-nums">
                  {tile.countText}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SectionHeader({
  portalLabel,
  title,
  subtitle,
  onBack,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  primaryLabel,
  onPrimaryClick,
  onExportCsv,
  extraRight,
}: {
  portalLabel: string;
  title: string;
  subtitle?: string;
  onBack: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  primaryLabel?: string;
  onPrimaryClick?: () => void;
  onExportCsv?: () => void;
  extraRight?: React.ReactNode;
}) {
  return (
    <div className="mb-6 pb-5 border-b border-[#E7DFDF]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6365] hover:text-[#5C1622] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{portalLabel}</span>
          </button>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#1A1415]">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-[#6E6365]">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {typeof searchValue === 'string' && onSearchChange && (
            <div className="relative">
              <Search className="w-4 h-4 text-[#938789] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || 'Search...'}
                className="pl-9 pr-3 py-2 text-sm bg-white border border-[#E7DFDF] rounded-lg text-[#1A1415] placeholder:text-[#938789] focus:outline-none focus:border-[#5C1622] w-52 sm:w-60"
              />
            </div>
          )}
          {extraRight}
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg hover:bg-[#FAF8F8] hover:border-[#D4C7C7] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          )}
          {primaryLabel && onPrimaryClick && (
            <button
              type="button"
              onClick={onPrimaryClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{primaryLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface KpiItem {
  label: string;
  value: string;
  meta?: string;
  highlight?: boolean;
}

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-white border border-[#E7DFDF] rounded-xl px-5 py-4 flex flex-col justify-between"
        >
          <span className="text-xs font-medium text-[#6E6365]">{item.label}</span>
          <div
            className={`mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight ${
              item.highlight ? 'text-[#5C1622]' : 'text-[#1A1415]'
            }`}
          >
            {item.value}
          </div>
          {item.meta && (
            <span className="mt-1.5 text-xs text-[#6E6365] tabular-nums">{item.meta}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function StatusLabel({ status }: { status: string }) {
  const lower = status.toLowerCase();
  let colorClass = 'text-[#3E3537]';
  let dotClass = 'bg-[#938789]';

  if (
    ['active', 'approved', 'won', 'paid', 'settled', 'posted', 'completed', 'published', 'present', 'hired', 'vip', 'done'].includes(
      lower
    )
  ) {
    colorClass = 'text-[#15803D]';
    dotClass = 'bg-[#16A34A]';
  } else if (
    ['pending', 'pending approval', 'probation', 'interview', 'scheduled', 'proposal', 'negotiation', 'warm', 'remote', 'draft', 'open'].includes(
      lower
    )
  ) {
    colorClass = 'text-[#B45309]';
    dotClass = 'bg-[#D97706]';
  } else if (
    ['rejected', 'lost', 'unpaid', 'cancelled', 'churned', 'offboarded', 'late', 'hot', 'paused'].includes(lower)
  ) {
    colorClass = lower === 'hot' ? 'text-[#5C1622]' : 'text-[#B91C1C]';
    dotClass = lower === 'hot' ? 'bg-[#5C1622]' : 'bg-[#DC2626]';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white border border-[#E7DFDF] rounded-xl py-12 px-6 text-center">
      <p className="text-sm text-[#6E6365]">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1415]/40 backdrop-blur-[1px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg bg-white border border-[#E7DFDF] rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7DFDF]">
          <h2 className="font-display text-base font-semibold text-[#1A1415]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#6E6365] hover:text-[#1A1415] hover:bg-[#FAF8F8] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#3E3537] mb-1.5">
        {label}
        {required && <span className="text-[#5C1622] ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

export const INPUT_CLS =
  'w-full px-3 py-2 text-sm bg-white border border-[#E7DFDF] rounded-lg text-[#1A1415] placeholder:text-[#938789] focus:outline-none focus:border-[#5C1622] transition-colors';
