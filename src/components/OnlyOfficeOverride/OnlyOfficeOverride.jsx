import React, { useEffect, useRef, useState, useCallback } from 'react';

// ── Config ─────────────────────────────────────────────────────────────────
const ONLYOFFICE_SCRIPT = 'http://localhost/web-apps/apps/api/documents/api.js';

// Makes a URL absolute using the browser's current origin (for the browser/user)
function makeAbsolute(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${window.location.origin}${path.startsWith('/') ? path : '/' + path}`;
}

// Makes a URL that is reachable FROM the OnlyOffice Docker container.
// On Linux, 172.17.0.1 is the docker bridge host IP — the OnlyOffice container
// cannot use "localhost" since that resolves to itself, not to Frappe.
function makeServerUrl(path) {
  if (!path) return '';
  const isLocalhost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const origin = isLocalhost
    ? `http://172.17.0.1:${window.location.port}`
    : window.location.origin;

  let cleanPath = path;
  if (cleanPath.startsWith('http')) {
    try {
      const parsed = new URL(cleanPath);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        cleanPath = parsed.pathname + parsed.search;
      } else {
        return cleanPath;
      }
    } catch (_) { /* ignore */ }
  }
  return `${origin}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
}

// Returns the OnlyOffice documentType string for a given filename
function getDocType(fileName) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  if (['xlsx', 'xls', 'ods', 'csv'].includes(ext)) return 'cell';
  if (['pptx', 'ppt', 'odp'].includes(ext)) return 'slide';
  if (['pdf'].includes(ext)) return 'pdf';
  return 'word'; // .docx, .doc, .odt, etc.
}

function fileIcon(fileName) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  if (['xlsx', 'xls', 'ods', 'csv'].includes(ext)) return '📊';
  if (['pptx', 'ppt', 'odp'].includes(ext)) return '🎬';
  if (ext === 'pdf') return '📄';
  return '📝';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Landing Page ────────────────────────────────────────────────────────────
const CREATE_OPTIONS = [
  { type: 'word',  icon: '📝', label: 'Document',     color: '#4F46E5', ext: '.docx' },
  { type: 'cell',  icon: '📊', label: 'Spreadsheet',  color: '#059669', ext: '.xlsx' },
  { type: 'slide', icon: '🎬', label: 'Presentation', color: '#DC2626', ext: '.pptx' },
  { type: 'pdf',   icon: '📄', label: 'PDF Form',     color: '#D97706', ext: '.pdf'  },
];

function DocumentsHome({ onCreateNew, onOpenFile }) {
  const [recentFiles, setRecentFiles] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  const loadRecent = useCallback(() => {
    if (!window.frappe?.call) return;
    setRecentLoading(true);
    window.frappe.call({
      method: 'axonai_ui.onlyoffice.get_recent_documents',
      callback: (r) => {
        setRecentLoading(false);
        if (Array.isArray(r.message)) setRecentFiles(r.message);
      },
      error: () => setRecentLoading(false),
    });
  }, []);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const handleRenameClick = (file) => {
    const baseName = file.file_name.replace(/\.[^.]+$/, '');
    const newName = prompt("Rename Document", baseName);
    if (newName === null) return; // Cancelled
    if (!newName.trim()) { alert("Name cannot be empty."); return; }
    
    window.frappe.call({
      method: 'axonai_ui.onlyoffice.rename_document',
      args: { file_name: file.file_name, new_title: newName.trim() },
      callback: (r) => {
        if (r.message) {
          setRecentFiles(prev =>
            prev.map(f => f.file_name === file.file_name
              ? { ...f, file_name: r.message.file_name, file_url: r.message.file_url }
              : f
            )
          );
        }
      },
      error: (err) => {
        alert(err?.message || 'Rename failed.');
      },
    });
  };

  const handleDeleteClick = (file) => {
    const confirmDelete = confirm(`Are you sure you want to delete "${file.file_name}" permanently?`);
    if (!confirmDelete) return;

    window.frappe.call({
      method: 'axonai_ui.onlyoffice.delete_document',
      args: { file_name: file.file_name },
      callback: () => {
        setRecentFiles(prev => prev.filter(f => f.file_name !== file.file_name));
      },
      error: (err) => {
        alert(err?.message || 'Delete failed.');
      }
    });
  };

  return (
    <div className="ax-doc-home">
      <div className="ax-doc-home-header">
        <h1>Documents</h1>
        <p>Create, edit and manage your documents with OnlyOffice</p>
      </div>

      <section className="ax-doc-section">
        <h2 className="ax-doc-section-title">Create New</h2>
        <div className="ax-doc-create-grid">
          {CREATE_OPTIONS.map(opt => (
            <button
              key={opt.type}
              className="ax-doc-create-card"
              onClick={() => onCreateNew(opt.type)}
              style={{ '--card-color': opt.color }}
            >
              <span className="ax-doc-create-icon">{opt.icon}</span>
              <span className="ax-doc-create-label">{opt.label}</span>
              <span className="ax-doc-create-ext">{opt.ext}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="ax-doc-section">
        <h2 className="ax-doc-section-title">Recent Files</h2>
        {recentLoading ? (
          <p className="ax-doc-empty">Loading…</p>
        ) : recentFiles.length === 0 ? (
          <p className="ax-doc-empty">No recent documents. Create one above!</p>
        ) : (
          <ul className="ax-doc-recent-list">
            {recentFiles.map(file => (
              <li key={file.name} className="ax-doc-recent-item">
                <button
                  className="ax-doc-recent-open"
                  onClick={() => onOpenFile(makeAbsolute(file.file_url), file.file_name, file.name)}
                >
                  <span className="ax-doc-recent-icon">{fileIcon(file.file_name)}</span>
                  <span className="ax-doc-recent-name">{file.file_name}</span>
                  <span className="ax-doc-recent-date">{formatDate(file.modified)}</span>
                </button>
                <div className="ax-doc-recent-actions">
                  <button
                    className="ax-doc-recent-action-btn rename"
                    title="Rename"
                    onClick={() => handleRenameClick(file)}
                  >✏️</button>
                  <button
                    className="ax-doc-recent-action-btn delete"
                    title="Delete"
                    onClick={() => handleDeleteClick(file)}
                  >🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ── Editor ──────────────────────────────────────────────────────────────────
function DocumentEditor({ fileUrl, fileName, fileKey, fileType, fileId, onRenameSuccess }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(!!window.DocsAPI);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'modified'
  const [showSavedToast, setShowSavedToast] = useState(false);
  const prevStatusRef = useRef(saveStatus);

  useEffect(() => {
    if (prevStatusRef.current === 'modified' && saveStatus === 'saved') {
      setShowSavedToast(true);
      const timer = setTimeout(() => setShowSavedToast(false), 3000);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = saveStatus;
  }, [saveStatus]);

  const executeDelete = () => {
    const confirmDelete = confirm(`Are you sure you want to delete "${fileName}" permanently?`);
    if (!confirmDelete) return;

    window.frappe.call({
      method: 'axonai_ui.onlyoffice.delete_document',
      args: { file_name: fileName },
      callback: () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/app/documents';
        }
      },
      error: (err) => {
        alert(err?.message || 'Delete failed.');
      }
    });
  };

  // Load OnlyOffice API script once
  useEffect(() => {
    if (window.DocsAPI) { setScriptLoaded(true); return; }
    const existing = document.getElementById('onlyoffice-api-script');
    if (existing) {
      existing.addEventListener('load', () => setScriptLoaded(true));
      return;
    }
    const script = document.createElement('script');
    script.id = 'onlyoffice-api-script';
    script.src = ONLYOFFICE_SCRIPT;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () =>
      setError(`Could not load OnlyOffice from ${ONLYOFFICE_SCRIPT}. Is the OnlyOffice Docker container running?`);
    document.head.appendChild(script);
  }, []);

  // Init editor when script is ready and fileKey changes
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.DocsAPI) return;

    if (editorRef.current?.destroyEditor) {
      editorRef.current.destroyEditor();
      editorRef.current = null;
    }

    const user = window.frappe?.session?.user || 'user@example.com';
    const userName = window.frappe?.session?.user_fullname || 'User';
    const callbackUrl = makeServerUrl(
      `/api/method/axonai_ui.onlyoffice.callback?file_name=${encodeURIComponent(fileName)}` +
      (fileId ? `&file_id=${encodeURIComponent(fileId)}` : '')
    );

    try {
      editorRef.current = new window.DocsAPI.DocEditor('onlyoffice-editor', {
        documentType: fileType,
        document: {
          title: fileName,
          url: makeServerUrl(fileUrl),
          fileType: fileName.split('.').pop() || 'docx',
          key: fileKey,
          permissions: { edit: true, download: true },
        },
        editorConfig: {
          mode: 'edit',
          callbackUrl,
          user: { id: user, name: userName },
          customization: { autosave: true, forcesave: true },
        },
        width: '100%',
        height: '100%',
        events: {
          onAppReady: () => setReady(true),
          onDocumentStateChange: (evt) => {
            if (evt.data) {
              setSaveStatus('modified');
            } else {
              setSaveStatus('saved');
            }
          },
          onRequestRename: (evt) => {
            const newTitleWithExt = evt.data;
            const baseName = newTitleWithExt.replace(/\.[^.]+$/, '');
            
            if (!baseName.trim()) {
              editorRef.current?.setRenameStatus("error", "Name cannot be empty.");
              return;
            }

            editorRef.current?.setRenameStatus("loading");

            window.frappe.call({
              method: 'axonai_ui.onlyoffice.rename_document',
              args: { file_name: fileName, new_title: baseName.trim() },
              callback: (r) => {
                if (r.message && r.message.file_name) {
                  editorRef.current?.setRenameStatus("success", r.message.file_name);
                  if (onRenameSuccess) {
                    onRenameSuccess(r.message.file_name, makeAbsolute(r.message.file_url));
                  }
                } else {
                  editorRef.current?.setRenameStatus("error", "Rename failed. Invalid server response.");
                }
              },
              error: (err) => {
                editorRef.current?.setRenameStatus("error", err?.message || "Rename failed.");
              }
            });
          },
          onError: (evt) => {
            const msg = evt?.data?.errorDescription || 'Unknown error';
            setError(`OnlyOffice error: ${msg}`);
          },
        },
      });
    } catch (err) {
      setError(`Failed to initialize editor: ${err.message}`);
    }

    return () => {
      if (editorRef.current?.destroyEditor) {
        editorRef.current.destroyEditor();
        editorRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded, fileKey]);

  return (
    <div className="ax-doc-editor-view">
      {error ? (
        <div className="ax-onlyoffice-error">
          <p>⚠️ {error}</p>
        </div>
      ) : (
        <div className="ax-doc-iframe-wrap">
          {!ready && (
            <div className="ax-onlyoffice-loading">
              <span>⏳ Loading editor…</span>
            </div>
          )}
          <div
            id="onlyoffice-editor"
            ref={containerRef}
            style={{ width: '100%', height: '100%', opacity: ready ? 1 : 0 }}
          />
          {ready && (
            <button
              className="ax-doc-editor-delete-btn"
              title="Delete Document"
              onClick={executeDelete}
            >
              🗑️ Delete
            </button>
          )}
          {saveStatus === 'modified' && (
            <div className="ax-save-status-pill saving">
              <span className="ax-save-status-dot pulse" /> Saving changes...
            </div>
          )}
          {saveStatus === 'saved' && showSavedToast && (
            <div className="ax-save-status-pill saved">
              <span className="ax-save-status-dot">✓</span> Saved to AxonAI
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function OnlyOfficeOverride() {
  const [view, setView] = useState('home'); // 'home' | 'creating' | 'editor'
  const [editorProps, setEditorProps] = useState(null);
  const [createError, setCreateError] = useState(null);
  const isCreatingRef = useRef(false);

  // Toggle active editor body class to hide/recalculate Level 2 Module Nav
  useEffect(() => {
    if (view === 'editor') {
      document.body.classList.add('ax-editor-active');
    } else {
      document.body.classList.remove('ax-editor-active');
    }
    return () => {
      document.body.classList.remove('ax-editor-active');
    };
  }, [view]);

  const handleRenameSuccess = useCallback((newFileName, newFileUrl) => {
    setEditorProps(prev => {
      if (!prev) return null;
      return {
        ...prev,
        fileName: newFileName,
        fileUrl: newFileUrl
      };
    });

    const params = new URLSearchParams(window.location.search);
    params.set('file_name', newFileName);
    params.set('file_url', newFileUrl);
    window.history.replaceState(
      null, null,
      `/app/documents?${params.toString()}`
    );
  }, []);

  const openEditor = useCallback((absUrl, fileName, name) => {
    const fileType = getDocType(fileName);
    const fileKey = (name || fileName) + '_' + Date.now();
    setEditorProps({ fileUrl: absUrl, fileName, fileKey, fileType, fileId: name });
    setView('editor');
    
    const params = new URLSearchParams();
    params.set('file_name', fileName);
    params.set('file_url', absUrl);
    if (name) params.set('file_id', name);

    window.history.replaceState(
      null, null,
      `/app/documents?${params.toString()}`
    );
  }, []);

  const handleCreateNew = useCallback((docType) => {
    if (isCreatingRef.current) return;
    if (!window.frappe?.call) {
      setCreateError('Frappe API not available. Please reload the page.');
      return;
    }
    isCreatingRef.current = true;
    setView('creating');
    setCreateError(null);

    window.frappe.call({
      method: 'axonai_ui.onlyoffice.create_document',
      args: { doc_type: docType, title: `New_${docType}_${Date.now()}` },
      callback: (r) => {
        isCreatingRef.current = false;
        if (r.message?.file_url) {
          openEditor(makeAbsolute(r.message.file_url), r.message.file_name, r.message.name);
        } else {
          setCreateError('Server did not return a valid file URL.');
          setView('home');
        }
      },
      error: (err) => {
        isCreatingRef.current = false;
        setCreateError(`Failed to create document: ${err.message || 'Unknown error'}`);
        setView('home');
      },
    });
  }, [openEditor]);

  // Handle URL-driven routing (sidebar clicks, browser back, etc.)
  const handleRoute = useCallback(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // /app/documents/new?type=cell  →  create that type
    if (path.includes('/new')) {
      const type = params.get('type') || 'word';
      if (!isCreatingRef.current) handleCreateNew(type);
      return;
    }

    // /app/documents?file_url=...&file_name=...  →  open that file
    const fileUrl = params.get('file_url');
    const fileName = params.get('file_name');
    const fileId = params.get('file_id');
    if (fileUrl && fileName) {
      openEditor(makeAbsolute(fileUrl), fileName, fileId);
      return;
    }

    // Default: show home dashboard
    setView('home');
    setEditorProps(null);
  }, [handleCreateNew, openEditor]);

  useEffect(() => {
    handleRoute();
    window.addEventListener('ax-route-changed', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('ax-route-changed', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, [handleRoute]);

  return (
    <div className="ax-onlyoffice-override" id="ax-onlyoffice-override">
      {view === 'home' && (
        <>
          {createError && (
            <div className="ax-onlyoffice-error" style={{ margin: '1rem 1.5rem 0' }}>
              ⚠️ {createError}
            </div>
          )}
          <DocumentsHome onCreateNew={handleCreateNew} onOpenFile={openEditor} />
        </>
      )}

      {view === 'creating' && (
        <div className="ax-onlyoffice-loading" style={{ height: '100%' }}>
          <span>⏳ Creating document…</span>
        </div>
      )}

      {view === 'editor' && editorProps && (
        <DocumentEditor {...editorProps} onRenameSuccess={handleRenameSuccess} />
      )}
    </div>
  );
}
