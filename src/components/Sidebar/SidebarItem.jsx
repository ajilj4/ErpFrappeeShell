import React from 'react';

export default function SidebarItem({ item, collapsed, isActive, onClick }) {
  const IconComponent = item.icon;
  return (
    <a
      href={item.url}
      className={`ax-nav-item ${isActive ? 'ax-nav-active' : ''}`}
      onClick={(e) => {
        // Always prevent default — navigate() in useRoute handles ALL routing:
        //   • /app/* → frappe.set_route() (Frappe desk SPA navigation)
        //   • /crm, /mail → window.location.href (same-tab full-page navigation)
        //   • /desk/* → window.location.href (Frappe desk direct routes)
        //   • #copilot → toggle AI Copilot drawer
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick(item);
      }}
      title={collapsed ? item.label : ''}
    >
      <span className="ax-nav-icon">
        <IconComponent size={18} />
      </span>
      {!collapsed && <span className="ax-nav-label">{item.label}</span>}
    </a>
  );
}

