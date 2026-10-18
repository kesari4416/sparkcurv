/**
 * SparkCurv's own products. Every fact here comes from the products' own code and docs:
 *  - Sitera:    C:\Users\Dharun\Sitera-Basic (PROJECT-FLOW-MAP.md, memory/PRD.md, CLAUDE.md,
 *               backend/app/routers and models, frontend Layout.jsx) and Sitera-Basic-apk
 *               (PRODUCT.md). Where the role-workflow PDF and the code disagree, the code wins.
 *  - BuildNexa: C:\Users\Dharun\BuildNexa (CLAUDE.md, memory/docs/role_workflows.md, backend
 *               services) and its site C:\Users\Dharun\buildnexa-web (Roles, Compare, Process,
 *               Compliance, Faq), whose own copy is quoted where noted.
 * There are no testimonials, customer names, metrics or prices for either product: add them
 * only when they are real and cleared for publishing. Do not claim what the code doesn't do
 * (see the limits noted beside each product).
 */
import type { Faq } from './services';

export type ProductSlug = 'sitera' | 'buildnexa';

/** How a step reaches people. */
export type Channel = 'email' | 'whatsapp' | 'portal' | 'pdf' | 'ledger' | 'alert';

export type WalkStep = {
  label: string;
  who: string;
  what: string;
  /** What the step creates (a record or document). */
  creates: string;
  /** Numbering, when the product numbers it. */
  number?: string;
  statuses?: string[];
  approval?: string;
  notify?: Channel[];
};

export type Product = {
  slug: ProductSlug;
  name: string;
  /** The product's own tagline. */
  tagline: string;
  category: string;
  /** Who it's for (SparkCurv positioning: Sitera for growing firms, BuildNexa for large ones). */
  audience: string;
  /** One or two sentences for cards. */
  summary: string;
  hero: { lead: string; accent: string; description: string };
  /** Brand colour, used for glows, step markers and the preview's active item (never body text). */
  brand: string;
  /** Text colour that reads on `brand`. */
  onBrand: string;
  /** Official logo on a white plate (both logos are drawn for light backgrounds). */
  logo: { src: string; width: number; height: number };
  mark: { src: string; width: number; height: number };
  links: { signIn: { label: string; href: string }; site?: { label: string; href: string } };
  platforms: { name: string; detail: string }[];
  /** Four short points for the product cards. */
  highlights: string[];
  /** "Sound familiar?": the problem, and what the product does about it. */
  problems: { who?: string; pain: string; answer: string }[];
  /** Interactive walkthrough: one or more chains of steps. */
  walkthrough: { title: string; steps: WalkStep[] }[];
  /** "A day in the role" tabs. `pain` is quoted only when the product's own material states it. */
  days: { role: string; pain?: string; summary: string; uses: string[]; daily: string[]; approves?: string[] }[];
  /** One line listing every role, when the tabs don't cover them all. */
  allRoles?: string;
  modules: { title: string; items: string[] }[];
  /** Controls and integrations (BuildNexa). */
  extras?: { title: string; items: string[] }[];
  /** Getting started, in order. */
  setupHeading: { lead: string; accent: string };
  setup: { title: string; detail: string }[];
  data: { in: string[]; out: string[]; share: string[] };
  fit: { yes: string[]; other: string[] };
  builtFor?: string[];
  /** Show the leakage calculator (BuildNexa's own, from buildnexa.io). */
  calculator?: boolean;
  /** Interface preview: the app's real sidebar labels and one real workflow. */
  preview: {
    url: string;
    sidebar: string[];
    active: string;
    title: string;
    rows: { label: string; meta: string; status: string }[];
  };
  faqs: Faq[];
  seo: { title: string; description: string };
};

/*
 * Sitera limits (don't claim): Android only, no iOS; payroll without PF, ESI, PT or TDS;
 * no double-entry ledger yet; user invites and invoice emails are not sent by the server
 * (invoice "email" opens the user's mail app); leads are the only CSV import.
 */
const sitera: Product = {
  slug: 'sitera',
  name: 'Sitera',
  tagline: 'Building Excellence',
  category: 'Construction project management',
  audience: 'For growing contractors and construction firms',
  summary:
    'A construction project management portal that runs a job from the first lead to the final invoice, with client and vendor portals and an Android app for the site.',
  hero: {
    lead: 'From lead',
    accent: 'to cash.',
    description:
      'Sitera is a construction project management portal for growing contractors. Leads, estimates, projects, procurement, site attendance and finance live in one place, with portals for your clients and vendors and an Android app for the site.',
  },
  brand: '#F59E0B',
  onBrand: '#0F172A',
  logo: { src: '/images/products/sitera-logo.svg', width: 251, height: 64 },
  mark: { src: '/images/products/sitera-mark.svg', width: 64, height: 64 },
  links: { signIn: { label: 'Sign in at sitera.in', href: 'https://sitera.in' } },
  platforms: [
    { name: 'Web portal', detail: 'Every module, for the office, your clients and your vendors.' },
    { name: 'Android app', detail: 'Field ops, projects, inventory, leads, clients and finance on the go.' },
    { name: 'Made for India', detail: 'Rupee amounts in Indian digit grouping, Indian time and dd/mm/yyyy dates.' },
  ],
  highlights: [
    'Leads, estimates, projects and invoices in one flow',
    'Clients approve estimates and change orders without phone calls',
    'GPS check-in, labour attendance and field ops',
    'Web portal and Android app',
  ],
  problems: [
    {
      pain: 'Clients take days to sign off an estimate.',
      answer:
        'Send it from Sitera and the client approves or rejects it straight from the email, with no login. The link works once, expires in 14 days, and every decision is logged.',
    },
    {
      pain: 'Variations get argued about at the end of the job.',
      answer:
        'Change orders are numbered, versioned and approved by the client in their portal. The summary shows the original budget, approved variations and the revised contract value.',
    },
    {
      pain: 'Material leaves the store and nobody knows where it went.',
      answer:
        'Issues and transfers need an admin or procurement officer to approve, the issue log can’t be edited, and transfers still in transit after three days are flagged.',
    },
    {
      pain: 'Website and WhatsApp enquiries slip through.',
      answer:
        'Your enquiry form drops every submission into the pipeline as a new lead with a follow-up due in 24 hours, and a repeat enquiry lands on the existing lead.',
    },
    {
      pain: 'Vendors start work with lapsed insurance.',
      answer: 'Purchase orders and subcontracts can’t be approved while the vendor’s insurance certificate is missing or expired.',
    },
    {
      pain: 'Site attendance lives in paper registers.',
      answer:
        'Labour attendance is marked daily on the phone, and staff can only check in inside the office radius you set, with one-day site-visit exceptions approved by the admin.',
    },
  ],
  walkthrough: [
    {
      title: 'A job, lead to cash',
      steps: [
        {
          label: 'Lead',
          who: 'Any staff member; admins can import a CSV',
          what: 'Enquiries arrive by hand, from a CSV or from your website form. Duplicates are caught by phone or email, and every call, WhatsApp, meeting and site visit is logged against follow-up dates.',
          creates: 'Lead',
          statuses: ['New', 'Contacted', 'Qualified', 'Site visit', 'Proposal sent', 'Negotiation', 'Won'],
          notify: ['portal', 'whatsapp'],
        },
        {
          label: 'Client',
          who: 'Admin',
          what: 'A won lead converts into a new or existing client and keeps its history.',
          creates: 'Client record',
          notify: ['portal'],
        },
        {
          label: 'Estimate',
          who: 'Admin, accountant, site engineer or procurement officer',
          what: 'Requirement lines with prices, a phase, a category and a drawing. “Send for approval” emails the client a summary with Approve and Reject buttons.',
          creates: 'Estimate',
          statuses: ['Pending', 'Approved'],
          approval: 'The client, from a single-use link that expires in 14 days. No login needed.',
          notify: ['email'],
        },
        {
          label: 'Project',
          who: 'Admin creates it; site engineers update it',
          what: 'Approved estimates are linked to the project and bring their phases with them. Progress is posted per phase with photos, and a switch decides what the client sees.',
          creates: 'Project with phases',
          statuses: ['Planning', 'In progress', 'Completed'],
          notify: ['portal', 'alert'],
        },
        {
          label: 'Change order',
          who: 'Admin or site engineer',
          what: 'Raised as a client modification, rework, design change or site condition. Every revision is kept as a numbered version, and the payment receipt is emailed to the client.',
          creates: 'Change order',
          number: 'CO-<project>-001',
          statuses: ['Draft', 'Pending client review', 'Approved'],
          approval: 'The client in their portal, or the admin, with an explicit confirmation.',
          notify: ['portal', 'email'],
        },
        {
          label: 'Procurement',
          who: 'Admin and site engineers; procurement officers handle quotations',
          what: 'Bid packages invite vendors, who quote in their portal, and the admin awards the work. Procurement officers can also turn a vendor quotation into a PO and send it by email with the PDF, or on WhatsApp.',
          creates: 'Purchase order',
          number: 'PO-<project>-001',
          statuses: ['Draft', 'Pending approval', 'Approved', 'Partially received', 'Closed'],
          approval: 'The admin, and only while the vendor’s insurance certificate is current.',
          notify: ['portal', 'email', 'whatsapp', 'pdf'],
        },
        {
          label: 'Stock',
          who: 'Site engineers request; admin or procurement officer approves',
          what: 'Receipts, issues to projects and transfers between sites. A request notifies the approvers, the issue log can’t be edited, and transfers stuck in transit for three days are flagged.',
          creates: 'Stock movement',
          statuses: ['Pending', 'In transit', 'Posted'],
          approval: 'An admin or procurement officer. A procurement officer’s own postings are marked self-approved and the admins are told.',
          notify: ['portal'],
        },
        {
          label: 'Site',
          who: 'Site engineer',
          what: 'Daily labour attendance (present, half day, absent, leave), labour payments, and staff check-in inside the office radius. Blocked or delayed work alerts the admins.',
          creates: 'Attendance and progress',
          approval: 'Wages are paid by the admin or accountant; leave and site visits are approved by the admin.',
          notify: ['portal', 'alert'],
        },
        {
          label: 'Invoice',
          who: 'Admin or accountant',
          what: 'Recording client income raises a paid invoice automatically. Invoices print with your logo and go out on WhatsApp or by email, and overdue ones are flagged for you.',
          creates: 'Invoice',
          number: 'INV-<project>-001',
          statuses: ['Draft', 'Sent', 'Partial', 'Paid'],
          notify: ['pdf', 'whatsapp', 'email'],
        },
      ],
    },
  ],
  days: [
    {
      role: 'Admin',
      summary: 'Runs the company and signs off the big decisions.',
      uses: ['Dashboard', 'Projects', 'Leads', 'Clients', 'Users', 'Company Settings'],
      daily: ['Creates projects and links approved estimates', 'Converts won leads into clients', 'Decides which modules each person or role can open'],
      approves: ['Purchase orders, subcontracts and bid awards', 'Stock issues and transfers', 'Leave and site-visit requests', 'Change orders, alongside the client'],
    },
    {
      role: 'Accountant',
      summary: 'Keeps the money straight.',
      uses: ['Finance', 'Estimates', 'Clients', 'Leads', 'Assets', 'My Attendance'],
      daily: [
        'Records income and expenses; paid invoices are raised automatically',
        'Pays wages, subcontract payments and change orders',
        'Runs payroll and staff advances',
        'Pulls the company or project balance sheet for any period',
      ],
    },
    {
      role: 'Procurement officer',
      summary: 'Buys well and keeps the stores honest.',
      uses: ['Vendors', 'Inventory', 'Assets', 'Estimates', 'Leads'],
      daily: ['Keeps vendors and the product catalogue up to date', 'Turns vendor quotations into POs and sends them by email or WhatsApp', 'Receives, issues and moves stock'],
      approves: ['Stock issues and transfers requested from site'],
    },
    {
      role: 'Site engineer',
      summary: 'Runs the site, from the phone.',
      uses: ['Field Ops', 'Projects', 'Inventory', 'Estimates', 'Leads'],
      daily: [
        'Marks labour attendance and posts progress with photos',
        'Requests stock and records receipts',
        'Raises change orders and bid packages',
        'Checks in, and requests leave or a site visit',
        'Sees only the projects they are assigned to',
      ],
    },
    {
      role: 'Client',
      summary: 'Sees their project and approves what needs them.',
      uses: ['Dashboard', 'Projects', 'Field Ops (view)', 'AI Studio'],
      daily: ['Follows progress, and the updates and documents the team shares with them'],
      approves: ['Estimates, from the emailed link', 'Change orders, in the portal'],
    },
    {
      role: 'Vendor',
      summary: 'Quotes without the back and forth.',
      uses: ['Dashboard', 'Bid Invites'],
      daily: ['Sees only their own bid invites', 'Submits and updates quotes'],
    },
  ],
  modules: [
    {
      title: 'Sales and estimates',
      items: [
        'Leads from manual entry, CSV import or your website enquiry form, with follow-ups and an activity log',
        'Client records that carry over from the lead',
        'Estimates built from phases and requirements, approved by the client from an emailed link',
      ],
    },
    {
      title: 'Projects',
      items: [
        'Phases with progress, photos and a client-visible switch',
        'Versioned change orders with client approval and payment receipts',
        'Documents up to 20 MB, including drawings and archives',
        'A 3D viewer for models with pinned notes and photos',
      ],
    },
    {
      title: 'Site and people',
      items: [
        'Daily labour attendance and labour payments',
        'Staff check-in by GPS inside an office radius you set',
        'Leave and one-day site-visit requests, approved by the admin',
      ],
    },
    {
      title: 'Procurement and inventory',
      items: [
        'Bid packages: vendors quote in their portal, the admin awards',
        'Purchase orders and subcontracts, blocked while vendor insurance has lapsed',
        'Quotation POs sent by email with the PDF, or on WhatsApp',
        'Stock receipts, issues and transfers with approvals',
      ],
    },
    {
      title: 'Assets',
      items: [
        'Owned and rented equipment with automatic asset codes, usage log and rental cost',
        'A maintenance view that flags what needs attention or is due this week',
      ],
    },
    {
      title: 'Finance',
      items: [
        'Income and expense ledger',
        'Invoices with your logo, printed or shared on WhatsApp or email',
        'Payroll and staff salary advances',
        'Company and project balance sheets for any period, on screen, as PDF or Excel',
      ],
    },
  ],
  setupHeading: { lead: 'From demo', accent: 'to go-live.' },
  setup: [
    { title: 'Book a demo', detail: 'We walk you through Sitera with your own workflow in mind.' },
    { title: 'Your workspace', detail: 'We create your company with the modules you need, and your admin gets a welcome email with the sign-in link.' },
    { title: 'Company settings', detail: 'Upload your logo for invoices, set your office location and check-in radius, and edit lists like estimate categories and leave types.' },
    { title: 'Your team', detail: 'Add users, link client and vendor logins to their records, and set what each person or role can open.' },
    { title: 'Your pipeline', detail: 'Import leads from CSV (up to 2,000 rows, duplicates skipped) and put the enquiry form on your website or share it on WhatsApp.' },
  ],
  data: {
    in: [
      'Leads from CSV, with a downloadable template',
      'Website enquiries through a form you can embed or share',
      'Drawings and documents, including DWG and ZIP, up to 20 MB',
      '3D models (GLB or GLTF) up to 100 MB',
    ],
    out: [
      'Company and project balance sheets as PDF or Excel, for any period',
      'Change orders as PDF or Excel',
      'Monthly staff attendance as Excel',
      'Leads, stock issues and transfers as CSV',
      'Print-ready purchase orders, quotations and invoices',
    ],
    share: [
      'Estimate approval emails with Approve and Reject buttons',
      'Purchase orders to vendors by email with the PDF, or on WhatsApp',
      'Invoices on WhatsApp or by email',
      'Payment receipts for change orders, emailed to the client',
      'In-app alerts for new leads, stock requests, change orders and blocked work',
    ],
  },
  fit: {
    yes: [
      'You want leads, estimates, projects and invoices in one simple flow',
      'Clients should approve estimates and change orders without phone calls',
      'Your site team works from Android phones',
      'Vendors should quote in their own portal',
      'An income and expense ledger with a balance sheet for any period is enough for now',
    ],
    other: [
      'You need a double-entry general ledger with GST, TDS and Tally export',
      'Progress is tracked against a WBS with weightages, and billing follows % complete',
      'You run several companies or large EPC projects',
    ],
  },
  preview: {
    url: 'sitera.in/admin',
    sidebar: ['Dashboard', 'Projects', 'Field Ops', 'Leads', 'Clients', 'Finance', 'Estimates', 'AI Studio', 'Vendors', 'Inventory', 'Assets', 'Users'],
    active: 'Estimates',
    title: 'Who approves what',
    rows: [
      { label: 'Estimate', meta: 'From an emailed link, no login', status: 'Client' },
      { label: 'Change order', meta: 'In the client portal', status: 'Client' },
      { label: 'Purchase order', meta: 'Vendor insurance must be current', status: 'Admin' },
      { label: 'Stock transfer', meta: 'Requested from site', status: 'Procurement' },
      { label: 'Site visit and leave', meta: 'Requested by staff', status: 'Admin' },
    ],
  },
  faqs: [
    {
      q: 'Is there a mobile app?',
      a: 'Yes, for Android. It covers field ops, projects, inventory, leads, clients and finance. Estimates, AI Studio, user management and staff attendance are on the web portal. There is no iPhone app yet.',
    },
    {
      q: 'Do my clients and vendors need an account?',
      a: 'Clients can approve an estimate straight from the emailed link without signing in, and get a portal to follow their projects and approve change orders. Vendors get a portal for bid invites and quotes.',
    },
    {
      q: 'Can I control what each person sees?',
      a: 'Yes. Admins switch modules on or off for each user, or for a whole role at once, and site engineers only see the projects they are assigned to.',
    },
    {
      q: 'Can Sitera replace our accounting software?',
      a: 'Sitera keeps an income and expense ledger, invoices, payroll and a balance sheet for any period. It isn’t double-entry accounting, and payroll doesn’t yet handle PF, ESI or TDS. If you need that, look at BuildNexa.',
    },
    {
      q: 'Can we bring our existing leads?',
      a: 'Yes. Import them from a CSV using the template, up to 2,000 rows at a time. Duplicates are skipped.',
    },
    {
      q: 'How do we get started?',
      a: 'Book a demo. We walk you through Sitera, then set up your company workspace with the modules you need.',
    },
  ],
  seo: {
    title: 'Sitera | Construction Project Management Portal by SparkCurv',
    description:
      'Sitera is a construction project management portal for growing contractors: leads, estimates, projects, procurement, site attendance and finance, with client and vendor portals and an Android app.',
  },
};

/*
 * BuildNexa limits (don't claim, per buildnexa-web/README.md and the code): Joint Measurement,
 * Certify RA Bills and Site Measurements aren't built; no MS Project, AutoCAD, e-invoicing,
 * bank reconciliation, offline mode or native app; workbook import has no preview step; only
 * period close exists (no year-end entries); invoice auto-fill is for service bills only;
 * email and WhatsApp notifications need the scheduler switched on.
 */
const buildnexa: Product = {
  slug: 'buildnexa',
  name: 'BuildNexa',
  tagline: 'Construction ERP platform',
  category: 'Construction and solar EPC ERP',
  audience: 'For large contractors, EPC companies and multi-company groups',
  summary:
    'One system of record for construction and solar EPC delivery: WBS and daily progress, procure-to-pay, stores, client billing and the general ledger, all connected.',
  hero: {
    lead: 'Build smarter.',
    accent: 'Control every site.',
    description:
      'One system of record for construction and solar EPC delivery — WBS and daily progress, procure-to-pay, stores, client billing and the general ledger, all connected.',
  },
  brand: '#9A0129',
  onBrand: '#FEFEFE',
  logo: { src: '/images/products/buildnexa-logo.webp', width: 439, height: 360 },
  mark: { src: '/images/products/buildnexa-mark.webp', width: 139, height: 192 },
  links: {
    signIn: { label: 'Sign in at app.buildnexa.io', href: 'https://app.buildnexa.io' },
    site: { label: 'Visit buildnexa.io', href: 'https://buildnexa.io' },
  },
  platforms: [
    { name: 'Web app', detail: 'Works on desktop, tablet and phone screens.' },
    { name: 'Multi-company', detail: 'Companies and branches as masters, with inter-company loans in the ledger.' },
    { name: 'Made for India', detail: 'GST tax codes, TDS sections, Indian financial-year numbering and Tally export.' },
  ],
  highlights: [
    'WBS, daily progress reports and plan vs actual',
    'Procure-to-pay, from indent to payment, plus subcontracts',
    'Client RA bills from progress achieved',
    'General ledger with GST, TDS and Tally export',
  ],
  // Before → after rows from buildnexa.io (Compare.jsx), with the mechanism from the code.
  problems: [
    {
      pain: 'Job costs known only after month-end close.',
      answer: 'Live cost by project and cost code, every day. Receipts, subcontract bills and the equipment logbook book cost to the project as they post.',
    },
    {
      pain: 'Site updates scattered across WhatsApp and calls.',
      answer: 'Daily progress logged per site and activity. A daily progress report is drafted for every project each evening, ready for the site team to fill in.',
    },
    {
      pain: 'Stock counted in paper registers at each site.',
      answer: 'Multi-site stock, transfers and GRNs in one place, costed at weighted average.',
    },
    {
      pain: 'RA bills assembled manually in Excel.',
      answer: 'RA bills from contract value × % complete, drafted at month-end with retention and TDS defaults from the client master.',
    },
    {
      pain: 'Subcontractor bills checked line by line.',
      answer: 'Bills matched to work-order terms automatically: billed quantity can’t pass the certified quantity, and measurements can’t pass the work order by more than 10%.',
    },
    {
      pain: 'Approvals waiting days for a signature.',
      answer: 'Configurable approval workflows with full history. Each step is decided by a role, and approvers hear by email.',
    },
  ],
  walkthrough: [
    {
      title: 'Materials',
      steps: [
        {
          label: 'Indent',
          who: 'Project manager, or the project’s procurement member',
          what: 'The site’s need is raised against the project.',
          creates: 'Purchase indent',
          number: 'PI/FY2627/0001',
          statuses: ['Draft', 'Submitted', 'Approved'],
          approval: 'The roles named in your approval workflow',
          notify: ['email'],
        },
        {
          label: 'Requisition',
          who: 'Procurement',
          what: 'Drafted automatically from the indent, so nobody re-types the quantities.',
          creates: 'Purchase requisition',
          number: 'PR/FY2627/0001',
          statuses: ['Draft', 'Submitted', 'Approved', 'Converted'],
          approval: 'The roles named in your approval workflow',
          notify: ['email'],
        },
        {
          label: 'RFQ',
          who: 'Procurement',
          what: 'Vendor quotes are recorded side by side and the best one is marked Selected.',
          creates: 'Request for quotation',
          number: 'RFQ/FY2627/0001',
          statuses: ['Draft', 'Sent', 'Closed'],
        },
        {
          label: 'Purchase order',
          who: 'Procurement',
          what: 'Each line is tied to a WBS item, so ordered quantities show up in the project’s progress.',
          creates: 'Purchase order',
          number: 'PO/FY2627/0001',
          statuses: ['Draft', 'Submitted', 'Approved', 'Sent'],
          approval: 'Workflow steps, each decided by an organisation role',
          notify: ['email', 'pdf'],
        },
        {
          label: 'Goods receipt',
          who: 'Stores',
          what: 'Goods are received into a warehouse or straight to site, and inventory is posted to the ledger. The purchase bill is drafted for accounts.',
          creates: 'Goods receipt note',
          number: 'GRN/FY2627/0001',
          statuses: ['Draft', 'Posted'],
          notify: ['ledger', 'email'],
        },
        {
          label: 'Bill',
          who: 'Accounts',
          what: 'Checked three ways: billed quantity can’t exceed what was received, and the rate must stay within 2% of the PO unless someone records a reason. GST input is booked.',
          creates: 'Purchase bill',
          number: 'PBILL/FY2627/0001',
          statuses: ['Draft', 'Posted'],
          notify: ['ledger'],
        },
        {
          label: 'Payment',
          who: 'Accounts',
          what: 'Vendor payments and advances settle bills against the vendor ledger.',
          creates: 'Vendor payment',
          number: 'VPAY/FY2627/0001',
          statuses: ['Draft', 'Posted'],
          notify: ['ledger'],
        },
      ],
    },
    {
      title: 'Subcontracts',
      steps: [
        {
          label: 'Service requisition',
          who: 'Site team, project manager or procurement',
          what: 'The need for subcontracted work is raised against the project.',
          creates: 'Service requisition',
          number: 'SR/FY2627/0001',
          statuses: ['Draft', 'Submitted', 'Approved'],
          approval: 'Org admin',
        },
        {
          label: 'Work order',
          who: 'Procurement',
          what: 'Approval drafts one measurement sheet (JMR) for every line of the order.',
          creates: 'Work order',
          number: 'WO/FY2627/0001',
          statuses: ['Draft', 'Submitted', 'Approved'],
          approval: 'Workflow steps, each decided by an organisation role',
          notify: ['email'],
        },
        {
          label: 'Measurement (JMR)',
          who: 'Procurement or admin certifies',
          what: 'Measured quantities are certified. The running total can’t pass the work-order quantity by more than 10%, and certifying drafts the service bill for accounts.',
          creates: 'Contractor JMR',
          number: 'JMR/FY2627/0001',
          statuses: ['Draft', 'Certified'],
          notify: ['email'],
        },
        {
          label: 'Service bill',
          who: 'Accounts',
          what: 'Billed quantity can’t exceed what was certified. Posting books retention, TDS and the subcontract cost, and updates construction progress. Upload the contractor’s invoice and the bill is filled in for you to check.',
          creates: 'Service bill',
          number: 'SBILL/FY2627/0001',
          statuses: ['Draft', 'Posted'],
          notify: ['ledger'],
        },
      ],
    },
    {
      title: 'Client billing',
      steps: [
        {
          label: 'Daily progress',
          who: 'Site team; the project manager approves',
          what: 'A daily progress report is drafted for every project at 7 pm. The site records quantities, manpower, photos, issues and delays.',
          creates: 'Daily progress report',
          number: 'DPR/FY2627/0001',
          approval: 'Project manager',
          notify: ['portal', 'alert'],
        },
        {
          label: 'RA bill',
          who: 'Accounts',
          what: 'Drafted on the last day of the month: contract value × cumulative % complete, less what’s already been billed. Retention and TDS defaults come from the client master.',
          creates: 'RA bill',
          number: 'RABILL/FY2627/0001',
          statuses: ['Draft', 'Posted'],
          notify: ['ledger', 'email'],
        },
        {
          label: 'Client payment',
          who: 'Accounts',
          what: 'Receipts are allocated across the client’s bills and clear the receivable.',
          creates: 'Client receipt',
          number: 'CRECEIPT/FY2627/0001',
          statuses: ['Draft', 'Posted'],
          notify: ['ledger'],
        },
      ],
    },
  ],
  // Pains and answers quoted from buildnexa.io (Roles.jsx); duties from role_workflows.md.
  days: [
    {
      role: 'Admin & portfolio lead',
      pain: 'I only find out a project is behind when the month closes.',
      summary: 'The whole portfolio, live.',
      uses: ['Portfolio Overview', 'Executive dashboard', 'Cost to completion', 'Permission matrix', 'Audit log'],
      daily: [
        'Portfolio overview with progress and S-curve status',
        'Executive dashboard, cost to completion and aging',
        'Sets up companies, masters, users and approval workflows',
      ],
      approves: ['Purchasing, subcontract and receivables steps, where your workflow names them', 'Service requisitions (org admin)', 'Period close and reopen (org admin)'],
    },
    {
      role: 'Project manager',
      pain: 'Every site reports progress in a different spreadsheet.',
      summary: 'One WBS, rolled up automatically.',
      uses: ['WBS & Weightages', 'Plan vs Actual', 'Master Schedule', 'Estimates & Budgets', 'Alerts & Overdue'],
      daily: ['WBS and weightages from a template or Excel import', 'Plan vs actual and the master schedule', 'Alerts for overdue drawings, POs and deliveries', 'Records delays and manages project members'],
      approves: ['Daily progress reports', 'Labour attendance and bills'],
    },
    {
      role: 'Site team',
      pain: 'Evenings go into registers and WhatsApp updates.',
      summary: 'Log the day where the work happens.',
      uses: ['Construction DPR', 'Daily Progress Reports', 'Equipment Logbook', 'Site Expenses'],
      daily: [
        'Daily progress reports with manpower and photos',
        'Construction quantities, issues and delays',
        'Equipment logbook that books plant cost',
        'Labour attendance and service requisitions',
      ],
    },
    {
      role: 'Accounts',
      pain: 'RA bills and reconciliations swallow every month-end.',
      summary: 'Billing and books from the same records.',
      uses: ['Purchase Bills', 'Service Bills', 'Vendor Payments', 'General Ledger', 'Ledger & Tally export'],
      daily: [
        'Posts bills drafted from receipts and measurements, debit notes and client receipts',
        'Weekly: vendor payments and advances',
        'Month-end: RA bills, payroll, TDS challans, depreciation and journals',
        'Ledger and Tally export for the auditor',
      ],
    },
    {
      role: 'Procurement & stores',
      pain: 'We re-type the same quantities into four different sheets.',
      summary: 'Indent to payment in one chain.',
      uses: ['Purchase Orders', 'RFQs', 'Goods Receipt Notes', 'Warehouses', 'Pipeline'],
      daily: [
        'Indent, RFQ, PO and goods receipt with vendor quotes',
        'Stock, issues and transfers across warehouses',
        'Vendor ledger, advances and debit notes',
        'A pipeline board that flags stuck documents',
      ],
    },
  ],
  allRoles:
    'organisation roles Org admin, Portfolio lead, Accounts, Procurement, Stores, HR and Member, plus project roles Project manager, Engineering, Procurement, Site and Viewer.',
  modules: [
    {
      title: 'Projects and DPR',
      items: [
        'WBS and weightages, with WBS templates and Excel workbook import',
        'Engineering, materials and construction daily progress reports',
        'Plan vs actual, master schedule and Project 360',
        'Issues, delays and alerts; estimates, budgets and an equipment logbook',
      ],
    },
    {
      title: 'Procurement',
      items: [
        'Indent, requisition, RFQ, purchase order, goods receipt, bill and payment',
        'Service requisitions, work orders, contractor JMRs and service bills',
        'Vendor advances, vendor ledger and debit notes',
      ],
    },
    {
      title: 'Inventory and stores',
      items: ['Warehouses, receipts, goods issues and store returns', 'Adjustments and transfers, costed at weighted average'],
    },
    {
      title: 'Clients and billing',
      items: ['Leads, tenders, proposals and contracts', 'RA bills from cumulative progress, client advances, payments and ledger'],
    },
    {
      title: 'Finance and accounting',
      items: ['Chart of accounts, journals and monthly period close', 'Inter-company loans, financial statements and aging', 'Tally-compatible XML export'],
    },
    {
      title: 'Assets, plant and production',
      items: ['Asset register and depreciation, equipment and hire orders', 'Weighbridge, plants and BOM, production runs and dispatches'],
    },
    {
      title: 'HR and payroll',
      items: ['Employees, attendance and payroll runs'],
    },
    {
      title: 'Reports and governance',
      items: ['Executive dashboard, financial statements, aging and cost to completion', 'Agreements, statutory approvals with expiry alerts, cases and notices'],
    },
  ],
  extras: [
    {
      title: 'Controls',
      items: [
        'GST tax codes',
        'TDS for 194C, 194I, 194J and 194Q',
        'Approval workflows',
        'Document numbering by financial year',
        'Cancellations post reversal entries, never edits',
        'Nine integrity checks every night',
        'Closed periods reject postings',
        'Audit log',
      ],
    },
    {
      title: 'Works with',
      items: ['Tally (XML)', 'Excel workbook import', 'CSV export on every table', 'WhatsApp reminders', 'Email approvals and alerts', 'Invoice upload to fill in service bills'],
    },
  ],
  // Process steps quoted from buildnexa.io (Process.jsx).
  setupHeading: { lead: 'Every stage hands over', accent: 'to the next.' },
  setup: [
    { title: 'Organisation setup', detail: 'Companies, chart of accounts, tax codes, numbering and approval workflows.' },
    { title: 'Client & project', detail: 'Client with GSTIN and retention defaults, then the project and its contract value.' },
    { title: 'WBS & weightages', detail: 'Engineering, Procurement and Construction items whose weightages drive % complete.' },
    { title: 'Procure & build', detail: 'POs, GRNs, work orders and JMRs post straight into the DPR.' },
    { title: 'Bill & collect', detail: 'RA bills on cumulative % complete, client payments and the client ledger.' },
    { title: 'Close & audit', detail: 'Period close, financial statements and a Tally export for your auditor.' },
  ],
  data: {
    in: [
      'Excel DPR workbooks: WBS, engineering, materials and construction status, plan vs actual, Gantt, issues and resources. Re-running updates rows instead of duplicating them.',
      'WBS templates from the Setup Library, including a Solar EPC template that scales with plant size',
      'Contractor invoices as PDF or photo, read into service bills for you to check',
    ],
    out: [
      'Tally-compatible XML of posted vouchers for any date range',
      'CSV export on every table',
      'Reports in Excel and PDF, with saved filters and schedules: trial balance, P&L, balance sheet, aging, cost to completion and more',
    ],
    share: [
      'Email when an approval is waiting or decided',
      'Bills drafted from receipts and measurements, sent to accounts',
      'Morning alerts for overdue items, escalated from the project manager to admins',
      'WhatsApp and email reminders, including TDS on the 5th of each month',
    ],
  },
  fit: {
    yes: [
      'You run several projects, sites or group companies at once',
      'Progress is tracked against a WBS with weightages, and client billing follows % complete',
      'You need procure-to-pay with stores, goods receipts and three-way matching',
      'Subcontractors are paid on measured, certified quantities',
      'Your accountants want a double-entry ledger, GST, TDS and Tally export',
    ],
    other: [
      'You’re a growing contractor that wants leads, estimates and projects in one simple flow',
      'Clients and vendors should log in to approve and quote',
      'Your site team wants an Android app',
    ],
  },
  builtFor: [
    'General contractors',
    'Real estate developers',
    'Infrastructure',
    'Solar EPC',
    'Engineering firms',
    'Subcontractors',
    'Industrial projects',
    'Multi-company groups',
  ],
  calculator: true,
  preview: {
    url: 'app.buildnexa.io',
    sidebar: ['Portfolio Overview', 'WBS & Weightages', 'Construction DPR', 'Plan vs Actual', 'Purchase Orders', 'Goods Receipt Notes', 'Contractor JMRs', 'Warehouses', 'General Ledger', 'Approval Workflows'],
    active: 'Purchase Orders',
    title: 'Procure-to-pay',
    rows: [
      { label: 'Purchase indent', meta: 'Site raises the need', status: 'Indent' },
      { label: 'RFQ and quotes', meta: 'Procurement compares vendors', status: 'RFQ' },
      { label: 'Purchase order', meta: 'PO/FY2627/0001', status: 'Approval' },
      { label: 'Goods receipt note', meta: 'Stores receives on site', status: 'GRN' },
      { label: 'Bill and payment', meta: 'Accounts posts to the ledger', status: 'Ledger' },
    ],
  },
  // From buildnexa.io (Faq.jsx), corrected where the code differs (no import preview step).
  faqs: [
    {
      q: 'Can we bring our Excel DPR trackers?',
      a: 'Yes. Workbook Import reads your .xlsx — WBS items, scope quantities and dates — and reports what it created sheet by sheet. Running it again updates rows instead of duplicating them. WBS templates are also available from the Setup Library.',
    },
    {
      q: 'Does it work with Tally?',
      a: 'Yes. Ledger & Tally Export exports the period’s vouchers as Tally-compatible XML for your statutory auditor.',
    },
    {
      q: 'How are RA bills calculated?',
      a: 'At project level: contract value × cumulative % complete, less what has already been billed. Retention and TDS defaults come from the client master, so nobody re-types them.',
    },
    {
      q: 'What if something is posted by mistake?',
      a: 'Cancel it. The cancel guard first checks that nothing downstream still depends on it, then posts a reversal entry (never an edit), reverses any stock movement and recomputes the linked DPR quantities.',
    },
    {
      q: 'Who sees what?',
      a: 'Each user has one organisation role — Org admin, Portfolio lead, Accounts, Procurement, Stores, HR or Member — plus project roles such as Project manager, Engineering, Procurement, Site or Viewer.',
    },
    {
      q: 'Is BuildNexa only for solar projects?',
      a: 'No. BuildNexa started with solar EPC delivery, and the same WBS, procurement, inventory and finance modules run building, infrastructure and other construction projects.',
    },
    {
      q: 'Is there a mobile app?',
      a: 'BuildNexa is a web app that works on desktop, tablet and phone screens. There is no separate native app.',
    },
  ],
  seo: {
    title: 'BuildNexa | Construction & Solar EPC ERP by SparkCurv',
    description:
      'BuildNexa is a construction and solar EPC ERP: WBS and daily progress, procure-to-pay, stores, client RA billing and the general ledger, with GST, TDS and Tally export.',
  },
};

export const products: Product[] = [sitera, buildnexa];

export const findProduct = (slug: string) => products.find((p) => p.slug === slug);
