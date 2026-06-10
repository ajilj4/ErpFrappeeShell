import React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import logo from '../../assets/axonaiologo.webp';

export default function SidebarLogo({ collapsed, onToggleCollapse }) {
  return (
    <div className="ax-sidebar-logo">
      <div className="ax-logo-icon">
        <img src={logo} alt="AxonAI" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
      </div>
      {!collapsed && (
        <div className="ax-logo-name">
          AxonAI One
          <span className="ax-logo-subtitle">Enterprise Suite</span>
        </div>
      )}
      <button 
        className="ax-collapse-btn" 
        onClick={onToggleCollapse} 
        title={collapsed ? "Expand sidebar and show labels" : "Collapse sidebar to icons only"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>
    </div>
  );
}
