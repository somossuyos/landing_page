(function () {

  /* ── HEADER scroll state ── */
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── PLACEHOLDER images ── */
  document.querySelectorAll('.media-frame img').forEach(function (img) {
    function usePlaceholder() {
      var frame = img.closest('.media-frame');
      if (frame) frame.classList.add('is-placeholder');
      img.remove();
    }
    if (img.complete && img.naturalWidth === 0) usePlaceholder();
    else img.addEventListener('error', usePlaceholder);
  });

  /* ── COUNTDOWN ── */
  var target = new Date('2026-07-18T07:00:00-05:00');
  var els = {
    days:    document.querySelector('[data-unit="days"]'),
    hours:   document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]')
  };
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var diff = target.getTime() - Date.now();
    if (diff <= 0) {
      Object.values(els).forEach(function(el){ if(el) el.textContent='00'; });
      return;
    }
    var s = Math.floor(diff / 1000);
    if (els.days)    els.days.textContent    = String(Math.floor(s / 86400));
    if (els.hours)   els.hours.textContent   = pad(Math.floor((s % 86400) / 3600));
    if (els.minutes) els.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    if (els.seconds) els.seconds.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  /* ── HERO VIDEO mute toggle ── */
  var heroVideo  = document.getElementById('hero-video');
  var muteBtn    = document.getElementById('hero-mute');
  var muteLabel  = document.getElementById('hero-mute-label');

  if (heroVideo) {
    // Show mute button only when video has a source and can play
    heroVideo.addEventListener('canplay', function () {
      if (muteBtn) muteBtn.removeAttribute('hidden');
    });

    if (muteBtn) {
      muteBtn.addEventListener('click', function () {
        heroVideo.muted = !heroVideo.muted;
        var isMuted = heroVideo.muted;
        var x1   = muteBtn.querySelector('.mute-x1');
        var x2   = muteBtn.querySelector('.mute-x2');
        var wave = muteBtn.querySelector('.unmute-wave');
        if (x1)   x1.style.display   = isMuted ? '' : 'none';
        if (x2)   x2.style.display   = isMuted ? '' : 'none';
        if (wave) wave.style.display  = isMuted ? 'none' : '';
        if (muteLabel) muteLabel.textContent = isMuted ? 'Activar sonido' : 'Silenciar';
      });
    }
  }

  /* ── PROMO VIDEO mute toggle ── */
  var promoVideo = document.getElementById('promo-video');
  var promoBtn   = document.getElementById('promo-mute');
  var promoLabel = document.getElementById('promo-mute-label');

  if (promoVideo) {
    promoVideo.addEventListener('canplay', function () {
      if (promoBtn) promoBtn.removeAttribute('hidden');
    });

    if (promoBtn) {
      promoBtn.addEventListener('click', function () {
        promoVideo.muted = !promoVideo.muted;
        var isMuted = promoVideo.muted;
        var x1   = promoBtn.querySelector('.mute-x1');
        var x2   = promoBtn.querySelector('.mute-x2');
        var wave = promoBtn.querySelector('.unmute-wave');
        if (x1)   x1.style.display  = isMuted ? '' : 'none';
        if (x2)   x2.style.display  = isMuted ? '' : 'none';
        if (wave) wave.style.display = isMuted ? 'none' : '';
        if (promoLabel) promoLabel.textContent = isMuted ? 'Activar sonido' : 'Silenciar';
      });
    }
  }

  /* ── SMOOTH SCROLL for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ══════════════════════════════════════════
     SCROLL REVEAL — IntersectionObserver
     Reads: data-reveal="fade-up|fade-in|fade-left"
            data-reveal-delay="0..500" (ms)
  ══════════════════════════════════════════ */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced && 'IntersectionObserver' in window) {

    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el    = entry.target;
        var delay = parseInt(el.dataset.revealDelay || '0', 10);
        setTimeout(function () {
          el.classList.add('is-revealed');
        }, delay);
        revealObs.unobserve(el);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -48px 0px'
    });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('will-reveal', 'reveal-' + (el.dataset.reveal || 'fade-up'));
      revealObs.observe(el);
    });

  } else {
    // No animation: just make everything visible immediately
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  /* ── STAT COUNTERS ── */
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el    = entry.target;
        var rawText = el.textContent.trim();

        var end = parseInt(el.dataset.count || '', 10);
        if (!Number.isFinite(end)) {
          var m = rawText.match(/^(\d+)(.*)$/);
          if (!m) return;
          end = parseInt(m[1], 10);
        }

        var suffix = (el.dataset.countSuffix != null) ? el.dataset.countSuffix : '';
        if (!suffix) {
          var m2 = rawText.match(/^(\d+)(.*)$/);
          suffix = m2 ? m2[2] : '';
        }

        var dur    = 1600;
        var t0     = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p   = Math.min((ts - t0) / dur, 1);
          var val = Math.floor((1 - Math.pow(1 - p, 3)) * end);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = String(end) + suffix;
        }
        requestAnimationFrame(step);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat__value').forEach(function (el) {
      counterObs.observe(el);
    });
  }

  /* ── PRICING PHASE date logic ── */
  (function () {
    var now      = new Date();
    var fase1End = new Date('2026-05-31T23:59:59-05:00');
    var dot2     = document.getElementById('pi-dot-2');
    var status1  = document.getElementById('pi-status-1');
    var status2  = document.getElementById('pi-status-2');

    if (now > fase1End) {
      /* Fase 2 opens: activate its indicator */
      if (dot2)    dot2.classList.add('pricing__pi-dot--active');
      if (status1) { status1.textContent = 'Expirada'; status1.style.color = 'rgba(255,100,100,0.55)'; }
      if (status2) { status2.textContent = '● Activa ahora'; status2.classList.remove('pricing__pi-status--soon'); }
      document.querySelectorAll('[data-phase="2"]').forEach(function (card) {
        card.classList.remove('price-card--locked');
      });
      document.querySelectorAll('[data-phase="1"]').forEach(function (card) {
        card.classList.add('price-card--expired');
      });
    }
  })();

  /* ══════════════════════════════════════════
     TERMS & CONDITIONS MODAL + PAYMENT GATE
     - All payment CTAs must require acceptance before redirect
     - Redirect target is the CTA's href (CodePay)
  ══════════════════════════════════════════ */
  (function () {
    var STORAGE_KEY = 'renaser_terms_accepted_v1';

    function isAccepted() {
      try { return localStorage.getItem(STORAGE_KEY) === '1'; }
      catch (e) { return false; }
    }
    function setAccepted(val) {
      try { localStorage.setItem(STORAGE_KEY, val ? '1' : '0'); }
      catch (e) {}
    }

    var modal     = document.getElementById('terms-modal');
    var acceptEl  = document.getElementById('terms-accept');
    var contBtn   = document.getElementById('terms-continue');
    var openLinks = document.querySelectorAll('.js-open-terms');

    // Any CTA pointing to CodePay (or marked with pay context) must be gated.
    var payCtas = document.querySelectorAll(
      'a.js-pay-cta, a[data-pay-context], a[href^="https://renaser.codepay.co/"], a[href^="http://renaser.codepay.co/"]'
    );

    var pendingHref = null;
    var lastFocusEl = null;

    function setModalOpen(open) {
      if (!modal) return;
      modal.classList.toggle('is-open', open);
      modal.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.documentElement.classList.toggle('is-modal-open', open);
      document.body.classList.toggle('is-modal-open', open);

      if (open) {
        lastFocusEl = document.activeElement;
        // Sync checkbox state from storage
        if (acceptEl) acceptEl.checked = isAccepted();
        if (contBtn) contBtn.disabled = !(acceptEl && acceptEl.checked);
        // Focus close button for accessibility
        var closeBtn = modal.querySelector('[data-modal-close]');
        if (closeBtn) closeBtn.focus();
      } else {
        if (lastFocusEl && typeof lastFocusEl.focus === 'function') lastFocusEl.focus();
      }
    }

    function openModal() { setModalOpen(true); }
    function closeModal() { setModalOpen(false); pendingHref = null; }

    // Open terms from explicit link
    openLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });

    // Close handlers
    if (modal) {
      modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
        el.addEventListener('click', function () { closeModal(); });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
      });
    }

    // Accept checkbox
    if (acceptEl) {
      acceptEl.addEventListener('change', function () {
        setAccepted(acceptEl.checked);
        if (contBtn) contBtn.disabled = !acceptEl.checked;
      });
    }

    // Continue to payment
    if (contBtn) {
      contBtn.addEventListener('click', function () {
        if (!acceptEl || !acceptEl.checked) return;
        setAccepted(true);
        var href = pendingHref;
        closeModal();
        if (href) window.open(href, '_blank', 'noopener');
      });
    }

    // Gate payment CTAs
    payCtas.forEach(function (a) {
      a.addEventListener('click', function (e) {
        // Let non-primary clicks behave normally (new tab, etc.)
        if (e.defaultPrevented) return;
        if (e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        var href = a.getAttribute('href') || '';
        if (!href) return;
        if (isAccepted()) return; // allow default behavior

        // Block and force acceptance first
        e.preventDefault();
        pendingHref = href;
        openModal();
      });
    });
  })();

})();
