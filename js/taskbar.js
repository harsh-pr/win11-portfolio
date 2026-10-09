/**
 * Windows 11 Taskbar Controller
 * Exact 1:1 match to Windows 11 layout with Start button, Search pill, fixed pinned apps, and dynamic active apps.
 */
const Taskbar = {
  taskbarEl: null,
  centerEl: null,
  timeEl: null,
  dateEl: null,
  runningApps: {},      // appId -> { id, winId, el, thumbEl }
  activeFlyout: null,

  init() {
    this.taskbarEl = document.getElementById('taskbar');
    this.centerEl = document.getElementById('taskbar-center');
    this.timeEl = document.getElementById('tray-time-text') || document.getElementById('tray-time');
    this.dateEl = document.getElementById('tray-date-text') || document.getElementById('tray-date');

    this.setupClock();
    this.setupStartButton();
    this.setupSearchBar();
    this.setupPinnedApps();
    this.setupTray();
    this.setupCalendarEngine();
    this.setupQuickSettings();
    this.setupLanguageSwitcher();
    this.setupOverflowFlyout();
    this.setupPeek();
    this.setupGlobalOutsideClick();
  },

  /* ─────────────────────────────────────────────────────────────
     1. Live System Tray Clock & Date (Screenshot 1 & 5)
     ───────────────────────────────────────────────────────────── */
  setupClock() {
    const update = () => {
      const now = new Date();

      // Taskbar live time: formatted matching user's device preferences (12-hour or 24-hour)
      if (this.timeEl) {
        this.timeEl.textContent = now.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit'
        });
      }

      // Taskbar live date: matches user's device locale date format
      if (this.dateEl) {
        this.dateEl.textContent = now.toLocaleDateString();
      }

      // Taskbar tray tooltip
      const clockBtn = document.getElementById('tray-clock-btn');
      if (clockBtn) {
        clockBtn.title = now.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      // Calendar flyout header digital clock
      const calTimeHms = document.getElementById('cal-time-hms');
      const calTimeAmpm = document.getElementById('cal-time-ampm');
      if (calTimeHms) {
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const is12Hour = new Intl.DateTimeFormat([], { hour: 'numeric' }).resolvedOptions().hour12 ?? false;
        if (is12Hour) {
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const hours12 = hours % 12 || 12;
          const hours12Padded = String(hours12).padStart(2, '0');
          calTimeHms.textContent = `${hours12Padded}:${minutes}:${seconds}`;
          if (calTimeAmpm) {
            calTimeAmpm.textContent = ampm;
            calTimeAmpm.style.display = 'inline';
          }
        } else {
          calTimeHms.textContent = `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
          if (calTimeAmpm) {
            calTimeAmpm.textContent = '';
            calTimeAmpm.style.display = 'none';
          }
        }
      }

      // Calendar flyout full date header
      const calDateFull = document.getElementById('cal-date-full');
      if (calDateFull) {
        calDateFull.textContent = now.toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
      }
    };

    update();
    setInterval(update, 1000);
  },

  /* ─────────────────────────────────────────────────────────────
     2. ALL FUNCTIONAL Calendar Engine (Screenshot 5)
     ───────────────────────────────────────────────────────────── */
  calendarState: {
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),
    selectedDate: null,
    isCollapsed: false,
    focusMinutes: 30,
    focusInterval: null,
    focusRemainingSecs: 0
  },

  setupCalendarEngine() {
    const prevBtn = document.getElementById('cal-nav-prev');
    const nextBtn = document.getElementById('cal-nav-next');
    const titleBtn = document.getElementById('cal-nav-month-year');
    const collapseBtn = document.getElementById('cal-toggle-collapse');
    const focusMinus = document.getElementById('focus-step-minus');
    const focusPlus = document.getElementById('focus-step-plus');
    const focusBtn = document.getElementById('focus-launch-btn');

    // Prev month (▲)
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.calendarState.viewMonth--;
        if (this.calendarState.viewMonth < 0) {
          this.calendarState.viewMonth = 11;
          this.calendarState.viewYear--;
        }
        this.renderCalendar();
      });
    }

    // Next month (▼)
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.calendarState.viewMonth++;
        if (this.calendarState.viewMonth > 11) {
          this.calendarState.viewMonth = 0;
          this.calendarState.viewYear++;
        }
        this.renderCalendar();
      });
    }

    // Click Month Year header to jump back to current today's month
    if (titleBtn) {
      titleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const now = new Date();
        this.calendarState.viewYear = now.getFullYear();
        this.calendarState.viewMonth = now.getMonth();
        this.calendarState.selectedDate = null;
        this.renderCalendar();
      });
    }

    // Collapse toggle
    if (collapseBtn) {
      collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const body = document.getElementById('cal-collapsible-body');
        this.calendarState.isCollapsed = !this.calendarState.isCollapsed;
        if (body) {
          body.classList.toggle('collapsed', this.calendarState.isCollapsed);
        }
        collapseBtn.classList.toggle('collapsed', this.calendarState.isCollapsed);
      });
    }

    // Focus session stepper
    if (focusMinus) {
      focusMinus.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.calendarState.focusMinutes > 5) {
          this.calendarState.focusMinutes -= 5;
          this.updateFocusDisplay();
        }
      });
    }

    if (focusPlus) {
      focusPlus.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.calendarState.focusMinutes < 240) {
          this.calendarState.focusMinutes += 5;
          this.updateFocusDisplay();
        }
      });
    }

    if (focusBtn) {
      focusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFocusSession();
      });
    }

    // Initial render
    this.renderCalendar();
  },

  updateFocusDisplay() {
    const disp = document.getElementById('focus-mins-display');
    if (disp) disp.textContent = this.calendarState.focusMinutes;
  },

  toggleFocusSession() {
    const focusBtn = document.getElementById('focus-launch-btn');
    const label = document.getElementById('focus-btn-label');

    if (this.calendarState.focusInterval) {
      // Stop session
      clearInterval(this.calendarState.focusInterval);
      this.calendarState.focusInterval = null;
      if (focusBtn) focusBtn.classList.remove('active');
      if (label) label.textContent = 'Focus';
      this.updateFocusDisplay();
    } else {
      // Start session
      this.calendarState.focusRemainingSecs = this.calendarState.focusMinutes * 60;
      if (focusBtn) focusBtn.classList.add('active');
      if (label) label.textContent = 'Stop';

      this.calendarState.focusInterval = setInterval(() => {
        this.calendarState.focusRemainingSecs--;
        const minsLeft = Math.ceil(this.calendarState.focusRemainingSecs / 60);
        const disp = document.getElementById('focus-mins-display');
        if (disp) disp.textContent = minsLeft;

        if (this.calendarState.focusRemainingSecs <= 0) {
          clearInterval(this.calendarState.focusInterval);
          this.calendarState.focusInterval = null;
          if (focusBtn) focusBtn.classList.remove('active');
          if (label) label.textContent = 'Focus';
          this.updateFocusDisplay();
        }
      }, 1000);
    }
  },

  renderCalendar() {
    const grid = document.getElementById('cal-days-grid');
    const title = document.getElementById('cal-nav-month-year');
    if (!grid) return;

    const { viewYear, viewMonth, selectedDate } = this.calendarState;
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    // Set month and year title, formatted with user's locale
    if (title) {
      const monthName = new Date(viewYear, viewMonth).toLocaleDateString(undefined, { month: 'long' });
      title.textContent = `${monthName}, ${viewYear}`;
    }

    grid.innerHTML = '';

    // Day calculations
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    // 1. Trailing days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month';
      cell.textContent = dayNum;
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        this.calendarState.viewMonth--;
        if (this.calendarState.viewMonth < 0) {
          this.calendarState.viewMonth = 11;
          this.calendarState.viewYear--;
        }
        this.calendarState.selectedDate = { year: this.calendarState.viewYear, month: this.calendarState.viewMonth, date: dayNum };
        this.renderCalendar();
      });
      grid.appendChild(cell);
    }

    // 2. Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.textContent = day;

      const isToday = (viewYear === todayYear && viewMonth === todayMonth && day === todayDate);
      if (isToday) {
        cell.classList.add('today');
      }

      if (selectedDate && selectedDate.year === viewYear && selectedDate.month === viewMonth && selectedDate.date === day) {
        cell.classList.add('selected');
      }

      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        this.calendarState.selectedDate = { year: viewYear, month: viewMonth, date: day };
        this.renderCalendar();
      });

      grid.appendChild(cell);
    }

    // 3. Leading days of next month (fill complete 6-week 42 cell grid)
    const totalFilled = firstDayIndex + daysInMonth;
    const nextMonthCells = 42 - totalFilled;
    for (let day = 1; day <= nextMonthCells; day++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month';
      cell.textContent = day;
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        this.calendarState.viewMonth++;
        if (this.calendarState.viewMonth > 11) {
          this.calendarState.viewMonth = 0;
          this.calendarState.viewYear++;
        }
        this.calendarState.selectedDate = { year: this.calendarState.viewYear, month: this.calendarState.viewMonth, date: day };
        this.renderCalendar();
      });
      grid.appendChild(cell);
    }
  },

  /* ─────────────────────────────────────────────────────────────
     3. Flyout System Controller
     ───────────────────────────────────────────────────────────── */
  setupTray() {
    // 1. Overflow Chevron Button
    // 1. Overflow Chevron Button (flips to upward direction when tray opens)
    const overflowBtn = document.getElementById('tray-overflow-btn');
    if (overflowBtn) {
      overflowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFlyout('flyout-overflow', overflowBtn);
      });
    }

    // 2. Touch Keyboard Button (no popup)
    const keyboardBtn = document.getElementById('tray-keyboard-btn');
    if (keyboardBtn) {
      keyboardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        keyboardBtn.classList.add('active');
        setTimeout(() => keyboardBtn.classList.remove('active'), 250);
      });
    }

    // 3. Language Switcher Button
    const langBtn = document.getElementById('tray-lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFlyout('flyout-language', langBtn);
      });
    }

    // 4. Quick Settings Combined Pill
    const qsBtn = document.getElementById('tray-quick-settings-btn');
    if (qsBtn) {
      qsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFlyout('flyout-quick-settings', qsBtn);
      });
    }

    // 5. Date & Time / Calendar Button
    const clockBtn = document.getElementById('tray-clock-btn');
    if (clockBtn) {
      clockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFlyout('flyout-calendar-notifications', clockBtn);
      });
    }
  },

  toggleFlyout(flyoutId, triggerBtn) {
    const targetFlyout = document.getElementById(flyoutId);
    if (!targetFlyout) return;

    // If already open, close it
    if (this.activeFlyout === flyoutId) {
      this.closeAllFlyouts();
      return;
    }

    // Close any currently open flyouts and Start Menu
    this.closeAllFlyouts();
    if (window.StartMenu && window.StartMenu.isOpen) {
      window.StartMenu.close();
    }

    // Open target flyout
    targetFlyout.classList.add('open');
    if (triggerBtn) triggerBtn.classList.add('active');
    this.activeFlyout = flyoutId;

    // Re-render calendar if opening calendar
    if (flyoutId === 'flyout-calendar-notifications') {
      this.renderCalendar();
    }
  },

  closeAllFlyouts() {
    document.querySelectorAll('.tray-flyout-window').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.tray-button').forEach(el => el.classList.remove('active'));
    this.activeFlyout = null;
  },

  setupGlobalOutsideClick() {
    window.addEventListener('click', (e) => {
      // If click was inside an open flyout or a tray trigger button, don't close
      if (e.target.closest('.tray-flyout-window') || e.target.closest('.tray-button')) {
        return;
      }
      this.closeAllFlyouts();
    });
  },

  /* ─────────────────────────────────────────────────────────────
     4. Quick Settings Interactivity (Screenshot 2)
     ───────────────────────────────────────────────────────────── */
  setupQuickSettings() {
    // Media Play/Pause
    const playBtn = document.getElementById('qs-media-play');
    let isPlaying = false;
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isPlaying = !isPlaying;
        playBtn.textContent = isPlaying ? '❚❚' : '▶';
      });
    }

    // Quick Action Tiles
    const tiles = document.querySelectorAll('.qs-tile, .qs-tile-btn');
    tiles.forEach(tile => {
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        tile.classList.toggle('active');

        // Airplane mode logic
        const tileId = tile.id;
        const action = tile.dataset.action;
        if (tileId === 'tile-airplane' || action === 'airplane') {
          const wifiTile = document.getElementById('tile-wifi') || document.querySelector('.qs-tile-btn[data-action="wifi"]');
          const btTile = document.getElementById('tile-bt') || document.querySelector('.qs-tile-btn[data-action="bluetooth"]');
          if (tile.classList.contains('active')) {
            if (wifiTile) wifiTile.classList.remove('active');
            if (btTile) btTile.classList.remove('active');
          }
        }
      });
    });

    // Helper to calculate exact thumb-aligned fill position
    const updateSliderFill = (slider) => {
      const min = Number(slider.min !== '' ? slider.min : 0);
      const max = Number(slider.max !== '' ? slider.max : 100);
      const val = Number(slider.value);
      const fraction = max > min ? Math.max(0, Math.min(1, (val - min) / (max - min))) : val / 100;
      const pct = fraction * 100;
      // The 16px thumb's center travels from 8px to (100% - 8px), exactly (8px + fraction * (100% - 16px))
      const pos = `calc(8px + ${fraction} * (100% - 16px))`;
      slider.style.setProperty('--fill-pct', `${pct}%`);
      slider.style.setProperty('--fill-pos', pos);
      return { val, fraction, pct };
    };

    // Brightness Slider with Screen Dimmer
    const brightSlider = document.getElementById('qs-bright-slider') || document.getElementById('qs-brightness-slider');
    const dimmerOverlay = document.getElementById('screen-brightness-overlay');
    if (brightSlider) {
      updateSliderFill(brightSlider);
      brightSlider.addEventListener('input', () => {
        const { val } = updateSliderFill(brightSlider);
        if (dimmerOverlay) {
          const darkness = ((100 - val) / 100) * 0.75;
          dimmerOverlay.style.opacity = darkness;
        }
      });
    }

    // Volume Slider
    const volSlider = document.getElementById('qs-vol-slider') || document.getElementById('qs-volume-slider');
    if (volSlider) {
      updateSliderFill(volSlider);
      volSlider.addEventListener('input', () => {
        const { val } = updateSliderFill(volSlider);
        const volIcon = document.getElementById('tray-icon-volume');
        if (volIcon) {
          volIcon.style.opacity = val === 0 ? '0.4' : '1';
        }
      });
    }

    // Settings Gear Icon & Lenovo Badge
    const settingsBtn = document.getElementById('qs-open-settings') || document.getElementById('qs-settings-btn');
    const lenovoBadge = document.querySelector('.lenovo-badge, .qs-lenovo-badge');

    const openSettings = (e) => {
      e.stopPropagation();
      this.closeAllFlyouts();
      if (window.WindowManager) window.WindowManager.open('settings');
    };

    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
    if (lenovoBadge) lenovoBadge.addEventListener('click', openSettings);

    // Live Device Battery Integration (if supported by client browser)
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        const updateBattery = () => {
          const level = Math.round(battery.level * 100);
          const charging = battery.charging;
          const batteryEl = document.querySelector('.qs-footer-battery');
          if (batteryEl) {
            batteryEl.title = `Battery status: ${level}% ${charging ? '(Plugged in / Charging)' : '(Discharging)'}`;
          }
          const qsBtn = document.getElementById('tray-quick-settings-btn');
          if (qsBtn) {
            qsBtn.title = `Quick settings\nInternet access, Sound, Battery (${level}%)${charging ? ' ⚡' : ''}`;
          }
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {});
    }
  },

  /* ─────────────────────────────────────────────────────────────
     5. Language Switcher Interactivity (Screenshot 4)
     ───────────────────────────────────────────────────────────── */
  setupLanguageSwitcher() {
    const langItems = document.querySelectorAll('.lang-item, .lang-item-row');
    const topText = document.getElementById('tray-lang-top');
    const botText = document.getElementById('tray-lang-bot');

    // Auto-detect user device keyboard & language layout
    try {
      const userLang = (navigator.language || 'en-IN').toLowerCase();
      const parts = userLang.split('-');
      const langCode = parts[0] || 'en';
      const countryCode = (parts[1] || '').toUpperCase();
      
      const langMap = {
        'en': 'ENG', 'es': 'ESP', 'fr': 'FRA', 'de': 'DEU', 'it': 'ITA', 
        'pt': 'POR', 'ja': 'JPN', 'zh': 'ZHO', 'ko': 'KOR', 'hi': 'HIN',
        'ru': 'RUS', 'ar': 'ARA'
      };
      const top = langMap[langCode] || langCode.toUpperCase().slice(0, 3);
      const bot = countryCode || (top === 'ENG' ? 'US' : top.slice(0, 2));
      if (topText) topText.textContent = top;
      if (botText) botText.textContent = bot;
      
      const langBtn = document.getElementById('tray-lang-btn');
      if (langBtn) {
        langBtn.title = `${new Intl.DisplayNames([navigator.language || 'en'], { type: 'language' }).of(navigator.language) || 'Keyboard Layout'}\nKeyboard layout`;
      }
    } catch(e) {}

    langItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        langItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const top = item.dataset.langTop || 'ENG';
        const bot = item.dataset.langBot || (item.dataset.lang === 'en-us' ? 'US' : 'IN');
        if (topText) topText.textContent = top;
        if (botText) botText.textContent = bot;

        setTimeout(() => this.closeAllFlyouts(), 150);
      });
    });

    const moreSettings = document.getElementById('btn-more-keyboard-settings') || document.querySelector('.lang-footer-link');
    if (moreSettings) {
      moreSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAllFlyouts();
        if (window.WindowManager) window.WindowManager.open('settings');
      });
    }
  },

  /* ─────────────────────────────────────────────────────────────
     6. Overflow Hidden Icons Interactivity (Screenshot 3)
     ───────────────────────────────────────────────────────────── */
  setupOverflowFlyout() {
    const defender = document.getElementById('overflow-security') || document.getElementById('overflow-defender');
    const sync = document.getElementById('overflow-onedrive') || document.getElementById('overflow-sync');
    const bt = document.getElementById('overflow-bt') || document.getElementById('overflow-bluetooth');

    if (defender) {
      defender.addEventListener('click', (e) => {
        e.stopPropagation();
        // No popup per user instruction
      });
    }

    if (sync) {
      sync.addEventListener('click', (e) => {
        e.stopPropagation();
        // No popup per user instruction
      });
    }

    if (bt) {
      bt.addEventListener('click', (e) => {
        e.stopPropagation();
        // No popup per user instruction
      });
    }
  },

  /* ─────────────────────────────────────────────────────────────
     7. Start Button, Search, Pinned Apps, Window Manager Hooks
     ───────────────────────────────────────────────────────────── */
  setupStartButton() {
    const startBtn = document.getElementById('taskbar-start');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAllFlyouts();
        if (window.StartMenu) {
          window.StartMenu.toggle();
        }
      });
    }
  },

  setupSearchBar() {
    const searchBtn = document.getElementById('taskbar-search');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAllFlyouts();
        if (window.StartMenu) {
          if (!window.StartMenu.isOpen) {
            window.StartMenu.open();
          }
          setTimeout(() => {
            const input = document.getElementById('sm-search-input');
            if (input) input.focus();
          }, 100);
        }
      });
    }
  },

  setupPinnedApps() {
    const pinned = Array.from(document.querySelectorAll('#taskbar-center > .taskbar-item[data-app]'));
    pinned.forEach(item => {
      const appId = item.dataset.app;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAllFlyouts();
        this.handleTaskbarClick(appId);
      });
    });
  },

  handleTaskbarClick(appId, winId) {
    if (!window.WindowManager) return;

    const targetWinId = winId || Object.keys(window.WindowManager.windows).find(
      id => window.WindowManager.windows[id].app === appId
    );

    if (!targetWinId) {
      const item = document.querySelector(`.taskbar-item[data-app="${appId}"]`);
      if (item) {
        item.classList.add('launching');
        setTimeout(() => item.classList.remove('launching'), 450);
      }
      window.WindowManager.open(appId);
    } else {
      const win = window.WindowManager.windows[targetWinId];
      if (win.state === 'minimized') {
        window.WindowManager.restore(targetWinId);
      } else if (window.WindowManager.focusedId === targetWinId) {
        window.WindowManager.minimize(targetWinId);
      } else {
        window.WindowManager.focus(targetWinId);
      }
    }
  },

  onWindowOpen(winId, appId, title, icon) {
    const isPinned = ['explorer', 'edge', 'store'].includes(appId);
    let item = isPinned ? document.querySelector(`.taskbar-item[data-app="${appId}"]`) : null;

    if (!item) {
      item = document.querySelector(`.taskbar-item[data-win-id="${winId}"]`);
    }

    if (!item) {
      const dynamicContainer = document.getElementById('taskbar-dynamic-apps') || this.centerEl;
      item = document.createElement('div');
      item.className = 'taskbar-item dynamic-app';
      item.dataset.app = appId;
      item.dataset.winId = winId;
      item.title = title;
      item.innerHTML = `
        <img src="${icon}" alt="${title}"/>
        <div class="taskbar-indicator"></div>
      `;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAllFlyouts();
        this.handleTaskbarClick(appId, winId);
      });
      dynamicContainer.appendChild(item);
    }

    item.classList.add('running', 'active');
    this.createThumbnail(item, winId, appId, title, icon);
  },

  createThumbnail(item, winId, appId, title, icon) {
    let existingThumb = item.querySelector('.taskbar-thumb-popup');
    if (existingThumb) existingThumb.remove();

    const thumb = document.createElement('div');
    thumb.className = 'taskbar-thumb-popup';
    thumb.innerHTML = `
      <div class="thumb-header">
        <div class="thumb-title">
          <img src="${icon}"/>
          <span>${title}</span>
        </div>
        <button class="thumb-close" title="Close">✕</button>
      </div>
      <div class="thumb-preview-box">
        <span>Click to switch</span>
      </div>
    `;

    const closeBtn = thumb.querySelector('.thumb-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.WindowManager) window.WindowManager.close(winId);
    });

    item.appendChild(thumb);
  },

  onWindowFocus(winId, appId) {
    document.querySelectorAll('.taskbar-item').forEach(el => {
      const match = el.dataset.winId ? el.dataset.winId === winId : el.dataset.app === appId;
      el.classList.toggle('active', match);
    });
  },

  onWindowMinimize(winId, appId) {
    document.querySelectorAll('.taskbar-item').forEach(el => {
      if (el.dataset.winId === winId || (!el.dataset.winId && el.dataset.app === appId)) {
        el.classList.remove('active');
      }
    });
  },

  onWindowRestore(winId, appId) {
    document.querySelectorAll('.taskbar-item').forEach(el => {
      if (el.dataset.winId === winId || (!el.dataset.winId && el.dataset.app === appId)) {
        el.classList.add('active', 'running');
      }
    });
  },

  onWindowClose(winId, appId) {
    const isPinned = ['explorer', 'edge', 'store'].includes(appId);
    if (isPinned) {
      if (window.WindowManager) {
        const others = Object.values(window.WindowManager.windows).filter(w => w.app === appId && w.id !== winId);
        if (others.length === 0) {
          const item = document.querySelector(`.taskbar-item[data-app="${appId}"]`);
          if (item) {
            item.classList.remove('active', 'running');
            const thumb = item.querySelector('.taskbar-thumb-popup');
            if (thumb) thumb.remove();
          }
        }
      }
    } else {
      const item = document.querySelector(`.taskbar-item[data-win-id="${winId}"]`) || document.querySelector(`.taskbar-item[data-app="${appId}"]`);
      if (item) {
        item.style.transition = 'transform 0.18s ease, opacity 0.18s ease, width 0.18s ease';
        item.style.transform = 'scale(0.5)';
        item.style.opacity = '0';
        item.style.width = '0px';
        setTimeout(() => item.remove(), 180);
      }
    }
  },

  clearActive() {
    document.querySelectorAll('.taskbar-item').forEach(el => el.classList.remove('active'));
  },

  setupPeek() {
    const peekBtn = document.getElementById('taskbar-peek');
    if (peekBtn) {
      peekBtn.addEventListener('click', () => {
        this.closeAllFlyouts();
        if (window.WindowManager) window.WindowManager.minimizeAll();
      });
    }
  }
};

window.Taskbar = Taskbar;
