/**
 * KeyboardBar.jsx
 * AxonAI One — Fixed Bottom F-Key Shortcut Strip
 *
 * Industrial standard ref: ERPNext's own keyboard bar, SAP keyboard shortcuts bar.
 * Shows F1–F12 shortcut keys mapped to common ERP actions.
 * Clicking or pressing a function key navigates Frappe.
 *
 * Key bindings (per the reference UI screenshot):
 *  F1  → Help
 *  F2  → Date picker (today)
 *  F3  → Company
 *  F4  → Contra Entry
 *  F5  → Payment Entry (Receive)
 *  F6  → Receipt (Purchase Receipt)
 *  F7  → Journal Entry
 *  F8  → Sales Invoice
 *  F9  → Purchase Invoice
 *  F10 → Other Vouchers
 *  F12 → Configure / Settings
 */

import React, { useEffect, useCallback } from 'react';

const FKEYS = [
  { key: 'F1',  label: 'Help',          action: () => window.open('/app/user', '_self') },
  { key: 'F2',  label: 'Date',          action: () => {
    const today = new Date().toLocaleDateString('en-CA');
    navigator.clipboard?.writeText(today).catch(() => {});
  }},
  { key: 'F3',  label: 'Company',       action: () => window.frappe?.set_route?.(['company']) || (window.location.href = '/app/company') },
  { key: 'F4',  label: 'Contra',        action: () => window.frappe?.set_route?.(['journal-entry', { entry_type: 'Contra' }]) || (window.location.href = '/app/journal-entry') },
  { key: 'F5',  label: 'Payment',       action: () => window.frappe?.set_route?.(['payment-entry']) || (window.location.href = '/app/payment-entry') },
  { key: 'F6',  label: 'Receipt',       action: () => window.frappe?.set_route?.(['purchase-receipt']) || (window.location.href = '/app/purchase-receipt') },
  { key: 'F7',  label: 'Journal',       action: () => window.frappe?.set_route?.(['journal-entry']) || (window.location.href = '/app/journal-entry') },
  { key: 'F8',  label: 'Sales',         action: () => window.frappe?.set_route?.(['sales-invoice']) || (window.location.href = '/app/sales-invoice') },
  { key: 'F9',  label: 'Purchase',      action: () => window.frappe?.set_route?.(['purchase-invoice']) || (window.location.href = '/app/purchase-invoice') },
  { key: 'F10', label: 'Other Vouchers',action: () => window.frappe?.set_route?.(['query-report']) || (window.location.href = '/app/query-report') },
  { key: 'F11', label: 'Stock Entry',   action: () => window.frappe?.set_route?.(['stock-entry']) || (window.location.href = '/app/stock-entry') },
  { key: 'F12', label: 'Configure',     action: () => window.frappe?.set_route?.(['system-settings']) || (window.location.href = '/app/system-settings') },
];

export default function KeyboardBar() {
  const handleFKey = useCallback((e) => {
    // Only handle F1-F12 if not in an input field
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) return;

    const idx = parseInt(e.key.replace('F', ''), 10);
    if (isNaN(idx) || idx < 1 || idx > 12) return;

    // Suppress browser default (especially F1 = browser help, F5 = reload, F12 = devtools)
    // Only suppress if the key has a custom binding
    const binding = FKEYS.find((k) => k.key === e.key);
    if (!binding) return;

    e.preventDefault();
    binding.action();
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleFKey);
    return () => document.removeEventListener('keydown', handleFKey);
  }, [handleFKey]);

  return (
    <div className="ax-keybar" id="ax-keybar" role="toolbar" aria-label="Keyboard shortcuts">
      {FKEYS.map((item) => (
        <button
          key={item.key}
          className="ax-keybar-btn"
          onClick={() => item.action()}
          title={`${item.key} — ${item.label}`}
          aria-label={`${item.key}: ${item.label}`}
        >
          <span className="ax-keybar-fkey">{item.key}</span>
          <span className="ax-keybar-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
