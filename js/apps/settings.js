/**
 * Windows 11 - About Project & System Information App
 */
const SettingsApp = {
  mount(container, winId) {
    container.innerHTML = `
      <div class="settings-container">
        <!-- Sidebar Navigation -->
        <div class="settings-sidebar">
          <div class="settings-user-card">
            <div style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; background:rgba(0,103,192,0.18); border-radius:10px; border:1px solid rgba(96,193,255,0.3); flex-shrink:0;">
              <img src="assets/icons/winlogo.png" style="width:24px; height:24px; object-fit:contain;" alt="Win11 Web OS" />
            </div>
            <div class="settings-user-details">
              <span class="settings-user-name">Win11 Web OS</span>
              <span class="settings-user-status">v2.4.0 (Portfolio Edition)</span>
            </div>
          </div>

          <div class="settings-nav-list">
            <div class="settings-nav-item active" data-tab="overview">
              <span>🪟</span>
              <span>Project Overview</span>
            </div>
            <div class="settings-nav-item" data-tab="techstack">
              <span>⚡</span>
              <span>Tech Stack</span>
            </div>
            <div class="settings-nav-item" data-tab="vibecoding">
              <span>💡</span>
              <span>Vibe-Coding & Facts</span>
            </div>
            <div class="settings-nav-item" data-tab="features">
              <span>🛠️</span>
              <span>Under The Hood</span>
            </div>
            <div class="settings-nav-item" data-tab="source">
              <span>🔗</span>
              <span>Source & Connect</span>
            </div>
          </div>
        </div>

        <!-- Main Content Panel -->
        <div class="settings-content" id="settings-content-${winId}">
          <!-- Dynamic sections rendered below -->
        </div>
      </div>
    `;

    this.renderSection(winId, 'overview');
    this.attachEvents(winId);
  },

  renderSection(winId, tab) {
    const content = document.getElementById(`settings-content-${winId}`);
    if (!content) return;

    if (tab === 'overview') {
      content.innerHTML = `
        <div class="settings-header-title">Project Overview</div>
        <div class="settings-section-subtitle">Windows 11 recreated as an interactive browser operating system</div>

        <!-- Hero Card -->
        <div class="settings-card">
          <div class="settings-hero-row">
            <div style="width:64px; height:64px; display:flex; align-items:center; justify-content:center; background:rgba(0,103,192,0.22); border-radius:14px; border:1px solid rgba(96,193,255,0.4); flex-shrink:0;">
              <img src="assets/icons/winlogo.png" style="width:36px; height:36px; object-fit:contain;" alt="Windows 11" />
            </div>
            <div class="settings-hero-meta">
              <h3>"Why build a normal portfolio when you can recreate an OS?"</h3>
              <p>An interactive, zero-framework Windows 11 desktop built from scratch in pure Vanilla JavaScript, HTML5, and CSS3.</p>
              <div class="badge-open-work">⚡ 100% Client-Side • 60 FPS Smooth • Zero Framework Bloat</div>
            </div>
          </div>
        </div>

        <!-- Humorous Overview Card -->
        <div class="settings-card">
          <div style="font-weight:600; font-size:14px; color:#ffffff; display:flex; align-items:center; gap:8px;">
            <span>✨</span> The Concept
          </div>
          <div class="settings-bio-text">
            Most developer portfolios follow the same formula: a hero text, an "About Me" paragraph, and a grid of cards pointing to GitHub links.
            <br/><br/>
            I thought: <em>What if visitors could explore my projects directly inside a real virtual File Explorer, launch CLI tools in a built-in Terminal, adjust brightness using the Windows Action Center, and drag windows around with genuine acrylic glassmorphic blur?</em>
            <br/><br/>
            The result is this website — a faithful emulation of Windows 11 running right inside your browser window.
            <br/>
            <span style="color:var(--text-secondary); font-size:12px; font-style:italic;">*Disclaimer: No Microsoft licenses were purchased, harmed, or violated in the crafting of this project.*</span>
          </div>
        </div>

        <!-- Key Highlights Grid -->
        <div class="settings-card">
          <div style="font-weight:600; font-size:14px; color:#ffffff; margin-bottom:4px;">Core Highlights</div>
          <div class="tech-grid">
            <div class="tech-box">
              <div class="tech-box-header"><span>🪟</span> Multi-Window Manager</div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                Full z-index stacking, dragging with boundary clamps, minimize to taskbar, maximize toggles, and smooth transitions.
              </div>
            </div>

            <div class="tech-box">
              <div class="tech-box-header"><span>📁</span> Virtual File Explorer</div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                Browse project repositories, view folder trees, launch live iframe previews, or jump straight to GitHub repos.
              </div>
            </div>

            <div class="tech-box">
              <div class="tech-box-header"><span>🎨</span> Fluent Design & Acrylic</div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                Backdrop-filter blur, mica materials, glow borders, and synthesized Web Audio sound effects.
              </div>
            </div>

            <div class="tech-box">
              <div class="tech-box-header"><span>⚡</span> Pure Vanilla Web Tech</div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                Zero React, zero Vue, zero Tailwind, zero heavyweight dependencies. Blazing fast load and execution times.
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Action row -->
        <div class="settings-card" style="display:flex; flex-direction:row; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="font-weight:600; font-size:13px;">Curious about the tech stack?</div>
            <div style="font-size:12px; color:var(--text-secondary);">Check out the breakdown of languages and custom engines.</div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="settings-action-btn primary" id="btn-goto-tech-${winId}">Explore Tech Stack →</button>
          </div>
        </div>
      `;

      const btnTech = document.getElementById(`btn-goto-tech-${winId}`);
      if (btnTech) {
        btnTech.addEventListener('click', () => {
          this.switchTab(winId, 'techstack');
        });
      }
    }

    else if (tab === 'techstack') {
      content.innerHTML = `
        <div class="settings-header-title">Tech Stack & Architecture</div>
        <div class="settings-section-subtitle">The foundation, languages, and custom engines powering Win11 Web OS</div>

        <!-- Tech Stack Specification Table (Matching Exact Specifications) -->
        <div class="settings-card">
          <div style="font-weight:600; font-size:14px; color:#ffffff; display:flex; align-items:center; gap:8px;">
            <span>⚡</span> Tech Stack Overview
          </div>
          <div class="tech-stack-table">
            <div class="tech-table-header">
              <span class="col-category">Category</span>
              <span class="col-tech">Technology</span>
            </div>
            <div class="tech-table-row">
              <span class="col-category">Frontend</span>
              <span class="col-tech">HTML5, CSS3, Vanilla JavaScript</span>
            </div>
            <div class="tech-table-row">
              <span class="col-category">Backend</span>
              <span class="col-tech">Node.js</span>
            </div>
            <div class="tech-table-row">
              <span class="col-category">Server</span>
              <span class="col-tech">Node.js HTTP/HTTPS modules</span>
            </div>
            <div class="tech-table-row">
              <span class="col-category">Data Format</span>
              <span class="col-tech">JSON</span>
            </div>
            <div class="tech-table-row">
              <span class="col-category">Fonts</span>
              <span class="col-tech">Google Fonts (Inter)</span>
            </div>
            <div class="tech-table-row">
              <span class="col-category">Assets</span>
              <span class="col-tech">PNG, JPG, SVG</span>
            </div>
            <div class="tech-table-row">
              <span class="col-category">Version Control</span>
              <span class="col-tech">Git, GitHub</span>
            </div>
            <div class="tech-table-row">
              <span class="col-category">Deployment</span>
              <span class="col-tech">Vercel (Production Hosting) + is-a.dev (Custom Subdomain)</span>
            </div>
          </div>
        </div>

        <!-- Languages Breakdown -->
        <div class="settings-card">
          <div style="font-weight:600; font-size:14px; color:#ffffff; display:flex; align-items:center; gap:8px;">
            <span>💻</span> Languages Breakdown
          </div>
          <div class="tech-grid">
            <div class="tech-box">
              <div class="tech-box-header">
                <span>🟨</span> JavaScript (ES6+)
              </div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                The core engine. Drives object-oriented window lifecycle management, mouse physics, marquee selection boxes, and event dispatchers.
              </div>
              <div class="tech-tag-container">
                <span class="tech-tag">Modular OOP</span>
                <span class="tech-tag">Web Audio API</span>
                <span class="tech-tag">DOM Manipulation</span>
                <span class="tech-tag">Event Delegation</span>
              </div>
            </div>

            <div class="tech-box">
              <div class="tech-box-header">
                <span>🎨</span> Modern CSS3 (Vanilla)
              </div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                Recreates the authentic Windows 11 Fluent aesthetic without external CSS frameworks.
              </div>
              <div class="tech-tag-container">
                <span class="tech-tag purple">CSS Variables</span>
                <span class="tech-tag purple">Backdrop-Filter</span>
                <span class="tech-tag purple">Acrylic & Mica</span>
                <span class="tech-tag purple">Hardware Transforms</span>
              </div>
            </div>

            <div class="tech-box">
              <div class="tech-box-header">
                <span>🌐</span> Semantic HTML5
              </div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                Clean hierarchical document structure, SVG icon definitions, and embedded responsive iframes.
              </div>
              <div class="tech-tag-container">
                <span class="tech-tag amber">Semantic Elements</span>
                <span class="tech-tag amber">Custom SVG Icons</span>
                <span class="tech-tag amber">Iframe Sandbox</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Subsystems Built from Scratch -->
        <div class="settings-card">
          <div style="font-weight:600; font-size:14px; color:#ffffff; display:flex; align-items:center; gap:8px;">
            <span>⚙️</span> Custom Engines & Subsystems
          </div>
          <div class="settings-specs-table">
            <div class="settings-spec-row">
              <span class="spec-label" style="width:180px; font-weight:600; color:#ffffff;">Window Manager</span>
              <span class="spec-value" style="text-align:left; color:var(--text-secondary);">
                Independent z-stack management, viewport drag boundaries, minimize/maximize animations, taskbar indicator syncing.
              </span>
            </div>
            <div class="settings-spec-row">
              <span class="spec-label" style="width:180px; font-weight:600; color:#ffffff;">Virtual File System (VFS)</span>
              <span class="spec-value" style="text-align:left; color:var(--text-secondary);">
                Structured in-memory directory tree representing real project files, sizes, modified dates, and preview handlers.
              </span>
            </div>
            <div class="settings-spec-row">
              <span class="spec-label" style="width:180px; font-weight:600; color:#ffffff;">Rubber-Band Selection</span>
              <span class="spec-value" style="text-align:left; color:var(--text-secondary);">
                Bounding box intersection math enabling marquee drag-to-select on Desktop AND inside File Explorer.
              </span>
            </div>
            <div class="settings-spec-row">
              <span class="spec-label" style="width:180px; font-weight:600; color:#ffffff;">Audio Synthesizer Daemon</span>
              <span class="spec-value" style="text-align:left; color:var(--text-secondary);">
                Web Audio API synthesizer recreating subtle system chimes and clicks programmatically without heavy audio files.
              </span>
            </div>
            <div class="settings-spec-row">
              <span class="spec-label" style="width:180px; font-weight:600; color:#ffffff;">Notification Engine</span>
              <span class="spec-value" style="text-align:left; color:var(--text-secondary);">
                Dual-surface notifications: toast alerts on desktop + persistent notification cards inside the calendar flyout.
              </span>
            </div>
          </div>
        </div>

        <!-- Zero Bloat statement -->
        <div class="settings-card">
          <div style="font-weight:600; font-size:14px; color:#ffffff;">The "Zero Bloat" Philosophy</div>
          <div class="settings-bio-text">
            No massive React runtime, no npm dependency tree vulnerabilities, and no CSS framework overhead. Everything loads instantly in a fraction of a second, with 60fps rendering even on budget hardware.
          </div>
        </div>
      `;
    }

    else if (tab === 'vibecoding') {
      content.innerHTML = `
        <div class="settings-header-title">Vibe-Coding & Facts</div>
        <div class="settings-section-subtitle">The philosophy of modern AI pair-programming and fun project trivia</div>

        <!-- The Vibe-Coding Card -->
        <div class="settings-card">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="font-size:32px;">🤖 ✨</div>
            <div>
              <h3 style="font-size:16px; font-weight:600; color:#ffffff; margin:0 0 4px 0;">Is this website vibe-coded? Yes, 100%!</h3>
              <div style="font-size:12px; color:#60C1FF;">Engineered through Human Architecture + AI Velocity</div>
            </div>
          </div>
          <div class="settings-bio-text" style="margin-top:8px;">
            <strong>Should you mention vibe-coding in a portfolio? Absolutely!</strong>
            <br/><br/>
            "Vibe-coding" isn't about blind copy-pasting or accepting broken outputs. It is the art of acting as a software architect: defining crisp constraints, guiding modern UI design systems, asking for micro-animations, and having AI (Google Antigravity & Gemini) write high-precision code at lightning speed.
            <br/><br/>
            Instead of spending two months on boilerplate CSS and window drag calculations, this entire OS was orchestrated and polished in record time with rigorous attention to detail.
          </div>
        </div>

        <!-- Fun Facts List -->
        <div class="settings-card">
          <div style="font-weight:600; font-size:14px; color:#ffffff; margin-bottom:6px;">Fun Facts & Hidden Quirks</div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            
            <div class="fact-item">
              <div class="fact-icon-badge">🔓</div>
              <div class="fact-content">
                <h4>Any Password Unlocks The System</h4>
                <p>On the lock screen, you can type literally anything (or nothing and just hit Enter) to unlock the desktop. The "I forgot my PIN" link will even cheer you on!</p>
              </div>
            </div>

            <div class="fact-item">
              <div class="fact-icon-badge">🖥️</div>
              <div class="fact-content">
                <h4>Built for Fullscreen Immersion</h4>
                <p>Press <strong>F11</strong> (or click anywhere on the lockscreen) to enter browser fullscreen. The site feels so authentic you might forget you're inside a web browser.</p>
              </div>
            </div>

            <div class="fact-item">
              <div class="fact-icon-badge">⏰</div>
              <div class="fact-content">
                <h4>Real-Time Hardware & Time Sync</h4>
                <p>The lockscreen clock, taskbar time, and calendar dynamically synchronize with your local device's clock, timezone offset, and calendar month.</p>
              </div>
            </div>

            <div class="fact-item">
              <div class="fact-icon-badge">🖱️</div>
              <div class="fact-content">
                <h4>Rubber-Band Drag Selection</h4>
                <p>Just like real Windows, you can click and drag selection marquees both on the desktop wallpaper AND within the folders of File Explorer.</p>
              </div>
            </div>

            <div class="fact-item">
              <div class="fact-icon-badge">🔔</div>
              <div class="fact-content">
                <h4>Live Notification Center</h4>
                <p>Click the time in the bottom-right taskbar to reveal the calendar and the Notification Center. Dismiss cards or clear them all at once!</p>
              </div>
            </div>

          </div>
        </div>
      `;
    }

    else if (tab === 'features') {
      content.innerHTML = `
        <div class="settings-header-title">Under The Hood</div>
        <div class="settings-section-subtitle">Interactive apps, controls, and features you can play with right now</div>

        <div class="tech-grid">
          <!-- File Explorer -->
          <div class="tech-box">
            <div class="tech-box-header"><span>📁</span> File Explorer</div>
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
              Full virtual file management with Quick Access, project folders (AttendanceManager, SplitwiseAI, LazyGestures), details view with date & size columns, and direct GitHub repo shortcuts.
            </div>
            <div style="margin-top:8px;">
              <button class="settings-action-btn" id="btn-launch-explorer-${winId}">Launch Explorer ↗</button>
            </div>
          </div>

          <!-- Terminal -->
          <div class="tech-box">
            <div class="tech-box-header"><span>💻</span> Developer Terminal</div>
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
              Interactive PowerShell / Bash command line emulator. Try typing <code>help</code>, <code>neofetch</code>, <code>projects</code>, <code>cat README.md</code>, or <code>theme</code>.
            </div>
            <div style="margin-top:8px;">
              <button class="settings-action-btn" id="btn-launch-terminal-${winId}">Launch Terminal ↗</button>
            </div>
          </div>

          <!-- Notepad -->
          <div class="tech-box">
            <div class="tech-box-header"><span>📝</span> Notepad Editor</div>
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
              Lightweight text editor with live word and character counters, instant file reading, and responsive typing area.
            </div>
            <div style="margin-top:8px;">
              <button class="settings-action-btn" id="btn-launch-notepad-${winId}">Launch Notepad ↗</button>
            </div>
          </div>

          <!-- Quick Settings -->
          <div class="tech-box">
            <div class="tech-box-header"><span>🎛️</span> Action Center & Quick Settings</div>
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
              Click the Wi-Fi/Battery/Volume icons in the taskbar tray to adjust screen brightness in real-time or tweak audio master volume.
            </div>
          </div>

          <!-- Calendar & Notification Center -->
          <div class="tech-box">
            <div class="tech-box-header"><span>📅</span> Calendar & Notification Center</div>
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
              Interactive calendar synchronized to your device's date with a persistent notification inbox right above it.
            </div>
          </div>

          <!-- Live Project Preview -->
          <div class="tech-box">
            <div class="tech-box-header"><span>🌐</span> Live Project Previews</div>
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
              Select any project in File Explorer and click "Launch preview" to inspect live running prototypes directly in an embedded browser window.
            </div>
          </div>
        </div>
      `;

      const expBtn = document.getElementById(`btn-launch-explorer-${winId}`);
      if (expBtn) {
        expBtn.addEventListener('click', () => {
          if (window.WindowManager) window.WindowManager.open('explorer');
        });
      }

      const termBtn = document.getElementById(`btn-launch-terminal-${winId}`);
      if (termBtn) {
        termBtn.addEventListener('click', () => {
          if (window.WindowManager) window.WindowManager.open('terminal');
        });
      }

      const noteBtn = document.getElementById(`btn-launch-notepad-${winId}`);
      if (noteBtn) {
        noteBtn.addEventListener('click', () => {
          if (window.WindowManager) window.WindowManager.open('notepad');
        });
      }
    }

    else if (tab === 'source') {
      content.innerHTML = `
        <div class="settings-header-title">Source & Connect</div>
        <div class="settings-section-subtitle">Get in touch with Harsh Prasad or explore open source repositories</div>

        <div class="settings-card">
          <div class="settings-hero-row">
            <img src="assets/avatar.png" class="settings-hero-avatar" alt="Harsh Prasad"/>
            <div class="settings-hero-meta">
              <h3>Harsh Prasad</h3>
              <p>Full-Stack Software Engineer & AI Systems Builder</p>
              <div class="badge-open-work">🟢 Open for Engineering Opportunities</div>
            </div>
          </div>
        </div>

        <div class="settings-card">
          <div style="font-weight:600; font-size:14px; margin-bottom:6px;">Channels & Links</div>
          <div class="settings-specs-table">
            <div class="settings-spec-row">
              <span class="spec-label">GitHub</span>
              <a href="https://github.com/harsh-pr" target="_blank" class="spec-value spec-link">github.com/harsh-pr ↗</a>
            </div>
            <div class="settings-spec-row">
              <span class="spec-label">LinkedIn</span>
              <a href="https://www.linkedin.com/in/harshranjanprasad/" target="_blank" class="spec-value spec-link">linkedin.com/in/harshranjanprasad ↗</a>
            </div>
            <div class="settings-spec-row">
              <span class="spec-label">Direct Email</span>
              <a href="mailto:harshprasad1607@gmail.com" class="spec-value spec-link">harshprasad1607@gmail.com ↗</a>
            </div>
            <div class="settings-spec-row">
              <span class="spec-label">Portfolio Domain</span>
              <span class="spec-value">harsh-pr.is-a.dev</span>
            </div>
          </div>
        </div>

        <div class="settings-card" style="display:flex; flex-direction:row; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="font-weight:600;">Ready to collaborate?</div>
            <div style="font-size:12px; color:var(--text-secondary);">Send an instant message directly via the built-in Mail app.</div>
          </div>
          <button class="settings-action-btn primary" id="btn-goto-mail-${winId}">Compose Message ✉️</button>
        </div>
      `;

      const btnMail = document.getElementById(`btn-goto-mail-${winId}`);
      if (btnMail) {
        btnMail.addEventListener('click', () => {
          if (window.WindowManager) window.WindowManager.open('mail');
        });
      }
    }
  },

  switchTab(winId, tabName) {
    const navItems = document.querySelectorAll(`#content-${winId} .settings-nav-item`);
    navItems.forEach(item => {
      if (item.dataset.tab === tabName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    this.renderSection(winId, tabName);
  },

  attachEvents(winId) {
    const navItems = document.querySelectorAll(`#content-${winId} .settings-nav-item`);
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.renderSection(winId, item.dataset.tab);
      });
    });
  }
};

window.SettingsApp = SettingsApp;
