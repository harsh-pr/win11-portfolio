/**
 * Microsoft Edge Browser App
 * Embedded Project Website Viewer (iframe inside Windows 11 window)
 */
const EdgeApp = {
  mount(container, winId, initialUrl = 'https://ai-splitwise-vpp.vercel.app/auth.html', title = 'Project Viewer') {
    const isHub = this.isHubUrl(initialUrl);

    container.innerHTML = `
      <div class="edge-container">
        <!-- Edge Tab Strip -->
        <div class="edge-tab-strip">
          <div class="edge-tab">
            <img src="assets/icons/edge.png" alt="Edge"/>
            <span class="edge-tab-title" id="edge-tab-title-${winId}">${title}</span>
            <span class="edge-tab-close" id="edge-tab-close-${winId}">✕</span>
          </div>
        </div>

        <!-- Edge Navigation & Omnibox Bar -->
        <div class="edge-toolbar">
          <button class="edge-tool-btn" id="edge-back-${winId}" title="Back">←</button>
          <button class="edge-tool-btn" id="edge-fwd-${winId}" title="Forward" disabled>→</button>
          <button class="edge-tool-btn" id="edge-reload-${winId}" title="Refresh">↺</button>
          
          <div class="edge-address-bar">
            <span class="edge-lock-icon">🔒</span>
            <input type="text" class="edge-url-input" id="edge-url-input-${winId}" value="${initialUrl}"/>
            <button class="edge-external-btn" id="edge-ext-${winId}" title="Open live site in a new browser tab">🚀 Open Live ↗</button>
          </div>

          <button class="edge-tool-btn" id="edge-fullscreen-${winId}" title="Toggle Fullscreen">⛶</button>
        </div>

        <!-- Progress Loading Line -->
        <div class="edge-loader" id="edge-loader-${winId}">
          <div class="edge-loader-bar"></div>
        </div>

        <!-- Viewport with iframe, Hub view, and fallback handler -->
        <div class="edge-viewport" id="edge-vp-${winId}">
          <iframe 
            class="edge-iframe" 
            id="edge-iframe-${winId}" 
            src="${isHub ? 'about:blank' : this.getEffectiveSrc(initialUrl)}" 
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            loading="lazy"
            style="${isHub ? 'display:none;' : 'display:block;'}">
          </iframe>

          <!-- Edge Hub View for GitHub & LinkedIn Profiles -->
          <div class="edge-hub-view" id="edge-hub-${winId}" style="${isHub ? 'display:flex;' : 'display:none;'}">
            <!-- Populated dynamically -->
          </div>

          <!-- Fallback view if iframe is blocked -->
          <div class="edge-fallback-view" id="edge-fallback-${winId}" style="display:none;">
            <div class="edge-fallback-icon">🛡️</div>
            <div class="edge-fallback-title">Direct Launch Available</div>
            <div class="edge-fallback-desc">
              This external deployment can be viewed live in a high-speed direct browser tab, or you can inspect its verified GitHub source code.
            </div>
            <div style="display:flex; gap:10px;">
              <a href="${initialUrl}" target="_blank" rel="noopener noreferrer" class="edge-fallback-btn">
                <span>🚀 Launch Live App</span>
                <span>↗</span>
              </a>
              <button class="edge-fallback-btn" id="btn-copy-url-${winId}" style="background: rgba(255,255,255,0.1);">
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (isHub) {
      this.renderHub(winId, initialUrl);
    }

    this.attachEvents(winId, initialUrl, title);
  },

  isHubUrl(url) {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('github.com') || lower.includes('linkedin.com');
  },

  getEffectiveSrc(url) {
    if (!url) return 'about:blank';
    // If running on local server, route Attendance Tracker via proxy to bypass CSP/X-Frame-Options
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal && url.includes('attendance-tracker-harsh106.vercel.app')) {
      return `/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  },

  renderHub(winId, url) {
    const hub = document.getElementById(`edge-hub-${winId}`);
    if (!hub) return;

    const isLinkedIn = url.toLowerCase().includes('linkedin.com');

    if (isLinkedIn) {
      hub.innerHTML = `
        <div class="edge-hub-hero">
          <img src="assets/avatar.jpg" class="edge-hub-avatar" alt="Harsh Prasad"/>
          <div class="edge-hub-info">
            <div class="edge-hub-title">
              <span>Harsh Ranjan Prasad</span>
              <span class="edge-hub-badge">LinkedIn Verified</span>
            </div>
            <div class="edge-hub-bio">Full-Stack Developer & AI Systems Engineer · Open to Software Engineering Opportunities</div>
            <div class="edge-hub-actions">
              <a href="https://www.linkedin.com/in/harshranjanprasad/" target="_blank" rel="noopener noreferrer" class="edge-hub-btn edge-hub-btn-primary">
                <span>Connect on LinkedIn</span>
                <span>↗</span>
              </a>
              <button class="edge-hub-btn edge-hub-btn-subtle" onclick="if(window.WindowManager) window.WindowManager.open('mail');">
                <span>✉ Contact Harsh</span>
              </button>
            </div>
          </div>
        </div>

        <div class="edge-hub-section-title">
          <span>💼 Professional Highlights</span>
        </div>

        <div class="edge-hub-grid">
          <div class="edge-hub-card">
            <div class="edge-hub-card-header">
              <span class="edge-hub-card-name">AI & Computer Vision</span>
              <span class="edge-hub-card-badge">Core Focus</span>
            </div>
            <div class="edge-hub-card-desc">Experience building real-time gesture controllers, MediaPipe human-computer interaction utilities, and OCR document processors.</div>
          </div>

          <div class="edge-hub-card">
            <div class="edge-hub-card-header">
              <span class="edge-hub-card-name">Modern Full-Stack</span>
              <span class="edge-hub-card-badge">Production</span>
            </div>
            <div class="edge-hub-card-desc">React, Node.js, Vercel deployments, Firebase integrations, responsive UI engineering, and high-performance frontend systems.</div>
          </div>
        </div>
      `;
    } else {
      // GitHub Developer Portal Hub
      hub.innerHTML = `
        <div class="edge-hub-hero">
          <img src="assets/avatar.jpg" class="edge-hub-avatar" alt="Harsh Prasad"/>
          <div class="edge-hub-info">
            <div class="edge-hub-title">
              <span>Harsh Prasad (@harsh-pr)</span>
              <span class="edge-hub-badge">GitHub Profile</span>
            </div>
            <div class="edge-hub-bio">Full-Stack Engineer & AI Builder · Exploring Computer Vision, LLMs, & Modern Web</div>
            <div class="edge-hub-actions">
              <a href="https://github.com/harsh-pr" target="_blank" rel="noopener noreferrer" class="edge-hub-btn edge-hub-btn-primary">
                <span>View harsh-pr on GitHub</span>
                <span>↗</span>
              </a>
              <button class="edge-hub-btn edge-hub-btn-subtle" onclick="if(window.WindowManager) window.WindowManager.open('explorer');">
                <span>📁 Open File Explorer Projects</span>
              </button>
            </div>
          </div>
        </div>

        <div class="edge-hub-section-title">
          <span>🚀 Live Vercel Deployments & Repositories</span>
        </div>

        <div class="edge-hub-grid">
          <!-- College Attendance Tracker -->
          <div class="edge-hub-card">
            <div class="edge-hub-card-header">
              <span class="edge-hub-card-name">College Attendance Tracker</span>
              <span class="edge-hub-card-badge">Vercel Live</span>
            </div>
            <div class="edge-hub-card-desc">A smart attendance tracking app built for college students. Track subject-wise attendance and manage class timetables.</div>
            <div class="edge-hub-card-links">
              <a href="https://attendance-tracker-harsh106.vercel.app" target="_blank" rel="noopener noreferrer" class="edge-hub-btn edge-hub-btn-primary" style="padding:4px 10px; font-size:11px;">
                <span>▲ Live Vercel ↗</span>
              </a>
              <a href="https://github.com/harsh-pr/attendance-tracker" target="_blank" rel="noopener noreferrer" class="edge-hub-btn edge-hub-btn-subtle" style="padding:4px 10px; font-size:11px;">
                <span>🐙 GitHub</span>
              </a>
            </div>
          </div>

          <!-- AI Receipt Analyzer -->
          <div class="edge-hub-card">
            <div class="edge-hub-card-header">
              <span class="edge-hub-card-name">AI Receipt Analyzer</span>
              <span class="edge-hub-card-badge">Vercel Live</span>
            </div>
            <div class="edge-hub-card-desc">AI-powered receipt analyzer and bill-splitting manager with intelligent OCR extraction and itemized settlement.</div>
            <div class="edge-hub-card-links">
              <a href="https://ai-splitwise-vpp.vercel.app/auth.html" target="_blank" rel="noopener noreferrer" class="edge-hub-btn edge-hub-btn-primary" style="padding:4px 10px; font-size:11px;">
                <span>▲ Live Vercel ↗</span>
              </a>
              <a href="https://github.com/harsh-pr/ai-splitwise" target="_blank" rel="noopener noreferrer" class="edge-hub-btn edge-hub-btn-subtle" style="padding:4px 10px; font-size:11px;">
                <span>🐙 GitHub</span>
              </a>
            </div>
          </div>

          <!-- AI Hand Gesture Controller -->
          <div class="edge-hub-card">
            <div class="edge-hub-card-header">
              <span class="edge-hub-card-name">AI Hand Gesture Controller</span>
              <span class="edge-hub-card-badge">Web Simulator</span>
            </div>
            <div class="edge-hub-card-desc">Desktop utility that turns webcam into a touchless controller for Instagram Reels, YouTube Shorts, and PDFs using OpenCV & MediaPipe.</div>
            <div class="edge-hub-card-links">
              <button class="edge-hub-btn edge-hub-btn-primary" style="padding:4px 10px; font-size:11px;" onclick="EdgeApp.navigate('${winId}', 'demo/ai-gestures.html', 'AI Hand Gesture Controller')">
                <span>⚡ Run Live Simulator</span>
              </button>
              <a href="https://github.com/harsh-pr/ai-gestures" target="_blank" rel="noopener noreferrer" class="edge-hub-btn edge-hub-btn-subtle" style="padding:4px 10px; font-size:11px;">
                <span>🐙 GitHub</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }
  },

  attachEvents(winId, initialUrl, title) {
    const iframe = document.getElementById(`edge-iframe-${winId}`);
    const loader = document.getElementById(`edge-loader-${winId}`);
    const urlInput = document.getElementById(`edge-url-input-${winId}`);
    const extBtn = document.getElementById(`edge-ext-${winId}`);
    const reloadBtn = document.getElementById(`edge-reload-${winId}`);
    const fallback = document.getElementById(`edge-fallback-${winId}`);
    const copyBtn = document.getElementById(`btn-copy-url-${winId}`);
    const fsBtn = document.getElementById(`edge-fullscreen-${winId}`);
    const closeTabBtn = document.getElementById(`edge-tab-close-${winId}`);

    // Loading indicator
    if (loader) loader.classList.add('loading');

    if (iframe) {
      iframe.onload = () => {
        if (loader) loader.classList.remove('loading');
      };

      iframe.onerror = () => {
        if (loader) loader.classList.remove('loading');
        if (fallback) fallback.style.display = 'flex';
      };
    }

    if (this.isHubUrl(initialUrl) && loader) {
      loader.classList.remove('loading');
    }

    // Refresh button
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        const curUrl = urlInput ? urlInput.value : initialUrl;
        this.navigate(winId, curUrl, title);
      });
    }

    // URL input navigation
    if (urlInput) {
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          let url = urlInput.value.trim();
          if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('demo/') && !url.startsWith('index.html')) {
            url = 'https://' + url;
            urlInput.value = url;
          }
          this.navigate(winId, url, 'Edge');
        }
      });
    }

    // External Open button in Omnibox
    if (extBtn) {
      extBtn.addEventListener('click', () => {
        const url = urlInput ? urlInput.value : initialUrl;
        window.open(url, '_blank');
      });
    }

    // Copy URL
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const url = urlInput ? urlInput.value : initialUrl;
        navigator.clipboard.writeText(url);
        copyBtn.textContent = 'Copied! ✓';
        setTimeout(() => { copyBtn.textContent = 'Copy Link'; }, 2000);
      });
    }

    // Toggle window maximize/fullscreen
    if (fsBtn && window.WindowManager) {
      fsBtn.addEventListener('click', () => {
        window.WindowManager.toggleMaximize(winId);
      });
    }

    // Close Tab
    if (closeTabBtn && window.WindowManager) {
      closeTabBtn.addEventListener('click', () => {
        window.WindowManager.close(winId);
      });
    }
  },

  navigate(winId, url, title) {
    const iframe = document.getElementById(`edge-iframe-${winId}`);
    const hub = document.getElementById(`edge-hub-${winId}`);
    const urlInput = document.getElementById(`edge-url-input-${winId}`);
    const tabTitle = document.getElementById(`edge-tab-title-${winId}`);
    const loader = document.getElementById(`edge-loader-${winId}`);
    const fallback = document.getElementById(`edge-fallback-${winId}`);

    if (fallback) fallback.style.display = 'none';

    if (urlInput) urlInput.value = url;
    if (tabTitle && title) tabTitle.textContent = title;

    if (this.isHubUrl(url)) {
      if (iframe) iframe.style.display = 'none';
      if (hub) {
        hub.style.display = 'flex';
        this.renderHub(winId, url);
      }
      if (loader) loader.classList.remove('loading');
    } else {
      if (hub) hub.style.display = 'none';
      if (iframe) {
        iframe.style.display = 'block';
        if (loader) loader.classList.add('loading');
        iframe.src = this.getEffectiveSrc(url);
      }
    }
  }
};

window.EdgeApp = EdgeApp;
