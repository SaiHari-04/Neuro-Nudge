function sendStatsUpdateToPanel() {
  chrome.runtime.sendMessage(
    { type: "STATSUPDATE", data: calculateStats() },
    () => {
      if (chrome.runtime.lastError) {
        // Side panel is not open
      }
    }
  );
}