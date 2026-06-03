import frappe
frappe.init(site='local.test', sites_path='/workspace/development/frappe-bench/sites')
frappe.connect()
doctypes_to_check = [
    'Lead', 'CRM Lead', 'CRM Deal', 'Opportunity', 'Task', 'Project',
    'Attendance', 'Leave Application', 'Shift Type', 'HR Settings',
    'CRM Settings', 'POS Invoice', 'POS Opening Entry', 'POS Closing Entry',
    'POS Profile', 'Bank Reconciliation', 'Expense Claim', 'Salary Slip',
    'Salary Structure', 'Payroll Entry', 'Employee', 'Department', 'Designation',
    'Work Order', 'BOM', 'Job Card', 'Production Plan', 'Timesheet',
    'Asset', 'Asset Category', 'Asset Depreciation Schedule',
    'GST Settings', 'GST HSN Code', 'Assignment Rule', 'Auto Repeat',
    'Workflow', 'Workflow Action', 'Notification',
    'Call Log', 'Event', 'Dashboard', 'Dashboard Chart',
    'System Settings', 'Custom Field', 'Print Format', 'Email Template',
    'Quotation', 'Sales Order', 'Sales Invoice', 'Delivery Note',
    'Customer', 'Customer Group', 'Selling Settings',
    'Request for Quotation', 'Supplier Quotation', 'Purchase Order',
    'Purchase Invoice', 'Purchase Receipt', 'Supplier', 'Supplier Group',
    'Buying Settings', 'Item', 'Item Group', 'Product Bundle',
    'Price List', 'Item Price', 'Bank Account', 'Bank Transaction',
    'Stock Entry', 'Warehouse', 'Serial No', 'Batch',
    'Company', 'Journal Entry', 'Payment Entry',
    'Cost Center', 'Budget', 'Accounts Settings',
    'Query Report', 'Report', 'File', 'Contact',
    'Stock Settings', 'Manufacturing Settings',
    'Customize Form',
    'Opening Invoice Creation Tool',
    'Payment Terms Template',
    'Point of Sale Settings',
    'Project Milestone'
]
missing = []
for dt in doctypes_to_check:
    exists = frappe.db.exists('DocType', dt)
    if not exists:
        missing.append(dt)
print('MISSING DOCTYPES:')
for m in missing:
    print(f'  {m}')
print(f'Total checked: {len(doctypes_to_check)}, Missing: {len(missing)}')
frappe.destroy()
