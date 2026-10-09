/**
 * Main Application Orchestrator & Easter Eggs
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Systems in order
  BootScreen.init();
  Notifications.init();
  WindowManager.init();
  Desktop.init();
  Taskbar.init();
  StartMenu.init();

  // Easter Eggs & Global Shortcuts
  setupEasterEggs();

  // On startup, don't open any window by default
  const originalUnlock = BootScreen.unlock.bind(BootScreen);
  BootScreen.unlock = function() {
    originalUnlock();
  };

  const originalInstant = BootScreen.instantUnlock.bind(BootScreen);
  BootScreen.instantUnlock = function() {
    originalInstant();
  };
});

/**
 * Fun Developer Easter Eggs
 */
function setupEasterEggs() {
  // 1. Ctrl + Alt + Delete: Windows Security Screen
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && (e.key === 'Delete' || e.key === 'Del')) {
      e.preventDefault();
      showSecurityScreen();
    }
  });

  // 2. Konami Code (Matrix Rain)
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIndex = 0;

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === konami[konamiIndex].toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === konami.length) {
        konamiIndex = 0;
        triggerMatrixMode();
      }
    } else {
      konamiIndex = 0;
    }
  });
}

function showSecurityScreen() {
  let sec = document.getElementById('win-security-overlay');
  if (!sec) {
    sec = document.createElement('div');
    sec.id = 'win-security-overlay';
    sec.style.cssText = `
      position: fixed; inset: 0; z-index: 999999;
      background: rgba(0, 70, 140, 0.95);
      backdrop-filter: blur(20px);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 20px; color: #ffffff;
      animation: fadeIn 0.2s ease;
    `;
    sec.innerHTML = `
      <img src="assets/avatar.jpg" style="width:100px; height:100px; border-radius:50%; border:3px solid white; box-shadow:0 8px 30px rgba(0,0,0,0.5);"/>
      <div style="font-size:24px; font-weight:600;">Harsh Prasad</div>
      <div style="font-size:14px; opacity:0.8; margin-top:-10px;">Full-Stack Software Engineer & AI Builder</div>
      <div style="display:flex; flex-direction:column; gap:10px; width:220px; margin-top:20px;">
        <button class="mail-new-btn" id="sec-hire">Hire Harsh Prasad 🚀</button>
        <button class="mail-new-btn" id="sec-tm" style="background:rgba(255,255,255,0.15);">Open Task Manager</button>
        <button class="mail-new-btn" id="sec-lock" style="background:rgba(255,255,255,0.15);">Lock Screen</button>
        <button class="mail-new-btn" id="sec-cancel" style="background:rgba(255,255,255,0.08);">Cancel (Esc)</button>
      </div>
    `;
    document.body.appendChild(sec);

    document.getElementById('sec-hire').onclick = () => {
      sec.remove();
      WindowManager.open('mail');
    };
    document.getElementById('sec-tm').onclick = () => {
      sec.remove();
      WindowManager.open('taskmanager');
    };
    document.getElementById('sec-lock').onclick = () => {
      sec.remove();
      location.reload();
    };
    document.getElementById('sec-cancel').onclick = () => {
      sec.remove();
    };
  }
}

function triggerMatrixMode() {
  let canvas = document.getElementById('matrix-canvas');
  if (canvas) {
    canvas.remove();
    return;
  }

  canvas = document.createElement('canvas');
  canvas.id = 'matrix-canvas';
  canvas.style.cssText = 'position:fixed; inset:0; z-index:999998; pointer-events:none;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = '0123456789ABCDEF01HARSHDEVELOPERREACTNEXTJSV8NODE';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  const interval = setInterval(() => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00FF66';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 33);

  setTimeout(() => {
    clearInterval(interval);
    canvas.remove();
  }, 6000);
}
