/**
 * SubNav.jsx
 * AxonAI One — Contextual Vertical Sub-Navigation Panel
 *
 * Reads live data from frappe.boot.workspace_sidebar_item (Frappe v16)
 * and falls back to static config when boot data is unavailable.
 *
 * FIXED: Uses useMemo for synchronous tab computation (no flash between
 *        module changes). Always shows first tab content when activeTab
 *        doesn't match — prevents SubNav from hiding unexpectedly.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { buildModuleTabs, STATIC_NAVIGATION } from '../../data/subNavConfig.js';
import { useRoute, normalizePath } from '../../hooks/useRoute.js';

// ── SubNavGroup ────────────────────────────────────────────────────────────

function SubNavGroup({ group, onNavigate }) {
  const [expanded, setExpanded] = useState(true);

  const hasActive = group.items.some((item) =>
    normalizePath(window.location.pathname).startsWith(item.url.split('?')[0])
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
            const currentPath = normalizePath(window.location.pathname);
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

  // ── Boot data retry: increment after 500ms to re-trigger useMemo ─────
  const [bootVersion, setBootVersion] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setBootVersion((v) => v + 1), 500);
    return () => clearTimeout(timer);
  }, [activeModule]);

  // ── Compute tabs synchronously — no flash between module changes ─────
  const tabs = useMemo(() => {
    // Try live boot data first
    const liveTabs = buildModuleTabs(activeModule);
    if (liveTabs.length > 0) return liveTabs;
    // Fallback to static config
    const staticData = STATIC_NAVIGATION[activeModule];
    return staticData?.tabs || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule, bootVersion]);

  // ── Find the active tab config ───────────────────────────────────────
  // FIX: When activeTab doesn't match any tab, fall back to first tab
  //      instead of returning null. This prevents the SubNav from hiding
  //      when navigating to URLs that don't have a precise tab mapping.
  const activeTabConfig = tabs.length > 0
    ? (tabs.find((t) => t.id === activeTab) || tabs[0])
    : null;

  const label = activeTabConfig?.label || '';
  const groups = activeTabConfig?.groups || [];
  const hasSubNav = groups.length > 0;

  // ── Fetch Recent Files for Documents Module ──────────────────────────
  const [recentFiles, setRecentFiles] = useState([]);
  useEffect(() => {
    if (activeModule === 'documents' && window.frappe && window.frappe.call) {
      window.frappe.call({
        method: 'axonai_ui.onlyoffice.get_recent_documents',
        callback: (r) => {
          if (r.message) {
            setRecentFiles(r.message);
          }
        }
      });
    }
  }, [activeModule]);

  // Inject recent files into the static configuration
  const finalGroups = useMemo(() => {
    if (activeModule === 'documents' && recentFiles.length > 0) {
      const mappedGroups = JSON.parse(JSON.stringify(groups));
      const recentGroup = mappedGroups.find((g) => g.title === 'Recent Files');
      if (recentGroup) {
        recentGroup.items = recentFiles.map((f) => ({
          label: f.file_name,
          url: `/app/documents?file_name=${encodeURIComponent(f.file_name)}&file_url=${encodeURIComponent(f.file_url)}`
        }));
      }
      return mappedGroups;
    }
    return groups;
  }, [groups, activeModule, recentFiles]);

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
        {finalGroups.map((group, idx) => (
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
