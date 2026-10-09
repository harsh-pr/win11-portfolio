/**
 * Windows 11 Microsoft Store App
 * Showcase for Harsh Prasad's developer applications, tools, and GitHub repositories
 */
const StoreApp = {
  mount(container, winId) {
    container.innerHTML = `
      <div class="store-container">
        <!-- Store Sidebar -->
        <div class="store-sidebar">
          <div class="store-sidebar-top">
            <div class="store-nav-item active" data-tab="home">
              <span class="store-nav-icon">🏠</span>
              <span>Home</span>
            </div>
            <div class="store-nav-item" data-tab="apps">
              <span class="store-nav-icon">📦</span>
              <span>Apps</span>
            </div>
            <div class="store-nav-item" data-tab="dev">
              <span class="store-nav-icon">💻</span>
              <span>Developer Tools</span>
            </div>
          </div>
          <div class="store-sidebar-bottom">
            <div class="store-nav-item" id="store-lib-${winId}">
              <span class="store-nav-icon">📚</span>
              <span>Library</span>
            </div>
          </div>
        </div>

        <!-- Store Main Content -->
        <div class="store-content">
          <!-- Spotlight Banner -->
          <div class="store-hero-banner">
            <div class="store-hero-content">
              <span class="store-hero-badge">FEATURED APP OF THE DAY</span>
              <h1 class="store-hero-title">AI Hand Gesture Controller</h1>
              <p class="store-hero-desc">Touchless gesture control for Windows 11. Navigate Instagram Reels, YouTube Shorts, and PDF documents using computer vision and standard webcams.</p>
              <div class="store-hero-actions">
                <button class="store-btn primary" id="store-open-gestures-${winId}">
                  <span>Open App</span>
                </button>
                <a href="https://github.com/harsh-pr/ai-gestures" target="_blank" class="store-btn secondary">
                  <span>View Repository ↗</span>
                </a>
              </div>
            </div>
            <div class="store-hero-badge-pill">
              <span>⭐ 4.9 (1.2k Reviews)</span>
              <span>· Free</span>
            </div>
          </div>

          <!-- Featured Apps Row -->
          <div class="store-section-title">Essential Developer Apps & Projects</div>
          <div class="store-app-grid">
            <!-- App Card 1 -->
            <div class="store-card" id="card-attendance-${winId}">
              <div class="store-card-icon-wrap" style="background: rgba(0, 120, 212, 0.15);">
                <img src="assets/icons/folder.png" alt="Attendance"/>
              </div>
              <div class="store-card-info">
                <div class="store-card-title">College Attendance Tracker</div>
                <div class="store-card-cat">Education & Utilities · Harsh Prasad</div>
                <div class="store-card-rating">★★★★★ 4.8 · Free</div>
              </div>
              <button class="store-card-btn" id="btn-card-att-${winId}">Get</button>
            </div>

            <!-- App Card 2 -->
            <div class="store-card" id="card-splitwise-${winId}">
              <div class="store-card-icon-wrap" style="background: rgba(16, 124, 65, 0.15);">
                <img src="assets/icons/folder.png" alt="Splitwise AI"/>
              </div>
              <div class="store-card-info">
                <div class="store-card-title">AI Receipt Analyzer (Splitwise)</div>
                <div class="store-card-cat">Finance & OCR · Harsh Prasad</div>
                <div class="store-card-rating">★★★★★ 4.9 · Free</div>
              </div>
              <button class="store-card-btn" id="btn-card-split-${winId}">Get</button>
            </div>

            <!-- App Card 3 -->
            <div class="store-card" id="card-terminal-${winId}">
              <div class="store-card-icon-wrap" style="background: rgba(0, 0, 0, 0.3);">
                <img src="assets/icons/terminal.png" alt="Terminal"/>
              </div>
              <div class="store-card-info">
                <div class="store-card-title">Windows Terminal (PowerShell 7)</div>
                <div class="store-card-cat">Developer Tools · Microsoft</div>
                <div class="store-card-rating">★★★★★ 5.0 · Installed</div>
              </div>
              <button class="store-card-btn open" id="btn-card-term-${winId}">Open</button>
            </div>

            <!-- App Card 4 -->
            <div class="store-card" id="card-edge-${winId}">
              <div class="store-card-icon-wrap" style="background: rgba(0, 120, 212, 0.12);">
                <img src="assets/icons/edge.png" alt="Edge"/>
              </div>
              <div class="store-card-info">
                <div class="store-card-title">Microsoft Edge Browser</div>
                <div class="store-card-cat">Productivity & Web · Microsoft</div>
                <div class="store-card-rating">★★★★★ 4.9 · Installed</div>
              </div>
              <button class="store-card-btn open" id="btn-card-edge-${winId}">Open</button>
            </div>

            <!-- App Card 5 -->
            <div class="store-card" id="card-resume-${winId}">
              <div class="store-card-icon-wrap" style="background: rgba(255, 255, 255, 0.08);">
                <img src="assets/icons/notepad.png" alt="Resume"/>
              </div>
              <div class="store-card-info">
                <div class="store-card-title">Harsh Prasad Resume & Profile</div>
                <div class="store-card-cat">Career & Experience · Harsh Prasad</div>
                <div class="store-card-rating">★★★★★ 5.0 · Free</div>
              </div>
              <button class="store-card-btn" id="btn-card-res-${winId}">Get</button>
            </div>

            <!-- App Card 6 -->
            <div class="store-card" id="card-explorer-${winId}">
              <div class="store-card-icon-wrap" style="background: rgba(255, 185, 0, 0.15);">
                <img src="assets/icons/explorer.png" alt="Explorer"/>
              </div>
              <div class="store-card-info">
                <div class="store-card-title">File Explorer (My Projects)</div>
                <div class="store-card-cat">System & Navigation · Windows</div>
                <div class="store-card-rating">★★★★★ 4.9 · Installed</div>
              </div>
              <button class="store-card-btn open" id="btn-card-exp-${winId}">Open</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(winId);
  },

  attachEvents(winId) {
    const btnGestures = document.getElementById(`store-open-gestures-${winId}`);
    if (btnGestures) {
      btnGestures.addEventListener('click', () => {
        if (window.WindowManager) window.WindowManager.open('explorer');
      });
    }

    const btnAtt = document.getElementById(`btn-card-att-${winId}`);
    if (btnAtt) {
      btnAtt.addEventListener('click', () => {
        if (window.WindowManager) {
          window.WindowManager.open('edge', {
            url: 'https://attendance-tracker-harsh106.vercel.app',
            title: 'College Attendance Tracker'
          });
        }
      });
    }

    const btnSplit = document.getElementById(`btn-card-split-${winId}`);
    if (btnSplit) {
      btnSplit.addEventListener('click', () => {
        if (window.WindowManager) {
          window.WindowManager.open('edge', {
            url: 'https://ai-splitwise-vpp.vercel.app/auth.html',
            title: 'AI Receipt Analyzer'
          });
        }
      });
    }

    const btnTerm = document.getElementById(`btn-card-term-${winId}`);
    if (btnTerm) {
      btnTerm.addEventListener('click', () => {
        if (window.WindowManager) window.WindowManager.open('terminal');
      });
    }

    const btnEdge = document.getElementById(`btn-card-edge-${winId}`);
    if (btnEdge) {
      btnEdge.addEventListener('click', () => {
        if (window.WindowManager) window.WindowManager.open('edge');
      });
    }

    const btnRes = document.getElementById(`btn-card-res-${winId}`);
    if (btnRes) {
      btnRes.addEventListener('click', () => {
        if (window.WindowManager) window.WindowManager.open('notepad');
      });
    }

    const btnExp = document.getElementById(`btn-card-exp-${winId}`);
    if (btnExp) {
      btnExp.addEventListener('click', () => {
        if (window.WindowManager) window.WindowManager.open('explorer');
      });
    }
  }
};

window.StoreApp = StoreApp;
