/**
 * subNavConfig.js
 * AxonAI One — 3-Level Navigation Hierarchy configuration
 *
 * Structure:
 * - Level 1 (Sidebar): primary workspaces (erp, crm, hrms, etc.)
 * - Level 2 (ModuleNav): horizontal tabs under primary workspace (Dashboard, Sales, Purchases, Accounting, etc.)
 * - Level 3 (SubNav): vertical sidebar grouping links for the active tab (Chart of Accounts, Journal Entry, etc.)
 */

export const NAVIGATION = {
  erp: {
    label: 'ERP Suite',
    tabs: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        url: '/app/home',
        groups: [
          {
            title: 'Overview',
            items: [
              { label: 'Home Dashboard', url: '/app/home' },
              { label: 'Workspace',      url: '/app/workspace' }
            ]
          }
        ]
      },
      {
        id: 'sales',
        label: 'Sales',
        url: '/app/selling',
        groups: [
          {
            title: 'Transactions',
            items: [
              { label: 'Quotation',     url: '/app/quotation' },
              { label: 'Sales Order',   url: '/app/sales-order' },
              { label: 'Sales Invoice', url: '/app/sales-invoice' },
              { label: 'Delivery Note', url: '/app/delivery-note' }
            ]
          },
          {
            title: 'Customers',
            items: [
              { label: 'Customer',       url: '/app/customer' },
              { label: 'Customer Group', url: '/app/customer-group' }
            ]
          },
          {
            title: 'Setup',
            items: [
              { label: 'Selling Settings', url: '/app/selling-settings' }
            ]
          }
        ]
      },
      {
        id: 'purchases',
        label: 'Purchases',
        url: '/app/buying',
        groups: [
          {
            title: 'Transactions',
            items: [
              { label: 'Request for Quotation', url: '/app/request-for-quotation' },
              { label: 'Supplier Quotation',    url: '/app/supplier-quotation' },
              { label: 'Purchase Order',        url: '/app/purchase-order' },
              { label: 'Purchase Invoice',      url: '/app/purchase-invoice' },
              { label: 'Purchase Receipt',      url: '/app/purchase-receipt' }
            ]
          },
          {
            title: 'Suppliers',
            items: [
              { label: 'Supplier',       url: '/app/supplier' },
              { label: 'Supplier Group', url: '/app/supplier-group' }
            ]
          },
          {
            title: 'Setup',
            items: [
              { label: 'Buying Settings', url: '/app/buying-settings' }
            ]
          }
        ]
      },
      {
        id: 'items',
        label: 'Items & Pricing',
        url: '/app/item',
        groups: [
          {
            title: 'Catalog',
            items: [
              { label: 'Items',         url: '/app/item' },
              { label: 'Item Group',    url: '/app/item-group' },
              { label: 'Product Bundle',url: '/app/product-bundle' }
            ]
          },
          {
            title: 'Pricing',
            items: [
              { label: 'Price List',    url: '/app/price-list' },
              { label: 'Item Price',    url: '/app/item-price' }
            ]
          }
        ]
      },
      {
        id: 'banking',
        label: 'Banking',
        url: '/app/bank-account',
        groups: [
          {
            title: 'Accounts',
            items: [
              { label: 'Bank Account',     url: '/app/bank-account' },
              { label: 'Bank Transaction', url: '/app/bank-transaction' }
            ]
          },
          {
            title: 'Tools',
            items: [
              { label: 'Bank Reconciliation', url: '/app/bank-reconciliation-tool' }
            ]
          }
        ]
      },
      {
        id: 'accounting',
        label: 'Accounting',
        url: '/app/accounts',
        groups: [
          {
            title: 'General Ledger',
            items: [
              { label: 'Chart of Accounts', url: '/app/account' },
              { label: 'Company',           url: '/app/company' },
              { label: 'Customer',          url: '/app/customer' },
              { label: 'Supplier',          url: '/app/supplier' },
              { label: 'Journal Entry',     url: '/app/journal-entry' },
              { label: 'Payment Entry',     url: '/app/payment-entry' },
              { label: 'Receipt Entry',     url: '/app/payment-entry?payment_type=Receive' },
              { label: 'Contra Entry',      url: '/app/journal-entry?entry_type=Contra' }
            ]
          },
          {
            title: 'Invoicing & Vouchers',
            items: [
              { label: 'Sales Invoice',    url: '/app/sales-invoice' },
              { label: 'Purchase Invoice', url: '/app/purchase-invoice' },
              { label: 'Debit Note',       url: '/app/purchase-invoice?is_debit_note=1' },
              { label: 'Credit Note',      url: '/app/sales-invoice?is_credit_note=1' }
            ]
          },
          {
            title: 'Transactions & Orders',
            items: [
              { label: 'Delivery Note',    url: '/app/delivery-note' },
              { label: 'Purchase Order',   url: '/app/purchase-order' },
              { label: 'Payment Terms',    url: '/app/payment-terms-template' }
            ]
          },
          {
            title: 'Accounting Setup',
            items: [
              { label: 'Cost Center',       url: '/app/cost-center' },
              { label: 'Budget',            url: '/app/budget' },
              { label: 'Opening Entry',     url: '/app/opening-invoice-creation-tool' },
              { label: 'Accounts Settings', url: '/app/accounts-settings' }
            ]
          }
        ]
      },
      {
        id: 'stock',
        label: 'Stock & Inventory',
        url: '/app/stock-entry',
        groups: [
          {
            title: 'Transactions',
            items: [
              { label: 'Stock Entry',      url: '/app/stock-entry' },
              { label: 'Delivery Note',    url: '/app/delivery-note' },
              { label: 'Purchase Receipt', url: '/app/purchase-receipt' }
            ]
          },
          {
            title: 'Warehouse Details',
            items: [
              { label: 'Warehouses',       url: '/app/warehouse' },
              { label: 'Serial No',        url: '/app/serial-no' },
              { label: 'Batch',            url: '/app/batch' }
            ]
          },
          {
            title: 'Reports',
            items: [
              { label: 'Stock Ledger',     url: '/app/query-report/Stock%20Ledger' },
              { label: 'Stock Balance',    url: '/app/query-report/Stock%20Balance' }
            ]
          }
        ]
      },
      {
        id: 'manufacturing',
        label: 'Manufacturing',
        url: '/app/bom',
        groups: [
          {
            title: 'Production',
            items: [
              { label: 'Work Order',      url: '/app/work-order' },
              { label: 'BOM',             url: '/app/bom' },
              { label: 'Job Card',        url: '/app/job-card' },
              { label: 'Production Plan', url: '/app/production-plan' }
            ]
          },
          {
            title: 'Setup',
            items: [
              { label: 'Timesheet',       url: '/app/timesheet' },
              { label: 'Manufacturing Settings', url: '/app/manufacturing-settings' }
            ]
          }
        ]
      },
      {
        id: 'payroll',
        label: 'Payroll',
        url: '/app/payroll-entry',
        groups: [
          {
            title: 'Processing',
            items: [
              { label: 'Payroll Entry',    url: '/app/payroll-entry' },
              { label: 'Salary Slip',      url: '/app/salary-slip' },
              { label: 'Salary Structure', url: '/app/salary-structure' }
            ]
          }
        ]
      },
      {
        id: 'projects',
        label: 'Projects',
        url: '/app/project',
        groups: [
          {
            title: 'Tracking',
            items: [
              { label: 'Projects',         url: '/app/project' },
              { label: 'Tasks',            url: '/app/task' },
              { label: 'Project Milestones', url: '/app/task?is_milestone=1' }
            ]
          }
        ]
      },
      {
        id: 'assets',
        label: 'Assets',
        url: '/app/asset',
        groups: [
          {
            title: 'Lifecycle',
            items: [
              { label: 'Asset',             url: '/app/asset' },
              { label: 'Asset Category',    url: '/app/asset-category' },
              { label: 'Depreciation Schedule', url: '/app/asset-depreciation-schedule' }
            ]
          }
        ]
      },
      // GST tab removed as india-compliance / GST is not installed
      {
        id: 'reports',
        label: 'Financial Reports',
        url: '/app/query-report/Profit%20and%20Loss%20Statement',
        groups: [
          {
            title: 'Statements',
            items: [
              { label: 'Profit & Loss Statement', url: '/app/query-report/Profit%20and%20Loss%20Statement' },
              { label: 'Balance Sheet',           url: '/app/query-report/Balance%20Sheet' },
              { label: 'Trial Balance',           url: '/app/query-report/Trial%20Balance' }
            ]
          }
        ]
      },
      {
        id: 'settings',
        label: 'ERP Settings',
        url: '/app/selling-settings',
        groups: [
          {
            title: 'Module Settings',
            items: [
              { label: 'Selling Settings',   url: '/app/selling-settings' },
              { label: 'Buying Settings',    url: '/app/buying-settings' },
              { label: 'Stock Settings',     url: '/app/stock-settings' },
              { label: 'Accounts Settings',  url: '/app/accounts-settings' }
            ]
          }
        ]
      }
    ]
  },

  crm: {
    label: 'CRM Portal',
    tabs: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        url: '/app/crm',
        groups: [
          {
            title: 'Overview',
            items: [
              { label: 'CRM Dashboard', url: '/app/crm' }
            ]
          }
        ]
      },
      {
        id: 'leads',
        label: 'Leads & Contacts',
        url: '/app/lead',
        groups: [
          {
            title: 'Prospecting',
            items: [
              { label: 'Leads',    url: '/app/lead' },
              { label: 'Contacts', url: '/app/contact' }
            ]
          }
        ]
      },
      {
        id: 'deals',
        label: 'Deals & Opportunities',
        url: '/app/opportunity',
        groups: [
          {
            title: 'Sales Pipeline',
            items: [
              { label: 'Opportunities', url: '/app/opportunity' },
              { label: 'Customers',     url: '/app/customer' }
            ]
          }
        ]
      },
      {
        id: 'settings',
        label: 'CRM Settings',
        url: '/app/crm-settings',
        groups: [
          {
            title: 'Configuration',
            items: [
              { label: 'CRM Settings', url: '/app/crm-settings' }
            ]
          }
        ]
      }
    ]
  },

  hrms: {
    label: 'HR & Payroll Suite',
    tabs: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        url: '/app/hr',
        groups: [
          {
            title: 'Overview',
            items: [
              { label: 'HR Workspace', url: '/app/hr' }
            ]
          }
        ]
      },
      {
        id: 'employees',
        label: 'Employees',
        url: '/app/employee',
        groups: [
          {
            title: 'Directory',
            items: [
              { label: 'Employees',    url: '/app/employee' },
              { label: 'Departments',  url: '/app/department' },
              { label: 'Designations', url: '/app/designation' }
            ]
          }
        ]
      },
      {
        id: 'attendance',
        label: 'Attendance',
        url: '/app/attendance',
        groups: [
          {
            title: 'Tracking',
            items: [
              { label: 'Attendance',         url: '/app/attendance' },
              { label: 'Leave Applications', url: '/app/leave-application' },
              { label: 'Shift Types',        url: '/app/shift-type' }
            ]
          }
        ]
      },
      {
        id: 'payroll',
        label: 'Payroll',
        url: '/app/payroll-entry',
        groups: [
          {
            title: 'Compensation',
            items: [
              { label: 'Payroll Entry',    url: '/app/payroll-entry' },
              { label: 'Salary Slip',      url: '/app/salary-slip' },
              { label: 'Salary Structure', url: '/app/salary-structure' }
            ]
          }
        ]
      },
      {
        id: 'settings',
        label: 'HR Settings',
        url: '/app/hr-settings',
        groups: [
          {
            title: 'Configuration',
            items: [
              { label: 'HR Settings', url: '/app/hr-settings' }
            ]
          }
        ]
      }
    ]
  },

  pos: {
    label: 'Point of Sale',
    tabs: [
      {
        id: 'sales',
        label: 'Sales Screen',
        url: '/app/pos-invoice',
        groups: [
          {
            title: 'Retail Operations',
            items: [
              { label: 'POS Invoices', url: '/app/pos-invoice' },
              { label: 'POS Opening',  url: '/app/pos-opening-entry' },
              { label: 'POS Closing',  url: '/app/pos-closing-entry' }
            ]
          }
        ]
      },
      {
        id: 'configuration',
        label: 'Configuration',
        url: '/app/pos-profile',
        groups: [
          {
            title: 'Retail Setup',
            items: [
              { label: 'POS Profile', url: '/app/pos-profile' },
              { label: 'Price List',   url: '/app/price-list' }
            ]
          }
        ]
      }
    ]
  },

  projects: {
    label: 'Projects',
    tabs: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        url: '/app/project',
        groups: [
          {
            title: 'Overview',
            items: [
              { label: 'Projects Home', url: '/app/project' }
            ]
          }
        ]
      },
      {
        id: 'tracking',
        label: 'Work Tracking',
        url: '/app/task',
        groups: [
          {
            title: 'Tasks & Times',
            items: [
              { label: 'All Tasks',  url: '/app/task' },
              { label: 'Timesheets', url: '/app/timesheet' }
            ]
          }
        ]
      },
      {
        id: 'billing',
        label: 'Billing & Expenses',
        url: '/app/expense-claim',
        groups: [
          {
            title: 'Claims',
            items: [
              { label: 'Expense Claims', url: '/app/expense-claim' }
            ]
          }
        ]
      }
    ]
  },

  automation: {
    label: 'Automation',
    tabs: [
      {
        id: 'rules',
        label: 'Assignment Rules',
        url: '/app/assignment-rule',
        groups: [
          {
            title: 'Assignments',
            items: [
              { label: 'Assignment Rules', url: '/app/assignment-rule' },
              { label: 'Auto Repeat',      url: '/app/auto-repeat' }
            ]
          }
        ]
      },
      {
        id: 'workflows',
        label: 'Workflows',
        url: '/app/workflow',
        groups: [
          {
            title: 'Approvals & Actions',
            items: [
              { label: 'Workflows',        url: '/app/workflow' },
              { label: 'Workflow Actions', url: '/app/workflow-action' },
              { label: 'Notifications',    url: '/app/notification' }
            ]
          }
        ]
      }
    ]
  },

  reports: {
    label: 'Reports & Dashboards',
    tabs: [
      {
        id: 'builder',
        label: 'Report Builder',
        url: '/app/report',
        groups: [
          {
            title: 'Custom Reports',
            items: [
              { label: 'Query Reports',  url: '/app/report' },
              { label: 'Report Builder', url: '/app/report' }
            ]
          }
        ]
      },
      {
        id: 'dashboards',
        label: 'Dashboards',
        url: '/app/dashboard',
        groups: [
          {
            title: 'Visualizations',
            items: [
              { label: 'Dashboards',      url: '/app/dashboard' },
              { label: 'Dashboard Charts',url: '/app/dashboard-chart' }
            ]
          }
        ]
      }
    ]
  },

  files: {
    label: 'Files Explorer',
    tabs: [
      {
        id: 'explorer',
        label: 'Files Explorer',
        url: '/app/file',
        groups: [
          {
            title: 'Storage',
            items: [
              { label: 'All Files',   url: '/app/file' },
              { label: 'Attachments', url: '/app/file?attached_to_doctype=not+null' }
            ]
          }
        ]
      }
    ]
  },

  calendar: {
    label: 'Calendar & Events',
    tabs: [
      {
        id: 'events',
        label: 'Events & Tasks',
        url: '/app/event',
        groups: [
          {
            title: 'Agenda',
            items: [
              { label: 'All Events',    url: '/app/event' },
              { label: 'Task Calendar', url: '/app/task?view=Calendar' }
            ]
          }
        ]
      }
    ]
  },

  calls: {
    label: 'Call Log',
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
              { label: 'Missed Calls', url: '/app/call-log?status=Missed' }
            ]
          }
        ]
      }
    ]
  },

  settings: {
    label: 'Settings Portal',
    tabs: [
      {
        id: 'system',
        label: 'System Admin',
        url: '/app/system-settings',
        groups: [
          {
            title: 'Admin Tools',
            items: [
              { label: 'System Settings',  url: '/app/system-settings' },
              { label: 'Users Directory',  url: '/app/user' },
              { label: 'Role Permissions', url: '/app/role-permission-manager' }
            ]
          }
        ]
      },
      {
        id: 'customize',
        label: 'Customization',
        url: '/app/custom-field',
        groups: [
          {
            title: 'DocTypes & Form fields',
            items: [
              { label: 'Custom Fields',  url: '/app/custom-field' },
              { label: 'Customize Form', url: '/app/customize-form' },
              { label: 'Print Formats',  url: '/app/print-format' },
              { label: 'Email Templates',url: '/app/email-template' }
            ]
          }
        ]
      }
    ]
  }
};
