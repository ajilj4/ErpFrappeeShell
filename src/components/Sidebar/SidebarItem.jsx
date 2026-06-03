import React from 'react';

export default function SidebarItem({ item, collapsed, isActive, onClick }) {
  const IconComponent = item.icon;
  return (
    <a
      href={item.url}
      className={`ax-nav-item ${isActive ? 'ax-nav-active' : ''}`}
      onClick={(e) => {
        if (item.url === '#copilot') {
          e.preventDefault();
          e.stopPropagation();
        }
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
