/**
 * Windows 11 Mail App - Contact & Instant Messaging
 */
const MailApp = {
  inboxMessages: [
    {
      id: 'm1',
      sender: 'Tech Recruiter @ High-Growth AI',
      time: '10:42 AM',
      subject: 'Loved your AI Gesture Controller! Let\'s connect',
      preview: 'Hi Harsh, I saw your OpenCV/MediaPipe touchless controller project on GitHub and wanted to reach out...',
      body: 'Hi Harsh,\n\nI came across your GitHub profile (@harsh-pr) and was genuinely impressed by your AI Gesture Controller. Turning a standard webcam into a responsive desktop gesture controller shows great systems intuition.\n\nOur team is currently building next-generation AI workflows and would love to chat with you about open roles.\n\nCould we schedule an intro call this week?\n\nBest regards,\nEngineering Talent Team'
    },
    {
      id: 'm2',
      sender: 'GitHub Developer Community',
      time: 'Yesterday',
      subject: 'New followers on @harsh-pr',
      preview: 'Your repository attendance-tracker and ai-gestures were bookmarked by engineers...',
      body: 'Hello Harsh Prasad,\n\nDevelopers have recently bookmarked and starred your repositories. Keep up the high-impact building!'
    },
    {
      id: 'm3',
      sender: 'Product Lead @ EdTech Platform',
      time: 'Oct 1',
      subject: 'Great work on the College Attendance Tracker',
      preview: 'Loved your 75% threshold safety predictor logic and clean timetable UI...',
      body: 'Hey Harsh,\n\nSaw your Attendance Tracker project repository. The timetable organizer and safety buffer calculation for keeping students above 75% attendance is a super neat utility! Would love to chat about potential collaboration.'
    }
  ],

  sentMessages: [],

  mount(container, winId) {
    container.innerHTML = `
      <div class="mail-container">
        <!-- Sidebar Folders -->
        <div class="mail-sidebar">
          <button class="mail-new-btn" id="mail-compose-btn-${winId}">
            <span>✏️</span>
            <span>New Message</span>
          </button>

          <div class="mail-folders-list">
            <div class="mail-folder-item active" data-folder="inbox" id="folder-inbox-${winId}">
              <span>📥 Inbox</span>
              <span class="mail-unread-badge" id="inbox-badge-${winId}">${this.inboxMessages.length}</span>
            </div>
            <div class="mail-folder-item" data-folder="sent" id="folder-sent-${winId}">
              <span>📤 Sent</span>
              <span class="mail-unread-badge" id="sent-badge-${winId}" style="display:none;">0</span>
            </div>
            <div class="mail-folder-item" data-folder="starred">
              <span>⭐ Starred</span>
            </div>
          </div>
        </div>

        <!-- Middle Message List -->
        <div class="mail-list-panel" id="mail-list-panel-${winId}">
          ${this.inboxMessages.map((m, idx) => `
            <div class="mail-card-item ${idx === 0 ? 'active' : ''}" data-msg-id="${m.id}">
              <div class="mail-card-top">
                <span class="mail-sender">${m.sender}</span>
                <span class="mail-time">${m.time}</span>
              </div>
              <div class="mail-subject">${m.subject}</div>
              <div class="mail-preview">${m.preview}</div>
            </div>
          `).join('')}
        </div>

        <!-- Right Content / Compose Panel -->
        <div class="mail-body-panel" id="mail-body-panel-${winId}">
          <div class="mail-compose-header">
            <span style="font-weight:600; font-size:14px;" id="mail-panel-title-${winId}">Send a Message to Harsh</span>
            <span style="font-size:12px; color:var(--text-tertiary);">Direct Delivery</span>
          </div>

          <form class="mail-compose-form" id="mail-form-${winId}">
            <div class="mail-field-row">
              <label>To:</label>
              <input type="text" class="mail-input" value="Harsh Prasad <harsh@example.com>" readonly style="opacity:0.75;"/>
            </div>
            <div class="mail-field-row">
              <label>From:</label>
              <input type="email" class="mail-input" id="mail-sender-email-${winId}" placeholder="your.name@company.com" required/>
            </div>
            <div class="mail-field-row">
              <label>Subject:</label>
              <input type="text" class="mail-input" id="mail-subject-${winId}" placeholder="Job Opportunity / Project Collaboration / Saying Hello" required/>
            </div>
            <textarea class="mail-textarea" id="mail-body-${winId}" placeholder="Write your message here... I read every message and usually reply within 24 hours." rows="10" required></textarea>

            <div class="mail-action-bar">
              <button type="submit" class="mail-send-btn" id="mail-send-btn-${winId}">
                <span>Send ✈️</span>
              </button>
              <span style="font-size:11px; color:var(--text-tertiary);">Secured via Web API</span>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEvents(winId);
  },

  attachEvents(winId) {
    const form = document.getElementById(`mail-form-${winId}`);
    const composeBtn = document.getElementById(`mail-compose-btn-${winId}`);
    const folderInbox = document.getElementById(`folder-inbox-${winId}`);
    const folderSent = document.getElementById(`folder-sent-${winId}`);
    const listPanel = document.getElementById(`mail-list-panel-${winId}`);

    // Compose Button Click
    if (composeBtn) {
      composeBtn.addEventListener('click', () => {
        this.showComposeForm(winId);
      });
    }

    // Inbox click
    if (folderInbox) {
      folderInbox.addEventListener('click', () => {
        folderInbox.classList.add('active');
        folderSent.classList.remove('active');
        this.renderMessageList(winId, this.inboxMessages);
      });
    }

    // Sent click
    if (folderSent) {
      folderSent.addEventListener('click', () => {
        folderSent.classList.add('active');
        folderInbox.classList.remove('active');
        this.renderMessageList(winId, this.sentMessages);
      });
    }

    // Form submit
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fromEmail = document.getElementById(`mail-sender-email-${winId}`).value;
        const subject = document.getElementById(`mail-subject-${winId}`).value;
        const body = document.getElementById(`mail-body-${winId}`).value;

        const sendBtn = document.getElementById(`mail-send-btn-${winId}`);
        sendBtn.innerHTML = '<span>Sending... ⏳</span>';

        setTimeout(() => {
          sendBtn.innerHTML = '<span>Sent! ✓</span>';

          // Store in Sent messages
          this.sentMessages.unshift({
            id: 'sent-' + Date.now(),
            sender: 'To: Harsh Prasad',
            time: 'Just now',
            subject: subject,
            preview: body.slice(0, 60) + '...',
            body: body
          });

          const sentBadge = document.getElementById(`sent-badge-${winId}`);
          if (sentBadge) {
            sentBadge.style.display = 'inline-block';
            sentBadge.textContent = this.sentMessages.length;
          }

          // Trigger Windows Toast Notification
          if (window.Notifications) {
            window.Notifications.show({
              title: 'Email Sent Successfully',
              message: `Your message "${subject}" has been queued. Harsh Prasad will get back to ${fromEmail} shortly.`,
              icon: '📧',
              appName: 'Outlook Mail',
              duration: 5000
            });
          }

          // Reset form
          form.reset();
          setTimeout(() => {
            sendBtn.innerHTML = '<span>Send ✈️</span>';
          }, 2000);
        }, 700);
      });
    }

    // Message item click to read
    this.attachMessageClicks(winId, this.inboxMessages);
  },

  renderMessageList(winId, messages) {
    const listPanel = document.getElementById(`mail-list-panel-${winId}`);
    if (!listPanel) return;

    if (messages.length === 0) {
      listPanel.innerHTML = `
        <div style="padding:24px; text-align:center; color:var(--text-tertiary); font-size:12px;">
          No messages in this folder yet.
        </div>
      `;
      return;
    }

    listPanel.innerHTML = messages.map((m, idx) => `
      <div class="mail-card-item ${idx === 0 ? 'active' : ''}" data-msg-id="${m.id}">
        <div class="mail-card-top">
          <span class="mail-sender">${m.sender}</span>
          <span class="mail-time">${m.time}</span>
        </div>
        <div class="mail-subject">${m.subject}</div>
        <div class="mail-preview">${m.preview}</div>
      </div>
    `).join('');

    this.attachMessageClicks(winId, messages);
    this.displayMessageDetail(winId, messages[0]);
  },

  attachMessageClicks(winId, messages) {
    const items = document.querySelectorAll(`#mail-list-panel-${winId} .mail-card-item`);
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const id = item.dataset.msgId;
        const msg = messages.find(m => m.id === id);
        if (msg) this.displayMessageDetail(winId, msg);
      });
    });
  },

  displayMessageDetail(winId, msg) {
    const bodyPanel = document.getElementById(`mail-body-panel-${winId}`);
    if (!bodyPanel || !msg) return;

    bodyPanel.innerHTML = `
      <div class="mail-compose-header">
        <div style="display:flex; flex-direction:column; gap:2px;">
          <span style="font-weight:600; font-size:15px; color:#ffffff;">${msg.subject}</span>
          <span style="font-size:12px; color:var(--text-secondary);">${msg.sender} · ${msg.time}</span>
        </div>
        <button class="mail-new-btn" id="btn-reply-${winId}">Reply ↩</button>
      </div>
      <div style="flex:1; padding:24px; overflow-y:auto; line-height:1.6; font-size:13px; color:rgba(255,255,255,0.9); white-space:pre-wrap;">${msg.body}</div>
    `;

    const replyBtn = document.getElementById(`btn-reply-${winId}`);
    if (replyBtn) {
      replyBtn.addEventListener('click', () => {
        this.showComposeForm(winId, `Re: ${msg.subject}`);
      });
    }
  },

  showComposeForm(winId, defaultSubject = '') {
    const bodyPanel = document.getElementById(`mail-body-panel-${winId}`);
    if (!bodyPanel) return;

    bodyPanel.innerHTML = `
      <div class="mail-compose-header">
        <span style="font-weight:600; font-size:14px;">Send a Message to Harsh</span>
        <span style="font-size:12px; color:var(--text-tertiary);">Direct Delivery</span>
      </div>

      <form class="mail-compose-form" id="mail-form-${winId}">
        <div class="mail-field-row">
          <label>To:</label>
          <input type="text" class="mail-input" value="Harsh Prasad <harsh@example.com>" readonly style="opacity:0.75;"/>
        </div>
        <div class="mail-field-row">
          <label>From:</label>
          <input type="email" class="mail-input" id="mail-sender-email-${winId}" placeholder="your.name@company.com" required/>
        </div>
        <div class="mail-field-row">
          <label>Subject:</label>
          <input type="text" class="mail-input" id="mail-subject-${winId}" value="${defaultSubject}" placeholder="Job Opportunity / Project Collaboration / Saying Hello" required/>
        </div>
        <textarea class="mail-textarea" id="mail-body-${winId}" placeholder="Write your message here... I read every message and usually reply within 24 hours." rows="10" required></textarea>

        <div class="mail-action-bar">
          <button type="submit" class="mail-send-btn" id="mail-send-btn-${winId}">
            <span>Send ✈️</span>
          </button>
          <span style="font-size:11px; color:var(--text-tertiary);">Secured via Web API</span>
        </div>
      </form>
    `;

    this.attachEvents(winId);
  }
};

window.MailApp = MailApp;
