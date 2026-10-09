/**
 * Windows 11 Boot & Lock Screen Controller
 */
const BootScreen = {
  bootEl: null,
  lockEl: null,
  loginEl: null,
  lockTimeEl: null,
  lockDateEl: null,
  pinInput: null,
  loginForm: null,
  loginLoading: null,
  forgotPinBtn: null,
  timeInterval: null,
  isUnlocked: false,
  isAtLogin: false,

  init() {
    this.bootEl = document.getElementById('boot-screen');
    this.lockEl = document.getElementById('lock-screen');
    this.loginEl = document.getElementById('login-screen');
    this.lockTimeEl = document.getElementById('lock-time');
    this.lockDateEl = document.getElementById('lock-date');
    this.pinInput = document.getElementById('login-pin-input');
    this.loginForm = document.getElementById('login-form');
    this.loginLoading = document.getElementById('login-loading');
    this.forgotPinBtn = document.getElementById('login-forgot-pin');

    this.updateClock();
    this.timeInterval = setInterval(() => this.updateClock(), 1000);

    // Boot screen skip button
    const skipBtn = document.getElementById('boot-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.requestFullscreen();
        this.instantUnlock();
      });
    }

    // Fullscreen lock hint button
    const fsHintBtn = document.getElementById('lock-fullscreen-btn');
    if (fsHintBtn) {
      fsHintBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.requestFullscreen();
        this.showLoginScreen();
      });
    }

    // Auto transition from Boot to Lock Screen after 2.6s
    setTimeout(() => {
      this.transitionToLock();
    }, 2600);

    // 1. Lock screen interaction: scroll up, swipe, click, or key press
    if (this.lockEl) {
      // Click on lock screen
      this.lockEl.addEventListener('click', () => {
        this.requestFullscreen();
        this.showLoginScreen();
      });

      // Mouse wheel / scroll on lock screen
      this.lockEl.addEventListener('wheel', (e) => {
        if (e.deltaY > 5 || e.deltaY < -5) {
          this.showLoginScreen();
        }
      }, { passive: true });

      // Touch drag/swipe on lock screen
      let touchStartY = 0;
      this.lockEl.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
      }, { passive: true });
      this.lockEl.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        if (touchStartY - touchEndY > 30 || Math.abs(touchStartY - touchEndY) < 15) {
          this.showLoginScreen();
        }
      }, { passive: true });
    }

    // Keyboard trigger on lock screen or login screen
    window.addEventListener('keydown', (e) => {
      if (this.isUnlocked) return;

      // When lock screen is active
      if (!this.isAtLogin && this.bootEl && this.bootEl.classList.contains('fade-out')) {
        this.showLoginScreen();
        // If an alphanumeric key was pressed, insert it into the PIN input
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          setTimeout(() => {
            if (this.pinInput) {
              this.pinInput.value = e.key;
              this.pinInput.focus();
            }
          }, 60);
        }
      } else if (this.isAtLogin) {
        // Escape key returns to lock screen
        if (e.key === 'Escape') {
          this.hideLoginScreen();
        }
      }
    });

    // 2. PIN / Password Submission: Any thing typed will work!
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePinSubmit();
      });
    }

    const submitBtn = document.getElementById('login-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handlePinSubmit();
      });
    }

    // 3. "I forgot my PIN" button -> Toast notification on right side
    if (this.forgotPinBtn) {
      this.forgotPinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleForgotPin();
      });
    }

    // Accessibility button in Login Screen tray
    const a11yBtn = document.getElementById('login-a11y-btn');
    if (a11yBtn) {
      a11yBtn.addEventListener('click', () => {
        if (window.Notifications) {
          Notifications.show({
            title: 'Accessibility Options',
            message: 'Magnifier, Narrator, and High Contrast tools are ready.',
            icon: '♿',
            appName: 'Windows Ease of Access',
            duration: 4000
          });
        }
      });
    }

    // Power Options in Login Screen tray
    const powerBtn = document.getElementById('login-power-btn');
    if (powerBtn) {
      powerBtn.addEventListener('click', () => {
        if (window.Notifications) {
          Notifications.show({
            title: 'Power Options',
            message: 'Sign in to access desktop power controls.',
            icon: '⚡',
            appName: 'Windows Security',
            duration: 4000
          });
        }
      });
    }
  },

  updateClock() {
    const now = new Date();
    if (this.lockTimeEl) {
      const is12Hour = new Intl.DateTimeFormat([], { hour: 'numeric' }).resolvedOptions().hour12 ?? false;
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const displayHours = is12Hour ? (hours % 12 || 12) : String(hours).padStart(2, '0');
      this.lockTimeEl.textContent = `${displayHours}:${minutes}`;
    }
    if (this.lockDateEl) {
      this.lockDateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
  },

  transitionToLock() {
    if (!this.bootEl) return;
    this.bootEl.classList.add('fade-out');
    setTimeout(() => {
      this.bootEl.style.display = 'none';
    }, 600);
  },

  showLoginScreen() {
    if (this.isAtLogin || this.isUnlocked || !this.lockEl) return;
    this.isAtLogin = true;

    // Smooth blur transition: activate .show-login
    this.lockEl.classList.add('show-login');

    // Auto-focus PIN input as profile appears
    setTimeout(() => {
      if (this.pinInput && this.isAtLogin) {
        this.pinInput.focus();
      }
    }, 220);
  },

  hideLoginScreen() {
    if (!this.isAtLogin || this.isUnlocked || !this.lockEl) return;
    this.isAtLogin = false;

    // Smoothly unblur back to crisp lock screen
    this.lockEl.classList.remove('show-login');
  },

  handlePinSubmit() {
    if (this.isUnlocked) return;

    const val = this.pinInput ? this.pinInput.value.trim() : '';

    // Anything typed in it will work! If empty, shake gently to prompt input
    if (!val || val.length === 0) {
      const wrapper = document.getElementById('login-input-wrapper');
      if (wrapper) {
        wrapper.classList.remove('shake');
        void wrapper.offsetWidth;
        wrapper.classList.add('shake');
        setTimeout(() => wrapper.classList.remove('shake'), 450);
      }
      if (this.pinInput) {
        this.pinInput.placeholder = 'Type anything!';
        this.pinInput.focus();
      }
      return;
    }

    // Click sound effect
    if (window.SoundEffects) {
      SoundEffects.playClick();
    }

    // Show Windows 11 "Welcome" spinner
    this.requestFullscreen();
    if (this.loginForm) this.loginForm.style.display = 'none';
    if (this.loginLoading) this.loginLoading.style.display = 'flex';

    setTimeout(() => {
      this.unlock();
    }, 550);
  },

  handleForgotPin() {
    // Send notification on right side saying any password will work
    if (window.Notifications) {
      Notifications.show({
        title: 'Sign-in Assistance',
        message: 'Any password will work! Type anything and press Enter.',
        icon: '🔑',
        appName: 'Windows Security',
        duration: 5500
      });
    }

    if (this.pinInput) {
      this.pinInput.placeholder = 'Type anything!';
      this.pinInput.focus();
    }
  },

  unlock() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    // Fade out lock screen smoothly
    if (this.lockEl) {
      this.lockEl.classList.add('unlocking');
    }

    // Reveal desktop with default Windows 11 wallpaper
    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.style.display = 'block';
    }

    setTimeout(() => {
      if (this.lockEl) this.lockEl.style.display = 'none';
      if (this.timeInterval) clearInterval(this.timeInterval);

      // Play subtle startup chime
      SoundEffects.playStartup();

      // Trigger desktop startup notification
      if (window.Notifications) {
        setTimeout(() => {
          Notifications.show({
            title: 'Welcome to Windows 11',
            message: 'Harsh Prasad\'s Developer Portfolio is ready! ⛶ For the best immersive experience, use Fullscreen mode (F11). Double-click any icon to explore!',
            icon: '👋',
            appName: 'Windows Welcome'
          });
        }, 1000);
      }
    }, 450);
  },

  instantUnlock() {
    this.requestFullscreen();
    this.isUnlocked = true;
    if (this.bootEl) {
      this.bootEl.style.display = 'none';
    }
    if (this.lockEl) {
      this.lockEl.style.display = 'none';
    }
    if (this.loginEl) {
      this.loginEl.style.display = 'none';
    }
    if (this.timeInterval) clearInterval(this.timeInterval);

    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.style.display = 'block';
    }
    SoundEffects.playStartup();
  },

  requestFullscreen() {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const el = document.documentElement;
        const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (rfs) {
          rfs.call(el).catch(() => {});
        }
      }
    } catch(e) {}
  }
};

/**
 * Procedural Audio Synthesizer (Windows-like startup chime)
 */
const SoundEffects = {
  ctx: null,
  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  playStartup() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Elegant harmonic chord: D4, F#4, A4, D5
      const notes = [293.66, 369.99, 440.00, 587.33];
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.12 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 2.0);
      });
    } catch (e) {
      // Audio autoplay policy fallback
    }
  },
  playClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {}
  }
};

window.BootScreen = BootScreen;
window.SoundEffects = SoundEffects;
