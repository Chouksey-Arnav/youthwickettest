/**
 * Youth Wicket Foundation — script.js
 * Scroll effects · Reveal animations · Stripe donation flow
 */

'use strict';

/* =====================================================
   SCROLL PROGRESS BAR
   Single, RAF-optimized scroll listener (not duplicated)
   ===================================================== */

const scrollFill = document.getElementById('scrollFill');

function updateScrollProgress() {
    const total   = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const current = window.scrollY;
    const pct     = total > 0 ? (current / total) * 100 : 0;
    if (scrollFill) scrollFill.style.height = pct + '%';
}

/* =====================================================
   NAV: add "is-scrolled" class after 60px
   ===================================================== */

const mainNav = document.getElementById('mainNav');

function updateNav() {
    if (!mainNav) return;
    if (window.scrollY > 60) {
        mainNav.classList.add('is-scrolled');
    } else {
        mainNav.classList.remove('is-scrolled');
    }
}

/* =====================================================
   SINGLE RAF-OPTIMIZED SCROLL HANDLER
   Fixes the "double listener" bug from previous version
   ===================================================== */

let rafScheduled = false;

window.addEventListener('scroll', () => {
    if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(() => {
            updateScrollProgress();
            updateNav();
            rafScheduled = false;
        });
    }
}, { passive: true });

/* =====================================================
   REVEAL ANIMATIONS (IntersectionObserver)
   Elements with [data-reveal] fade+slide into view once.
   [data-delay="N"] adds staggered CSS transition delay.
   ===================================================== */

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target); // fire once only
            }
        });
    },
    {
        threshold:   0.12,
        rootMargin:  '0px 0px -60px 0px'
    }
);

// Observe every element marked for reveal
document.querySelectorAll('[data-reveal]').forEach(el => {
    revealObserver.observe(el);
});

/* =====================================================
   HERO: trigger reveals immediately on load
   (hero elements are visible without scrolling)
   ===================================================== */

function initHeroReveal() {
    // Short stagger for hero elements so they sequence nicely
    const heroEls = document.querySelectorAll('.hero [data-reveal]');
    heroEls.forEach((el, i) => {
        // Small base delay so page has painted before animating
        const delay = 120 + i * 120;
        setTimeout(() => el.classList.add('is-visible'), delay);
    });
}

/* =====================================================
   SMOOTH SCROLL for anchor links
   Accounts for fixed nav height (68px)
   ===================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const id     = this.getAttribute('href');
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();

        const navHeight = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

/* =====================================================
   DONATION WIDGET LOGIC
   ===================================================== */

/** State */
let selectedAmountCents = 10000;   // Default: $100
let selectedLabel       = 'Practice Mat & Training Aids';

const amtBtns     = document.querySelectorAll('.amt-btn');
const customInput = document.getElementById('customAmount');
const summaryAmt  = document.getElementById('summaryAmt');
const summaryLbl  = document.getElementById('summaryLabel');
const donateBtn   = document.getElementById('donateBtn');
const donateBtnTx = document.getElementById('donateBtnText');
const donateBtnLd = document.getElementById('donateBtnLoader');
const donationErr = document.getElementById('donationError');

/** Format cents to display string */
function centsToDisplay(cents) {
    const dollars = cents / 100;
    return dollars % 1 === 0
        ? '$' + dollars.toLocaleString()
        : '$' + dollars.toFixed(2);
}

/** Update the summary text and donate button label */
function updateSummary() {
    const display = centsToDisplay(selectedAmountCents);
    if (summaryAmt)  summaryAmt.textContent  = display;
    if (summaryLbl)  summaryLbl.textContent  = selectedLabel;
    if (donateBtnTx) donateBtnTx.textContent = `Donate ${display}  →`;
    if (donateBtn)   donateBtn.setAttribute('aria-label', `Donate ${display} to Youth Wicket Foundation`);
}

/** Handle preset amount button clicks */
amtBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Clear custom input
        if (customInput) customInput.value = '';

        // Update active state
        amtBtns.forEach(b => {
            b.classList.remove('is-active');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        // Pull data
        selectedAmountCents = parseInt(btn.dataset.amount, 10);
        selectedLabel       = btn.dataset.label || 'Donation';

        updateSummary();
        hideDonationError();
    });
});

/** Handle custom amount input */
if (customInput) {
    customInput.addEventListener('input', () => {
        const raw = parseFloat(customInput.value);

        if (customInput.value === '' || isNaN(raw) || raw <= 0) {
            // Fall back to the selected preset
            const activeBtn = document.querySelector('.amt-btn.is-active');
            if (activeBtn) {
                selectedAmountCents = parseInt(activeBtn.dataset.amount, 10);
                selectedLabel       = activeBtn.dataset.label || 'Donation';
            }
        } else {
            // Deselect presets
            amtBtns.forEach(b => {
                b.classList.remove('is-active');
                b.setAttribute('aria-pressed', 'false');
            });
            selectedAmountCents = Math.round(raw * 100);
            selectedLabel       = `Custom donation of $${raw.toFixed(2).replace(/\.00$/, '')}`;
        }

        updateSummary();
        hideDonationError();
    });
}

function hideDonationError() {
    if (donationErr) donationErr.hidden = true;
}

function showDonationError(msg) {
    if (donationErr) {
        donationErr.textContent = msg || 'Something went wrong. Please try again.';
        donationErr.hidden = false;
    }
}

function setDonateLoading(isLoading) {
    if (!donateBtn) return;
    donateBtn.disabled = isLoading;

    if (donateBtnTx) donateBtnTx.hidden = isLoading;
    if (donateBtnLd) donateBtnLd.hidden = !isLoading;
}

/* =====================================================
   STRIPE DONATION — calls the Vercel serverless backend
   /api/create-checkout-session  (POST)
   Returns { url: "https://checkout.stripe.com/..." }
   ===================================================== */

async function handleDonation() {
    hideDonationError();

    // Validate minimum
    if (!selectedAmountCents || selectedAmountCents < 100) {
        showDonationError('Minimum donation is $1.00. Please enter a valid amount.');
        if (customInput) customInput.focus();
        return;
    }

    setDonateLoading(true);

    try {
        const res = await fetch('/api/create-checkout-session', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                amount:      selectedAmountCents,
                description: selectedLabel,
            }),
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server responded with status ${res.status}`);
        }

        const { url } = await res.json();

        if (!url) throw new Error('No checkout URL returned from server.');

        // Redirect to Stripe Checkout
        window.location.href = url;

    } catch (err) {
        console.error('[YWF] Stripe checkout error:', err);
        setDonateLoading(false);
        showDonationError(
            'Payment couldn\'t be initiated. Please refresh the page and try again.'
        );
    }
}

// Wire up the donate button
if (donateBtn) {
    donateBtn.addEventListener('click', handleDonation);
}

/* =====================================================
   CSS-NATIVE HOVER (all transform/shadow via CSS)
   No JS hover handlers needed — pure CSS covers it all.
   The JS below only adds the ripple click effect properly.
   ===================================================== */

/** Ripple effect on buttons (fixed: now has actual animation) */
function addRippleEffect(button) {
    button.addEventListener('click', function (e) {
        // Skip for donate button during loading
        if (this.disabled) return;

        const existing = this.querySelector('.ripple');
        if (existing) existing.remove();

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x    = e.clientX - rect.left - size / 2;
        const y    = e.clientY - rect.top  - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        Object.assign(ripple.style, {
            position:      'absolute',
            borderRadius:  '50%',
            width:         size + 'px',
            height:        size + 'px',
            left:          x + 'px',
            top:           y + 'px',
            background:    'rgba(255,255,255,0.25)',
            transform:     'scale(0)',
            animation:     'rippleExpand 0.55s ease-out forwards',
            pointerEvents: 'none',
            zIndex:        '10',
        });

        // Ensure button is positioned for absolute child
        const pos = getComputedStyle(this).position;
        if (pos === 'static') this.style.position = 'relative';
        this.style.overflow = 'hidden';

        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
}

// Inject ripple keyframe once
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleExpand {
        to { transform: scale(1); opacity: 0; }
    }
`;
document.head.appendChild(rippleStyle);

// Apply ripple to all CTA buttons
document.querySelectorAll('.btn, .donate-btn, .nav-cta').forEach(addRippleEffect);

/* =====================================================
   SECTION ANALYTICS (stubbed — swap in GA4 / etc.)
   ===================================================== */

const sectionsSeen = new Set();

const analyticsObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                if (id && !sectionsSeen.has(id)) {
                    sectionsSeen.add(id);
                    // Replace with your analytics call, e.g.:
                    // gtag('event', 'section_view', { section: id });
                }
            }
        });
    },
    { threshold: 0.5 }
);

document.querySelectorAll('section[id]').forEach(s => analyticsObserver.observe(s));

/* =====================================================
   ACCESSIBILITY: keyboard nav for donation amounts
   ===================================================== */

amtBtns.forEach((btn, i) => {
    btn.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            next = amtBtns[i + 1] || amtBtns[0];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            next = amtBtns[i - 1] || amtBtns[amtBtns.length - 1];
        }
        if (next) {
            e.preventDefault();
            next.focus();
            next.click();
        }
    });
});

/* =====================================================
   INIT — run on DOMContentLoaded
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initial state checks
    updateScrollProgress();
    updateNav();
    updateSummary();

    // Trigger hero reveals (since hero is visible without scrolling)
    initHeroReveal();
});

/* =====================================================
   RESIZE HANDLER (debounced, no redundant grid logic)
   Only used if something genuinely needs JS on resize.
   CSS media queries handle all responsive layout.
   ===================================================== */

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Reserved for any genuine JS layout needs
        // (CSS handles responsive grid — no overrides here)
    }, 150);
}, { passive: true });
