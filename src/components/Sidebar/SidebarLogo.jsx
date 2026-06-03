import React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function SidebarLogo({ collapsed, onToggleCollapse }) {
  return (
    <div className="ax-sidebar-logo">
      <div className="ax-logo-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L22 7V17L12 22L2 17V7L12 2Z" fill="white" fill-opacity="0.15" stroke="white" stroke-opacity="0.5" stroke-width="1"/>
          <text x="12" y="15.5" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="-0.5">AX</text>
        </svg>
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
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>
    </div>
  );
}
