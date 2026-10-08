
function loadStats() {
  chrome.storage.local.get(['keystrokeData'], (result) => {
    if (result.keystrokeData) {
      const data = result.keystrokeData;
      
      document.getElementById('popup-total-keys').textContent = data.totalKeys || 0;
      
      const sessionDuration = (Date.now() - (data.sessionStart || Date.now())) / 1000;
      const wpm = data.totalKeys > 0 && sessionDuration > 0
        ? Math.round((data.totalKeys / 5) / (sessionDuration / 60))
        : 0;
      
      document.getElementById('popup-wpm').textContent = wpm;
    }
  });
}


document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all keystroke data?')) {
    chrome.storage.local.set({
      keystrokeData: {
        pressTime: null,
        releaseTime: null,
        dwellTimes: [],
        flightTimes: [],
        typingSpeed: [],
        errors: 0,
        totalKeys: 0,
        lastKeyTime: null,
        sessionStart: Date.now()
      }
    }, () => {
      loadStats();
      alert('Data reset successfully!');
    });
  }
});


document.getElementById('refresh-btn').addEventListener('click', () => {
  loadStats();
});


loadStats();
setInterval(loadStats, 2000);



let modelsLoaded = false;
let isDetecting = false;
let videoStream = null;

async function loadFaceApiModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
  const statusDiv = document.getElementById('status');
  
  try {
    statusDiv.textContent = 'Loading detection models...';
    
  
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    statusDiv.textContent = 'Models loaded! Starting camera...';
    startFaceDetection();
  } catch (err) {
    statusDiv.textContent = 'Model loading error: ' + err.message;
    console.error('Face-api model loading error:', err);
  }
}

async function startFaceDetection() {
  if (!modelsLoaded) return;
  
  const video = document.getElementById('video');
  const canvas = document.getElementById('overlay');
  const statusDiv = document.getElementById('status');
  const videoContainer = document.getElementById('videoContainer');

  try {

    videoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640, min: 320 },
        height: { ideal: 480, min: 240 },
        facingMode: 'user',
        frameRate: { ideal: 30 }
      },
      audio: false
    });
    
    video.srcObject = videoStream;
    videoContainer.style.display = 'block';

    video.onloadedmetadata = () => {
  
      const displayWidth = 320;
      const displayHeight = 240;
      
      video.width = displayWidth;
      video.height = displayHeight;
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      statusDiv.textContent = 'Detecting faces...';
      isDetecting = true;
      detectFaces();
    };

  } catch (err) {
    statusDiv.textContent = 'Camera access denied or unavailable';
    console.error('Camera error:', err);
  }

  async function detectFaces() {
    if (!isDetecting) return;
    
    try {
    
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({
          minConfidence: 0.3,  
          maxResults: 1
        }))
        .withFaceLandmarks()
        .withFaceExpressions();

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {

        const displaySize = { width: canvas.width, height: canvas.height };
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        
  
        const box = resizedDetection.detection.box;
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
  
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(
          `${Math.round(resizedDetection.detection.score * 100)}%`,
          box.x + 5,
          box.y - 5
        );
        
   
        const landmarks = resizedDetection.landmarks.positions;
        ctx.fillStyle = '#10b981';
        landmarks.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, 2 * Math.PI);
          ctx.fill();
        });
        
  
        updateUI(detection.expressions);
        statusDiv.textContent = '';
      } else {
        statusDiv.textContent = 'No face detected - adjust position';
        statusDiv.className = '';
        clearEmotionBars();
      }
    } catch (err) {
      console.error('Detection error:', err);
      statusDiv.textContent = 'Detection error';
    }


    setTimeout(detectFaces, 100);
  }
}

function calculateStress(expressions) {

  const stressWeight = 
    (expressions.angry || 0) * 0.6 + 
    (expressions.fearful || 0) * 0.5 + 
    (expressions.sad || 0) * 0.4 + 
    (expressions.disgusted || 0) * 0.3;
  
  const positiveWeight = 
    (expressions.happy || 0) * 1.2 + 
    (expressions.neutral || 0) * 0.6;
  

  let score = Math.max(0, Math.min(100, (stressWeight - positiveWeight) * 100));
  
  let level = 'LOW';
  if (score >= 75) level = 'HIGH';
  else if (score >= 50) level = 'MEDIUM';
  
  return { level, score };
}

function updateUI(expressions) {
  const emotions = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];
  
  emotions.forEach(emotion => {
    const value = expressions[emotion] || 0;
    const percentage = Math.round(value * 100);
    
    const bar = document.getElementById(`bar-${emotion}`);
    const pct = document.getElementById(`pct-${emotion}`);
    
    if (bar && pct) {
      bar.style.width = percentage + '%';
      pct.textContent = percentage + '%';
    }
  });


  const stress = calculateStress(expressions);
  const statusDiv = document.getElementById('status');
  statusDiv.className = `stress-${stress.level.toLowerCase()}`;
  statusDiv.textContent = `Stress: ${stress.level} (${Math.round(stress.score)}%)`;
}

function clearEmotionBars() {
  const emotions = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];
  emotions.forEach(emotion => {
    const bar = document.getElementById(`bar-${emotion}`);
    const pct = document.getElementById(`pct-${emotion}`);
    if (bar && pct) {
      bar.style.width = '0%';
      pct.textContent = '0%';
    }
  });
}


window.addEventListener('unload', () => {
  isDetecting = false;
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
  }
});


loadFaceApiModels();
