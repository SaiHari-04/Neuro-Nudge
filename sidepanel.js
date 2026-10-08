let latestKeystats = {
  totalKeys: 0,
  avgDwell: 0,
  avgFlight: 0,
  wpm: 0,
  errorRate: 0,
  sessionTime: "00:00"
};

let latestEmotions = {
  neutral: 0,
  happy: 0,
  sad: 0,
  angry: 0,
  fearful: 0,
  disgusted: 0,
  surprised: 0
};

const emotionBufferSize = 5;
let angryBuffer = [];
let sadBuffer = [];

function averageBuffer(buffer) {
  if (buffer.length === 0) return 0;
  return buffer.reduce((a, b) => a + b, 0) / buffer.length;
}

function updateUI(stats) {
  latestKeystats = stats;
  document.getElementById("total-keys").textContent = stats.totalKeys || 0;
  document.getElementById("avg-dwell").textContent = (stats.avgDwell || 0) + " ms";
  document.getElementById("avg-flight").textContent = (stats.avgFlight || 0) + " ms";
  document.getElementById("typing-speed").textContent = (stats.wpm || 0) + " WPM";
  document.getElementById("error-rate").textContent = (stats.errorRate || 0);
  document.getElementById("session-time").textContent = stats.sessionTime || "00:00";
}

// Request initial stats
chrome.runtime.sendMessage({type: "GETSTATS"}, (response) => {
  if (response && response.data) updateUI(response.data);
});

// Listen for stats updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "STATSUPDATE") updateUI(message.data);
});

// Face detection variables
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
let modelsLoaded = false;
let isDetecting = false;
let videoStream = null;
let lastNudgeType = null;
let lastNudgeTime = 0;
let lastFaceState = true; // Track face presence for session control

function showNotification(type) {
  let title = "";
  let message = "";
  if (type === "stress") {
    title = "You seem stressed";
    message = "Take a break, relax your face, and try some deep breathing.";
  } else if (type === "fatigue") {
    title = "Signs of fatigue";
    message = "You look tired. Consider resting your eyes or taking a short walk.";
  } else {
    return;
  }
  chrome.runtime.sendMessage({ type: "NUDGE_NOTIFICATION", title, message });
}

async function loadFaceApiModels() {
  document.getElementById('status').textContent = 'Loading detection models...';
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
  ]);
  modelsLoaded = true;
  document.getElementById('status').textContent = 'Models loaded! Starting camera...';
  startFaceDetection();
}

async function startFaceDetection() {
  if (!modelsLoaded) return;
  const video = document.getElementById('video');
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480 }, 
      audio: false 
    });
    video.srcObject = videoStream;
    video.onloadedmetadata = () => {
      video.play();
      detectFaces();
    };
  } catch (e) {
    document.getElementById('status').textContent = "Camera permission denied";
  }
}

async function detectFaces() {
  if (!isDetecting) isDetecting = true;
  const video = document.getElementById('video');
  const canvas = document.getElementById('overlay');
  const statusDiv = document.getElementById('status');
  
  if (video.readyState === 4) {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceExpressions();

    if (detection) {
      // Face detected - notify background
      if (!lastFaceState) {
        chrome.runtime.sendMessage({ type: "FACE_DETECTED" });
        lastFaceState = true;
      }

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const displaySize = { width: video.width, height: video.height };
      const resizedDetection = faceapi.resizeResults(detection, displaySize);

      faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);

      updateEmotionBars(detection.expressions);
      statusDiv.textContent = "Face detected - Active session";

      latestEmotions = { ...detection.expressions };

      if (angryBuffer.length >= emotionBufferSize) angryBuffer.shift();
      if (sadBuffer.length >= emotionBufferSize) sadBuffer.shift();
      angryBuffer.push(latestEmotions.angry);
      sadBuffer.push(latestEmotions.sad);

      const avgAngry = averageBuffer(angryBuffer);
      const avgSad = averageBuffer(sadBuffer);

      document.getElementById("tense-value").textContent = (avgAngry * 100).toFixed(1) + "%";

      fusionDecision(latestKeystats, avgAngry, avgSad);

    } else {
      // No face detected - notify background
      if (lastFaceState) {
        chrome.runtime.sendMessage({ type: "NO_FACE_DETECTED" });
        lastFaceState = false;
      }

      statusDiv.textContent = "No face detected - Will pause after 10s of no typing";
      clearEmotionBars();
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      latestEmotions = {
        neutral: 0, happy: 0, sad: 0,
        angry: 0, fearful: 0, disgusted: 0, surprised: 0
      };

      angryBuffer = [];
      sadBuffer = [];

      document.getElementById("tense-value").textContent = "0%";
    }
  }
  
  if (isDetecting) setTimeout(detectFaces, 200);
}

function updateEmotionBars(expressions) {
  const emotions = ['neutral','happy','sad','angry','fearful','disgusted','surprised'];
  emotions.forEach(em => {
    const val = Math.round((expressions[em] || 0) * 100);
    document.getElementById('bar-' + em).style.width = val + "px";
    document.getElementById('pct-' + em).textContent = val;
  });
}

function clearEmotionBars() {
  const emotions = ['neutral','happy','sad','angry','fearful','disgusted','surprised'];
  emotions.forEach(em => {
    document.getElementById('bar-' + em).style.width = "0";
    document.getElementById('pct-' + em).textContent = "0";
  });
}

window.addEventListener('unload', () => {
  isDetecting = false;
  if (videoStream) videoStream.getTracks().forEach(track => track.stop());
});

window.onload = loadFaceApiModels;

const stressAudio = new Audio('sound.mp3');

function showStressOverlay() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_STRESS_NUDGE" });
    }
  });
}

function hideStressOverlay() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "HIDE_STRESS_NUDGE" });
    }
  });
}

function fusionDecision(stats, avgTense, avgSad) {
  const now = Date.now();
  const cooldownDuration = 1 * 60 * 1000;

  // Reset if user is calm or low errors
  if (stats.errorRate < 5 || (avgTense <= 0.3 && avgSad <= 0.4)) {
    if (lastNudgeType === "stress") {
      stressAudio.pause();
      stressAudio.currentTime = 0;
    }
    lastNudgeType = null;
    lastNudgeTime = 0;
    return;
  }

  // Stress detection
  if (
    avgTense > 0.3 &&
    stats.errorRate > 15 &&
    (lastNudgeType !== "stress" || (now - lastNudgeTime) > cooldownDuration)
  ) {
    if (lastNudgeType !== "stress") {
      showNotification("stress");
      showStressOverlay();

      stressAudio.play();

      setTimeout(() => {
        stressAudio.pause();
        stressAudio.currentTime = 0;
      }, 10000);

      lastNudgeType = "stress";
      lastNudgeTime = now;
    }
  }
  // Fatigue detection
  else if (
    avgSad > 0.4 &&
    stats.errorRate > 15 &&
    (lastNudgeType !== "fatigue" || (now - lastNudgeTime) > cooldownDuration)
  ) {
    if (lastNudgeType !== "fatigue") {
      showNotification("fatigue");
      showStressOverlay();

      stressAudio.play();

      lastNudgeType = "fatigue";
      lastNudgeTime = now;
    }
  }
}
