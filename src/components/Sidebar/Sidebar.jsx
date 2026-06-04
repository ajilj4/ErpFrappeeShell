import React, { useEffect, useState } from 'react';
import SidebarLogo from './SidebarLogo.jsx';
import SidebarItem from './SidebarItem.jsx';
import SidebarFooter from './SidebarFooter.jsx';
import { MENU } from '../../data/menuConfig.js';
import { useRoute } from '../../hooks/useRoute.js';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const { activeModule, navigate } = useRoute();

  useEffect(() => {
    document.body.classList.toggle('ax-sidebar-collapsed', collapsed);
  }, [collapsed]);

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const handleItemClick = (item) => {
    if (item.url === '#copilot') {
      // Toggle the AI Copilot drawer
      if (typeof window.__axonai_copilot_toggle === 'function') {
        window.__axonai_copilot_toggle();
      }
      return;
    }
    navigate(item.url);
    // On mobile, close sidebar and restore subnav state
    document.body.classList.remove('ax-mobile-sidebar-open');
    document.body.classList.remove('ax-mobile-subnav-hidden');
  };

  let lastSection = null;

  return (
    <>
      <div id="ax-sidebar">
        <SidebarLogo collapsed={collapsed} onToggleCollapse={toggleCollapse} />
        
        <nav className="ax-sidebar-nav">
          {MENU.map((item, idx) => {
            const showSectionLabel = item.section && item.section !== lastSection;
            if (showSectionLabel) {
              lastSection = item.section;
            }
            
            return (
              <React.Fragment key={item.id || idx}>
                {showSectionLabel && !collapsed && (
                  <div className="ax-section-label">{item.section}</div>
                )}
                <SidebarItem 
                  item={item} 
                  collapsed={collapsed} 
                  isActive={activeModule === item.id} 
                  onClick={handleItemClick}
                />
                {item.dividerAfter && <div className="ax-sidebar-divider" />}
              </React.Fragment>
            );
          })}
        </nav>

        <SidebarFooter collapsed={collapsed} />
      </div>
      
      {/* Mobile background overlay click backdrop */}
      <div 
        className="ax-sidebar-backdrop" 
        onClick={() => {
          document.body.classList.remove('ax-mobile-sidebar-open');
          document.body.classList.remove('ax-mobile-subnav-hidden');
        }}
      />
    </>
  );
}
