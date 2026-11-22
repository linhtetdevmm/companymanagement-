import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Award,
  Building,
  CalendarClock,
  Check,
  CheckSquare,
  ClipboardCheck,
  Clock,
  FileKey2,
  LogOut,
  Pencil,
  Target,
  Trash2,
  UserCheck,
  UserCircle2,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import {
  Department,
  Employee,
  EmployeeRole,
  EmployeeStatus,
  HrRequest,
  HrRequestKind,
  HrRequestStatus,
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

type HrTool =
  | 'hub'
  | 'my-portal'
  | 'employees'
  | 'departments'
  | 'recruitment'
  | 'onboarding'
  | 'offboarding'
  | 'handovers'
  | 'access'
  | 'payroll'
  | 'rosters'
  | 'attendance'
  | 'leave'
  | 'kpis'
  | 'kudos';

export function HrPortal({
  lang,
  userDisplayName,
  data,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
}: {
  lang: Language;
  userDisplayName: string;
  data: WorkspaceDataState;
  onCreateRecord: (subcol: SubcollectionName, payload: Record<string, unknown>) => Promise<void>;
  onUpdateRecord: (subcol: SubcollectionName, id: string, patch: Record<string, unknown>) => Promise<void>;
  onDeleteRecord: (subcol: SubcollectionName, id: string) => Promise<void>;
}) {
  const t = useT(lang);
  const currency = data.workspace?.currency ?? 'MMK';
  const [tool, setTool] = useState<HrTool>('hub');
  const [search, setSearch] = useState('');

  // Employee Modal
  const [empModal, setEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [eName, setEName] = useState('');
  const [eEmail, setEEmail] = useState('');
  const [ePhone, setEPhone] = useState('');
  const [eDept, setEDept] = useState('');
  const [ePos, setEPos] = useState('');
  const [eRole, setERole] = useState<EmployeeRole>('Staff');
  const [eSalary, setESalary] = useState('1200000');
  const [eStatus, setEStatus] = useState<EmployeeStatus>('Active');
  const [eKpi, setEKpi] = useState('85');

  // Department Modal
  const [deptModal, setDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [dName, setDName] = useState('');
  const [dMgr, setDMgr] = useState('');
  const [dBudget, setDBudget] = useState('0');
  const [dDesc, setDDesc] = useState('');

  // HR Request Modal
  const [reqModal, setReqModal] = useState(false);
  const [reqKind, setReqKind] = useState<HrRequestKind>('leave');
  const [rTitle, setRTitle] = useState('');
  const [rSubject, setRSubject] = useState('');
  const [rDept, setRDept] = useState('');
  const [rDate, setRDate] = useState(todayIso());
  const [rEndDate, setREndDate] = useState(todayIso());
  const [rDetail, setRDetail] = useState('');
  const [rStatus, setRStatus] = useState<HrRequestStatus>('Pending');

  const leaves = data.hrRequests.filter((r) => r.kind === 'leave');
  const attendance = data.hrRequests.filter((r) => r.kind === 'attendance');
  const candidates = data.hrRequests.filter((r) => r.kind === 'recruitment');
  const checklists = data.hrRequests.filter((r) => r.kind === 'checklist');
  const kudosList = data.hrRequests.filter((r) => r.kind === 'kudos');

  const tiles: HubTile[] = [
    { id: 'my-portal', label: lang === 'en' ? 'My Portal' : 'ကျွန်ုပ်၏ပေါ်တယ်', icon: <UserCircle2 className="w-5 h-5" />, accentTone: 'burgundy' },
    { id: 'employees', label: lang === 'en' ? 'Employees' : 'ဝန်ထမ်းများ', icon: <Users className="w-5 h-5" />, accentTone: 'burgundy', countText: `${data.employees.length}` },
    { id: 'departments', label: lang === 'en' ? 'Departments & Positions' : 'ဌာနနှင့်ရာထူးများ', icon: <Building className="w-5 h-5" />, accentTone: 'sky', countText: `${data.departments.length}` },
    { id: 'recruitment', label: lang === 'en' ? 'Recruitment' : 'ဝန်ထမ်းခေါ်ယူရေး', icon: <UserCheck className="w-5 h-5" />, accentTone: 'sky', countText: `${candidates.length}` },
    { id: 'onboarding', label: lang === 'en' ? 'Onboarding' : 'ဝန်ထမ်းသစ်ကြိုဆိုမှု', icon: <ClipboardCheck className="w-5 h-5" />, accentTone: 'emerald' },
    { id: 'offboarding', label: lang === 'en' ? 'Offboarding' : 'ထွက်ခွာမှုစီမံခြင်း', icon: <LogOut className="w-5 h-5" />, accentTone: 'rose' },
    { id: 'handovers', label: lang === 'en' ? 'Handovers' : 'တာဝန်လွှဲပြောင်းမှု', icon: <ArrowLeftRight className="w-5 h-5" />, accentTone: 'slate' },
    { id: 'access', label: lang === 'en' ? 'Access Templates' : 'ဝင်ရောက်ခွင့်ပုံစံ', icon: <FileKey2 className="w-5 h-5" />, accentTone: 'amber' },
    { id: 'payroll', label: lang === 'en' ? 'Payroll' : 'လစာပေးချေမှု', icon: <Wallet className="w-5 h-5" />, accentTone: 'emerald' },
    { id: 'rosters', label: lang === 'en' ? 'Rosters' : 'အလှည့်ကျအချိန်ဇယား', icon: <CalendarClock className="w-5 h-5" />, accentTone: 'sky' },
    { id: 'attendance', label: lang === 'en' ? 'Attendance' : 'ရုံးတက်မှတ်တမ်း', icon: <Clock className="w-5 h-5" />, accentTone: 'emerald', countText: `${attendance.length}` },
    { id: 'leave', label: lang === 'en' ? 'Leave' : 'ခွင့်ရက်စီမံမှု', icon: <CheckSquare className="w-5 h-5" />, accentTone: 'amber', countText: `${leaves.filter((l) => l.status === 'Pending').length} pending` },
    { id: 'kpis', label: lang === 'en' ? 'Performance & KPIs' : 'စွမ်းဆောင်ရည် KPI', icon: <Target className="w-5 h-5" />, accentTone: 'burgundy' },
    { id: 'kudos', label: lang === 'en' ? 'Rewards & Kudos' : 'ဂုဏ်ပြုဆုချီးမြှင့်မှု', icon: <Award className="w-5 h-5" />, accentTone: 'rose', countText: `${kudosList.length}` },
  ];

  const openEmpModal = (emp?: Employee) => {
    setEditingEmp(emp ?? null);
    setEName(emp?.name ?? '');
    setEEmail(emp?.email ?? '');
    setEPhone(emp?.phone ?? '');
    setEDept(emp?.department ?? data.departments[0]?.name ?? 'Executive & Operations');
    setEPos(emp?.position ?? '');
    setERole(emp?.role ?? 'Staff');
    setESalary(String(emp?.baseSalary ?? 1200000));
    setEStatus(emp?.status ?? 'Active');
    setEKpi(String(emp?.kpiScore ?? 85));
    setEmpModal(true);
  };

  const saveEmp = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: clampStr(eName, 120),
      email: clampStr(eEmail, 160),
      phone: clampStr(ePhone, 40),
      department: clampStr(eDept, 80) || 'General',
      position: clampStr(ePos, 80) || 'Associate',
      role: eRole,
      baseSalary: clampNumber(eSalary, 0, 1000000000),
      joinDate: editingEmp?.joinDate ?? todayIso(),
      status: eStatus,
      onboardingProgress: eStatus === 'Active' ? 100 : 60,
      kpiScore: clampNumber(eKpi, 0, 100),
    };
    if (!payload.name) return;
    if (editingEmp) {
      await onUpdateRecord('employees', editingEmp.id, payload);
    } else {
      await onCreateRecord('employees', payload);
    }
    setEmpModal(false);
  };

  const openDeptModal = (dept?: Department) => {
    setEditingDept(dept ?? null);
    setDName(dept?.name ?? '');
    setDMgr(dept?.managerName ?? '');
    setDBudget(String(dept?.budget ?? 5000000));
    setDDesc(dept?.description ?? '');
    setDeptModal(true);
  };

  const saveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: clampStr(dName, 100),
      managerName: clampStr(dMgr, 100),
      budget: clampNumber(dBudget, 0, 10000000000),
      description: clampStr(dDesc, 400),
    };
    if (!payload.name) return;
    if (editingDept) {
      await onUpdateRecord('departments', editingDept.id, payload);
    } else {
      await onCreateRecord('departments', payload);
    }
    setDeptModal(false);
  };

  const openReqModal = (targetKind: HrRequestKind, defaultStatus: HrRequestStatus = 'Pending') => {
    setReqKind(targetKind);
    setRTitle('');
    setRSubject(userDisplayName || data.employees[0]?.name || '');
    setRDept(data.departments[0]?.name ?? 'People & HR');
    setRDate(todayIso());
    setREndDate(todayIso());
    setRDetail('');
    setRStatus(defaultStatus);
    setReqModal(true);
  };

  const saveReq = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      kind: reqKind,
      title: clampStr(rTitle, 160),
      subjectName: clampStr(rSubject, 120),
      department: clampStr(rDept, 80),
      date: clampStr(rDate, 32),
      endDate: clampStr(rEndDate, 32),
      detail: clampStr(rDetail, 600),
      status: rStatus,
    };
    if (!payload.title || !payload.subjectName) return;
    await onCreateRecord('hrRequests', payload);
    setReqModal(false);
  };

  if (tool === 'hub') {
    return (
      <ModuleHub
        title={t.portals.hr}
        subtitle={t.hrHubSub}
        tiles={tiles}
        onSelect={(id) => {
          setSearch('');
          setTool(id as HrTool);
        }}
      />
    );
  }

  if (tool === 'my-portal') {
    const myAttendanceToday = attendance.filter((a) => a.date === todayIso());
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.hr}
          title={lang === 'en' ? 'My Self-Service Portal' : 'ကျွန်ုပ်၏ ဝန်ထမ်းပေါ်တယ်'}
          subtitle={`${userDisplayName} · ${data.workspace?.name || ''}`}
          onBack={() => setTool('hub')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E7DFDF] rounded-2xl p-6">
            <h2 className="font-display text-base font-semibold text-[#1A1415]">
              {lang === 'en' ? 'Daily Check-In' : 'ယနေ့ ရုံးတက်မှတ်တမ်း'}
            </h2>
            <p className="mt-1 text-xs text-[#6E6365] tabular-nums">{todayIso()}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  onCreateRecord('hrRequests', {
                    kind: 'attendance',
                    title: `Office Check-In (${new Date().toTimeString().slice(0, 5)})`,
                    subjectName: userDisplayName || 'Staff Member',
                    department: 'Executive & Operations',
                    date: todayIso(),
                    detail: 'Checked in via My Portal',
                    status: 'Present',
                  })
                }
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg cursor-pointer"
              >
                {lang === 'en' ? 'Check In (Office)' : 'ရုံးတက် Check-In'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onCreateRecord('hrRequests', {
                    kind: 'attendance',
                    title: `Remote Check-In (${new Date().toTimeString().slice(0, 5)})`,
                    subjectName: userDisplayName || 'Staff Member',
                    department: 'Executive & Operations',
                    date: todayIso(),
                    detail: 'Remote work check-in',
                    status: 'Remote',
                  })
                }
                className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] hover:bg-[#FAF8F8] rounded-lg cursor-pointer"
              >
                {lang === 'en' ? 'Check In (Remote)' : 'Remote Check-In'}
              </button>
            </div>
            {myAttendanceToday.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#E7DFDF] space-y-2">
                {myAttendanceToday.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#1A1415]">{a.title}</span>
                    <StatusLabel status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#E7DFDF] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#1A1415]">
                {lang === 'en' ? 'Leave & Time Off' : 'ခွင့်ရက် တောင်းခံမှု'}
              </h2>
              <p className="mt-1 text-xs text-[#6E6365]">
                {leaves.filter((l) => l.status === 'Pending').length} pending ·{' '}
                {leaves.filter((l) => l.status === 'Approved').length} approved
              </p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => openReqModal('leave', 'Pending')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg cursor-pointer"
              >
                {lang === 'en' ? 'Request Leave' : 'ခွင့်တောင်းမည်'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tool === 'employees') {
    const filtered = data.employees.filter((e) => {
      const q = search.toLowerCase();
      return (
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q)
      );
    });

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.hr}
          title={lang === 'en' ? 'Employees Directory' : 'ဝန်ထမ်းစာရင်း'}
          subtitle="Active team directory, role assignments, and compensation records."
          onBack={() => setTool('hub')}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t.searchPlaceholder}
          primaryLabel="Add Employee"
          onPrimaryClick={() => openEmpModal()}
          onExportCsv={() =>
            exportCsv(
              'employees.csv',
              ['Name', 'Department', 'Position', 'Role', 'Base Salary', 'Status'],
              filtered.map((e) => [e.name, e.department, e.position, e.role, e.baseSalary, e.status])
            )
          }
        />

        {filtered.length === 0 ? (
          <EmptyState message={t.noRecords} actionLabel={t.addFirst} onAction={() => openEmpModal()} />
        ) : (
          <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                    <th className="py-3 px-5">Employee</th>
                    <th className="py-3 px-4">Department &amp; Title</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Base Salary</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAEA] text-sm">
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#FAF8F8]/70">
                      <td className="py-3 px-5">
                        <div className="font-medium text-[#1A1415]">{emp.name}</div>
                        <div className="text-xs text-[#6E6365]">{emp.email || emp.phone || '—'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#1A1415]">{emp.position}</div>
                        <div className="text-xs text-[#6E6365]">{emp.department}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#3E3537]">{emp.role}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#1A1415]">
                        {formatMoney(emp.baseSalary, currency)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusLabel status={emp.status} />
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEmpModal(emp)}
                          className="p-1.5 text-[#6E6365] hover:text-[#5C1622] rounded-md cursor-pointer"
                          aria-label="Edit employee"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecord('employees', emp.id)}
                          className="p-1.5 text-[#6E6365] hover:text-[#DC2626] rounded-md ml-1 cursor-pointer"
                          aria-label="Delete employee"
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

  if (tool === 'departments') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.hr}
          title={lang === 'en' ? 'Departments & Positions' : 'ဌာနနှင့် ရာထူးများ'}
          onBack={() => setTool('hub')}
          primaryLabel="Add Department"
          onPrimaryClick={() => openDeptModal()}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.departments.map((dept) => {
            const members = data.employees.filter((e) => e.department === dept.name);
            return (
              <div key={dept.id} className="bg-white border border-[#E7DFDF] rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-[#1A1415]">{dept.name}</h3>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openDeptModal(dept)} className="p-1 text-[#6E6365] hover:text-[#5C1622] cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => onDeleteRecord('departments', dept.id)} className="p-1 text-[#6E6365] hover:text-[#DC2626] cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[#6E6365]">{dept.description || 'No description'}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#F0EAEA] flex items-center justify-between text-xs">
                  <span className="text-[#6E6365]">Lead: {dept.managerName || 'Unassigned'}</span>
                  <span className="font-mono tabular-nums text-[#5C1622] font-medium">
                    {members.length} staff · {formatMoney(dept.budget, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (tool === 'payroll') {
    const activeStaff = data.employees.filter((e) => e.status !== 'Offboarded');
    const totalPayroll = activeStaff.reduce((s, e) => s + e.baseSalary, 0);

    const recordPayrollRun = async () => {
      await onCreateRecord('financeEntries', {
        kind: 'cash',
        date: todayIso(),
        title: `Monthly Payroll Run (${todayIso().slice(0, 7)})`,
        category: 'Payroll & Compensation',
        direction: 'Out',
        counterAccount: '5010 · Salaries & Wages',
        amount: totalPayroll,
        status: 'Posted',
        notes: `Automated HR payroll disbursement for ${activeStaff.length} staff.`,
      });
    };

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.hr}
          title={lang === 'en' ? 'Payroll' : 'လစာပေးချေမှု'}
          subtitle="Computed directly from active employee base salaries."
          onBack={() => setTool('hub')}
          primaryLabel={lang === 'en' ? 'Post Run to Finance' : 'Finance သို့စာရင်းသွင်းမည်'}
          onPrimaryClick={recordPayrollRun}
          onExportCsv={() =>
            exportCsv(
              'payroll.csv',
              ['Employee', 'Department', 'Position', 'Base Salary', 'Status'],
              activeStaff.map((e) => [e.name, e.department, e.position, e.baseSalary, e.status])
            )
          }
        />

        <KpiStrip
          items={[
            { label: 'Total Monthly Payroll', value: formatMoney(totalPayroll, currency), highlight: true },
            { label: 'Eligible Headcount', value: String(activeStaff.length) },
            { label: 'Average Base Salary', value: formatMoney(activeStaff.length ? Math.round(totalPayroll / activeStaff.length) : 0, currency) },
            { label: 'Pay Cycle', value: todayIso().slice(0, 7) },
          ]}
        />

        <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                <th className="py-3 px-5">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Net Base Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAEA] text-sm">
              {activeStaff.map((e) => (
                <tr key={e.id} className="hover:bg-[#FAF8F8]/70">
                  <td className="py-3 px-5 font-medium text-[#1A1415]">{e.name}</td>
                  <td className="py-3 px-4 text-[#6E6365]">{e.department}</td>
                  <td className="py-3 px-4"><StatusLabel status={e.status} /></td>
                  <td className="py-3 px-5 text-right font-mono tabular-nums text-[#1A1415]">
                    {formatMoney(e.baseSalary, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (tool === 'access') {
    const roles: Array<{ role: string; scope: string; modules: string }> = [
      { role: 'Owner', scope: 'Full workspace control, approvals, financial statements', modules: 'All 6 Portals' },
      { role: 'Manager', scope: 'Department staff, deal approvals, budget tracking', modules: 'HR · Sales · CRM · Marketing' },
      { role: 'HR', scope: 'Employee lifecycle, payroll, attendance, leave processing', modules: 'People & HR' },
      { role: 'Sales', scope: 'Deal pipeline, quotes, customer follow-ups, commissions', modules: 'Sales & Revenue · CRM' },
      { role: 'Finance', scope: 'Cashbook, journal, AR/AP, advance claim verification', modules: 'Finance' },
      { role: 'Staff', scope: 'Self-service check-in, leave requests, knowledge base', modules: 'My Portal' },
    ];
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.hr}
          title={lang === 'en' ? 'Access Templates' : 'ဝင်ရောက်ခွင့် ပုံစံများ'}
          subtitle="Role-based portal access matrix across the organization."
          onBack={() => setTool('hub')}
        />
        <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                <th className="py-3 px-5">Role Template</th>
                <th className="py-3 px-4">Permissions Scope</th>
                <th className="py-3 px-5">Portals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAEA] text-sm">
              {roles.map((r) => (
                <tr key={r.role}>
                  <td className="py-3.5 px-5 font-semibold text-[#5C1622]">{r.role}</td>
                  <td className="py-3.5 px-4 text-[#3E3537]">{r.scope}</td>
                  <td className="py-3.5 px-5 text-xs font-mono text-[#6E6365]">{r.modules}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (tool === 'kpis' || tool === 'rosters') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <SectionHeader
          portalLabel={t.portals.hr}
          title={tool === 'kpis' ? 'Performance & KPIs' : 'Workforce Rosters'}
          subtitle={tool === 'kpis' ? 'Track quarterly KPI scores and onboarding completion.' : 'Weekly shift assignments across departments.'}
          onBack={() => setTool('hub')}
        />
        <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                <th className="py-3 px-5">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">{tool === 'kpis' ? 'KPI Score' : 'Shift Window'}</th>
                <th className="py-3 px-5">{tool === 'kpis' ? 'Onboarding' : 'Work Days'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAEA] text-sm">
              {data.employees.map((e) => (
                <tr key={e.id} className="hover:bg-[#FAF8F8]/70">
                  <td className="py-3 px-5 font-medium text-[#1A1415]">{e.name}</td>
                  <td className="py-3 px-4 text-[#6E6365]">{e.department}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-[#5C1622] font-semibold">
                    {tool === 'kpis' ? `${e.kpiScore ?? 85} / 100` : '09:00 – 17:30'}
                  </td>
                  <td className="py-3 px-5 text-xs text-[#3E3537] tabular-nums">
                    {tool === 'kpis' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[#F4F0F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#5C1622]" style={{ width: `${e.onboardingProgress ?? 100}%` }} />
                        </div>
                        <span>{e.onboardingProgress ?? 100}%</span>
                      </div>
                    ) : (
                      'Mon – Fri · HQ / Hybrid'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Generic HR Request List Views (leave, attendance, recruitment, onboarding/offboarding/handovers, kudos)
  const kindMap: Record<string, HrRequestKind> = {
    leave: 'leave',
    attendance: 'attendance',
    recruitment: 'recruitment',
    onboarding: 'checklist',
    offboarding: 'checklist',
    handovers: 'checklist',
    kudos: 'kudos',
  };
  const currentKind = kindMap[tool] || 'leave';
  const filteredReqs = data.hrRequests.filter((r) => {
    if (r.kind !== currentKind) return false;
    const q = search.toLowerCase();
    return !q || r.title.toLowerCase().includes(q) || r.subjectName.toLowerCase().includes(q);
  });

  const labelMap: Record<string, string> = {
    leave: 'Leave Requests',
    attendance: 'Attendance Logs',
    recruitment: 'Recruitment Pipeline',
    onboarding: 'Onboarding Checklists',
    offboarding: 'Offboarding Checklists',
    handovers: 'Role Handovers',
    kudos: 'Rewards & Kudos',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <SectionHeader
        portalLabel={t.portals.hr}
        title={labelMap[tool] || 'HR Workflows'}
        onBack={() => setTool('hub')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t.searchPlaceholder}
        primaryLabel="New Entry"
        onPrimaryClick={() =>
          openReqModal(
            currentKind,
            currentKind === 'attendance'
              ? 'Present'
              : currentKind === 'recruitment'
              ? 'Interview'
              : currentKind === 'kudos'
              ? 'Completed'
              : 'Pending'
          )
        }
      />

      {filteredReqs.length === 0 ? (
        <EmptyState
          message={t.noRecords}
          actionLabel={t.addFirst}
          onAction={() => openReqModal(currentKind)}
        />
      ) : (
        <div className="bg-white border border-[#E7DFDF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7DFDF] bg-[#FAF8F8] text-xs font-medium text-[#6E6365]">
                  <th className="py-3 px-5">Subject / Title</th>
                  <th className="py-3 px-4">Person</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAEA] text-sm">
                {filteredReqs.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF8F8]/70">
                    <td className="py-3 px-5">
                      <div className="font-medium text-[#1A1415]">{r.title}</div>
                      {r.detail && <div className="text-xs text-[#6E6365]">{r.detail}</div>}
                    </td>
                    <td className="py-3 px-4 text-[#3E3537]">
                      <div>{r.subjectName}</div>
                      <div className="text-xs text-[#6E6365]">{r.department}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs tabular-nums text-[#6E6365]">
                      {r.date || '—'}
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
                              onUpdateRecord('hrRequests', r.id, {
                                status: currentKind === 'checklist' ? 'Completed' : 'Approved',
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[#5C1622] hover:bg-[#450F18] rounded-md mr-1.5 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>{currentKind === 'checklist' ? 'Done' : t.approve}</span>
                          </button>
                          {currentKind === 'leave' && (
                            <button
                              type="button"
                              onClick={() => onUpdateRecord('hrRequests', r.id, { status: 'Rejected' })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#3E3537] bg-[#FAF8F8] border border-[#E7DFDF] rounded-md mr-1.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      )}
                      {r.status === 'Interview' && (
                        <button
                          type="button"
                          onClick={() => onUpdateRecord('hrRequests', r.id, { status: 'Hired' })}
                          className="mr-2 px-2.5 py-1 text-xs font-medium text-[#5C1622] bg-[#F8EFF1] rounded-md cursor-pointer"
                        >
                          Mark Hired
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteRecord('hrRequests', r.id)}
                        className="p-1.5 text-[#6E6365] hover:text-[#DC2626] rounded-md cursor-pointer"
                        aria-label="Delete HR record"
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

      {/* Employee Modal */}
      <Modal open={empModal} title={editingEmp ? 'Edit Employee' : 'Add Employee'} onClose={() => setEmpModal(false)}>
        <form onSubmit={saveEmp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input type="text" value={eName} onChange={(e) => setEName(e.target.value)} required maxLength={120} className={INPUT_CLS} />
            </Field>
            <Field label="Position" required>
              <input type="text" value={ePos} onChange={(e) => setEPos(e.target.value)} required maxLength={80} className={INPUT_CLS} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Department" required>
              <input type="text" value={eDept} onChange={(e) => setEDept(e.target.value)} required maxLength={80} className={INPUT_CLS} />
            </Field>
            <Field label="Role">
              <select value={eRole} onChange={(e) => setERole(e.target.value as EmployeeRole)} className={INPUT_CLS}>
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Staff">Staff</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Base Salary" required>
              <input type="number" min={0} value={eSalary} onChange={(e) => setESalary(e.target.value)} required className={INPUT_CLS} />
            </Field>
            <Field label="Status">
              <select value={eStatus} onChange={(e) => setEStatus(e.target.value as EmployeeStatus)} className={INPUT_CLS}>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Probation">Probation</option>
                <option value="Offboarded">Offboarded</option>
              </select>
            </Field>
            <Field label="KPI Score (0-100)">
              <input type="number" min={0} max={100} value={eKpi} onChange={(e) => setEKpi(e.target.value)} className={INPUT_CLS} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email">
              <input type="email" value={eEmail} onChange={(e) => setEEmail(e.target.value)} maxLength={160} className={INPUT_CLS} />
            </Field>
            <Field label="Phone">
              <input type="text" value={ePhone} onChange={(e) => setEPhone(e.target.value)} maxLength={40} className={INPUT_CLS} />
            </Field>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setEmpModal(false)} className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg cursor-pointer">
              {t.cancel}
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Department Modal */}
      <Modal open={deptModal} title={editingDept ? 'Edit Department' : 'Add Department'} onClose={() => setDeptModal(false)}>
        <form onSubmit={saveDept} className="space-y-4">
          <Field label="Department Name" required>
            <input type="text" value={dName} onChange={(e) => setDName(e.target.value)} required maxLength={100} className={INPUT_CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Department Lead">
              <input type="text" value={dMgr} onChange={(e) => setDMgr(e.target.value)} maxLength={100} className={INPUT_CLS} />
            </Field>
            <Field label="Monthly Budget" required>
              <input type="number" min={0} value={dBudget} onChange={(e) => setDBudget(e.target.value)} required className={INPUT_CLS} />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={2} value={dDesc} onChange={(e) => setDDesc(e.target.value)} maxLength={400} className={INPUT_CLS} />
          </Field>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setDeptModal(false)} className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg cursor-pointer">
              {t.cancel}
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* HR Request Modal */}
      <Modal open={reqModal} title="New HR Record" onClose={() => setReqModal(false)}>
        <form onSubmit={saveReq} className="space-y-4">
          <Field label="Title" required>
            <input type="text" value={rTitle} onChange={(e) => setRTitle(e.target.value)} required maxLength={160} className={INPUT_CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Person / Candidate" required>
              <input type="text" value={rSubject} onChange={(e) => setRSubject(e.target.value)} required maxLength={120} className={INPUT_CLS} />
            </Field>
            <Field label="Department">
              <input type="text" value={rDept} onChange={(e) => setRDept(e.target.value)} maxLength={80} className={INPUT_CLS} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date">
              <input type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} className={INPUT_CLS} />
            </Field>
            <Field label="Status">
              <select value={rStatus} onChange={(e) => setRStatus(e.target.value as HrRequestStatus)} className={INPUT_CLS}>
                <option value="Pending">Pending</option>
                <option value="Present">Present</option>
                <option value="Remote">Remote</option>
                <option value="Interview">Interview</option>
                <option value="Completed">Completed</option>
              </select>
            </Field>
          </div>
          <Field label="Details">
            <textarea rows={2} value={rDetail} onChange={(e) => setRDetail(e.target.value)} maxLength={600} className={INPUT_CLS} />
          </Field>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setReqModal(false)} className="px-4 py-2 text-xs font-medium text-[#3E3537] bg-white border border-[#E7DFDF] rounded-lg cursor-pointer">
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
