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
  var labels = {
    days:    document.querySelector('[data-label="days"]'),
    hours:   document.querySelector('[data-label="hours"]'),
    minutes: document.querySelector('[data-label="minutes"]'),
    seconds: document.querySelector('[data-label="seconds"]')
  };
  var LABEL_FORMS = {
    days:    { one: 'Día',     other: 'Días' },
    hours:   { one: 'Hora',    other: 'Horas' },
    minutes: { one: 'Minuto',  other: 'Minutos' },
    seconds: { one: 'Segundo', other: 'Segundos' }
  };
  function pad(n) { return String(n).padStart(2, '0'); }
  function setLabel(key, value) {
    var el = labels[key];
    if (!el) return;
    var form = LABEL_FORMS[key];
    el.textContent = (value === 1) ? form.one : form.other;
  }
  function tick() {
    var diff = target.getTime() - Date.now();
    if (diff <= 0) {
      Object.keys(els).forEach(function (key) {
        if (els[key]) els[key].textContent = '00';
        setLabel(key, 0);
      });
      return;
    }
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (els.days)    els.days.textContent    = String(d);
    if (els.hours)   els.hours.textContent   = pad(h);
    if (els.minutes) els.minutes.textContent = pad(m);
    if (els.seconds) els.seconds.textContent = pad(sec);
    setLabel('days', d);
    setLabel('hours', h);
    setLabel('minutes', m);
    setLabel('seconds', sec);
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
     TERMS & CONDITIONS + INSTRUCTIONS GATE
     Flow:
       Click pago → Modal Términos → (acepta) → Modal Instrucciones (PDF) →
       (confirma lectura) → Redirección a CodePay
  ══════════════════════════════════════════ */
  (function () {
    var TERMS_KEY        = 'renaser_terms_accepted_session_v1';
    var INSTR_KEY        = 'renaser_instructions_read_session_v1';
    var MANUAL_OPEN_KEY  = 'renaser_manual_opened_session_v1';
    var LEGACY_LOCAL_KEY = 'renaser_terms_accepted_v1';

    function getFlag(key) {
      try { return sessionStorage.getItem(key) === '1'; }
      catch (e) { return false; }
    }
    function setFlag(key, val) {
      try { sessionStorage.setItem(key, val ? '1' : '0'); }
      catch (e) {}
    }

    try {
      if (localStorage.getItem(LEGACY_LOCAL_KEY) != null) localStorage.removeItem(LEGACY_LOCAL_KEY);
    } catch (e) {}

    // ── Terms modal refs ──
    var termsModal    = document.getElementById('terms-modal');
    var termsAcceptEl = document.getElementById('terms-accept');
    var termsContBtn  = document.getElementById('terms-continue');
    var openLinks     = document.querySelectorAll('.js-open-terms');

    // ── Instructions modal refs ──
    var instrModal     = document.getElementById('instructions-modal');
    var instrContBtn   = document.getElementById('instructions-continue');
    var manualReadBtn  = document.getElementById('manual-read');
    var manualDlBtns   = document.querySelectorAll('.js-download-manual');
    var instrModalBody = document.getElementById('instructions-modal-body');
    var manualPdfImage = document.getElementById('manual-pdf-image');

    var MOBILE_PDF_MQ  = '(max-width: 720px)';

    function isMobilePdfFlow() {
      try { return window.matchMedia(MOBILE_PDF_MQ).matches; }
      catch (e) { return window.innerWidth <= 720; }
    }

    function resetMobilePdfScrollState() {
      if (instrModalBody) instrModalBody.scrollTop = 0;
    }

    function onMobilePdfScrollComplete() {
      if (getFlag(MANUAL_OPEN_KEY)) return;
      setFlag(MANUAL_OPEN_KEY, true);
      refreshInstrContinueState();
      reflectManualOpened('read');
    }

    function checkInstrBodyScrolledToEnd() {
      if (!instrModalBody || !isMobilePdfFlow() || getFlag(MANUAL_OPEN_KEY)) return;
      var slack = 72;
      if (instrModalBody.scrollTop + instrModalBody.clientHeight >= instrModalBody.scrollHeight - slack) {
        onMobilePdfScrollComplete();
      }
    }

    function checkInstrBodyNoScrollNeeded() {
      if (!instrModalBody || !isMobilePdfFlow() || getFlag(MANUAL_OPEN_KEY)) return;
      if (instrModalBody.scrollHeight <= instrModalBody.clientHeight + 12) {
        onMobilePdfScrollComplete();
      }
    }

    var PAY_SELECTOR = 'a.js-pay-cta, a[data-pay-context], a[href^="https://renaser.codepay.co/"], a[href^="http://renaser.codepay.co/"]';

    var pendingHref = null;
    var pendingTarget = null;
    var lastFocusEl = null;

    function syncBodyLock() {
      var anyOpen = (termsModal && termsModal.classList.contains('is-open')) ||
                    (instrModal && instrModal.classList.contains('is-open'));
      document.documentElement.classList.toggle('is-modal-open', anyOpen);
      document.body.classList.toggle('is-modal-open', anyOpen);
    }

    function setModalOpen(modal, open, opts) {
      if (!modal) return;
      modal.classList.toggle('is-open', open);
      modal.setAttribute('aria-hidden', open ? 'false' : 'true');
      syncBodyLock();

      if (open) {
        if (!opts || !opts.keepFocus) lastFocusEl = document.activeElement;
        var closeBtn = modal.querySelector('[data-modal-close]');
        if (closeBtn) closeBtn.focus();
      } else {
        if (lastFocusEl && typeof lastFocusEl.focus === 'function') lastFocusEl.focus();
      }
    }

    // ── Terms modal helpers ──
    function openTermsModal() {
      if (termsAcceptEl) termsAcceptEl.checked = getFlag(TERMS_KEY);
      if (termsContBtn) termsContBtn.disabled = !(termsAcceptEl && termsAcceptEl.checked);
      setModalOpen(termsModal, true);
    }
    function closeTermsModal() {
      setModalOpen(termsModal, false);
    }

    // ── Instructions modal helpers ──
    function refreshInstrContinueState() {
      if (!instrContBtn) return;
      var opened = getFlag(MANUAL_OPEN_KEY);
      instrContBtn.disabled = !opened;
    }
    function reflectManualOpened(action) {
      if (!getFlag(MANUAL_OPEN_KEY)) return;
      if (manualReadBtn) {
        manualReadBtn.classList.add('is-done');
        var label = manualReadBtn.querySelector('span');
        if (label) label.textContent = 'Volver a leer';
      }
    }
    function openInstrModal(opts) {
      if (isMobilePdfFlow() && !getFlag(MANUAL_OPEN_KEY)) {
        resetMobilePdfScrollState();
      }
      reflectManualOpened();
      refreshInstrContinueState();
      setModalOpen(instrModal, true, opts);
      if (isMobilePdfFlow() && !getFlag(MANUAL_OPEN_KEY)) {
        requestAnimationFrame(function () {
          requestAnimationFrame(checkInstrBodyNoScrollNeeded);
        });
        setTimeout(checkInstrBodyNoScrollNeeded, 500);
      }
    }
    function closeInstrModal() {
      setModalOpen(instrModal, false);
    }

    // Track manual read (open in new tab) — primary action
    if (manualReadBtn) {
      manualReadBtn.addEventListener('click', function () {
        setFlag(MANUAL_OPEN_KEY, true);
        reflectManualOpened('read');
        refreshInstrContinueState();
      });
    }
    // Track manual download — secondary action, also satisfies the gate
    manualDlBtns.forEach(function (manualDlBtn) {
      manualDlBtn.addEventListener('click', function () {
        setFlag(MANUAL_OPEN_KEY, true);
        reflectManualOpened('download');
        refreshInstrContinueState();
      });
    });

    if (instrModalBody) {
      instrModalBody.addEventListener('scroll', checkInstrBodyScrolledToEnd, { passive: true });
    }
    if (manualPdfImage) {
      manualPdfImage.addEventListener('load', function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(checkInstrBodyNoScrollNeeded);
        });
      });
    }

    // Open terms from explicit "Términos y condiciones" links
    openLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openTermsModal();
      });
    });

    // Close handlers (both modals)
    [termsModal, instrModal].forEach(function (modal) {
      if (!modal) return;
      modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
        el.addEventListener('click', function () {
          if (modal === termsModal) closeTermsModal();
          else closeInstrModal();
          pendingHref = null;
          pendingTarget = null;
        });
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (instrModal && instrModal.classList.contains('is-open')) {
        closeInstrModal();
        pendingHref = null;
        pendingTarget = null;
      } else if (termsModal && termsModal.classList.contains('is-open')) {
        closeTermsModal();
        pendingHref = null;
        pendingTarget = null;
      }
    });

    // Terms checkbox
    if (termsAcceptEl) {
      termsAcceptEl.addEventListener('change', function () {
        setFlag(TERMS_KEY, termsAcceptEl.checked);
        if (termsContBtn) termsContBtn.disabled = !termsAcceptEl.checked;
      });
    }

    // Terms continue → open Instructions modal
    if (termsContBtn) {
      termsContBtn.addEventListener('click', function () {
        if (!termsAcceptEl || !termsAcceptEl.checked) return;
        setFlag(TERMS_KEY, true);
        // Hand off to instructions modal without releasing the body lock
        if (termsModal) {
          termsModal.classList.remove('is-open');
          termsModal.setAttribute('aria-hidden', 'true');
        }
        openInstrModal({ keepFocus: true });
      });
    }

    // Instructions continue → redirect to payment
    if (instrContBtn) {
      instrContBtn.addEventListener('click', function () {
        if (!getFlag(MANUAL_OPEN_KEY)) return;
        setFlag(INSTR_KEY, true);
        var href = pendingHref;
        var target = pendingTarget;
        closeInstrModal();
        pendingHref = null;
        pendingTarget = null;
        if (!href) return;
        if (target === '_blank') window.open(href, '_blank', 'noopener');
        else window.location.href = href;
      });
    }

    function gateToModal(anchor, event) {
      var href = (anchor && anchor.getAttribute) ? (anchor.getAttribute('href') || '') : '';
      if (!href) return;
      // If all gates already passed in this session, allow default behavior
      if (getFlag(TERMS_KEY) && getFlag(INSTR_KEY) && getFlag(MANUAL_OPEN_KEY)) return;

      if (event) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      }

      pendingHref = href;
      pendingTarget = anchor.getAttribute('target') || null;

      // Skip terms if already accepted in this session
      if (getFlag(TERMS_KEY)) {
        openInstrModal();
      } else {
        openTermsModal();
      }
    }

    // Gate payment CTAs (delegated handler in capture phase)
    document.addEventListener('click', function (e) {
      if (!e || e.defaultPrevented) return;
      var t = e.target;
      if (!t || !t.closest) return;
      var a = t.closest(PAY_SELECTOR);
      if (!a) return;
      gateToModal(a, e);
    }, true);
  })();

})();
