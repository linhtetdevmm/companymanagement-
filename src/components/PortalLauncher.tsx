import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CreditCard,
  Megaphone,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { Language, PortalId } from '../types';
import { useT } from '../i18n';
import { WorkspaceDataState } from '../hooks/useWorkspaceData';
import { formatMoney } from '../utils/format';

export function PortalLauncher({
  lang,
  data,
  onEnterPortal,
}: {
  lang: Language;
  data: WorkspaceDataState;
  onEnterPortal: (p: PortalId) => void;
}) {
  const t = useT(lang);
  const currency = data.workspace?.currency ?? 'MMK';

  const pendingApprovals =
    data.hrRequests.filter((r) => r.kind === 'leave' && r.status === 'Pending').length +
    data.financeEntries.filter((f) => f.kind === 'claim' && f.status === 'Pending').length +
    data.deals.filter((d) => d.paymentStatus === 'Pending Approval').length;

  const wonRevenue = data.deals
    .filter((d) => d.stage === 'Won')
    .reduce((sum, d) => sum + d.amount, 0);

  const cashIn = data.financeEntries
    .filter((f) => f.kind === 'cash' && f.direction === 'In')
    .reduce((sum, f) => sum + f.amount, 0);
  const cashOut = data.financeEntries
    .filter((f) => f.kind === 'cash' && f.direction === 'Out')
    .reduce((sum, f) => sum + f.amount, 0);

  const cards: Array<{
    id: Exclude<PortalId, 'launcher'>;
    title: string;
    desc: string;
    meta: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'owner',
      title: t.portals.owner,
      desc: t.portalDescriptions.owner,
      meta: `${pendingApprovals} ${lang === 'en' ? 'pending approvals' : 'အတည်ပြုရန်ကျန်'}`,
      icon: <ShieldCheck className="w-5 h-5 text-[#5C1622]" />,
    },
    {
      id: 'hr',
      title: t.portals.hr,
      desc: t.portalDescriptions.hr,
      meta: `${data.employees.length} ${lang === 'en' ? 'employees' : 'ဝန်ထမ်း'} · ${data.departments.length} ${
        lang === 'en' ? 'departments' : 'ဌာန'
      }`,
      icon: <Users className="w-5 h-5 text-[#5C1622]" />,
    },
    {
      id: 'sales',
      title: t.portals.sales,
      desc: t.portalDescriptions.sales,
      meta: `${data.deals.length} ${lang === 'en' ? 'deals' : 'အရောင်း'} · ${formatMoney(wonRevenue, currency)}`,
      icon: <Briefcase className="w-5 h-5 text-[#5C1622]" />,
    },
    {
      id: 'crm',
      title: t.portals.crm,
      desc: t.portalDescriptions.crm,
      meta: `${data.customers.length} ${lang === 'en' ? 'customers' : 'ဖောက်သည်'} · ${data.meetings.length} ${
        lang === 'en' ? 'meetings' : 'အစည်းအဝေး'
      }`,
      icon: <UserCheck className="w-5 h-5 text-[#5C1622]" />,
    },
    {
      id: 'marketing',
      title: t.portals.marketing,
      desc: t.portalDescriptions.marketing,
      meta: `${data.marketingItems.filter((m) => m.kind === 'campaign').length} ${
        lang === 'en' ? 'campaigns' : 'ကမ်ပိန်း'
      } · ${data.marketingItems.filter((m) => m.kind === 'product').length} ${
        lang === 'en' ? 'products' : 'ထုတ်ကုန်'
      }`,
      icon: <Megaphone className="w-5 h-5 text-[#5C1622]" />,
    },
    {
      id: 'finance',
      title: t.portals.finance,
      desc: t.portalDescriptions.finance,
      meta: `${lang === 'en' ? 'Net' : 'အသားတင်'}: ${formatMoney(cashIn - cashOut, currency)}`,
      icon: <CreditCard className="w-5 h-5 text-[#5C1622]" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#5C1622] mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{data.workspace?.name || t.brand}</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#1A1415] text-balance">
          {t.whereToWork}
        </h1>
        <p className="mt-2.5 text-sm text-[#6E6365] leading-relaxed">{t.whereToWorkSub}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white border border-[#E7DFDF] rounded-2xl p-6 flex flex-col justify-between hover:border-[#5C1622]/40 hover:shadow-[0_6px_20px_rgba(92,22,34,0.06)] transition-all duration-150"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F8EFF1] flex items-center justify-center shrink-0">
                  {card.icon}
                </div>
                <span className="text-xs text-[#6E6365] tabular-nums truncate">{card.meta}</span>
              </div>
              <h2 className="font-display text-lg font-semibold text-[#1A1415]">{card.title}</h2>
              <p className="mt-1.5 text-sm text-[#6E6365] leading-relaxed min-h-[42px]">
                {card.desc}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onEnterPortal(card.id)}
              className="mt-6 w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>
                {t.enterPortal} {card.title}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
