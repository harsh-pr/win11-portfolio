/**
 * Windows 11 File Explorer - Native Folder View, Multi-Level Navigation & Recycle Bin
 * Layout and details list matching Windows 11 specifications:
 * - Details Header height: 36px with 24px vertical dividers (top: 6px, bottom: 6px)
 * - Row height: 28px with authentic Windows 11 spacing and selection pill
 * - Full multi-level directory tree for Projects
 * - Authentic Recycle Bin view matching real Windows 11 screenshot with 6 columns:
 *   Name | Original Location | Date Deleted (with upward sort caret ^) | Size | Item type | Date modified
 * - Complete data integration for Mumbai IT engineering student files, developer logs, and screenshot items.
 */

const ExplorerApp = {
  get projects() {
    if (window.ProjectsData && window.ProjectsData.length > 0) {
      return window.ProjectsData;
    }
    return this._projects || [];
  },
  set projects(val) {
    this._projects = val;
  },

  // Track window states per instance
  getState(winId, options = {}) {
    if (!this._windowStates) this._windowStates = {};
    if (!this._windowStates[winId]) {
      const isTrash = options.initialView === 'trash';
      const defaultProj = this.projects[0] || null;
      this._windowStates[winId] = {
        currentView: isTrash ? 'trash' : 'project', // 'project' | 'root' | 'trash'
        currentProject: isTrash ? null : defaultProj,
        currentPath: [], // Subfolder array e.g. ['src', 'components']
        history: [{
          view: isTrash ? 'trash' : 'project',
          projectId: isTrash ? null : (defaultProj?.id || 'AttendanceManager'),
          path: []
        }],
        historyIdx: 0,
        selectedId: isTrash ? 'trash' : (defaultProj?.id || 'AttendanceManager'),
        selectedFileName: isTrash ? (window.RecycleBinData?.[0]?.name || null) : '.gitignore',
        sortCol: 'name',
        sortAsc: true,
        trashSortCol: 'dateDeleted',
        trashSortAsc: true // Upward sort caret matching screenshot
      };
    }
    return this._windowStates[winId];
  },

  renderCaret(isAsc) {
    return `
      <span class="exp-sort-caret">
        <svg width="9" height="5" viewBox="0 0 9 5" fill="none">
          <path d="${isAsc ? 'M0.5 4.5L4.5 0.5L8.5 4.5' : 'M0.5 0.5L4.5 4.5L8.5 0.5'}" stroke="#c0c0c0" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    `;
  },

  parseDate(str) {
    if (!str) return 0;
    const match = str.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let [_, day, month, year, hours, mins, ampm] = match;
    hours = parseInt(hours, 10);
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), hours, parseInt(mins, 10)).getTime();
  },

  mount(container, winId, options = {}) {
    const state = this.getState(winId, options);

    container.innerHTML = `
      <div class="explorer-container">
        <!-- Top Toolbar & Address Bar -->
        <div class="exp-top-bar">
          <div class="exp-nav-btns">
            <button class="exp-nav-btn" id="exp-back-${winId}" title="Back (Alt+Left Arrow)" disabled>🡠</button>
            <button class="exp-nav-btn" id="exp-fwd-${winId}" title="Forward (Alt+Right Arrow)" disabled>🡢</button>
            <button class="exp-nav-btn" id="exp-up-${winId}" title="Up to Parent Folder (Alt+Up Arrow)">🡡</button>
          </div>

          <div class="exp-address-bar">
            <img src="${state.currentView === 'trash' ? 'assets/icons/trash.png' : 'assets/icons/folder.png'}" alt="Folder" class="exp-address-folder-icon" id="exp-addr-icon-${winId}"/>
            <div class="exp-breadcrumb-path" id="exp-breadcrumbs-${winId}">
              <!-- Dynamic breadcrumb path -->
            </div>
          </div>

          <div class="exp-search-box">
            <span>🔍︎</span>
            <input type="text" id="exp-search-input-${winId}" placeholder="${state.currentView === 'trash' ? 'Search Recycle Bin...' : 'Search Projects...'}"/>
          </div>
        </div>

        <!-- Action Command Bar -->
        <div class="exp-command-bar" id="exp-cmd-bar-${winId}">
          <button class="exp-cmd-btn" id="cmd-launch-preview-${winId}" title="Launch live preview inside portfolio website">
            <span class="exp-cmd-icon">🌎︎</span>
            <span>Launch preview</span>
          </button>
          <button class="exp-cmd-btn" id="cmd-redirect-website-${winId}" title="Redirect to website in new tab">
            <span class="exp-cmd-icon">↪</span>
            <span>Redirect to website</span>
          </button>
          <button class="exp-cmd-btn" id="cmd-github-repo-${winId}" title="Redirect to GitHub repo">
            <span class="exp-cmd-icon">{ }</span>
            <span>GitHub repo</span>
          </button>
        </div>

        <!-- Main Split View (Sidebar + List) -->
        <div class="exp-main">
          <!-- Sidebar Navigation Pane -->
          <div class="exp-sidebar">
            <div class="exp-sidebar-section-title">QUICK ACCESS</div>
            <div class="exp-sidebar-item ${state.currentView === 'root' ? 'active' : ''}" id="side-projects-${winId}">
              <img src="assets/icons/folder.png" class="exp-sidebar-icon-img" alt=""/>
              <span>Projects</span>
            </div>
            <div class="exp-sidebar-item" id="side-desktop-${winId}">
              <img src="assets/icons/desklogo.png" class="exp-sidebar-icon-img" alt=""/>
              <span>Desktop</span>
            </div>
            <div class="exp-sidebar-item" id="side-resume-${winId}">
              <img src="assets/icons/notepad.png" class="exp-sidebar-icon-img" alt=""/>
              <span>Resume.txt</span>
            </div>
            <div class="exp-sidebar-item ${state.currentView === 'trash' ? 'active' : ''}" id="side-recycle-${winId}">
              <img src="assets/icons/trash.png" class="exp-sidebar-icon-img" alt=""/>
              <span>Recycle Bin</span>
            </div>

            <div class="exp-sidebar-section-title" style="margin-top:14px;">FOLDERS</div>
            ${this.projects.map(p => `
              <div class="exp-sidebar-item side-repo-link ${p.id === state.selectedId && state.currentView === 'project' ? 'active' : ''}" 
                   id="side-repo-${p.id}-${winId}" 
                   data-proj-id="${p.id}">
                <img src="assets/icons/folder.png" class="exp-sidebar-icon-img" alt=""/>
                <span>${p.name || p.id}</span>
              </div>
            `).join('')}
          </div>

          <!-- Dynamic Content Area -->
          <div class="exp-content" id="exp-content-${winId}">
            <!-- Populated dynamically -->
          </div>
        </div>

        <!-- Status Bar -->
        <div class="exp-status-bar">
          <span id="exp-status-left-${winId}">19 items</span>
          <span id="exp-status-right-${winId}">1 item selected</span>
        </div>
      </div>
    `;

    // Render initial view
    if (state.currentView === 'trash') {
      this.openRecycleBin(winId, false);
    } else if (state.currentProject) {
      this.openDirectory(winId, state.currentProject, state.currentPath, false);
    } else {
      this.renderRoot(winId, false);
    }

    this.attachEvents(winId);
    this.setupExplorerContextMenu(winId);
  },

  // 1. Root View: Horizontal Folder Grid
  renderRoot(winId, pushHistory = true) {
    const state = this.getState(winId);
    state.currentView = 'root';
    state.currentProject = null;
    state.currentPath = [];
    state.selectedId = 'root';
    state.selectedFileName = null;

    if (pushHistory) {
      if (state.historyIdx < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIdx + 1);
      }
      state.history.push({ view: 'root', projectId: null, path: [] });
      state.historyIdx = state.history.length - 1;
    }

    this.updateNavButtons(winId);
    this.updateSidebarHighlight(winId, 'root');

    // Restore folder icon & search placeholder
    const addrIcon = document.getElementById(`exp-addr-icon-${winId}`);
    if (addrIcon) addrIcon.src = 'assets/icons/folder.png';
    const searchInput = document.getElementById(`exp-search-input-${winId}`);
    if (searchInput) {
      searchInput.placeholder = 'Search Projects...';
      searchInput.value = '';
    }

    // Restore standard command bar
    this.restoreCommandBar(winId);

    const breadcrumbs = document.getElementById(`exp-breadcrumbs-${winId}`);
    if (breadcrumbs) {
      breadcrumbs.innerHTML = `
        <span class="exp-breadcrumb-item crumb-nav" data-nav="root">This PC</span>
        <span class="exp-breadcrumb-sep">＞</span>
        <span class="exp-breadcrumb-item crumb-nav" data-nav="root">Documents</span>
        <span class="exp-breadcrumb-sep">＞</span>
        <span class="exp-breadcrumb-item crumb-nav active" data-nav="root">Projects</span>
      `;
      breadcrumbs.querySelectorAll('.crumb-nav').forEach(c => {
        c.addEventListener('click', () => this.renderRoot(winId));
      });
    }

    const statusLeft = document.getElementById(`exp-status-left-${winId}`);
    const statusRight = document.getElementById(`exp-status-right-${winId}`);
    if (statusLeft) statusLeft.textContent = `${this.projects.length} items`;
    if (statusRight) statusRight.textContent = '1 item selected';

    const content = document.getElementById(`exp-content-${winId}`);
    if (!content) return;

    content.innerHTML = `
      <div class="win11-folder-grid" id="folder-grid-${winId}">
        ${this.projects.map(p => `
          <div class="win11-folder-item ${p.id === state.selectedId ? 'selected' : ''}" 
               data-proj-id="${p.id}" 
               title="${p.title || p.name}&#10;Double-click to open folder">
            <div class="win11-folder-icon-wrap">
              <img src="${p.icon || 'assets/icons/folder.png'}" class="win11-folder-icon-img" alt="${p.name}"/>
            </div>
            <div class="win11-folder-name">${p.name || p.id}</div>
          </div>
        `).join('')}
      </div>
    `;

    const folderItems = content.querySelectorAll('.win11-folder-item');
    folderItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        folderItems.forEach(f => f.classList.remove('selected'));
        item.classList.add('selected');
        state.selectedId = item.dataset.projId;
        if (statusRight) statusRight.textContent = '1 item selected';
      });

      item.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.openProject(winId, item.dataset.projId);
      });
    });

    content.addEventListener('click', (e) => {
      if (e.target === content || e.target.id === `folder-grid-${winId}`) {
        folderItems.forEach(f => f.classList.remove('selected'));
        if (statusRight) statusRight.textContent = '';
      }
    });

    this.setupExplorerMarquee(winId);
  },

  // 2. Open Project Folder at Top Directory
  openProject(winId, projectId, pushHistory = true) {
    const project = this.projects.find(p => p.id === projectId || p.name === projectId);
    if (!project) return;
    this.openDirectory(winId, project, [], pushHistory);
  },

  // 3. Open Directory / Subfolder Inside Project (Full recursive subfolder navigation)
  openDirectory(winId, project, pathArray = [], pushHistory = true) {
    const state = this.getState(winId);
    state.currentView = 'project';
    state.currentProject = project;
    state.currentPath = [...pathArray];
    state.selectedId = project.id;

    if (pushHistory) {
      if (state.historyIdx < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIdx + 1);
      }
      state.history.push({ view: 'project', projectId: project.id, path: [...pathArray] });
      state.historyIdx = state.history.length - 1;
    }

    this.updateNavButtons(winId);
    this.updateSidebarHighlight(winId, project.id);

    // Restore folder icon & search placeholder
    const addrIcon = document.getElementById(`exp-addr-icon-${winId}`);
    if (addrIcon) addrIcon.src = 'assets/icons/folder.png';
    const searchInput = document.getElementById(`exp-search-input-${winId}`);
    if (searchInput) {
      searchInput.placeholder = 'Search Projects...';
      searchInput.value = '';
    }

    // Restore standard command bar
    this.restoreCommandBar(winId);

    // Resolve items for current directory
    const currentItems = this.getItemsAtPath(project, pathArray);
    state.selectedFileName = state.selectedFileName || currentItems[0]?.name || null;

    // Breadcrumbs: This PC > Documents > Projects > ProjectName > Subfolders
    const breadcrumbs = document.getElementById(`exp-breadcrumbs-${winId}`);
    if (breadcrumbs) {
      let breadcrumbHtml = `
        <span class="exp-breadcrumb-item crumb-root">This PC</span>
        <span class="exp-breadcrumb-sep">＞</span>
        <span class="exp-breadcrumb-item crumb-root">Documents</span>
        <span class="exp-breadcrumb-sep">＞</span>
        <span class="exp-breadcrumb-item crumb-projects">Projects</span>
        <span class="exp-breadcrumb-sep">＞</span>
        <span class="exp-breadcrumb-item crumb-proj ${pathArray.length === 0 ? 'active' : ''}">${project.name || project.id}</span>
      `;

      pathArray.forEach((seg, idx) => {
        const isLast = idx === pathArray.length - 1;
        breadcrumbHtml += `
          <span class="exp-breadcrumb-sep">＞</span>
          <span class="exp-breadcrumb-item crumb-sub ${isLast ? 'active' : ''}" data-idx="${idx}">${seg}</span>
        `;
      });

      breadcrumbs.innerHTML = breadcrumbHtml;

      // Wire breadcrumb events
      breadcrumbs.querySelectorAll('.crumb-root, .crumb-projects').forEach(c => {
        c.addEventListener('click', () => this.renderRoot(winId));
      });
      const projCrumb = breadcrumbs.querySelector('.crumb-proj');
      if (projCrumb) {
        projCrumb.addEventListener('click', () => this.openDirectory(winId, project, []));
      }
      breadcrumbs.querySelectorAll('.crumb-sub').forEach(c => {
        c.addEventListener('click', () => {
          const targetIdx = parseInt(c.dataset.idx, 10);
          this.openDirectory(winId, project, pathArray.slice(0, targetIdx + 1));
        });
      });
    }

    // Group and sort items: FOLDERS ALWAYS ON TOP, FILES BELOW
    currentItems.sort((a, b) => {
      const aIsFolder = a.isFolder || a.type === 'File folder';
      const bIsFolder = b.isFolder || b.type === 'File folder';
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;

      let res = 0;
      if (state.sortCol === 'name') {
        res = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      } else if (state.sortCol === 'date') {
        res = (a.date || '').localeCompare(b.date || '');
      } else if (state.sortCol === 'type') {
        res = (a.type || '').localeCompare(b.type || '');
      } else if (state.sortCol === 'size') {
        const sA = parseFloat((a.size || '0').replace(/[^0-9.]/g, '')) || 0;
        const sB = parseFloat((b.size || '0').replace(/[^0-9.]/g, '')) || 0;
        res = sA - sB;
      }
      return state.sortAsc ? res : -res;
    });

    // Update status bar
    const statusLeft = document.getElementById(`exp-status-left-${winId}`);
    const statusRight = document.getElementById(`exp-status-right-${winId}`);
    if (statusLeft) statusLeft.textContent = `${currentItems.length} items`;
    if (statusRight) statusRight.textContent = currentItems.length > 0 ? '1 item selected' : '';

    const content = document.getElementById(`exp-content-${winId}`);
    if (!content) return;

    // Render Details List with 36px header height matching screenshot
    content.innerHTML = `
      <div class="exp-details-container">
        <div class="exp-details-inner">
          <div class="exp-details-header">
            <div class="exp-col-header exp-col-name" id="sort-name-${winId}">
              ${state.sortCol === 'name' ? this.renderCaret(state.sortAsc) : ''}
              <span>Name</span>
            </div>
            <div class="exp-col-header exp-col-date" id="sort-date-${winId}">
              ${state.sortCol === 'date' ? this.renderCaret(state.sortAsc) : ''}
              <span>Date modified</span>
            </div>
            <div class="exp-col-header exp-col-type" id="sort-type-${winId}">
              ${state.sortCol === 'type' ? this.renderCaret(state.sortAsc) : ''}
              <span>Type</span>
            </div>
            <div class="exp-col-header exp-col-size" id="sort-size-${winId}">
              ${state.sortCol === 'size' ? this.renderCaret(state.sortAsc) : ''}
              <span>Size</span>
            </div>
            <div class="exp-col-spacer"></div>
          </div>

          <div class="exp-details-body" id="details-rows-${winId}">
            ${currentItems.length === 0 ? `
              <div style="padding: 24px; color: #888888; font-size: 12.5px;">This folder is empty.</div>
            ` : currentItems.map(f => `
              <div class="exp-details-row ${f.name === state.selectedFileName ? 'selected' : ''}" 
                   data-file-name="${f.name}"
                   title="${f.isFolder || f.type === 'File folder' ? 'Double-click to open folder' : 'Double-click to open in Visual Studio Code'}">
                <div class="exp-cell-name">
                  <img src="${this.getFileIcon(f)}" class="exp-row-icon" alt="${f.name}"/>
                  <span>${f.name}</span>
                </div>
                <div class="exp-cell-date">${f.date || ''}</div>
                <div class="exp-cell-type">${f.type || ''}</div>
                <div class="exp-cell-size">${f.size || ''}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Row selection and double-click navigation
    const rows = content.querySelectorAll('.exp-details-row');
    rows.forEach(row => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        rows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        state.selectedFileName = row.dataset.fileName;
        const fileObj = currentItems.find(f => f.name === row.dataset.fileName);
        if (statusRight && fileObj) {
          statusRight.textContent = '1 item selected';
        }
      });

      // DOUBLE-CLICK: If folder -> opens folder! If file -> opens in VS Code!
      row.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const filename = row.dataset.fileName;
        const fileObj = currentItems.find(f => f.name === filename);
        if (!fileObj) return;

        if (fileObj.isFolder || fileObj.type === 'File folder') {
          this.openDirectory(winId, project, [...pathArray, fileObj.name]);
        } else {
          this.openFileInWindow(project, fileObj, pathArray);
        }
      });
    });

    // Header column sorting (toggles column and re-renders)
    ['name', 'date', 'type', 'size'].forEach(col => {
      const header = document.getElementById(`sort-${col}-${winId}`);
      if (header) {
        header.addEventListener('click', () => {
          if (state.sortCol === col) {
            state.sortAsc = !state.sortAsc;
          } else {
            state.sortCol = col;
            state.sortAsc = true;
          }
          this.openDirectory(winId, project, pathArray, false);
        });
      }
    });

    this.setupExplorerMarquee(winId);
  },

  // 4. Open Recycle Bin View (Matches real Windows 11 screenshot)
  openRecycleBin(winId, pushHistory = true) {
    const state = this.getState(winId);
    state.currentView = 'trash';
    state.currentProject = null;
    state.currentPath = [];
    state.selectedId = 'trash';

    if (pushHistory) {
      if (state.historyIdx < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIdx + 1);
      }
      state.history.push({ view: 'trash', projectId: null, path: [] });
      state.historyIdx = state.history.length - 1;
    }

    this.updateNavButtons(winId);
    this.updateSidebarHighlight(winId, 'trash');

    // Update Address Bar icon & breadcrumbs
    const addrIcon = document.getElementById(`exp-addr-icon-${winId}`);
    if (addrIcon) addrIcon.src = 'assets/icons/trash.png';

    const breadcrumbs = document.getElementById(`exp-breadcrumbs-${winId}`);
    if (breadcrumbs) {
      breadcrumbs.innerHTML = `
        <span class="exp-breadcrumb-item active">Recycle Bin</span>
      `;
    }

    // Update Search box placeholder
    const searchInput = document.getElementById(`exp-search-input-${winId}`);
    if (searchInput) {
      searchInput.placeholder = 'Search Recycle Bin...';
      searchInput.value = '';
    }

    // Update Command bar for Recycle Bin actions
    const cmdBar = document.getElementById(`exp-cmd-bar-${winId}`);
    if (cmdBar) {
      cmdBar.innerHTML = `
        <button class="exp-cmd-btn" id="cmd-empty-trash-${winId}" title="Empty Recycle Bin">
          <span class="exp-cmd-icon">🗑</span>
          <span>Empty Recycle Bin</span>
        </button>
        <button class="exp-cmd-btn" id="cmd-restore-all-${winId}" title="Restore all deleted items">
          <span class="exp-cmd-icon">↺</span>
          <span>Restore all items</span>
        </button>
        <button class="exp-cmd-btn" id="cmd-trash-props-${winId}" title="Recycle Bin Properties">
          <span class="exp-cmd-icon">ℹ</span>
          <span>Properties</span>
        </button>
      `;

      document.getElementById(`cmd-empty-trash-${winId}`)?.addEventListener('click', () => {
        if (window.Notifications) {
          window.Notifications.show({
            title: 'Recycle Bin',
            message: 'Portfolio easter egg items cannot be permanently deleted!',
            icon: '🗑',
            duration: 3000
          });
        }
      });

      document.getElementById(`cmd-restore-all-${winId}`)?.addEventListener('click', () => {
        if (window.Notifications) {
          window.Notifications.show({
            title: 'Recycle Bin',
            message: 'All items are preserved in place for exploration.',
            icon: '↺',
            duration: 3000
          });
        }
      });

      document.getElementById(`cmd-trash-props-${winId}`)?.addEventListener('click', () => {
        const binItems = window.RecycleBinData || [];
        const totalKb = binItems.reduce((acc, it) => acc + (parseFloat(it.size) || 0), 0);
        if (window.Notifications) {
          window.Notifications.show({
            title: 'Recycle Bin Properties',
            message: `Total size: ${totalKb} KB across ${binItems.length} items. Drive C: Healthy.`,
            icon: 'ℹ',
            duration: 3500
          });
        }
      });
    }

    // Get Recycle Bin items
    const items = (window.RecycleBinData && window.RecycleBinData.length > 0)
      ? [...window.RecycleBinData]
      : [];

    state.selectedFileName = state.selectedFileName || items[0]?.name || null;

    // Sort items
    items.sort((a, b) => {
      let res = 0;
      const col = state.trashSortCol;
      if (col === 'name') {
        res = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      } else if (col === 'origLocation') {
        res = (a.origLocation || '').localeCompare(b.origLocation || '');
      } else if (col === 'dateDeleted') {
        // In screenshot, Date Deleted is sorted newest to oldest with upward caret ^
        res = this.parseDate(a.dateDeleted) - this.parseDate(b.dateDeleted);
      } else if (col === 'size') {
        res = (a.sizeBytes || 0) - (b.sizeBytes || 0);
      } else if (col === 'type') {
        res = (a.type || '').localeCompare(b.type || '');
      } else if (col === 'dateModified') {
        res = this.parseDate(a.dateModified) - this.parseDate(b.dateModified);
      }
      // When trashSortAsc is true, Date Deleted displays descending (Oct 04 down to Sept 28) matching screenshot
      return state.trashSortAsc ? -res : res;
    });

    // Update status bar
    const statusLeft = document.getElementById(`exp-status-left-${winId}`);
    const statusRight = document.getElementById(`exp-status-right-${winId}`);
    if (statusLeft) statusLeft.textContent = `${items.length} items`;
    if (statusRight) statusRight.textContent = items.length > 0 ? '1 item selected' : '';

    const content = document.getElementById(`exp-content-${winId}`);
    if (!content) return;

    // Render Recycle Bin Details Table matching Screenshot
    content.innerHTML = `
      <div class="exp-details-container">
        <div class="exp-details-inner">
          <div class="exp-details-header">
            <div class="exp-col-header exp-col-name" id="trash-sort-name-${winId}">
              ${state.trashSortCol === 'name' ? this.renderCaret(state.trashSortAsc) : ''}
              <span>Name</span>
            </div>
            <div class="exp-col-header exp-col-orig-loc" id="trash-sort-origLocation-${winId}">
              ${state.trashSortCol === 'origLocation' ? this.renderCaret(state.trashSortAsc) : ''}
              <span>Original Location</span>
            </div>
            <div class="exp-col-header exp-col-date-deleted" id="trash-sort-dateDeleted-${winId}">
              ${state.trashSortCol === 'dateDeleted' ? this.renderCaret(state.trashSortAsc) : ''}
              <span>Date Deleted</span>
            </div>
            <div class="exp-col-header exp-col-size" id="trash-sort-size-${winId}">
              ${state.trashSortCol === 'size' ? this.renderCaret(state.trashSortAsc) : ''}
              <span>Size</span>
            </div>
            <div class="exp-col-header exp-col-item-type" id="trash-sort-type-${winId}">
              ${state.trashSortCol === 'type' ? this.renderCaret(state.trashSortAsc) : ''}
              <span>Item type</span>
            </div>
            <div class="exp-col-header exp-col-date-mod" id="trash-sort-dateModified-${winId}">
              ${state.trashSortCol === 'dateModified' ? this.renderCaret(state.trashSortAsc) : ''}
              <span>Date modified</span>
            </div>
            <div class="exp-col-spacer"></div>
          </div>

          <div class="exp-details-body" id="trash-rows-${winId}">
            ${items.length === 0 ? `
              <div style="padding: 24px; color: #888888; font-size: 12.5px;">Recycle Bin is empty.</div>
            ` : items.map(item => `
              <div class="exp-details-row ${item.name === state.selectedFileName ? 'selected' : ''}" 
                   data-item-name="${item.name}"
                   title="${item.name}&#10;Double-click to open">
                <div class="exp-cell-name">
                  <img src="${item.icon || 'assets/icons/file-doc.svg'}" class="exp-row-icon" alt="${item.name}"/>
                  <span title="${item.name}">${item.displayName || item.name}</span>
                </div>
                <div class="exp-cell-orig-loc" title="${item.origLocation}">${item.origLocation}</div>
                <div class="exp-cell-date-deleted">${item.dateDeleted}</div>
                <div class="exp-cell-size">${item.size}</div>
                <div class="exp-cell-item-type" title="${item.type}">${item.type}</div>
                <div class="exp-cell-date-mod">${item.dateModified}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Row selection & double-click
    const rows = content.querySelectorAll('.exp-details-row');
    rows.forEach(row => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        rows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        state.selectedFileName = row.dataset.itemName;
        if (statusRight) statusRight.textContent = '1 item selected';
      });

      row.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const itemName = row.dataset.itemName;
        const item = items.find(it => it.name === itemName);
        if (!item) return;

        if (item.action === 'notepad' || item.type === 'Text Document' || item.name.endsWith('.txt') || item.name.endsWith('.log')) {
          if (window.WindowManager) {
            window.WindowManager.open('notepad', {
              title: `${item.name} - Notepad`,
              filename: item.name,
              content: item.content || item.note || ''
            });
          }
        } else if (item.action === 'document' || item.name.endsWith('.docx') || item.name.endsWith('.pdf') || item.name.endsWith('.pptx')) {
          if (window.WindowManager) {
            window.WindowManager.open('notepad', {
              title: `${item.name} - Document Viewer`,
              filename: item.name,
              content: item.content || `[${item.type}]\nFilename: ${item.name}\nOriginal Location: ${item.origLocation}\nDate Deleted: ${item.dateDeleted}\nSize: ${item.size}`
            });
          }
        } else if (item.action === 'image' || item.name.endsWith('.png') || item.name.endsWith('.jpg')) {
          if (window.Notifications) {
            window.Notifications.show({
              title: item.name,
              message: item.note || `Image file (${item.size}) deleted from ${item.origLocation}`,
              icon: '🖼️',
              duration: 3000
            });
          }
        }
      });
    });

    // Column sorting clicks
    ['name', 'origLocation', 'dateDeleted', 'size', 'type', 'dateModified'].forEach(col => {
      const header = document.getElementById(`trash-sort-${col}-${winId}`);
      if (header) {
        header.addEventListener('click', () => {
          if (state.trashSortCol === col) {
            state.trashSortAsc = !state.trashSortAsc;
          } else {
            state.trashSortCol = col;
            state.trashSortAsc = true;
          }
          this.openRecycleBin(winId, false);
        });
      }
    });
  },

  // Open file in Visual Studio Code
  openFileInWindow(project, file, pathArray = []) {
    if (file.type === 'Internet Shortcut' || file.name.endsWith('.url')) {
      const url = file.actionUrl || project.demoUrl || project.vercelUrl;
      if (window.WindowManager) {
        window.WindowManager.open('edge', { url, title: `${project.title || project.name} - Live` });
      }
      return;
    }

    const fullFilePath = pathArray.length > 0 ? `${pathArray.join('/')}/${file.name}` : file.name;

    if (window.WindowManager) {
      window.WindowManager.open('vscode', {
        projectId: project.id,
        project: project,
        filename: file.name,
        filepath: fullFilePath,
        title: `${file.name} - ${project.name || project.id} - Visual Studio Code`,
        icon: 'assets/icons/vscode.png',
        filetype: this.detectFileType(file.name),
        filesize: file.size,
        repo: project.repo,
        branch: project.branch,
        demoUrl: project.demoUrl
      });
    }
  },

  // Traverse files tree by subfolder path
  getItemsAtPath(project, pathArray) {
    if (!project) return [];
    let items = project.files || [];
    for (const folderName of pathArray) {
      const folder = items.find(f => f.name === folderName && (f.isFolder || f.type === 'File folder'));
      if (folder && folder.children && folder.children.length > 0) {
        items = folder.children;
      } else {
        items = this.getDefaultSubfolderFiles(folderName, folder ? folder.date : '26-08-2026 04:00 PM');
      }
    }
    return items;
  },

  // Fallback so subfolders are never empty
  getDefaultSubfolderFiles(folderName, folderDate) {
    const d = folderDate || '26-08-2026 04:00 PM';
    if (folderName === '__pycache__') {
      return [
        { name: 'main.cpython-311.pyc', date: d, type: 'Bytecode File', size: '12 KB' },
        { name: 'gesture_engine.cpython-311.pyc', date: d, type: 'Bytecode File', size: '18 KB' },
        { name: 'input_dispatcher.cpython-311.pyc', date: d, type: 'Bytecode File', size: '9 KB' }
      ];
    }
    if (folderName === 'tools') {
      return [
        { name: 'benchmark_fps.py', date: d, type: 'Python.File', size: '4 KB' },
        { name: 'calibrate_camera.py', date: d, type: 'Python.File', size: '5 KB' },
        { name: 'test_latency.py', date: d, type: 'Python.File', size: '3 KB' }
      ];
    }
    if (folderName === 'venv') {
      return [
        { name: 'pyvenv.cfg', date: d, type: 'Configuration Settings', size: '1 KB' },
        { name: 'activate.bat', date: d, type: 'Windows Batch File', size: '2 KB' }
      ];
    }
    if (folderName === 'src') {
      return [
        { name: 'App.jsx', date: d, type: 'JavaScript File', size: '6 KB' },
        { name: 'main.jsx', date: d, type: 'JavaScript File', size: '2 KB' },
        { name: 'index.css', date: d, type: 'Cascading Style Sheet', size: '4 KB' }
      ];
    }
    if (folderName === 'public') {
      return [
        { name: 'favicon.ico', date: d, type: 'Icon', size: '5 KB' },
        { name: 'manifest.json', date: d, type: 'JSON Source File', size: '1 KB' }
      ];
    }
    return [
      { name: 'index.js', date: d, type: 'JavaScript File', size: '2 KB' },
      { name: 'README.md', date: d, type: 'Markdown Document', size: '1 KB' }
    ];
  },

  updateNavButtons(winId) {
    const state = this.getState(winId);
    const backBtn = document.getElementById(`exp-back-${winId}`);
    const fwdBtn = document.getElementById(`exp-fwd-${winId}`);
    const upBtn = document.getElementById(`exp-up-${winId}`);

    if (backBtn) backBtn.disabled = state.historyIdx <= 0;
    if (fwdBtn) fwdBtn.disabled = state.historyIdx >= state.history.length - 1;
    if (upBtn) {
      upBtn.disabled = state.currentView === 'root';
    }
  },

  updateSidebarHighlight(winId, activeId) {
    const sideProjects = document.getElementById(`side-projects-${winId}`);
    if (sideProjects) {
      if (activeId === 'root' || activeId === null) sideProjects.classList.add('active');
      else sideProjects.classList.remove('active');
    }

    const sideRecycle = document.getElementById(`side-recycle-${winId}`);
    if (sideRecycle) {
      if (activeId === 'trash') sideRecycle.classList.add('active');
      else sideRecycle.classList.remove('active');
    }

    this.projects.forEach(p => {
      const link = document.getElementById(`side-repo-${p.id}-${winId}`);
      if (link) {
        if (p.id === activeId) link.classList.add('active');
        else link.classList.remove('active');
      }
    });
  },

  restoreCommandBar(winId) {
    const cmdBar = document.getElementById(`exp-cmd-bar-${winId}`);
    if (!cmdBar || cmdBar.querySelector(`#cmd-launch-preview-${winId}`)) return;

    cmdBar.innerHTML = `
      <button class="exp-cmd-btn" id="cmd-launch-preview-${winId}" title="Launch live preview inside portfolio website">
        <span class="exp-cmd-icon">🌎︎</span>
        <span>Launch preview</span>
      </button>
      <button class="exp-cmd-btn" id="cmd-redirect-website-${winId}" title="Redirect to website in new tab">
        <span class="exp-cmd-icon">↪</span>
        <span>Redirect to website</span>
      </button>
      <button class="exp-cmd-btn" id="cmd-github-repo-${winId}" title="Redirect to GitHub repo">
        <span class="exp-cmd-icon">{ }</span>
        <span>GitHub repo</span>
      </button>
    `;
    this.attachProjectCommandBarEvents(winId);
  },

  attachProjectCommandBarEvents(winId) {
    const cmdLaunchPreview = document.getElementById(`cmd-launch-preview-${winId}`);
    const cmdRedirectWebsite = document.getElementById(`cmd-redirect-website-${winId}`);
    const cmdGithubRepo = document.getElementById(`cmd-github-repo-${winId}`);

    const getActiveProject = () => {
      const state = this.getState(winId);
      if (state.currentProject) return state.currentProject;
      if (state.selectedId && state.selectedId !== 'trash' && state.selectedId !== 'root') {
        return this.projects.find(p => p.id === state.selectedId) || this.projects[0];
      }
      return this.projects[0];
    };

    if (cmdLaunchPreview) {
      cmdLaunchPreview.onclick = () => {
        const proj = getActiveProject();
        const previewUrl = proj.demoUrl || proj.vercelUrl;
        if (previewUrl && window.WindowManager) {
          window.WindowManager.open('edge', {
            url: previewUrl,
            title: `${proj.title || proj.name} - Live Preview`
          });
        } else {
          if (window.Notifications) {
            window.Notifications.show({
              title: proj.title || proj.name,
              message: 'Desktop application. Inspect source code or run.bat script in VS Code.',
              icon: '💻',
              duration: 3000
            });
          }
        }
      };
    }

    if (cmdRedirectWebsite) {
      cmdRedirectWebsite.onclick = () => {
        const proj = getActiveProject();
        const webUrl = proj.vercelUrl || (proj.demoUrl && proj.demoUrl.startsWith('http') ? proj.demoUrl : null);
        if (webUrl) {
          window.open(webUrl, '_blank');
        } else if (proj.repoUrl) {
          if (window.Notifications) {
            window.Notifications.show({
              title: proj.title || proj.name,
              message: 'Redirecting to project repository on GitHub...',
              icon: '🐙',
              duration: 2500
            });
          }
          window.open(proj.repoUrl, '_blank');
        }
      };
    }

    if (cmdGithubRepo) {
      cmdGithubRepo.onclick = () => {
        const proj = getActiveProject();
        const targetUrl = proj.repoUrl || 'https://github.com/harsh-pr';
        window.open(targetUrl, '_blank');
      };
    }
  },

  getFileIcon(file) {
    if (file.isFolder || file.type === 'File folder') return 'assets/icons/folder.png';
    const name = file.name.toLowerCase();
    if (name.endsWith('.py')) return 'assets/icons/file-python.svg';
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'assets/icons/file-js.svg';
    if (name.endsWith('.json')) return 'assets/icons/file-json.svg';
    if (name.endsWith('.md')) return 'assets/icons/file-md.svg';
    if (name.endsWith('.bat')) return 'assets/icons/file-bat.svg';
    if (name.endsWith('.url')) return 'assets/icons/file-url.svg';
    if (name.endsWith('.png') || name.endsWith('.jpg')) return 'assets/icons/file-img.svg';
    if (name.endsWith('.pdf')) return 'assets/icons/file-pdf.svg';
    if (name.endsWith('.pptx')) return 'assets/icons/file-pptx.svg';
    if (name.endsWith('.docx')) return 'assets/icons/file-docx.svg';
    return 'assets/icons/file-doc.svg';
  },

  detectFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'py') return 'python';
    if (ext === 'js' || ext === 'jsx') return 'javascript';
    if (ext === 'json') return 'json';
    if (ext === 'md') return 'markdown';
    if (ext === 'bat') return 'bat';
    if (ext === 'html') return 'html';
    return 'txt';
  },

  attachEvents(winId) {
    const backBtn = document.getElementById(`exp-back-${winId}`);
    const fwdBtn = document.getElementById(`exp-fwd-${winId}`);
    const upBtn = document.getElementById(`exp-up-${winId}`);
    const searchInput = document.getElementById(`exp-search-input-${winId}`);

    this.attachProjectCommandBarEvents(winId);

    // Up button: navigates up one level
    if (upBtn) {
      upBtn.addEventListener('click', () => {
        const state = this.getState(winId);
        if (state.currentView === 'project') {
          if (state.currentPath.length > 0) {
            this.openDirectory(winId, state.currentProject, state.currentPath.slice(0, -1));
          } else {
            this.renderRoot(winId);
          }
        } else if (state.currentView === 'trash') {
          this.renderRoot(winId);
        }
      });
    }

    // Back button: history back
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        const state = this.getState(winId);
        if (state.historyIdx > 0) {
          state.historyIdx--;
          const target = state.history[state.historyIdx];
          if (target.view === 'root') {
            this.renderRoot(winId, false);
          } else if (target.view === 'trash') {
            this.openRecycleBin(winId, false);
          } else {
            const proj = this.projects.find(p => p.id === target.projectId);
            if (proj) this.openDirectory(winId, proj, target.path, false);
          }
        }
      });
    }

    // Forward button: history forward
    if (fwdBtn) {
      fwdBtn.addEventListener('click', () => {
        const state = this.getState(winId);
        if (state.historyIdx < state.history.length - 1) {
          state.historyIdx++;
          const target = state.history[state.historyIdx];
          if (target.view === 'root') {
            this.renderRoot(winId, false);
          } else if (target.view === 'trash') {
            this.openRecycleBin(winId, false);
          } else {
            const proj = this.projects.find(p => p.id === target.projectId);
            if (proj) this.openDirectory(winId, proj, target.path, false);
          }
        }
      });
    }

    // Sidebar repository links
    const sidebar = document.querySelector(`#exp-content-${winId}`)?.closest('.exp-main')?.querySelector('.exp-sidebar');
    if (sidebar) {
      sidebar.querySelectorAll('.side-repo-link').forEach(link => {
        link.addEventListener('click', () => {
          this.openProject(winId, link.dataset.projId);
        });
      });
    }

    // Sidebar projects link
    const sideProjects = document.getElementById(`side-projects-${winId}`);
    if (sideProjects) {
      sideProjects.addEventListener('click', () => this.renderRoot(winId));
    }

    // Sidebar desktop link
    const sideDesktop = document.getElementById(`side-desktop-${winId}`);
    if (sideDesktop) {
      sideDesktop.addEventListener('click', () => this.renderRoot(winId));
    }

    // Sidebar resume link
    const sideResume = document.getElementById(`side-resume-${winId}`);
    if (sideResume) {
      sideResume.addEventListener('click', () => {
        if (window.WindowManager) window.WindowManager.open('notepad');
      });
    }

    // Sidebar Recycle Bin link
    const sideRecycle = document.getElementById(`side-recycle-${winId}`);
    if (sideRecycle) {
      sideRecycle.addEventListener('click', () => this.openRecycleBin(winId));
    }

    // Search filter across views
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const state = this.getState(winId);
        if (state.currentView === 'root') {
          const folderItems = document.querySelectorAll(`#folder-grid-${winId} .win11-folder-item`);
          folderItems.forEach(item => {
            const name = item.querySelector('.win11-folder-name')?.textContent.toLowerCase() || '';
            item.style.display = (!q || name.includes(q)) ? 'flex' : 'none';
          });
        } else if (state.currentView === 'trash') {
          const fileRows = document.querySelectorAll(`#trash-rows-${winId} .exp-details-row`);
          fileRows.forEach(row => {
            const name = (row.dataset.itemName || '').toLowerCase();
            row.style.display = (!q || name.includes(q)) ? 'flex' : 'none';
          });
        } else if (state.currentView === 'project') {
          const fileRows = document.querySelectorAll(`#details-rows-${winId} .exp-details-row`);
          fileRows.forEach(row => {
            const name = (row.dataset.fileName || '').toLowerCase();
            row.style.display = (!q || name.includes(q)) ? 'flex' : 'none';
          });
        }
      });
    }
  },

  setupExplorerMarquee(winId) {
    const container = document.querySelector(`#content-${winId} .exp-details-container`) || 
                      document.querySelector(`#content-${winId} .win11-folder-grid`);
    if (!container) return;

    let selectionBox = container.querySelector('.explorer-selection-box');
    if (!selectionBox) {
      selectionBox = document.createElement('div');
      selectionBox.className = 'explorer-selection-box';
      container.style.position = 'relative';
      container.appendChild(selectionBox);
    }

    let isSelecting = false;
    let startX = 0;
    let startY = 0;

    container.onmousedown = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('.exp-details-header') || e.target.closest('.exp-command-bar') || e.target.closest('.exp-breadcrumb-bar')) {
        return;
      }

      const rect = container.getBoundingClientRect();
      startX = e.clientX - rect.left + container.scrollLeft;
      startY = e.clientY - rect.top + container.scrollTop;

      const clickedRow = e.target.closest('.exp-details-row, .win11-folder-item');
      let dragStarted = false;

      const onMouseMove = (moveEvt) => {
        const curX = moveEvt.clientX - rect.left + container.scrollLeft;
        const curY = moveEvt.clientY - rect.top + container.scrollTop;
        const diffX = Math.abs(curX - startX);
        const diffY = Math.abs(curY - startY);

        if (!dragStarted && (diffX > 4 || diffY > 4)) {
          dragStarted = true;
          isSelecting = true;
          selectionBox.style.display = 'block';

          if (!moveEvt.ctrlKey && !clickedRow) {
            container.querySelectorAll('.exp-details-row, .win11-folder-item').forEach(el => el.classList.remove('selected'));
          }
        }

        if (!isSelecting) return;

        const left = Math.min(startX, curX);
        const top = Math.min(startY, curY);
        const width = Math.abs(curX - startX);
        const height = Math.abs(curY - startY);

        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';

        const boxRect = { left, top, right: left + width, bottom: top + height };
        const items = container.querySelectorAll('.exp-details-row, .win11-folder-item');
        let selectedCount = 0;

        items.forEach(item => {
          const itemLeft = item.offsetLeft;
          const itemTop = item.offsetTop;
          const itemRight = itemLeft + item.offsetWidth;
          const itemBottom = itemTop + item.offsetHeight;

          const overlaps = !(
            boxRect.right < itemLeft ||
            boxRect.left > itemRight ||
            boxRect.bottom < itemTop ||
            boxRect.top > itemBottom
          );

          if (overlaps) {
            item.classList.add('selected');
          } else if (!moveEvt.ctrlKey) {
            item.classList.remove('selected');
          }

          if (item.classList.contains('selected')) {
            selectedCount++;
          }
        });

        const statusRight = document.getElementById(`exp-status-right-${winId}`);
        if (statusRight) {
          statusRight.textContent = selectedCount > 0 ? `${selectedCount} item${selectedCount > 1 ? 's' : ''} selected` : '';
        }
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        if (isSelecting) {
          isSelecting = false;
          selectionBox.style.display = 'none';
        } else if (!clickedRow) {
          container.querySelectorAll('.exp-details-row, .win11-folder-item').forEach(el => el.classList.remove('selected'));
          const statusRight = document.getElementById(`exp-status-right-${winId}`);
          if (statusRight) statusRight.textContent = '';
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };
  },

  setupExplorerContextMenu(winId) {
    const content = document.getElementById(`content-${winId}`);
    if (!content) return;

    let ctxMenu = document.getElementById(`exp-ctx-menu-${winId}`);
    if (!ctxMenu) {
      ctxMenu = document.createElement('div');
      ctxMenu.id = `exp-ctx-menu-${winId}`;
      ctxMenu.className = 'exp-context-menu';
      ctxMenu.style.display = 'none';
      document.body.appendChild(ctxMenu);

      window.addEventListener('click', () => {
        if (ctxMenu) ctxMenu.style.display = 'none';
      });
      window.addEventListener('contextmenu', (e) => {
        if (!e.target.closest(`#content-${winId}`)) {
          if (ctxMenu) ctxMenu.style.display = 'none';
        }
      });
    }

    content.addEventListener('contextmenu', (e) => {
      // If clicking inside inputs or breadcrumb buttons, allow default
      if (e.target.closest('input') || e.target.closest('.exp-nav-btns')) return;

      e.preventDefault();
      e.stopPropagation();

      const state = this.getState(winId);
      const clickedRow = e.target.closest('.exp-details-row');
      const clickedCard = e.target.closest('.win11-folder-item');

      let menuItems = [];

      if (clickedRow) {
        const fileName = clickedRow.dataset.fileName || clickedRow.dataset.itemName;
        content.querySelectorAll('.exp-details-row').forEach(r => r.classList.remove('selected'));
        clickedRow.classList.add('selected');
        if (state) state.selectedFileName = fileName;

        menuItems = [
          { icon: '📂', text: 'Open', action: () => { clickedRow.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); } },
          { icon: '💻', text: 'Open in VS Code', action: () => { clickedRow.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); } },
          { divider: true },
          { icon: '📋', text: 'Copy file name', action: () => {
              navigator.clipboard?.writeText(fileName);
              if (window.Notifications) window.Notifications.show({ title: 'Copied to Clipboard', message: fileName, icon: '📋', duration: 1800 });
            }
          },
          { icon: 'ℹ️', text: 'Properties', action: () => {
              const sz = clickedRow.querySelector('.exp-cell-size')?.textContent || 'File';
              const dt = clickedRow.querySelector('.exp-cell-date')?.textContent || '';
              if (window.Notifications) window.Notifications.show({ title: 'File Properties', message: `${fileName} (${sz}) • ${dt}`, icon: 'ℹ️', duration: 3200 });
            }
          }
        ];
      } else if (clickedCard) {
        const projId = clickedCard.dataset.project;
        content.querySelectorAll('.win11-folder-item').forEach(c => c.classList.remove('selected'));
        clickedCard.classList.add('selected');

        menuItems = [
          { icon: '📂', text: 'Open Project', action: () => { this.openDirectory(winId, projId, []); } },
          { icon: '🌐', text: 'Launch live preview', action: () => { this.launchPreview(projId); } },
          { icon: '🔗', text: 'Open GitHub Repo', action: () => {
              const url = this.getGitHubRepoUrl(projId);
              if (url) window.open(url, '_blank');
            }
          },
          { divider: true },
          { icon: '📋', text: 'Copy Project Name', action: () => {
              navigator.clipboard?.writeText(projId);
              if (window.Notifications) window.Notifications.show({ title: 'Copied', message: projId, icon: '📋', duration: 1800 });
            }
          },
          { icon: 'ℹ️', text: 'Project Properties', action: () => {
              if (window.Notifications) window.Notifications.show({ title: 'Project Details', message: `Repository: ${projId}`, icon: '📁', duration: 3000 });
            }
          }
        ];
      } else {
        // Empty background in Explorer
        menuItems = [
          { icon: '🔄', text: 'Refresh', action: () => {
              if (state.currentView === 'root') this.renderRoot(winId, false);
              else if (state.currentView === 'trash') this.openRecycleBin(winId, false);
              else this.openDirectory(winId, state.currentProject, state.currentPath, false);
            }
          },
          { divider: true },
          { icon: '💻', text: 'Open Developer Terminal', action: () => {
              if (window.WindowManager) window.WindowManager.open('terminal');
            }
          },
          { icon: 'ℹ️', text: 'Folder Properties', action: () => {
              const name = state.currentProject || (state.currentView === 'trash' ? 'Recycle Bin' : 'Projects');
              if (window.Notifications) window.Notifications.show({ title: 'Folder Properties', message: `Current Directory: ${name}`, icon: '📁', duration: 2500 });
            }
          }
        ];
      }

      ctxMenu.innerHTML = menuItems.map((item, idx) => {
        if (item.divider) return '<div class="exp-ctx-divider"></div>';
        return `
          <div class="exp-ctx-item" data-action-idx="${idx}">
            <span class="exp-ctx-icon">${item.icon}</span>
            <span class="exp-ctx-text">${item.text}</span>
          </div>
        `;
      }).join('');

      ctxMenu.querySelectorAll('.exp-ctx-item').forEach(el => {
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const idx = Number(el.dataset.actionIdx);
          ctxMenu.style.display = 'none';
          if (menuItems[idx]?.action) menuItems[idx].action();
        });
      });

      let x = e.clientX;
      let y = e.clientY;
      const menuW = 210;
      const menuH = 170;

      if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 10;
      if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 10;

      ctxMenu.style.left = `${x}px`;
      ctxMenu.style.top = `${y}px`;
      ctxMenu.style.display = 'flex';
    });
  }
};

window.ExplorerApp = ExplorerApp;
