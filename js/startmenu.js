/**
 * Windows 11 Start Menu Controller
 */
const StartMenu = {
  menuEl: null,
  searchInput: null,
  pinnedGrid: null,
  isOpen: false,

  init() {
    this.menuEl = document.getElementById('start-menu');
    this.searchInput = document.getElementById('sm-search-input');
    this.pinnedGrid = document.querySelector('.sm-pinned-grid');

    this.setupAppClicks();
    this.setupSearch();
    this.setupPowerBtn();

    // Close on outside click
    window.addEventListener('click', (e) => {
      if (this.isOpen && !e.target.closest('#start-menu') && !e.target.closest('#taskbar-start')) {
        this.close();
      }
    });

    // Windows Key toggle
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Meta' || (e.ctrlKey && e.key === 'Escape')) {
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  },

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  open() {
    if (!this.menuEl) return;
    this.isOpen = true;
    this.menuEl.classList.add('open');
    if (this.searchInput) {
      setTimeout(() => this.searchInput.focus(), 150);
    }
    if (window.SoundEffects) window.SoundEffects.playClick();
  },

  close() {
    if (!this.menuEl) return;
    this.isOpen = false;
    this.menuEl.classList.remove('open');
    if (this.searchInput) {
      this.searchInput.value = '';
      this.filterApps('');
    }
  },

  setupAppClicks() {
    // Pinned apps
    document.querySelectorAll('.sm-app-item[data-app]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const appId = item.dataset.app;
        if (appId && window.WindowManager) {
          window.WindowManager.open(appId, {
            url: item.dataset.url,
            title: item.querySelector('span')?.textContent
          });
        }
        this.close();
      });
    });

    // Recommended items
    document.querySelectorAll('.sm-rec-card[data-app]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const appId = item.dataset.app;
        if (appId && window.WindowManager) {
          window.WindowManager.open(appId, {
            url: item.dataset.url,
            title: item.querySelector('.sm-rec-title')?.textContent
          });
        }
        this.close();
      });
    });

    // Profile badge
    const profile = document.querySelector('.sm-user-badge');
    if (profile) {
      profile.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.WindowManager) window.WindowManager.open('settings');
        this.close();
      });
    }
  },

  setupSearch() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      this.filterApps(q);

      if (q === 'hire' || q === 'hire me') {
        if (window.Notifications) {
          window.Notifications.show({
            title: '🎉 Great Decision!',
            message: 'Opening Harsh\'s contact page so you can connect immediately.',
            icon: '💼',
            duration: 3500
          });
          if (window.WindowManager) window.WindowManager.open('mail');
          this.close();
        }
      }
    });
  },

  filterApps(query) {
    document.querySelectorAll('.sm-app-item').forEach(item => {
      const name = item.querySelector('span')?.textContent.toLowerCase() || '';
      item.style.display = (!query || name.includes(query)) ? 'flex' : 'none';
    });

    document.querySelectorAll('.sm-rec-card').forEach(item => {
      const title = item.querySelector('.sm-rec-title')?.textContent.toLowerCase() || '';
      item.style.display = (!query || title.includes(query)) ? 'flex' : 'none';
    });
  },

  setupPowerBtn() {
    const powerBtn = document.querySelector('.sm-power-btn');
    if (!powerBtn) return;

    powerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();

      if (window.Notifications) {
        window.Notifications.show({
          title: 'Power Options',
          message: 'Why turn off when you can hire Harsh? Click to open mail!',
          icon: '⚡',
          duration: 5000,
          onClick: () => {
            if (window.WindowManager) window.WindowManager.open('mail');
          }
        });
      }
    });
  }
};

window.StartMenu = StartMenu;
