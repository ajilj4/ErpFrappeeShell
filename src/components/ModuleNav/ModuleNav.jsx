/**
 * ModuleNav.jsx
 * AxonAI One — Horizontal Module Tab Bar (Level 2 Navigation)
 *
 * Renders the horizontal tabs directly below the TopHeader based on the selected
 * primary sidebar module (Level 1). Synchronizes with activeTab.
 */

import React from 'react';
import { NAVIGATION } from '../../data/subNavConfig.js';
import { useRoute } from '../../hooks/useRoute.js';

export default function ModuleNav() {
  const { activeModule, activeTab, navigate } = useRoute();

  const moduleData = NAVIGATION[activeModule];
  const tabs = moduleData?.tabs || [];

  const handleClick = (e, tab) => {
    e.preventDefault();
    navigate(tab.url);
  };

  // If no horizontal tabs exist for the active module, don't render anything
  if (tabs.length === 0) {
    return null;
  }

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
