const WIN_ICONS = {
  MINIMIZE: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M0 5.5H10" stroke="currentColor" stroke-width="1"/></svg>`,
  MAXIMIZE: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" stroke-width="1"/></svg>`,
  RESTORE: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5V0.5H9.5V7.5H7.5" stroke="currentColor" stroke-width="1"/><rect x="0.5" y="2.5" width="7" height="7" stroke="currentColor" stroke-width="1"/></svg>`,
  CLOSE: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M0.5 0.5L9.5 9.5M9.5 0.5L0.5 9.5" stroke="currentColor" stroke-width="1"/></svg>`
};

/**
 * Windows 11 Window Manager Engine
 * Complete implementation of Drag, Resize, Snap, Maximize, Minimize, Z-Index, and Focus
 */
const WindowManager = {
  windows: {},          // id -> { el, id, app, state, bounds, minBounds }
  focusedId: null,
  zCounter: 200,
  layerEl: null,
  ghostEl: null,

  init() {
    this.layerEl = document.getElementById('windows-layer');
    this.ghostEl = document.getElementById('snap-ghost');

    // Global click listener to unfocus or manage window clicks
    window.addEventListener('mousedown', (e) => {
      const winEl = e.target.closest('.win-window');
      if (winEl && winEl.dataset.winId) {
        this.focus(winEl.dataset.winId);
      }
    });
  },

  /**
   * Open or focus a window
   */
  open(appId, options = {}) {
    if (appId === 'code-viewer') {
      const filename = options.filename || 'SourceFile';
      const existingId = Object.keys(this.windows).find(id => {
        return this.windows[id].app === 'code-viewer' && this.windows[id].filename === filename;
      });

      if (existingId) {
        const win = this.windows[existingId];
        if (win.state === 'minimized') {
          this.restore(existingId);
        } else {
          this.focus(existingId);
        }
        return existingId;
      }
    } else {
      const existingId = Object.keys(this.windows).find(id => this.windows[id].app === appId);

      if (existingId) {
        const win = this.windows[existingId];
        if (win.state === 'minimized') {
          this.restore(existingId);
        } else {
          this.focus(existingId);
        }
        if (options.url && appId === 'edge' && window.EdgeApp) {
          window.EdgeApp.navigate(existingId, options.url, options.title);
        }
        if (appId === 'vscode' && window.VSCodeApp && (options.filename || options.filepath || options.projectId)) {
          window.VSCodeApp.openFile(existingId, options);
        }
        if (appId === 'notepad' && options.content !== undefined) {
          const textarea = document.getElementById(`notepad-text-${existingId}`);
          if (textarea) {
            textarea.value = options.content;
            const lines = options.content.split('\n').length;
            const status = document.getElementById(`notepad-lines-${existingId}`);
            if (status) status.textContent = `Lines: ${lines}, Characters: ${options.content.length}`;
          }
          const titleEl = win.el.querySelector('.win-title');
          if (titleEl) titleEl.textContent = options.title || `${options.filename || 'Untitled'} - Notepad`;
        }
        if (appId === 'trash' && window.ExplorerApp) {
          window.ExplorerApp.openRecycleBin(existingId);
        }
        return existingId;
      }
    }

    const id = 'win-' + appId + '-' + Date.now();
    const defaults = this.getAppDefaults(appId, options);

    // Initial position & size
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const taskbarH = 48;

    let width = Math.min(defaults.width, screenW - 40);
    let height = Math.min(defaults.height, screenH - taskbarH - 40);
    let left = Math.max(20, (screenW - width) / 2 + (Object.keys(this.windows).length * 24));
    let top = Math.max(20, (screenH - taskbarH - height) / 2 + (Object.keys(this.windows).length * 20));

    // Create DOM element
    const winEl = document.createElement('div');
    winEl.className = 'win-window';
    winEl.id = id;
    winEl.dataset.winId = id;
    winEl.dataset.app = appId;
    winEl.style.width = width + 'px';
    winEl.style.height = height + 'px';
    winEl.style.left = left + 'px';
    winEl.style.top = top + 'px';
    winEl.style.zIndex = ++this.zCounter;

    winEl.innerHTML = `
      <div class="win-titlebar">
        <div class="win-titlebar-left">
          <img class="win-app-icon" src="${defaults.icon}" alt="${defaults.title}"/>
          <span class="win-title">${options.title || defaults.title}</span>
        </div>
        <div class="win-controls">
          <button class="win-ctrl-btn btn-min" title="Minimize">${WIN_ICONS.MINIMIZE}</button>
          <button class="win-ctrl-btn btn-max" title="Maximize">${WIN_ICONS.MAXIMIZE}</button>
          <button class="win-ctrl-btn btn-close" title="Close">${WIN_ICONS.CLOSE}</button>
        </div>
      </div>
      <div class="win-content" id="content-${id}">
        <!-- App content dynamically injected -->
      </div>
      <!-- 8 Resize Handles -->
      <div class="resize-handle resize-n"  data-dir="n"></div>
      <div class="resize-handle resize-s"  data-dir="s"></div>
      <div class="resize-handle resize-e"  data-dir="e"></div>
      <div class="resize-handle resize-w"  data-dir="w"></div>
      <div class="resize-handle resize-ne" data-dir="ne"></div>
      <div class="resize-handle resize-nw" data-dir="nw"></div>
      <div class="resize-handle resize-se" data-dir="se"></div>
      <div class="resize-handle resize-sw" data-dir="sw"></div>
    `;

    this.layerEl.appendChild(winEl);

    // Save window state
    this.windows[id] = {
      id,
      app: appId,
      el: winEl,
      state: 'normal',   // normal, maximized, snapped-left, snapped-right, minimized
      bounds: { left, top, width, height },
      title: options.title || defaults.title,
      icon: defaults.icon,
      filename: options.filename || ''
    };

    // Attach dragging, resizing, controls
    this.setupInteractions(id);

    // Render App Content
    this.renderAppContent(id, appId, options);

    // Focus window
    this.focus(id);

    // Sync with Taskbar
    if (window.Taskbar) {
      window.Taskbar.onWindowOpen(id, appId, defaults.title, defaults.icon);
    }

    if (window.SoundEffects) {
      window.SoundEffects.playClick();
    }

    return id;
  },

  getAppDefaults(appId, options = {}) {
    const map = {
      explorer: {
        title: 'File Explorer - My Projects',
        icon: 'assets/icons/explorer.png',
        width: 960,
        height: 600
      },
      settings: {
        title: 'About Project',
        icon: 'assets/icons/settings.png',
        width: 920,
        height: 600
      },
      taskmanager: {
        title: 'Task Manager - Skills & Performance',
        icon: 'assets/icons/taskmanager.png',
        width: 760,
        height: 520
      },
      mail: {
        title: 'Outlook Mail - Contact Harsh',
        icon: 'assets/icons/mail.png',
        width: 880,
        height: 580
      },
      edge: {
        title: options.title || 'Microsoft Edge - Project Viewer',
        icon: 'assets/icons/edge.png',
        width: 1040,
        height: 680
      },
      terminal: {
        title: 'Developer Terminal',
        icon: 'assets/icons/terminal.png',
        width: 720,
        height: 460
      },
      notepad: {
        title: 'Notepad - Quick Readme.txt',
        icon: 'assets/icons/notepad.png',
        width: 600,
        height: 440
      },
      'code-viewer': {
        title: options.title || options.filename || 'Code Viewer',
        icon: options.icon || 'assets/icons/file-python.svg',
        width: 820,
        height: 580
      },
      store: {
        title: 'Microsoft Store',
        icon: 'assets/icons/store.png',
        width: 1020,
        height: 640
      },
      vscode: {
        title: options.title || 'Visual Studio Code',
        icon: 'assets/icons/vscode.png',
        width: 1060,
        height: 700
      },
      trash: {
        title: 'Recycle Bin',
        icon: 'assets/icons/trash.png',
        width: 1024,
        height: 600
      }
    };
    return map[appId] || { title: 'Application', icon: 'assets/icons/winlogo.png', width: 680, height: 480 };
  },

  renderAppContent(id, appId, options) {
    const container = document.getElementById(`content-${id}`);
    if (!container) return;

    if (appId === 'explorer' && window.ExplorerApp) {
      window.ExplorerApp.mount(container, id, options);
    } else if (appId === 'trash' && window.ExplorerApp) {
      window.ExplorerApp.mount(container, id, { initialView: 'trash', ...options });
    } else if (appId === 'settings' && window.SettingsApp) {
      window.SettingsApp.mount(container, id);
    } else if (appId === 'taskmanager' && window.TaskManagerApp) {
      window.TaskManagerApp.mount(container, id);
    } else if (appId === 'mail' && window.MailApp) {
      window.MailApp.mount(container, id);
    } else if (appId === 'edge' && window.EdgeApp) {
      window.EdgeApp.mount(container, id, options.url, options.title);
    } else if (appId === 'terminal' && window.TerminalApp) {
      window.TerminalApp.mount(container, id);
    } else if (appId === 'notepad' && window.NotepadApp) {
      window.NotepadApp.mount(container, id, options);
    } else if (appId === 'code-viewer' && window.CodeViewerApp) {
      window.CodeViewerApp.mount(container, id, options);
    } else if (appId === 'vscode' && window.VSCodeApp) {
      window.VSCodeApp.mount(container, id, options);
    } else if (appId === 'store' && window.StoreApp) {
      window.StoreApp.mount(container, id);
    }
  },

  setupInteractions(id) {
    const win = this.windows[id];
    const el = win.el;
    const titlebar = el.querySelector('.win-titlebar');

    // Titlebar buttons
    const minBtn = el.querySelector('.btn-min');
    const maxBtn = el.querySelector('.btn-max');
    const closeBtn = el.querySelector('.btn-close');

    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimize(id);
    });

    maxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMaximize(id);
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close(id);
    });

    // Double click titlebar to toggle maximize
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.win-controls')) return;
      this.toggleMaximize(id);
    });

    // ── Dragging logic with Edge Snapping ───────────────────
    let isMouseDown = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let pendingSnap = null;

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.win-controls')) return;
      this.focus(id);

      isMouseDown = true;
      isDragging = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      initialLeft = el.offsetLeft;
      initialTop = el.offsetTop;

      document.body.style.userSelect = 'none';

      const onMouseMove = (moveEvt) => {
        if (!isMouseDown) return;
        const dx = moveEvt.clientX - dragStartX;
        const dy = moveEvt.clientY - dragStartY;

        // Only start dragging if mouse moved past threshold
        if (!isDragging && Math.hypot(dx, dy) > 8) {
          isDragging = true;

          if (win.state === 'maximized') {
            // Restore from maximized while dragging
            const rect = el.getBoundingClientRect();
            const ratio = (dragStartX - rect.left) / Math.max(1, rect.width);
            this.restore(id, false);
            const newW = win.bounds.width;
            initialLeft = moveEvt.clientX - newW * ratio;
            initialTop = moveEvt.clientY - 16;
            el.style.left = initialLeft + 'px';
            el.style.top = initialTop + 'px';
          }
        }

        if (!isDragging) return;

        let newLeft = initialLeft + (moveEvt.clientX - dragStartX);
        let newTop = initialTop + (moveEvt.clientY - dragStartY);

        // Keep inside top boundary
        if (newTop < 0) newTop = 0;

        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
        win.bounds.left = newLeft;
        win.bounds.top = newTop;

        // Snap detection preview
        const screenW = window.innerWidth;
        const taskbarH = 48;
        const screenH = window.innerHeight - taskbarH;

        if (moveEvt.clientY <= 8) {
          // Top snap: Maximize preview
          pendingSnap = 'maximize';
          this.showGhost(0, 0, screenW, screenH);
        } else if (moveEvt.clientX <= 12) {
          // Left snap preview
          pendingSnap = 'left';
          this.showGhost(0, 0, screenW / 2, screenH);
        } else if (moveEvt.clientX >= screenW - 12) {
          // Right snap preview
          pendingSnap = 'right';
          this.showGhost(screenW / 2, 0, screenW / 2, screenH);
        } else {
          pendingSnap = null;
          this.hideGhost();
        }
      };

      const onMouseUp = () => {
        isMouseDown = false;
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        if (isDragging) {
          isDragging = false;
          this.hideGhost();

          if (pendingSnap === 'maximize') {
            this.maximize(id);
          } else if (pendingSnap === 'left') {
            this.snapLeft(id);
          } else if (pendingSnap === 'right') {
            this.snapRight(id);
          }
          pendingSnap = null;
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    // ── Resizing logic (8 Handles) ─────────────────────────
    const handles = el.querySelectorAll('.resize-handle');
    handles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.focus(id);
        if (win.state === 'maximized') return;

        const dir = handle.dataset.dir;
        const startX = e.clientX;
        const startY = e.clientY;
        const startRect = el.getBoundingClientRect();
        const minW = 420;
        const minH = 280;

        const onResizeMove = (moveEvt) => {
          const dx = moveEvt.clientX - startX;
          const dy = moveEvt.clientY - startY;

          let newW = startRect.width;
          let newH = startRect.height;
          let newL = startRect.left;
          let newT = startRect.top;

          if (dir.includes('e')) {
            newW = Math.max(minW, startRect.width + dx);
          }
          if (dir.includes('s')) {
            newH = Math.max(minH, startRect.height + dy);
          }
          if (dir.includes('w')) {
            const possibleW = startRect.width - dx;
            if (possibleW >= minW) {
              newW = possibleW;
              newL = startRect.left + dx;
            }
          }
          if (dir.includes('n')) {
            const possibleH = startRect.height - dy;
            if (possibleH >= minH) {
              newH = possibleH;
              newT = startRect.top + dy;
            }
          }

          el.style.width = newW + 'px';
          el.style.height = newH + 'px';
          el.style.left = newL + 'px';
          el.style.top = newT + 'px';

          win.bounds = { left: newL, top: newT, width: newW, height: newH };
        };

        const onResizeUp = () => {
          window.removeEventListener('mousemove', onResizeMove);
          window.removeEventListener('mouseup', onResizeUp);
        };

        window.addEventListener('mousemove', onResizeMove);
        window.addEventListener('mouseup', onResizeUp);
      });
    });
  },

  showGhost(left, top, width, height) {
    if (!this.ghostEl) return;
    this.ghostEl.style.display = 'block';
    this.ghostEl.style.left = left + 'px';
    this.ghostEl.style.top = top + 'px';
    this.ghostEl.style.width = width + 'px';
    this.ghostEl.style.height = height + 'px';
  },

  hideGhost() {
    if (this.ghostEl) {
      this.ghostEl.style.display = 'none';
    }
  },

  focus(id) {
    if (!this.windows[id]) return;
    this.focusedId = id;
    const win = this.windows[id];

    // Bring to top z-index
    win.el.style.zIndex = ++this.zCounter;

    // Update focused styling
    Object.values(this.windows).forEach(w => {
      w.el.classList.toggle('focused', w.id === id);
    });

    if (window.Taskbar) {
      window.Taskbar.onWindowFocus(id, win.app);
    }
  },

  minimize(id) {
    const win = this.windows[id];
    if (!win || win.state === 'minimized') return;

    // Remember previous state before minimizing
    win.savedState = win.state;
    win.state = 'minimized';
    win.el.classList.add('win-minimizing');

    setTimeout(() => {
      win.el.style.display = 'none';
      win.el.classList.remove('win-minimizing');
    }, 220);

    // Focus next available window
    const remaining = Object.values(this.windows).filter(w => w.state !== 'minimized' && w.id !== id);
    if (remaining.length > 0) {
      this.focus(remaining[remaining.length - 1].id);
    } else {
      this.focusedId = null;
      if (window.Taskbar) window.Taskbar.clearActive();
    }

    if (window.Taskbar) {
      window.Taskbar.onWindowMinimize(id, win.app);
    }
  },

  restore(id, animate = true) {
    const win = this.windows[id];
    if (!win) return;

    const wasMinimized = win.state === 'minimized';
    const priorState = win.savedState || 'normal';
    win.savedState = null;

    if (wasMinimized && priorState === 'maximized') {
      win.el.style.display = 'flex';
      win.el.classList.add('maximized');
      win.state = 'maximized';
      if (animate) {
        win.el.classList.add('win-restoring');
        setTimeout(() => win.el.classList.remove('win-restoring'), 240);
      }
      const maxBtn = win.el.querySelector('.btn-max');
      if (maxBtn) {
        maxBtn.innerHTML = WIN_ICONS.RESTORE;
        maxBtn.setAttribute('title', 'Restore Down');
      }
      this.focus(id);
      if (window.Taskbar) {
        window.Taskbar.onWindowRestore(id, win.app);
      }
      return;
    }

    win.el.style.display = 'flex';
    win.el.classList.remove('maximized', 'snapped-left', 'snapped-right');

    if (animate) {
      if (wasMinimized) {
        win.el.classList.add('win-restoring');
        setTimeout(() => win.el.classList.remove('win-restoring'), 240);
      } else {
        win.el.classList.add('animating-bounds');
        setTimeout(() => win.el.classList.remove('animating-bounds'), 260);
      }
    }

    win.el.style.left = win.bounds.left + 'px';
    win.el.style.top = win.bounds.top + 'px';
    win.el.style.width = win.bounds.width + 'px';
    win.el.style.height = win.bounds.height + 'px';
    win.state = 'normal';

    const maxBtn = win.el.querySelector('.btn-max');
    if (maxBtn) {
      maxBtn.innerHTML = WIN_ICONS.MAXIMIZE;
      maxBtn.setAttribute('title', 'Maximize');
    }

    this.focus(id);

    if (window.Taskbar) {
      window.Taskbar.onWindowRestore(id, win.app);
    }
  },

  maximize(id) {
    const win = this.windows[id];
    if (!win) return;

    win.el.classList.remove('snapped-left', 'snapped-right');
    win.el.classList.add('animating-bounds');
    win.el.classList.add('maximized');
    win.state = 'maximized';

    setTimeout(() => win.el.classList.remove('animating-bounds'), 260);

    const maxBtn = win.el.querySelector('.btn-max');
    if (maxBtn) {
      maxBtn.innerHTML = WIN_ICONS.RESTORE;
      maxBtn.setAttribute('title', 'Restore Down');
    }

    this.focus(id);
  },

  snapLeft(id) {
    const win = this.windows[id];
    if (!win) return;

    win.el.classList.remove('maximized', 'snapped-right');
    win.el.classList.add('animating-bounds', 'snapped-left');
    win.state = 'snapped-left';

    setTimeout(() => win.el.classList.remove('animating-bounds'), 260);

    const maxBtn = win.el.querySelector('.btn-max');
    if (maxBtn) {
      maxBtn.innerHTML = WIN_ICONS.RESTORE;
      maxBtn.setAttribute('title', 'Restore Down');
    }

    this.focus(id);
  },

  snapRight(id) {
    const win = this.windows[id];
    if (!win) return;

    win.el.classList.remove('maximized', 'snapped-left');
    win.el.classList.add('animating-bounds', 'snapped-right');
    win.state = 'snapped-right';

    setTimeout(() => win.el.classList.remove('animating-bounds'), 260);

    const maxBtn = win.el.querySelector('.btn-max');
    if (maxBtn) {
      maxBtn.innerHTML = WIN_ICONS.RESTORE;
      maxBtn.setAttribute('title', 'Restore Down');
    }

    this.focus(id);
  },

  toggleMaximize(id) {
    const win = this.windows[id];
    if (!win) return;
    if (win.state === 'maximized' || win.state === 'snapped-left' || win.state === 'snapped-right') {
      this.restore(id);
    } else {
      this.maximize(id);
    }
  },

  close(id) {
    const win = this.windows[id];
    if (!win) return;

    win.el.classList.add('win-closing');

    setTimeout(() => {
      if (win.el.parentNode) {
        win.el.parentNode.removeChild(win.el);
      }
      delete this.windows[id];

      if (window.Taskbar) {
        window.Taskbar.onWindowClose(id, win.app);
      }

      // Focus previous window
      const remaining = Object.values(this.windows).filter(w => w.state !== 'minimized');
      if (remaining.length > 0) {
        this.focus(remaining[remaining.length - 1].id);
      } else {
        this.focusedId = null;
      }
    }, 180);
  },

  minimizeAll() {
    Object.keys(this.windows).forEach(id => {
      this.minimize(id);
    });
  }
};

window.WindowManager = WindowManager;
