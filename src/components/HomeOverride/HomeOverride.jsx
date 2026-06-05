import React from 'react';

export default function HomeOverride() {
  const company = window.frappe?.boot?.sysdefaults?.company || 'Your Organization';
  const user = window.frappe?.session?.user_fullname || 'User';
  const firstName = user.split(' ')[0];

  const handleShortcutClick = (e, url) => {
    e.preventDefault();
    if (window.frappe && window.frappe.set_route && url.startsWith('/app/')) {
      const cleanUrl = url.replace(/^\/app\//, '');
      window.frappe.set_route(cleanUrl.split('/'));
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className="ax-home" id="ax-home-override">
      <div className="ax-home-header">
        <h1 className="ax-home-greeting">Good morning, {firstName} 👋</h1>
        <p className="ax-home-subtitle">{company} — Enterprise Workspace</p>
      </div>

      <div className="ax-home-shortcuts">
        <h2 className="ax-home-section-title">Quick Access</h2>
        <div className="ax-home-grid">
          {QUICK_LINKS.map(link => (
            <a 
              key={link.label} 
              href={link.url} 
              className="ax-home-card"
              onClick={(e) => handleShortcutClick(e, link.url)}
            >
              <span className="ax-home-card-icon">{link.icon}</span>
              <span className="ax-home-card-label">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  { label: 'Sales Orders',    url: '/app/sales-order',    icon: '📦' },
  { label: 'Leads',           url: '/crm/leads',          icon: '🎯' },
  { label: 'Employees',       url: '/app/employee',       icon: '👥' },
  { label: 'Expense Claims',  url: '/app/expense-claim',  icon: '💳' },
  { label: 'Mail',            url: '/mail',               icon: '✉️' },
  { label: 'Reports',         url: '/app/report',         icon: '📊' },
];
