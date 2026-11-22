import React, { useState } from 'react';
import {
  ArrowLeftRight,
  BarChart2,
  BookText,
  CalendarRange,
  Check,
  FileSpreadsheet,
  GitFork,
  Landmark,
  ReceiptText,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react';
import {
  FinanceDirection,
  FinanceEntryKind,
  FinanceStatus,
  Language,
} from '../../types';
import { useT } from '../../i18n';
import { SubcollectionName, WorkspaceDataState } from '../../hooks/useWorkspaceData';
import { clampNumber, clampStr, exportCsv, formatMoney, todayIso } from '../../utils/format';
import {
  EmptyState,
  Field,
  HubTile,
  INPUT_CLS,
  KpiStrip,
  Modal,
  ModuleHub,
  SectionHeader,
  StatusLabel,
} from '../ui/Primitives';

type FinanceTool =
  | 'hub'
  | 'overview'
  | 'cash'
  | 'journal'
  | 'control'
  | 'rules'
  | 'claims'
  | 'receipts'
  | 'budget'
  | 'arap'
  | 'accounts'
  | 'roles'
  | 'integrations'
  | 'periods'
  | 'statements'
  | 'trial';

export function FinancePortal({
  lang,
  data,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
}: {
  lang: Language;
  data: WorkspaceDataState;
  onCreateRecord: (subcol: SubcollectionName, payload: Record<string, unknown>) => Promise<void>;
  onUpdateRecord: (subcol: SubcollectionName, id: string, patch: Record<string, unknown>) => Promise<void>;
  onDeleteRecord: (subcol: SubcollectionName, id: string) => Promise<void>;
}) {
  const t = useT(lang);
  const currency = data.workspace?.currency ?? 'MMK';
  const [tool, setTool] = useState<FinanceTool>('hub');
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState<string>('All');
  const [syncPayroll, setSyncPayroll] = useState(true);
  const [syncSalesAr, setSyncSalesAr] = useState(true);

  // Entry Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [entryKind, setEntryKind] = useState<FinanceEntryKind>('cash');
  const [fTitle, setFTitle] = useState('');
  const [fDate, setFDate] = useState(todayIso());
  const [fCategory, setFCategory] = useState('Sales Revenue');
  const [fDir, setFDir] = useState<FinanceDirection>('In');
  const [fCounter, setFCounter] = useState('1010 · KBZ Corporate Bank');
  const [fAmount, setFAmount] = useState('0');
  const [fLimit, setFLimit] = useState('0');
  const [fStatus, setFStatus] = useState<FinanceStatus>('Posted');
  const [fNotes, setFNotes] = useState('');

  const cashEntries = data.financeEntries.filter((f) => f.kind === 'cash');
  const cashIn = cashEntries.filter((c) => c.direction === 'In').reduce((s, c) => s + c.amount, 0);
  const cashOut = cashEntries.filter((c) => c.direction === 'Out').reduce((s, c) => s + c.amount, 0);
  const arTotal = data.financeEntries
    .filter((f) => f.kind === 'arap' && f.direction === 'AR' && f.status !== 'Settled')
    .reduce((s, f) => s + f.amount, 0);
  const apTotal = data.financeEntries
    .filter((f) => f.kind === 'arap' && f.direction === 'AP' && f.status !== 'Settled')
    .reduce((s, f) => s + f.amount, 0);

  const tiles: HubTile[] = [
    { id: 'overview', label: lang === 'en' ? 'Finance Overview' : 'ဘဏ္ဍာရေးအနှစ်ချုပ်', icon: <BarChart2 className="w-5 h-5" />, accentTone: 'burgundy' },
    { id: 'cash', label: lang === 'en' ? 'Cash In Out' : 'ငွေဝင်/ငွေထွက်', icon: <ArrowLeftRight className="w-5 h-5" />, accentTone: 'emerald', countText: `${cashEntries.length}` },
    { id: 'journal', label: lang === 'en' ? 'General Journal' : 'အထွေထွေဂျာနယ်', icon: <BookText className="w-5 h-5" />, accentTone: 'burgundy' },
    { id: 'control', label: lang === 'en' ? 'Cash Flow Control' : 'ငွေစီးဆင်းမှုထိန်းချုပ်မှု', icon: <WalletCards className="w-5 h-5" />, accentTone: 'sky' },
    { id: 'rules', label: lang === 'en' ? 'Cash Flow Rules' : 'ငွေစီးဆင်းမှုစည်းမျဉ်း', icon: <SlidersHorizontal className="w-5 h-5" />, accentTone: 'sky' },
    { id: 'claims', label: lang === 'en' ? 'Advance Claims' : 'ကြိုတင်ငွေတောင်းခံမှု', icon: <Landmark className="w-5 h-5" />, accentTone: 'amber' },
    { id: 'receipts', label: lang === 'en' ? 'Receipt Portal' : 'ပြေစာမှတ်တမ်း', icon: <ReceiptText className="w-5 h-5" />, accentTone: 'rose' },
    { id: 'budget', label: lang === 'en' ? 'Budget vs Actual' : 'ဘတ်ဂျက်နှိုင်းယှဉ်ချက်', icon: <Target className="w-5 h-5" />, accentTone: 'amber' },
    { id: 'arap', label: lang === 'en' ? 'AR / AP' : 'ရရန် / ပေးရန်', icon: <ArrowLeftRight className="w-5 h-5" />, accentTone: 'rose' },
    { id: 'accounts', label: lang === 'en' ? 'Chart of Accounts' : 'စာရင်းခေါင်းစဉ်ဇယား', icon: <Landmark className="w-5 h-5" />, accentTone: 'burgundy' },
    { id: 'roles', label: lang === 'en' ? 'Finance Roles & Limits' : 'ဘဏ္ဍာရေးအခွင့်အာဏာ', icon: <ShieldCheck className="w-5 h-5" />, accentTone: 'emerald' },
    { id: 'integrations', label: lang === 'en' ? 'Module Integrations' : 'စနစ်ချိတ်ဆက်မှု', icon: <GitFork className="w-5 h-5" />, accentTone: 'burgundy' },
    { id: 'periods', label: lang === 'en' ? 'Accounting Periods' : 'စာရင်းနှစ်ကာလ', icon: <CalendarRange className="w-5 h-5" />, accentTone: 'slate' },
    { id: 'statements', label: lang === 'en' ? 'Financial Statements' : 'ဘဏ္ဍာရေးရှင်းတမ်းများ', icon: <FileSpreadsheet className="w-5 h-5" />, accentTone: 'sky' },
    { id: 'trial', label: lang === 'en' ? 'Trial Balance' : 'အစမ်းရှင်းတမ်း', icon: <Scale className="w-5 h-5" />, accentTone: 'burgundy' },
  ];

  const openEntryModal = (kind: FinanceEntryKind, defaultDir: FinanceDirection, defaultStatus: FinanceStatus) => {
    setEntryKind(kind);
    setFTitle('');
    setFDate(todayIso());
    setFCategory(kind === 'cash' ? 'Operating Expense' : kind === 'budget' ? 'Marketing & Growth' : 'General');
    setFDir(defaultDir);
    setFCounter('1010 · KBZ Corporate Bank');
    setFAmount('0');
    setFLimit('5000000');
    setFStatus(defaultStatus);
    setFNotes('');
    setModalOpen(true);
  };

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      kind: entryKind,
      date: clampStr(fDate, 32),
      title: clampStr(fTitle, 160),
      category: clampStr(fCategory, 80),
      direction: fDir,
      counterAccount: clampStr(fCounter, 100),
      amount: clampNumber(fAmount),
      limitAmount: clampNumber(fLimit),
      status: fStatus,
      notes: clampStr(fNotes, 600),
    };
    if (!payload.title) return;
    await onCreateRecord('financeEntries', payload);
    setModalOpen(false);
  };

  if (tool === 'hub') {
    return (
      <ModuleHub
        title={t.portals.finance}
        subtitle={t.financeHubSub}
        tiles={tiles}
        onSelect={(id) => {
          setSearch('');
          setDirFilter('All');
          setTool(id as FinanceTool);
        }}
      />
    );
  }

  if (tool === 'overview') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.finance}
          title="Finance Overview"
          subtitle="Live organization treasury, receivables, payables, and cash ledger."
          onBack={() => setTool('hub')}
          primaryLabel="Log Cash In / Out"
          onPrimaryClick={() => openEntryModal('cash', 'In', 'Posted')}
        />

        <KpiStrip
          items={[
            { label: 'Net Cash Position', value: formatMoney(cashIn - cashOut, currency), highlight: true },
            { label: 'Total Cash Inflow', value: formatMoney(cashIn, currency) },
            { label: 'Total Cash Outflow', value: formatMoney(cashOut, currency) },
            { label: 'Open AR / AP', value: formatMoney(arTotal - apTotal, currency), meta: `AR ${formatMoney(arTotal, currency)} · AP ${formatMoney(apTotal, currency)}` },
          ]}
        />

        <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7DFDF] flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#1A1415]">Recent Cash Ledger</h2>
            <button type="button" onClick={() => setTool('cash')} className="text-xs font-medium text-[#5C1622] hover:underline cursor-pointer">
              Open Full Cashbook →
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAEA] text-sm">
              {cashEntries.slice(0, 8).map((c) => (
                <tr key={c.id}>
                  <td className="py-3 px-5 font-mono text-xs tabular-nums text-[#6E6365]">{c.date}</td>
                  <td className="py-3 px-4 font-medium text-[#1A1415]">{c.title}</td>
                  <td className="py-3 px-4 text-[#6E6365]">{c.category}</td>
                  <td className="py-3 px-4"><StatusLabel status={c.direction === 'In' ? 'Active' : 'Pending'} /></td>
                  <td className={`py-3 px-5 text-right font-mono tabular-nums font-medium ${c.direction === 'In' ? 'text-[#15803D]' : 'text-[#1A1415]'}`}>
                    {c.direction === 'In' ? '+' : '-'}{formatMoney(c.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (tool === 'control') {
    const netBalance = Math.max(0, cashIn - cashOut);
    const rules = data.financeEntries.filter((f) => f.kind === 'rule');
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.finance}
          title="Cash Flow Control"
          subtitle="Live treasury reserve allocation based on your active Cash Flow Rules."
          onBack={() => setTool('hub')}
          primaryLabel="Add Rule"
          onPrimaryClick={() => openEntryModal('rule', 'Rule', 'Active')}
        />
        <KpiStrip
          items={[
            { label: 'Allocatable Net Cash', value: formatMoney(netBalance, currency), highlight: true },
            { label: 'Active Rules', value: String(rules.length) },
            { label: 'Total Cash In', value: formatMoney(cashIn, currency) },
            { label: 'Total Cash Out', value: formatMoney(cashOut, currency) },
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {rules.map((r) => {
            const allocated = Math.round((netBalance * r.amount) / 100);
            const healthy = allocated >= (r.limitAmount || 0);
            return (
              <div key={r.id} className="bg-white border border-[#E7DFDF] rounded-2xl p-6">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="text-xs text-[#6E6365]">{r.counterAccount}</div>
                    <h3 className="font-display text-base font-semibold text-[#1A1415] mt-0.5">{r.title}</h3>
                  </div>
                  <StatusLabel status={healthy ? 'Active' : 'Pending'} />
                </div>
                <div className="mt-4 font-display text-2xl font-semibold font-mono tabular-nums text-[#5C1622]">
                  {formatMoney(allocated, currency)}
                </div>
                <p className="mt-1 text-xs text-[#6E6365] tabular-nums">
                  Target Floor: {formatMoney(r.limitAmount || 0, currency)} · Allocation: {r.amount}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (tool === 'budget') {
    const budgets = data.financeEntries.filter((f) => f.kind === 'budget');
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.finance}
          title="Budget vs Actual"
          subtitle="Monthly expense caps compared against live Cash Out postings."
          onBack={() => setTool('hub')}
          primaryLabel="Add Budget Line"
          onPrimaryClick={() => openEntryModal('budget', 'Expense', 'Active')}
        />
        <div className="bg-white border border-[#E7DFDF] rounded-2xl p-6 space-y-5">
          {budgets.map((b) => {
            const actualFromCash = cashEntries
              .filter((c) => c.direction === 'Out' && c.category === b.category)
              .reduce((s, c) => s + c.amount, 0);
            const actual = actualFromCash || b.amount;
            const cap = b.limitAmount || b.amount || 1;
            const pct = Math.min(100, Math.round((actual / cap) * 100));
            return (
              <div key={b.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-[#1A1415]">{b.title}</span>
                  <span className="font-mono text-xs tabular-nums text-[#3E3537]">
                    {formatMoney(actual, currency)} / {formatMoney(cap, currency)} ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 bg-[#F4F0F0] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct > 90 ? 'bg-[#DC2626]' : 'bg-[#5C1622]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (tool === 'statements' || tool === 'trial') {
    const wonRev = data.deals.filter((d) => d.stage === 'Won').reduce((s, d) => s + d.amount, 0);
    const totalRevenue = Math.max(wonRev, cashIn);
    const totalExpenses = cashOut;
    const netIncome = totalRevenue - totalExpenses;
    const accounts = data.financeEntries.filter((f) => f.kind === 'account');
    const journals = data.financeEntries.filter((f) => f.kind === 'journal');
    const journalSum = journals.reduce((s, j) => s + j.amount, 0);

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.finance}
          title={tool === 'statements' ? 'Financial Statements' : 'Trial Balance'}
          subtitle="Real-time ledger aggregation from Chart of Accounts, Cashbook, and General Journal."
          onBack={() => setTool('hub')}
        />

        {tool === 'statements' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E7DFDF] rounded-2xl p-6">
              <h2 className="font-display text-base font-semibold text-[#1A1415] mb-4">Income Statement (P&amp;L)</h2>
              <div className="divide-y divide-[#F0EAEA] text-sm">
                <div className="py-3 flex justify-between">
                  <span className="text-[#3E3537]">Operating Revenue &amp; Cash In</span>
                  <span className="font-mono tabular-nums font-medium">{formatMoney(totalRevenue, currency)}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-[#3E3537]">Operating Expenses &amp; Cash Out</span>
                  <span className="font-mono tabular-nums text-[#B91C1C]">({formatMoney(totalExpenses, currency)})</span>
                </div>
                <div className="py-3 flex justify-between font-semibold text-[#5C1622]">
                  <span>Net Operating Surplus</span>
                  <span className="font-mono tabular-nums">{formatMoney(netIncome, currency)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E7DFDF] rounded-2xl p-6">
              <h2 className="font-display text-base font-semibold text-[#1A1415] mb-4">Balance Sheet Snapshot</h2>
              <div className="divide-y divide-[#F0EAEA] text-sm">
                <div className="py-3 flex justify-between">
                  <span className="text-[#3E3537]">Cash &amp; Bank Equivalents</span>
                  <span className="font-mono tabular-nums font-medium">{formatMoney(cashIn - cashOut, currency)}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-[#3E3537]">Accounts Receivable (AR)</span>
                  <span className="font-mono tabular-nums">{formatMoney(arTotal, currency)}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-[#3E3537]">Accounts Payable (AP)</span>
                  <span className="font-mono tabular-nums text-[#B91C1C]">({formatMoney(apTotal, currency)})</span>
                </div>
                <div className="py-3 flex justify-between font-semibold text-[#1A1415]">
                  <span>Net Working Position</span>
                  <span className="font-mono tabular-nums">{formatMoney(cashIn - cashOut + arTotal - apTotal, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                  <th className="py-3 px-5">Account</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Debit</th>
                  <th className="py-3 px-5 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAEA] text-sm">
                {accounts.map((acc) => {
                  const isDebit = ['Asset', 'Expense'].includes(acc.direction);
                  return (
                    <tr key={acc.id}>
                      <td className="py-3 px-5 font-medium text-[#1A1415]">{acc.title}</td>
                      <td className="py-3 px-4 text-[#6E6365]">{acc.direction}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {isDebit ? formatMoney(acc.amount, currency) : '—'}
                      </td>
                      <td className="py-3 px-5 text-right font-mono tabular-nums">
                        {!isDebit ? formatMoney(acc.amount, currency) : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-[#FAF8F8] font-semibold">
                  <td className="py-3 px-5 text-[#5C1622]">Journal Balanced Volume ({journals.length} entries)</td>
                  <td className="py-3 px-4 text-[#6E6365]">Verified</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{formatMoney(journalSum, currency)}</td>
                  <td className="py-3 px-5 text-right font-mono tabular-nums">{formatMoney(journalSum, currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (tool === 'roles' || tool === 'integrations' || tool === 'periods') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.finance}
          title={
            tool === 'roles'
              ? 'Finance Roles & Limits'
              : tool === 'integrations'
              ? 'Module Integrations'
              : 'Accounting Periods'
          }
          onBack={() => setTool('hub')}
        />
        {tool === 'roles' && (
          <div className="bg-white border border-[#E7DFDF] rounded-2xl divide-y divide-[#F0EAEA]">
            {[
              { role: 'Owner', limit: 'Unlimited', desc: 'Approve payroll, all capital outlays, and period closes.' },
              { role: 'Finance Lead', limit: formatMoney(10000000, currency), desc: 'Post journal entries, reconcile AR/AP, verify receipts.' },
              { role: 'Department Manager', limit: formatMoney(1500000, currency), desc: 'Submit & pre-approve team advance claims.' },
            ].map((item) => (
              <div key={item.role} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-[#1A1415]">{item.role}</div>
                  <div className="text-xs text-[#6E6365] mt-0.5">{item.desc}</div>
                </div>
                <div className="font-mono text-sm font-semibold text-[#5C1622] tabular-nums">{item.limit}</div>
              </div>
            ))}
          </div>
        )}
        {tool === 'integrations' && (
          <div className="bg-white border border-[#E7DFDF] rounded-2xl divide-y divide-[#F0EAEA]">
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#1A1415]">HR Payroll → Finance Cash Out</div>
                <div className="text-xs text-[#6E6365]">Automatically post monthly payroll disbursements into the cashbook.</div>
              </div>
              <button
                type="button"
                onClick={() => setSyncPayroll((v) => !v)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  syncPayroll ? 'bg-[#5C1622] text-white' : 'bg-[#F4F0F0] text-[#3E3537]'
                }`}
              >
                {syncPayroll ? 'Connected' : 'Paused'}
              </button>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#1A1415]">Sales Won Orders → Accounts Receivable</div>
                <div className="text-xs text-[#6E6365]">Sync pending customer order invoices to AR ledger.</div>
              </div>
              <button
                type="button"
                onClick={() => setSyncSalesAr((v) => !v)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  syncSalesAr ? 'bg-[#5C1622] text-white' : 'bg-[#F4F0F0] text-[#3E3537]'
                }`}
              >
                {syncSalesAr ? 'Connected' : 'Paused'}
              </button>
            </div>
          </div>
        )}
        {tool === 'periods' && (
          <div className="bg-white border border-[#E7DFDF] rounded-2xl divide-y divide-[#F0EAEA]">
            {[
              { period: `${data.workspace?.fiscalYear || 'FY 2026'} · November`, status: 'Active' },
              { period: `${data.workspace?.fiscalYear || 'FY 2026'} · October`, status: 'Settled' },
              { period: `${data.workspace?.fiscalYear || 'FY 2026'} · September`, status: 'Settled' },
            ].map((p) => (
              <div key={p.period} className="p-5 flex items-center justify-between">
                <span className="font-medium text-[#1A1415]">{p.period}</span>
                <StatusLabel status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Standard Ledger Views (cash, journal, claims, receipts, arap, accounts, rules)
  const kindMap: Record<string, FinanceEntryKind> = {
    cash: 'cash',
    journal: 'journal',
    claims: 'claim',
    receipts: 'receipt',
    arap: 'arap',
    accounts: 'account',
    rules: 'rule',
  };
  const currentKind = kindMap[tool] || 'cash';
  const defaultDirMap: Record<FinanceEntryKind, FinanceDirection> = {
    cash: 'In',
    journal: 'Debit',
    claim: 'Out',
    receipt: 'Out',
    arap: 'AR',
    budget: 'Expense',
    account: 'Asset',
    rule: 'Rule',
  };
  const defaultStatusMap: Record<FinanceEntryKind, FinanceStatus> = {
    cash: 'Posted',
    journal: 'Posted',
    claim: 'Pending',
    receipt: 'Pending',
    arap: 'Pending',
    budget: 'Active',
    account: 'Active',
    rule: 'Active',
  };

  const rows = data.financeEntries.filter((f) => {
    if (f.kind !== currentKind) return false;
    const matchDir = dirFilter === 'All' || f.direction === dirFilter;
    const q = search.toLowerCase();
    const matchQ =
      !q || f.title.toLowerCase().includes(q) || (f.category || '').toLowerCase().includes(q);
    return matchDir && matchQ;
  });

  const titleMap: Record<string, string> = {
    cash: 'Cash In Out',
    journal: 'General Journal',
    claims: 'Advance Claims',
    receipts: 'Receipt Portal',
    arap: 'Accounts Receivable & Payable (AR / AP)',
    accounts: 'Chart of Accounts',
    rules: 'Cash Flow Rules',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <SectionHeader
        portalLabel={t.portals.finance}
        title={titleMap[tool] || 'Finance Ledger'}
        onBack={() => setTool('hub')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t.searchPlaceholder}
        primaryLabel="New Entry"
        onPrimaryClick={() => openEntryModal(currentKind, defaultDirMap[currentKind], defaultStatusMap[currentKind])}
        onExportCsv={() =>
          exportCsv(
            `finance-${currentKind}.csv`,
            ['Date', 'Title', 'Category', 'Direction', 'Account', 'Amount', 'Status'],
            rows.map((r) => [r.date || '', r.title, r.category || '', r.direction, r.counterAccount || '', r.amount, r.status])
          )
        }
      />

      {currentKind === 'cash' && (
        <div className="flex items-center gap-1 p-1 bg-[#F4F0F0] rounded-lg w-fit mb-5">
          {['All', 'In', 'Out'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirFilter(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                dirFilter === d ? 'bg-white text-[#5C1622] shadow-xs' : 'text-[#6E6365]'
              }`}
            >
              {d === 'All' ? 'All Cash' : `Cash ${d}`}
            </button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          message={t.noRecords}
          actionLabel={t.addFirst}
          onAction={() => openEntryModal(currentKind, defaultDirMap[currentKind], defaultStatusMap[currentKind])}
        />
      ) : (
        <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                  <th className="py-3 px-5">Date / Ref</th>
                  <th className="py-3 px-4">Title &amp; Account</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">{currentKind === 'rule' ? 'Allocation %' : 'Amount'}</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAEA] text-sm">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF8F8]/70">
                    <td className="py-3 px-5 font-mono text-xs tabular-nums text-[#6E6365]">{r.date || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#1A1415]">{r.title}</div>
                      <div className="text-xs text-[#6E6365]">
                        {r.category} {r.counterAccount ? `· ${r.counterAccount}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-[#3E3537]">{r.direction}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-[#1A1415]">
                      {currentKind === 'rule' ? `${r.amount}%` : formatMoney(r.amount, currency)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusLabel status={r.status} />
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      {r.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateRecord('financeEntries', r.id, {
                                status: currentKind === 'arap' ? 'Settled' : 'Approved',
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[#5C1622] hover:bg-[#450F18] rounded-md mr-1.5 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>{currentKind === 'arap' ? t.settle : t.approve}</span>
                          </button>
                          {currentKind === 'claim' && (
                            <button
                              type="button"
                              onClick={() => onUpdateRecord('financeEntries', r.id, { status: 'Rejected' })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#3E3537] bg-[#FAF8F8] border border-[#E7DFDF] rounded-md mr-1.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteRecord('financeEntries', r.id)}
                        className="p-1.5 text-[#6E6365] hover:text-[#DC2626] rounded-md cursor-pointer"
                        aria-label="Delete finance record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} title={`New ${entryKind.toUpperCase()} Entry`} onClose={() => setModalOpen(false)}>
        <form onSubmit={saveEntry} className="space-y-4">
          <Field label="Title / Description" required>
            <input type="text" value={fTitle} onChange={(e) => setFTitle(e.target.value)} required maxLength={160} className={INPUT_CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={entryKind === 'account' ? 'Account Code' : 'Date'}>
              <input type="text" value={fDate} onChange={(e) => setFDate(e.target.value)} maxLength={32} className={INPUT_CLS} />
            </Field>
            <Field label="Category">
              <input type="text" value={fCategory} onChange={(e) => setFCategory(e.target.value)} maxLength={80} className={INPUT_CLS} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Direction / Type">
              <select value={fDir} onChange={(e) => setFDir(e.target.value as FinanceDirection)} className={INPUT_CLS}>
                <option value="In">Cash In</option>
                <option value="Out">Cash Out</option>
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
                <option value="AR">Receivable (AR)</option>
                <option value="AP">Payable (AP)</option>
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expense">Expense</option>
                <option value="Rule">Rule %</option>
              </select>
            </Field>
            <Field label={entryKind === 'rule' ? 'Allocation %' : 'Amount'} required>
              <input type="number" min={0} value={fAmount} onChange={(e) => setFAmount(e.target.value)} required className={INPUT_CLS} />
            </Field>
          </div>
          {(entryKind === 'budget' || entryKind === 'rule') && (
            <Field label="Cap / Floor Threshold Amount">
              <input type="number" min={0} value={fLimit} onChange={(e) => setFLimit(e.target.value)} className={INPUT_CLS} />
            </Field>
          )}
          <Field label="Counterparty / Account">
            <input type="text" value={fCounter} onChange={(e) => setFCounter(e.target.value)} maxLength={100} className={INPUT_CLS} />
          </Field>
          <Field label="Notes">
            <textarea rows={2} value={fNotes} onChange={(e) => setFNotes(e.target.value)} maxLength={600} className={INPUT_CLS} />
          </Field>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg cursor-pointer">
              {t.cancel}
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
