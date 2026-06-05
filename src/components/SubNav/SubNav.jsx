/**
 * SubNav.jsx
 * AxonAI One — Contextual Vertical Sub-Navigation Panel
 *
 * Reads live data from frappe.boot.workspace_sidebar_item (Frappe v16)
 * and falls back to static config when boot data is unavailable.
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { buildModuleTabs, STATIC_NAVIGATION } from '../../data/subNavConfig.js';
import { useRoute } from '../../hooks/useRoute.js';

// ── SubNavGroup ────────────────────────────────────────────────────────────

function SubNavGroup({ group, onNavigate }) {
  const [expanded, setExpanded] = useState(true);

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
            const currentPath = window.location.pathname;
            const urlBase = item.url.split('?')[0];
            const isActive = urlBase !== '/' && urlBase !== '/app' && urlBase !== '/crm' && urlBase !== '/mail' && (
              currentPath === urlBase ||
              currentPath.startsWith(urlBase + '/')
            );
            return (
              <li key={item.url + item.label}>
                <a
                  href={item.url}
                  className={`ax-subnav-item${isActive ? ' ax-subnav-item--active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.url);
                    document.body.classList.remove('ax-mobile-sidebar-open');
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
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

// ── SubNav ─────────────────────────────────────────────────────────────────

export default function SubNav() {
  const { activeModule, activeTab, navigate } = useRoute();
  const [tabs, setTabs] = useState([]);

  // Re-compute tabs when module changes or when frappe.boot becomes available
  useEffect(() => {
    function computeTabs() {
      // Try live boot data first
      const liveTabs = buildModuleTabs(activeModule);
      if (liveTabs.length > 0) {
        setTabs(liveTabs);
        return;
      }
      // Fallback to static config
      const staticData = STATIC_NAVIGATION[activeModule];
      setTabs(staticData?.tabs || []);
    }

    computeTabs();

    // Re-compute once Frappe boot data becomes available
    const timer = setTimeout(computeTabs, 500);
    return () => clearTimeout(timer);
  }, [activeModule]);

  // Find the active tab config.
  // When activeTab is null (catch-all route), show nothing rather than
  // incorrectly defaulting to the first tab (e.g. "Organisation" for every page).
  const activeTabConfig = activeTab
    ? (tabs.find((t) => t.id === activeTab) || tabs[0] || null)
    : null;
  const label = activeTabConfig?.label || '';
  const groups = activeTabConfig?.groups || [];

  const hasSubNav = groups.length > 0;

  useEffect(() => {
    document.body.classList.toggle('ax-has-subnav', hasSubNav);
    return () => {
      document.body.classList.remove('ax-has-subnav');
    };
  }, [hasSubNav]);

  if (!hasSubNav) return null;

  return (
    <aside className="ax-subnav" id="ax-subnav" aria-label={`${label} navigation`}>
      {/* Header */}
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
