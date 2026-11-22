import React, { useState } from 'react';
import { Check, Settings2, X } from 'lucide-react';
import { Language } from '../../types';
import { useT } from '../../i18n';
import { SubcollectionName, WorkspaceDataState } from '../../hooks/useWorkspaceData';
import { clampStr, formatMoney, sanitizeSlug } from '../../utils/format';
import { Field, INPUT_CLS, KpiStrip, Modal, StatusLabel } from '../ui/Primitives';

export function OwnerPortal({
  lang,
  data,
  onUpdateWorkspace,
  onUpdateRecord,
  onNavigatePortal,
}: {
  lang: Language;
  data: WorkspaceDataState;
  onUpdateWorkspace: (patch: Record<string, unknown>) => Promise<void>;
  onUpdateRecord: (subcol: SubcollectionName, id: string, patch: Record<string, unknown>) => Promise<void>;
  onNavigatePortal: (portal: 'hr' | 'sales' | 'finance') => void;
}) {
  const t = useT(lang);
  const currency = data.workspace?.currency ?? 'MMK';
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wsName, setWsName] = useState(data.workspace?.name ?? '');
  const [wsCurrency, setWsCurrency] = useState<'MMK' | 'USD'>(currency);
  const [wsFiscal, setWsFiscal] = useState(data.workspace?.fiscalYear ?? 'FY 2026');
  const [saving, setSaving] = useState(false);

  const activeEmployees = data.employees.filter((e) => e.status === 'Active').length;
  const monthlyPayroll = data.employees
    .filter((e) => e.status !== 'Offboarded')
    .reduce((sum, e) => sum + e.baseSalary, 0);

  const wonDeals = data.deals.filter((d) => d.stage === 'Won');
  const wonRevenue = wonDeals.reduce((sum, d) => sum + d.amount, 0);
  const openPipeline = data.deals
    .filter((d) => !['Won', 'Lost'].includes(d.stage))
    .reduce((sum, d) => sum + d.amount, 0);

  const cashIn = data.financeEntries
    .filter((f) => f.kind === 'cash' && f.direction === 'In')
    .reduce((sum, f) => sum + f.amount, 0);
  const cashOut = data.financeEntries
    .filter((f) => f.kind === 'cash' && f.direction === 'Out')
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingLeaves = data.hrRequests.filter((r) => r.kind === 'leave' && r.status === 'Pending');
  const pendingClaims = data.financeEntries.filter((f) => f.kind === 'claim' && f.status === 'Pending');
  const pendingPayments = data.deals.filter((d) => d.paymentStatus === 'Pending Approval');
  const totalApprovals = pendingLeaves.length + pendingClaims.length + pendingPayments.length;

  const openSettings = () => {
    setWsName(data.workspace?.name ?? '');
    setWsCurrency(data.workspace?.currency ?? 'MMK');
    setWsFiscal(data.workspace?.fiscalYear ?? 'FY 2026');
    setSettingsOpen(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = clampStr(wsName, 120);
    if (!cleanName) return;
    setSaving(true);
    try {
      await onUpdateWorkspace({
        name: cleanName,
        slug: sanitizeSlug(cleanName),
        currency: wsCurrency,
        fiscalYear: clampStr(wsFiscal, 20) || 'FY 2026',
      });
      setSettingsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const maxBar = Math.max(cashIn, cashOut, wonRevenue, monthlyPayroll, 1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-[#E7DFDF]">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#1A1415]">
            {t.portals.owner} — {data.workspace?.name}
          </h1>
          <p className="mt-1 text-sm text-[#6E6365]">{t.ownerHubSub}</p>
        </div>

        <button
          type="button"
          onClick={openSettings}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#1A1415] bg-white border border-[#E7DFDF] hover:border-[#5C1622]/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5 text-[#5C1622]" />
          <span>{lang === 'en' ? 'Company Settings' : 'ကုမ္ပဏီ ဆက်တင်များ'}</span>
        </button>
      </div>

      <KpiStrip
        items={[
          {
            label: lang === 'en' ? 'Net Cash Balance' : 'အသားတင် ငွေလက်ကျန်',
            value: formatMoney(cashIn - cashOut, currency),
            meta: `${lang === 'en' ? 'In' : 'ဝင်'}: ${formatMoney(cashIn, currency)}`,
            highlight: true,
          },
          {
            label: lang === 'en' ? 'Won Sales Revenue' : 'ရောင်းချပြီး ဝင်ငွေ',
            value: formatMoney(wonRevenue, currency),
            meta: `${lang === 'en' ? 'Pipeline' : 'ဆောင်ရွက်ဆဲ'}: ${formatMoney(openPipeline, currency)}`,
          },
          {
            label: lang === 'en' ? 'Active Workforce' : 'လက်ရှိဝန်ထမ်းအင်အား',
            value: `${activeEmployees} / ${data.employees.length}`,
            meta: `${lang === 'en' ? 'Monthly Payroll' : 'လစာစုစုပေါင်း'}: ${formatMoney(monthlyPayroll, currency)}`,
          },
          {
            label: lang === 'en' ? 'Pending Approvals' : 'အတည်ပြုရန် ကျန်ရှိမှု',
            value: String(totalApprovals),
            meta: `${pendingLeaves.length} HR · ${pendingClaims.length} Finance · ${pendingPayments.length} Sales`,
            highlight: totalApprovals > 0,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Approvals Queue */}
        <div className="lg:col-span-7 bg-white border border-[#E7DFDF] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-[#1A1415]">
              {lang === 'en' ? 'Executive Approval Queue' : 'အတည်ပြုရန် စောင့်ဆိုင်းစာရင်း'}
            </h2>
            <span className="text-xs text-[#6E6365] tabular-nums">
              {totalApprovals} {lang === 'en' ? 'items' : 'ခု'}
            </span>
          </div>

          {totalApprovals === 0 ? (
            <div className="py-10 text-center text-sm text-[#6E6365]">
              {lang === 'en'
                ? 'All leave requests, expense claims, and payment approvals are cleared.'
                : 'ခွင့်တောင်းခံမှု၊ ငွေတောင်းခံမှုနှင့် ငွေပေးချေမှုအားလုံး စစ်ဆေးပြီးဖြစ်ပါသည်။'}
            </div>
          ) : (
            <div className="divide-y divide-[#F0EAEA]">
              {pendingLeaves.map((req) => (
                <div key={req.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-[#6E6365]">
                      HR Leave · {req.subjectName} · {req.date}
                    </div>
                    <div className="text-sm font-medium text-[#1A1415] truncate">{req.title}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateRecord('hrRequests', req.id, { status: 'Approved' })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#5C1622] hover:bg-[#450F18] rounded-md transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.approve}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateRecord('hrRequests', req.id, { status: 'Rejected' })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#3E3537] bg-[#FAF8F8] border border-[#E7DFDF] hover:bg-[#F3EEEE] rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.reject}</span>
                    </button>
                  </div>
                </div>
              ))}

              {pendingClaims.map((claim) => (
                <div key={claim.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-[#6E6365]">
                      Advance Claim · {claim.counterAccount} · {formatMoney(claim.amount, currency)}
                    </div>
                    <div className="text-sm font-medium text-[#1A1415] truncate">{claim.title}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateRecord('financeEntries', claim.id, { status: 'Approved' })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#5C1622] hover:bg-[#450F18] rounded-md transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.approve}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateRecord('financeEntries', claim.id, { status: 'Rejected' })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#3E3537] bg-[#FAF8F8] border border-[#E7DFDF] hover:bg-[#F3EEEE] rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.reject}</span>
                    </button>
                  </div>
                </div>
              ))}

              {pendingPayments.map((deal) => (
                <div key={deal.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-[#6E6365]">
                      Sales Payment · {deal.customerName} · {formatMoney(deal.amount, currency)}
                    </div>
                    <div className="text-sm font-medium text-[#1A1415] truncate">{deal.title}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateRecord('deals', deal.id, { paymentStatus: 'Paid' })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#5C1622] hover:bg-[#450F18] rounded-md transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Verify Paid' : 'အတည်ပြုမည်'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateRecord('deals', deal.id, { paymentStatus: 'Unpaid' })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#3E3537] bg-[#FAF8F8] border border-[#E7DFDF] hover:bg-[#F3EEEE] rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.reject}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial & Operations Pulse */}
        <div className="lg:col-span-5 bg-white border border-[#E7DFDF] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#1A1415] mb-5">
              {lang === 'en' ? 'Company Financial Pulse' : 'ကုမ္ပဏီ ငွေကြေးအခြေအနေ'}
            </h2>

            <div className="space-y-4">
              {[
                { label: lang === 'en' ? 'Cash Inflow' : 'စုစုပေါင်း ငွေဝင်', val: cashIn, color: 'bg-[#5C1622]' },
                { label: lang === 'en' ? 'Won Sales Revenue' : 'အရောင်းရငွေ (Won)', val: wonRevenue, color: 'bg-[#8D2739]' },
                { label: lang === 'en' ? 'Monthly Payroll Load' : 'လစဉ်ဝန်ထမ်းလစာ', val: monthlyPayroll, color: 'bg-[#3E3537]' },
                { label: lang === 'en' ? 'Cash Outflow' : 'စုစုပေါင်း ငွေထွက်', val: cashOut, color: 'bg-[#938789]' },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#3E3537] font-medium">{bar.label}</span>
                    <span className="font-mono text-[#1A1415] tabular-nums">{formatMoney(bar.val, currency)}</span>
                  </div>
                  <div className="h-2 w-full bg-[#F4F0F0] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${bar.color}`}
                      style={{ width: `${Math.min(100, Math.round((bar.val / maxBar) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E7DFDF] flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigatePortal('finance')}
              className="px-3 py-1.5 text-xs font-medium text-[#5C1622] bg-[#F8EFF1] hover:bg-[#EBD8DC] rounded-lg transition-colors cursor-pointer"
            >
              {t.portals.finance} →
            </button>
            <button
              type="button"
              onClick={() => onNavigatePortal('hr')}
              className="px-3 py-1.5 text-xs font-medium text-[#3E3537] bg-[#FAF8F8] border border-[#E7DFDF] hover:bg-[#F3EEEE] rounded-lg transition-colors cursor-pointer"
            >
              {t.portals.hr} →
            </button>
            <button
              type="button"
              onClick={() => onNavigatePortal('sales')}
              className="px-3 py-1.5 text-xs font-medium text-[#3E3537] bg-[#FAF8F8] border border-[#E7DFDF] hover:bg-[#F3EEEE] rounded-lg transition-colors cursor-pointer"
            >
              {t.portals.sales} →
            </button>
          </div>
        </div>
      </div>

      {/* Department Structure Table */}
      <div className="mt-6 bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7DFDF] flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-[#1A1415]">
            {lang === 'en' ? 'Department Overview' : 'ဌာနအလိုက် အခြေအနေ'}
          </h2>
          <span className="text-xs text-[#6E6365] tabular-nums">
            {data.departments.length} {lang === 'en' ? 'departments' : 'ဌာန'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFDF] text-xs font-medium text-[#6E6365] bg-[#FAF8F8]">
                <th className="py-3 px-6">{lang === 'en' ? 'Department' : 'ဌာနအမည်'}</th>
                <th className="py-3 px-4">{lang === 'en' ? 'Lead' : 'ဌာနမှူး'}</th>
                <th className="py-3 px-4 text-right">{lang === 'en' ? 'Headcount' : 'ဝန်ထမ်း'}</th>
                <th className="py-3 px-4 text-right">{lang === 'en' ? 'Monthly Budget' : 'လစဉ်ဘတ်ဂျက်'}</th>
                <th className="py-3 px-6 text-right">{lang === 'en' ? 'Status' : 'အခြေအနေ'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAEA] text-sm">
              {data.departments.map((dept) => {
                const count = data.employees.filter((e) => e.department === dept.name).length;
                return (
                  <tr key={dept.id} className="hover:bg-[#FAF8F8]/80 transition-colors">
                    <td className="py-3 px-6 font-medium text-[#1A1415]">{dept.name}</td>
                    <td className="py-3 px-4 text-[#6E6365]">{dept.managerName || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#1A1415]">{count}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#1A1415]">
                      {formatMoney(dept.budget, currency)}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <StatusLabel status="Active" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={settingsOpen}
        title={lang === 'en' ? 'Company Workspace Settings' : 'ကုမ္ပဏီ Workspace ဆက်တင်များ'}
        onClose={() => setSettingsOpen(false)}
      >
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <Field label={lang === 'en' ? 'Company Name' : 'ကုမ္ပဏီအမည်'} required>
            <input
              type="text"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              maxLength={120}
              required
              className={INPUT_CLS}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={lang === 'en' ? 'Reporting Currency' : 'ငွေကြေးစနစ်'}>
              <select
                value={wsCurrency}
                onChange={(e) => setWsCurrency(e.target.value as 'MMK' | 'USD')}
                className={INPUT_CLS}
              >
                <option value="MMK">MMK (Myanmar Kyat)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </Field>
            <Field label={lang === 'en' ? 'Fiscal Year' : 'ဘဏ္ဍာနှစ်'}>
              <input
                type="text"
                value={wsFiscal}
                onChange={(e) => setWsFiscal(e.target.value)}
                maxLength={20}
                required
                className={INPUT_CLS}
              />
            </Field>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg hover:bg-[#FAF8F8] cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg disabled:opacity-60 cursor-pointer"
            >
              {saving ? '...' : t.save}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
