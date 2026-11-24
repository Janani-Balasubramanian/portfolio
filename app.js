// ═══ SETUP ═══════════════════════════════════════════════════════
const canvas = document.querySelector('#field');
const ctx    = canvas.getContext('2d');
const motion = document.querySelector('#motion');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const fine       = matchMedia('(hover:hover) and (pointer:fine)');

let paused = preference.matches;
let mode   = 'orbit';
let time   = 0, frame = 0, last = 0, inView = true, w = 0, h = 0;
let pointer = { x: -1000, y: -1000 };
let pulse   = 0;

// ═══ PARTICLES (foreground stars) ════════════════════════════════
const particles = Array.from({ length: 260 }, (_, i) => ({
  x: 0, y: 0, index: i, seed: i * 2.399963,
  size: i % 23 === 0 ? 2.6 : i % 7 === 0 ? 1.8 : 1.1,
}));

// ═══ BACKGROUND STARS (fixed, decorative) ════════════════════════
const bgStars = Array.from({ length: 200 }, () => ({
  x:  Math.random(),
  y:  Math.random(),
  r:  Math.random() * 0.9 + 0.2,
  o:  Math.random() * 0.45 + 0.08,
  tw: Math.random() * Math.PI * 2,
}));

// ═══ SHOOTING STARS ═══════════════════════════════════════════════
let shooters       = [];
let shootTimer     = 0;
let shootDelay     = 3.5 + Math.random() * 3;

function spawnShooter() {
  const angle = Math.PI * 0.17 + (Math.random() - 0.5) * 0.35;
  const speed = 5 + Math.random() * 3.5;
  shooters.push({
    x: Math.random() * w * 0.72,
    y: Math.random() * h * 0.38,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
  });
  shootDelay = 3 + Math.random() * 5;
  shootTimer = 0;
}

// ═══ GEOMETRY ═════════════════════════════════════════════════════
function target(p) {
  const r  = Math.min(w * 0.38, h * 0.36);
  const cx = w * 0.54, cy = h * 0.44;
  const i  = p.index;

  if (mode === 'wave') {
    return {
      x: w * 0.1 + (i % 26) / 25 * w * 0.82,
      y: cy + Math.sin(i % 26 * 0.24 + time * 1.4 + Math.floor(i / 26) * 0.22) * r * 0.5
           + (Math.floor(i / 26) - 4.5) * 11,
    };
  }
  if (mode === 'galaxy') {
    const dist = Math.sqrt(i / 259) * r;
    const arm  = (i % 3) * Math.PI * 2 / 3;
    const a    = arm + dist / r * 4.5 + time * 0.18;
    return { x: cx + Math.cos(a) * dist, y: cy + Math.sin(a) * dist * 0.63 };
  }
  // orbit / globe
  const lat  = 1 - 2 * i / 259;
  const ring = Math.sqrt(1 - lat * lat);
  const a    = p.seed + time * 0.24;
  return { x: cx + Math.cos(a) * ring * r, y: cy + lat * r * 0.85 + Math.sin(a) * ring * r * 0.28 };
}

// ═══ RENDER ═══════════════════════════════════════════════════════
function render(snap = false) {
  ctx.clearRect(0, 0, w, h);

  // Stratosphere ambient radial glow
  const bgGrad = ctx.createRadialGradient(w * 0.54, h * 0.44, 0, w * 0.54, h * 0.44, Math.max(w, h) * 0.75);
  bgGrad.addColorStop(0,   'rgba(56, 189, 248, 0.18)');
  bgGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.08)');
  bgGrad.addColorStop(1,   'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // ── Fixed background stars ──────────────────────────────────────
  bgStars.forEach(s => {
    const twinkle = s.o + Math.sin(time * 1.2 + s.tw) * 0.14;
    ctx.globalAlpha = Math.max(0.04, Math.min(1, twinkle));
    ctx.fillStyle = '#e8f4fd';
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // ── Shooting stars ──────────────────────────────────────────────
  shooters = shooters.filter(s => s.life > 0);
  shooters.forEach(s => {
    const tx = s.x - s.vx * 22, ty = s.y - s.vy * 22;
    const sg = ctx.createLinearGradient(s.x, s.y, tx, ty);
    sg.addColorStop(0, `rgba(179,229,252,${s.life})`);
    sg.addColorStop(0.4, `rgba(135,206,235,${s.life * 0.5})`);
    sg.addColorStop(1, 'rgba(135,206,235,0)');
    ctx.strokeStyle = sg;
    ctx.lineWidth = 1.5 * s.life;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    if (!snap) { s.x += s.vx; s.y += s.vy; s.life -= 0.022; }
  });

  // ── Nebula glow ─────────────────────────────────────────────────
  const cx = w * 0.54, cy = h * 0.44, r = Math.min(w * 0.4, h * 0.38);
  const neb = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.65);
  neb.addColorStop(0,   'rgba(79,195,247,.08)');
  neb.addColorStop(0.4, 'rgba(135,206,235,.03)');
  neb.addColorStop(1,   'rgba(0,229,255,0)');
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, w, h);

  // ── Move foreground particles ───────────────────────────────────
  particles.forEach(p => {
    let t = target(p);
    const dx = t.x - pointer.x, dy = t.y - pointer.y;
    const d = Math.hypot(dx, dy);
    if (!paused && d < 110 && d > 0) { t.x += dx / d * (110 - d) * 0.4; t.y += dy / d * (110 - d) * 0.4; }
    p.x = snap ? t.x : p.x + (t.x - p.x) * 0.08;
    p.y = snap ? t.y : p.y + (t.y - p.y) * 0.08;
  });

  // ── Connections ─────────────────────────────────────────────────
  ctx.lineWidth = 0.5;
  particles.forEach((p, i) => {
    if (i % 2 === 0) {
      for (let j = i + 1; j < Math.min(i + 10, particles.length); j++) {
        const q = particles[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 55) {
          ctx.strokeStyle = `rgba(135,206,235,${(1 - d / 55) * 0.18})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
  });

  // ── Foreground particles ────────────────────────────────────────
  particles.forEach((p, i) => {
    const tw = 0.45 + (Math.sin(p.seed + time * 1.6) + 1) * 0.27;
    ctx.globalAlpha = tw;
    if (i % 23 === 0) {
      ctx.fillStyle = '#00e5ff'; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 9;
    } else if (i % 7 === 0) {
      ctx.fillStyle = '#87ceeb'; ctx.shadowColor = '#87ceeb'; ctx.shadowBlur = 5;
    } else {
      ctx.fillStyle = '#e8f4fd'; ctx.shadowBlur = 0;
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;

  // ── Orbital ring (orbit mode only) ──────────────────────────────
  if (mode === 'orbit') {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-0.4);
    ctx.strokeStyle = 'rgba(135,206,235,.22)'; ctx.lineWidth = 0.8;
    ctx.setLineDash([5, 10]);
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.12, r * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // satellite dot
    const a = time * 0.35;
    ctx.fillStyle = '#00e5ff'; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(Math.cos(a) * r * 1.12, Math.sin(a) * r * 0.38, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.restore();
  }

  // ── Click pulse ─────────────────────────────────────────────────
  if (pulse > 0 && !paused) {
    ctx.strokeStyle = `rgba(135,206,235,${pulse * 0.55})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y, (1 - pulse) * 170 + 5, 0, Math.PI * 2); ctx.stroke();
    pulse = Math.max(0, pulse - 0.018);
  }
}

// ═══ LOOP ═════════════════════════════════════════════════════════
function tick(now) {
  frame = 0;
  if (paused || !inView || document.hidden) return;
  const dt = Math.min(now - (last || now), 40) / 1000;
  time += dt; last = now;
  // Shooting star timer
  shootTimer += dt;
  if (shootTimer >= shootDelay) spawnShooter();
  render();
  frame = requestAnimationFrame(tick);
}

function start() {
  if (!frame && !paused && inView && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); }
}

function resize() {
  w = canvas.clientWidth; h = canvas.clientHeight;
  const dpr = Math.min(devicePixelRatio, 2);
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); render(true);
}

// ═══ PAUSE / UPDATE ═══════════════════════════════════════════════
function update() {
  document.body.classList.toggle('paused', paused);
  document.documentElement.classList.toggle('motion-paused', paused);
  motion.textContent = paused ? 'Resume motion' : 'Pause motion';
  motion.setAttribute('aria-pressed', String(paused));
  if (paused) {
    cancelAnimationFrame(frame); frame = 0;
    document.querySelectorAll('.waiting').forEach(el => el.classList.remove('waiting'));
    render(true);
  } else { start(); }
}

// ═══ EVENTS ═══════════════════════════════════════════════════════
canvas.addEventListener('pointermove', e => {
  if (paused) return;
  const r = canvas.getBoundingClientRect();
  pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
});
canvas.addEventListener('pointerdown', e => {
  if (paused) return;
  const r = canvas.getBoundingClientRect();
  pointer = { x: e.clientX - r.left, y: e.clientY - r.top }; pulse = 1;
});
canvas.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; });

document.querySelectorAll('.mode').forEach(button => {
  button.addEventListener('click', () => {
    mode = button.dataset.mode;
    const hudMode = document.querySelector('#hud-mode');
    if (hudMode) hudMode.textContent = mode.toUpperCase();
    document.querySelectorAll('.mode').forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    if (paused) render(true); else start();
  });
});

motion.addEventListener('click', () => { paused = !paused; update(); });
preference.addEventListener('change', e => { paused = e.matches; update(); });
addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else start();
});

new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting;
  if (inView) start(); else { cancelAnimationFrame(frame); frame = 0; }
}, { rootMargin: '50px' }).observe(canvas);

resize(); update();

// ═══ SCROLL REVEAL ════════════════════════════════════════════════
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.remove('waiting'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.06 });

document.querySelectorAll('.reveal').forEach(el => {
  if (!paused) { el.classList.add('waiting'); revealObs.observe(el); }
});
document.addEventListener('focusin', e => e.target.closest('.waiting')?.classList.remove('waiting'));

// ═══ CURSOR AURA ══════════════════════════════════════════════════
const aura = document.querySelector('.cursor-aura');
addEventListener('pointermove', e => {
  if (!fine.matches || paused) return;
  aura.classList.add('visible');
  aura.style.transform = `translate(${e.clientX - 12}px,${e.clientY - 12}px)`;
});
document.documentElement.addEventListener('pointerleave', () => aura.classList.remove('visible'));

// ═══ READING PROGRESS + NAV ═══════════════════════════════════════
const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);

const links    = [...document.querySelectorAll('nav a')];
const sections = links.map(a => document.querySelector(a.getAttribute('href')));
let scrollFrame = 0;

function scrollState() {
  scrollFrame = 0;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  let active = -1;
  sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) active = i; });
  links.forEach((a, i) => {
    if (i === active) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  });
}

addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollState); }, { passive: true });
addEventListener('resize', scrollState);
document.querySelectorAll('details').forEach(d => d.addEventListener('toggle', scrollState));
scrollState();
document.querySelector('#year').textContent = new Date().getFullYear();
