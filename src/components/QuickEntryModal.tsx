import React, { useState } from 'react';
import { Language } from '../types';
import { useT } from '../i18n';
import { SubcollectionName } from '../hooks/useWorkspaceData';
import { clampNumber, clampStr, todayIso } from '../utils/format';
import { Field, INPUT_CLS, Modal } from './ui/Primitives';

type EntryType = 'cash' | 'deal' | 'customer' | 'leave';

export function QuickEntryModal({
  open,
  lang,
  onClose,
  onCreateRecord,
}: {
  open: boolean;
  lang: Language;
  onClose: () => void;
  onCreateRecord: (subcol: SubcollectionName, payload: Record<string, unknown>) => Promise<void>;
}) {
  const t = useT(lang);
  const [entryType, setEntryType] = useState<EntryType>('cash');
  const [title, setTitle] = useState('');
  const [party, setParty] = useState('');
  const [amount, setAmount] = useState('0');
  const [cashDir, setCashDir] = useState<'In' | 'Out'>('In');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = clampStr(title, 160);
    if (!cleanTitle) return;
    setSaving(true);
    try {
      if (entryType === 'cash') {
        await onCreateRecord('financeEntries', {
          kind: 'cash',
          date: todayIso(),
          title: cleanTitle,
          category: cashDir === 'In' ? 'Sales Revenue' : 'Operating Expense',
          direction: cashDir,
          counterAccount: clampStr(party, 100) || '1010 · KBZ Corporate Bank',
          amount: clampNumber(amount),
          status: 'Posted',
          notes: 'Quick entry',
        });
      } else if (entryType === 'deal') {
        await onCreateRecord('deals', {
          title: cleanTitle,
          customerName: clampStr(party, 120) || 'Walk-in Client',
          assignee: 'Sales Team',
          amount: clampNumber(amount),
          stage: 'Lead',
          lostReason: 'None',
          paymentStatus: 'Unpaid',
          commissionRate: 5,
          dueDate: todayIso(),
          notes: 'Created via Quick Entry',
        });
      } else if (entryType === 'customer') {
        await onCreateRecord('customers', {
          name: cleanTitle,
          company: clampStr(party, 120),
          interestLevel: 'Warm',
          lifecycleStage: 'Lead',
          notes: 'Added via Quick Entry',
        });
      } else {
        await onCreateRecord('hrRequests', {
          kind: 'leave',
          title: cleanTitle,
          subjectName: clampStr(party, 120) || 'Staff Member',
          department: 'General',
          date: todayIso(),
          endDate: todayIso(),
          detail: 'Submitted via Quick Entry',
          status: 'Pending',
        });
      }
      setTitle('');
      setParty('');
      setAmount('0');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={t.quickEntry} onClose={onClose}>
      <div className="flex items-center gap-1 p-1 bg-[#F4F0F0] rounded-lg mb-5">
        {(
          [
            ['cash', 'Cash In/Out'],
            ['deal', 'Sales Deal'],
            ['customer', 'Customer'],
            ['leave', 'Leave Request'],
          ] as Array<[EntryType, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setEntryType(key)}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              entryType === key ? 'bg-white text-[#5C1622] shadow-xs' : 'text-[#6E6365] hover:text-[#1A1415]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label={
            entryType === 'customer'
              ? 'Customer Name'
              : entryType === 'leave'
              ? 'Leave Reason'
              : 'Title / Description'
          }
          required
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={160}
            className={INPUT_CLS}
          />
        </Field>

        <Field
          label={
            entryType === 'customer'
              ? 'Company'
              : entryType === 'leave'
              ? 'Employee Name'
              : entryType === 'deal'
              ? 'Customer'
              : 'Account / Counterparty'
          }
        >
          <input
            type="text"
            value={party}
            onChange={(e) => setParty(e.target.value)}
            maxLength={120}
            className={INPUT_CLS}
          />
        </Field>

        {(entryType === 'cash' || entryType === 'deal') && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount" required>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className={INPUT_CLS}
              />
            </Field>
            {entryType === 'cash' && (
              <Field label="Direction">
                <select
                  value={cashDir}
                  onChange={(e) => setCashDir(e.target.value as 'In' | 'Out')}
                  className={INPUT_CLS}
                >
                  <option value="In">Cash In</option>
                  <option value="Out">Cash Out</option>
                </select>
              </Field>
            )}
          </div>
        )}

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg cursor-pointer"
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
  );
}
