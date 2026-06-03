import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function SidebarFooter({ collapsed }) {
  // Read user session from Frappe
  const user = (window.frappe && window.frappe.session && window.frappe.session.user_fullname) || 
               (window.frappe && window.frappe.session && window.frappe.session.user) || 
               'User';
  const initial = user.charAt(0).toUpperCase();

  return (
    <div className="ax-sidebar-footer">
      <a href="/app/user" className="ax-nav-item ax-footer-help" title="Help & Docs">
        <span className="ax-nav-icon">
          <HelpCircle size={18} />
        </span>
        {!collapsed && <span className="ax-nav-label">Help</span>}
      </a>
      
      <div className="ax-user-row" id="ax-user-row">
        <div className="ax-user-avatar">{initial}</div>
        {!collapsed && (
          <div className="ax-user-info">
            <span className="ax-user-name">{user}</span>
            <span className="ax-user-status">
              <span className="ax-online-dot"></span>
              Online
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
