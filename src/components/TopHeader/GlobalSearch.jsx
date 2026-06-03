import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, Layers, Users, Briefcase, ShoppingBag, Folder, Sparkles, Cpu, BarChart2, FileText, Calendar, Phone, Settings } from 'lucide-react';

const SEARCH_ITEMS = [
  { label: 'Go to ERP Home', url: '/app/home', category: 'Navigation', icon: Layers },
  { label: 'Go to CRM Workspace', url: '/app/crm', category: 'Navigation', icon: Users },
  { label: 'Go to HRMS Workspace', url: '/app/hr', category: 'Navigation', icon: Briefcase },
  { label: 'Go to POS Workspace', url: '/app/point-of-sale', category: 'Navigation', icon: ShoppingBag },
  { label: 'Go to Projects Workspace', url: '/app/project', category: 'Navigation', icon: Folder },
  { label: 'Go to AI Copilot Chat', url: '#copilot', category: 'Tools', icon: Sparkles },
  { label: 'Go to Automation Settings', url: '/app/automation', category: 'Tools', icon: Cpu },
  { label: 'Go to Query Reports', url: '/app/query-report', category: 'Tools', icon: BarChart2 },
  { label: 'Go to File Manager', url: '/app/file', category: 'Tools', icon: FileText },
  { label: 'Go to Calendar Events', url: '/app/event', category: 'Communication', icon: Calendar },
  { label: 'Go to Call Logs', url: '/app/call-log', category: 'Communication', icon: Phone },
  { label: 'System Settings', url: '/app/system-settings', category: 'Administration', icon: Settings },
  { label: 'User Profile & Settings', url: '/app/user', category: 'Administration', icon: Users },
];

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredItems = SEARCH_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length + 1)) % Math.max(1, filteredItems.length + 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === filteredItems.length) {
        setIsOpen(false);
        if (window.frappe && window.frappe.search) {
          window.frappe.search.show(query);
        }
      } else if (filteredItems[selectedIndex]) {
        handleNavigate(filteredItems[selectedIndex]);
      }
    }
  };

  const handleNavigate = (item) => {
    setIsOpen(false);
    setQuery('');
    if (item.url === '#copilot') {
      const panel = document.getElementById('ax-copilot-panel');
      if (panel) panel.classList.add('ax-copilot-open');
    } else {
      if (window.frappe && window.frappe.set_route) {
        const cleanRoute = item.url.replace('/app/', '').split('/');
        window.frappe.set_route(cleanRoute);
      } else {
        window.location.href = item.url;
      }
    }
  };

  return (
    <>
      <div className="ax-topbar-search-container" onClick={() => setIsOpen(true)}>
        <div className="ax-search-input-wrapper">
          <Search size={16} color="var(--ax-text-secondary)" />
          <span className="ax-search-placeholder">Search modules or press Ctrl+K</span>
          <span className="ax-search-shortcut">Ctrl K</span>
        </div>
      </div>

      {isOpen && (
        <div className="ax-search-palette-overlay" onClick={() => setIsOpen(false)}>
          <div className="ax-search-palette" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
            <div className="ax-palette-header">
              <Search size={18} color="var(--ax-text-secondary)" />
              <input
                ref={inputRef}
                type="text"
                className="ax-palette-input"
                placeholder="Search workspaces, pages, tools..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
              />
              <span className="ax-palette-close-hint">ESC</span>
            </div>

            <div className="ax-palette-results">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className={`ax-palette-item ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleNavigate(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="ax-palette-item-icon">
                      <Icon size={16} />
                    </span>
                    <span className="ax-palette-item-label">{item.label}</span>
                    <span style={{ fontSize: '11px', opacity: 0.6 }}>{item.category}</span>
                  </div>
                );
              })}

              <div
                className={`ax-palette-item ${selectedIndex === filteredItems.length ? 'selected' : ''}`}
                onClick={() => {
                  setIsOpen(false);
                  if (window.frappe && window.frappe.search) {
                    window.frappe.search.show(query);
                  }
                }}
                onMouseEnter={() => setSelectedIndex(filteredItems.length)}
                style={{ borderTop: '1px solid var(--ax-border)', marginTop: '8px', paddingTop: '12px' }}
              >
                <span className="ax-palette-item-icon">
                  <Command size={16} />
                </span>
                <span className="ax-palette-item-label" style={{ fontWeight: 600 }}>
                  Search for "{query || '...'}" in Frappe Desk...
                </span>
                <span style={{ fontSize: '11px', opacity: 0.6 }}>System Search</span>
              </div>

              {filteredItems.length === 0 && !query && (
                <div className="ax-palette-empty">No results found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
