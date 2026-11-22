import React, { useState } from 'react';
import {
  Box,
  CalendarDays,
  FileBarChart2,
  Megaphone,
  Palette,
  Pencil,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Language, MarketingItem, MarketingItemKind, MarketingStatus } from '../../types';
import { useT } from '../../i18n';
import { SubcollectionName, WorkspaceDataState } from '../../hooks/useWorkspaceData';
import { clampNumber, clampStr, formatMoney, todayIso } from '../../utils/format';
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

type MarketingTool =
  | 'hub'
  | 'brand'
  | 'products'
  | 'calendar'
  | 'budget'
  | 'campaigns'
  | 'performance'
  | 'autopilot';

export function MarketingPortal({
  lang,
  data,
  onUpdateWorkspace,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
}: {
  lang: Language;
  data: WorkspaceDataState;
  onUpdateWorkspace: (patch: Record<string, unknown>) => Promise<void>;
  onCreateRecord: (subcol: SubcollectionName, payload: Record<string, unknown>) => Promise<void>;
  onUpdateRecord: (subcol: SubcollectionName, id: string, patch: Record<string, unknown>) => Promise<void>;
  onDeleteRecord: (subcol: SubcollectionName, id: string) => Promise<void>;
}) {
  const t = useT(lang);
  const currency = data.workspace?.currency ?? 'MMK';
  const [tool, setTool] = useState<MarketingTool>('hub');
  const [search, setSearch] = useState('');

  // Brand Identity state
  const [tagline, setTagline] = useState(data.workspace?.tagline ?? '');
  const [voice, setVoice] = useState(data.workspace?.brandVoice ?? '');
  const [mission, setMission] = useState(data.workspace?.mission ?? '');
  const [brandSaved, setBrandSaved] = useState(false);

  // Item Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingItem | null>(null);
  const [kind, setKind] = useState<MarketingItemKind>('campaign');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [skuOrDate, setSkuOrDate] = useState('');
  const [budgetOrPrice, setBudgetOrPrice] = useState('0');
  const [spent, setSpent] = useState('0');
  const [leadsCount, setLeadsCount] = useState('0');
  const [status, setStatus] = useState<MarketingStatus>('Active');
  const [notes, setNotes] = useState('');

  const products = data.marketingItems.filter((m) => m.kind === 'product');
  const contents = data.marketingItems.filter((m) => m.kind === 'content');
  const campaigns = data.marketingItems.filter((m) => m.kind === 'campaign');

  const tiles: HubTile[] = [
    { id: 'brand', label: lang === 'en' ? 'Brand Identity' : 'အမှတ်တံဆိပ်', icon: <Palette className="w-5 h-5" />, accentTone: 'burgundy' },
    { id: 'products', label: lang === 'en' ? 'Product Catalog' : 'ထုတ်ကုန်စာရင်း', icon: <Box className="w-5 h-5" />, accentTone: 'sky', countText: `${products.length}` },
    { id: 'calendar', label: lang === 'en' ? 'Content Calendar' : 'ပို့စ်အစီအစဉ်', icon: <CalendarDays className="w-5 h-5" />, accentTone: 'emerald', countText: `${contents.length}` },
    { id: 'budget', label: lang === 'en' ? 'Targets & Budget' : 'ဘတ်ဂျက်နှင့်ပစ်မှတ်', icon: <Target className="w-5 h-5" />, accentTone: 'amber' },
    { id: 'campaigns', label: lang === 'en' ? 'Campaigns' : 'ကမ်ပိန်းများ', icon: <Megaphone className="w-5 h-5" />, accentTone: 'sky', countText: `${campaigns.length}` },
    { id: 'performance', label: lang === 'en' ? 'Performance Report' : 'စွမ်းဆောင်ရည်အစီရင်ခံစာ', icon: <FileBarChart2 className="w-5 h-5" />, accentTone: 'emerald' },
    { id: 'autopilot', label: lang === 'en' ? 'Ads & Autopilot' : 'ကြော်ငြာစီမံခန့်ခွဲမှု', icon: <TrendingUp className="w-5 h-5" />, accentTone: 'rose' },
  ];

  const openItemModal = (targetKind: MarketingItemKind, item?: MarketingItem) => {
    setEditing(item ?? null);
    setKind(item?.kind ?? targetKind);
    setTitle(item?.title ?? '');
    setChannel(item?.channelOrCategory ?? (targetKind === 'product' ? 'Software' : 'Facebook & LinkedIn'));
    setSkuOrDate(item?.skuOrDate ?? (targetKind === 'product' ? 'SKU-NEW' : todayIso()));
    setBudgetOrPrice(String(item?.budgetOrPrice ?? 0));
    setSpent(String(item?.spent ?? 0));
    setLeadsCount(String(item?.leadsCount ?? 0));
    setStatus(item?.status ?? (targetKind === 'content' ? 'Scheduled' : 'Active'));
    setNotes(item?.notes ?? '');
    setModalOpen(true);
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      kind,
      title: clampStr(title, 160),
      channelOrCategory: clampStr(channel, 80),
      skuOrDate: clampStr(skuOrDate, 64),
      budgetOrPrice: clampNumber(budgetOrPrice),
      spent: clampNumber(spent),
      leadsCount: clampNumber(leadsCount, 0, 100000000),
      status,
      notes: clampStr(notes, 600),
    };
    if (!payload.title) return;
    if (editing) {
      await onUpdateRecord('marketingItems', editing.id, payload);
    } else {
      await onCreateRecord('marketingItems', payload);
    }
    setModalOpen(false);
  };

  if (tool === 'hub') {
    return (
      <ModuleHub
        title={t.portals.marketing}
        subtitle={t.marketingHubSub}
        tiles={tiles}
        onSelect={(id) => {
          setSearch('');
          if (id === 'brand') {
            setTagline(data.workspace?.tagline ?? '');
            setVoice(data.workspace?.brandVoice ?? '');
            setMission(data.workspace?.mission ?? '');
            setBrandSaved(false);
          }
          setTool(id as MarketingTool);
        }}
      />
    );
  }

  if (tool === 'brand') {
    const handleSaveBrand = async (e: React.FormEvent) => {
      e.preventDefault();
      await onUpdateWorkspace({
        tagline: clampStr(tagline, 200),
        brandVoice: clampStr(voice, 300),
        mission: clampStr(mission, 500),
      });
      setBrandSaved(true);
    };

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.marketing}
          title={lang === 'en' ? 'Brand Identity' : 'အမှတ်တံဆိပ် မူဝါဒ'}
          subtitle={lang === 'en' ? 'Company visual palette, voice, and core positioning.' : 'ကုမ္ပဏီ၏ အရောင်၊ အသံနှင့် ရည်မှန်းချက်ကို သတ်မှတ်ပါ။'}
          onBack={() => setTool('hub')}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white border border-[#E7DFDF] rounded-2xl p-5">
            <div className="w-full h-14 rounded-xl bg-[#5C1622] mb-3" />
            <div className="text-sm font-semibold text-[#1A1415]">Deep Burgundy</div>
            <div className="text-xs font-mono text-[#6E6365] tabular-nums">#5C1622 · Primary Brand</div>
          </div>
          <div className="bg-white border border-[#E7DFDF] rounded-2xl p-5">
            <div className="w-full h-14 rounded-xl bg-white border border-[#E7DFDF] mb-3" />
            <div className="text-sm font-semibold text-[#1A1415]">Crisp White</div>
            <div className="text-xs font-mono text-[#6E6365] tabular-nums">#FFFFFF · Dominant Canvas</div>
          </div>
          <div className="bg-white border border-[#E7DFDF] rounded-2xl p-5">
            <div className="w-full h-14 rounded-xl bg-[#1A1415] mb-3" />
            <div className="text-sm font-semibold text-[#1A1415]">Ink Charcoal</div>
            <div className="text-xs font-mono text-[#6E6365] tabular-nums">#1A1415 · Typography</div>
          </div>
        </div>

        <form onSubmit={handleSaveBrand} className="bg-white border border-[#E7DFDF] rounded-2xl p-6 space-y-4">
          <Field label="Brand Tagline">
            <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={200} className={INPUT_CLS} />
          </Field>
          <Field label="Brand Voice & Tone">
            <input type="text" value={voice} onChange={(e) => setVoice(e.target.value)} maxLength={300} className={INPUT_CLS} />
          </Field>
          <Field label="Company Mission">
            <textarea rows={3} value={mission} onChange={(e) => setMission(e.target.value)} maxLength={500} className={INPUT_CLS} />
          </Field>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#15803D]">{brandSaved ? 'Brand identity updated.' : ''}</span>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (tool === 'budget' || tool === 'performance') {
    const totalBudget = campaigns.reduce((s, c) => s + c.budgetOrPrice, 0);
    const totalSpent = campaigns.reduce((s, c) => s + (c.spent || 0), 0);
    const totalLeads = campaigns.reduce((s, c) => s + (c.leadsCount || 0), 0);
    const cpl = totalLeads > 0 ? Math.round(totalSpent / totalLeads) : 0;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.marketing}
          title={tool === 'budget' ? 'Targets & Budget' : 'Performance Report'}
          subtitle="Live marketing spend efficiency, budget pacing, and lead attribution."
          onBack={() => setTool('hub')}
          primaryLabel="Add Campaign"
          onPrimaryClick={() => openItemModal('campaign')}
        />

        <KpiStrip
          items={[
            { label: 'Allocated Budget', value: formatMoney(totalBudget, currency), highlight: true },
            { label: 'Total Ad Spend', value: formatMoney(totalSpent, currency), meta: `${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% utilized` },
            { label: 'Attributed Leads', value: String(totalLeads) },
            { label: 'Avg Cost / Lead', value: formatMoney(cpl, currency) },
          ]}
        />

        <div className="bg-white border border-[#E7DFDF] rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-base font-semibold text-[#1A1415]">Campaign Budget vs Spend</h2>
          {campaigns.length === 0 ? (
            <p className="text-sm text-[#6E6365]">No active campaigns yet.</p>
          ) : (
            campaigns.map((c) => {
              const ratio = c.budgetOrPrice > 0 ? Math.min(100, Math.round(((c.spent || 0) / c.budgetOrPrice) * 100)) : 0;
              return (
                <div key={c.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-1.5">
                    <span className="font-medium text-[#1A1415]">
                      {c.title} <span className="text-xs text-[#6E6365]">· {c.channelOrCategory}</span>
                    </span>
                    <span className="font-mono text-xs tabular-nums text-[#3E3537]">
                      {formatMoney(c.spent || 0, currency)} / {formatMoney(c.budgetOrPrice, currency)} ({ratio}%) · {c.leadsCount || 0} leads
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#F4F0F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5C1622] rounded-full" style={{ width: `${ratio}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  const targetKind: MarketingItemKind =
    tool === 'products' ? 'product' : tool === 'calendar' ? 'content' : 'campaign';
  const items = data.marketingItems.filter((m) => {
    if (m.kind !== targetKind) return false;
    const q = search.toLowerCase();
    return !q || m.title.toLowerCase().includes(q) || (m.channelOrCategory || '').toLowerCase().includes(q);
  });

  const titleMap: Record<string, string> = {
    products: 'Product Catalog',
    calendar: 'Content Calendar',
    campaigns: 'Campaigns',
    autopilot: 'Ads & Autopilot',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <SectionHeader
        portalLabel={t.portals.marketing}
        title={titleMap[tool] || 'Marketing'}
        onBack={() => setTool('hub')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t.searchPlaceholder}
        primaryLabel={`New ${targetKind === 'product' ? 'Product' : targetKind === 'content' ? 'Post' : 'Campaign'}`}
        onPrimaryClick={() => openItemModal(targetKind)}
      />

      {items.length === 0 ? (
        <EmptyState message={t.noRecords} actionLabel={t.addFirst} onAction={() => openItemModal(targetKind)} />
      ) : (
        <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                  <th className="py-3 px-5">Title</th>
                  <th className="py-3 px-4">{targetKind === 'product' ? 'Category' : 'Channel'}</th>
                  <th className="py-3 px-4">{targetKind === 'product' ? 'SKU' : 'Date'}</th>
                  <th className="py-3 px-4 text-right">{targetKind === 'product' ? 'Unit Price' : 'Budget'}</th>
                  {targetKind === 'campaign' && <th className="py-3 px-4 text-right">Spent / Leads</th>}
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAEA] text-sm">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F8]/70">
                    <td className="py-3 px-5">
                      <div className="font-medium text-[#1A1415]">{item.title}</div>
                      {item.notes && <div className="text-xs text-[#6E6365] truncate max-w-xs">{item.notes}</div>}
                    </td>
                    <td className="py-3 px-4 text-[#6E6365]">{item.channelOrCategory || '—'}</td>
                    <td className="py-3 px-4 font-mono text-xs tabular-nums text-[#3E3537]">{item.skuOrDate || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#1A1415]">
                      {formatMoney(item.budgetOrPrice, currency)}
                    </td>
                    {targetKind === 'campaign' && (
                      <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-[#6E6365]">
                        {formatMoney(item.spent || 0, currency)} · {item.leadsCount || 0} leads
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <StatusLabel status={item.status} />
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      {tool === 'autopilot' && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateRecord('marketingItems', item.id, {
                              status: item.status === 'Active' ? 'Paused' : 'Active',
                            })
                          }
                          className="mr-2 px-2.5 py-1 text-xs font-medium text-[#5C1622] bg-[#F8EFF1] hover:bg-[#EBD8DC] rounded-md cursor-pointer"
                        >
                          {item.status === 'Active' ? 'Pause' : 'Resume'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openItemModal(targetKind, item)}
                        className="p-1.5 text-[#6E6365] hover:text-[#5C1622] rounded-md cursor-pointer"
                        aria-label="Edit marketing item"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRecord('marketingItems', item.id)}
                        className="p-1.5 text-[#6E6365] hover:text-[#DC2626] rounded-md ml-1 cursor-pointer"
                        aria-label="Delete marketing item"
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

      <Modal open={modalOpen} title={editing ? 'Edit Record' : 'Add Record'} onClose={() => setModalOpen(false)}>
        <form onSubmit={saveItem} className="space-y-4">
          <Field label="Title" required>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} className={INPUT_CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={kind === 'product' ? 'Category' : 'Channel'}>
              <input type="text" value={channel} onChange={(e) => setChannel(e.target.value)} maxLength={80} className={INPUT_CLS} />
            </Field>
            <Field label={kind === 'product' ? 'SKU' : 'Date'}>
              <input type="text" value={skuOrDate} onChange={(e) => setSkuOrDate(e.target.value)} maxLength={64} className={INPUT_CLS} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label={kind === 'product' ? 'Unit Price' : 'Budget'} required>
              <input type="number" min={0} value={budgetOrPrice} onChange={(e) => setBudgetOrPrice(e.target.value)} required className={INPUT_CLS} />
            </Field>
            <Field label="Spent">
              <input type="number" min={0} value={spent} onChange={(e) => setSpent(e.target.value)} className={INPUT_CLS} />
            </Field>
            <Field label="Leads">
              <input type="number" min={0} value={leadsCount} onChange={(e) => setLeadsCount(e.target.value)} className={INPUT_CLS} />
            </Field>
          </div>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as MarketingStatus)} className={INPUT_CLS}>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </Field>
          <Field label="Notes">
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={600} className={INPUT_CLS} />
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
