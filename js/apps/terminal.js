/**
 * Windows 11 Terminal App
 * Interactive developer CLI
 */
const TerminalApp = {
  mount(container, winId) {
    container.innerHTML = `
      <div class="term-container">
        <div class="term-tab-bar">
          <div class="term-tab">
            <span>>_</span>
            <span>PowerShell 7.5 (HarshPrasad-Dev)</span>
          </div>
        </div>
        <div class="term-body" id="term-body-${winId}">
          <div class="term-output accent">Windows PowerShell Developer Edition [Version 11.0.26100.1882]</div>
          <div class="term-output">Type <span style="color:#00D26A;">'help'</span> to view available commands. Type <span style="color:#60C1FF;">'projects'</span> or <span style="color:#60C1FF;">'skills'</span> to inspect Harsh Prasad's technical work.</div>
          <div style="height:8px;"></div>
          <div id="term-history-${winId}"></div>
          <div class="term-prompt-line">
            <span class="term-prompt-path">PS C:\\Users\\HarshPrasad></span>
            <input type="text" class="term-input" id="term-input-${winId}" autocomplete="off" spellcheck="false"/>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(winId);
  },

  attachEvents(winId) {
    const input = document.getElementById(`term-input-${winId}`);
    const history = document.getElementById(`term-history-${winId}`);
    const body = document.getElementById(`term-body-${winId}`);

    if (!input) return;
    setTimeout(() => input.focus(), 100);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        input.value = '';

        // Print command in history
        const line = document.createElement('div');
        line.className = 'term-prompt-line';
        line.innerHTML = `<span class="term-prompt-path">PS C:\\Users\\HarshPrasad></span> <span>${cmd}</span>`;
        history.appendChild(line);

        // Process Command
        const res = this.execute(cmd);
        if (res) {
          const out = document.createElement('div');
          out.className = `term-output ${res.className || ''}`;
          out.innerHTML = res.text;
          history.appendChild(out);
        }

        if (cmd.toLowerCase() === 'clear' || cmd.toLowerCase() === 'cls') {
          history.innerHTML = '';
        }

        body.scrollTop = body.scrollHeight;
      }
    });
  },

  execute(cmd) {
    const c = cmd.toLowerCase().trim();

    if (!c) return null;

    if (c === 'help') {
      return {
        text: `Available Commands:
  <span style="color:#60C1FF;">about</span>      - Print Harsh Prasad's background and engineering focus
  <span style="color:#60C1FF;">skills</span>     - View top technical proficiencies & launch Task Manager
  <span style="color:#60C1FF;">projects</span>   - List featured projects & launch File Explorer
  <span style="color:#60C1FF;">systeminfo</span> - Display detailed host device & environment specifications
  <span style="color:#60C1FF;">date</span>       - Print current local device date
  <span style="color:#60C1FF;">time</span>       - Print current local device time & timezone
  <span style="color:#60C1FF;">hostname</span>   - Print current workstation name
  <span style="color:#60C1FF;">contact</span>    - Show contact details & launch Outlook Mail
  <span style="color:#60C1FF;">github</span>     - Visit github.com/harsh-pr
  <span style="color:#60C1FF;">linkedin</span>   - Visit linkedin.com/in/harshranjanprasad
  <span style="color:#60C1FF;">hire</span>       - Express hiring intent & open communication
  <span style="color:#60C1FF;">matrix</span>     - Toggle matrix rain visual easter egg
  <span style="color:#60C1FF;">whoami</span>     - Print current signed-in user
  <span style="color:#60C1FF;">ver</span>        - Print operating system build version
  <span style="color:#60C1FF;">clear</span>      - Clear terminal screen buffer`
      };
    }

    if (c === 'about') {
      if (window.WindowManager) window.WindowManager.open('settings');
      return {
        className: 'accent',
        text: `Harsh Prasad (@harsh-pr) - Software Engineer & AI Builder based in Mumbai, India.
Specializes in Computer Vision desktop utilities (OpenCV, MediaPipe), full-stack Python & JavaScript, and responsive modern web tools.
Opening Settings app for full background...`
      };
    }

    if (c === 'skills') {
      if (window.WindowManager) window.WindowManager.open('taskmanager');
      return {
        className: 'success',
        text: `Primary Tech Stack:
- Python (OpenCV, MediaPipe, PyAutoGUI)
- JavaScript, TypeScript, HTML5, Modern CSS
- React, Node.js, Express, REST APIs
- SQLite, LocalStorage, WebSockets
- Windows API, Git, GitHub Actions
Opening Task Manager for live performance graphs...`
      };
    }

    if (c === 'projects') {
      if (window.WindowManager) window.WindowManager.open('explorer');
      return {
        className: 'accent',
        text: `Featured Projects:
1. AI Hand Gesture Controller for Windows (github.com/harsh-pr/ai-gestures)
2. College Attendance Tracker (github.com/harsh-pr/attendance-tracker)
3. AI-Splitwise Receipt Analyzer (github.com/harsh-pr/ai-splitwise)
4. Windows 11 OS Portfolio Simulator
Opening File Explorer...`
      };
    }

    if (c === 'github') {
      window.open('https://github.com/harsh-pr', '_blank');
      return {
        className: 'accent',
        text: `Opening https://github.com/harsh-pr in a new tab...`
      };
    }

    if (c === 'linkedin') {
      window.open('https://www.linkedin.com/in/harshranjanprasad/', '_blank');
      return {
        className: 'accent',
        text: `Opening https://www.linkedin.com/in/harshranjanprasad/ in a new tab...`
      };
    }

    if (c === 'contact') {
      if (window.WindowManager) window.WindowManager.open('mail');
      return {
        className: 'accent',
        text: `Contact Info:
- GitHub: https://github.com/harsh-pr
- LinkedIn: https://www.linkedin.com/in/harshranjanprasad/
- Location: Mumbai, India
Opening Outlook Mail...`
      };
    }

    if (c === 'hire') {
      if (window.Notifications) {
        window.Notifications.show({
          title: 'Candidate Selected! 🚀',
          message: 'Thank you! Redirecting to instant message dispatch.',
          icon: '💼',
          duration: 4000
        });
      }
      if (window.WindowManager) window.WindowManager.open('mail');
      return {
        className: 'success',
        text: `🎉 Congratulations! Initiating priority contact sequence with Harsh...`
      };
    }

    if (c === 'sudo') {
      return {
        className: 'accent',
        text: `User already has root permissions to explore this portfolio and schedule interviews.`
      };
    }

    if (c === 'matrix') {
      return {
        className: 'success',
        text: `Wake up, Neo... Follow the white rabbit 🐇. Press Konami code [↑ ↑ ↓ ↓ ← → ← → B A] on your keyboard for full matrix mode!`
      };
    }

    if (c === 'date') {
      const now = new Date();
      return {
        className: 'accent',
        text: `The current date is: ${now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
      };
    }

    if (c === 'time') {
      const now = new Date();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      return {
        className: 'accent',
        text: `The current time is: ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })} (${tz})`
      };
    }

    if (c === 'hostname') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'WIN11';
      const tzCode = tz.split('/').pop().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'WIN11';
      const cores = navigator.hardwareConcurrency || 8;
      return {
        className: 'accent',
        text: `DESKTOP-${tzCode}${cores}`
      };
    }

    if (c === 'whoami') {
      return {
        className: 'accent',
        text: `harsh-prasad\\guest-explorer`
      };
    }

    if (c === 'ver') {
      return {
        text: `Microsoft Windows [Version 11.0.26100.1882]`
      };
    }

    if (c === 'systeminfo' || c === 'specs' || c === 'info') {
      const now = new Date();
      const cores = navigator.hardwareConcurrency || 8;
      const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '16.0 GB (Hardware Memory)';
      const screenRes = `${window.screen.width} × ${window.screen.height}`;
      const scaling = window.devicePixelRatio ? `${window.devicePixelRatio}x` : '1x';
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const offsetMin = -now.getTimezoneOffset();
      const sign = offsetMin >= 0 ? '+' : '-';
      const absMin = Math.abs(offsetMin);
      const tzOffset = `UTC${sign}${String(Math.floor(absMin / 60)).padStart(2, '0')}:${String(absMin % 60).padStart(2, '0')}`;
      const tzCode = tz.split('/').pop().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'WIN11';
      const hostName = `DESKTOP-${tzCode}${cores}`;

      return {
        text: `<pre style="font-family:inherit; margin:0; line-height:1.45;">Host Name:                 ${hostName}
OS Name:                   Microsoft Windows 11 Portfolio Edition
OS Version:                10.0.26100 N/A Build 26100
System Manufacturer:       Client Host Machine
System Type:               x64-based PC
Processor(s):              [01]: ~${cores} Logical Processor Cores
Total Physical Memory:     ${ram}
Display Resolution:        ${screenRes} (${scaling} Scaling, ${window.screen.colorDepth}-bit)
Time Zone:                 ${tz} (${tzOffset})
System Locale:             ${navigator.language || 'en-US'}
Network Connection:        ${navigator.onLine ? 'Connected (Online)' : 'Offline'}
Current Local Time:        ${now.toLocaleTimeString()} (${now.toLocaleDateString()})</pre>`
      };
    }

    return {
      text: `'${cmd}' is not recognized as an internal or external command. Type 'help' for guidance.`
    };
  }
};

window.TerminalApp = TerminalApp;
