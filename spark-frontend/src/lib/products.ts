/**
 * SparkCurv's own products. Every fact here comes from the products' own code and docs:
 *  - Sitera:    C:\Users\Dharun\Sitera-Basic (PROJECT-FLOW-MAP.md, memory/PRD.md, CLAUDE.md,
 *               frontend/src/components/Layout.jsx) and Sitera-Basic-apk (PRODUCT.md, pubspec.yaml).
 *  - BuildNexa: C:\Users\Dharun\BuildNexa (CLAUDE.md, navConfig.js) and its site
 *               C:\Users\Dharun\buildnexa-web (Hero, About, Modules, Compliance, Roles, Faq).
 * There are no testimonials, customer names, metrics or prices for either product: add them
 * only when they are real and cleared for publishing.
 */
import type { Faq } from './services';

export type ProductSlug = 'sitera' | 'buildnexa';

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
  flows: { title: string; steps: { label: string; note?: string }[] }[];
  modules: { title: string; items: string[] }[];
  roles: { group?: string; items: { name: string; does: string }[] }[];
  builtFor?: string[];
  /** Controls and integrations (BuildNexa). */
  extras?: { title: string; items: string[] }[];
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
    { name: 'Made for India', detail: 'Rupee amounts in Indian digit grouping, and Indian time.' },
  ],
  highlights: [
    'Leads, estimates, projects and invoices in one flow',
    'Clients approve estimates and change orders from a link',
    'GPS check-in, labour attendance and field ops',
    'Web portal and Android app',
  ],
  flows: [
    {
      title: 'Lead to cash',
      steps: [
        { label: 'Lead', note: 'Entered by hand, imported from CSV or captured by your enquiry form' },
        { label: 'Client', note: 'The lead converts with its history' },
        { label: 'Estimate', note: 'Phases and requirements; the client approves from an emailed link' },
        { label: 'Project', note: 'Phases, progress and change orders' },
        { label: 'Procure', note: 'Bids, purchase orders and stock' },
        { label: 'Site', note: 'Labour attendance and payments' },
        { label: 'Invoice', note: 'Raised, shared on WhatsApp or email, and booked' },
      ],
    },
  ],
  modules: [
    {
      title: 'Sales and estimates',
      items: [
        'Leads from manual entry, CSV import or your website enquiry form, with follow-ups',
        'Client records that carry over from the lead',
        'Estimates built from phases and requirements, approved by the client from an emailed link',
      ],
    },
    {
      title: 'Projects',
      items: [
        'Phases with progress updates that move each phase forward',
        'Change orders sent to the client for approval',
        'Employees, subcontractors and equipment per project',
        'A 3D viewer for project drawings (GLB and GLTF)',
      ],
    },
    {
      title: 'Site and people',
      items: [
        'Daily labour attendance with present, absent and leave counts, and labour payments',
        'Staff check-in by GPS inside an office radius you set',
        'One-day site-visit requests and leave, approved by the admin',
      ],
    },
    {
      title: 'Procurement and inventory',
      items: [
        'Vendor catalogue, bid packages, bid comparison and award',
        'Purchase orders and subcontracts; quotation POs printed, emailed or shared by WhatsApp link',
        'Stock receipts, issues to projects and transfers between sites, with approvals',
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
        'Invoices with your company logo, printed, emailed or shared on WhatsApp',
        'Payroll and staff salary advances',
        'Company and project balance sheets for any period, on screen, as PDF or Excel',
      ],
    },
    {
      title: 'Control',
      items: [
        'Switch modules on or off per user, or for a whole role at once',
        'Company settings for your logo and office location',
        'AI Studio for concept images and draft cost estimates',
      ],
    },
  ],
  roles: [
    {
      items: [
        { name: 'Admin', does: 'Runs the company: users, approvals and every module.' },
        { name: 'Accountant', does: 'Ledger, invoices, payroll and balance sheets; approves estimates, change orders and POs.' },
        { name: 'Procurement officer', does: 'Vendors, bids, purchase orders and inventory.' },
        { name: 'Site engineer', does: 'Their assigned projects: attendance, progress, material requests, own check-in and leave.' },
        { name: 'Client', does: 'Follows their own projects, mostly read-only, and approves estimates and change orders.' },
        { name: 'Vendor', does: 'Receives bid invites and submits quotes.' },
      ],
    },
  ],
  preview: {
    url: 'sitera.in/admin',
    sidebar: ['Dashboard', 'Projects', 'Field Ops', 'Leads', 'Clients', 'Finance', 'Estimates', 'AI Studio', 'Vendors', 'Inventory', 'Assets', 'Users'],
    active: 'Estimates',
    title: 'Who approves what',
    rows: [
      { label: 'Estimate', meta: 'Client, from an emailed link', status: 'Client' },
      { label: 'Change order', meta: 'Client portal', status: 'Client' },
      { label: 'Purchase order', meta: 'Accounts', status: 'Accountant' },
      { label: 'Stock transfer', meta: 'Procurement', status: 'Procurement' },
      { label: 'Site visit and leave', meta: 'Admin', status: 'Admin' },
    ],
  },
  faqs: [
    {
      q: 'Is there a mobile app?',
      a: 'Yes. The Sitera Android app covers field ops, projects, inventory, leads, clients and finance on the go. Estimates, AI Studio, user management and staff attendance are on the web portal.',
    },
    {
      q: 'Do my clients and vendors need an account?',
      a: 'Clients get a portal to follow their projects and approve change orders, and they can approve an estimate straight from the emailed link without signing in. Vendors get a portal for bid invites and quotes.',
    },
    {
      q: 'Can I control what each person sees?',
      a: 'Yes. Admins switch modules on or off for each user, or for a whole role at once, and site engineers only see the projects they are assigned to.',
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
    { name: 'Made for India', detail: 'GST tax codes, TDS sections and Tally-compatible export.' },
  ],
  highlights: [
    'WBS, daily progress reports and plan vs actual',
    'Procure-to-pay, from indent to payment, plus subcontracts',
    'Client RA bills from progress achieved',
    'General ledger with GST, TDS and Tally export',
  ],
  flows: [
    {
      title: 'Materials',
      steps: [
        { label: 'Indent' },
        { label: 'Requisition' },
        { label: 'RFQ' },
        { label: 'PO', note: 'Numbered like PO/FY2627/0001' },
        { label: 'GRN' },
        { label: 'Bill' },
        { label: 'Payment' },
      ],
    },
    {
      title: 'Subcontracts',
      steps: [
        { label: 'Service requisition' },
        { label: 'Work order' },
        { label: 'Contractor JMR', note: 'Capped at the work-order quantity plus 10%' },
        { label: 'Service bill' },
      ],
    },
    {
      title: 'Client billing',
      steps: [
        { label: 'Daily progress' },
        { label: 'RA bill', note: 'Contract value × cumulative % complete' },
        { label: 'Client payment' },
      ],
    },
  ],
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
      items: [
        'Warehouses, receipts, goods issues and store returns',
        'Adjustments and transfers, costed at weighted average',
      ],
    },
    {
      title: 'Clients and billing',
      items: [
        'Leads, tenders, proposals and contracts',
        'RA bills from cumulative progress, client advances, payments and ledger',
      ],
    },
    {
      title: 'Finance and accounting',
      items: [
        'Chart of accounts, journals, periods and year-end',
        'Inter-company loans, financial statements and aging',
        'Tally-compatible XML export',
      ],
    },
    {
      title: 'Assets, plant and production',
      items: [
        'Asset register and depreciation, equipment and hire orders',
        'Weighbridge, plants and BOM, production runs and dispatches',
      ],
    },
    {
      title: 'HR and payroll',
      items: ['Employees, attendance and payroll runs'],
    },
    {
      title: 'Reports and governance',
      items: [
        'Executive dashboard, financial statements, aging and cost to completion',
        'Agreements, statutory approvals with expiry alerts, cases and notices',
      ],
    },
  ],
  extras: [
    {
      title: 'Controls',
      items: [
        'GST tax codes',
        'TDS register for 194C, 194I, 194J and 194Q',
        'Approval workflows',
        'Document numbering by financial year',
        'Cancellations post reversal entries',
        'Nine automated integrity checks every night',
        'Audit log',
      ],
    },
    {
      title: 'Works with',
      items: ['Tally (XML)', 'Excel import', 'CSV export', 'WhatsApp reminders', 'Email approvals and alerts', 'Invoice upload to fill in bills'],
    },
  ],
  roles: [
    {
      group: 'Organisation roles',
      items: [
        { name: 'Org admin', does: 'Sets up the organisation: users, masters and imports.' },
        { name: 'Portfolio lead', does: 'Sees every project and the restricted finance views.' },
        { name: 'Accounts', does: 'Ledger, billing and payments.' },
        { name: 'Procurement', does: 'Indents through to vendor payments.' },
        { name: 'Stores', does: 'Receipts, issues, returns and transfers.' },
        { name: 'HR', does: 'Employees, attendance and payroll.' },
        { name: 'Member', does: 'Works on the projects they are assigned to.' },
      ],
    },
    {
      group: 'Project roles',
      items: [
        { name: 'Project manager', does: 'Plans, schedules and tracks the project.' },
        { name: 'Engineering', does: 'Engineering progress reports.' },
        { name: 'Procurement', does: 'Material and service requests for the project.' },
        { name: 'Site', does: 'Daily progress, materials and logbook on site.' },
        { name: 'Viewer', does: 'Read-only access to the project.' },
      ],
    },
  ],
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
  faqs: [
    {
      q: 'Is BuildNexa only for solar projects?',
      a: 'No. BuildNexa started with solar EPC delivery, and the same modules run building, infrastructure and other construction projects.',
    },
    {
      q: 'Does it work with Tally?',
      a: 'Yes. The general ledger exports Tally-compatible XML, so your accountants can keep their existing books.',
    },
    {
      q: 'Can it run more than one company?',
      a: 'Yes. Companies and branches are set up as masters, and loans between group companies are tracked in the ledger.',
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
