/**
 * useRoute.js
 * AxonAI One — 3-Level Routing Hook (v16 Fixed)
 *
 * Tracks the active module (Level 1) and active tab (Level 2) by watching:
 *  1. window.location on mount
 *  2. frappe.router 'change' events (Frappe SPA navigation)
 *  3. browser popstate (back/forward buttons)
 *  4. URL polling for external Vue SPAs (CRM/Mail)
 *
 * Uses routeStore (event-emitter) so ALL React roots share one state.
 */

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { NAVIGATION } from '../data/subNavConfig.js';
import { routeStore } from '../stores/routeStore.js';

// ═══════════════════════════════════════════════════════════════════
// resolveRoute  —  pathname ➜ { moduleId, tabId }
// ═══════════════════════════════════════════════════════════════════

function resolveRoute(pathname) {
  const path = pathname.split('?')[0];

  // ── 0. External Vue SPA routes ──────────────────────────────────
  // CRM standalone SPA (if installed) at /crm
  if (path === '/crm' || path.startsWith('/crm/')) {
    if (path.startsWith('/crm/dashboard'))     return { moduleId: 'crm', tabId: 'pipeline' };
    if (path.startsWith('/crm/leads'))         return { moduleId: 'crm', tabId: 'pipeline' };
    if (path.startsWith('/crm/deals'))         return { moduleId: 'crm', tabId: 'pipeline' };
    if (path.startsWith('/crm/contacts'))      return { moduleId: 'crm', tabId: 'customers' };
    if (path.startsWith('/crm/organizations')) return { moduleId: 'crm', tabId: 'customers' };
    return { moduleId: 'crm', tabId: 'pipeline' };
  }

  // Mail standalone SPA at /mail
  if (path === '/mail' || path.startsWith('/mail/')) {
    if (path.startsWith('/mail/dashboard')) return { moduleId: 'mail', tabId: 'admin' };
    return { moduleId: 'mail', tabId: 'mailbox' };
  }

  // ── 0b. CRM ERPNext desk routes (BEFORE NAVIGATION walk) ────────
  // These MUST come before the walk so CRM module takes priority.
  if (path.startsWith('/app/lead')) {
    return { moduleId: 'crm', tabId: 'pipeline' };
  }
  if (path.startsWith('/app/opportunity')) {
    return { moduleId: 'crm', tabId: 'pipeline' };
  }
  if (path.startsWith('/app/prospect')) {
    return { moduleId: 'crm', tabId: 'pipeline' };
  }
  if (path.startsWith('/app/campaign') || path.startsWith('/app/email-campaign') ||
      path.startsWith('/app/lead-source') || path.startsWith('/app/sales-stage') ||
      path.startsWith('/app/market-segment') || path.startsWith('/app/industry-type')) {
    return { moduleId: 'crm', tabId: 'campaigns' };
  }
  if (path === '/app/crm' || path === '/app/crm/') {
    return { moduleId: 'crm', tabId: 'pipeline' };
  }

  // ── 1. Walk through all modules in NAVIGATION to find a Level 3 item URL match
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

  // ── 2. Fallbacks for standard Frappe desk workspaces ────────────
  if (path.startsWith('/app/home') || path === '/app' || path === '/app/') {
    return { moduleId: 'erp', tabId: 'organization' };
  }
  if (path.startsWith('/app/selling')) {
    return { moduleId: 'erp', tabId: 'selling' };
  }
  if (path.startsWith('/app/buying')) {
    return { moduleId: 'erp', tabId: 'buying' };
  }
  if (path.startsWith('/app/item') || path.startsWith('/app/product-bundle') ||
      path.startsWith('/app/item-group') || path.startsWith('/app/uom') ||
      path.startsWith('/app/brand') || path.startsWith('/app/stock-settings') ||
      path.startsWith('/app/material-request')) {
    return { moduleId: 'erp', tabId: 'stock' };
  }
  // Subcontracting
  if (path.startsWith('/app/subcontracting')) {
    return { moduleId: 'erp', tabId: 'subcontracting' };
  }
  // Banking — match specific bank-* routes
  if (path.startsWith('/app/bank-clearance') || path.startsWith('/app/bank-reconciliation') ||
      path.startsWith('/app/bank-account') || path.startsWith('/app/bank-guarantee') ||
      path.startsWith('/app/plaid-settings') || path.startsWith('/app/dunning') ||
      path === '/app/bank' || path.startsWith('/app/bank/') ||
      path.startsWith('/app/banking')) {
    return { moduleId: 'erp', tabId: 'banking' };
  }
  // Payments — specific payment routes
  if (path.startsWith('/app/payment-entry') || path.startsWith('/app/payment-request') ||
      path.startsWith('/app/payment-order') || path.startsWith('/app/payment-reconciliation') ||
      path.startsWith('/app/unreconcile-payment') || path.startsWith('/app/process-payment-reconciliation') ||
      path.startsWith('/app/repost-accounting-ledger') || path.startsWith('/app/repost-payment-ledger') ||
      path.startsWith('/app/payments')) {
    return { moduleId: 'erp', tabId: 'payments' };
  }
  // Accounting
  if (path.startsWith('/app/accounts') || path.startsWith('/app/account') ||
      path.startsWith('/app/journal-entry') || path.startsWith('/app/cost-center') ||
      path.startsWith('/app/period-closing') || path.startsWith('/app/fiscal-year') ||
      path.startsWith('/app/currency') || path.startsWith('/app/mode-of-payment') ||
      path.startsWith('/app/payment-terms') || path.startsWith('/app/accounting')) {
    return { moduleId: 'erp', tabId: 'accounts_setup' };
  }
  if (path.startsWith('/app/stock-entry') || path.startsWith('/app/stock') ||
      path.startsWith('/app/warehouse') || path.startsWith('/app/delivery-note') ||
      path.startsWith('/app/purchase-receipt') || path.startsWith('/app/stock-reconciliation')) {
    return { moduleId: 'erp', tabId: 'stock' };
  }
  if (path.startsWith('/app/bom') || path.startsWith('/app/work-order') ||
      path.startsWith('/app/job-card') || path.startsWith('/app/production-plan') ||
      path.startsWith('/app/workstation') || path.startsWith('/app/operation') ||
      path.startsWith('/app/routing') || path.startsWith('/app/manufacturing')) {
    return { moduleId: 'erp', tabId: 'manufacturing' };
  }
  if (path.startsWith('/app/project') || path.startsWith('/app/task') ||
      path.startsWith('/app/timesheet') || path.startsWith('/app/projects')) {
    return { moduleId: 'erp', tabId: 'projects' };
  }
  if (path.startsWith('/app/asset') || path.startsWith('/app/location') ||
      path.startsWith('/app/assets')) {
    return { moduleId: 'erp', tabId: 'assets' };
  }
  // Budget
  if (path.startsWith('/app/budget') || path.startsWith('/app/monthly-distribution')) {
    return { moduleId: 'erp', tabId: 'budget' };
  }
  // Subscription
  if (path.startsWith('/app/subscription')) {
    return { moduleId: 'erp', tabId: 'subscription' };
  }
  // Share Management
  if (path.startsWith('/app/share-transfer') || path.startsWith('/app/shareholder') ||
      path.startsWith('/app/share-type') || path.startsWith('/app/share-management')) {
    return { moduleId: 'erp', tabId: 'share_management' };
  }
  // Taxes
  if (path.startsWith('/app/tax-') || path.startsWith('/app/gst-settings') ||
      path.startsWith('/app/item-tax-template') || path.startsWith('/app/sales-taxes') ||
      path.startsWith('/app/purchase-taxes') || path.startsWith('/app/taxes')) {
    return { moduleId: 'erp', tabId: 'taxes' };
  }
  // ERPNext Settings
  if (path.startsWith('/app/erpnext-settings') || path.startsWith('/app/domain-settings') ||
      path.startsWith('/app/data-import') || path.startsWith('/app/data-export') ||
      path.startsWith('/app/rename-tool')) {
    return { moduleId: 'erp', tabId: 'erpnext_settings' };
  }
  // Financial Reports
  if (path.startsWith('/app/financial-reports')) {
    return { moduleId: 'erp', tabId: 'financial_reports' };
  }

  // ── 3. HRMS Frappe desk routes (/app/*) ─────────────────────────
  if (path.startsWith('/app/expense-claim') || path.startsWith('/app/employee-advance') ||
      path.startsWith('/app/travel-request') || path.startsWith('/app/vehicle-log')) {
    return { moduleId: 'hrms', tabId: 'expenses' };
  }
  if (path.startsWith('/app/leave-application') || path.startsWith('/app/leave-allocation') ||
      path.startsWith('/app/leave-encashment') || path.startsWith('/app/leave-type') ||
      path.startsWith('/app/leave-period') || path.startsWith('/app/leave-policy') ||
      path.startsWith('/app/leave-block-list') || path.startsWith('/app/leave-control-panel') ||
      path.startsWith('/app/holiday-list')) {
    return { moduleId: 'hrms', tabId: 'leaves' };
  }
  if (path.startsWith('/app/payroll-entry') || path.startsWith('/app/salary-slip') ||
      path.startsWith('/app/salary-structure') || path.startsWith('/app/additional-salary') ||
      path.startsWith('/app/salary-withholding') || path.startsWith('/app/salary-component')) {
    return { moduleId: 'hrms', tabId: 'payroll' };
  }
  if (path.startsWith('/app/attendance') || path.startsWith('/app/shift-request') ||
      path.startsWith('/app/shift-assignment') || path.startsWith('/app/shift-type') ||
      path.startsWith('/app/employee-checkin') || path.startsWith('/app/overtime')) {
    return { moduleId: 'hrms', tabId: 'shift_and_attendance' };
  }
  if (path.startsWith('/app/appraisal') || path.startsWith('/app/appraisal-cycle')) {
    return { moduleId: 'hrms', tabId: 'performance' };
  }
  if (path.startsWith('/app/job-opening') || path.startsWith('/app/job-applicant') ||
      path.startsWith('/app/interview') || path.startsWith('/app/job-offer') ||
      path.startsWith('/app/job-requisition') || path.startsWith('/app/staffing-plan')) {
    return { moduleId: 'hrms', tabId: 'recruitment' };
  }
  if (path.startsWith('/app/employee-tax-exemption') || path.startsWith('/app/income-tax-slab') ||
      path.startsWith('/app/payroll-period') || path.startsWith('/app/employee-benefit')) {
    return { moduleId: 'hrms', tabId: 'tax_and_benefits' };
  }
  if (path.startsWith('/app/employee-onboarding') || path.startsWith('/app/employee-separation') ||
      path.startsWith('/app/employee-promotion') || path.startsWith('/app/employee-transfer')) {
    return { moduleId: 'hrms', tabId: 'tenure' };
  }
  // HRMS generic employee / org routes → hr_setup tab
  if (path.startsWith('/app/employee') || path.startsWith('/app/department') ||
      path.startsWith('/app/designation') || path.startsWith('/app/hr-settings') ||
      path.startsWith('/app/branch') || path.startsWith('/app/employee-group') ||
      path.startsWith('/app/employee-grade') || path.startsWith('/app/organizational-chart')) {
    return { moduleId: 'hrms', tabId: 'hr_setup' };
  }

  // ── 4. Mail, POS, other app fallbacks ───────────────────────────
  if (path.startsWith('/app/pos-invoice') || path.startsWith('/app/pos-profile') ||
      path.startsWith('/app/pos-opening') || path.startsWith('/app/pos-closing')) {
    return { moduleId: 'pos', tabId: 'sales' };
  }
  if (path.startsWith('/app/assignment-rule') || path.startsWith('/app/auto-repeat') ||
      path.startsWith('/app/workflow') || path.startsWith('/app/notification') ||
      path.startsWith('/app/automation')) {
    return { moduleId: 'automation', tabId: 'rules' };
  }
  if (path.startsWith('/app/query-report') || path.startsWith('/app/report') ||
      path.startsWith('/app/dashboard')) {
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
  if (path.startsWith('/app/system-settings') || path.startsWith('/app/user') ||
      path.startsWith('/app/role') || path.startsWith('/app/permission') ||
      path.startsWith('/app/custom-field') || path.startsWith('/app/customize')) {
    return { moduleId: 'settings', tabId: 'system' };
  }
  if (path.startsWith('/app/company') || path.startsWith('/app/letter-head') ||
      path.startsWith('/app/email-account')) {
    return { moduleId: 'erp', tabId: 'organization' };
  }

  // ── 5. Frappe v16 /desk/* routes ────────────────────────────────
  // In Frappe v16, /desk or /desk/ is the default homepage.
  // /desk/people is the HRMS app_home.
  // We ONLY map specific /desk/* paths to HRMS — NOT the generic /desk root.
  if (path === '/desk/people' || path.startsWith('/desk/people/')) {
    return { moduleId: 'hrms', tabId: 'hr_setup' };
  }
  // /desk or /desk/ → ERP home (same as /app/home)
  if (path === '/desk' || path === '/desk/') {
    return { moduleId: 'erp', tabId: 'organization' };
  }
  // Other /desk/* workspace routes — try to guess from the slug
  if (path.startsWith('/desk/')) {
    const slug = path.replace('/desk/', '').split('/')[0].toLowerCase();
    // Map known HRMS workspace slugs
    const hrmsWorkspaceSlugs = [
      'hr-setup', 'expenses', 'leaves', 'payroll', 'performance',
      'recruitment', 'shift--attendance', 'tax--benefits', 'tenure',
    ];
    if (hrmsWorkspaceSlugs.includes(slug)) {
      const tabId = slug.replace(/-/g, '_').replace(/__/g, '_and_');
      return { moduleId: 'hrms', tabId };
    }
    // Default: treat unknown /desk/* as ERP
    return { moduleId: 'erp', tabId: null };
  }

  // ── Default catch-all ───────────────────────────────────────────
  return { moduleId: 'erp', tabId: null };
}

// ═══════════════════════════════════════════════════════════════════
// useRoute  —  React hook consumed by Sidebar, SubNav, ModuleNav, etc.
// ═══════════════════════════════════════════════════════════════════

// Initialize the store from current URL on first module load
routeStore.setState(resolveRoute(window.location.pathname));

export function useRoute() {
  const routeHistoryRef = useRef([window.location.pathname]);

  // Subscribe to the global routeStore so ALL React roots share state
  const routeState = useSyncExternalStore(
    routeStore.subscribe,
    routeStore.getState,
    routeStore.getState // SSR fallback (not used, but required by API)
  );

  const sync = useCallback(() => {
    const currentPath = window.location.pathname;
    const resolved = resolveRoute(currentPath);
    routeStore.setState(resolved);
    const history = routeHistoryRef.current;
    if (history[history.length - 1] !== currentPath) {
      history.push(currentPath);
    }
  }, []);

  useEffect(() => {
    // Frappe SPA router fires 'change' on route transitions within /app/*
    if (window.frappe && window.frappe.router) {
      window.frappe.router.on('change', sync);
    }

    // Standard browser back/forward button support
    window.addEventListener('popstate', sync);

    // ── URL polling for external Vue SPAs ──────────────────────────
    // CRM (/crm/*) and Mail (/mail/*) run their own Vue 3 router.
    // frappe.router 'change' never fires for navigation within those apps.
    let lastPolledPath = window.location.pathname;
    const pollInterval = setInterval(() => {
      const current = window.location.pathname;
      if (current !== lastPolledPath) {
        lastPolledPath = current;
        sync();
      }
    }, 300);

    // Initial sync
    sync();

    return () => {
      if (window.frappe && window.frappe.router) {
        if (typeof window.frappe.router.off === 'function') {
          window.frappe.router.off('change', sync);
        }
      }
      window.removeEventListener('popstate', sync);
      clearInterval(pollInterval);
    };
  }, [sync]);

  /**
   * Navigate to a route — handles three distinct cases:
   *
   *  1. External Vue SPAs (/crm/*, /mail/*):
   *     window.location.href for same-tab full-page navigation.
   *
   *  2. Frappe desk direct paths (/desk/*):
   *     window.location.href rather than frappe.set_route().
   *
   *  3. Standard Frappe desk routes (/app/*):
   *     frappe.set_route() for SPA navigation without a full page reload.
   */
  const navigate = useCallback((url) => {
    if (!url || url === '#') return;
    if (url === '#copilot') {
      const panel = document.getElementById('ax-copilot-panel');
      if (panel) panel.classList.toggle('ax-copilot-open');
      return;
    }

    // ── External Vue SPAs and /desk/* routes ─────────────────
    const EXTERNAL_PREFIXES = ['/crm', '/mail', '/desk'];
    const isExternalRoute = EXTERNAL_PREFIXES.some(
      (prefix) => url === prefix || url.startsWith(prefix + '/')
    );

    if (isExternalRoute) {
      // Update the global store immediately so all UI highlights update
      const newState = resolveRoute(url);
      routeStore.setState(newState);
      const history = routeHistoryRef.current;
      if (history[history.length - 1] !== url) {
        history.push(url);
      }
      window.location.href = url;
      return;
    }

    // ── Standard Frappe desk /app/* routes ────────────────────
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

    // Update global store immediately so all components sync
    const resolved = resolveRoute(url);
    routeStore.setState(resolved);
    const history = routeHistoryRef.current;
    if (history[history.length - 1] !== url) {
      history.push(url);
    }
  }, []);

  const goPrevious = useCallback(() => {
    const history = routeHistoryRef.current;
    const previous = history.length > 1 ? history[history.length - 2] : null;
    if (previous) {
      navigate(previous);
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate('/app');
  }, [navigate]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/app');
    }
  }, [navigate]);

  return {
    activeModule: routeState.moduleId,
    activeTab: routeState.tabId,
    navigate,
    goBack,
    goPrevious,
    sync
  };
}
