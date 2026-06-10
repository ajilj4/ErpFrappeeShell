/**
 * ModuleNav.jsx
 * AxonAI One — Horizontal Module Tab Bar (Level 2 Navigation)
 *
 * Renders horizontal tabs from Frappe v16 boot data (workspace_sidebar_item)
 * for the active module. Falls back to static config when boot is unavailable.
 *
 * FIXED: Uses useMemo for synchronous tab computation — prevents flash
 *        between module changes where old tabs briefly render.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { buildModuleTabs, STATIC_NAVIGATION } from '../../data/subNavConfig.js';
import { useRoute } from '../../hooks/useRoute.js';

export default function ModuleNav() {
  const { activeModule, activeTab, navigate } = useRoute();

  // ── Boot data retry: increment after 600ms to re-trigger useMemo ─────
  const [bootVersion, setBootVersion] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setBootVersion((v) => v + 1), 600);
    return () => clearTimeout(timer);
  }, [activeModule]);

  // ── Compute tabs synchronously ───────────────────────────────────────
  const tabs = useMemo(() => {
    const liveTabs = buildModuleTabs(activeModule);
    if (liveTabs.length > 0) return liveTabs;
    const staticData = STATIC_NAVIGATION[activeModule];
    return staticData?.tabs || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule, bootVersion]);

  const handleClick = (e, tab) => {
    e.preventDefault();
    e.stopPropagation();
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
