/**
 * Youth Wicket Foundation — script.js v3
 * Particles · Scroll Reveals · Countup · Ticker · Stripe
 */
'use strict';

/* ─────────────────────────────────────────────────────
   PARTICLE CANVAS (hero background)
───────────────────────────────────────────────────── */
(function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    function Particle() {
        this.reset();
    }
    Particle.prototype.reset = function () {
        this.x    = Math.random() * W;
        this.y    = Math.random() * H;
        this.r    = Math.random() * 1.5 + 0.4;
        this.vx   = (Math.random() - 0.5) * 0.3;
        this.vy   = -Math.random() * 0.4 - 0.15;
        this.a    = Math.random() * 0.5 + 0.15;
        this.life = Math.random() * 200 + 100;
        this.age  = 0;
        this.hue  = Math.random() > 0.6 ? 210 : 42; // blue or gold
    };
    Particle.prototype.update = function () {
        this.x  += this.vx;
        this.y  += this.vy;
        this.age++;
        if (this.age > this.life || this.y < -5) this.reset();
    };
    Particle.prototype.draw = function () {
        const fade = Math.min(this.age / 20, 1) * Math.min((this.life - this.age) / 20, 1);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.a * fade})`;
        ctx.fill();
    };

    function init() {
        resize();
        particles = Array.from({ length: 120 }, () => {
            const p = new Particle();
            p.age = Math.random() * p.life; // stagger initial age
            return p;
        });
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        raf = requestAnimationFrame(loop);
    }

    init();
    loop();
    window.addEventListener('resize', () => { resize(); }, { passive: true });
})();

/* ─────────────────────────────────────────────────────
   CTA PARTICLE CANVAS
───────────────────────────────────────────────────── */
(function initCtaParticles() {
    const canvas = document.getElementById('ctaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [], raf;

    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }

    function Pt() {
        this.x = Math.random() * (W || 1200);
        this.y = Math.random() * (H || 600);
        this.r = Math.random() * 1.2 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = -Math.random() * 0.3 - 0.1;
        this.a = Math.random() * 0.4 + 0.1;
    }
    Pt.prototype.tick = function () {
        this.x += this.vx; this.y += this.vy;
        if (this.y < -5) { this.y = H + 5; this.x = Math.random() * W; }
    };
    Pt.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${this.a})`;
        ctx.fill();
    };

    function init() { resize(); pts = Array.from({ length: 60 }, () => new Pt()); }
    function loop() { ctx.clearRect(0, 0, W, H); pts.forEach(p => { p.tick(); p.draw(); }); requestAnimationFrame(loop); }

    init(); loop();
    window.addEventListener('resize', resize, { passive: true });
})();

/* ─────────────────────────────────────────────────────
   SCROLL PROGRESS
───────────────────────────────────────────────────── */
const scrollFill = document.getElementById('scrollFill');
function updateScroll() {
    const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollFill && total > 0) scrollFill.style.height = (window.scrollY / total * 100) + '%';
}

/* ─────────────────────────────────────────────────────
   NAV SCROLL STATE
───────────────────────────────────────────────────── */
const nav = document.getElementById('mainNav');
function updateNav() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 80);
}

/* ─────────────────────────────────────────────────────
   FLOATING DONATE BAR
───────────────────────────────────────────────────── */
const floatBar = document.getElementById('floatBar');
function updateFloat() {
    if (!floatBar) return;
    floatBar.classList.toggle('show', window.scrollY > 600);
    // hide if donation section is visible
    const don = document.getElementById('donations');
    if (don) {
        const r = don.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) floatBar.classList.remove('show');
    }
}

/* ─────────────────────────────────────────────────────
   SINGLE RAF SCROLL HANDLER
───────────────────────────────────────────────────── */
let rafPending = false;
window.addEventListener('scroll', () => {
    if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
            updateScroll();
            updateNav();
            updateFloat();
            rafPending = false;
        });
    }
}, { passive: true });

/* ─────────────────────────────────────────────────────
   REVEAL ON SCROLL — IntersectionObserver
   Watches .fade-up elements, adds .is-vis when entering view
───────────────────────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('is-vis');
            revealObs.unobserve(e.target);
        }
    });
}, { threshold: 0.10, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up').forEach(el => revealObs.observe(el));

/* Hero reveals fire immediately (visible on load) */
function fireHeroReveal() {
    document.querySelectorAll('.hero .fade-up').forEach((el, i) => {
        setTimeout(() => el.classList.add('is-vis'), 100 + i * 130);
    });
}

/* ─────────────────────────────────────────────────────
   COUNTUP NUMBERS — animate when stat enters view
───────────────────────────────────────────────────── */
function animateCount(el, target, duration = 2200) {
    const start = performance.now();
    const fmt = n => {
        if (n >= 1e9)  return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
        if (n >= 1e6)  return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
        return Math.round(n).toLocaleString();
    };
    function tick(now) {
        const pct = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - pct, 4); // ease-out quart
        el.textContent = fmt(ease * target);
        if (pct < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target);
    }
    requestAnimationFrame(tick);
}

const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const target = parseFloat(e.target.dataset.target);
            if (!isNaN(target)) animateCount(e.target, target);
            countObs.unobserve(e.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.countup').forEach(el => countObs.observe(el));

/* ─────────────────────────────────────────────────────
   HERO FUNDRAISING PROGRESS ANIMATION
───────────────────────────────────────────────────── */
function animateHeroFund() {
    const fill    = document.getElementById('fundFill');
    const raised  = document.getElementById('heroRaised');
    const donors  = document.getElementById('heroDonors');
    const pct     = document.getElementById('heroPct');

    const GOAL    = 25000;
    const RAISED  = 14320;
    const DONORS  = 187;
    const PCT     = Math.round(RAISED / GOAL * 100);

    // Animate bar fill (delayed slightly so page has painted)
    setTimeout(() => {
        if (fill) fill.style.width = PCT + '%';
    }, 600);

    // Animate raised $ counter
    if (raised) {
        const start = performance.now();
        const dur = 2000;
        function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            raised.innerHTML = `<strong>$${Math.round(ease * RAISED).toLocaleString()}</strong>`;
            if (p < 1) requestAnimationFrame(tick);
        }
        setTimeout(() => requestAnimationFrame(tick), 700);
    }

    // Animate donor counter
    if (donors) animateCount(donors, DONORS, 2200);
    if (pct) pct.textContent = PCT + '% funded';
}

/* ─────────────────────────────────────────────────────
   CAMPAIGN PROGRESS BAR (donation section)
───────────────────────────────────────────────────── */
function animateCampaignBar() {
    const fill = document.getElementById('cpFill');
    if (fill) {
        setTimeout(() => { fill.style.width = '57%'; }, 300);
    }
}
const cpObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) { animateCampaignBar(); cpObs.unobserve(e.target); }
    });
}, { threshold: 0.2 });
const cpEl = document.querySelector('.cp');
if (cpEl) cpObs.observe(cpEl);

/* ─────────────────────────────────────────────────────
   DONOR TICKER
───────────────────────────────────────────────────── */
(function buildTicker() {
    const donors = [
        { name: 'Priya S.',   loc: 'Cary, NC',    amt: '$50',   label: 'Training Starter Pack' },
        { name: 'Rahul M.',   loc: 'Apex, NC',    amt: '$100',  label: 'Practice Mat & Aids' },
        { name: 'Jessica T.', loc: 'Durham, NC',  amt: '$25',   label: 'Cricket Balls' },
        { name: 'Deepak P.',  loc: 'Cary, NC',    amt: '$500',  label: 'Field Champion' },
        { name: 'Amy L.',     loc: 'Chapel Hill', amt: '$50',   label: 'Training Pack' },
        { name: 'Suresh R.',  loc: 'Apex, NC',    amt: '$200',  label: 'Custom donation' },
        { name: 'Ananya K.',  loc: 'Raleigh, NC', amt: '$100',  label: 'Practice Mat & Aids' },
        { name: 'David W.',   loc: 'Morrisville', amt: '$75',   label: 'Custom donation' },
        { name: 'Meera N.',   loc: 'Cary, NC',    amt: '$1,000',label: 'Field Champion' },
        { name: 'Tariq A.',   loc: 'Apex, NC',    amt: '$25',   label: 'Cricket Balls' },
    ];

    const track = document.getElementById('tickerTrack');
    if (!track) return;

    // Double the list for seamless loop
    const all = [...donors, ...donors];
    track.innerHTML = all.map(d =>
        `<span class="ticker-item">
            <strong>${d.name}</strong> from ${d.loc} donated <strong>${d.amt}</strong> → ${d.label}
        </span>`
    ).join('');
})();

/* ─────────────────────────────────────────────────────
   SMOOTH SCROLL (anchors, offset for fixed nav)
───────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
});

/* ─────────────────────────────────────────────────────
   RIPPLE EFFECT (injected keyframe + apply to btns)
───────────────────────────────────────────────────── */
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes rippleAnim { to { transform: scale(4); opacity: 0; } }
    </style>
`);

function addRipple(btn) {
    btn.addEventListener('click', function (e) {
        if (this.disabled) return;
        const r = this.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        const rip = document.createElement('span');
        Object.assign(rip.style, {
            position: 'absolute',
            borderRadius: '50%',
            width: size + 'px', height: size + 'px',
            left: (e.clientX - r.left - size / 2) + 'px',
            top:  (e.clientY - r.top  - size / 2) + 'px',
            background: 'rgba(255,255,255,0.22)',
            transform: 'scale(0)',
            animation: 'rippleAnim 0.6s ease-out forwards',
            pointerEvents: 'none', zIndex: '99',
        });
        if (getComputedStyle(this).position === 'static') this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(rip);
        setTimeout(() => rip.remove(), 650);
    });
}
document.querySelectorAll('.btn, .donate-btn, .nav-cta, .float-btn, .urgency-link').forEach(addRipple);

/* ─────────────────────────────────────────────────────
   DONATION WIDGET
───────────────────────────────────────────────────── */
let selectedCents = 10000;
let selectedLabel = 'Practice Mat &amp; Training Aids';

const amtBtns    = document.querySelectorAll('.amt');
const customInp  = document.getElementById('customAmt');
const ibAmt      = document.getElementById('ibAmt');
const ibLabel    = document.getElementById('ibLabel');
const donateBtn  = document.getElementById('donateBtn');
const dBtnText   = document.getElementById('dBtnText');
const dBtnLoader = document.getElementById('dBtnLoader');
const donErr     = document.getElementById('donationError');

function centsToStr(cents) {
    const d = cents / 100;
    return '$' + (d % 1 === 0 ? d.toLocaleString() : d.toFixed(2));
}

function updateWidget() {
    const str = centsToStr(selectedCents);
    if (ibAmt)     ibAmt.textContent   = str;
    if (ibLabel)   ibLabel.innerHTML   = selectedLabel;
    if (dBtnText)  dBtnText.innerHTML  = `🔒&nbsp; Donate ${str} Securely`;
    if (donateBtn) donateBtn.setAttribute('aria-label', `Donate ${str} to Youth Wicket Foundation`);
}

amtBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (customInp) customInp.value = '';
        amtBtns.forEach(b => { b.classList.remove('amt-active'); b.setAttribute('aria-pressed','false'); });
        btn.classList.add('amt-active');
        btn.setAttribute('aria-pressed','true');
        selectedCents = parseInt(btn.dataset.amount, 10);
        selectedLabel = btn.dataset.label || 'Donation';
        updateWidget();
        hideErr();
    });
    // Arrow key navigation
    btn.addEventListener('keydown', e => {
        const arr = [...amtBtns];
        const i = arr.indexOf(btn);
        let next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  next = arr[i+1] || arr[0];
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    next = arr[i-1] || arr[arr.length-1];
        if (next) { e.preventDefault(); next.focus(); next.click(); }
    });
});

if (customInp) {
    customInp.addEventListener('input', () => {
        const raw = parseFloat(customInp.value);
        if (customInp.value === '' || isNaN(raw) || raw <= 0) {
            const active = document.querySelector('.amt.amt-active');
            if (active) { selectedCents = parseInt(active.dataset.amount,10); selectedLabel = active.dataset.label || 'Donation'; }
        } else {
            amtBtns.forEach(b => { b.classList.remove('amt-active'); b.setAttribute('aria-pressed','false'); });
            selectedCents = Math.round(raw * 100);
            selectedLabel = `Custom $${raw % 1 === 0 ? raw : raw.toFixed(2)} donation`;
        }
        updateWidget();
        hideErr();
    });
}

function hideErr() { if (donErr) donErr.hidden = true; }
function showErr(msg) { if (donErr) { donErr.textContent = msg || 'Error. Please try again.'; donErr.hidden = false; } }
function setLoading(on) {
    if (!donateBtn) return;
    donateBtn.disabled = on;
    if (dBtnText)   dBtnText.hidden   = on;
    if (dBtnLoader) dBtnLoader.hidden = !on;
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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: selectedCents, description: selectedLabel.replace(/&amp;/g,'&') }),
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
   INIT
───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    updateScroll();
    updateNav();
    updateWidget();
    fireHeroReveal();
    animateHeroFund();
});
