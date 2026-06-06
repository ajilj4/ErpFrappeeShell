/**
 * subNavConfig.js
 * AxonAI One — Dynamic Navigation from Frappe v16 boot data
 *
 * In Frappe v16, sidebar data lives in frappe.boot.workspace_sidebar_item:
 * {
 *   "selling": { label: "Selling", items: [ { label, link_to, link_type, type, ... } ] },
 *   "buying": { ... },
 *   ...
 * }
 *
 * link_type URL mapping:
 *   DocType   → /app/<doctype-kebab>
 *   Report    → /app/query-report/<Report Name>
 *   Workspace → /app/<workspace-kebab>
 *   Dashboard → /app/dashboard-view/<name>
 *   Page      → /app/<page-name>
 *   URL       → item.url (as-is)
 */

// ── URL builder ─────────────────────────────────────────────────────────────

export function sidebarItemUrl(item) {
  const { link_type, link_to, url } = item;
  if (!link_type || !link_to) return url || '#';
  switch (link_type) {
    case 'DocType':
      return `/app/${frappe_name_to_route(link_to)}`;
    case 'Report':
      return `/app/query-report/${encodeURIComponent(link_to)}`;
    case 'Workspace':
      return `/app/${frappe_name_to_route(link_to)}`;
    case 'Dashboard':
      return `/app/dashboard-view/${encodeURIComponent(link_to)}`;
    case 'Page':
      return `/app/${link_to}`;
    default:
      return url || `/app/${frappe_name_to_route(link_to)}`;
  }
}

function frappe_name_to_route(name) {
  // Convert "Sales Order" → "sales-order", "BOM" → "bom", etc.
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ── Module → Frappe sidebar keys mapping ────────────────────────────────────

export const MODULE_SIDEBAR_KEYS = {
  erp: [
    'organization',
    'selling',
    'buying',
    'stock',
    'subcontracting',
    'banking',
    'payments',
    'accounts_setup',
    'financial_reports',
    'manufacturing',
    'projects',
    'assets',
    'budget',
    'subscription',
    'share_management',
    'taxes',
    'erpnext_settings',
  ],
  crm: [],
  hrms: [
    'HR Setup',
    'Expenses',
    'Leaves',
    'Payroll',
    'Performance',
    'Recruitment',
    'Shift & Attendance',
    'Tax & Benefits',
    'Tenure',
  ],
  pos: ['selling'],
  mail: [],
  automation: [],
  reports: [],
  files: [],
  documents: [],
  calendar: [],
  calls: [],
  settings: ['organization'],
};

// ── Dynamic navigation builder ──────────────────────────────────────────────

export function buildModuleTabs(moduleId) {
  const boot = window.frappe?.boot;
  const sidebarData = boot?.workspace_sidebar_item || {};
  const keys = MODULE_SIDEBAR_KEYS[moduleId] || [];

  if (keys.length === 0) {
    return STATIC_NAVIGATION[moduleId]?.tabs || [];
  }

  const tabs = [];
  for (const key of keys) {
    const sidebar = sidebarData[key];
    if (!sidebar) continue;

    const groups = [];
    let currentGroup = null;

    for (const item of sidebar.items || []) {
      if (item.type === 'Section Break') {
        currentGroup = { title: item.label || '', items: [] };
        groups.push(currentGroup);
        continue;
      }
      if (item.type !== 'Link') continue;

      if (!currentGroup) {
        currentGroup = { title: '', items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push({
        label: item.label,
        url: sidebarItemUrl(item),
        link_type: item.link_type,
        link_to: item.link_to,
        icon: item.icon,
      });
    }

    const firstLink = (sidebar.items || []).find(i => i.type === 'Link' && (i.link_to || i.url));
    const tabUrl = firstLink ? sidebarItemUrl(firstLink) : '#';

    const tabId = key
      .toLowerCase()
      .replace(/\s*&\s*/g, '_and_')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    tabs.push({
      id: tabId,
      label: sidebar.label || sidebar.title || key,
      url: tabUrl,
      groups: groups.filter(g => g.items.length > 0),
      headerIcon: sidebar.header_icon,
    });
  }

  if (tabs.length === 0 && STATIC_NAVIGATION[moduleId]) {
    return STATIC_NAVIGATION[moduleId].tabs || [];
  }

  return tabs;
}

export function getTabConfig(moduleId, tabId) {
  const tabs = buildModuleTabs(moduleId);
  return tabs.find(t => t.id === tabId) || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATIC FALLBACK NAVIGATION
// Used when frappe.boot is not yet available (e.g. during initial React mount)
// ═══════════════════════════════════════════════════════════════════════════

export const STATIC_NAVIGATION = {

  // ═══════════════════════════════════════════════════════════════════════
  // ERP SUITE
  // ═══════════════════════════════════════════════════════════════════════
  erp: {
    label: 'ERP Suite',
    tabs: [
      // ── Organization ──────────────────────────────────────────────────
      {
        id: 'organization',
        label: 'Organization',
        url: '/app/company',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/home' },
              { label: 'Dashboard',       url: '/app/dashboard-view/Accounts' },
            ],
          },
          {
            title: 'Company',
            items: [
              { label: 'Company',           url: '/app/company' },
              { label: 'Letter Head',        url: '/app/letter-head' },
              { label: 'Department',         url: '/app/department' },
              { label: 'Branch',             url: '/app/branch' },
              { label: 'User',               url: '/app/user' },
              { label: 'Role Permissions',   url: '/app/permission-manager' },
              { label: 'Email Account',      url: '/app/email-account' },
            ],
          },
        ],
      },

      // ── Selling ───────────────────────────────────────────────────────
      {
        id: 'selling',
        label: 'Selling',
        url: '/app/quotation',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/selling' },
            ],
          },
          {
            title: 'Transactions',
            items: [
              { label: 'Quotation',     url: '/app/quotation' },
              { label: 'Sales Order',   url: '/app/sales-order' },
              { label: 'Sales Invoice', url: '/app/sales-invoice' },
              { label: 'Delivery Note', url: '/app/delivery-note' },
            ],
          },
          {
            title: 'Customers',
            items: [
              { label: 'Customer',       url: '/app/customer' },
              { label: 'Customer Group', url: '/app/customer-group' },
            ],
          },
          {
            title: 'Setup',
            items: [
              { label: 'Selling Settings', url: '/app/selling-settings' },
              { label: 'Item Price',        url: '/app/item-price' },
              { label: 'Price List',        url: '/app/price-list' },
              { label: 'Pricing Rule',      url: '/app/pricing-rule' },
              { label: 'Shipping Rule',     url: '/app/shipping-rule' },
              { label: 'Territory',         url: '/app/territory' },
              { label: 'Sales Person',      url: '/app/sales-person' },
              { label: 'Sales Partner',     url: '/app/sales-partner' },
            ],
          },
        ],
      },

      // ── Buying ────────────────────────────────────────────────────────
      {
        id: 'buying',
        label: 'Buying',
        url: '/app/purchase-order',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/buying' },
            ],
          },
          {
            title: 'Transactions',
            items: [
              { label: 'Purchase Order',   url: '/app/purchase-order' },
              { label: 'Purchase Invoice', url: '/app/purchase-invoice' },
              { label: 'Purchase Receipt', url: '/app/purchase-receipt' },
              { label: 'Supplier',         url: '/app/supplier' },
            ],
          },
          {
            title: 'Setup',
            items: [
              { label: 'Buying Settings',  url: '/app/buying-settings' },
              { label: 'Supplier Group',    url: '/app/supplier-group' },
              { label: 'Purchase Taxes and Charges Template', url: '/app/purchase-taxes-and-charges-template' },
              { label: 'Request for Quotation', url: '/app/request-for-quotation' },
              { label: 'Supplier Quotation', url: '/app/supplier-quotation' },
            ],
          },
        ],
      },

      // ── Stock / Inventory ─────────────────────────────────────────────
      {
        id: 'stock',
        label: 'Stock',
        url: '/app/stock-entry',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/stock' },
            ],
          },
          {
            title: 'Inventory',
            items: [
              { label: 'Stock Entry',        url: '/app/stock-entry' },
              { label: 'Warehouse',           url: '/app/warehouse' },
              { label: 'Item',                url: '/app/item' },
              { label: 'Material Request',    url: '/app/material-request' },
              { label: 'Delivery Note',       url: '/app/delivery-note' },
              { label: 'Purchase Receipt',    url: '/app/purchase-receipt' },
              { label: 'Stock Reconciliation', url: '/app/stock-reconciliation' },
            ],
          },
          {
            title: 'Reports',
            items: [
              { label: 'Stock Balance',      url: '/app/query-report/Stock%20Balance' },
              { label: 'Stock Ledger',        url: '/app/query-report/Stock%20Ledger' },
              { label: 'Stock Projected Qty', url: '/app/query-report/Stock%20Projected%20Qty' },
            ],
          },
          {
            title: 'Setup',
            items: [
              { label: 'Item Group',         url: '/app/item-group' },
              { label: 'Product Bundle',     url: '/app/product-bundle' },
              { label: 'UOM',                url: '/app/uom' },
              { label: 'Brand',              url: '/app/brand' },
              { label: 'Stock Settings',     url: '/app/stock-settings' },
            ],
          },
        ],
      },

      // ── Subcontracting ────────────────────────────────────────────────
      {
        id: 'subcontracting',
        label: 'Subcontracting',
        url: '/app/subcontracting-order',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started',     url: '/app/subcontracting' },
              { label: 'Subcontracting BOM',  url: '/app/subcontracting-bom' },
              { label: 'Stock Entry',         url: '/app/stock-entry' },
            ],
          },
          {
            title: 'Inward Order — Sales Order',
            items: [
              { label: 'Subcontracting Inward Order', url: '/app/subcontracting-inward-order' },
              { label: 'Subcontracting Delivery',     url: '/app/subcontracting-delivery' },
            ],
          },
          {
            title: 'Outward Order — Purchase Order',
            items: [
              { label: 'Subcontracting Order',   url: '/app/subcontracting-order' },
              { label: 'Subcontracting Receipt',  url: '/app/subcontracting-receipt' },
            ],
          },
          {
            title: 'Setup',
            items: [
              { label: 'Item',                url: '/app/item' },
              { label: 'Bill of Materials',   url: '/app/bom' },
            ],
          },
          {
            title: 'Reports',
            items: [
              { label: 'Subcontract Order Summary',         url: '/app/query-report/Subcontract%20Order%20Summary' },
              { label: 'Materials To Be Transferred',       url: '/app/query-report/Materials%20Transferred%20for%20Subcontracting' },
              { label: 'Items To Be Received',              url: '/app/query-report/Items%20To%20Be%20Received' },
            ],
          },
        ],
      },

      // ── Banking ───────────────────────────────────────────────────────
      {
        id: 'banking',
        label: 'Banking',
        url: '/app/bank-clearance',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/banking' },
            ],
          },
          {
            title: 'Banking',
            items: [
              { label: 'Bank Clearance',               url: '/app/bank-clearance' },
              { label: 'Bank Reconciliation',           url: '/app/bank-reconciliation-tool' },
              { label: 'Reconciliation Statement',      url: '/app/query-report/Bank%20Reconciliation%20Statement' },
              { label: 'Unreconcile Payment',           url: '/app/unreconcile-payment' },
              { label: 'Process Payment Reconciliation', url: '/app/process-payment-reconciliation' },
            ],
          },
          {
            title: 'Setup',
            items: [
              { label: 'Bank',               url: '/app/bank' },
              { label: 'Bank Account',       url: '/app/bank-account' },
              { label: 'Bank Account Type',  url: '/app/bank-account-type' },
              { label: 'Bank Account Subtype', url: '/app/bank-account-subtype' },
              { label: 'Bank Guarantee',     url: '/app/bank-guarantee' },
              { label: 'Plaid Settings',     url: '/app/plaid-settings' },
            ],
          },
          {
            title: 'Dunning',
            items: [
              { label: 'Dunning',      url: '/app/dunning' },
              { label: 'Dunning Type', url: '/app/dunning-type' },
            ],
          },
        ],
      },

      // ── Payments ──────────────────────────────────────────────────────
      {
        id: 'payments',
        label: 'Payments',
        url: '/app/payment-entry',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/payments' },
              { label: 'Dashboard',       url: '/app/dashboard-view/Payment' },
            ],
          },
          {
            title: 'Payments',
            items: [
              { label: 'Payment Entry',               url: '/app/payment-entry' },
              { label: 'Journal Entry',                url: '/app/journal-entry' },
              { label: 'Payment Request',              url: '/app/payment-request' },
              { label: 'Payment Order',                url: '/app/payment-order' },
              { label: 'Payment Reconciliation',       url: '/app/payment-reconciliation' },
              { label: 'Unreconcile Payment',          url: '/app/unreconcile-payment' },
              { label: 'Process Payment Reconciliation', url: '/app/process-payment-reconciliation' },
              { label: 'Repost Accounting Ledger',     url: '/app/repost-accounting-ledger' },
              { label: 'Repost Payment Ledger',        url: '/app/repost-payment-ledger' },
            ],
          },
          {
            title: 'Reports',
            items: [
              { label: 'Accounts Receivable',  url: '/app/query-report/Accounts%20Receivable' },
              { label: 'Accounts Payable',     url: '/app/query-report/Accounts%20Payable' },
              { label: 'General Ledger',       url: '/app/query-report/General%20Ledger' },
              { label: 'Trial Balance',        url: '/app/query-report/Trial%20Balance' },
              { label: 'Financial Reports',    url: '/app/query-report/Profit%20and%20Loss%20Statement' },
            ],
          },
        ],
      },

      // ── Accounting ────────────────────────────────────────────────────
      {
        id: 'accounts_setup',
        label: 'Accounting',
        url: '/app/account',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/accounting' },
            ],
          },
          {
            title: 'Ledger',
            items: [
              { label: 'Chart of Accounts', url: '/app/account' },
              { label: 'Journal Entry',     url: '/app/journal-entry' },
              { label: 'Payment Entry',     url: '/app/payment-entry' },
              { label: 'Cost Center',       url: '/app/cost-center' },
              { label: 'Period Closing Voucher', url: '/app/period-closing-voucher' },
            ],
          },
          {
            title: 'Setup',
            items: [
              { label: 'Accounts Settings',  url: '/app/accounts-settings' },
              { label: 'Fiscal Year',         url: '/app/fiscal-year' },
              { label: 'Currency',            url: '/app/currency' },
              { label: 'Currency Exchange',   url: '/app/currency-exchange' },
              { label: 'Mode of Payment',     url: '/app/mode-of-payment' },
              { label: 'Payment Terms',       url: '/app/payment-terms' },
              { label: 'Payment Terms Template', url: '/app/payment-terms-template' },
            ],
          },
        ],
      },

      // ── Financial Reports ─────────────────────────────────────────────
      {
        id: 'financial_reports',
        label: 'Financial Reports',
        url: '/app/query-report/Profit%20and%20Loss%20Statement',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/financial-reports' },
            ],
          },
          {
            title: 'Statements',
            items: [
              { label: 'Profit & Loss',    url: '/app/query-report/Profit%20and%20Loss%20Statement' },
              { label: 'Balance Sheet',     url: '/app/query-report/Balance%20Sheet' },
              { label: 'Trial Balance',     url: '/app/query-report/Trial%20Balance' },
              { label: 'Cash Flow',         url: '/app/query-report/Cash%20Flow' },
              { label: 'General Ledger',    url: '/app/query-report/General%20Ledger' },
            ],
          },
          {
            title: 'Receivables & Payables',
            items: [
              { label: 'Accounts Receivable',        url: '/app/query-report/Accounts%20Receivable' },
              { label: 'Accounts Payable',           url: '/app/query-report/Accounts%20Payable' },
              { label: 'Accounts Receivable Summary', url: '/app/query-report/Accounts%20Receivable%20Summary' },
              { label: 'Accounts Payable Summary',   url: '/app/query-report/Accounts%20Payable%20Summary' },
            ],
          },
        ],
      },

      // ── Manufacturing ─────────────────────────────────────────────────
      {
        id: 'manufacturing',
        label: 'Manufacturing',
        url: '/app/work-order',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/manufacturing' },
            ],
          },
          {
            title: 'Production',
            items: [
              { label: 'Work Order',      url: '/app/work-order' },
              { label: 'BOM',             url: '/app/bom' },
              { label: 'Job Card',        url: '/app/job-card' },
              { label: 'Production Plan', url: '/app/production-plan' },
            ],
          },
          {
            title: 'Setup',
            items: [
              { label: 'Workstation',       url: '/app/workstation' },
              { label: 'Operation',         url: '/app/operation' },
              { label: 'Routing',           url: '/app/routing' },
              { label: 'BOM Update Tool',   url: '/app/bom-update-tool' },
              { label: 'Manufacturing Settings', url: '/app/manufacturing-settings' },
            ],
          },
        ],
      },

      // ── Projects ──────────────────────────────────────────────────────
      {
        id: 'projects',
        label: 'Projects',
        url: '/app/project',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/projects' },
            ],
          },
          {
            title: 'Tracking',
            items: [
              { label: 'Projects',   url: '/app/project' },
              { label: 'Tasks',      url: '/app/task' },
              { label: 'Timesheet',  url: '/app/timesheet' },
            ],
          },
          {
            title: 'Setup',
            items: [
              { label: 'Project Type', url: '/app/project-type' },
              { label: 'Project Template', url: '/app/project-template' },
              { label: 'Activity Type', url: '/app/activity-type' },
            ],
          },
        ],
      },

      // ── Assets ────────────────────────────────────────────────────────
      {
        id: 'assets',
        label: 'Assets',
        url: '/app/asset',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/assets' },
            ],
          },
          {
            title: 'Assets',
            items: [
              { label: 'Asset',                 url: '/app/asset' },
              { label: 'Asset Movement',         url: '/app/asset-movement' },
              { label: 'Asset Maintenance',      url: '/app/asset-maintenance' },
              { label: 'Asset Depreciation',     url: '/app/asset-depreciation-schedule' },
              { label: 'Asset Value Adjustment', url: '/app/asset-value-adjustment' },
              { label: 'Asset Repair',           url: '/app/asset-repair' },
              { label: 'Asset Capitalization',   url: '/app/asset-capitalization' },
            ],
          },
          {
            title: 'Setup',
            items: [
              { label: 'Asset Category',  url: '/app/asset-category' },
              { label: 'Location',        url: '/app/location' },
            ],
          },
        ],
      },

      // ── Budget ────────────────────────────────────────────────────────
      {
        id: 'budget',
        label: 'Budget',
        url: '/app/budget',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/budget' },
            ],
          },
          {
            title: 'Budget',
            items: [
              { label: 'Budget',               url: '/app/budget' },
              { label: 'Monthly Distribution', url: '/app/monthly-distribution' },
            ],
          },
          {
            title: 'Reports',
            items: [
              { label: 'Budget Variance Report', url: '/app/query-report/Budget%20Variance%20Report' },
            ],
          },
        ],
      },

      // ── Subscription ─────────────────────────────────────────────────
      {
        id: 'subscription',
        label: 'Subscription',
        url: '/app/subscription',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/subscription' },
            ],
          },
          {
            title: 'Subscription',
            items: [
              { label: 'Subscription',      url: '/app/subscription' },
              { label: 'Subscription Plan', url: '/app/subscription-plan' },
            ],
          },
        ],
      },

      // ── Share Management ──────────────────────────────────────────────
      {
        id: 'share_management',
        label: 'Share Management',
        url: '/app/share-transfer',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/share-management' },
            ],
          },
          {
            title: 'Shares',
            items: [
              { label: 'Share Transfer', url: '/app/share-transfer' },
              { label: 'Shareholder',    url: '/app/shareholder' },
              { label: 'Share Type',     url: '/app/share-type' },
            ],
          },
        ],
      },

      // ── Taxes ─────────────────────────────────────────────────────────
      {
        id: 'taxes',
        label: 'Taxes',
        url: '/app/tax-rule',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/taxes' },
            ],
          },
          {
            title: 'Tax Setup',
            items: [
              { label: 'Tax Rule',            url: '/app/tax-rule' },
              { label: 'Tax Category',        url: '/app/tax-category' },
              { label: 'Item Tax Template',   url: '/app/item-tax-template' },
              { label: 'Tax Withholding Category', url: '/app/tax-withholding-category' },
              { label: 'Sales Taxes and Charges Template', url: '/app/sales-taxes-and-charges-template' },
              { label: 'Purchase Taxes and Charges Template', url: '/app/purchase-taxes-and-charges-template' },
            ],
          },
          {
            title: 'GST',
            items: [
              { label: 'GST Settings', url: '/app/gst-settings' },
            ],
          },
        ],
      },

      // ── ERPNext Settings ──────────────────────────────────────────────
      {
        id: 'erpnext_settings',
        label: 'ERPNext Settings',
        url: '/app/erpnext-settings',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/erpnext-settings' },
            ],
          },
          {
            title: 'Settings',
            items: [
              { label: 'ERPNext Settings',  url: '/app/erpnext-settings' },
              { label: 'Domain Settings',   url: '/app/domain-settings' },
              { label: 'Data Import',       url: '/app/data-import' },
              { label: 'Data Export',        url: '/app/data-export' },
              { label: 'Rename Tool',        url: '/app/rename-tool' },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CRM (ERPNext built-in module)
  // ═══════════════════════════════════════════════════════════════════════
  crm: {
    label: 'CRM',
    tabs: [
      {
        id: 'home',
        label: 'Home',
        url: '/desk/crm',
        groups: [
          {
            title: 'Getting Started',
            items: [
              { label: 'Getting Started', url: '/app/crm' },
              { label: 'Lead',            url: '/app/lead' },
              { label: 'Opportunity',     url: '/app/opportunity' },
              { label: 'Customer',        url: '/app/customer' },
            ],
          },
          {
            title: 'Reports',
            items: [
              { label: 'Sales Analytics',                       url: '/app/query-report/Sales%20Analytics' },
              { label: 'Lead Details',                          url: '/app/query-report/Lead%20Details' },
              { label: 'Sales Pipeline Analytics',              url: '/app/query-report/Sales%20Pipeline%20Analytics' },
              { label: 'Opportunity Summary by Sales Stage',    url: '/app/query-report/Opportunity%20Summary%20by%20Sales%20Stage' },
              { label: 'Sales Funnel',                          url: '/app/query-report/Sales%20Funnel' },
              { label: 'Prospects Engaged But Not Converted',   url: '/app/query-report/Prospects%20Engaged%20But%20Not%20Converted' },
              { label: 'First Response Time for Opportunity',   url: '/app/query-report/First%20Response%20Time%20for%20Opportunity' },
              { label: 'Campaign Efficiency',                   url: '/app/query-report/Campaign%20Efficiency' },
              { label: 'Lead Owner Efficiency',                 url: '/app/query-report/Lead%20Owner%20Efficiency' },
            ],
          },
        ],
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        url: '/app/maintenance-schedule',
        groups: [
          {
            title: 'Maintenance',
            items: [
              { label: 'Maintenance Schedule', url: '/app/maintenance-schedule' },
              { label: 'Maintenance Visit',    url: '/app/maintenance-visit' },
              { label: 'Warranty Claim',       url: '/app/warranty-claim' },
            ],
          },
        ],
      },
      {
        id: 'pipeline',
        label: 'Sales Pipeline',
        url: '/app/opportunity',
        groups: [
          {
            title: 'Pipeline',
            items: [
              { label: 'Lead',          url: '/app/lead' },
              { label: 'Opportunity',   url: '/app/opportunity' },
              { label: 'Customer',      url: '/app/customer' },
              { label: 'Contract',      url: '/app/contract' },
              { label: 'Appointment',   url: '/app/appointment' },
              { label: 'Communication', url: '/app/communication' },
              { label: 'Campaign',      url: '/app/campaign' },
            ],
          },
        ],
      },
      {
        id: 'campaigns',
        label: 'Campaigns',
        url: '/app/campaign',
        groups: [
          {
            title: 'Campaign',
            items: [
              { label: 'Campaign',       url: '/app/campaign' },
              { label: 'Email Campaign', url: '/app/email-campaign' },
              { label: 'SMS Center',     url: '/app/sms-center' },
              { label: 'SMS Log',        url: '/app/sms-log' },
              { label: 'Email Group',    url: '/app/email-group' },
            ],
          },
        ],
      },
      {
        id: 'setup',
        label: 'Setup',
        url: '/app/crm-settings',
        groups: [
          {
            title: 'Setup',
            items: [
              { label: 'Territory',      url: '/app/territory' },
              { label: 'Customer Group', url: '/app/customer-group' },
              { label: 'Contact',        url: '/app/contact' },
              { label: 'Prospect',       url: '/app/prospect' },
              { label: 'Sales Person',   url: '/app/sales-person' },
              { label: 'Sales Stage',    url: '/app/sales-stage' },
              { label: 'Lead Source',    url: '/app/lead-source' },
            ],
          },
          {
            title: 'Settings',
            items: [
              { label: 'CRM Settings', url: '/app/crm-settings' },
              { label: 'SMS Settings', url: '/app/sms-settings' },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HRMS
  // ═══════════════════════════════════════════════════════════════════════
  hrms: {
    label: 'HR & Payroll',
    tabs: [
      {
        id: "hr_setup",
        label: "HR Setup",
        url: "/app/hr-setup",
        groups: [
          {
            title: "Getting Started",
            items: [
              { label: "Getting Started", url: "/app/hr-setup" },
              { label: "Dashboard", url: "/app/dashboard-view/Human%20Resource" },
              { label: "Employee", url: "/app/employee" },
              { label: "Organizational Chart", url: "/app/organizational-chart" }
            ]
          },
          {
            title: "Setup",
            items: [
              { label: "Company", url: "/app/company" },
              { label: "Branch", url: "/app/branch" },
              { label: "Department", url: "/app/department" },
              { label: "Designation", url: "/app/designation" },
              { label: "Employee Group", url: "/app/employee-group" },
              { label: "Employee Grade", url: "/app/employee-grade" },
              { label: "Settings", url: "/app/hr-settings" }
            ]
          }
        ]
      },
      {
        id: "expenses",
        label: "Expenses",
        url: "/app/expenses",
        groups: [
          {
            title: "Getting Started",
            items: [
              { label: "Getting Started", url: "/app/expenses" },
              { label: "Dashboard", url: "/app/dashboard-view/Expense%20Claims" },
              { label: "Employee Advance", url: "/app/employee-advance" },
              { label: "Expense Claim", url: "/app/expense-claim" }
            ]
          },
          {
            title: "Travel",
            items: [
              { label: "Purpose of Travel", url: "/app/purpose-of-travel" },
              { label: "Travel Request", url: "/app/travel-request" },
              { label: "Vehicle Log", url: "/app/vehicle-log" }
            ]
          },
          {
            title: "Accounting Entries",
            items: [
              { label: "Payment Entry", url: "/app/payment-entry" },
              { label: "Journal Entry", url: "/app/journal-entry" }
            ]
          },
          {
            title: "Reports",
            items: [
              { label: "Unpaid Expense Claim", url: "/app/query-report/Unpaid%20Expense%20Claim" },
              { label: "Vehicle Expenses", url: "/app/query-report/Vehicle%20Expenses" },
              { label: "Accounts Receivable", url: "/app/query-report/Accounts%20Receivable" },
              { label: "Accounts Payable", url: "/app/query-report/Accounts%20Payable" },
              { label: "General Ledger", url: "/app/query-report/General%20Ledger" }
            ]
          },
          {
            title: "Setup",
            items: [
              { label: "Expense Claim Type", url: "/app/expense-claim-type" },
              { label: "Driver", url: "/app/driver" },
              { label: "Vehicle", url: "/app/vehicle" },
              { label: "Settings", url: "/app/hr-settings" }
            ]
          }
        ]
      },
      {
        id: "leaves",
        label: "Leaves",
        url: "/app/leaves",
        groups: [
          {
            title: "Getting Started",
            items: [
              { label: "Getting Started", url: "/app/leaves" },
              { label: "Leave Application", url: "/app/leave-application" },
              { label: "Leave Encashment", url: "/app/leave-encashment" },
              { label: "Leave Control Panel", url: "/app/leave-control-panel" },
              { label: "Leave Policy Assignment", url: "/app/leave-policy-assignment" },
              { label: "Leave Allocation", url: "/app/leave-allocation" }
            ]
          },
          {
            title: "Reports",
            items: [
              { label: "Leave Balance", url: "/app/query-report/Employee%20Leave%20Balance" },
              { label: "Leave Balance Summary", url: "/app/query-report/Employee%20Leave%20Balance%20Summary" },
              { label: "Employees Working on a Holiday", url: "/app/query-report/Employees%20working%20on%20a%20holiday" }
            ]
          },
          {
            title: "Setup",
            items: [
              { label: "Holiday List", url: "/app/holiday-list" },
              { label: "Holiday List Assignment", url: "/app/holiday-list-assignment" },
              { label: "Leave Period", url: "/app/leave-period" },
              { label: "Leave Policy", url: "/app/leave-policy" },
              { label: "Leave Block List", url: "/app/leave-block-list" },
              { label: "Leave Type", url: "/app/leave-type" },
              { label: "Settings", url: "/app/hr-settings" }
            ]
          }
        ]
      },
      {
        id: "payroll",
        label: "Payroll",
        url: "/app/payroll",
        groups: [
          {
            title: "Getting Started",
            items: [
              { label: "Getting Started", url: "/app/payroll" },
              { label: "Dashboard", url: "/app/dashboard-view/Payroll" },
              { label: "Payroll Entry", url: "/app/payroll-entry" },
              { label: "Salary Structure Assignment", url: "/app/salary-structure-assignment" },
              { label: "Salary Slip", url: "/app/salary-slip" },
              { label: "Additional Salary", url: "/app/additional-salary" },
              { label: "Salary Withholding", url: "/app/salary-withholding" }
            ]
          },
          {
            title: "Reports",
            items: [
              { label: "Employee CTC Break-up", url: "/app/query-report/Employee%20CTC%20Break-up" },
              { label: "Salary Register", url: "/app/query-report/Salary%20Register" },
              { label: "Income Tax Deductions", url: "/app/query-report/Income%20Tax%20Deductions" },
              { label: "Professional Tax Deductions", url: "/app/query-report/Professional%20Tax%20Deductions" },
              { label: "General Ledger", url: "/app/query-report/General%20Ledger" },
              { label: "Accounts Payable", url: "/app/query-report/Accounts%20Payable" }
            ]
          },
          {
            title: "Setup",
            items: [
              { label: "Salary Component", url: "/app/salary-component" },
              { label: "Salary Structure", url: "/app/salary-structure" },
              { label: "Settings", url: "/app/payroll-settings" }
            ]
          }
        ]
      },
      {
        id: "performance",
        label: "Performance",
        url: "/app/performance",
        groups: [
          {
            title: "Getting Started",
            items: [
              { label: "Getting Started", url: "/app/performance" },
              { label: "Goal", url: "/app/goal" },
              { label: "Appraisal Cycle", url: "/app/appraisal-cycle" },
              { label: "Appraisal", url: "/app/appraisal" },
              { label: "Employee Performance Feedback", url: "/app/employee-performance-feedback" },
              { label: "Employee Promotion", url: "/app/employee-promotion" }
            ]
          },
          {
            title: "Reports",
            items: [
              { label: "Appraisal Overview", url: "/app/query-report/Appraisal%20Overview" }
            ]
          },
          {
            title: "Setup",
            items: [
              { label: "Appraisal Template", url: "/app/appraisal-template" },
              { label: "KRA", url: "/app/kra" },
              { label: "Employee Feedback Criteria", url: "/app/employee-feedback-criteria" }
            ]
          }
        ]
      },
      {
        id: "recruitment",
        label: "Recruitment",
        url: "/app/recruitment",
        groups: [
          {
            title: "Getting Started",
            items: [
              { label: "Getting Started", url: "/app/recruitment" },
              { label: "Dashboard", url: "/app/dashboard-view/Recruitment" },
              { label: "Job Opening", url: "/app/job-opening" },
              { label: "Job Applicant", url: "/app/job-applicant" },
              { label: "Interview", url: "/app/interview" },
              { label: "Job Offer", url: "/app/job-offer" },
              { label: "Appointment Letter", url: "/app/appointment-letter" }
            ]
          },
          {
            title: "Planning",
            items: [
              { label: "Job Requisition", url: "/app/job-requisition" },
              { label: "Staffing Plan", url: "/app/staffing-plan" },
              { label: "Employee Referral", url: "/app/employee-referral" }
            ]
          },
          {
            title: "Reports",
            items: [
              { label: "Recruitment Analytics", url: "/app/query-report/Recruitment%20Analytics" }
            ]
          },
          {
            title: "Setup",
            items: [
              { label: "Interview Type", url: "/app/interview-type" },
              { label: "Job Opening Template", url: "/app/job-opening-template" },
              { label: "Appointment Letter Template", url: "/app/appointment-letter-template" },
              { label: "Job Offer Term Template", url: "/app/job-offer-term-template" },
              { label: "Job Portal", url: "/jobs" },
              { label: "Settings", url: "/app/hr-settings" }
            ]
          }
        ]
      },
      {
        id: "shift_and_attendance",
        label: "Shift & Attendance",
        url: "/app/shift--attendance",
        groups: [
          {
            title: "Getting Started",
            items: [
              { label: "Getting Started", url: "/app/shift--attendance" },
              { label: "Roster", url: "/hr/roster" },
              { label: "Dashboard", url: "/app/dashboard-view/Attendance" },
              { label: "Employee Attendance Tool", url: "/app/employee-attendance-tool" },
              { label: "Employee Checkin", url: "/app/employee-checkin" },
              { label: "Shift Request", url: "/app/shift-request" },
              { label: "Attendance Request", url: "/app/attendance-request" }
            ]
          },
          {
            title: "Overtime",
            items: [
              { label: "Overtime Type", url: "/app/overtime-type" },
              { label: "Overtime Slip", url: "/app/overtime-slip" }
            ]
          },
          {
            title: "Reports",
            items: [
              { label: "Monthly Attendance Sheet", url: "/app/query-report/Monthly%20Attendance%20Sheet" },
              { label: "Shift Attendance", url: "/app/query-report/Shift%20Attendance" },
              { label: "Employee Hours Utilization", url: "/app/query-report/Employee%20Hours%20Utilization%20Based%20On%20Timesheet" },
              { label: "Project Profitability", url: "/app/query-report/Project%20Profitability" }
            ]
          },
          {
            title: "Setup",
            items: [
              { label: "Shift Type", url: "/app/shift-type" },
              { label: "Shift Location", url: "/app/shift-location" },
              { label: "Shift Schedule", url: "/app/shift-schedule" },
              { label: "Activity Type", url: "/app/activity-type" },
              { label: "Timesheet", url: "/app/timesheet" },
              { label: "Settings", url: "/app/hr-settings" }
            ]
          }
        ]
      },
      {
        id: "tax_and_benefits",
        label: "Tax & Benefits",
        url: "/app/tax--benefits",
        groups: [
          {
            title: "Getting Started",
            items: [
              { label: "Getting Started", url: "/app/tax--benefits" },
              { label: "Exemption Declaration", url: "/app/employee-tax-exemption-declaration" },
              { label: "Exemption Submission Proof", url: "/app/employee-tax-exemption-proof-submission" },
              { label: "Benefit Application", url: "/app/employee-benefit-application" },
              { label: "Benefit Claim", url: "/app/employee-benefit-claim" }
            ]
          },
          {
            title: "Reports",
            items: [
              { label: "Income Tax Computation", url: "/app/query-report/Income%20Tax%20Computation" },
              { label: "Income Tax Deductions", url: "/app/query-report/Income%20Tax%20Deductions" },
              { label: "Accrued Earnings Report", url: "/app/query-report/Accrued%20Earnings%20Report" }
            ]
          },
          {
            title: "Setup",
            items: [
              { label: "Income Tax Slab", url: "/app/income-tax-slab" },
              { label: "Exemption Category", url: "/app/employee-tax-exemption-category" }
            ]
          }
        ]
      },
      {
        id: "tenure",
        label: "Tenure",
        url: "/app/tenure",
        groups: [
          {
            title: "Getting Started",
            items: [
              { label: "Getting Started", url: "/app/tenure" },
              { label: "Dashboard", url: "/app/dashboard-view/Employee%20Lifecycle" },
              { label: "Employee Onboarding", url: "/app/employee-onboarding" },
              { label: "Employee Separation", url: "/app/employee-separation" },
              { label: "Employee Grievance", url: "/app/employee-grievance" }
            ]
          },
          {
            title: "Reports",
            items: [
              { label: "Employee Exits", url: "/app/query-report/Employee%20Exits" },
              { label: "Employee Birthday", url: "/app/query-report/Employee%20Birthday" },
              { label: "Employee Information", url: "/app/query-report/Employee%20Information" },
              { label: "Employee Analytics", url: "/app/query-report/Employee%20Analytics" }
            ]
          },
          {
            title: "Setup",
            items: [
              { label: "Employee Skill Map", url: "/app/employee-skill-map" },
              { label: "Grievance Type", url: "/app/grievance-type" },
              { label: "Training Program", url: "/app/training-program" },
              { label: "Training Event", url: "/app/training-event" },
              { label: "Training Feedback", url: "/app/training-feedback" },
              { label: "Training Result", url: "/app/training-result" },
              { label: "Settings", url: "/app/hr-settings" }
            ]
          }
        ]
      }
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // POINT OF SALE
  // ═══════════════════════════════════════════════════════════════════════
  pos: {
    label: 'Point of Sale',
    tabs: [
      {
        id: 'sales',
        label: 'Sales',
        url: '/app/pos-invoice',
        groups: [
          {
            title: 'Retail',
            items: [
              { label: 'POS Invoices',      url: '/app/pos-invoice' },
              { label: 'POS Opening Entry', url: '/app/pos-opening-entry' },
              { label: 'POS Closing Entry', url: '/app/pos-closing-entry' },
            ],
          },
          {
            title: 'Setup',
            items: [
              { label: 'POS Profile', url: '/app/pos-profile' },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MAIL (standalone Vue SPA at /mail)
  // ═══════════════════════════════════════════════════════════════════════
  mail: {
    label: 'Mail',
    tabs: [
      {
        id: 'mailbox',
        label: 'Mailbox',
        url: '/mail',
        groups: [
          {
            title: 'Mail',
            items: [
              { label: 'Inbox',         url: '/mail' },
              { label: 'Address Books', url: '/mail/address-books' },
              { label: 'Contacts',      url: '/mail/contacts' },
              { label: 'Calendar',      url: '/mail/calendar' },
            ],
          },
        ],
      },
      {
        id: 'admin',
        label: 'Admin',
        url: '/mail/dashboard',
        groups: [
          {
            title: 'Administration',
            items: [
              { label: 'Dashboard',     url: '/mail/dashboard' },
              { label: 'Domains',       url: '/mail/dashboard/domains' },
              { label: 'Members',       url: '/mail/dashboard/members' },
              { label: 'Mailing Lists', url: '/mail/dashboard/mailing-lists' },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════
  automation: {
    label: 'Automation',
    tabs: [
      {
        id: 'rules',
        label: 'Rules',
        url: '/app/assignment-rule',
        groups: [
          {
            title: 'Automation',
            items: [
              { label: 'Assignment Rules', url: '/app/assignment-rule' },
              { label: 'Auto Repeat',      url: '/app/auto-repeat' },
              { label: 'Workflows',        url: '/app/workflow' },
              { label: 'Notifications',    url: '/app/notification' },
            ],
          },
        ],
      },
    ],
  },

  reports: {
    label: 'Reports',
    tabs: [
      {
        id: 'builder',
        label: 'Reports',
        url: '/app/report',
        groups: [
          {
            title: 'Reports',
            items: [
              { label: 'All Reports',  url: '/app/report' },
              { label: 'Dashboards',   url: '/app/dashboard' },
            ],
          },
        ],
      },
    ],
  },

  files: {
    label: 'Files',
    tabs: [
      {
        id: 'explorer',
        label: 'Files',
        url: '/app/file',
        groups: [
          {
            title: 'Storage',
            items: [
              { label: 'All Files', url: '/app/file' },
            ],
          },
        ],
      },
    ],
  },

  documents: {
    label: 'Documents',
    tabs: [
      {
        id: 'editor',
        label: 'Documents',
        url: '/app/documents',
        groups: [
          {
            title: 'Create New',
            items: [
              { label: 'Document', url: '/app/documents/new?type=word' },
              { label: 'Spreadsheet', url: '/app/documents/new?type=cell' },
              { label: 'Presentation', url: '/app/documents/new?type=slide' },
              { label: 'PDF Form', url: '/app/documents/new?type=pdf' },
            ],
          },
          {
            title: 'Recent Files',
            items: [
              // This will be dynamically populated in SubNav.jsx
            ],
          },
        ],
      },
    ],
  },

  calendar: {
    label: 'Calendar',
    tabs: [
      {
        id: 'events',
        label: 'Events',
        url: '/app/event',
        groups: [
          {
            title: 'Agenda',
            items: [
              { label: 'Events', url: '/app/event' },
              { label: 'Tasks',  url: '/app/task?view=Calendar' },
            ],
          },
        ],
      },
    ],
  },

  calls: {
    label: 'Calls',
    tabs: [
      {
        id: 'logs',
        label: 'Call Logs',
        url: '/app/call-log',
        groups: [
          {
            title: 'Communication',
            items: [
              { label: 'All Logs',     url: '/app/call-log' },
              { label: 'Missed Calls', url: '/app/call-log?status=Missed' },
            ],
          },
        ],
      },
    ],
  },

  settings: {
    label: 'Settings',
    tabs: [
      {
        id: 'system',
        label: 'System',
        url: '/app/system-settings',
        groups: [
          {
            title: 'Administration',
            items: [
              { label: 'System Settings',  url: '/app/system-settings' },
              { label: 'Users',            url: '/app/user' },
              { label: 'Role Permissions', url: '/app/permission-manager' },
            ],
          },
          {
            title: 'Customization',
            items: [
              { label: 'Custom Fields',    url: '/app/custom-field' },
              { label: 'Customize Form',   url: '/app/customize-form' },
              { label: 'Print Formats',    url: '/app/print-format' },
              { label: 'Email Templates',  url: '/app/email-template' },
            ],
          },
        ],
      },
      {
        id: 'organization',
        label: 'Organization',
        url: '/app/company',
        groups: [
          {
            title: 'Company',
            items: [
              { label: 'Company',         url: '/app/company' },
              { label: 'Letter Head',     url: '/app/letter-head' },
              { label: 'Department',      url: '/app/department' },
              { label: 'Email Account',   url: '/app/email-account' },
            ],
          },
        ],
      },
    ],
  },
};

// ── Compatibility alias for components that still use NAVIGATION ─────────────
export const NAVIGATION = Object.fromEntries(
  Object.entries(STATIC_NAVIGATION).map(([key, val]) => [key, val])
);
