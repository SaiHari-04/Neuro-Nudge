let keystrokeData = {
  pressTime: null,
  releaseTime: null,
  dwellTimes: [],
  flightTimes: [],
  typingSpeed: 0,
  errors: 0,
  totalKeys: 0,
  lastKeyTime: null,

};

function sendStatsUpdate() {
  chrome.runtime.sendMessage({ type: "KEYSTROKEDATA", data: keystrokeData });
}

function getRandomMotivation() {
  const messages = [
    "Take a deep breath and relax your face. Remember, your calmness is your superpower in stressful times.",
    "Stretch your arms and take a short walk. Moving your body helps clear your mind and release tension.",
    "Close your eyes for a minute and breathe deeply. Focus on the rhythm of your breath to find inner peace.",
    "Listen to your favorite song and unwind. Music can soothe your spirit and lighten your mood.",
    "Drink a glass of water and refresh yourself. Hydration is key to maintaining your energy and focus.",
    "Stand up and do some gentle neck rolls. This simple movement can relieve built-up tension and improve circulation.",
    "Write down 3 things you are grateful for today. Gratitude shifts your focus from stress to positivity.",
    "Look away from the screen and focus on something distant. Give your eyes and mind a well-deserved break.",
    "Take a moment to meditate or practice mindfulness. Being present helps ease anxiety and regain clarity.",
    "Smile! It can instantly lighten your mood and help you cope better with stress.",
    "Remember, stress is temporary, and each breath you take is a step toward calmness and control.",
    "You are stronger than your stress. Take this moment to reset, recharge, and move forward with confidence.",
    "Challenges are opportunities to grow. Embrace this stress as a pathway to resilience and inner peace."
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function showStressDialog() {
  if (document.getElementById('stress-nudge-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'stress-nudge-overlay';
  overlay.style = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(248, 250, 252, 0.9); /* very light solid background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999999;
    padding: 20px;
  `;

  const dialog = document.createElement('div');
  dialog.style = `
    background: #ffffff;
    border: 2px solid #cbd5e1; /* light slate outline */
    border-radius: 20px;
    max-width: 600px;
    width: 90%;
    padding: 40px 50px;
    text-align: center;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #222;
  `;

  const title = document.createElement('h2');
  title.textContent = "You seem stressed";
  title.style = `
    font-size: 36px;
    margin-bottom: 25px;
    font-weight: 700;
  `;

  const quote = document.createElement('p');
  quote.textContent = getRandomMotivation();
  quote.style = `
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 35px;
    line-height: 1.6;
  `;

  const bigLine = document.createElement('div');
  bigLine.textContent = "Breathe. Relax. Recharge.";
  bigLine.style = `
    font-size: 32px;
    font-weight: bold;
    color: #444;
    margin: 30px 0;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = "Got it!";
  closeBtn.style = `
    background-color: transparent;
    color: #3b82f6; /* blue text button */
    border: 2px solid #3b82f6;
    padding: 14px 30px;
    border-radius: 10px;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
  `;
  closeBtn.onmouseenter = () => {
    closeBtn.style.backgroundColor = "#3b82f6";
    closeBtn.style.color = "#fff";
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.backgroundColor = "transparent";
    closeBtn.style.color = "#3b82f6";
  };

  closeBtn.onclick = () => overlay.remove();

  dialog.appendChild(title);
  dialog.appendChild(quote);
  dialog.appendChild(bigLine);
  dialog.appendChild(closeBtn);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}


chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SHOW_STRESS_NUDGE') {
    showStressDialog();
  }
});


document.addEventListener("keydown", (e) => {
  chrome.runtime.sendMessage({
    type: "KEY_EVENT",
    eventType: "keydown",
    key: e.key,
    timestamp: Date.now()
  });
});

document.addEventListener("keyup", (e) => {
  chrome.runtime.sendMessage({
    type: "KEY_EVENT",
    eventType: "keyup",
    key: e.key,
    timestamp: Date.now()
  });
});


