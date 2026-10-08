# 🧠 NeuroNudge – Real-Time Digital Wellness

**NeuroNudge** is a Chrome browser extension designed to monitor user interaction patterns and provide real-time digital wellness insights. It analyzes **keystroke dynamics** and **facial expressions** to understand user activity, focus, and possible stress indicators while browsing.

The extension provides a real-time dashboard and uses rule-based analysis to generate contextual nudges that encourage users to maintain healthier and more productive digital sessions.

---

## 🚀 Features

* ⌨️ **Keystroke Analysis**

  * Tracks typing activity and key events
  * Calculates average dwell time
  * Calculates average flight time
  * Tracks total keystrokes
  * Calculates typing speed (WPM)
  * Monitors backspace/delete-based error rate

* 😊 **Facial Expression Analysis**

  * Uses the device camera for facial analysis
  * Detects facial landmarks and expressions
  * Uses Face-API models for real-time analysis
  * Generates stress-related indicators based on detected expressions

* 📊 **Real-Time Dashboard**

  * Displays session statistics
  * Shows typing and activity metrics
  * Provides session timing information
  * Updates statistics dynamically

* 🔔 **Digital Wellness Nudges**

  * Provides contextual notifications
  * Displays motivational nudges when required
  * Encourages users to take breaks and maintain focus

* 🌐 **Browser-Wide Monitoring**

  * Works across supported web pages through Chrome content scripts
  * Uses Chrome Extension Manifest V3 architecture

---

## 🛠️ Technologies Used

| Technology                  | Purpose                                 |
| --------------------------- | --------------------------------------- |
| **JavaScript**              | Core application logic                  |
| **HTML5**                   | Extension interface                     |
| **CSS3**                    | UI styling                              |
| **Chrome Extension API**    | Browser integration                     |
| **Face-API.js**             | Facial expression and landmark analysis |
| **Machine Learning Models** | Facial analysis                         |
| **Chrome Storage API**      | Local data handling                     |
| **Manifest V3**             | Chrome extension architecture           |

---

## 🏗️ System Architecture

```text
                 ┌──────────────────────────┐
                 │      Chrome Browser      │
                 └────────────┬─────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
       ┌──────▼──────┐                 ┌──────▼──────┐
       │ Content     │                 │ Side Panel  │
       │ Script      │                 │ / Popup     │
       └──────┬──────┘                 └──────┬──────┘
              │                               │
              │ Keystroke Data                │ Facial Data
              │                               │
              └───────────────┬───────────────┘
                              │
                       ┌──────▼──────┐
                       │ Background  │
                       │ Service     │
                       │ Worker      │
                       └──────┬──────┘
                              │
                       ┌──────▼──────┐
                       │   Analysis  │
                       │   & Stats   │
                       └──────┬──────┘
                              │
                       ┌──────▼──────┐
                       │  Wellness   │
                       │   Nudges    │
                       └─────────────┘
```

---

## 📁 Project Structure

```text
Neuro-Nudge/
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon-16 copy.png
│
├── models/
│   ├── face_expression_model-shard1
│   ├── face_expression_model-weights_manifest.json
│   ├── face_landmark_68_model-shard1
│   ├── face_landmark_68_model-weights_manifest.json
│   ├── tiny_face_detector_model-shard1
│   └── tiny_face_detector_model-weights_manifest.json
│
├── background.js
├── content.js
├── face-api.min.js
├── gcplogo.png
├── manifest.json
├── popup.html
├── popup.js
├── sidepanel.html
├── sidepanel.js
├── sound.mp3
├── styles.css
└── .gitignore
```

---

## ⚙️ How It Works

### 1. Keystroke Monitoring

The content script listens for keyboard events and collects interaction data such as:

* Keydown and keyup timestamps
* Dwell time
* Flight time
* Total keystrokes
* Backspace/Delete events

This information is used to calculate typing and interaction statistics.

### 2. Facial Analysis

The extension uses **Face-API.js** models to analyze facial features through the user's camera.

The system performs:

```text
Camera Input
     ↓
Face Detection
     ↓
Facial Landmark Detection
     ↓
Expression Analysis
     ↓
Stress Indicator
```

### 3. Real-Time Statistics

The collected information is processed to generate metrics such as:

* Average dwell time
* Average flight time
* Words per minute
* Error rate
* Total keystrokes
* Session duration

### 4. Wellness Nudges

Based on the collected interaction indicators, NeuroNudge can provide contextual motivational messages and notifications intended to encourage focus and healthier digital habits.

---

## 🔧 Installation

### Clone the Repository

```bash
git clone https://github.com/SaiHari-04/Neuro-Nudge.git
```

### Open Chrome Extensions

Open:

```text
chrome://extensions/
```

Enable:

```text
Developer mode
```

### Load the Extension

1. Click **Load unpacked**
2. Select the cloned `Neuro-Nudge` folder
3. The NeuroNudge extension will appear in Chrome
4. Open the extension and start a session

---

## 🔒 Privacy

NeuroNudge is designed as a browser-based prototype for digital wellness analysis.

Facial analysis requires camera permission and should only be enabled when the user explicitly allows camera access.

The project is intended for **wellness and productivity insights**, not for medical diagnosis or psychological assessment.

---

## 🎯 Use Cases

* 📚 Student study sessions
* 💻 Long coding sessions
* 🧑‍💻 Remote work
* 📝 Extended typing activities
* 🧘 Digital wellness monitoring
* ⏱️ Focus and productivity tracking

---

## 🔮 Future Enhancements

* 📈 Historical productivity analytics
* 📊 Advanced visualization dashboard
* 🤖 ML-based stress classification
* 🧠 Personalized wellness recommendations
* ☁️ Optional cloud-based analytics
* 📱 Improved responsive dashboard
* 🔐 Enhanced privacy controls
* 🎯 Personalized focus goals
* 📅 Daily and weekly productivity reports

---
