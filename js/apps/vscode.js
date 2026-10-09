/**
 * Visual Studio Code - 1:1 Windows 11 Desktop Application Clone
 * Matches Screenshot 3: Activity Bar, File Explorer Tree, Editor Tabs,
 * Breadcrumbs, Line Numbers, Syntax Highlighting, Minimap, and Status Bar.
 */

const VSCodeApp = {
  instances: {},

  // Icon mapping for VS Code Explorer & Tabs
  getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const base = filename.toLowerCase();

    if (base === '.gitignore') return { text: '◆', color: '#f34f29', cls: 'vsi-git' };
    if (base.startsWith('.env')) return { text: '⚙', color: '#858585', cls: 'vsi-env' };
    if (ext === 'java') return { text: 'J', color: '#ea2d2e', cls: 'vsi-java' };
    if (ext === 'js' || ext === 'mjs' || ext === 'cjs') return { text: 'JS', color: '#f7df1e', cls: 'vsi-js' };
    if (ext === 'jsx' || ext === 'tsx') return { text: '⚛', color: '#00d8ff', cls: 'vsi-jsx' };
    if (ext === 'ts') return { text: 'TS', color: '#3178c6', cls: 'vsi-ts' };
    if (ext === 'py') return { text: 'PY', color: '#3572a5', cls: 'vsi-py' };
    if (ext === 'json') return { text: '{}', color: '#cbcb41', cls: 'vsi-json' };
    if (ext === 'html') return { text: '<>', color: '#e44d26', cls: 'vsi-html' };
    if (ext === 'css') return { text: '#', color: '#42a5f5', cls: 'vsi-css' };
    if (ext === 'md') return { text: 'M↓', color: '#42a5f5', cls: 'vsi-md' };
    if (ext === 'bat') return { text: '⚙', color: '#c586c0', cls: 'vsi-bat' };
    return { text: '≡', color: '#cccccc', cls: 'vsi-default' };
  },

  getLanguageName(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'java') return 'Java';
    if (ext === 'js') return 'JavaScript';
    if (ext === 'jsx') return 'JavaScript React';
    if (ext === 'ts') return 'TypeScript';
    if (ext === 'py') return 'Python';
    if (ext === 'json') return 'JSON';
    if (ext === 'html') return 'HTML';
    if (ext === 'css') return 'CSS';
    if (ext === 'md') return 'Markdown';
    if (ext === 'env') return 'Properties';
    if (filename.startsWith('.env')) return 'Properties';
    if (filename === '.gitignore') return 'Ignore';
    return 'Plain Text';
  },

  getCodeForFile(projectId, filepath, filename) {
    const db = window.RealCodeDB || {};
    if (!filename && filepath) {
      filename = filepath.split('/').pop();
    }

    const cleanPath = (filepath || '').replace(/^\.?\//, '');
    const cleanFile = filename || cleanPath.split('/').pop() || '';

    // 1. Direct key lookups
    const keysToTry = [
      `${projectId}/${cleanPath}`,
      `${projectId}/${cleanFile}`,
      cleanPath,
      cleanFile,
      `${projectId}/${cleanPath}`.toLowerCase(),
      `${projectId}/${cleanFile}`.toLowerCase(),
      cleanPath.toLowerCase(),
      cleanFile.toLowerCase()
    ];

    for (const key of keysToTry) {
      if (db[key]) return db[key];
    }

    // 2. Scan DB values for filename match with project preference
    for (const [k, v] of Object.entries(db)) {
      const kl = k.toLowerCase();
      const fl = cleanFile.toLowerCase();
      if (kl.endsWith('/' + fl) || kl === fl) {
        if (projectId && kl.startsWith(projectId.toLowerCase())) {
          return v;
        }
      }
    }

    for (const [k, v] of Object.entries(db)) {
      const kl = k.toLowerCase();
      const fl = cleanFile.toLowerCase();
      if (kl.endsWith('/' + fl) || kl === fl) {
        return v;
      }
    }

    // 3. Fallback realistic code based on file extension
    const ext = cleanFile.split('.').pop().toLowerCase();
    if (ext === 'json') {
      return `{\n  "name": "${cleanFile.replace('.json', '')}",\n  "version": "1.0.0",\n  "status": "active",\n  "timestamp": ${Date.now()}\n}`;
    }
    if (cleanFile.startsWith('.env')) {
      return `# Environment Configuration\nPORT=8080\nNODE_ENV=production\nAPP_NAME=${projectId || 'Application'}\n`;
    }
    if (ext === 'md') {
      return `# ${cleanFile.replace('.md', '')}\n\nProject documentation and implementation overview for ${projectId || 'Harsh Prasad Repository'}.\n`;
    }
    if (ext === 'html') {
      return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${cleanFile}</title>\n</head>\n<body>\n  <div id="root">\n    <h1>${projectId || 'Application'}</h1>\n  </div>\n</body>\n</html>\n`;
    }
    if (ext === 'jsx' || ext === 'tsx') {
      return `import React, { useState } from 'react';\n\nexport default function ${cleanFile.replace(/\.[^.]+$/, '')}() {\n  const [active, setActive] = useState(true);\n  return (\n    <div className="component-container">\n      <h2>${cleanFile}</h2>\n    </div>\n  );\n}\n`;
    }
    if (ext === 'css') {
      return `/* Styles for ${cleanFile} */\n:root {\n  --primary: #0078d4;\n  --background: #181818;\n}\n\nbody {\n  font-family: system-ui, sans-serif;\n  color: #fff;\n}\n`;
    }

    return `// ${cleanPath || cleanFile}\n// Source file: ${projectId || 'Project'}\n`;
  },

  mount(container, winId, options = {}) {
    const projects = (window.ProjectsData && window.ProjectsData.length) ? window.ProjectsData : [];

    // Target project: defaults to SplitwiseAI or first project
    let currentProject = projects.find(p => p.id === options.projectId) ||
      projects.find(p => p.id === 'SplitwiseAI') ||
      projects[0] || { id: 'SplitwiseAI', name: 'splitwise-miniproject', files: [] };

    // Initial file to display
    let initialFilename = options.filename || 'Main.java';
    let initialPath = options.filepath || 'src/com/splitwise/Main.java';

    // If options didn't specify filename, pick Main.java for SplitwiseAI or first file
    if (!options.filename && currentProject.id === 'SplitwiseAI') {
      initialFilename = 'Main.java';
      initialPath = 'src/com/splitwise/Main.java';
    }

    const initialCode = options.code || this.getCodeForFile(currentProject.id, initialPath, initialFilename);

    // Initial state for this window instance
    const state = {
      winId,
      project: currentProject,
      tabs: [
        {
          id: `tab-${initialFilename}`,
          filename: initialFilename,
          filepath: initialPath,
          code: initialCode,
          icon: this.getFileIcon(initialFilename),
          language: this.getLanguageName(initialFilename)
        }
      ],
      activeTabId: `tab-${initialFilename}`,
      expandedFolders: new Set([
        'data',
        'src',
        'src/com',
        'src/com/splitwise',
        'web'
      ])
    };

    this.instances[winId] = state;

    // Render Full VS Code UI
    container.innerHTML = `
      <div class="vscode-container" id="vscode-root-${winId}">
        <!-- 1. Menubar & Command Palette -->
        <div class="vscode-menubar">
          <div class="vscode-menubar-left">
            <img src="assets/icons/vscode.png" class="vscode-brand-icon" alt="VS Code"/>
            <div class="vscode-menus">
              <span class="vscode-menu-item">File</span>
              <span class="vscode-menu-item">Edit</span>
              <span class="vscode-menu-item">Selection</span>
              <span class="vscode-menu-item">View</span>
              <span class="vscode-menu-item">Go</span>
              <span class="vscode-menu-item">Run</span>
              <span class="vscode-menu-item">Terminal</span>
              <span class="vscode-menu-item">Help</span>
            </div>
            <div class="vscode-nav-arrows">
              <button class="vscode-nav-btn" title="Back">‹</button>
              <button class="vscode-nav-btn" title="Forward">›</button>
            </div>
          </div>

          <div class="vscode-search-pill" id="vsc-search-${winId}" title="Command Palette (Ctrl+P)">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            <span id="vsc-title-pill-${winId}">${currentProject.id === 'SplitwiseAI' ? 'splitwise miniproject' : currentProject.name}</span>
          </div>

          <div class="vscode-menubar-right">
            <span title="Installing..." style="font-size:11px; opacity:0.75;">Installing...</span>
            <span class="vscode-menu-item" title="Toggle Secondary Side Bar">◫</span>
            <span class="vscode-menu-item" title="Customize Layout">▤</span>
            <span class="vscode-menu-item" title="Toggle Panel">▥</span>
          </div>
        </div>

        <!-- 2. Main Workspace -->
        <div class="vscode-main">
          <!-- 2a. Activity Bar (Leftmost 48px) -->
          <div class="vscode-activity-bar">
            <div class="vscode-act-group">
              <button class="vscode-act-btn active" title="Explorer (Ctrl+Shift+E)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.5 5h-7.09l-1.41-1.41A2 2 0 0 0 9.59 3H4.5A2.5 2.5 0 0 0 2 5.5v13A2.5 2.5 0 0 0 4.5 21h15a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 19.5 5zm.5 13.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5h5.09l1.41 1.41c.38.38.88.59 1.41.59H19.5a.5.5 0 0 1 .5.5z"/>
                </svg>
              </button>
              <button class="vscode-act-btn" title="Search (Ctrl+Shift+F)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
              <button class="vscode-act-btn" title="Source Control (Ctrl+Shift+G)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16c-.79 0-1.5.31-2.03.82l-7.07-4.13c.06-.23.1-.46.1-.69s-.04-.46-.1-.69l7.07-4.13c.53.51 1.24.82 2.03.82 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .23.04.46.1.69L8.9 9.81C8.37 9.3 7.66 8.99 6.87 8.99c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.03-.82l7.07 4.13c-.06.23-.1.46-.1.69 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                <span class="vscode-act-badge">1</span>
              </button>
              <button class="vscode-act-btn" title="Run and Debug (Ctrl+Shift+D)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 7h-2.18A8.006 8.006 0 0 0 13 3.06V1h-2v2.06A8.006 8.006 0 0 0 6.18 7H4v2h2.09c-.06.33-.09.66-.09 1v1H4v2h2v1c0 .34.03.67.09 1H4v2h2.18A8.006 8.006 0 0 0 11 20.94V23h2v-2.06A8.006 8.006 0 0 0 17.82 17H20v-2h-2.09c.06-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.03-.67-.09-1H20V7zm-8 12c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>
                </svg>
              </button>
              <button class="vscode-act-btn" title="Extensions (Ctrl+Shift+X)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z"/>
                </svg>
              </button>
            </div>

            <div class="vscode-act-group">
              <button class="vscode-act-btn" title="Accounts">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </button>
              <button class="vscode-act-btn" title="Manage / Settings">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.484.484 0 0 0 13.9 2h-3.8c-.24 0-.45.17-.49.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.73 8.47c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.8c.24 0 .44-.17.49-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 2b. Sidebar (Explorer) -->
          <div class="vscode-sidebar" id="vsc-sidebar-${winId}">
            <div class="vscode-sidebar-header">
              <span>EXPLORER</span>
              <div class="vscode-sidebar-actions">
                <span class="vscode-action-icon" title="New File">📄</span>
                <span class="vscode-action-icon" title="New Folder">📁</span>
                <span class="vscode-action-icon" title="Refresh">↻</span>
                <span class="vscode-action-icon" title="Collapse All">⇲</span>
              </div>
            </div>

            <!-- Project Root Header -->
            <div class="vscode-project-root" id="vsc-project-toggle-${winId}">
              <span class="vscode-arrow open" id="vsc-root-arrow-${winId}">›</span>
              <span style="font-weight:700;">${currentProject.id === 'SplitwiseAI' ? 'SPLITWISE-MINIPROJECT' : currentProject.name.toUpperCase()}</span>
            </div>

            <!-- Tree Container -->
            <div class="vscode-tree-container" id="vsc-tree-${winId}">
              <!-- Dynamic Tree rendered here -->
            </div>

            <!-- Accordion sections -->
            <div class="vscode-accordion-section">
              <div class="vscode-accordion-title"><span>›</span> OUTLINE</div>
            </div>
            <div class="vscode-accordion-section">
              <div class="vscode-accordion-title"><span>›</span> TIMELINE</div>
            </div>
            ${currentProject.id === 'SplitwiseAI' ? `
              <div class="vscode-accordion-section">
                <div class="vscode-accordion-title"><span>›</span> JAVA PROJECTS</div>
              </div>
            ` : ''}
          </div>

          <!-- 2c. Editor Area -->
          <div class="vscode-editor-pane">
            <!-- Tabs Bar -->
            <div class="vscode-tabs-bar" id="vsc-tabs-bar-${winId}">
              <!-- Dynamic tabs rendered here -->
              <div style="margin-left:auto; display:flex; align-items:center; gap:8px; padding-right:12px; color:#858585;">
                <span class="vscode-action-icon" title="Run Code" style="color:#89d185;">▶</span>
                <span class="vscode-action-icon" title="Split Editor Right">▥</span>
                <span class="vscode-action-icon" title="More Actions">⋯</span>
              </div>
            </div>

            <!-- Breadcrumbs -->
            <div class="vscode-breadcrumbs" id="vsc-breadcrumbs-${winId}">
              <!-- Breadcrumbs rendered here -->
            </div>

            <!-- Code Workspace (Gutter + Code + Minimap) -->
            <div class="vscode-code-container">
              <div class="vscode-scroll-area" id="vsc-scroll-area-${winId}">
                <div class="vscode-gutter" id="vsc-gutter-${winId}"></div>
                <pre class="vscode-editor-code" id="vsc-code-${winId}"></pre>
              </div>

              <!-- Minimap -->
              <div class="vscode-minimap" id="vsc-minimap-${winId}">
                <div class="vscode-minimap-canvas" id="vsc-mini-lines-${winId}"></div>
                <div class="vscode-minimap-slider" id="vsc-mini-slider-${winId}"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Bottom Status Bar -->
        <div class="vscode-statusbar">
          <div class="vscode-status-left">
            <span class="vscode-status-item" title="Git Branch: main">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1z"/>
              </svg>
              <span>main</span>
            </span>
            <span class="vscode-status-item" title="0 Errors, 0 Warnings">
              <span>⨂ 0  ⚠ 0</span>
            </span>
            <span class="vscode-status-item" id="vsc-status-lang-state-${winId}">
              <span>Java: Activating...</span>
            </span>
          </div>

          <div class="vscode-status-right">
            <span class="vscode-status-item" id="vsc-status-linecol-${winId}">Ln 1, Col 1</span>
            <span class="vscode-status-item">Spaces: 4</span>
            <span class="vscode-status-item">UTF-8</span>
            <span class="vscode-status-item">LF</span>
            <span class="vscode-status-item" id="vsc-status-language-${winId}">{} Java</span>
            <span class="vscode-status-item" title="Notifications">🔔</span>
          </div>
        </div>
      </div>
    `;

    // Render tree, tabs, and initial editor content
    this.renderTree(winId);
    this.renderTabs(winId);
    this.renderActiveTabContent(winId);

    // Setup interactions
    this.setupInteractions(winId);
  },

  // Renders the recursive file tree matching Screenshot 3
  renderTree(winId) {
    const state = this.instances[winId];
    if (!state) return;

    const treeContainer = document.getElementById(`vsc-tree-${winId}`);
    if (!treeContainer) return;

    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    const activeFilepath = activeTab ? activeTab.filepath : '';

    const buildTreeHTML = (items, parentPath = '', depth = 0) => {
      let html = '';
      if (!items || !items.length) return html;

      for (const item of items) {
        const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
        const isFolder = item.isFolder || item.type === 'File folder' || (item.children && item.children.length > 0);
        const paddingLeft = 12 + depth * 14;

        if (isFolder) {
          const isOpen = state.expandedFolders.has(itemPath);
          html += `
            <div class="vscode-tree-item vscode-tree-folder" data-folder-path="${itemPath}" style="padding-left: ${paddingLeft}px;">
              <span class="vscode-arrow ${isOpen ? 'open' : ''}">›</span>
              <span class="vscode-file-icon vsi-folder">📁</span>
              <span class="vscode-file-name">${item.name}</span>
            </div>
          `;

          if (isOpen && item.children) {
            html += buildTreeHTML(item.children, itemPath, depth + 1);
          }
        } else {
          const icon = this.getFileIcon(item.name);
          const isSelected = (activeFilepath === itemPath || (activeTab && activeTab.filename === item.name));

          html += `
            <div class="vscode-tree-item vscode-tree-file ${isSelected ? 'selected' : ''}"
                 data-file-name="${item.name}"
                 data-file-path="${itemPath}"
                 style="padding-left: ${paddingLeft + 16}px;">
              <span class="vscode-file-icon ${icon.cls}" style="color:${icon.color};">${icon.text}</span>
              <span class="vscode-file-name">${item.name}</span>
            </div>
          `;
        }
      }
      return html;
    };

    treeContainer.innerHTML = buildTreeHTML(state.project.files || []);

    // Bind click events on tree items
    treeContainer.querySelectorAll('.vscode-tree-folder').forEach(folderEl => {
      folderEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const path = folderEl.dataset.folderPath;
        if (state.expandedFolders.has(path)) {
          state.expandedFolders.delete(path);
        } else {
          state.expandedFolders.add(path);
        }
        this.renderTree(winId);
      });
    });

    treeContainer.querySelectorAll('.vscode-tree-file').forEach(fileEl => {
      fileEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const filename = fileEl.dataset.fileName;
        const filepath = fileEl.dataset.filePath;
        this.openFile(winId, { filename, filepath, projectId: state.project.id });
      });
    });
  },

  // Renders tabs in editor top bar
  renderTabs(winId) {
    const state = this.instances[winId];
    if (!state) return;

    const tabsBar = document.getElementById(`vsc-tabs-bar-${winId}`);
    if (!tabsBar) return;

    const tabsHTML = state.tabs.map(tab => {
      const isActive = tab.id === state.activeTabId;
      return `
        <div class="vscode-tab ${isActive ? 'active' : ''}" data-tab-id="${tab.id}">
          <span class="vscode-file-icon ${tab.icon.cls}" style="color:${tab.icon.color};">${tab.icon.text}</span>
          <span>${tab.filename}</span>
          <span class="vscode-tab-close" data-close-id="${tab.id}" title="Close (Ctrl+W)">✕</span>
        </div>
      `;
    }).join('');

    // Preserve the right action buttons
    const actionsHTML = `
      <div style="margin-left:auto; display:flex; align-items:center; gap:8px; padding-right:12px; color:#858585;">
        <span class="vscode-action-icon" title="Run Code" style="color:#89d185;">▶</span>
        <span class="vscode-action-icon" title="Split Editor Right">▥</span>
        <span class="vscode-action-icon" title="More Actions">⋯</span>
      </div>
    `;

    tabsBar.innerHTML = tabsHTML + actionsHTML;

    // Tab switch & close events
    tabsBar.querySelectorAll('.vscode-tab').forEach(tabEl => {
      tabEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('vscode-tab-close')) return;
        state.activeTabId = tabEl.dataset.tabId;
        this.renderTabs(winId);
        this.renderActiveTabContent(winId);
        this.renderTree(winId);
      });
    });

    tabsBar.querySelectorAll('.vscode-tab-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const closeId = closeBtn.dataset.closeId;
        this.closeTab(winId, closeId);
      });
    });
  },

  closeTab(winId, tabId) {
    const state = this.instances[winId];
    if (!state) return;

    const idx = state.tabs.findIndex(t => t.id === tabId);
    if (idx === -1) return;

    state.tabs.splice(idx, 1);

    if (state.activeTabId === tabId) {
      if (state.tabs.length > 0) {
        state.activeTabId = state.tabs[Math.max(0, idx - 1)].id;
      } else {
        state.activeTabId = null;
      }
    }

    this.renderTabs(winId);
    this.renderActiveTabContent(winId);
    this.renderTree(winId);
  },

  // Open a file into the editor tabs
  openFile(winId, options = {}) {
    const state = this.instances[winId];
    if (!state) return;

    const filename = options.filename || 'Main.java';
    const filepath = options.filepath || filename;

    if (options.projectId && (!state.project || state.project.id !== options.projectId)) {
      const projects = (window.ProjectsData && window.ProjectsData.length) ? window.ProjectsData : [];
      const newProj = projects.find(p => p.id === options.projectId || p.name === options.projectId);
      if (newProj) {
        state.project = newProj;
        const rootHeader = document.querySelector(`#vsc-project-toggle-${winId} span:last-child`);
        if (rootHeader) rootHeader.textContent = (newProj.name || newProj.id).toUpperCase();
        const titlePill = document.getElementById(`vsc-title-pill-${winId}`);
        if (titlePill) titlePill.textContent = newProj.name || newProj.id;
      }
    }

    // Check if tab already exists
    let existingTab = state.tabs.find(t => t.filepath === filepath || t.filename === filename);
    if (existingTab) {
      state.activeTabId = existingTab.id;
    } else {
      const code = options.code || this.getCodeForFile(state.project.id, filepath, filename);
      const newTab = {
        id: `tab-${filename}-${Date.now()}`,
        filename: filename,
        filepath: filepath,
        code: code,
        icon: this.getFileIcon(filename),
        language: this.getLanguageName(filename)
      };
      state.tabs.push(newTab);
      state.activeTabId = newTab.id;
    }

    // Auto-expand folders in path
    const parts = filepath.split('/');
    let currentPart = '';
    for (let i = 0; i < parts.length - 1; i++) {
      currentPart = currentPart ? `${currentPart}/${parts[i]}` : parts[i];
      state.expandedFolders.add(currentPart);
    }

    this.renderTabs(winId);
    this.renderActiveTabContent(winId);
    this.renderTree(winId);
  },

  // Render the code, gutter line numbers, breadcrumbs, minimap, status bar
  renderActiveTabContent(winId) {
    const state = this.instances[winId];
    if (!state) return;

    const gutter = document.getElementById(`vsc-gutter-${winId}`);
    const codeEl = document.getElementById(`vsc-code-${winId}`);
    const breadcrumbs = document.getElementById(`vsc-breadcrumbs-${winId}`);
    const miniLines = document.getElementById(`vsc-mini-lines-${winId}`);
    const statusLang = document.getElementById(`vsc-status-language-${winId}`);
    const statusLangState = document.getElementById(`vsc-status-lang-state-${winId}`);

    const activeTab = state.tabs.find(t => t.id === state.activeTabId);

    if (!activeTab) {
      if (gutter) gutter.innerHTML = '';
      if (codeEl) codeEl.innerHTML = '<div style="padding:40px; text-align:center; color:#555;">No file is open.<br>Select a file from the Explorer on the left.</div>';
      if (breadcrumbs) breadcrumbs.innerHTML = '';
      if (miniLines) miniLines.innerHTML = '';
      return;
    }

    // 1. Breadcrumbs: e.g. src > com > splitwise > J Main.java
    const pathSegments = activeTab.filepath.split('/');
    breadcrumbs.innerHTML = pathSegments.map((seg, idx) => {
      const isLast = idx === pathSegments.length - 1;
      if (isLast) {
        return `
          <span class="vscode-crumb-item" style="color:#ffffff;">
            <span class="vscode-file-icon ${activeTab.icon.cls}" style="color:${activeTab.icon.color};">${activeTab.icon.text}</span>
            <span>${seg}</span>
          </span>
        `;
      }
      return `
        <span class="vscode-crumb-item">
          <span>${seg}</span>
        </span>
        <span class="vscode-crumb-sep">›</span>
      `;
    }).join('');

    // Check if image file
    const ext = (activeTab.filename || '').split('.').pop().toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext);

    if (isImage) {
      if (gutter) gutter.innerHTML = '';
      if (miniLines) miniLines.innerHTML = '';
      const imgSrc = activeTab.filepath.startsWith('http') || activeTab.filepath.startsWith('assets')
        ? activeTab.filepath
        : `assets/${activeTab.filename}`;
      if (codeEl) {
        codeEl.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; width:100%; height:100%; box-sizing:border-box;">
            <img src="${imgSrc}" alt="${activeTab.filename}" style="max-width:85%; max-height:420px; border-radius:4px; box-shadow:0 6px 20px rgba(0,0,0,0.6); object-fit:contain;" onerror="this.src='assets/icons/folder.png'"/>
            <div style="margin-top:14px; color:#858585; font-size:12px;">${activeTab.filename} • Image Preview</div>
          </div>
        `;
      }
      if (statusLang) statusLang.textContent = `{ } Image`;
      if (statusLangState) statusLangState.innerHTML = `<span>Image Preview</span>`;
      return;
    }

    // 2. Syntax Highlighting & Line Numbers
    const lines = (activeTab.code || '').split('\n');
    let gutterHTML = '';
    let codeHTML = '';
    let miniLinesHTML = '';

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      gutterHTML += `<div>${lineNum}</div>`;
      codeHTML += this.highlightSyntaxLine(lines[i], activeTab.filename) + '\n';

      // Minimap preview line width based on line length
      const len = Math.min(100, Math.max(10, lines[i].trim().length * 2.5));
      const isComment = lines[i].trim().startsWith('//') || lines[i].trim().startsWith('#') || lines[i].trim().startsWith('<!--');
      const isKeyword = /^\s*(public|private|static|class|import|def|function|const|let|return|<)/.test(lines[i]);
      const color = isComment ? '#6a9955' : isKeyword ? '#c586c0' : '#4ec9b0';
      miniLinesHTML += `<div class="vscode-mini-line" style="width:${len}%; background:${color};"></div>`;
    }

    if (gutter) gutter.innerHTML = gutterHTML;
    if (codeEl) codeEl.innerHTML = codeHTML;
    if (miniLines) miniLines.innerHTML = miniLinesHTML;

    // 3. Status Bar
    if (statusLang) statusLang.textContent = `{ } ${activeTab.language}`;
    if (statusLangState) {
      statusLangState.innerHTML = `<span>${activeTab.language}: Ready</span>`;
    }
  },

  // Tokenize a single line with authentic VS Code Dark+ colors
  highlightSyntaxLine(rawLine, filename) {
    if (!rawLine) return '';

    const ext = (filename || '').split('.').pop().toLowerCase();

    // HTML escape
    let line = rawLine
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Comments check
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('&lt;!--') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return `<span class="token-comment">${line}</span>`;
    }

    if (ext === 'html' || ext === 'xml') {
      line = line.replace(/(&lt;\/?)([a-zA-Z0-9\-!]+)/g, '$1<span class="token-tag">$2</span>');
      line = line.replace(/(&gt;)/g, '<span class="token-tag">&gt;</span>');
      line = line.replace(/([a-zA-Z0-9\-:@]+)(?==)/g, '<span class="token-attr">$1</span>');
      line = line.replace(/("[^"]*"|'[^']*')/g, '<span class="token-string">$1</span>');
      return line;
    }

    if (ext === 'css') {
      if (line.includes(':') && !trimmed.startsWith('@')) {
        line = line.replace(/^(\s*)([a-zA-Z\-]+)(\s*:)/, '$1<span class="token-variable">$2</span>$3');
        line = line.replace(/:\s*([^;]+);?/, ': <span class="token-function">$1</span>;');
      }
      line = line.replace(/("[^"]*"|'[^']*')/g, '<span class="token-string">$1</span>');
      return line;
    }

    // Strings: "..." or '...'
    line = line.replace(/(&quot;.*?&quot;|"[^"]*"|'[^']*'|`[^`]*`)/g, '<span class="token-string">$1</span>');

    // Annotations: @Override, @Component
    line = line.replace(/(@[A-Za-z0-9_]+)/g, '<span class="token-annotation">$1</span>');

    // Keywords
    const keywordsRegex = /\b(public|private|protected|static|final|class|interface|enum|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throws|throw|import|package|void|int|boolean|byte|double|float|long|short|char|const|let|var|function|async|await|def|from|as|lambda|True|False|None|null|this|super|export|default|from)\b/g;
    line = line.replace(keywordsRegex, '<span class="token-keyword">$1</span>');

    // Types / Classes (Capitalized identifiers)
    line = line.replace(/\b([A-Z][A-Za-z0-9_]+)\b/g, '<span class="token-type">$1</span>');

    // Function invocations: ident(
    line = line.replace(/\b([a-zA-Z0-9_]+)(?=\()/g, '<span class="token-function">$1</span>');

    // Numbers
    line = line.replace(/\b([0-9]+)\b/g, '<span class="token-number">$1</span>');

    return line;
  },

  setupInteractions(winId) {
    const scrollArea = document.getElementById(`vsc-scroll-area-${winId}`);
    const slider = document.getElementById(`vsc-mini-slider-${winId}`);
    const lineCol = document.getElementById(`vsc-status-linecol-${winId}`);

    if (scrollArea && slider) {
      scrollArea.addEventListener('scroll', () => {
        const maxScroll = scrollArea.scrollHeight - scrollArea.clientHeight;
        if (maxScroll > 0) {
          const ratio = scrollArea.scrollTop / maxScroll;
          const sliderMax = scrollArea.clientHeight - 60;
          slider.style.top = `${ratio * sliderMax}px`;
        }

        const approxLine = Math.floor(scrollArea.scrollTop / 20) + 1;
        if (lineCol) {
          lineCol.textContent = `Ln ${approxLine}, Col 1`;
        }
      });
    }

    // Toggle Project Root in Sidebar
    const rootToggle = document.getElementById(`vsc-project-toggle-${winId}`);
    const tree = document.getElementById(`vsc-tree-${winId}`);
    const rootArrow = document.getElementById(`vsc-root-arrow-${winId}`);

    if (rootToggle && tree && rootArrow) {
      rootToggle.addEventListener('click', () => {
        const isHidden = tree.style.display === 'none';
        tree.style.display = isHidden ? 'block' : 'none';
        rootArrow.classList.toggle('open', isHidden);
      });
    }
  }
};

window.VSCodeApp = VSCodeApp;
