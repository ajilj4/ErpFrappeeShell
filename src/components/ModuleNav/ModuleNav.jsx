/**
 * ModuleNav.jsx
 * AxonAI One — Horizontal Module Tab Bar (Level 2 Navigation)
 *
 * Renders horizontal tabs from Frappe v16 boot data (workspace_sidebar_item)
 * for the active module. Falls back to static config when boot is unavailable.
 */

import React, { useState, useEffect } from 'react';
import { buildModuleTabs, STATIC_NAVIGATION } from '../../data/subNavConfig.js';
import { useRoute } from '../../hooks/useRoute.js';

export default function ModuleNav() {
  const { activeModule, activeTab, navigate } = useRoute();
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    function computeTabs() {
      // Try live Frappe v16 boot data first
      const liveTabs = buildModuleTabs(activeModule);
      if (liveTabs.length > 0) {
        setTabs(liveTabs);
        return;
      }
      // Static fallback
      const staticData = STATIC_NAVIGATION[activeModule];
      setTabs(staticData?.tabs || []);
    }

    computeTabs();
    // Retry after boot data loads
    const timer = setTimeout(computeTabs, 600);
    return () => clearTimeout(timer);
  }, [activeModule]);

  const handleClick = (e, tab) => {
    e.preventDefault();
    navigate(tab.url);
  };

  if (tabs.length === 0) return null;

  return (
    <nav className="ax-module-nav" aria-label="Module navigation">
      <div className="ax-module-nav-inner">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <a
              key={tab.id}
              href={tab.url}
              className={`ax-module-tab${isActive ? ' ax-module-tab--active' : ''}`}
              onClick={(e) => handleClick(e, tab)}
              aria-current={isActive ? 'page' : undefined}
              title={tab.label}
            >
              <span className="ax-module-tab-label">{tab.label}</span>
              {isActive && <span className="ax-module-tab-indicator" />}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
