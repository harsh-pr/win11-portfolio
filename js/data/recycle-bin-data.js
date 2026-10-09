/**
 * Windows 11 Portfolio - Recycle Bin Data
 * Contains ONLY the 6 files explicitly requested by the user.
 */

const RecycleBinData = [
  {
    name: 'mumbai_local_rush_hour_strategy.txt',
    origLocation: 'C:\\Commute\\Kurla_Station',
    dateDeleted: '03-10-2026 05:45 PM',
    size: '12 KB',
    sizeBytes: 12288,
    type: 'Text Document',
    dateModified: '03-10-2026 05:30 PM',
    icon: 'assets/icons/notepad.png',
    action: 'notepad',
    content: `MUMBAI LOCAL RUSH HOUR SURVIVAL STRATEGY (CENTRAL LINE)
======================================================
1. Never stand on footboard with laptop bag dangling.
2. Always board running train from pole with momentum.
3. 5 PM and still in college? Get ready to fight for boarding the train.
4. Kurla platform change in 2 minutes is mathematically impossible.
5. If the crowd pushes you in, do not resist. You are going to Thane now.`
  },
  {
    name: 'top_secret_startup_ideas.txt',
    origLocation: 'C:\\Users\\harsh\\Desktop',
    dateDeleted: '03-10-2026 01:10 PM',
    size: '1 KB',
    sizeBytes: 1024,
    type: 'Text Document',
    dateModified: '03-10-2026 01:05 PM',
    icon: 'assets/icons/notepad.png',
    action: 'notepad',
    content: `TOP SECRET STARTUP IDEAS (CONFIDENTIAL)
========================================
1. Uber for dogs, but with AI blockchain and decentralized biscuits.
2. Smart laptop that automatically slams itself shut when you stare blankly at code for 10 minutes.
3. Zomato delivery drone that drops piping hot samosas and cutting chai directly through classroom windows during 3 PM lectures.
4. AI proxy attendance bot with facial disguise. (Discarded: Ethical & Mumbai Uni defaulter scrutiny).`
  },
  {
    name: 'bugs_that_fixed_themselves.log',
    origLocation: 'C:\\AttendanceTracker\\src',
    dateDeleted: '02-10-2026 03:15 PM',
    size: '0 KB',
    sizeBytes: 0,
    type: 'Text Document',
    dateModified: '02-10-2026 03:14 PM',
    icon: 'assets/icons/notepad.png',
    action: 'notepad',
    content: `[BUG REPORT - ATTENDANCE TRACKER]
Date: 02-10-2026 03:14 PM
Component: /src/utils/calcAttendance.js
Error: Uncaught TypeError: Cannot read properties of undefined (reading 'percentage')
Status: RESOLVED
Note: Nobody touched the code. Closed VS Code, reopened VS Code, ran 'npm run dev' again, and it works perfectly on production now.
Resolution: Do not question it. Never touch line 42 again.`
  },
  {
    name: 'external_viva_answers_cheat_sheet.txt',
    origLocation: 'C:\\Viva\\Lab_3',
    dateDeleted: '01-10-2026 11:30 AM',
    size: '4 KB',
    sizeBytes: 4096,
    type: 'Text Document',
    dateModified: '01-10-2026 11:25 AM',
    icon: 'assets/icons/notepad.png',
    action: 'notepad',
    content: `MUMBAI UNIVERSITY IT EXTERNAL VIVA CHEAT SHEET
=============================================
Q: "Explain Normalization."
A: "Sir, it reduces redundancy and eliminates insertion, update, and deletion anomalies."

Q: "What else? Explain 3NF and BCNF."
A: "Sir, every non-key attribute must depend on the key, the whole key, and nothing but the key, so help me Codd."

Q: "Why did you use SQLite and WAL mode in your project?"
A: "Sir, Write-Ahead Logging allows simultaneous reads and writes without lock contention, ideal for local-first desktop apps."

Q: "Did you write all this code yourself?"
A: "Sir, line by line, debugged at 2 AM with chai."
(External nods approvingly and awards 25/25).`
  },
  {
    name: '75_percent_attendance_panic.pdf',
    origLocation: 'C:\\Defaulters_List',
    dateDeleted: '29-09-2026 09:15 AM',
    size: '85 KB',
    sizeBytes: 87040,
    type: 'Microsoft Edge PDF Document',
    dateModified: '29-09-2026 09:10 AM',
    icon: 'assets/icons/file-pdf.svg',
    action: 'document',
    content: `MUMBAI UNIVERSITY - DEFAULTER COMMITTEE NOTICE
=============================================
Subject: Urgent Medical Certificate for 14 Straight Mondays
Student: Harsh Prasad
Branch: Information Technology

Verdict: DISCARDED TO RECYCLE BIN.
Reason: AttendanceManager web app calculated that overall attendance is currently at 78.4%.
Bunk margin remaining: 3 lectures. Safe zone achieved. Panic averted.`
  },
  {
    name: 'final_resume_v2_final_FINAL.docx',
    origLocation: 'C:\\Users\\harsh\\Desktop',
    dateDeleted: '28-09-2026 11:20 AM',
    size: '42 KB',
    sizeBytes: 43008,
    type: 'Microsoft Word Document',
    dateModified: '28-09-2026 11:15 AM',
    icon: 'assets/icons/file-docx.svg',
    action: 'document',
    content: `MICROSOFT WORD DOCUMENT: final_resume_v2_final_FINAL.docx
=====================================================
Status: Deleted & Moved to Recycle Bin
Reason: Why use a boring 1-page PDF/Word resume when you can build
a full interactive Windows 11 desktop portfolio with a working terminal,
file explorer, VS Code editor, and live project previewers?

Check out my actual projects in "My Projects" on the Desktop!`
  }
];

if (typeof window !== 'undefined') {
  window.RecycleBinData = RecycleBinData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecycleBinData;
}
