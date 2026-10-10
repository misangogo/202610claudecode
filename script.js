const display = document.getElementById("display");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

let elapsedMs = 0;
let intervalId = null;
let lastTick = 0;

function format(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function render() {
  display.textContent = format(elapsedMs);
}

function start() {
  if (intervalId !== null) return;
  lastTick = Date.now();
  intervalId = setInterval(() => {
    const now = Date.now();
    elapsedMs += now - lastTick;
    lastTick = now;
    render();
  }, 200);
}

function stop() {
  clearInterval(intervalId);
  intervalId = null;
}

function reset() {
  stop();
  elapsedMs = 0;
  render();
}

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", reset);

render();
