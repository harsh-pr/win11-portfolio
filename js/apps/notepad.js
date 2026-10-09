/**
 * Windows 11 Notepad App
 */
const NotepadApp = {
  mount(container, winId, options = {}) {
    const resumeText = options.content !== undefined ? options.content : `=====================================================
HARSH PRASAD - SOFTWARE ENGINEER & AI BUILDER
Location: Mumbai, India | Remote Available Worldwide
GitHub: https://github.com/harsh-pr
LinkedIn: https://www.linkedin.com/in/harshranjanprasad/
=====================================================

[SUMMARY]
Pragmatic software engineer with hands-on experience developing
computer vision desktop systems, distributed assistant architectures,
and modern interactive web applications. Passionate about AI-driven
automation and high-performance user interfaces.

[CORE COMPETENCIES]
- Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3
- AI & Vision: OpenCV, MediaPipe, WebSockets, Local-first AI
- Backend & Systems: FastAPI, Node.js, Express, SQLite (WAL Mode), Redis
- Frontend: React, Next.js, Modern CSS Mica / Glassmorphism, Canvas API
- Tools & OS: Windows API / PyAutoGUI, Git, GitHub Actions, Docker

[FEATURED PROJECTS]
1. AI Hand Gesture Controller for Windows
   - GitHub: https://github.com/harsh-pr/ai-gestures
   - Touchless desktop utility using webcam and computer vision to control
     Instagram Reels, YouTube Shorts, and PDF documents.
   - Built custom palm scroll, multi-finger swipe, and zoom detection.

2. College Attendance Tracker
   - GitHub: https://github.com/harsh-pr/attendance-tracker
   - Subject-wise attendance calculation, timetable organizer, and
     predictive safety alerts ensuring students stay above 75%.

3. AI-Splitwise Receipt Analyzer
   - GitHub: https://github.com/harsh-pr/ai-splitwise
   - Intelligent OCR receipt parser and automated expense settlement.

=====================================================
(Tip: Feel free to edit this file or explore the apps on Desktop!)
=====================================================`;

    container.innerHTML = `
      <div class="notepad-container">
        <div class="notepad-menu-bar">
          <span class="notepad-menu-item">File</span>
          <span class="notepad-menu-item">Edit</span>
          <span class="notepad-menu-item">View</span>
          <span class="notepad-menu-item">Help</span>
        </div>
        <textarea class="notepad-textarea" id="notepad-text-${winId}" spellcheck="false">${resumeText}</textarea>
        <div class="notepad-statusbar">
          <span id="notepad-lines-${winId}">Lines: ${resumeText.split('\n').length}, Characters: ${resumeText.length}</span>
          <span>UTF-8</span>
          <span>Windows (CRLF)</span>
        </div>
      </div>
    `;

    const textarea = document.getElementById(`notepad-text-${winId}`);
    const status = document.getElementById(`notepad-lines-${winId}`);
    if (textarea && status) {
      textarea.addEventListener('input', () => {
        const text = textarea.value;
        const lines = text.split('\n').length;
        status.textContent = `Lines: ${lines}, Characters: ${text.length}`;
      });
    }
  }
};

window.NotepadApp = NotepadApp;
