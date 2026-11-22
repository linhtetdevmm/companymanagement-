import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  MessageSquare,
  Pencil,
  Receipt,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Deal, DealStage, Language, LostReason, PaymentStatus, SalesDocKind } from '../../types';
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

type SalesTool =
  | 'hub'
  | 'followups'
  | 'targets'
  | 'deals'
  | 'lost-why'
  | 'articles'
  | 'inbox'
  | 'orders'
  | 'approvals'
  | 'commission';

export function SalesPortal({
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
  const [tool, setTool] = useState<SalesTool>('hub');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  // Deal Modal
  const [dealModal, setDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [dTitle, setDTitle] = useState('');
  const [dCustomer, setDCustomer] = useState('');
  const [dAssignee, setDAssignee] = useState('');
  const [dAmount, setDAmount] = useState('0');
  const [dStage, setDStage] = useState<DealStage>('Lead');
  const [dLost, setDLost] = useState<LostReason>('None');
  const [dPay, setDPay] = useState<PaymentStatus>('Unpaid');
  const [dComm, setDComm] = useState('5');
  const [dDue, setDDue] = useState(todayIso());
  const [dNotes, setDNotes] = useState('');

  // SalesDoc Modal
  const [docModal, setDocModal] = useState(false);
  const [docKind, setDocKind] = useState<SalesDocKind>('followup');
  const [sTitle, setSTitle] = useState('');
  const [sAuthor, setSAuthor] = useState('');
  const [sBody, setSBody] = useState('');
  const [sTarget, setSTarget] = useState('0');
  const [sPeriod, setSPeriod] = useState(todayIso().slice(0, 7));

  const wonDeals = data.deals.filter((d) => d.stage === 'Won');
  const wonTotal = wonDeals.reduce((s, d) => s + d.amount, 0);
  const lostDeals = data.deals.filter((d) => d.stage === 'Lost');
  const pendingApprovals = data.deals.filter((d) => d.paymentStatus === 'Pending Approval');

  const tiles: HubTile[] = [
    { id: 'followups', label: lang === 'en' ? 'Follow-up Tasks' : 'ဆက်သွယ်ရန်တာဝန်များ', icon: <CheckCircle2 className="w-5 h-5" />, accentTone: 'emerald' },
    { id: 'targets', label: lang === 'en' ? 'Sales Targets' : 'ရောင်းအားပစ်မှတ်', icon: <Target className="w-5 h-5" />, accentTone: 'sky' },
    { id: 'deals', label: lang === 'en' ? 'Sales Deals' : 'အရောင်းအစီအစဉ်', icon: <TrendingUp className="w-5 h-5" />, accentTone: 'emerald', countText: `${data.deals.length}` },
    { id: 'lost-why', label: lang === 'en' ? 'Lost-why Diagnosis' : 'အရောင်းရှုံးရသည့်အကြောင်း', icon: <AlertCircle className="w-5 h-5" />, accentTone: 'rose', countText: `${lostDeals.length}` },
    { id: 'articles', label: lang === 'en' ? 'Knowledge Articles' : 'အရောင်းလမ်းညွှန်များ', icon: <BookOpen className="w-5 h-5" />, accentTone: 'burgundy' },
    { id: 'inbox', label: lang === 'en' ? 'Staff Thread Inbox' : 'အဖွဲ့တွင်းမှတ်ချက်များ', icon: <MessageSquare className="w-5 h-5" />, accentTone: 'sky' },
    { id: 'orders', label: lang === 'en' ? 'Orders & Payments' : 'အော်ဒါနှင့်ငွေပေးချေမှု', icon: <Receipt className="w-5 h-5" />, accentTone: 'sky', countText: `${wonDeals.length}` },
    { id: 'approvals', label: lang === 'en' ? 'Payment Approvals' : 'ငွေပေးချေမှုအတည်ပြုချက်', icon: <FileCheck2 className="w-5 h-5" />, accentTone: 'emerald', countText: `${pendingApprovals.length} pending` },
    { id: 'commission', label: lang === 'en' ? 'Commission' : 'ကော်မရှင်တွက်ချက်မှု', icon: <CircleDollarSign className="w-5 h-5" />, accentTone: 'amber' },
  ];

  const openDealForm = (deal?: Deal) => {
    setEditingDeal(deal ?? null);
    setDTitle(deal?.title ?? '');
    setDCustomer(deal?.customerName ?? data.customers[0]?.company ?? data.customers[0]?.name ?? '');
    setDAssignee(deal?.assignee ?? data.employees[0]?.name ?? '');
    setDAmount(String(deal?.amount ?? 0));
    setDStage(deal?.stage ?? 'Lead');
    setDLost(deal?.lostReason ?? 'None');
    setDPay(deal?.paymentStatus ?? 'Unpaid');
    setDComm(String(deal?.commissionRate ?? 5));
    setDDue(deal?.dueDate ?? todayIso());
    setDNotes(deal?.notes ?? '');
    setDealModal(true);
  };

  const saveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: clampStr(dTitle, 160),
      customerName: clampStr(dCustomer, 120),
      assignee: clampStr(dAssignee, 100),
      amount: clampNumber(dAmount),
      stage: dStage,
      lostReason: dStage === 'Lost' ? (dLost === 'None' ? 'Price' : dLost) : 'None',
      paymentStatus: dPay,
      commissionRate: clampNumber(dComm, 0, 100),
      dueDate: clampStr(dDue, 32),
      notes: clampStr(dNotes, 800),
    };
    if (!payload.title || !payload.customerName) return;
    if (editingDeal) {
      await onUpdateRecord('deals', editingDeal.id, payload);
    } else {
      await onCreateRecord('deals', payload);
    }
    setDealModal(false);
  };

  const openDocForm = (kind: SalesDocKind) => {
    setDocKind(kind);
    setSTitle('');
    setSAuthor(data.employees[0]?.name ?? 'Sales Team');
    setSBody('');
    setSTarget('10000000');
    setSPeriod(todayIso().slice(0, 7));
    setDocModal(true);
  };

  const saveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      kind: docKind,
      title: clampStr(sTitle, 160),
      author: clampStr(sAuthor, 100),
      body: clampStr(sBody, 1500),
      targetAmount: clampNumber(sTarget),
      period: clampStr(sPeriod, 40),
      status: docKind === 'followup' ? 'Open' : 'Active',
    };
    if (!payload.title) return;
    await onCreateRecord('salesDocs', payload);
    setDocModal(false);
  };

  if (tool === 'hub') {
    return (
      <ModuleHub
        title={t.portals.sales}
        subtitle={t.salesHubSub}
        tiles={tiles}
        onSelect={(id) => {
          setSearch('');
          setStageFilter('All');
          setTool(id as SalesTool);
        }}
      />
    );
  }

  if (tool === 'deals' || tool === 'orders' || tool === 'approvals') {
    const baseList =
      tool === 'orders'
        ? wonDeals
        : tool === 'approvals'
        ? data.deals.filter((d) => d.paymentStatus !== 'Unpaid')
        : data.deals;

    const filtered = baseList.filter((d) => {
      const matchStage = stageFilter === 'All' || d.stage === stageFilter;
      const q = search.toLowerCase();
      const matchQ = !q || d.title.toLowerCase().includes(q) || d.customerName.toLowerCase().includes(q);
      return matchStage && matchQ;
    });

    const titleText =
      tool === 'orders'
        ? 'Orders & Payments'
        : tool === 'approvals'
        ? 'Payment Approvals'
        : 'Sales Deals Pipeline';

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.sales}
          title={titleText}
          onBack={() => setTool('hub')}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t.searchPlaceholder}
          primaryLabel="New Deal"
          onPrimaryClick={() => openDealForm()}
          onExportCsv={() =>
            exportCsv(
              'sales-deals.csv',
              ['Deal', 'Customer', 'Owner', 'Amount', 'Stage', 'Payment'],
              filtered.map((d) => [d.title, d.customerName, d.assignee || '', d.amount, d.stage, d.paymentStatus])
            )
          }
        />

        {tool === 'deals' && (
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F4F0F0] rounded-lg w-fit mb-5">
            {['All', 'Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStageFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  stageFilter === st ? 'bg-white text-[#5C1622] shadow-xs' : 'text-[#6E6365] hover:text-[#1A1415]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState message={t.noRecords} actionLabel={t.addFirst} onAction={() => openDealForm()} />
        ) : (
          <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                    <th className="py-3 px-5">Deal / Order</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAEA] text-sm">
                  {filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-[#FAF8F8]/70">
                      <td className="py-3 px-5">
                        <div className="font-medium text-[#1A1415]">{d.title}</div>
                        <div className="text-xs text-[#6E6365]">{d.assignee || 'Unassigned'} · Due {d.dueDate || '—'}</div>
                      </td>
                      <td className="py-3 px-4 text-[#3E3537]">{d.customerName}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-[#1A1415]">
                        {formatMoney(d.amount, currency)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusLabel status={d.stage} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusLabel status={d.paymentStatus} />
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        {d.paymentStatus === 'Pending Approval' && (
                          <button
                            type="button"
                            onClick={() => onUpdateRecord('deals', d.id, { paymentStatus: 'Paid' })}
                            className="mr-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[#5C1622] hover:bg-[#450F18] rounded-md cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve Paid</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDealForm(d)}
                          className="p-1.5 text-[#6E6365] hover:text-[#5C1622] rounded-md cursor-pointer"
                          aria-label="Edit deal"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecord('deals', d.id)}
                          className="p-1.5 text-[#6E6365] hover:text-[#DC2626] rounded-md ml-1 cursor-pointer"
                          aria-label="Delete deal"
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
      </div>
    );
  }

  if (tool === 'targets') {
    const targets = data.salesDocs.filter((s) => s.kind === 'target');
    const mainQuota = targets.reduce((s, x) => s + (x.targetAmount || 0), 0) || 40000000;
    const pct = Math.min(100, Math.round((wonTotal / mainQuota) * 100));

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.sales}
          title="Sales Targets & Quotas"
          subtitle="Live won revenue tracked against monthly company targets."
          onBack={() => setTool('hub')}
          primaryLabel="Add Quota"
          onPrimaryClick={() => openDocForm('target')}
        />

        <KpiStrip
          items={[
            { label: 'Total Monthly Quota', value: formatMoney(mainQuota, currency) },
            { label: 'Won Revenue', value: formatMoney(wonTotal, currency), highlight: true },
            { label: 'Achievement', value: `${pct}%` },
            { label: 'Remaining to Target', value: formatMoney(Math.max(0, mainQuota - wonTotal), currency) },
          ]}
        />

        <div className="bg-white border border-[#E7DFDF] rounded-2xl p-6 space-y-5">
          {targets.map((tg) => {
            const tgtVal = tg.targetAmount || 1;
            const ratio = Math.min(100, Math.round((wonTotal / tgtVal) * 100));
            return (
              <div key={tg.id}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div>
                    <span className="font-semibold text-[#1A1415]">{tg.title}</span>
                    <span className="ml-2 text-xs text-[#6E6365]">· {tg.period}</span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-[#5C1622] font-semibold">
                    {formatMoney(wonTotal, currency)} / {formatMoney(tgtVal, currency)} ({ratio}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#F4F0F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#5C1622] rounded-full" style={{ width: `${ratio}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (tool === 'lost-why') {
    const reasons: LostReason[] = ['Price', 'Timing', 'Competitor', 'Scope'];
    const lostTotal = lostDeals.reduce((s, d) => s + d.amount, 0);

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.sales}
          title="Lost-why Diagnosis"
          subtitle="Breakdown of closed-lost opportunities by root cause."
          onBack={() => setTool('hub')}
        />

        <KpiStrip
          items={[
            { label: 'Lost Deals Count', value: String(lostDeals.length), highlight: true },
            { label: 'Lost Deal Value', value: formatMoney(lostTotal, currency) },
            { label: 'Win Rate', value: `${data.deals.length ? Math.round((wonDeals.length / data.deals.length) * 100) : 0}%` },
            { label: 'Won Deals', value: String(wonDeals.length) },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E7DFDF] rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-[#1A1415]">Loss Reason Breakdown</h2>
            {reasons.map((reason) => {
              const subset = lostDeals.filter((d) => d.lostReason === reason);
              const val = subset.reduce((s, d) => s + d.amount, 0);
              const pct = lostDeals.length ? Math.round((subset.length / lostDeals.length) * 100) : 0;
              return (
                <div key={reason}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#1A1415]">{reason}</span>
                    <span className="font-mono tabular-nums text-[#6E6365]">
                      {subset.length} deals ({pct}%) · {formatMoney(val, currency)}
                    </span>
                  </div>
                  <div className="h-2 bg-[#F4F0F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5C1622] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-[#E7DFDF] rounded-2xl p-6">
            <h2 className="font-display text-base font-semibold text-[#1A1415] mb-4">Closed-Lost Deals</h2>
            {lostDeals.length === 0 ? (
              <p className="text-sm text-[#6E6365]">No lost deals recorded.</p>
            ) : (
              <div className="divide-y divide-[#F0EAEA]">
                {lostDeals.map((d) => (
                  <div key={d.id} className="py-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-[#1A1415]">{d.title}</span>
                      <span className="font-mono tabular-nums text-[#6E6365]">{formatMoney(d.amount, currency)}</span>
                    </div>
                    <div className="text-xs text-[#6E6365] mt-0.5">
                      {d.customerName} · Reason: <span className="text-[#5C1622] font-medium">{d.lostReason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (tool === 'commission') {
    const byRep = new Map<string, { sales: number; commission: number; count: number }>();
    wonDeals.forEach((d) => {
      const rep = d.assignee || 'Unassigned';
      const cur = byRep.get(rep) || { sales: 0, commission: 0, count: 0 };
      cur.sales += d.amount;
      cur.commission += Math.round((d.amount * (d.commissionRate || 0)) / 100);
      cur.count += 1;
      byRep.set(rep, cur);
    });

    const rows = Array.from(byRep.entries());
    const totalComm = rows.reduce((s, [, r]) => s + r.commission, 0);

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.sales}
          title="Sales Commission Ledger"
          subtitle="Automatically calculated from Won deals and rep commission rates."
          onBack={() => setTool('hub')}
        />

        <KpiStrip
          items={[
            { label: 'Total Commission Payable', value: formatMoney(totalComm, currency), highlight: true },
            { label: 'Won Deal Volume', value: formatMoney(wonTotal, currency) },
            { label: 'Active Reps Earning', value: String(rows.length) },
            { label: 'Won Deals Count', value: String(wonDeals.length) },
          ]}
        />

        <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                <th className="py-3 px-5">Sales Representative</th>
                <th className="py-3 px-4 text-right">Won Deals</th>
                <th className="py-3 px-4 text-right">Won Revenue</th>
                <th className="py-3 px-5 text-right">Earned Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAEA] text-sm">
              {rows.map(([rep, info]) => (
                <tr key={rep}>
                  <td className="py-3 px-5 font-medium text-[#1A1415]">{rep}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{info.count}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{formatMoney(info.sales, currency)}</td>
                  <td className="py-3 px-5 text-right font-mono tabular-nums font-semibold text-[#5C1622]">
                    {formatMoney(info.commission, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Follow-up tasks, Knowledge Articles, Staff Thread Inbox
  const docKindMap: Record<string, SalesDocKind> = {
    followups: 'followup',
    articles: 'article',
    inbox: 'thread',
  };
  const activeKind = docKindMap[tool] || 'followup';
  const docList = data.salesDocs.filter((d) => {
    if (d.kind !== activeKind) return false;
    const q = search.toLowerCase();
    return !q || d.title.toLowerCase().includes(q) || (d.body || '').toLowerCase().includes(q);
  });

  const docTitleMap: Record<string, string> = {
    followups: 'Follow-up Tasks',
    articles: 'Knowledge Articles',
    inbox: 'Staff Thread Inbox',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
      <SectionHeader
        portalLabel={t.portals.sales}
        title={docTitleMap[tool] || 'Sales Workspace'}
        onBack={() => setTool('hub')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t.searchPlaceholder}
        primaryLabel="New Entry"
        onPrimaryClick={() => openDocForm(activeKind)}
      />

      {docList.length === 0 ? (
        <EmptyState message={t.noRecords} actionLabel={t.addFirst} onAction={() => openDocForm(activeKind)} />
      ) : (
        <div className="space-y-3">
          {docList.map((docItem) => (
            <div
              key={docItem.id}
              className="bg-white border border-[#E7DFDF] rounded-xl p-5 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-[#6E6365] mb-1">
                  <span>{docItem.author || 'Team'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{docItem.period || todayIso()}</span>
                  {docItem.status && (
                    <>
                      <span aria-hidden="true">·</span>
                      <StatusLabel status={docItem.status} />
                    </>
                  )}
                </div>
                <h3 className="font-display text-base font-semibold text-[#1A1415]">{docItem.title}</h3>
                {docItem.body && <p className="mt-1 text-sm text-[#3E3537] leading-relaxed">{docItem.body}</p>}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeKind === 'followup' && docItem.status !== 'Done' && (
                  <button
                    type="button"
                    onClick={() => onUpdateRecord('salesDocs', docItem.id, { status: 'Done' })}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#5C1622] hover:bg-[#450F18] rounded-md cursor-pointer"
                  >
                    Mark Done
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteRecord('salesDocs', docItem.id)}
                  className="p-1.5 text-[#6E6365] hover:text-[#DC2626] rounded-md cursor-pointer"
                  aria-label="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deal Modal */}
      <Modal open={dealModal} title={editingDeal ? 'Edit Deal' : 'New Sales Deal'} onClose={() => setDealModal(false)}>
        <form onSubmit={saveDeal} className="space-y-4">
          <Field label="Deal Title" required>
            <input type="text" value={dTitle} onChange={(e) => setDTitle(e.target.value)} required maxLength={160} className={INPUT_CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Customer" required>
              <input type="text" value={dCustomer} onChange={(e) => setDCustomer(e.target.value)} required maxLength={120} className={INPUT_CLS} />
            </Field>
            <Field label="Sales Rep">
              <input type="text" value={dAssignee} onChange={(e) => setDAssignee(e.target.value)} maxLength={100} className={INPUT_CLS} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Amount" required>
              <input type="number" min={0} value={dAmount} onChange={(e) => setDAmount(e.target.value)} required className={INPUT_CLS} />
            </Field>
            <Field label="Stage">
              <select value={dStage} onChange={(e) => setDStage(e.target.value as DealStage)} className={INPUT_CLS}>
                <option value="Lead">Lead</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </Field>
            <Field label="Commission %">
              <input type="number" min={0} max={100} value={dComm} onChange={(e) => setDComm(e.target.value)} className={INPUT_CLS} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Payment Status">
              <select value={dPay} onChange={(e) => setDPay(e.target.value as PaymentStatus)} className={INPUT_CLS}>
                <option value="Unpaid">Unpaid</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Paid">Paid</option>
              </select>
            </Field>
            <Field label="Lost Reason (if Lost)">
              <select value={dLost} onChange={(e) => setDLost(e.target.value as LostReason)} className={INPUT_CLS}>
                <option value="None">None</option>
                <option value="Price">Price</option>
                <option value="Timing">Timing</option>
                <option value="Competitor">Competitor</option>
                <option value="Scope">Scope</option>
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea rows={2} value={dNotes} onChange={(e) => setDNotes(e.target.value)} maxLength={800} className={INPUT_CLS} />
          </Field>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setDealModal(false)} className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg cursor-pointer">
              {t.cancel}
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* SalesDoc Modal */}
      <Modal open={docModal} title="Add Sales Record" onClose={() => setDocModal(false)}>
        <form onSubmit={saveDoc} className="space-y-4">
          <Field label="Title" required>
            <input type="text" value={sTitle} onChange={(e) => setSTitle(e.target.value)} required maxLength={160} className={INPUT_CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Author / Rep">
              <input type="text" value={sAuthor} onChange={(e) => setSAuthor(e.target.value)} maxLength={100} className={INPUT_CLS} />
            </Field>
            <Field label="Period / Due Date">
              <input type="text" value={sPeriod} onChange={(e) => setSPeriod(e.target.value)} maxLength={40} className={INPUT_CLS} />
            </Field>
          </div>
          {docKind === 'target' && (
            <Field label="Target Revenue Amount" required>
              <input type="number" min={0} value={sTarget} onChange={(e) => setSTarget(e.target.value)} required className={INPUT_CLS} />
            </Field>
          )}
          <Field label="Details / Content">
            <textarea rows={3} value={sBody} onChange={(e) => setSBody(e.target.value)} maxLength={1500} className={INPUT_CLS} />
          </Field>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setDocModal(false)} className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg cursor-pointer">
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
