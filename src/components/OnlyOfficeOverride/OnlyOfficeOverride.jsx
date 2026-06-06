import React, { useEffect, useRef, useState } from 'react';

// Configuration for OnlyOffice
const ONLYOFFICE_CONFIG = {
  scriptUrl: 'http://localhost/web-apps/apps/api/documents/api.js',
  documentUrl: 'http://localhost:8001/test.docx',
  documentTitle: 'Test.docx',
  documentKey: 'test123_' + Date.now() // Unique key to avoid cache issues
};

export default function OnlyOfficeOverride() {
  const containerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if DocsAPI is already available
    if (window.DocsAPI) {
      setScriptLoaded(true);
      return;
    }

    // Load the OnlyOffice script dynamically
    const script = document.createElement('script');
    script.src = ONLYOFFICE_CONFIG.scriptUrl;
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
    };

    script.onerror = () => {
      setError(`Failed to load OnlyOffice API script from ${ONLYOFFICE_CONFIG.scriptUrl}. Please ensure OnlyOffice is running and accessible.`);
    };

    document.head.appendChild(script);

    return () => {
      // Clean up script if necessary
    };
  }, []);

  useEffect(() => {
    let docEditor = null;

    if (scriptLoaded && containerRef.current && window.DocsAPI) {
      try {
        docEditor = new window.DocsAPI.DocEditor(containerRef.current.id, {
          documentType: "word",
          document: {
            title: ONLYOFFICE_CONFIG.documentTitle,
            fileType: "docx",
            key: ONLYOFFICE_CONFIG.documentKey,
            url: ONLYOFFICE_CONFIG.documentUrl
          },
          editorConfig: {
            mode: "edit",
            user: {
              id: window.frappe?.session?.user || "1",
              name: window.frappe?.session?.user_fullname || "User"
            }
          },
          width: "100%",
          height: "100%"
        });
      } catch (err) {
        setError(`Failed to initialize DocEditor: ${err.message}`);
      }
    }

    return () => {
      if (docEditor && typeof docEditor.destroyEditor === 'function') {
        docEditor.destroyEditor();
      }
    };
  }, [scriptLoaded]);

  return (
    <div className="ax-onlyoffice-override" id="ax-onlyoffice-override">
      <div className="ax-onlyoffice-header">
        <h2>Document Editor</h2>
      </div>
      
      {error ? (
        <div className="ax-onlyoffice-error">
          <p>⚠️ {error}</p>
          <p className="ax-onlyoffice-help">
            <strong>Note:</strong> If you are using Docker, <code>localhost</code> in the document URL will refer to the OnlyOffice container itself, not your host machine. Make sure your document URL is accessible from *inside* the OnlyOffice container (e.g., use your machine's local IP address or host.docker.internal).
          </p>
        </div>
      ) : (
        <div className="ax-onlyoffice-container">
          {!scriptLoaded && <p className="ax-onlyoffice-loading">Loading OnlyOffice Editor...</p>}
          <div id="onlyoffice-editor" ref={containerRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
      )}
    </div>
  );
}
