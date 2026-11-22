import { collection, doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { clampStr, sanitizeId, sanitizeSlug } from '../utils/format';

export async function bootstrapWorkspace(
  uid: string,
  displayName: string,
  companyName?: string
): Promise<string> {
  const workspaceId = sanitizeId(`ws_${uid}`);
  const wsPath = `workspaces/${workspaceId}`;
  const resolvedName = clampStr(companyName || `${displayName.split(' ')[0] || 'Apex'} Enterprise`, 120);

  try {
    await setDoc(doc(db, 'workspaces', workspaceId), {
      ownerId: uid,
      name: resolvedName,
      slug: sanitizeSlug(resolvedName),
      currency: 'MMK',
      fiscalYear: 'FY 2026',
      tagline: 'Precision execution across every department.',
      brandVoice: 'Clear, decisive, accountable, and customer-first.',
      mission: 'Deliver reliable value to clients while empowering teams with transparent tools.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, wsPath);
  }

  const batch = writeBatch(db);
  const now = serverTimestamp();

  const addSeed = (subcol: string, data: Record<string, unknown>) => {
    const ref = doc(collection(db, 'workspaces', workspaceId, subcol));
    batch.set(ref, {
      ownerId: uid,
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  };

  // Departments
  addSeed('departments', {
    name: 'Executive & Operations',
    managerName: displayName || 'Managing Director',
    budget: 18000000,
    description: 'Company strategy, governance, and cross-functional operations.',
  });
  addSeed('departments', {
    name: 'People & HR',
    managerName: 'Hnin Wai Lwin',
    budget: 9500000,
    description: 'Talent acquisition, payroll administration, attendance, and culture.',
  });
  addSeed('departments', {
    name: 'Sales & Commercial',
    managerName: 'Kyaw Zin Htet',
    budget: 14000000,
    description: 'Enterprise pipeline, client accounts, orders, and renewals.',
  });
  addSeed('departments', {
    name: 'Marketing & Brand',
    managerName: 'Su Myat Noe',
    budget: 11000000,
    description: 'Product catalog, content calendar, campaigns, and lead generation.',
  });
  addSeed('departments', {
    name: 'Finance & Accounting',
    managerName: 'Aung Thu Ya',
    budget: 12000000,
    description: 'Cashflow control, general ledger, budgeting, and compliance.',
  });

  // Employees
  addSeed('employees', {
    name: displayName || 'Phyoe Thuta',
    email: 'owner@company.io',
    phone: '+95 9 4210 88900',
    department: 'Executive & Operations',
    position: 'Managing Director',
    role: 'Owner',
    baseSalary: 4500000,
    joinDate: '2024-01-15',
    status: 'Active',
    onboardingProgress: 100,
    kpiScore: 96,
  });
  addSeed('employees', {
    name: 'Hnin Wai Lwin',
    email: 'hninwai@company.io',
    phone: '+95 9 7981 22014',
    department: 'People & HR',
    position: 'HR Lead',
    role: 'HR',
    baseSalary: 2200000,
    joinDate: '2024-03-01',
    status: 'Active',
    onboardingProgress: 100,
    kpiScore: 92,
  });
  addSeed('employees', {
    name: 'Kyaw Zin Htet',
    email: 'kyawzin@company.io',
    phone: '+95 9 2501 94832',
    department: 'Sales & Commercial',
    position: 'Senior Account Executive',
    role: 'Sales',
    baseSalary: 2400000,
    joinDate: '2024-05-10',
    status: 'Active',
    onboardingProgress: 100,
    kpiScore: 94,
  });
  addSeed('employees', {
    name: 'Su Myat Noe',
    email: 'sumyat@company.io',
    phone: '+95 9 9644 11380',
    department: 'Marketing & Brand',
    position: 'Marketing Strategist',
    role: 'Manager',
    baseSalary: 1950000,
    joinDate: '2024-08-19',
    status: 'Active',
    onboardingProgress: 100,
    kpiScore: 89,
  });
  addSeed('employees', {
    name: 'Aung Thu Ya',
    email: 'aungthuya@company.io',
    phone: '+95 9 4412 67055',
    department: 'Finance & Accounting',
    position: 'Senior Accountant',
    role: 'Finance',
    baseSalary: 2600000,
    joinDate: '2024-02-12',
    status: 'Active',
    onboardingProgress: 100,
    kpiScore: 95,
  });
  addSeed('employees', {
    name: 'Min Khant Zaw',
    email: 'minkhant@company.io',
    phone: '+95 9 7731 55201',
    department: 'Sales & Commercial',
    position: 'Sales Coordinator',
    role: 'Staff',
    baseSalary: 1200000,
    joinDate: '2026-10-01',
    status: 'Probation',
    onboardingProgress: 75,
    kpiScore: 84,
  });

  // HR Requests (Leaves, Attendance, Recruitment, Checklists, Kudos)
  addSeed('hrRequests', {
    kind: 'leave',
    title: 'Annual Leave — 2 Days',
    subjectName: 'Su Myat Noe',
    department: 'Marketing & Brand',
    date: '2026-11-20',
    endDate: '2026-11-21',
    detail: 'Family travel to Bagan; campaign posts already scheduled.',
    status: 'Pending',
  });
  addSeed('hrRequests', {
    kind: 'attendance',
    title: 'Morning Check-In (08:52)',
    subjectName: 'Kyaw Zin Htet',
    department: 'Sales & Commercial',
    date: '2026-11-15',
    detail: 'HQ Office — On time',
    status: 'Present',
  });
  addSeed('hrRequests', {
    kind: 'attendance',
    title: 'Remote Check-In (09:00)',
    subjectName: 'Aung Thu Ya',
    department: 'Finance & Accounting',
    date: '2026-11-15',
    detail: 'Monthly audit reconciliation',
    status: 'Remote',
  });
  addSeed('hrRequests', {
    kind: 'recruitment',
    title: 'Junior Financial Analyst',
    subjectName: 'Thiri Shwe Sin',
    department: 'Finance & Accounting',
    date: '2026-11-18',
    detail: '3 years accounting software experience, passed technical test.',
    status: 'Interview',
  });
  addSeed('hrRequests', {
    kind: 'checklist',
    title: 'Onboarding: Workstation & ERP Access',
    subjectName: 'Min Khant Zaw',
    department: 'Sales & Commercial',
    date: '2026-11-15',
    detail: 'Issue corporate email, CRM access template, and handbook.',
    status: 'Pending',
  });
  addSeed('hrRequests', {
    kind: 'kudos',
    title: 'Q4 Deal Closing Excellence',
    subjectName: 'Kyaw Zin Htet',
    department: 'Sales & Commercial',
    date: '2026-11-14',
    detail: 'Closed 2 enterprise retainers ahead of monthly quota.',
    status: 'Completed',
  });

  // CRM Customers
  addSeed('customers', {
    name: 'U Zaw Min Tun',
    company: 'Shwe Taung Retail Group',
    email: 'zawmin@shwetaung.mm',
    phone: '+95 9 5120 4419',
    industry: 'Retail & Distribution',
    interestLevel: 'Hot',
    lifecycleStage: 'VIP',
    notes: 'Multi-branch ERP rollout across 6 Yangon outlets.',
  });
  addSeed('customers', {
    name: 'Daw Aye Chan Mya',
    company: 'Mandalay Horizon Logistics',
    email: 'ayechan@horizonlogistics.mm',
    phone: '+95 9 4011 8832',
    industry: 'Logistics',
    interestLevel: 'Hot',
    lifecycleStage: 'Active',
    notes: 'Interested in fleet expense tracking & automated AR invoicing.',
  });
  addSeed('customers', {
    name: 'Ko Hein Htet Aung',
    company: 'Irrawaddy Coffee Roasters',
    email: 'hein@irrawaddycoffee.com',
    phone: '+95 9 7822 1039',
    industry: 'Food & Beverage',
    interestLevel: 'Warm',
    lifecycleStage: 'Lead',
    notes: 'Requested product catalog & wholesale pricing sheet.',
  });

  // CRM Meetings
  addSeed('meetings', {
    title: 'Q4 Contract Renewal & Scope Review',
    customerName: 'Shwe Taung Retail Group',
    dateTime: '2026-11-17 10:30',
    location: 'Junction City Tower, Suite 904',
    status: 'Scheduled',
    notes: 'Present annual license discount and onboarding timeline.',
  });
  addSeed('meetings', {
    title: 'Finance Module Walkthrough',
    customerName: 'Mandalay Horizon Logistics',
    dateTime: '2026-11-18 14:00',
    location: 'Google Meet',
    status: 'Scheduled',
    notes: 'Demo Cash Flow Control & AR/AP reconciliation.',
  });

  // Sales Deals
  addSeed('deals', {
    title: 'Annual Distribution Suite License',
    customerName: 'Shwe Taung Retail Group',
    assignee: 'Kyaw Zin Htet',
    amount: 18500000,
    stage: 'Won',
    lostReason: 'None',
    paymentStatus: 'Paid',
    commissionRate: 5,
    dueDate: '2026-11-10',
    notes: 'Full upfront annual settlement received.',
  });
  addSeed('deals', {
    title: 'Fleet & Warehouse Billing Package',
    customerName: 'Mandalay Horizon Logistics',
    assignee: 'Kyaw Zin Htet',
    amount: 12000000,
    stage: 'Won',
    lostReason: 'None',
    paymentStatus: 'Pending Approval',
    commissionRate: 5,
    dueDate: '2026-11-16',
    notes: 'Bank transfer slip uploaded; awaiting Finance/Owner verification.',
  });
  addSeed('deals', {
    title: 'POS & Inventory Starter Rollout',
    customerName: 'Irrawaddy Coffee Roasters',
    assignee: 'Min Khant Zaw',
    amount: 6500000,
    stage: 'Proposal',
    lostReason: 'None',
    paymentStatus: 'Unpaid',
    commissionRate: 4,
    dueDate: '2026-11-28',
    notes: 'Proposal delivered; follow-up scheduled next week.',
  });
  addSeed('deals', {
    title: 'Regional Supply Portal Q3 Bid',
    customerName: 'Delta Agro Trading',
    assignee: 'Kyaw Zin Htet',
    amount: 9000000,
    stage: 'Lost',
    lostReason: 'Timing',
    paymentStatus: 'Unpaid',
    commissionRate: 5,
    dueDate: '2026-10-30',
    notes: 'Client postponed digital transformation until Q1 next year.',
  });

  // SalesDocs (Targets, Follow-ups, Knowledge Articles, Staff Threads)
  addSeed('salesDocs', {
    kind: 'target',
    title: 'November 2026 Company Revenue Quota',
    author: 'Kyaw Zin Htet',
    body: 'Monthly recurring & new contract revenue target across all commercial reps.',
    targetAmount: 40000000,
    period: '2026-11',
    status: 'Active',
  });
  addSeed('salesDocs', {
    kind: 'followup',
    title: 'Send revised SLA terms to Mandalay Horizon',
    author: 'Kyaw Zin Htet',
    body: 'Confirm support response window before payment approval.',
    period: '2026-11-16',
    status: 'Open',
  });
  addSeed('salesDocs', {
    kind: 'article',
    title: 'Enterprise Pricing & Volume Discount Playbook',
    author: 'Phyoe Thuta',
    body: 'Standard discount ceilings: up to 8% for annual upfront contracts; >10% requires Owner sign-off.',
    period: 'Updated Nov 2026',
    status: 'Active',
  });
  addSeed('salesDocs', {
    kind: 'thread',
    title: 'Shwe Taung Phase-2 Branch Expansion Notes',
    author: 'Kyaw Zin Htet',
    body: 'Client confirmed 2 extra regional depots in Naypyidaw for December onboarding.',
    period: '2026-11-15',
    status: 'Open',
  });

  // Marketing Items
  addSeed('marketingItems', {
    kind: 'product',
    title: 'Claret Enterprise ERP Suite (Annual)',
    channelOrCategory: 'Software License',
    skuOrDate: 'SKU-ERP-01',
    budgetOrPrice: 15000000,
    spent: 0,
    leadsCount: 14,
    status: 'Active',
    notes: 'Full 6-portal enterprise license with unlimited records.',
  });
  addSeed('marketingItems', {
    kind: 'product',
    title: 'Multi-Branch POS & Inventory Add-on',
    channelOrCategory: 'Add-on Module',
    skuOrDate: 'SKU-POS-04',
    budgetOrPrice: 4500000,
    spent: 0,
    leadsCount: 9,
    status: 'Active',
    notes: 'Real-time branch stock sync and barcode checkout.',
  });
  addSeed('marketingItems', {
    kind: 'content',
    title: 'Year-End Cashflow Discipline Checklist (Carousel)',
    channelOrCategory: 'Facebook & LinkedIn',
    skuOrDate: '2026-11-19',
    budgetOrPrice: 350000,
    spent: 150000,
    leadsCount: 28,
    status: 'Scheduled',
    notes: 'Designed in white and deep burgundy editorial brand template.',
  });
  addSeed('marketingItems', {
    kind: 'campaign',
    title: 'Q4 B2B Operations Upgrade Campaign',
    channelOrCategory: 'Meta & Search Ads',
    skuOrDate: '2026-11-01',
    budgetOrPrice: 4000000,
    spent: 2350000,
    leadsCount: 64,
    status: 'Active',
    notes: 'Targeting SME directors in Yangon & Mandalay.',
  });

  // Finance Entries
  addSeed('financeEntries', {
    kind: 'cash',
    date: '2026-11-10',
    title: 'Shwe Taung Retail Annual Settlement',
    category: 'Sales Revenue',
    direction: 'In',
    counterAccount: '1010 · KBZ Corporate Bank',
    amount: 18500000,
    status: 'Posted',
    notes: 'Matched with Won deal.',
  });
  addSeed('financeEntries', {
    kind: 'cash',
    date: '2026-11-12',
    title: 'Opening Working Capital Reserve',
    category: 'Capital & Treasury',
    direction: 'In',
    counterAccount: '1010 · KBZ Corporate Bank',
    amount: 25000000,
    status: 'Posted',
    notes: 'Q4 operating float.',
  });
  addSeed('financeEntries', {
    kind: 'cash',
    date: '2026-11-05',
    title: 'Yangon HQ Office Lease (November)',
    category: 'Facilities & Rent',
    direction: 'Out',
    counterAccount: '5020 · Office Rent Expense',
    amount: 3200000,
    status: 'Posted',
    notes: 'Monthly lease transfer.',
  });
  addSeed('financeEntries', {
    kind: 'cash',
    date: '2026-11-08',
    title: 'Q4 Paid Media Ad Spend',
    category: 'Marketing & Growth',
    direction: 'Out',
    counterAccount: '5040 · Marketing Expense',
    amount: 2350000,
    status: 'Posted',
    notes: 'Meta & Search campaigns.',
  });
  addSeed('financeEntries', {
    kind: 'claim',
    date: '2026-11-14',
    title: 'Mandalay Client Visit Travel Advance',
    category: 'Travel & Transport',
    direction: 'Out',
    counterAccount: 'Kyaw Zin Htet',
    amount: 450000,
    status: 'Pending',
    notes: 'Flight & hotel for Mandalay Horizon walkthrough.',
  });
  addSeed('financeEntries', {
    kind: 'receipt',
    date: '2026-11-13',
    title: 'Fiber Internet & Cloud Hosting Invoice',
    category: 'IT & Infrastructure',
    direction: 'Out',
    counterAccount: '5030 · Software & Cloud',
    amount: 380000,
    status: 'Approved',
    notes: 'Receipt #INV-8821 verified.',
  });
  addSeed('financeEntries', {
    kind: 'arap',
    date: '2026-11-16',
    title: 'Mandalay Horizon Logistics — Invoice #AR-209',
    category: 'Receivable',
    direction: 'AR',
    counterAccount: 'Mandalay Horizon Logistics',
    amount: 12000000,
    status: 'Pending',
    notes: 'Due upon payment approval.',
  });
  addSeed('financeEntries', {
    kind: 'arap',
    date: '2026-11-22',
    title: 'Creative Print & Brand Kit Vendor',
    category: 'Payable',
    direction: 'AP',
    counterAccount: 'Studio Nine Print House',
    amount: 650000,
    status: 'Pending',
    notes: 'Net-15 vendor invoice.',
  });
  addSeed('financeEntries', {
    kind: 'budget',
    date: '2026-11',
    title: 'Marketing & Growth',
    category: 'Marketing & Growth',
    direction: 'Expense',
    counterAccount: 'Marketing & Brand',
    amount: 2350000,
    limitAmount: 5000000,
    status: 'Active',
    notes: 'Monthly cap for ads and creative production.',
  });
  addSeed('financeEntries', {
    kind: 'budget',
    date: '2026-11',
    title: 'Facilities & Rent',
    category: 'Facilities & Rent',
    direction: 'Expense',
    counterAccount: 'Executive & Operations',
    amount: 3200000,
    limitAmount: 4000000,
    status: 'Active',
    notes: 'HQ rent, utilities, and security.',
  });
  addSeed('financeEntries', {
    kind: 'journal',
    date: '2026-11-10',
    title: 'JE-2026-011 · Record Shwe Taung Annual License Revenue',
    category: '1010 · KBZ Corporate Bank',
    direction: 'Debit',
    counterAccount: '4010 · Software & Service Revenue',
    amount: 18500000,
    status: 'Posted',
    notes: 'Dr. Bank 18,500,000 / Cr. Revenue 18,500,000',
  });
  addSeed('financeEntries', {
    kind: 'account',
    date: '1010',
    title: '1010 · KBZ Corporate Bank',
    category: 'Current Asset',
    direction: 'Asset',
    counterAccount: 'Debit Normal',
    amount: 37950000,
    status: 'Active',
    notes: 'Primary operating bank account.',
  });
  addSeed('financeEntries', {
    kind: 'account',
    date: '4010',
    title: '4010 · Software & Service Revenue',
    category: 'Operating Revenue',
    direction: 'Revenue',
    counterAccount: 'Credit Normal',
    amount: 18500000,
    status: 'Active',
    notes: 'Enterprise annual licenses and setup fees.',
  });
  addSeed('financeEntries', {
    kind: 'account',
    date: '5020',
    title: '5020 · Facilities & Operating Expenses',
    category: 'Operating Expense',
    direction: 'Expense',
    counterAccount: 'Debit Normal',
    amount: 5930000,
    status: 'Active',
    notes: 'Rent, marketing, IT, and utilities.',
  });
  addSeed('financeEntries', {
    kind: 'rule',
    date: 'Rule-01',
    title: 'Operating Expense Reserve (50%)',
    category: '50%',
    direction: 'Rule',
    counterAccount: 'Payroll & Office Rent',
    amount: 50,
    limitAmount: 5000000,
    status: 'Active',
    notes: 'Auto-allocate 50% of incoming cash to operating reserve; alert if balance < 5,000,000.',
  });
  addSeed('financeEntries', {
    kind: 'rule',
    date: 'Rule-02',
    title: 'Tax & Statutory Reserve (15%)',
    category: '15%',
    direction: 'Rule',
    counterAccount: 'Tax Escrow Account',
    amount: 15,
    limitAmount: 2000000,
    status: 'Active',
    notes: 'Ring-fence 15% of net sales revenue for quarterly tax filing.',
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${wsPath}/seedBatch`);
  }

  return workspaceId;
}
