/**
 * Youth Wicket Foundation — script.js v4
 * Parallax orbs · SVG bar chart · Cricket ball viz
 * Countup · Ticker · Stripe · Ripple · All micro-interactions
 */
'use strict';

/* ─────────────────────────────────────────────────────
   UTILITY
───────────────────────────────────────────────────── */
function qs(sel, ctx)  { return (ctx || document).querySelector(sel);  }
function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

/* ─────────────────────────────────────────────────────
   PARTICLE CANVAS — HERO
   120 dual-tone (blue/gold) rising particles
───────────────────────────────────────────────────── */
(function heroParticles() {
    const canvas = qs('#heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [];

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    class P {
        constructor() { this.reset(true); }
        reset(rand) {
            this.x    = Math.random() * (W || 1400);
            this.y    = rand ? Math.random() * (H || 900) : (H || 900) + 10;
            this.r    = Math.random() * 1.6 + 0.4;
            this.vx   = (Math.random() - 0.5) * 0.28;
            this.vy   = -(Math.random() * 0.42 + 0.12);
            this.a    = Math.random() * 0.45 + 0.12;
            this.life = Math.random() * 220 + 80;
            this.age  = rand ? Math.random() * this.life : 0;
            this.hue  = Math.random() > 0.55 ? 215 : 44; // blue or gold
        }
        tick() { this.x += this.vx; this.y += this.vy; this.age++; if (this.age > this.life || this.y < -4) this.reset(false); }
        draw() {
            const fade = Math.min(this.age / 18, 1) * Math.min((this.life - this.age) / 18, 1);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue},80%,72%,${this.a * fade})`;
            ctx.fill();
        }
    }

    function init() { resize(); pts = Array.from({ length: 120 }, () => new P()); }
    function loop() { ctx.clearRect(0, 0, W, H); pts.forEach(p => { p.tick(); p.draw(); }); requestAnimationFrame(loop); }
    init(); loop();
    window.addEventListener('resize', resize, { passive: true });
})();

/* ─────────────────────────────────────────────────────
   PARTICLE CANVAS — CTA SECTION
───────────────────────────────────────────────────── */
(function ctaParticles() {
    const canvas = qs('#ctaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [];

    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    class P {
        constructor() { this.x = Math.random() * 1200; this.y = Math.random() * 600; this.r = Math.random() * 1.2 + 0.3; this.vx = (Math.random() - 0.5) * 0.22; this.vy = -(Math.random() * 0.28 + 0.08); this.a = Math.random() * 0.35 + 0.1; }
        tick() { this.x += this.vx; this.y += this.vy; if (this.y < -4) { this.y = (H || 600) + 4; this.x = Math.random() * (W || 1200); } }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(251,191,36,${this.a})`; ctx.fill(); }
    }
    function init() { resize(); pts = Array.from({ length: 60 }, () => new P()); }
    function loop() { ctx.clearRect(0, 0, W, H); pts.forEach(p => { p.tick(); p.draw(); }); requestAnimationFrame(loop); }
    init(); loop();
    window.addEventListener('resize', resize, { passive: true });
})();

/* ─────────────────────────────────────────────────────
   SCROLL PROGRESS BAR
───────────────────────────────────────────────────── */
const scrollFill = qs('#scrollFill');
function updateScrollProgress() {
    const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollFill && total > 0) scrollFill.style.height = (window.scrollY / total * 100) + '%';
}

/* ─────────────────────────────────────────────────────
   NAV — scroll state
───────────────────────────────────────────────────── */
const mainNav = qs('#mainNav');
function updateNav() {
    if (mainNav) mainNav.classList.toggle('scrolled', window.scrollY > 80);
}

/* ─────────────────────────────────────────────────────
   FLOATING DONATE BAR
───────────────────────────────────────────────────── */
const floatBar = qs('#floatBar');
function updateFloat() {
    if (!floatBar) return;
    const show = window.scrollY > 600;
    const donSection = qs('#donations');
    const inView = donSection && (() => { const r = donSection.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; })();
    floatBar.classList.toggle('show', show && !inView);
    floatBar.setAttribute('aria-hidden', String(!(show && !inView)));
}

/* ─────────────────────────────────────────────────────
   PARALLAX — hero orbs follow scroll
   Each orb has data-parallax-speed; we offset translateY
───────────────────────────────────────────────────── */
function updateParallax() {
    const scrollY = window.scrollY;
    qsa('[data-parallax-speed]').forEach(el => {
        const speed = parseFloat(el.dataset.parallaxSpeed || 0.05);
        el.style.transform = `translateY(${scrollY * speed}px)`;
    });
}

/* ─────────────────────────────────────────────────────
   UNIFIED RAF SCROLL HANDLER
───────────────────────────────────────────────────── */
let rafPending = false;
window.addEventListener('scroll', () => {
    if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
            updateScrollProgress();
            updateNav();
            updateFloat();
            updateParallax();
            rafPending = false;
        });
    }
}, { passive: true });

/* ─────────────────────────────────────────────────────
   REVEAL OBSERVER — fade-up / fade-left / fade-right / scale-in
   Fires once per element, then unobserves for performance
───────────────────────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('is-vis');
            revealObs.unobserve(e.target);
        }
    });
}, { threshold: 0.10, rootMargin: '0px 0px -48px 0px' });

qsa('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => revealObs.observe(el));

/* Hero elements fire immediately on load (already visible) */
function fireHeroReveal() {
    qsa('.hero .fade-up').forEach((el, i) => {
        setTimeout(() => el.classList.add('is-vis'), 80 + i * 130);
    });
}

/* ─────────────────────────────────────────────────────
   COUNT-UP ANIMATION
   Formats large numbers: 1.5B, 200K, etc.
───────────────────────────────────────────────────── */
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

function animateCount(el, target, dur = 2300) {
    const fmt = n => {
        if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1000 && target >= 1000) return Math.round(n).toLocaleString();
        return Math.round(n).toString();
    };
    const start = performance.now();
    (function tick(now) {
        const pct = Math.min((now - start) / dur, 1);
        el.textContent = fmt(easeOutQuart(pct) * target);
        if (pct < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target);
    })(start);
}

const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const t = parseFloat(e.target.dataset.target);
            if (!isNaN(t)) animateCount(e.target, t);
            countObs.unobserve(e.target);
        }
    });
}, { threshold: 0.30 });
qsa('.countup').forEach(el => countObs.observe(el));

/* ─────────────────────────────────────────────────────
   HERO FUNDRAISING PROGRESS — animated on load
───────────────────────────────────────────────────── */
function animateHeroFund() {
    const fill    = qs('#fundFill');
    const raised  = qs('#heroRaised');
    const donors  = qs('#heroDonors');
    const pctEl   = qs('#heroPct');
    const RAISED  = 14320, GOAL = 25000, DONORS = 187;
    const PCT     = Math.round(RAISED / GOAL * 100);

    // Animate bar
    setTimeout(() => { if (fill) fill.style.width = PCT + '%'; }, 700);

    // Animate $ raised
    if (raised) {
        const start = performance.now();
        const dur   = 2100;
        (function tick(now) {
            const p  = Math.min((now - start) / dur, 1);
            const v  = Math.round(easeOutQuart(p) * RAISED);
            raised.innerHTML = `<strong>$${v.toLocaleString()}</strong>`;
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }

    // Animate donors
    if (donors) {
        const start = performance.now(), dur = 2200;
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            donors.textContent = Math.round(easeOutQuart(p) * DONORS);
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }

    if (pctEl) pctEl.textContent = PCT + '% funded';
}

/* ─────────────────────────────────────────────────────
   CAMPAIGN PROGRESS BAR (donation section)
───────────────────────────────────────────────────── */
const cpObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const fill = qs('#cpFill');
            const glow = qs('.cp-glow');
            if (fill) setTimeout(() => { fill.style.width = '57%'; }, 300);
            if (glow) setTimeout(() => { glow.style.right = 'calc(43% - 6px)'; }, 2400); // sync with fill transition
            cpObs.unobserve(e.target);
        }
    });
}, { threshold: 0.2 });
const cpEl = qs('.cp');
if (cpEl) cpObs.observe(cpEl);

/* ─────────────────────────────────────────────────────
   STATS BAR CHART ANIMATION (zero-fields card)
   Triggers when the stat section enters view
───────────────────────────────────────────────────── */
const chartObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            // Animate all .zc-bar elements by adding .is-animated
            qsa('.zc-bar').forEach((bar, i) => {
                setTimeout(() => bar.classList.add('is-animated'), i * 180 + 300);
            });
            chartObs.unobserve(e.target);
        }
    });
}, { threshold: 0.4 });
const statCardDark = qs('.stat-card-dark');
if (statCardDark) chartObs.observe(statCardDark);

/* ─────────────────────────────────────────────────────
   CRICKET BALL VISUALIZER
   Shows cricket ball SVGs based on selected donation tier.
   $25 → 6 balls, $50 → 1 session icon, $100 → mat icon,
   $500 → field tile icons, custom → scaled balls
───────────────────────────────────────────────────── */
const BALL_SVG = `<svg viewBox="0 0 48 48" class="ball-viz-ball" aria-hidden="true">
  <circle cx="24" cy="24" r="22" fill="#dc2626" opacity=".85"/>
  <path d="M24 2 C14 8 10 16 10 24 C10 32 14 40 24 46" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.5"/>
  <path d="M24 2 C34 8 38 16 38 24 C38 32 34 40 24 46" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.5"/>
  <line x1="12" y1="17" x2="16" y2="15" stroke="rgba(255,255,255,.45)" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="12" y1="22" x2="16" y2="21" stroke="rgba(255,255,255,.45)" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="12" y1="27" x2="16" y2="28" stroke="rgba(255,255,255,.45)" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="36" y1="17" x2="32" y2="15" stroke="rgba(255,255,255,.45)" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="36" y1="22" x2="32" y2="21" stroke="rgba(255,255,255,.45)" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="36" y1="27" x2="32" y2="28" stroke="rgba(255,255,255,.45)" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const FADED_BALL_SVG = `<svg viewBox="0 0 48 48" class="ball-viz-ball ball-viz-ball-faded" aria-hidden="true">
  <circle cx="24" cy="24" r="22" fill="none" stroke="#e4ddd4" stroke-width="2" stroke-dasharray="6,4"/>
</svg>`;

const WICKET_SVG = `<svg viewBox="0 0 48 48" class="ball-viz-ball" style="color:var(--gold)" aria-hidden="true">
  <rect x="10" y="6" width="5" height="34" rx="2" fill="currentColor"/>
  <rect x="21.5" y="6" width="5" height="34" rx="2" fill="currentColor"/>
  <rect x="33" y="6" width="5" height="34" rx="2" fill="currentColor"/>
  <rect x="8" y="4" width="9" height="5" rx="1.5" fill="currentColor" opacity=".7"/>
  <rect x="30" y="4" width="9" height="5" rx="1.5" fill="currentColor" opacity=".7"/>
</svg>`;

const MAT_SVG = `<svg viewBox="0 0 48 48" class="ball-viz-ball" style="color:var(--blue)" aria-hidden="true">
  <rect x="6" y="14" width="36" height="20" rx="3" fill="currentColor" opacity=".2" stroke="currentColor" stroke-width="2"/>
  <line x1="6" y1="20" x2="42" y2="20" stroke="currentColor" stroke-width="1.5"/>
  <line x1="6" y1="28" x2="42" y2="28" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="4" fill="currentColor"/>
</svg>`;

// Map amount (cents) to visualization config
function getBallConfig(cents) {
    if (cents === 2500) return { type: 'balls', count: 6,  total: 6,  caption: '6 professional cricket balls for player training' };
    if (cents === 5000) return { type: 'balls', count: 12, total: 12, caption: '1 full practice session funded for the entire team' };
    if (cents === 10000) return { type: 'mat',  count: 1,  total: 1,  caption: '1 portable batting mat for year-round skill-building' };
    if (cents === 50000) return { type: 'wickets', count: 3, total: 3, caption: '3 professional wicket sets + field marking materials' };
    // Custom — scale balls (1 ball per $4)
    const dollars = Math.round(cents / 100);
    if (dollars < 4)   return { type: 'balls', count: 0, total: 6, caption: 'Every dollar gets us closer to a complete field' };
    const count = Math.min(Math.round(dollars / 4), 20);
    return { type: 'balls', count, total: Math.max(count, 6), caption: `~${count} cricket ball${count !== 1 ? 's' : ''} for Triangle youth cricketers` };
}

function renderBallViz(cents) {
    const container = qs('#ballVizBalls');
    const caption   = qs('#ballVizCaption');
    if (!container) return;

    const cfg = getBallConfig(cents);
    container.innerHTML = '';

    if (cfg.type === 'mat') {
        container.innerHTML = MAT_SVG;
    } else if (cfg.type === 'wickets') {
        for (let i = 0; i < cfg.count; i++) container.insertAdjacentHTML('beforeend', WICKET_SVG);
    } else {
        // Filled balls + faded remainder
        for (let i = 0; i < cfg.count;   i++) container.insertAdjacentHTML('beforeend', BALL_SVG);
        for (let i = cfg.count; i < cfg.total; i++) container.insertAdjacentHTML('beforeend', FADED_BALL_SVG);
    }

    // Stagger the pop-in animation
    qsa('.ball-viz-ball', container).forEach((el, i) => {
        el.style.animationDelay = `${i * 60}ms`;
    });

    if (caption) caption.textContent = cfg.caption;
}

/* ─────────────────────────────────────────────────────
   DONOR TICKER
───────────────────────────────────────────────────── */
(function buildTicker() {
    const donors = [
        { name:'Priya S.',   loc:'Cary, NC',    amt:'$50',   label:'Training Starter Pack' },
        { name:'Rahul M.',   loc:'Apex, NC',    amt:'$100',  label:'Practice Mat & Aids' },
        { name:'Jessica T.', loc:'Durham, NC',  amt:'$25',   label:'Cricket Balls' },
        { name:'Deepak P.',  loc:'Cary, NC',    amt:'$500',  label:'Field Champion' },
        { name:'Amy L.',     loc:'Chapel Hill', amt:'$50',   label:'Training Pack' },
        { name:'Suresh R.',  loc:'Apex, NC',    amt:'$200',  label:'Custom donation' },
        { name:'Ananya K.',  loc:'Raleigh, NC', amt:'$100',  label:'Practice Mat & Aids' },
        { name:'David W.',   loc:'Morrisville', amt:'$75',   label:'Custom donation' },
        { name:'Meera N.',   loc:'Cary, NC',    amt:'$1,000',label:'Field Champion' },
        { name:'Tariq A.',   loc:'Apex, NC',    amt:'$25',   label:'Cricket Balls' },
    ];
    const track = qs('#tickerTrack');
    if (!track) return;
    const all = [...donors, ...donors]; // doubled for seamless loop
    track.innerHTML = all.map(d =>
        `<span class="ticker-item"><strong>${d.name}</strong> from ${d.loc} donated <strong>${d.amt}</strong> → ${d.label}</span>`
    ).join('');
})();

/* ─────────────────────────────────────────────────────
   SMOOTH SCROLL (with fixed-nav offset)
───────────────────────────────────────────────────── */
qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const target = qs(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
});

/* ─────────────────────────────────────────────────────
   RIPPLE EFFECT — injected keyframe, applied to all CTAs
───────────────────────────────────────────────────── */
document.head.insertAdjacentHTML('beforeend', '<style>@keyframes rippleAnim{to{transform:scale(4);opacity:0;}}</style>');

function addRipple(btn) {
    btn.addEventListener('click', function(e) {
        if (this.disabled) return;
        const r    = this.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        const rip  = document.createElement('span');
        Object.assign(rip.style, {
            position: 'absolute',
            borderRadius: '50%',
            width:  size + 'px',
            height: size + 'px',
            left:   (e.clientX - r.left - size / 2) + 'px',
            top:    (e.clientY - r.top  - size / 2) + 'px',
            background:  'rgba(255,255,255,0.22)',
            transform:   'scale(0)',
            animation:   'rippleAnim 0.65s ease-out forwards',
            pointerEvents: 'none',
            zIndex: '99',
        });
        if (getComputedStyle(this).position === 'static') this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(rip);
        setTimeout(() => rip.remove(), 700);
    });
}
qsa('.btn, .donate-btn, .nav-cta, .float-btn, .urgency-link').forEach(addRipple);

/* ─────────────────────────────────────────────────────
   DONATION WIDGET STATE
───────────────────────────────────────────────────── */
let selectedCents = 10000;
let selectedLabel = 'Practice Mat &amp; Training Aids';

const amtBtns   = qsa('.amt');
const customInp = qs('#customAmt');
const ibAmt     = qs('#ibAmt');
const ibLabel   = qs('#ibLabel');
const donateBtn = qs('#donateBtn');
const dBtnText  = qs('#dBtnText');
const dBtnLdr   = qs('#dBtnLoader');
const donErr    = qs('#donationError');

function centsToStr(cents) {
    const d = cents / 100;
    return '$' + (Number.isInteger(d) ? d.toLocaleString() : d.toFixed(2));
}

function refreshWidget() {
    const str = centsToStr(selectedCents);
    if (ibAmt)    ibAmt.textContent  = str;
    if (ibLabel)  ibLabel.innerHTML  = selectedLabel;
    if (dBtnText) dBtnText.innerHTML = `<svg viewBox="0 0 48 48" style="width:18px;height:18px;flex-shrink:0" aria-hidden="true"><use href="#ico-ball"/></svg> Donate ${str} Securely`;
    if (donateBtn) donateBtn.setAttribute('aria-label', `Donate ${str} to Youth Wicket Foundation`);
    renderBallViz(selectedCents);
    hideErr();
}

amtBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (customInp) customInp.value = '';
        amtBtns.forEach(b => { b.classList.remove('amt-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('amt-active');
        btn.setAttribute('aria-pressed', 'true');
        selectedCents = parseInt(btn.dataset.amount, 10);
        selectedLabel = btn.dataset.label || 'Donation';
        refreshWidget();
    });
    // Arrow key navigation between amount buttons
    btn.addEventListener('keydown', e => {
        const arr  = [...amtBtns];
        const idx  = arr.indexOf(btn);
        let next   = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = arr[idx + 1] || arr[0];
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   next = arr[idx - 1] || arr[arr.length - 1];
        if (next) { e.preventDefault(); next.focus(); next.click(); }
    });
});

if (customInp) {
    customInp.addEventListener('input', () => {
        const raw = parseFloat(customInp.value);
        if (!customInp.value || isNaN(raw) || raw <= 0) {
            const active = qs('.amt.amt-active');
            if (active) { selectedCents = parseInt(active.dataset.amount, 10); selectedLabel = active.dataset.label || 'Donation'; }
        } else {
            amtBtns.forEach(b => { b.classList.remove('amt-active'); b.setAttribute('aria-pressed', 'false'); });
            selectedCents = Math.round(raw * 100);
            selectedLabel = `Custom $${Number.isInteger(raw) ? raw.toLocaleString() : raw.toFixed(2)} donation`;
        }
        refreshWidget();
    });
}

function hideErr() { if (donErr) donErr.hidden = true; }
function showErr(msg) { if (donErr) { donErr.textContent = msg; donErr.hidden = false; } }
function setLoading(on) {
    if (!donateBtn) return;
    donateBtn.disabled = on;
    if (dBtnText) dBtnText.hidden = on;
    if (dBtnLdr)  dBtnLdr.hidden  = !on;
}

/* ─────────────────────────────────────────────────────
   STRIPE CHECKOUT
───────────────────────────────────────────────────── */
async function handleDonate() {
    hideErr();
    if (!selectedCents || selectedCents < 100) {
        showErr('Minimum donation is $1.00. Please select or enter a valid amount.');
        return;
    }
    setLoading(true);
    try {
        const res = await fetch('/api/create-checkout-session', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                amount:      selectedCents,
                description: selectedLabel.replace(/&amp;/g, '&'),
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Server error ${res.status}`);
        }
        const { url } = await res.json();
        if (!url) throw new Error('No checkout URL returned.');
        window.location.href = url;
    } catch (err) {
        console.error('[YWF] Stripe error:', err);
        setLoading(false);
        showErr("Payment couldn't be started. Please refresh and try again.");
    }
}
if (donateBtn) donateBtn.addEventListener('click', handleDonate);

/* ─────────────────────────────────────────────────────
   TESTI CARD — reset rotation after transition ends
   (prevents layout jank from hover rotate on sibling hover)
───────────────────────────────────────────────────── */
qsa('.testi-card').forEach(card => {
    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, background .3s';
    });
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease, background .2s';
    });
});

/* ─────────────────────────────────────────────────────
   INIT — fires on DOMContentLoaded
───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    updateScrollProgress();
    updateNav();
    updateFloat();
    refreshWidget();       // build initial ball viz ($100 default)
    fireHeroReveal();      // hero elements don't wait for scroll
    animateHeroFund();     // hero progress bar + counters
});
