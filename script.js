const timeEl = document.getElementById("time");
const centisEl = document.getElementById("centis");
const statusText = document.getElementById("statusText");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

let elapsedMs = 0;
let intervalId = null;
let lastTick = 0;

function format(ms) {
  const totalMs = Math.max(0, ms);
  const minutes = String(Math.floor(totalMs / 60000)).padStart(2, "0");
  const seconds = String(Math.floor(totalMs / 1000) % 60).padStart(2, "0");
  const centis = String(Math.floor(totalMs / 10) % 100).padStart(2, "0");
  return { minutes, seconds, centis };
}

function render() {
  const { minutes, seconds, centis } = format(elapsedMs);
  timeEl.textContent = `${minutes}:${seconds}`;
  centisEl.textContent = `.${centis}`;
}

function setRunning(running) {
  document.body.classList.toggle("running", running);
  startBtn.disabled = running;
  stopBtn.disabled = !running;
  statusText.textContent = running ? "Running" : elapsedMs > 0 ? "Paused" : "Ready";
}

function start() {
  if (intervalId !== null) return;
  lastTick = Date.now();
  intervalId = setInterval(() => {
    const now = Date.now();
    elapsedMs += now - lastTick;
    lastTick = now;
    render();
  }, 10);
  setRunning(true);
}

function stop() {
  clearInterval(intervalId);
  intervalId = null;
  setRunning(false);
}

function reset() {
  stop();
  elapsedMs = 0;
  render();
  setRunning(false);
}

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", reset);

render();
setRunning(false);
