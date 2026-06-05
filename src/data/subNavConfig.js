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
// Maps AxonAI sidebar module IDs to one or more frappe.boot sidebar keys
// Each entry is an array of sidebar keys in order they should appear as tabs

export const MODULE_SIDEBAR_KEYS = {
  erp: [
    'organization',
    'selling',
    'buying',
    'invoicing',
    'stock',
    'banking',
    'accounts_setup',
    'financial_reports',
    'manufacturing',
    'projects',
    'assets',
    'budget',
    'taxes',
    'erpnext_settings',
  ],
  // CRM and Mail are standalone Vue SPAs — no frappe.boot sidebar keys exist for them.
  // Their navigation is served from STATIC_NAVIGATION below.
  crm: [],
  hrms: [
    // Keys must exactly match the 'name' field in workspace_sidebar/*.json
    // (which is what frappe.boot.workspace_sidebar_item uses as the key)
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
  // Mail is a standalone Vue SPA — no frappe.boot sidebar keys.
  mail: [],
  automation: [],
  reports: [],
  files: [],
  calendar: [],
  calls: [],
  settings: ['organization'],
};

// ── Dynamic navigation builder ──────────────────────────────────────────────

/**
 * Build navigation tabs for a given module using live frappe.boot data.
 * Returns an array of tab objects compatible with ModuleNav + SubNav.
 */
export function buildModuleTabs(moduleId) {
  const boot = window.frappe?.boot;
  const sidebarData = boot?.workspace_sidebar_item || {};
  const keys = MODULE_SIDEBAR_KEYS[moduleId] || [];

  // Empty keys means this module uses STATIC_NAVIGATION only (CRM, Mail, etc.)
  if (keys.length === 0) {
    return STATIC_NAVIGATION[moduleId]?.tabs || [];
  }

  const tabs = [];
  for (const key of keys) {
    // Frappe stores workspace sidebar items by their exact 'name' field.
    // For HRMS, keys are like 'HR Setup', 'Shift & Attendance', etc.
    // For ERP, keys are lowercase like 'selling', 'buying', 'organization'.
    const sidebar = sidebarData[key];
    if (!sidebar) continue;

    // Convert flat items list to grouped structure (Section Break = group separator)
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

    // Use first DocType/Workspace/URL item as the tab's landing URL
    const firstLink = (sidebar.items || []).find(i => i.type === 'Link' && (i.link_to || i.url));
    const tabUrl = firstLink ? sidebarItemUrl(firstLink) : '#';

    // Generate a stable tab ID from the key:
    //   'HR Setup' → 'hr_setup', 'Shift & Attendance' → 'shift_and_attendance'
    //   'selling' → 'selling' (already lowercase, no spaces)
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

  // Fallback: if boot data not available, use static config
  if (tabs.length === 0 && STATIC_NAVIGATION[moduleId]) {
    return STATIC_NAVIGATION[moduleId].tabs || [];
  }

  return tabs;
}

/**
 * Get a specific tab config by moduleId + tabId.
 */
export function getTabConfig(moduleId, tabId) {
  const tabs = buildModuleTabs(moduleId);
  return tabs.find(t => t.id === tabId) || null;
}

// ── Static fallback navigation ──────────────────────────────────────────────
// Used when frappe.boot is not yet available (e.g. during initial React mount)

export const STATIC_NAVIGATION = {
  erp: {
    label: 'ERP Suite',
    tabs: [
      {
        id: 'organization',
        label: 'Organization',
        url: '/app/company',
        groups: [
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
      {
        id: 'selling',
        label: 'Selling',
        url: '/app/quotation',
        groups: [
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
        ],
      },
      {
        id: 'buying',
        label: 'Buying',
        url: '/app/purchase-order',
        groups: [
          {
            title: 'Transactions',
            items: [
              { label: 'Purchase Order',   url: '/app/purchase-order' },
              { label: 'Purchase Invoice', url: '/app/purchase-invoice' },
              { label: 'Supplier',         url: '/app/supplier' },
            ],
          },
        ],
      },
      {
        id: 'stock',
        label: 'Stock',
        url: '/app/stock-entry',
        groups: [
          {
            title: 'Inventory',
            items: [
              { label: 'Stock Entry',      url: '/app/stock-entry' },
              { label: 'Warehouse',        url: '/app/warehouse' },
              { label: 'Item',             url: '/app/item' },
            ],
          },
        ],
      },
      {
        id: 'accounts_setup',
        label: 'Accounting',
        url: '/app/account',
        groups: [
          {
            title: 'Ledger',
            items: [
              { label: 'Chart of Accounts', url: '/app/account' },
              { label: 'Journal Entry',     url: '/app/journal-entry' },
              { label: 'Payment Entry',     url: '/app/payment-entry' },
            ],
          },
        ],
      },
      {
        id: 'financial_reports',
        label: 'Financial Reports',
        url: '/app/query-report/Profit%20and%20Loss%20Statement',
        groups: [
          {
            title: 'Statements',
            items: [
              { label: 'Profit & Loss', url: '/app/query-report/Profit%20and%20Loss%20Statement' },
              { label: 'Balance Sheet', url: '/app/query-report/Balance%20Sheet' },
              { label: 'Trial Balance', url: '/app/query-report/Trial%20Balance' },
            ],
          },
        ],
      },
      {
        id: 'manufacturing',
        label: 'Manufacturing',
        url: '/app/work-order',
        groups: [
          {
            title: 'Production',
            items: [
              { label: 'Work Order',      url: '/app/work-order' },
              { label: 'BOM',             url: '/app/bom' },
              { label: 'Job Card',        url: '/app/job-card' },
              { label: 'Production Plan', url: '/app/production-plan' },
            ],
          },
        ],
      },
      {
        id: 'projects',
        label: 'Projects',
        url: '/app/project',
        groups: [
          {
            title: 'Tracking',
            items: [
              { label: 'Projects',   url: '/app/project' },
              { label: 'Tasks',      url: '/app/task' },
              { label: 'Timesheet',  url: '/app/timesheet' },
            ],
          },
        ],
      },
    ],
  },

  crm: {
    label: 'CRM',
    // CRM is a standalone Vue 3 SPA at /crm — tab IDs MUST match resolveRoute() return values
    tabs: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        url: '/crm/dashboard',
        groups: [],
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        url: '/crm/leads',
        groups: [
          {
            title: 'Pipeline',
            items: [
              { label: 'Leads',  url: '/crm/leads' },
              { label: 'Deals',  url: '/crm/deals' },
            ],
          },
        ],
      },
      {
        id: 'contacts',
        label: 'Contacts',
        url: '/crm/contacts',
        groups: [
          {
            title: 'People',
            items: [
              { label: 'Contacts',      url: '/crm/contacts' },
              { label: 'Organizations', url: '/crm/organizations' },
            ],
          },
        ],
      },
      {
        id: 'activity',
        label: 'Activity',
        url: '/crm/notes',
        groups: [
          {
            title: 'Activity',
            items: [
              { label: 'Notes',     url: '/crm/notes' },
              { label: 'Tasks',     url: '/crm/tasks' },
              { label: 'Call Logs', url: '/crm/call-logs' },
              { label: 'Calendar',  url: '/crm/calendar' },
            ],
          },
        ],
      },
    ],
  },

  hrms: {
    label: 'HR & Payroll',
    tabs: [
      {
        id: "hr_setup",
        label: "HR Setup",
        url: "/app/hr-setup",
        groups: [
          {
            title: "",
            items: [
              { label: "Home", url: "/app/hr-setup" },
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
            title: "",
            items: [
              { label: "Home", url: "/app/expenses" },
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
            title: "",
            items: [
              { label: "Home", url: "/app/leaves" },
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
            title: "",
            items: [
              { label: "Home", url: "/app/payroll" },
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
            title: "",
            items: [
              { label: "Home", url: "/app/performance" },
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
            title: "",
            items: [
              { label: "Home", url: "/app/recruitment" },
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
            title: "",
            items: [
              { label: "Home", url: "/app/shift--attendance" },
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
            title: "",
            items: [
              { label: "Home", url: "/app/tax--benefits" },
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
            title: "",
            items: [
              { label: "Home", url: "/app/tenure" },
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

  mail: {
    label: 'Mail',
    // Mail is a standalone Vue 3 SPA at /mail — tab IDs MUST match resolveRoute() return values
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
// Build it once from boot data (or static fallback) as a plain object
export const NAVIGATION = Object.fromEntries(
  Object.entries(STATIC_NAVIGATION).map(([key, val]) => [key, val])
);
