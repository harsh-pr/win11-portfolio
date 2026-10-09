/**
 * Windows 11 Desktop Controller
 * Desktop icons, dragging & repositioning, marquee selection box, and right-click context menu
 */
const Desktop = {
  icons: [],
  selectedIcon: null,
  contextMenu: null,
  selectionBox: null,
  justDraggedIcon: false,
  justFinishedMarquee: false,
  currentWallpaperIndex: 0,
  wallpapers: [
    'assets/wallpaper.jpg',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1920&q=80'
  ],

  init() {
    this.contextMenu = document.getElementById('context-menu');
    this.selectionBox = document.getElementById('selection-box');
    this.setupIcons();
    this.setupContextMenu();
    this.setupMarquee();

    window.addEventListener('resize', () => {
      this.layoutIcons();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F5') {
        e.preventDefault();
        this.refreshDesktop();
      }
      if (e.key === 'Enter' && this.selectedIcon) {
        const appId = this.selectedIcon.dataset.app;
        if (appId && window.WindowManager) {
          window.WindowManager.open(appId, {
            url: this.selectedIcon.dataset.url,
            title: this.selectedIcon.querySelector('span')?.textContent
          });
        }
      }
    });
  },

  layoutIcons() {
    const colWidth = 88;
    const rowHeight = 90;
    const startX = 12;
    const startY = 12;
    const taskbarH = 48;
    const maxRows = Math.max(1, Math.floor((window.innerHeight - taskbarH - 24) / rowHeight));

    this.icons.forEach((icon, i) => {
      if (!icon.dataset.userPlaced) {
        const col = Math.floor(i / maxRows);
        const row = i % maxRows;
        icon.style.left = `${startX + col * colWidth}px`;
        icon.style.top = `${startY + row * rowHeight}px`;
      }
    });
  },

  setupIcons() {
    this.icons = Array.from(document.querySelectorAll('.desktop-icon'));
    this.layoutIcons();

    this.icons.forEach(icon => {
      this.setupIconDragging(icon);

      // Single click: select
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.justDraggedIcon) return;
        this.selectIcon(icon);
      });

      // Double click: open app
      icon.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (this.justDraggedIcon) return;
        const appId = icon.dataset.app;
        if (appId && window.WindowManager) {
          window.WindowManager.open(appId, {
            url: icon.dataset.url,
            title: icon.querySelector('span')?.textContent
          });
        }
      });
    });

    // Deselect on desktop click (only if it wasn't a drag or marquee)
    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.addEventListener('click', (e) => {
        if (this.justFinishedMarquee || this.justDraggedIcon) {
          return;
        }
        if (!e.target.closest('.desktop-icon') && !e.target.closest('#context-menu')) {
          this.deselectAll();
          this.hideContextMenu();
        }
      });
    }
  },

  setupIconDragging(icon) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    icon.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only left-click
      e.stopPropagation();

      startX = e.clientX;
      startY = e.clientY;
      initialLeft = parseInt(icon.style.left, 10) || icon.offsetLeft;
      initialTop = parseInt(icon.style.top, 10) || icon.offsetTop;
      isDragging = false;

      const onMouseMove = (moveEvt) => {
        const dx = moveEvt.clientX - startX;
        const dy = moveEvt.clientY - startY;

        if (!isDragging && Math.hypot(dx, dy) > 5) {
          isDragging = true;
          icon.classList.add('dragging');
          icon.style.zIndex = '1000';
          this.selectIcon(icon);
        }

        if (isDragging) {
          icon.style.left = `${initialLeft + dx}px`;
          icon.style.top = `${initialTop + dy}px`;
        }
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        if (isDragging) {
          isDragging = false;
          icon.classList.remove('dragging');
          icon.style.zIndex = '25';
          icon.dataset.userPlaced = 'true';

          this.justDraggedIcon = true;
          setTimeout(() => {
            this.justDraggedIcon = false;
          }, 150);

          // Grid snap & boundary clamping
          const colWidth = 88;
          const rowHeight = 90;
          const startX = 12;
          const startY = 12;
          const taskbarH = 48;

          const currentLeft = parseInt(icon.style.left, 10) || initialLeft;
          const currentTop = parseInt(icon.style.top, 10) || initialTop;

          const maxLeft = Math.max(startX, window.innerWidth - 88);
          const maxTop = Math.max(startY, window.innerHeight - taskbarH - 96);

          const snappedCol = Math.max(0, Math.round((currentLeft - startX) / colWidth));
          const snappedRow = Math.max(0, Math.round((currentTop - startY) / rowHeight));

          const finalLeft = Math.min(maxLeft, startX + snappedCol * colWidth);
          const finalTop = Math.min(maxTop, startY + snappedRow * rowHeight);

          icon.style.left = `${finalLeft}px`;
          icon.style.top = `${finalTop}px`;
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  },

  selectIcon(icon) {
    this.deselectAll();
    this.selectedIcon = icon;
    icon.classList.add('selected');
  },

  deselectAll() {
    this.icons.forEach(i => i.classList.remove('selected'));
    this.selectedIcon = null;
  },

  setupContextMenu() {
    const desktop = document.getElementById('desktop');
    if (!desktop || !this.contextMenu) return;

    desktop.addEventListener('contextmenu', (e) => {
      // If right clicked on taskbar or window chrome, don't show desktop context menu
      if (e.target.closest('#taskbar') || e.target.closest('.win-window')) return;
      e.preventDefault();

      let x = e.clientX;
      let y = e.clientY;

      const menuW = 230;
      const menuH = 260;

      if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 10;
      if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 10;

      this.contextMenu.style.left = x + 'px';
      this.contextMenu.style.top = y + 'px';
      this.contextMenu.style.display = 'block';
    });

    // Context menu actions
    this.contextMenu.querySelectorAll('li[data-action]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        this.hideContextMenu();
        this.handleContextAction(action);
      });
    });

    window.addEventListener('click', () => this.hideContextMenu());
  },

  hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.style.display = 'none';
    }
  },

  handleContextAction(action) {
    if (action === 'refresh') {
      this.refreshDesktop();
    } else if (action === 'wallpaper') {
      this.changeWallpaper();
    } else if (action === 'terminal') {
      if (window.WindowManager) window.WindowManager.open('terminal');
    } else if (action === 'projects') {
      if (window.WindowManager) window.WindowManager.open('explorer');
    } else if (action === 'about') {
      if (window.WindowManager) {
        window.WindowManager.open('settings');
      }
    }
  },

  refreshDesktop() {
    this.icons.forEach((icon, i) => {
      icon.style.animation = 'none';
      void icon.offsetHeight; // trigger reflow
      icon.style.animation = `iconAppear 0.35s cubic-bezier(0.34, 1.4, 0.64, 1) ${i * 0.06}s both`;
    });
    if (window.Notifications) {
      window.Notifications.show({
        title: 'Desktop Refreshed',
        message: 'System icons and cache re-rendered.',
        icon: '🔄',
        duration: 2000
      });
    }
  },

  changeWallpaper() {
    this.currentWallpaperIndex = (this.currentWallpaperIndex + 1) % this.wallpapers.length;
    const nextWallpaper = this.wallpapers[this.currentWallpaperIndex];
    document.documentElement.style.setProperty('--wallpaper', `url('${nextWallpaper}')`);

    if (window.Notifications) {
      window.Notifications.show({
        title: 'Personalization Updated',
        message: `Wallpaper changed to Theme ${this.currentWallpaperIndex + 1} of ${this.wallpapers.length}.`,
        icon: '🖼️',
        duration: 2500
      });
    }
  },

  setupMarquee() {
    const desktop = document.getElementById('desktop');
    if (!desktop || !this.selectionBox) return;

    let isSelecting = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;

    desktop.addEventListener('mousedown', (e) => {
      if (e.target.closest('.desktop-icon') || e.target.closest('.win-window') || e.target.closest('#taskbar') || e.target.closest('#context-menu')) return;
      if (e.button !== 0) return; // Only left click

      isSelecting = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;

      this.selectionBox.style.left = startX + 'px';
      this.selectionBox.style.top = startY + 'px';
      this.selectionBox.style.width = '0px';
      this.selectionBox.style.height = '0px';
      this.selectionBox.style.display = 'block';

      this.deselectAll();

      const onMouseMove = (moveEvt) => {
        if (!isSelecting) return;
        const currentX = moveEvt.clientX;
        const currentY = moveEvt.clientY;

        const dx = currentX - startX;
        const dy = currentY - startY;
        if (Math.hypot(dx, dy) > 4) {
          hasMoved = true;
        }

        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        this.selectionBox.style.left = left + 'px';
        this.selectionBox.style.top = top + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';

        // Check icon collision with selection box
        const boxRect = { left, top, right: left + width, bottom: top + height };
        this.icons.forEach(icon => {
          const iconRect = icon.getBoundingClientRect();
          const overlaps = !(
            boxRect.right < iconRect.left ||
            boxRect.left > iconRect.right ||
            boxRect.bottom < iconRect.top ||
            boxRect.top > iconRect.bottom
          );
          icon.classList.toggle('selected', overlaps);
        });
      };

      const onMouseUp = () => {
        if (!isSelecting) return;
        isSelecting = false;
        this.selectionBox.style.display = 'none';

        if (hasMoved) {
          this.justFinishedMarquee = true;
          setTimeout(() => {
            this.justFinishedMarquee = false;
          }, 150);
        }

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }
};

window.Desktop = Desktop;
