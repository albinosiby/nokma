const LAUNCH_AT = new Date('2026-08-10T14:30:00+05:30').getTime();

function pad(value) {
  return String(value).padStart(2, '0');
}

/** Gate the site until one fixed global launch timestamp. */
export function runLaunchCountdown() {
  const screen = document.getElementById('launchCountdown');
  if (!screen || Date.now() >= LAUNCH_AT) return Promise.resolve();

  const hours = document.getElementById('launchHours');
  const minutes = document.getElementById('launchMinutes');
  const seconds = document.getElementById('launchSeconds');
  const status = document.getElementById('launchStatus');
  screen.hidden = false;
  document.body.classList.add('is-launching');

  return new Promise((resolve) => {
    let timer = null;

    const revealSite = () => {
      window.clearInterval(timer);
      status.textContent = 'We are live';
      screen.classList.add('is-complete');
      document.body.classList.remove('is-launching');
      window.setTimeout(() => {
        screen.hidden = true;
        resolve();
      }, 650);
    };

    const tick = () => {
      const remaining = Math.max(0, LAUNCH_AT - Date.now());
      const totalSeconds = Math.ceil(remaining / 1000);
      hours.textContent = pad(Math.floor(totalSeconds / 3600));
      minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
      seconds.textContent = pad(totalSeconds % 60);

      if (remaining === 0) revealSite();
    };

    tick();
    timer = window.setInterval(tick, 250);
  });
}
