/**
 * Windows 11 Toast Notification System
 */
const Notifications = {
  container: null,
  panelBody: null,
  history: [],

  init() {
    this.container = document.getElementById('notification-container');
    this.panelBody = document.getElementById('notif-panel-body');
    this.setupPanelEvents();
    this.renderPanel();
  },

  setupPanelEvents() {
    const clearBtn = document.getElementById('notif-clear-all');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearAll();
      });
    }
  },

  show({ title, message, icon = '🔔', appName = 'System', duration = 4500, onClick = null, saveToPanel = true }) {
    // 1. Save to Notification Center Panel
    if (saveToPanel) {
      const now = new Date();
      this.history.unshift({
        id: Date.now() + Math.random(),
        title,
        message,
        icon,
        appName,
        timeStr: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      });
      this.renderPanel();
    }

    // 2. Render Desktop Floating Toast
    if (!this.container) this.container = document.getElementById('notification-container');
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = 'win-toast';

    toast.innerHTML = `
      <div class="toast-header">
        <div class="toast-app-info">
          <span>${icon}</span>
          <span>${appName}</span>
        </div>
        <button class="toast-close-btn" title="Close">✕</button>
      </div>
      <div class="toast-body">
        <div class="toast-text">
          <div class="toast-title">${title}</div>
          <div class="toast-message">${message}</div>
        </div>
      </div>
      <div class="toast-progress"></div>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    const progressBar = toast.querySelector('.toast-progress');

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      toast.classList.add('toast-closing');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    };

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });

    if (onClick) {
      toast.style.cursor = 'pointer';
      toast.addEventListener('click', () => {
        onClick();
        dismiss();
      });
    }

    this.container.appendChild(toast);

    // Progress bar animation
    if (progressBar) {
      progressBar.style.transition = `width ${duration}ms linear`;
      requestAnimationFrame(() => {
        progressBar.style.width = '0%';
      });
    }

    setTimeout(() => {
      dismiss();
    }, duration);
  },

  renderPanel() {
    if (!this.panelBody) this.panelBody = document.getElementById('notif-panel-body');
    if (!this.panelBody) return;
    const clearBtn = document.getElementById('notif-clear-all');

    if (this.history.length === 0) {
      this.panelBody.innerHTML = `<span class="notif-empty-text">No new notifications</span>`;
      if (clearBtn) clearBtn.style.display = 'none';
      return;
    }

    if (clearBtn) clearBtn.style.display = 'inline-block';
    this.panelBody.innerHTML = this.history.map(n => `
      <div class="notif-center-item" data-id="${n.id}">
        <div class="notif-item-header">
          <div class="notif-item-app">
            <span class="notif-item-icon">${n.icon}</span>
            <span class="notif-item-appname">${n.appName}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="notif-item-time">${n.timeStr}</span>
            <button class="notif-item-dismiss" data-id="${n.id}" title="Dismiss notification">✕</button>
          </div>
        </div>
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-msg">${n.message}</div>
      </div>
    `).join('');

    // Attach individual dismiss listeners with swipe right animation
    this.panelBody.querySelectorAll('.notif-item-dismiss').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        const card = btn.closest('.notif-center-item');
        if (card) {
          card.classList.add('dismissing');
          setTimeout(() => {
            this.history = this.history.filter(item => item.id !== id);
            this.renderPanel();
          }, 290);
        } else {
          this.history = this.history.filter(item => item.id !== id);
          this.renderPanel();
        }
      });
    });
  },

  clearAll() {
    if (!this.panelBody) this.panelBody = document.getElementById('notif-panel-body');
    if (!this.panelBody) return;
    const cards = Array.from(this.panelBody.querySelectorAll('.notif-center-item'));
    if (cards.length > 0) {
      cards.forEach((card, idx) => {
        setTimeout(() => {
          card.classList.add('dismissing');
        }, idx * 50);
      });
      setTimeout(() => {
        this.history = [];
        this.renderPanel();
      }, 300 + (cards.length - 1) * 50);
    } else {
      this.history = [];
      this.renderPanel();
    }
  }
};

window.Notifications = Notifications;
