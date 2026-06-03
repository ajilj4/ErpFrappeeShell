/**
 * useRoute.js
 * AxonAI One — 3-Level Routing Hook
 *
 * Tracks the active module (Level 1) and active tab (Level 2) by watching:
 *  1. window.location on mount
 *  2. frappe.router 'change' events (Frappe SPA navigation)
 *  3. browser popstate (back/forward buttons)
 */

import { useState, useEffect, useCallback } from 'react';
import { NAVIGATION } from '../data/subNavConfig.js';

function resolveRoute(pathname) {
  const path = pathname.split('?')[0];

  // 1. Walk through all modules in NAVIGATION to find a Level 3 item URL match
  for (const [moduleId, moduleData] of Object.entries(NAVIGATION)) {
    if (!moduleData.tabs) continue;
    for (const tab of moduleData.tabs) {
      if (tab.groups) {
        for (const group of tab.groups) {
          for (const item of group.items) {
            const itemPath = item.url.split('?')[0];
            // Exact match or sub-page match (like /app/sales-order/SO-0001)
            if (path === itemPath || (path.startsWith(itemPath + '/') && itemPath !== '/app/')) {
              return { moduleId, tabId: tab.id };
            }
          }
        }
      }
      // Match the tab's own URL
      const tabPath = tab.url.split('?')[0];
      if (path === tabPath || (path.startsWith(tabPath + '/') && tabPath !== '/app/')) {
        return { moduleId, tabId: tab.id };
      }
    }
  }

  // 2. Fallbacks for standard workspaces if no precise item matched
  if (path.startsWith('/app/home') || path === '/app' || path === '/app/') {
    return { moduleId: 'erp', tabId: 'dashboard' };
  }
  if (path.startsWith('/app/selling')) {
    return { moduleId: 'erp', tabId: 'sales' };
  }
  if (path.startsWith('/app/buying')) {
    return { moduleId: 'erp', tabId: 'purchases' };
  }
  if (path.startsWith('/app/item')) {
    return { moduleId: 'erp', tabId: 'items' };
  }
  if (path.startsWith('/app/bank-account')) {
    return { moduleId: 'erp', tabId: 'banking' };
  }
  if (path.startsWith('/app/accounts')) {
    return { moduleId: 'erp', tabId: 'accounting' };
  }
  if (path.startsWith('/app/stock-entry')) {
    return { moduleId: 'erp', tabId: 'stock' };
  }
  if (path.startsWith('/app/bom')) {
    return { moduleId: 'erp', tabId: 'manufacturing' };
  }
  if (path.startsWith('/app/payroll-entry')) {
    return { moduleId: 'erp', tabId: 'payroll' };
  }
  if (path.startsWith('/app/project')) {
    return { moduleId: 'projects', tabId: 'dashboard' };
  }
  if (path.startsWith('/app/asset')) {
    return { moduleId: 'erp', tabId: 'assets' };
  }
  if (path.startsWith('/app/gst-settings')) {
    return { moduleId: 'erp', tabId: 'gst' };
  }
  if (path.startsWith('/app/crm')) {
    return { moduleId: 'crm', tabId: 'dashboard' };
  }
  if (path.startsWith('/app/hr')) {
    return { moduleId: 'hrms', tabId: 'dashboard' };
  }
  if (path.startsWith('/app/pos-invoice')) {
    return { moduleId: 'pos', tabId: 'sales' };
  }
  if (path.startsWith('/app/assignment-rule')) {
    return { moduleId: 'automation', tabId: 'rules' };
  }
  if (path.startsWith('/app/query-report') || path.startsWith('/app/report')) {
    return { moduleId: 'reports', tabId: 'builder' };
  }
  if (path.startsWith('/app/file')) {
    return { moduleId: 'files', tabId: 'explorer' };
  }
  if (path.startsWith('/app/event')) {
    return { moduleId: 'calendar', tabId: 'events' };
  }
  if (path.startsWith('/app/call-log')) {
    return { moduleId: 'calls', tabId: 'logs' };
  }
  if (path.startsWith('/app/system-settings') || path.startsWith('/app/user') || path.startsWith('/app/role')) {
    return { moduleId: 'settings', tabId: 'system' };
  }

  // Default catch-all
  return { moduleId: 'erp', tabId: 'dashboard' };
}

export function useRoute() {
  const [routeState, setRouteState] = useState(() =>
    resolveRoute(window.location.pathname)
  );

  const sync = useCallback(() => {
    setRouteState(resolveRoute(window.location.pathname));
  }, []);

  useEffect(() => {
    // Frappe SPA router (hash-based) fires 'change' on route transitions
    if (window.frappe && window.frappe.router) {
      window.frappe.router.on('change', sync);
    }

    // Standard browser back/forward button support
    window.addEventListener('popstate', sync);

    // Initial sync
    sync();

    return () => {
      if (window.frappe && window.frappe.router) {
        if (typeof window.frappe.router.off === 'function') {
          window.frappe.router.off('change', sync);
        }
      }
      window.removeEventListener('popstate', sync);
    };
  }, [sync]);

  /**
   * Navigate to a Frappe route.
   * Uses frappe.set_route() when available, falls back to href.
   * @param {string} url  e.g. '/app/selling'
   */
  const navigate = useCallback((url) => {
    if (!url || url === '#') return;
    if (url === '#copilot') {
      const panel = document.getElementById('ax-copilot-panel');
      if (panel) panel.classList.toggle('ax-copilot-open');
      return;
    }
    if (window.frappe && window.frappe.set_route) {
      const cleanUrl = url.replace(/^\/app\//, '');
      const parts = cleanUrl.split('?');
      const routePart = parts[0];
      const queryPart = parts[1];

      if (queryPart) {
        const params = new URLSearchParams(queryPart);
        const options = {};
        for (const [key, value] of params.entries()) {
          options[key] = value;
        }
        window.frappe.route_options = options;
      }

      const segments = routePart.split('/');
      window.frappe.set_route(segments);
    } else {
      window.location.href = url;
    }
    // Update local state immediately
    setRouteState(resolveRoute(url));
  }, []);

  return {
    activeModule: routeState.moduleId,
    activeTab: routeState.tabId,
    navigate,
    sync
  };
}
