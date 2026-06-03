import React, { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import GlobalSearch from './GlobalSearch.jsx';

export default function TopHeader() {
  const company = (window.frappe && window.frappe.boot && window.frappe.boot.sysdefaults && window.frappe.boot.sysdefaults.company) || 'AxonAI Corp';
  const user = (window.frappe && window.frappe.session && window.frappe.session.user_fullname) || 'User';
  const initial = user.charAt(0).toUpperCase();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    if (window.frappe && window.frappe.app && window.frappe.app.logout) {
      window.frappe.app.logout();
    } else {
      window.location.href = '/logout';
    }
  };

  return (
    <header className="ax-topbar">
      {/* Left: Hamburger + Organization / Brand */}
      <div className="ax-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="ax-mobile-menu-btn" 
          onClick={() => document.body.classList.toggle('ax-mobile-sidebar-open')}
          title="Toggle Menu"
        >
          <Menu size={20} />
        </button>
        <div className="ax-topbar-brand">
          {company}
        </div>
      </div>

      {/* Center: Search */}
      <GlobalSearch />

      {/* Right: Notifications + Profile */}
      <div className="ax-topbar-actions">
        {/* Notifications Button */}
        <button className="ax-topbar-btn" title="Notifications">
          <Bell size={18} />
          <span className="ax-badge">3</span>
        </button>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <button 
            className="ax-profile-dropdown-trigger" 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            title="Profile Settings"
          >
            <div className="ax-profile-avatar">{initial}</div>
            <span className="ax-profile-name">{user}</span>
          </button>

          {showProfileDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              background: '#FFFFFF',
              border: '1px solid var(--ax-border)',
              borderRadius: 'var(--ax-radius-md)',
              boxShadow: 'var(--ax-shadow-md)',
              width: '180px',
              padding: '4px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <a 
                href="/app/user" 
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--ax-text-primary)',
                  textDecoration: 'none',
                  borderRadius: 'var(--ax-radius-sm)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                My Profile
              </a>
              <a 
                href="/app/system-settings" 
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--ax-text-primary)',
                  textDecoration: 'none',
                  borderRadius: 'var(--ax-radius-sm)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                System Settings
              </a>
              <div style={{ height: '1px', background: 'var(--ax-border)', margin: '4px 0' }} />
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--ax-danger)',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: 'var(--ax-radius-sm)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.background = '#FEF2F2'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
