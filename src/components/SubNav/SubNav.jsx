/**
 * SubNav.jsx
 * AxonAI One — Contextual Vertical Sub-Navigation Panel (Level 3 Navigation)
 *
 * Appears as a secondary left panel, displaying grouped links for the selected
 * horizontal ModuleNav tab (Level 2). Automatically handles layout shifts.
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { NAVIGATION } from '../../data/subNavConfig.js';
import { useRoute } from '../../hooks/useRoute.js';

function SubNavGroup({ group, onNavigate }) {
  const [expanded, setExpanded] = useState(true);

  // Check if any of the items in this group matches the current URL path
  const hasActive = group.items.some((item) =>
    window.location.pathname.startsWith(item.url.split('?')[0])
  );

  return (
    <div className={`ax-subnav-group${hasActive ? ' ax-subnav-group--has-active' : ''}`}>
      {group.title && (
        <button
          className="ax-subnav-group-header"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          <span className="ax-subnav-group-title">{group.title}</span>
          <span className="ax-subnav-group-chevron">
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        </button>
      )}

      {expanded && (
        <ul className="ax-subnav-items" role="list">
          {group.items.map((item) => {
            const urlBase = item.url.split('?')[0];
            const isActive = window.location.pathname.startsWith(urlBase);
            return (
              <li key={item.url}>
                <a
                  href={item.url}
                  className={`ax-subnav-item${isActive ? ' ax-subnav-item--active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.url);
                    document.body.classList.remove('ax-mobile-sidebar-open');
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="ax-subnav-item-dot" />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function SubNav() {
  const { activeModule, activeTab, navigate } = useRoute();

  const moduleData = NAVIGATION[activeModule];
  const activeTabConfig = moduleData?.tabs?.find((t) => t.id === activeTab);
  const label = activeTabConfig?.label || '';
  const groups = activeTabConfig?.groups || [];

  const hasSubNav = groups.length > 0;

  useEffect(() => {
    document.body.classList.toggle('ax-has-subnav', hasSubNav);
    return () => {
      document.body.classList.remove('ax-has-subnav');
    };
  }, [hasSubNav]);

  // Don't render if no sub-navigation links exist
  if (!hasSubNav) {
    return null;
  }

  return (
    <aside className="ax-subnav" id="ax-subnav" aria-label={`${label} navigation`}>
      {/* Module tab label header */}
      <div className="ax-subnav-header">
        <button 
          className="ax-subnav-back-btn"
          onClick={() => document.body.classList.add('ax-mobile-subnav-hidden')}
          title="Back to Modules"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="ax-subnav-module-label">{label}</span>
      </div>

      {/* Scrollable group list */}
      <div className="ax-subnav-body">
        {groups.map((group, idx) => (
          <SubNavGroup
            key={group.title || idx}
            group={group}
            onNavigate={navigate}
          />
        ))}
      </div>
    </aside>
  );
}
