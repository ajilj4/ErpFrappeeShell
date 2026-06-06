import { 
  Layers, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  Mail,
  Sparkles, 
  Cpu, 
  BarChart2, 
  FileText, 
  FileEdit,
  Calendar, 
  Phone, 
  Settings 
} from 'lucide-react';

export const MENU = [
  // ── ERP Suite ───────────────────────────────────────
  { id: 'erp',        label: 'ERP',         icon: Layers,       url: '/app/home',             section: null        },
  { id: 'crm',        label: 'CRM',         icon: Users,        url: '/app/lead',             section: null        },
  { id: 'hrms',       label: 'HRMS',        icon: Briefcase,    url: '/app/hr-setup',         section: null        },
  { id: 'pos',        label: 'POS',         icon: ShoppingBag,  url: '/app/pos-invoice',      section: null        },
  { id: 'mail',       label: 'Mail',        icon: Mail,         url: '/mail',                 section: null, dividerAfter: true },

  // ── Tools & AI ──────────────────────────────────────
  { id: 'copilot',    label: 'AI Copilot',  icon: Sparkles,     url: '#copilot',              section: 'Tools'     },
  { id: 'automation', label: 'Automation',  icon: Cpu,          url: '/app/automation',       section: null        },
  { id: 'reports',    label: 'Reports',     icon: BarChart2,    url: '/app/report',           section: null        },
  { id: 'files',      label: 'Files',       icon: FileText,     url: '/app/file',             section: null        },
  { id: 'documents',  label: 'Documents',   icon: FileEdit,     url: '/app/documents',        section: null, dividerAfter: true },

  // ── Communication ────────────────────────────────────
  { id: 'calendar',   label: 'Calendar',    icon: Calendar,     url: '/app/event',            section: null        },
  { id: 'calls',      label: 'Calls',       icon: Phone,        url: '/app/call-log',         section: null, dividerAfter: true },

  // ── System ──────────────────────────────────────────
  { id: 'settings',   label: 'Settings',    icon: Settings,     url: '/app/system-settings',  section: null        },
];
