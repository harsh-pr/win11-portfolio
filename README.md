# 🖥️ Windows 11 Interactive OS Portfolio — Harsh Prasad

An exact, pixel-perfect simulation of **Windows 11** built as a personal developer portfolio for **Harsh Prasad** ([@harsh-pr](https://github.com/harsh-pr) | [LinkedIn](https://www.linkedin.com/in/harshranjanprasad/)).

---

## ✨ Features

- **Harsh Prasad's Real Projects (Embedded In-Website):**
  - **AI Hand Gesture Controller:** Python, OpenCV & MediaPipe touchless desktop utility for Instagram Reels, YouTube Shorts, and PDFs.
  - **College Attendance Tracker:** Subject-wise calculation and timetable safety predictor ensuring students stay above 75%.
  - **AI Splitwise Receipt Analyzer:** OCR parsing and automated itemized expense settlement.
  - **Windows 11 OS Simulator:** High-fidelity interactive desktop experience with live canvas CPU performance graphs.

- **Embedded Project Viewer (The Core Feature):**
  - **File Explorer:** Browse projects with search and category filtering.
  - **Microsoft Edge Browser Window:** Clicking any project opens it directly inside an embedded Microsoft Edge browser window within the desktop—**no external redirect required**.
  - Intelligent fallback view if external sites restrict cross-origin iframe embedding.

- **Windows 11 Apps Included:**
  - **Settings (`About Me`):** Harsh Prasad's bio, developer specifications, experience timeline, and verified social links.
  - **Task Manager (`Skills`):** Live animated green CPU-style ECG canvas graph with fluctuating utilization and architecture stats.
  - **Outlook Mail (`Contact`):** Folders (Inbox, Sent), sample outreach emails, interactive compose form with instant confirmation toast notifications.
  - **Windows Terminal (`CLI`):** Interactive PowerShell console with commands (`help`, `about`, `skills`, `projects`, `contact`, `github`, `linkedin`, `hire`, `matrix`, `date`, `clear`).
  - **Notepad (`Resume.txt`):** Text editor with Harsh Prasad's full resume text, line and character counter.

---

## 🚀 Running Locally

```bash
node server.js
```
Then visit **`http://localhost:3000`** in your browser.

---

## 🌐 Free Hosting & Custom Domain (`harsh-pr.is-a.dev`)

### Step 1: Push to GitHub
1. Create a repository under your GitHub account (`https://github.com/harsh-pr/portfolio`).
2. Push this folder to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Harsh Prasad Windows 11 portfolio"
   git branch -M main
   git remote add origin https://github.com/harsh-pr/portfolio.git
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages (Free)
1. Go to your repository on GitHub: `https://github.com/harsh-pr/portfolio`.
2. Navigate to **Settings** → **Pages**.
3. Under **Branch**, select `main` and root `/`, then click **Save**.
4. Your site will be live at `https://harsh-pr.github.io/portfolio/`.

### Step 3: Get your free `harsh-pr.is-a.dev` Domain
1. Fork [is-a-dev/register](https://github.com/is-a-dev/register).
2. Add a file named `domains/harsh-pr.json`:
   ```json
   {
     "description": "Harsh Prasad's Developer Portfolio",
     "repo": "https://github.com/harsh-pr/portfolio",
     "owner": {
       "username": "harsh-pr",
       "email": "your-email@example.com"
     },
     "record": {
       "CNAME": "harsh-pr.github.io"
     }
   }
   ```
3. Open a Pull Request. Once approved, your portfolio will be accessible at:
   **`https://harsh-pr.is-a.dev`**
