import React from 'react';
import { createRoot } from 'react-dom/client';

// Global error listener to capture browser console issues
window.addEventListener('error', function (e) {
  const errorInfo = {
    type: 'window_error',
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error ? e.error.stack : ''
  };
  console.error('[AxonAI Debug] Error caught:', errorInfo);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/method/axonai_ui.log_browser_error?error_message=' + encodeURIComponent(JSON.stringify(errorInfo, null, 2)), true);
  xhr.send();
});

window.addEventListener('unhandledrejection', function (e) {
  const errorInfo = {
    type: 'promise_rejection',
    message: e.reason ? (e.reason.message || String(e.reason)) : 'Unhandled promise rejection',
    stack: e.reason && e.reason.stack ? e.reason.stack : ''
  };
  console.error('[AxonAI Debug] Rejection caught:', errorInfo);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/method/axonai_ui.log_browser_error?error_message=' + encodeURIComponent(JSON.stringify(errorInfo, null, 2)), true);
  xhr.send();
});
import Sidebar from './components/Sidebar/Sidebar.jsx';
import SubNav from './components/SubNav/SubNav.jsx';
import TopHeader from './components/TopHeader/TopHeader.jsx';
import ModuleNav from './components/ModuleNav/ModuleNav.jsx';
import KeyboardBar from './components/KeyboardBar/KeyboardBar.jsx';
import CopilotDrawer from './components/AICopilot/CopilotDrawer.jsx';
import HomeOverride from './components/HomeOverride/HomeOverride.jsx';
import OnlyOfficeOverride from './components/OnlyOfficeOverride/OnlyOfficeOverride.jsx';
import './styles/tokens.css';
import './styles/theme.css';
import './styles/sidebar.css';
import './styles/subnav.css';
import './styles/topbar.css';
import './styles/modulenav.css';
import './styles/keyboard.css';
import './styles/copilot.css';
import './styles/onlyoffice.css';

function mountAxonAI() {
  if (document.getElementById('axonai-sidebar-root')) return;

  // Intercept Frappe page routing to prevent "Page not found" errors for custom routes
  if (typeof window.frappe !== 'undefined' && window.frappe.views && window.frappe.views.pageview) {
    const originalShow = window.frappe.views.pageview.show;
    window.frappe.views.pageview.show = function (name) {
      if (name === 'documents' || name === 'onlyoffice') {
        return;
      }
      return originalShow.apply(this, arguments);
    };
  }

  const mainSection = document.querySelector('.main-section');
  if (!mainSection) return;

  // 1. Mount Sidebar
  const sidebarRoot = document.createElement('div');
  sidebarRoot.id = 'axonai-sidebar-root';
  document.body.prepend(sidebarRoot);

  createRoot(sidebarRoot).render(
    <React.StrictMode>
      <Sidebar />
    </React.StrictMode>
  );

  // 1.5. Mount SubNav
  const subnavRoot = document.createElement('div');
  subnavRoot.id = 'axonai-subnav-root';
  sidebarRoot.after(subnavRoot);

  createRoot(subnavRoot).render(
    <React.StrictMode>
      <SubNav />
    </React.StrictMode>
  );

  // 2. Mount TopHeader & ModuleNav
  const topbarRoot = document.createElement('div');
  topbarRoot.id = 'axonai-topbar-root';
  mainSection.prepend(topbarRoot);

  createRoot(topbarRoot).render(
    <React.StrictMode>
      <>
        <TopHeader />
        <ModuleNav />
      </>
    </React.StrictMode>
  );

  // 3. Mount KeyboardBar (fixed bottom strip)
  const keybarRoot = document.createElement('div');
  keybarRoot.id = 'axonai-keybar-root';
  document.body.appendChild(keybarRoot);

  createRoot(keybarRoot).render(
    <React.StrictMode>
      <KeyboardBar />
    </React.StrictMode>
  );

  // 4. Mount CopilotDrawer (slide-in from right)
  const copilotRoot = document.createElement('div');
  copilotRoot.id = 'axonai-copilot-root';
  document.body.appendChild(copilotRoot);

  createRoot(copilotRoot).render(
    <React.StrictMode>
      <CopilotDrawer />
    </React.StrictMode>
  );

  console.log('[AxonAI One] All components mounted: Sidebar, SubNav, Topbar, ModuleNav, KeyboardBar, CopilotDrawer ✓');
  
  // 5. Mount/check Page Overrides
  mountPageOverridesIfNeeded();
}

window.__axonai_mount_overrides = mountPageOverridesIfNeeded;

function mountPageOverridesIfNeeded() {
  const path = window.location.pathname;
  const isHome = path === '/desk' || path === '/desk/' ||
                 path === '/app' || path === '/app/' ||
                 path.startsWith('/app/home');
                 
  const isOnlyOffice = path.startsWith('/app/documents') || path.startsWith('/app/onlyoffice') ||
                       path.startsWith('/desk/documents') || path.startsWith('/desk/onlyoffice');
  
  const pageContent = document.querySelector('.page-content');
  
  if (!isHome && !isOnlyOffice) {
    // Clean up all overrides
    ['ax-home-override-root', 'ax-onlyoffice-override-root'].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });
    
    if (pageContent) {
      pageContent.querySelectorAll(':scope > *').forEach(el => {
        if (el.id !== 'ax-home-override-root' && el.id !== 'ax-onlyoffice-override-root') {
          el.style.display = '';
        }
      });
    }
    return;
  }

  if (!pageContent) {
    // Retry shortly if the page layout is still loading
    setTimeout(mountPageOverridesIfNeeded, 100);
    return;
  }

  // Hide default elements
  pageContent.querySelectorAll(':scope > *').forEach(el => {
    if (el.id !== 'ax-home-override-root' && el.id !== 'ax-onlyoffice-override-root') {
      el.style.display = 'none';
    }
  });

  // Handle Home Mount
  if (isHome) {
    const onlyOfficeRoot = document.getElementById('ax-onlyoffice-override-root');
    if (onlyOfficeRoot) onlyOfficeRoot.style.display = 'none';
    
    let homeRoot = document.getElementById('ax-home-override-root');
    if (!homeRoot) {
      homeRoot = document.createElement('div');
      homeRoot.id = 'ax-home-override-root';
      pageContent.prepend(homeRoot);
      createRoot(homeRoot).render(<React.StrictMode><HomeOverride /></React.StrictMode>);
      console.log('[AxonAI One] Custom HomeOverride mounted ✓');
    } else {
      homeRoot.style.display = '';
    }
  }

  // Handle OnlyOffice Mount
  if (isOnlyOffice) {
    const homeRoot = document.getElementById('ax-home-override-root');
    if (homeRoot) homeRoot.style.display = 'none';
    
    let onlyOfficeRoot = document.getElementById('ax-onlyoffice-override-root');
    if (!onlyOfficeRoot) {
      onlyOfficeRoot = document.createElement('div');
      onlyOfficeRoot.id = 'ax-onlyoffice-override-root';
      pageContent.prepend(onlyOfficeRoot);
      createRoot(onlyOfficeRoot).render(<React.StrictMode><OnlyOfficeOverride /></React.StrictMode>);
      console.log('[AxonAI One] OnlyOfficeOverride mounted ✓');
    } else {
      onlyOfficeRoot.style.display = '';
    }
  }
}

let _bootAttempts = 0;
function _tryReactBoot() {
  _bootAttempts++;
  if (_bootAttempts > 150) return;

  const path = window.location.pathname;
  const isExternalSPA = path.startsWith('/crm') || path.startsWith('/mail');
  const frappReady = isExternalSPA || (typeof frappe !== 'undefined' && frappe.boot && frappe.boot.user);
  const domReady = !!document.querySelector('.main-section');

  if (frappReady && domReady) {
    // Inject active route classes to body
    if (path.startsWith('/crm')) {
      document.body.classList.add('ax-route-crm');
    } else {
      document.body.classList.remove('ax-route-crm');
    }
    if (path.startsWith('/mail')) {
      document.body.classList.add('ax-route-mail');
    } else {
      document.body.classList.remove('ax-route-mail');
    }
    if (path.startsWith('/app/documents') || path.startsWith('/app/onlyoffice')) {
      document.body.classList.add('ax-route-documents');
    } else {
      document.body.classList.remove('ax-route-documents');
    }

    mountAxonAI();
    
    // Listen for route changes
    if (window.frappe && window.frappe.router) {
      window.frappe.router.on('change', mountPageOverridesIfNeeded);
    }
    
    // Poll for pathname changes (e.g. back from Vue SPA routes)
    let lastPath = window.location.pathname;
    setInterval(() => {
      const current = window.location.pathname;
      if (current !== lastPath) {
        lastPath = current;
        if (current.startsWith('/crm')) {
          document.body.classList.add('ax-route-crm');
        } else {
          document.body.classList.remove('ax-route-crm');
        }
        if (current.startsWith('/mail')) {
          document.body.classList.add('ax-route-mail');
        } else {
          document.body.classList.remove('ax-route-mail');
        }
        if (current.startsWith('/app/documents') || current.startsWith('/app/onlyoffice')) {
          document.body.classList.add('ax-route-documents');
        } else {
          document.body.classList.remove('ax-route-documents');
        }
        mountPageOverridesIfNeeded();
      }
    }, 300);

  } else {
    setTimeout(_tryReactBoot, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _tryReactBoot);
} else {
  _tryReactBoot();
}

window.addEventListener('load', function () {
  setTimeout(function () {
    const diagnosticInfo = {
      frappe_defined: typeof window.frappe !== 'undefined',
      boot_defined: typeof window.frappe?.boot !== 'undefined',
      container_defined: typeof window.frappe?.container !== 'undefined',
      toolbar_defined: typeof window.frappe?.frappe_toolbar !== 'undefined',
      splash_element_exists: !!document.querySelector('.splash'),
      body_element_exists: !!document.getElementById('body'),
      body_content_length: document.getElementById('body')?.innerHTML?.length || 0,
      body_content: document.getElementById('body')?.innerHTML?.substring(0, 500) || '',
      sidebar_element_exists: !!document.getElementById('ax-sidebar'),
      topbar_element_exists: !!document.getElementById('axonai-topbar-root')
    };

    console.log('[AxonAI Debug] Running diagnostics:', diagnosticInfo);

    var xhr = new XMLHttpRequest();
    var message = 'DIAGNOSTICS:\n' + JSON.stringify(diagnosticInfo, null, 2);
    xhr.open('GET', '/api/method/axonai_ui.log_browser_error?error_message=' + encodeURIComponent(message), true);
    xhr.send();
  }, 3000);
});
