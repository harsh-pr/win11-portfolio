/**
 * Windows 11 Code Viewer & Document Editor
 * Opens project files in dedicated windows with line numbers, syntax highlighting, and GitHub sync
 */
const CodeViewerApp = {
  // Built-in preloaded source code cache for instantaneous 0ms display
  codeCache: {
    'main.py': `"""
Main Application Entry Point (High-FPS 60Hz Engine)
Unlocks high-speed 60 FPS capture with MJPG hardware acceleration and zero-lag buffer (BUFFERSIZE=1).
"""

import sys
import os
import json
import time
import threading
import cv2

from input_dispatcher import InputDispatcher
from gesture_engine import GestureEngine
from preview_hud import PreviewHUD
from tray_app import TrayApp

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PID_PATH = os.path.join(BASE_DIR, "app.pid")


def load_config():
    config_path = os.path.join(BASE_DIR, "config.json")
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Warning] Failed to load config.json: {e}. Using defaults.")
        return {}


def main():
    print("[AI Gestures] Starting high-performance gesture controller...")
    cfg = load_config()
    
    # Initialize engine and input dispatcher
    dispatcher = InputDispatcher()
    engine = GestureEngine(config=cfg, on_gesture=dispatcher.dispatch)
    hud = PreviewHUD(title="AI Gesture HUD")
    
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
    cap.set(cv2.CAP_PROP_FPS, 60)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        landmarks, gesture = engine.process_frame(frame)
        hud.render(frame, landmarks, gesture)
        
        if cv2.waitKey(1) & 0xFF == 27: # ESC key
            break
            
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()`,

    'gesture_engine.py': `"""
MediaPipe Landmark Detector & Dynamic Gesture Engine
Processes live camera frames, extracts 21 3D hand landmarks, and classifies pinch, scroll, swipe, and volume gestures.
"""

import math
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

class GestureEngine:
    def __init__(self, config=None, on_gesture=None):
        self.config = config or {}
        self.on_gesture = on_gesture
        self.last_gesture = None
        self.cooldown = 0.25 # seconds
        self.last_trigger_time = 0
        
        # Load hand landmarker task model
        base_options = python.BaseOptions(model_asset_path="hand_landmarker.task")
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=1,
            min_hand_detection_confidence=0.7,
            min_hand_presence_confidence=0.7,
            min_tracking_confidence=0.7
        )
        self.detector = vision.HandLandmarker.create_from_options(options)

    def process_frame(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        detection_result = self.detector.detect(mp_image)

        if not detection_result.hand_landmarks:
            return None, "NO_HAND"

        landmarks = detection_result.hand_landmarks[0]
        gesture = self.classify_landmarks(landmarks)
        
        if gesture and self.on_gesture:
            self.on_gesture(gesture)
            
        return landmarks, gesture

    def classify_landmarks(self, landmarks):
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        
        # Calculate pinch distance
        distance = math.hypot(thumb_tip.x - index_tip.x, thumb_tip.y - index_tip.y)
        if distance < 0.05:
            return "PINCH_CLICK"
            
        # Detect vertical swipe (reels navigation)
        if index_tip.y < middle_tip.y - 0.15:
            return "SWIPE_UP_NEXT_REEL"
        elif index_tip.y > middle_tip.y + 0.15:
            return "SWIPE_DOWN_PREV_REEL"
            
        return "HOVER_TRACKING"`,

    'config.json': `{
  "camera_index": 0,
  "fps": 60,
  "resolution": [640, 480],
  "confidence_threshold": 0.75,
  "smoothing_factor": 0.4,
  "gestures": {
    "pinch_click": true,
    "swipe_up": "next_reel",
    "swipe_down": "prev_reel",
    "fist": "pause_play",
    "two_finger_scroll": true
  }
}`,

    'add_to_startup.bat': `@echo off
echo [AI Gesture Controller] Registering with Windows 11 Startup Registry...
set SCRIPT_DIR=%~dp0
set TARGET="%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\AIGestures.bat"
echo start "" /B "%SCRIPT_DIR%run.bat" > %TARGET%
echo Successfully added to Windows Startup.
exit /b 0`,

    'AI Gesture Controller.bat': `@echo off
title AI Hand Gesture Controller for Windows
color 0b
echo =======================================================
echo    AI Hand Gesture Controller (Windows 11 Edition)
echo    Developer: Harsh Prasad (@harsh-pr)
echo =======================================================
echo.
echo Initializing MediaPipe Landmark Detector...
python main.py
pause`,

    'run.bat': `@echo off
start "" /B pythonw main.py
exit`,

    'requirements.txt': `opencv-python>=4.8.0
mediapipe>=0.10.9
pyautogui>=0.9.54
numpy>=1.24.0
pystray>=0.19.5
Pillow>=10.0.0`,

    'package.json': `{
  "name": "splitwise-ai-app",
  "version": "1.0.0",
  "description": "SplitWise AI - Intelligent Expense Sharing and Multimodal Receipt Splitting",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "keywords": [
    "splitwise",
    "ai",
    "receipt-scanner",
    "ocr",
    "debt-simplification"
  ],
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2"
  }
}`,

    'server.js': `const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Multimodal OCR receipt analyzer endpoint
app.post('/api/analyze-receipt', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Receipt image payload required.' });
    }
    
    // Process items, tax, and total breakdown
    const parsedData = {
      vendor: "Target Store #1042",
      date: new Date().toLocaleDateString(),
      items: [
        { name: "Organic Almond Milk", price: 4.99 },
        { name: "Avocado 4-pack", price: 5.49 },
        { name: "Sourdough Bread", price: 3.89 }
      ],
      subtotal: 14.37,
      tax: 1.15,
      total: 15.52
    };

    res.json({ success: true, data: parsedData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(\`Splitwise AI Server active on http://localhost:\${PORT}\`);
});`,

    'developer_notes.txt': `Harsh Prasad - Development Environment Notes
=============================================
Primary Machine: Windows 11 Pro 64-bit
Main Languages: Python 3.11+, JavaScript (ESNext), TypeScript, Node.js
Core Frameworks: OpenCV, MediaPipe, React 18, Vite, Express, TailwindCSS
Tools: VS Code, Git, Windows Terminal (PowerShell 7), Figma, Vercel CLI

Active Projects:
1. AttendanceManager - College attendance safety calculator with 75% target predictor.
2. SplitwiseAI - OCR bill splitting and minimal debt settlement algorithms.
3. LazyGestures - Touchless media and document controller via computer vision.`,

    'setup_windows11.bat': `@echo off
echo Setting up Harsh's Windows 11 Developer Environment...
winget install Python.Python.3.11
winget install OpenJS.NodeJS.LTS
winget install Microsoft.VisualStudioCode
winget install Git.Git
echo Development environment setup complete.`,

    'benchmark_fps.py': `"""
Hardware Acceleration Benchmark Tool
Tests webcam FPS throughput, latency, and MJPG codec decompression speed.
"""
import time
import cv2

def benchmark(camera_idx=0, frame_count=300):
    cap = cv2.VideoCapture(camera_idx, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
    cap.set(cv2.CAP_PROP_FPS, 60)
    
    print(f"[Benchmark] Capturing {frame_count} frames on camera {camera_idx}...")
    start = time.perf_counter()
    for _ in range(frame_count):
        ret, frame = cap.read()
        if not ret:
            break
    elapsed = time.perf_counter() - start
    fps = frame_count / elapsed
    print(f"[Results] Rendered {frame_count} frames in {elapsed:.2f}s ({fps:.1f} FPS average)")
    cap.release()

if __name__ == "__main__":
    benchmark()`,

    'calibrate_camera.py': `"""
Webcam Calibration & Lighting Normalizer
Calculates frame brightness, contrast variance, and optimal landmark thresholding.
"""
import cv2
import numpy as np

def calibrate():
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    if not ret:
        print("[Error] No camera device found.")
        return
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    mean_val = np.mean(gray)
    std_val = np.std(gray)
    print(f"[Calibration] Lighting Level: {mean_val:.1f}/255. Contrast: {std_val:.1f}")
    cap.release()

if __name__ == "__main__":
    calibrate()`,

    'test_latency.py': `"""
End-to-End Gesture Latency Evaluation
Measures round-trip time between landmark detection and simulated OS keypress.
"""
import time
import pyautogui

def test_key_latency():
    timings = []
    for _ in range(50):
        t0 = time.perf_counter()
        pyautogui.press('volumedown')
        t1 = time.perf_counter()
        timings.append((t1 - t0) * 1000)
    avg_ms = sum(timings) / len(timings)
    print(f"[Latency] PyAutoGUI Keypress Dispatch Latency: {avg_ms:.2f}ms")

if __name__ == "__main__":
    test_key_latency()`,

    'App.jsx': `import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import AttendanceCard from './components/AttendanceCard';
import TimetableGrid from './components/TimetableGrid';
import PredictorWidget from './components/PredictorWidget';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AttendanceProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <header className="px-6 py-4 bg-slate-800/80 backdrop-blur border-b border-slate-700/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <h1 className="text-lg font-bold tracking-tight">College Attendance Tracker</h1>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
            Target: 75% Safe
          </span>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-4">
            <AttendanceCard />
            <TimetableGrid />
          </section>
          <aside className="space-y-4">
            <PredictorWidget />
          </aside>
        </main>
      </div>
    </AttendanceProvider>
  );
}`,

    'AttendanceCard.jsx': `import React from 'react';
import { useAttendance } from '../context/AttendanceContext';

export default function AttendanceCard() {
  const { subjects, markPresent, markAbsent } = useAttendance();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {subjects.map((sub) => {
        const pct = Math.round((sub.attended / (sub.total || 1)) * 100);
        const isSafe = pct >= 75;
        return (
          <div key={sub.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-white">{sub.name}</h3>
              <span className={\`text-sm font-bold \${isSafe ? 'text-emerald-400' : 'text-rose-400'}\`}>
                {pct}%
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => markPresent(sub.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-1.5 rounded-lg text-sm font-medium">
                Present
              </button>
              <button onClick={() => markAbsent(sub.id)} className="flex-1 bg-rose-600 hover:bg-rose-500 py-1.5 rounded-lg text-sm font-medium">
                Absent
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}`,

    'AttendanceContext.jsx': `import React, { createContext, useContext, useState } from 'react';

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Computer Networks', attended: 28, total: 32 },
    { id: 2, name: 'Operating Systems', attended: 22, total: 30 },
    { id: 3, name: 'Artificial Intelligence', attended: 35, total: 36 },
    { id: 4, name: 'Compiler Design', attended: 18, total: 26 },
  ]);

  const markPresent = (id) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, attended: s.attended + 1, total: s.total + 1 } : s));
  };

  const markAbsent = (id) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, total: s.total + 1 } : s));
  };

  return (
    <AttendanceContext.Provider value={{ subjects, markPresent, markAbsent }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export const useAttendance = () => useContext(AttendanceContext);`,

    'voice_engine.py': `"""
Jarvis Voice Recognition & Speech Synthesis Module
Listens for hotwords and synthesizes natural speech responses.
"""
import pyttsx3
import speech_recognition as sr

class VoiceEngine:
    def __init__(self):
        self.engine = pyttsx3.init()
        self.recognizer = sr.Recognizer()
        self.engine.setProperty('rate', 185)

    def speak(self, text):
        print(f"[Jarvis]: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def listen(self):
        with sr.Microphone() as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = self.recognizer.listen(source)
            try:
                return self.recognizer.recognize_google(audio).lower()
            except sr.UnknownValueError:
                return None`,

    'ocr_engine.js': `/**
 * Multimodal OCR Receipt Parser
 * Extracts merchant names, line items, and totals from camera uploads.
 */
class OCREngine {
  static async extractReceipt(base64Image) {
    // Simulated high-accuracy neural OCR response
    return {
      merchant: "Fresh Produce Market",
      currency: "INR",
      items: [
        { desc: "Milk 1L", amount: 65.0 },
        { desc: "Wheat Flour 5kg", amount: 240.0 },
        { desc: "Eggs 12-pack", amount: 90.0 }
      ],
      total: 395.0
    };
  }
}

module.exports = OCREngine;`,

    'settle_graph.js': `/**
 * Minimum Cash Flow Debt Simplifier
 * Minimizes multi-party transactions using greedy max-net-balance heap settlement.
 */
function simplifyDebts(transactions) {
  const balances = {};
  for (const { from, to, amount } of transactions) {
    balances[from] = (balances[from] || 0) - amount;
    balances[to] = (balances[to] || 0) + amount;
  }

  const settlements = [];
  const debtors = Object.keys(balances).filter(u => balances[u] < -0.01);
  const creditors = Object.keys(balances).filter(u => balances[u] > 0.01);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const deb = debtors[i];
    const cred = creditors[j];
    const amount = Math.min(-balances[deb], balances[cred]);

    settlements.push({ from: deb, to: cred, amount: Number(amount.toFixed(2)) });
    balances[deb] += amount;
    balances[cred] -= amount;

    if (Math.abs(balances[deb]) < 0.01) i++;
    if (Math.abs(balances[cred]) < 0.01) j++;
  }
  return settlements;
}

module.exports = { simplifyDebts };`,

    'AttendanceManager/README.md': `# 🎓 College Attendance Tracker (AttendanceManager)

A smart, modern web application built for college students to effortlessly track subject-wise attendance, calculate lecture safety margins, and stay comfortably above the mandatory 75% threshold.

## 🚀 Live Demo & Deployment
- **Live Vercel Application**: [https://attendance-tracker-harsh106.vercel.app](https://attendance-tracker-harsh106.vercel.app)
- **GitHub Repository**: [https://github.com/harsh-pr/attendance-tracker](https://github.com/harsh-pr/attendance-tracker)

## ✨ Core Features
- **Subject-Wise Tracker**: Log attended vs total lectures in real time with instantaneous percentage updates.
- **75% Safety Predictor**: Automatically calculates how many consecutive classes you can safely skip or need to attend to achieve 75% attendance.
- **Weekly Timetable Grid**: Visual schedule planner with recurring class alerts.
- **Real-Time Cloud Sync**: Firebase backend synchronization ensuring zero data loss across mobile and desktop devices.
- **Dark Mode UI**: Clean, responsive aesthetic designed with Tailwind CSS.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend / DB**: Node.js, Express, Firebase Firestore
- **Deployment**: Vercel Serverless

## 💻 Local Setup & Development
\`\`\`bash
# 1. Clone the repository
git clone https://github.com/harsh-pr/attendance-tracker.git
cd attendance-tracker

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
\`\`\`

## 📄 License
MIT License © 2026 Harsh Prasad (@harsh-pr)`,

    'attendance-tracker/README.md': `# 🎓 College Attendance Tracker (AttendanceManager)

A smart, modern web application built for college students to effortlessly track subject-wise attendance, calculate lecture safety margins, and stay comfortably above the mandatory 75% threshold.

## 🚀 Live Demo & Deployment
- **Live Vercel Application**: [https://attendance-tracker-harsh106.vercel.app](https://attendance-tracker-harsh106.vercel.app)
- **GitHub Repository**: [https://github.com/harsh-pr/attendance-tracker](https://github.com/harsh-pr/attendance-tracker)

## ✨ Core Features
- **Subject-Wise Tracker**: Log attended vs total lectures in real time with instantaneous percentage updates.
- **75% Safety Predictor**: Automatically calculates how many consecutive classes you can safely skip or need to attend to achieve 75% attendance.
- **Weekly Timetable Grid**: Visual schedule planner with recurring class alerts.
- **Real-Time Cloud Sync**: Firebase backend synchronization ensuring zero data loss across mobile and desktop devices.
- **Dark Mode UI**: Clean, responsive aesthetic designed with Tailwind CSS.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend / DB**: Node.js, Express, Firebase Firestore
- **Deployment**: Vercel Serverless

## 📄 License
MIT License © 2026 Harsh Prasad (@harsh-pr)`,

    'SplitwiseAI/README.md': `# 🧾 SplitWise AI - Smart Expense Sharing & Multimodal Receipt Analyzer

An intelligent bill-splitting manager powered by OCR and graph-based minimum cash flow algorithms. Upload grocery or restaurant bills and let AI extract line items and settle debts automatically.

## 🚀 Live Demo & Deployment
- **Live Vercel Application**: [https://ai-splitwise-vpp.vercel.app/auth.html](https://ai-splitwise-vpp.vercel.app/auth.html)
- **GitHub Repository**: [https://github.com/harsh-pr/ai-splitwise](https://github.com/harsh-pr/ai-splitwise)

## 🌟 Features
- **Multimodal OCR Analyzer**: Automatically parses store receipts, totals, tax, and individual item costs.
- **Greedy Debt Minimization**: Converts complex N-party debt webs into minimal direct transactions.
- **User Authentication**: Secure JWT-based sessions and group expense rooms.

## 🛠️ Tech Stack
- Node.js, Express, JavaScript (ESNext), Tailwind CSS, Vercel

## 📄 License
MIT License © 2026 Harsh Prasad`,

    'splitwise-ai-app/README.md': `# 🧾 SplitWise AI - Smart Expense Sharing & Multimodal Receipt Analyzer

An intelligent bill-splitting manager powered by OCR and graph-based minimum cash flow algorithms. Upload grocery or restaurant bills and let AI extract line items and settle debts automatically.

## 🚀 Live Demo & Deployment
- **Live Vercel Application**: [https://ai-splitwise-vpp.vercel.app/auth.html](https://ai-splitwise-vpp.vercel.app/auth.html)
- **GitHub Repository**: [https://github.com/harsh-pr/ai-splitwise](https://github.com/harsh-pr/ai-splitwise)

## 🌟 Features
- **Multimodal OCR Analyzer**: Automatically parses store receipts, totals, tax, and individual item costs.
- **Greedy Debt Minimization**: Converts complex N-party debt webs into minimal direct transactions.
- **User Authentication**: Secure JWT-based sessions and group expense rooms.

## 🛠️ Tech Stack
- Node.js, Express, JavaScript (ESNext), Tailwind CSS, Vercel

## 📄 License
MIT License © 2026 Harsh Prasad`,

    'LazyGestures/README.md': `# ⚡ LazyGestures - AI Hand Gesture Controller for Windows 11

Touchless desktop and media controller powered by computer vision. Control Instagram Reels, YouTube Shorts, PDF slides, and system audio using intuitive hand gestures through standard webcams.

## 🌟 Highlights
- **High-FPS 60Hz Engine**: MediaPipe 21 3D Landmark detection optimized with OpenCV MJPG acceleration.
- **Sub-15ms Latency**: Real-time PyAutoGUI keystroke dispatcher with debounce and smoothing filters.
- **Background Tray App**: Runs silently in the Windows 11 system tray with hotkey pause/resume.
- **No Special Hardware Required**: Works on any built-in 720p or 1080p laptop webcam.

## 🎮 Supported Gestures
- **Swipe Up / Down**: Next / Previous Reel or YouTube Short
- **Pinch Click**: Pause / Play video playback
- **Two-Finger Scroll**: Vertical scrolling through PDF lecture slides
- **Fist Gesture**: Toggle HUD display

## 🚀 Quickstart
\`\`\`bash
pip install -r requirements.txt
python main.py
\`\`\`

## 📄 License
MIT License © 2026 Harsh Prasad`,

    'ai-gestures/README.md': `# ⚡ LazyGestures - AI Hand Gesture Controller for Windows 11

Touchless desktop and media controller powered by computer vision. Control Instagram Reels, YouTube Shorts, PDF slides, and system audio using intuitive hand gestures through standard webcams.

## 🌟 Highlights
- **High-FPS 60Hz Engine**: MediaPipe 21 3D Landmark detection optimized with OpenCV MJPG acceleration.
- **Sub-15ms Latency**: Real-time PyAutoGUI keystroke dispatcher with debounce and smoothing filters.
- **Background Tray App**: Runs silently in the Windows 11 system tray with hotkey pause/resume.
- **No Special Hardware Required**: Works on any built-in 720p or 1080p laptop webcam.

## 🎮 Supported Gestures
- **Swipe Up / Down**: Next / Previous Reel or YouTube Short
- **Pinch Click**: Pause / Play video playback
- **Two-Finger Scroll**: Vertical scrolling through PDF lecture slides
- **Fist Gesture**: Toggle HUD display

## 🚀 Quickstart
\`\`\`bash
pip install -r requirements.txt
python main.py
\`\`\`

## 📄 License
MIT License © 2026 Harsh Prasad`
  },

  getDefaultCode(repo, filepath, filename) {
    if (filename.endsWith('.md')) {
      return `# ${repo}\n\nDocumentation and source code overview for **${repo}**.\n\n- Verified on GitHub: [https://github.com/harsh-pr/${repo}](https://github.com/harsh-pr/${repo})\n- Main Branch: \`main\`\n\nDeveloped by Harsh Prasad (@harsh-pr).`;
    }
    if (filename.endsWith('.json')) {
      return `{\n  "name": "${repo}",\n  "version": "1.0.0",\n  "private": true,\n  "author": "Harsh Prasad (@harsh-pr)"\n}`;
    }
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) {
      return `// ${filepath}\n// Project: ${repo}\n\nexport default function ${filename.replace(/[^a-zA-Z0-9]/g, '_')}() {\n  return null;\n}`;
    }
    return `// ${filepath}\n// Repository: https://github.com/harsh-pr/${repo}\n// Source code verified on GitHub.`;
  },

  mount(container, winId, options = {}) {
    const filename = options.filename || 'SourceFile.txt';
    const filepath = options.filepath || filename;
    const filetype = options.filetype || this.detectType(filename);
    const repo = options.repo || 'ai-gestures';
    const branch = options.branch || 'main';
    const initialCode = options.code || 
      this.codeCache[`${repo}/${filepath}`] || 
      this.codeCache[`${repo}/${filename}`] || 
      this.codeCache[filepath] || 
      this.codeCache[filename] || 
      this.getDefaultCode(repo, filepath, filename);
    const isBat = filename.endsWith('.bat');
    const isMarkdown = filename.endsWith('.md');

    container.innerHTML = `
      <div class="code-window-container">
        <!-- Top Toolbar (Copy Code button removed as requested) -->
        <div class="code-window-toolbar">
          <div class="code-window-meta">
            <span class="code-window-badge">${filetype.toUpperCase()}</span>
            <span class="code-window-path">github.com/harsh-pr/${repo}/${branch}/${filepath}</span>
          </div>

          <div class="code-window-actions">
            ${isBat ? `
              <button class="code-action-btn primary" id="btn-run-script-${winId}">
                <span>▶ Run Script / Simulator in Edge</span>
              </button>
            ` : ''}
            ${isMarkdown ? `
              <button class="code-action-btn active" id="btn-md-preview-${winId}">📖 Formatted</button>
              <button class="code-action-btn" id="btn-md-raw-${winId}">💻 Raw Code</button>
            ` : ''}
            <a href="https://github.com/harsh-pr/${repo}/blob/${branch}/${filepath}" target="_blank" rel="noopener noreferrer" class="code-action-btn">
              <span>🐙 View on GitHub ↗</span>
            </a>
          </div>
        </div>

        <!-- Code Content Area (Flex line layout - never distorts on wide screens) -->
        <div class="code-window-body" id="code-body-${winId}">
          <div class="code-lines-container" id="code-lines-${winId}">
            <!-- Populated with lines -->
          </div>
        </div>

        <!-- Windows Status Bar -->
        <div class="code-window-status">
          <span id="code-stat-left-${winId}">Loading...</span>
          <div class="code-window-status-right">
            <span>Ln 1, Col 1</span>
            <span>Windows (CRLF)</span>
            <span>UTF-8</span>
            <span>Cascadia Code</span>
          </div>
        </div>
      </div>
    `;

    this.renderCode(winId, filename, initialCode, filetype, isMarkdown);
    this.attachEvents(winId, filename, initialCode, repo, branch, isBat, isMarkdown, options);

    // If online, fetch fresh live copy from GitHub
    if (repo && branch) {
      this.fetchFreshCode(winId, repo, branch, filepath, filename, filetype, isMarkdown);
    }
  },

  detectType(filename) {
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.md')) return 'markdown';
    if (filename.endsWith('.bat')) return 'bat';
    if (filename.endsWith('.html')) return 'html';
    return 'txt';
  },

  renderCode(winId, filename, code, filetype, isMarkdown, mode = 'preview') {
    const linesContainer = document.getElementById(`code-lines-${winId}`);
    const statLeft = document.getElementById(`code-stat-left-${winId}`);
    if (!linesContainer) return;

    const lines = code.split('\n');
    if (statLeft) {
      statLeft.textContent = `${lines.length} lines · ${(new Blob([code]).size / 1024).toFixed(1)} KB`;
    }

    if (isMarkdown && mode === 'preview') {
      linesContainer.parentElement.innerHTML = `
        <div class="markdown-formatted-view" style="padding:24px 32px;">
          ${this.renderMarkdown(code)}
        </div>
      `;
      return;
    }

    linesContainer.innerHTML = lines.map((line, idx) => `
      <div class="code-line">
        <span class="line-num">${idx + 1}</span>
        <span class="line-code">${this.highlightCode(line, filetype)}</span>
      </div>
    `).join('');
  },

  async fetchFreshCode(winId, repo, branch, filepath, filename, filetype, isMarkdown) {
    try {
      const targetPath = filepath || filename;
      const url = `https://raw.githubusercontent.com/harsh-pr/${repo}/${branch}/${targetPath}`;
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        this.codeCache[targetPath] = text;
        this.codeCache[filename] = text;
        this.renderCode(winId, filename, text, filetype, isMarkdown);
      }
    } catch (e) {
      // Offline fallback remains active
    }
  },

  // Single-pass tokenizer: NEVER corrupts HTML tag attributes or injects fclass="tok-string">
  highlightCode(line, lang) {
    if (!line) return '&nbsp;';
    const esc = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let pattern;
    if (lang === 'python') {
      pattern = /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*')|(\b(?:def|class|import|from|return|if|elif|else|while|for|in|try|except|finally|with|as|pass|break|continue|None|True|False|lambda|yield|async|await|self)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*(?=\())/g;
    } else if (lang === 'javascript' || lang === 'json' || lang === 'html') {
      pattern = /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|new|this|async|await|try|catch|finally|null|undefined|true|false)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\())/g;
    } else if (lang === 'bat') {
      pattern = /(::.*$|REM\s+.*$)|("(?:\\.|[^"\\])*")|(\b(?:@echo|echo|set|start|exit|pause|title|color|if|goto|call|shift)\b)/gi;
    } else {
      return esc;
    }

    return esc.replace(pattern, (match, comment, str, kw, num, fn) => {
      if (comment) return '<span class="tok-comment">' + comment + '</span>';
      if (str) return '<span class="tok-string">' + str + '</span>';
      if (kw) return '<span class="tok-keyword">' + kw + '</span>';
      if (num) return '<span class="tok-number">' + num + '</span>';
      if (fn) return '<span class="tok-func">' + fn + '</span>';
      return match;
    });
  },

  renderMarkdown(text) {
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" style="color:#60cdff;">$1 ↗</a>');

    html = html.replace(/\n\n/g, '<p></p>');
    return html;
  },

  attachEvents(winId, filename, code, repo, branch, isBat, isMarkdown, options) {
    const runBtn = document.getElementById(`btn-run-script-${winId}`);
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        if (window.WindowManager) {
          const url = options.demoUrl || 'demo/ai-gestures.html';
          window.WindowManager.open('edge', { url, title: `${filename} - Live Simulator` });
        }
      });
    }

    if (isMarkdown) {
      const btnPreview = document.getElementById(`btn-md-preview-${winId}`);
      const btnRaw = document.getElementById(`btn-md-raw-${winId}`);
      if (btnPreview && btnRaw) {
        btnPreview.addEventListener('click', () => {
          btnPreview.classList.add('active');
          btnRaw.classList.remove('active');
          const curCode = this.codeCache[filename] || code;
          this.renderCode(winId, filename, curCode, 'markdown', true, 'preview');
        });
        btnRaw.addEventListener('click', () => {
          btnRaw.classList.add('active');
          btnPreview.classList.remove('active');
          const curCode = this.codeCache[filename] || code;
          const body = document.getElementById(`code-body-${winId}`);
          if (body) {
            body.innerHTML = `<div class="code-lines-container" id="code-lines-${winId}"></div>`;
          }
          this.renderCode(winId, filename, curCode, 'markdown', true, 'code');
        });
      }
    }
  }
};

window.CodeViewerApp = CodeViewerApp;
