import React, { useState } from 'react';
import { Calendar, Pencil, Trash2, User } from 'lucide-react';
import { Customer, InterestLevel, Language, LifecycleStage, Meeting, MeetingStatus } from '../../types';
import { useT } from '../../i18n';
import { SubcollectionName, WorkspaceDataState } from '../../hooks/useWorkspaceData';
import { clampStr, exportCsv } from '../../utils/format';
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

type CrmTool = 'hub' | 'customers' | 'meetings';

export function CrmPortal({
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
  const [tool, setTool] = useState<CrmTool>('hub');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  // Customer Modal State
  const [custModal, setCustModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [cName, setCName] = useState('');
  const [cCompany, setCCompany] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cIndustry, setCIndustry] = useState('');
  const [cInterest, setCInterest] = useState<InterestLevel>('Warm');
  const [cStage, setCStage] = useState<LifecycleStage>('Lead');
  const [cNotes, setCNotes] = useState('');

  // Meeting Modal State
  const [meetModal, setMeetModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [mTitle, setMTitle] = useState('');
  const [mCustomer, setMCustomer] = useState('');
  const [mDateTime, setMDateTime] = useState('');
  const [mLocation, setMLocation] = useState('');
  const [mStatus, setMStatus] = useState<MeetingStatus>('Scheduled');
  const [mNotes, setMNotes] = useState('');

  const tiles: HubTile[] = [
    {
      id: 'customers',
      label: lang === 'en' ? 'Customer Management' : 'ဖောက်သည်စီမံခန့်ခွဲမှု',
      icon: <User className="w-5 h-5" />,
      accentTone: 'burgundy',
      countText: `${data.customers.length} ${lang === 'en' ? 'records' : 'ဦး'}`,
    },
    {
      id: 'meetings',
      label: lang === 'en' ? 'Meeting Booking' : 'အစည်းအဝေးချိန်းဆိုမှု',
      icon: <Calendar className="w-5 h-5" />,
      accentTone: 'sky',
      countText: `${data.meetings.filter((m) => m.status === 'Scheduled').length} ${
        lang === 'en' ? 'upcoming' : 'ချိန်းဆိုထား'
      }`,
    },
  ];

  const openCustomerForm = (c?: Customer) => {
    setEditingCustomer(c ?? null);
    setCName(c?.name ?? '');
    setCCompany(c?.company ?? '');
    setCEmail(c?.email ?? '');
    setCPhone(c?.phone ?? '');
    setCIndustry(c?.industry ?? '');
    setCInterest(c?.interestLevel ?? 'Warm');
    setCStage(c?.lifecycleStage ?? 'Lead');
    setCNotes(c?.notes ?? '');
    setCustModal(true);
  };

  const saveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: clampStr(cName, 120),
      company: clampStr(cCompany, 120),
      email: clampStr(cEmail, 160),
      phone: clampStr(cPhone, 40),
      industry: clampStr(cIndustry, 80),
      interestLevel: cInterest,
      lifecycleStage: cStage,
      notes: clampStr(cNotes, 800),
    };
    if (!payload.name) return;
    if (editingCustomer) {
      await onUpdateRecord('customers', editingCustomer.id, payload);
    } else {
      await onCreateRecord('customers', payload);
    }
    setCustModal(false);
  };

  const openMeetingForm = (m?: Meeting) => {
    setEditingMeeting(m ?? null);
    setMTitle(m?.title ?? '');
    setMCustomer(m?.customerName ?? data.customers[0]?.company ?? data.customers[0]?.name ?? '');
    setMDateTime(m?.dateTime ?? '2026-11-20 10:00');
    setMLocation(m?.location ?? 'Google Meet');
    setMStatus(m?.status ?? 'Scheduled');
    setMNotes(m?.notes ?? '');
    setMeetModal(true);
  };

  const saveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: clampStr(mTitle, 160),
      customerName: clampStr(mCustomer, 120),
      dateTime: clampStr(mDateTime, 64),
      location: clampStr(mLocation, 200),
      status: mStatus,
      notes: clampStr(mNotes, 600),
    };
    if (!payload.title || !payload.customerName) return;
    if (editingMeeting) {
      await onUpdateRecord('meetings', editingMeeting.id, payload);
    } else {
      await onCreateRecord('meetings', payload);
    }
    setMeetModal(false);
  };

  if (tool === 'hub') {
    return (
      <ModuleHub
        title={t.portals.crm}
        subtitle={t.crmHubSub}
        tiles={tiles}
        onSelect={(id) => {
          setSearch('');
          setStageFilter('All');
          setTool(id as CrmTool);
        }}
      />
    );
  }

  if (tool === 'customers') {
    const filtered = data.customers.filter((c) => {
      const matchStage = stageFilter === 'All' || c.lifecycleStage === stageFilter;
      const q = search.toLowerCase();
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.industry || '').toLowerCase().includes(q);
      return matchStage && matchQ;
    });

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.crm}
          title={lang === 'en' ? 'Customer Management' : 'ဖောက်သည်စီမံခန့်ခွဲမှု'}
          subtitle={lang === 'en' ? 'Track buyer interest levels and lifecycle stages.' : 'ဖောက်သည်စိတ်ဝင်စားမှုနှင့် အဆင့်များကို စီမံပါ။'}
          onBack={() => setTool('hub')}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t.searchPlaceholder}
          primaryLabel={lang === 'en' ? 'New Customer' : 'ဖောက်သည်သစ်'}
          onPrimaryClick={() => openCustomerForm()}
          onExportCsv={() =>
            exportCsv(
              'customers.csv',
              ['Name', 'Company', 'Email', 'Phone', 'Industry', 'Interest', 'Stage'],
              filtered.map((c) => [
                c.name,
                c.company || '',
                c.email || '',
                c.phone || '',
                c.industry || '',
                c.interestLevel,
                c.lifecycleStage,
              ])
            )
          }
        />

        <KpiStrip
          items={[
            { label: lang === 'en' ? 'Total Customers' : 'စုစုပေါင်း ဖောက်သည်', value: String(data.customers.length), highlight: true },
            { label: 'Hot Leads', value: String(data.customers.filter((c) => c.interestLevel === 'Hot').length) },
            { label: 'VIP Accounts', value: String(data.customers.filter((c) => c.lifecycleStage === 'VIP').length) },
            { label: 'Active', value: String(data.customers.filter((c) => c.lifecycleStage === 'Active').length) },
          ]}
        />

        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F4F0F0] rounded-lg w-fit mb-5">
          {['All', 'Lead', 'Active', 'VIP', 'Churned'].map((st) => (
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

        {filtered.length === 0 ? (
          <EmptyState message={t.noRecords} actionLabel={t.addFirst} onAction={() => openCustomerForm()} />
        ) : (
          <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                    <th className="py-3 px-5">Contact &amp; Company</th>
                    <th className="py-3 px-4">Industry</th>
                    <th className="py-3 px-4">Phone / Email</th>
                    <th className="py-3 px-4">Interest</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAEA] text-sm">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF8F8]/70">
                      <td className="py-3 px-5">
                        <div className="font-medium text-[#1A1415]">{c.name}</div>
                        <div className="text-xs text-[#6E6365]">{c.company || 'Independent'}</div>
                      </td>
                      <td className="py-3 px-4 text-[#6E6365]">{c.industry || '—'}</td>
                      <td className="py-3 px-4 text-xs text-[#3E3537] tabular-nums">
                        <div>{c.phone || '—'}</div>
                        <div className="text-[#6E6365]">{c.email || ''}</div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusLabel status={c.interestLevel} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusLabel status={c.lifecycleStage} />
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openCustomerForm(c)}
                          className="p-1.5 text-[#6E6365] hover:text-[#5C1622] rounded-md cursor-pointer"
                          aria-label="Edit customer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecord('customers', c.id)}
                          className="p-1.5 text-[#6E6365] hover:text-[#DC2626] rounded-md ml-1 cursor-pointer"
                          aria-label="Delete customer"
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

        <Modal
          open={custModal}
          title={editingCustomer ? 'Edit Customer' : 'New Customer'}
          onClose={() => setCustModal(false)}
        >
          <form onSubmit={saveCustomer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Contact Name" required>
                <input type="text" value={cName} onChange={(e) => setCName(e.target.value)} required maxLength={120} className={INPUT_CLS} />
              </Field>
              <Field label="Company">
                <input type="text" value={cCompany} onChange={(e) => setCCompany(e.target.value)} maxLength={120} className={INPUT_CLS} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email">
                <input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} maxLength={160} className={INPUT_CLS} />
              </Field>
              <Field label="Phone">
                <input type="text" value={cPhone} onChange={(e) => setCPhone(e.target.value)} maxLength={40} className={INPUT_CLS} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Industry">
                <input type="text" value={cIndustry} onChange={(e) => setCIndustry(e.target.value)} maxLength={80} className={INPUT_CLS} />
              </Field>
              <Field label="Interest Level">
                <select value={cInterest} onChange={(e) => setCInterest(e.target.value as InterestLevel)} className={INPUT_CLS}>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </Field>
              <Field label="Lifecycle Stage">
                <select value={cStage} onChange={(e) => setCStage(e.target.value as LifecycleStage)} className={INPUT_CLS}>
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="VIP">VIP</option>
                  <option value="Churned">Churned</option>
                </select>
              </Field>
            </div>
            <Field label="Notes">
              <textarea rows={2} value={cNotes} onChange={(e) => setCNotes(e.target.value)} maxLength={800} className={INPUT_CLS} />
            </Field>
            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setCustModal(false)} className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg cursor-pointer">
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

  // Meeting Booking View
  const filteredMeetings = data.meetings.filter((m) => {
    const q = search.toLowerCase();
    return !q || m.title.toLowerCase().includes(q) || m.customerName.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <SectionHeader
        portalLabel={t.portals.crm}
        title={lang === 'en' ? 'Meeting Booking' : 'အစည်းအဝေး ချိန်းဆိုမှု'}
        subtitle={lang === 'en' ? 'Schedule and track customer consultations.' : 'ဖောက်သည်တွေ့ဆုံပွဲများကို ချိန်းဆိုပြီး ခြေရာခံပါ။'}
        onBack={() => setTool('hub')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t.searchPlaceholder}
        primaryLabel={lang === 'en' ? 'Book Meeting' : 'အစည်းအဝေးသစ်'}
        onPrimaryClick={() => openMeetingForm()}
      />

      {filteredMeetings.length === 0 ? (
        <EmptyState message={t.noRecords} actionLabel={t.addFirst} onAction={() => openMeetingForm()} />
      ) : (
        <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                  <th className="py-3 px-5">Meeting</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Location / Link</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAEA] text-sm">
                {filteredMeetings.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAF8F8]/70">
                    <td className="py-3 px-5 font-medium text-[#1A1415]">{m.title}</td>
                    <td className="py-3 px-4 text-[#3E3537]">{m.customerName}</td>
                    <td className="py-3 px-4 font-mono text-xs tabular-nums text-[#6E6365]">{m.dateTime}</td>
                    <td className="py-3 px-4 text-xs text-[#6E6365]">{m.location || '—'}</td>
                    <td className="py-3 px-4">
                      <StatusLabel status={m.status} />
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      {m.status === 'Scheduled' && (
                        <button
                          type="button"
                          onClick={() => onUpdateRecord('meetings', m.id, { status: 'Completed' })}
                          className="mr-2 px-2.5 py-1 text-xs font-medium text-[#5C1622] bg-[#F8EFF1] hover:bg-[#EBD8DC] rounded-md cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openMeetingForm(m)}
                        className="p-1.5 text-[#6E6365] hover:text-[#5C1622] rounded-md cursor-pointer"
                        aria-label="Edit meeting"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRecord('meetings', m.id)}
                        className="p-1.5 text-[#6E6365] hover:text-[#DC2626] rounded-md ml-1 cursor-pointer"
                        aria-label="Delete meeting"
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

      <Modal open={meetModal} title={editingMeeting ? 'Edit Meeting' : 'Book Meeting'} onClose={() => setMeetModal(false)}>
        <form onSubmit={saveMeeting} className="space-y-4">
          <Field label="Meeting Title" required>
            <input type="text" value={mTitle} onChange={(e) => setMTitle(e.target.value)} required maxLength={160} className={INPUT_CLS} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Customer" required>
              <input type="text" value={mCustomer} onChange={(e) => setMCustomer(e.target.value)} required maxLength={120} className={INPUT_CLS} />
            </Field>
            <Field label="Date & Time" required>
              <input type="text" value={mDateTime} onChange={(e) => setMDateTime(e.target.value)} required maxLength={64} placeholder="2026-11-20 14:00" className={INPUT_CLS} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location or Meeting Link">
              <input type="text" value={mLocation} onChange={(e) => setMLocation(e.target.value)} maxLength={200} className={INPUT_CLS} />
            </Field>
            <Field label="Status">
              <select value={mStatus} onChange={(e) => setMStatus(e.target.value as MeetingStatus)} className={INPUT_CLS}>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </Field>
          </div>
          <Field label="Agenda / Notes">
            <textarea rows={2} value={mNotes} onChange={(e) => setMNotes(e.target.value)} maxLength={600} className={INPUT_CLS} />
          </Field>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setMeetModal(false)} className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg cursor-pointer">
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
