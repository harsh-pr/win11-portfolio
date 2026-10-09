/**
 * Windows 11 Task Manager App - Skills & System Performance
 */
const TaskManagerApp = {
  skills: [
    {
      id: 'cv-ai',
      name: 'Computer Vision & MediaPipe',
      category: 'Perception Engine',
      utilization: 96,
      speed: '60 FPS Real-Time',
      cores: 'OpenCV & MediaPipe',
      threads: 'Webcam Tracking',
      uptime: 'Active Dev'
    },
    {
      id: 'py-fastapi',
      name: 'Python & FastAPI',
      category: 'Backend & Systems',
      utilization: 94,
      speed: 'Asynchronous I/O',
      cores: 'FastAPI & SQLite WAL',
      threads: 'Distributed Services',
      uptime: 'Production'
    },
    {
      id: 'js-ts',
      name: 'JavaScript & Web Dev',
      category: 'Modern Web Stack',
      utilization: 92,
      speed: 'V8 Optimized',
      cores: 'ESNext & DOM APIs',
      threads: 'PWA & Client UI',
      uptime: 'Active Dev'
    },
    {
      id: 'ai-agents',
      name: 'Generative AI & LLMs',
      category: 'Autonomous Systems',
      utilization: 95,
      speed: 'Low Latency',
      cores: 'Vector Embeddings',
      threads: 'AI Prompt Engineering',
      uptime: 'Active'
    },
    {
      id: 'db-storage',
      name: 'SQLite (WAL) & Databases',
      category: 'Data Persistence',
      utilization: 88,
      speed: 'Zero-Latency Reads',
      cores: 'WAL Mode Logging',
      threads: 'Replication Sync',
      uptime: 'Tested'
    },
    {
      id: 'cloud-tools',
      name: 'Git, Windows API & Tools',
      category: 'Developer Environment',
      utilization: 90,
      speed: 'Automated Scripts',
      cores: 'PyAutoGUI & Shell',
      threads: 'CI/CD Pipelines',
      uptime: 'Continuous'
    }
  ],

  activeSkill: null,
  canvasInterval: null,

  mount(container, winId) {
    this.activeSkill = this.skills[0];

    container.innerHTML = `
      <div class="tm-container">
        <!-- Header Tabs -->
        <div class="tm-header-tabs">
          <div class="tm-tab-btn" data-tab="processes">Processes</div>
          <div class="tm-tab-btn active" data-tab="perf">Performance</div>
          <div class="tm-tab-btn" data-tab="history">App History</div>
          <div class="tm-tab-btn" data-tab="users">Users</div>
        </div>

        <!-- Performance Tab Content -->
        <div class="tm-perf-view" id="tm-view-perf-${winId}">
          <!-- Left Nav -->
          <div class="tm-perf-nav">
            ${this.skills.map((s, idx) => `
              <div class="tm-perf-item ${idx === 0 ? 'active' : ''}" data-skill-id="${s.id}">
                <div class="tm-item-info">
                  <span class="tm-item-name">${s.name}</span>
                  <span class="tm-item-sub">${s.category}</span>
                </div>
                <div class="tm-item-gauge" id="gauge-${s.id}-${winId}">${s.utilization}%</div>
              </div>
            `).join('')}
          </div>

          <!-- Right Content -->
          <div class="tm-perf-content">
            <div class="tm-perf-header">
              <span class="tm-perf-title" id="tm-perf-title-${winId}">${this.activeSkill.name}</span>
              <span class="tm-perf-util" id="tm-perf-util-${winId}">${this.activeSkill.utilization}% Utilization</span>
            </div>

            <!-- Canvas Animated Graph -->
            <div class="tm-graph-card">
              <canvas class="tm-canvas" id="tm-canvas-${winId}" width="600" height="180"></canvas>
            </div>

            <!-- Stats Grid -->
            <div class="tm-stats-grid">
              <div class="tm-stat-box">
                <span class="tm-stat-label">Architecture</span>
                <span class="tm-stat-value" id="stat-cores-${winId}">${this.activeSkill.cores}</span>
              </div>
              <div class="tm-stat-box">
                <span class="tm-stat-label">Execution Speed</span>
                <span class="tm-stat-value" id="stat-speed-${winId}">${this.activeSkill.speed}</span>
              </div>
              <div class="tm-stat-box">
                <span class="tm-stat-label">Concurrency</span>
                <span class="tm-stat-value" id="stat-threads-${winId}">${this.activeSkill.threads}</span>
              </div>
              <div class="tm-stat-box">
                <span class="tm-stat-label">Active Experience</span>
                <span class="tm-stat-value" id="stat-uptime-${winId}">${this.activeSkill.uptime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.startCanvasGraph(winId);
    this.attachEvents(winId);
  },

  startCanvasGraph(winId) {
    const canvas = document.getElementById(`tm-canvas-${winId}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const points = [];
    const maxPoints = 50;
    for (let i = 0; i < maxPoints; i++) {
      points.push(this.activeSkill.utilization + (Math.random() * 8 - 4));
    }

    if (this.canvasInterval) clearInterval(this.canvasInterval);

    this.canvasInterval = setInterval(() => {
      if (!document.getElementById(`tm-canvas-${winId}`)) {
        clearInterval(this.canvasInterval);
        return;
      }

      // Add new fluctuating point
      const base = this.activeSkill.utilization;
      const variation = (Math.random() * 6 - 3);
      const currentVal = Math.min(100, Math.max(70, Math.round(base + variation)));
      points.push(currentVal);
      if (points.length > maxPoints) points.shift();

      // Update current text gauge
      const gaugeEl = document.getElementById(`gauge-${this.activeSkill.id}-${winId}`);
      if (gaugeEl) gaugeEl.textContent = `${currentVal}%`;
      const utilEl = document.getElementById(`tm-perf-util-${winId}`);
      if (utilEl) utilEl.textContent = `${currentVal}% Utilization`;

      // Render Canvas
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw Grid lines
      ctx.strokeStyle = 'rgba(0, 210, 106, 0.12)';
      ctx.lineWidth = 1;

      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Draw Green Line Graph
      ctx.strokeStyle = '#00D26A';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const step = w / (maxPoints - 1);
      points.forEach((val, i) => {
        const x = i * step;
        const y = h - (val / 100) * (h - 20) - 10;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Semi-transparent gradient fill underneath
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(0, 210, 106, 0.25)');
      grad.addColorStop(1, 'rgba(0, 210, 106, 0.01)');
      ctx.fillStyle = grad;
      ctx.fill();
    }, 200);
  },

  attachEvents(winId) {
    const items = document.querySelectorAll(`#content-${winId} .tm-perf-item`);
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const sId = item.dataset.skillId;
        this.activeSkill = this.skills.find(s => s.id === sId) || this.skills[0];

        const title = document.getElementById(`tm-perf-title-${winId}`);
        const cores = document.getElementById(`stat-cores-${winId}`);
        const speed = document.getElementById(`stat-speed-${winId}`);
        const threads = document.getElementById(`stat-threads-${winId}`);
        const uptime = document.getElementById(`stat-uptime-${winId}`);

        if (title) title.textContent = this.activeSkill.name;
        if (cores) cores.textContent = this.activeSkill.cores;
        if (speed) speed.textContent = this.activeSkill.speed;
        if (threads) threads.textContent = this.activeSkill.threads;
        if (uptime) uptime.textContent = this.activeSkill.uptime;
      });
    });
  }
};

window.TaskManagerApp = TaskManagerApp;
