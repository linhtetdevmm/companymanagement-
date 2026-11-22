import { Timestamp } from 'firebase/firestore';

export type Language = 'en' | 'my';

export type PortalId =
  | 'launcher'
  | 'owner'
  | 'hr'
  | 'sales'
  | 'crm'
  | 'marketing'
  | 'finance';

export const BLUEPRINT_LIMITS = {
  idPattern: /^[a-zA-Z0-9_-]+$/,
  slugPattern: /^[a-z0-9-]+$/,
  maxName: 120,
  maxTitle: 160,
  maxEmail: 160,
  maxPhone: 40,
  maxShort: 80,
  maxDate: 32,
  maxNotes: 600,
  maxLongNotes: 800,
  maxBody: 1500,
} as const;

export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  currency: 'MMK' | 'USD';
  fiscalYear: string;
  tagline?: string;
  brandVoice?: string;
  mission?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type EmployeeRole = 'Owner' | 'Manager' | 'HR' | 'Sales' | 'Finance' | 'Staff';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Probation' | 'Offboarded';

export interface Employee {
  id: string;
  ownerId: string;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  position: string;
  role: EmployeeRole;
  baseSalary: number;
  joinDate?: string;
  status: EmployeeStatus;
  onboardingProgress?: number;
  kpiScore?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Department {
  id: string;
  ownerId: string;
  name: string;
  managerName?: string;
  budget: number;
  description?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type HrRequestKind = 'leave' | 'attendance' | 'recruitment' | 'kudos' | 'checklist';
export type HrRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Interview'
  | 'Hired'
  | 'Present'
  | 'Late'
  | 'Remote';

export interface HrRequest {
  id: string;
  ownerId: string;
  kind: HrRequestKind;
  title: string;
  subjectName: string;
  department?: string;
  date?: string;
  endDate?: string;
  detail?: string;
  status: HrRequestStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type InterestLevel = 'Hot' | 'Warm' | 'Cold';
export type LifecycleStage = 'Lead' | 'Active' | 'VIP' | 'Churned';

export interface Customer {
  id: string;
  ownerId: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  industry?: string;
  interestLevel: InterestLevel;
  lifecycleStage: LifecycleStage;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface Meeting {
  id: string;
  ownerId: string;
  title: string;
  customerName: string;
  dateTime: string;
  location?: string;
  status: MeetingStatus;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type LostReason = 'None' | 'Price' | 'Timing' | 'Competitor' | 'Scope';
export type PaymentStatus = 'Unpaid' | 'Pending Approval' | 'Paid';

export interface Deal {
  id: string;
  ownerId: string;
  title: string;
  customerName: string;
  assignee?: string;
  amount: number;
  stage: DealStage;
  lostReason: LostReason;
  paymentStatus: PaymentStatus;
  commissionRate: number;
  dueDate?: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type SalesDocKind = 'article' | 'thread' | 'target' | 'followup';

export interface SalesDoc {
  id: string;
  ownerId: string;
  kind: SalesDocKind;
  title: string;
  author?: string;
  body?: string;
  targetAmount?: number;
  period?: string;
  status?: 'Open' | 'Done' | 'Active';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type MarketingItemKind = 'product' | 'content' | 'campaign';
export type MarketingStatus = 'Active' | 'Draft' | 'Scheduled' | 'Published' | 'Paused' | 'Completed';

export interface MarketingItem {
  id: string;
  ownerId: string;
  kind: MarketingItemKind;
  title: string;
  channelOrCategory?: string;
  skuOrDate?: string;
  budgetOrPrice: number;
  spent?: number;
  leadsCount?: number;
  status: MarketingStatus;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type FinanceEntryKind =
  | 'cash'
  | 'journal'
  | 'claim'
  | 'receipt'
  | 'arap'
  | 'budget'
  | 'account'
  | 'rule';

export type FinanceDirection =
  | 'In'
  | 'Out'
  | 'Debit'
  | 'Credit'
  | 'AR'
  | 'AP'
  | 'Asset'
  | 'Liability'
  | 'Equity'
  | 'Revenue'
  | 'Expense'
  | 'Rule';

export type FinanceStatus = 'Pending' | 'Approved' | 'Rejected' | 'Settled' | 'Posted' | 'Active';

export interface FinanceEntry {
  id: string;
  ownerId: string;
  kind: FinanceEntryKind;
  date?: string;
  title: string;
  category?: string;
  direction: FinanceDirection;
  counterAccount?: string;
  amount: number;
  limitAmount?: number;
  status: FinanceStatus;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
