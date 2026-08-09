const TEST_DURATION_MS = 2 * 60 * 1000;
const STORAGE_KEY = 'nokma-launch-ends-at-v3';
const COMPLETE_KEY = 'nokma-launch-complete-v3';
const COUNTDOWN_ENABLED = true;

function pad(value) {
  return String(value).padStart(2, '0');
}

/** Temporarily gate the site behind a two-minute launch countdown for review. */
export function runLaunchCountdown() {
  const screen = document.getElementById('launchCountdown');
  if (!screen) return Promise.resolve();
  if (!COUNTDOWN_ENABLED) {
    screen.hidden = true;
    return Promise.resolve();
  }
  screen.hidden = false;

  const minutes = document.getElementById('launchMinutes');
  const seconds = document.getElementById('launchSeconds');
  const status = document.getElementById('launchStatus');
  const reset = new URLSearchParams(window.location.search).has('launch-test-reset');

  if (reset) {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(COMPLETE_KEY);
    const url = new URL(window.location.href);
    url.searchParams.delete('launch-test-reset');
    window.history.replaceState({}, '', url);
  }
  if (sessionStorage.getItem(COMPLETE_KEY) === 'true') {
    screen.hidden = true;
    return Promise.resolve();
  }

  let endAt = Number(sessionStorage.getItem(STORAGE_KEY));
  if (!Number.isFinite(endAt) || endAt <= Date.now()) {
    endAt = Date.now() + TEST_DURATION_MS;
    sessionStorage.setItem(STORAGE_KEY, String(endAt));
  }

  document.body.classList.add('is-launching');

  return new Promise((resolve) => {
    let timer = null;

    const revealSite = () => {
      window.clearInterval(timer);
      status.textContent = 'We are live';
      sessionStorage.setItem(COMPLETE_KEY, 'true');
      screen.classList.add('is-complete');
      document.body.classList.remove('is-launching');
      window.setTimeout(() => {
        screen.hidden = true;
        resolve();
      }, 650);
    };

    const tick = () => {
      const remaining = Math.max(0, endAt - Date.now());
      const totalSeconds = Math.ceil(remaining / 1000);
      minutes.textContent = pad(Math.floor(totalSeconds / 60));
      seconds.textContent = pad(totalSeconds % 60);

      if (remaining === 0) revealSite();
    };

    tick();
    timer = window.setInterval(tick, 250);
  });
}
