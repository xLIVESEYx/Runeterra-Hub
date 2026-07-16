let rafId = null;
let running = false;
let resizeHandler = null;
let visibilityHandler = null;
let resizeTimer = null;

export function initParticles() {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  const COUNT = window.innerWidth < 768 ? 30 : 75;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: Math.random() * -0.4 - 0.1,
      r: Math.random() * 2 + 0.4,
      a: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.4 ? "200, 155, 60" : "130, 90, 240",
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.a -= 0.0005;

      if (p.y < 0 || p.a <= 0) {
        p.y = canvas.height;
        p.x = Math.random() * canvas.width;
        p.a = Math.random() * 0.4 + 0.1;
      }
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.a})`;
      ctx.fill();
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    tick();
  }

  function stop() {
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  resizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); makeParticles(); }, 200);
  };
  window.addEventListener("resize", resizeHandler);

  visibilityHandler = () => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener("visibilitychange", visibilityHandler);

  resize();
  makeParticles();

  if (document.hidden) return;

  running = true;
  tick();
}

export function stopParticles() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  running = false;
  if (resizeTimer) {
    clearTimeout(resizeTimer);
    resizeTimer = null;
  }
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
}
