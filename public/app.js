/*  */'use strict';

(function () {
  const htmlEl = document.documentElement;
  const announcer = document.getElementById('polite-announcer');

  (function initSplashScreen() {
    const splashEl = document.getElementById('sapa-splash');
    if (!splashEl) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      splashEl.remove();
      return;
    }

    let dismissed = false;
    let timerId = null;

    function dismissSplash() {
      if (dismissed) return;
      dismissed = true;
      if (timerId) window.clearTimeout(timerId);
      splashEl.classList.add('is-leaving');
      const cleanup = () => {
        if (splashEl.parentNode) splashEl.remove();
      };
      splashEl.addEventListener('transitionend', cleanup, { once: true });
      window.setTimeout(cleanup, 480);
    }

    const duration = Math.max(800, Number(splashEl.getAttribute('data-duration')) || 3000);
    timerId = window.setTimeout(dismissSplash, duration);
  })();

  function announce(message) {
    if (!announcer) return;
    announcer.textContent = '';
    window.requestAnimationFrame(() => {
      announcer.textContent = message;
    });
  }

  function detectClientMeta() {
    const ua = navigator.userAgent || '';
    let device = 'Komputer';
    if (/Mobi|Android|iPhone/i.test(ua) || window.innerWidth < 640) {
      device = 'Ponsel';
    } else if (/iPad|Tablet/i.test(ua) || (window.innerWidth >= 640 && window.innerWidth < 1024)) {
      device = 'Tablet';
    }

    let os = 'Lainnya';
    if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS';
    else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac OS/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    let browser = 'Lainnya';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome\//i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua)) browser = 'Safari';

    let source = 'Langsung';
    const ref = document.referrer || '';
    if (ref) {
      if (/google|bing|duckduckgo|yahoo/i.test(ref)) source = 'Mesin Pencari';
      else if (/instagram|tiktok|facebook|t\.co|x\.com/i.test(ref)) source = 'Media Sosial';
      else source = 'Tautan Situs Lain';
    }

    return { device, os, browser, source };
  }

  const sessionKey = 'sapa_session_id';
  let sessionId = window.sessionStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(sessionKey, sessionId);
  }

  const clientMeta = detectClientMeta();

  function trackEvent(payload) {
    const body = JSON.stringify({
      sessionId,
      page: window.location.pathname,
      ...clientMeta,
      ...payload
    });
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/event', blob);
      return;
    }
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => { });
  }

  // Theme toggle (R-21, R-34)
  const themeBtn = document.getElementById('theme-toggle');
  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    window.localStorage.setItem('sapa_theme', theme);
    if (themeBtn) {
      const isDark = theme === 'dark';
      themeBtn.setAttribute('aria-pressed', String(isDark));
      const label = isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap';
      themeBtn.setAttribute('aria-label', label);
      themeBtn.setAttribute('title', label);
      const iconSwap = themeBtn.querySelector('.theme-icon-swap');
      if (!iconSwap) {
        themeBtn.textContent = isDark ? 'Mode Terang' : 'Mode Gelap';
      }
    }
  }

  const savedTheme = window.localStorage.getItem('sapa_theme');
  applyTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.startViewTransition(() => {
          applyTheme(next);
        });
      } else {
        applyTheme(next);
      }
      announce(next === 'dark' ? 'Tema gelap diaktifkan.' : 'Tema terang diaktifkan.');
    });
  }

  // Mobile menu drawer (R-03, R-32)
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');

  function setMenuOpen(open) {
    if (!mobileMenuBtn || !mobileDrawer) return;
    mobileMenuBtn.setAttribute('aria-expanded', String(open));
    mobileMenuBtn.textContent = open ? 'Tutup Menu' : 'Menu';
    mobileDrawer.hidden = !open;
  }

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const currentlyOpen = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!currentlyOpen);
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        mobileMenuBtn.focus();
      }
    });
  }

  // Real-time WITA clock & open/closed evaluation (F6)
  const witaBar = document.querySelector('.wita-status-bar');
  const clockEl = document.getElementById('wita-clock-value');
  const badgeEl = document.getElementById('wita-status-badge');
  const statusTextEl = document.getElementById('wita-status-text');
  const reasonEl = document.getElementById('wita-status-reason');

  function updateWitaStatus() {
    if (!witaBar || !clockEl) return;
    let hoursConfig = null;
    try {
      hoursConfig = JSON.parse(witaBar.getAttribute('data-hours-config') || '{}');
    } catch {
      return;
    }

    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Makassar',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);

    const map = {};
    for (const p of parts) map[p.type] = p.value;
    const isoDate = `${map.year}-${map.month}-${map.day}`;
    const currentTime = `${map.hour}:${map.minute}`;
    const currentClock = `${map.hour}:${map.minute}:${map.second}`;
    const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const dayIndex = weekdayMap[map.weekday] ?? 1;

    clockEl.textContent = currentClock;
    const dateEl = document.getElementById('wita-date-value');
    if (dateEl) {
      dateEl.textContent = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(now);
    }

    let isOpen = false;
    let reason = '';
    const exception = (hoursConfig.exceptions || []).find((ex) => ex.date === isoDate);
    if (exception) {
      if (exception.status === 'closed') {
        isOpen = false;
        reason = `${exception.title} (${exception.note || 'Hari libur'})`;
      } else {
        const open = exception.openTime || '08:00';
        const close = exception.closeTime || '12:00';
        isOpen = currentTime >= open && currentTime < close;
        reason = `${exception.title}: ${open.replace(':', '.')} s.d. ${close.replace(':', '.')} WITA`;
      }
    } else {
      const todayRule = (hoursConfig.weekly || []).find((d) => d.dayIndex === dayIndex);
      if (!todayRule || !todayRule.isOpen) {
        isOpen = false;
        reason = 'Hari Minggu loket tidak beroperasi';
      } else {
        isOpen = currentTime >= todayRule.openTime && currentTime < todayRule.closeTime;
        reason = isOpen
          ? `Loket beroperasi hingga pukul ${todayRule.closeTime.replace(':', '.')} WITA`
          : `Jadwal hari ini: ${todayRule.displayText}`;
      }
    }

    if (badgeEl && statusTextEl && reasonEl) {
      badgeEl.classList.toggle('status-open', isOpen);
      badgeEl.classList.toggle('status-closed', !isOpen);
      statusTextEl.textContent = isOpen ? 'Loket Buka' : 'Loket Tutup';
      reasonEl.textContent = reason;
    }
  }

  updateWitaStatus();
  window.setInterval(updateWitaStatus, 1000);

  // Service search filter & search query tracking (F13, G12)
  const searchInput = document.getElementById('cari-layanan');
  const resetSearchBtn = document.getElementById('reset-cari-layanan');
  const emptyResetBtn = document.getElementById('empty-reset-search');
  const emptyBox = document.getElementById('services-empty');
  const emptyMsg = document.getElementById('services-empty-msg');
  const serviceItems = Array.from(document.querySelectorAll('.service-ledger-item'));
  let searchTimer = null;

  function filterServices() {
    if (!searchInput) return;
    const q = searchInput.value.trim().toLowerCase();
    if (resetSearchBtn) resetSearchBtn.hidden = q.length === 0;

    let visibleCount = 0;
    for (const item of serviceItems) {
      const haystack = `${item.getAttribute('data-search') || ''} ${item.textContent.toLowerCase()}`;
      const matches = !q || haystack.includes(q);
      item.hidden = !matches;
      if (matches) visibleCount += 1;
    }

    if (emptyBox && emptyMsg) {
      emptyBox.hidden = visibleCount > 0;
      if (visibleCount === 0) {
        emptyMsg.textContent = `Tidak ada layanan yang cocok dengan kata kunci "${searchInput.value.trim()}".`;
      }
    }

    window.clearTimeout(searchTimer);
    if (q.length >= 2) {
      searchTimer = window.setTimeout(() => {
        trackEvent({ type: 'search', searchQuery: q });
      }, 650);
    }
  }

  function clearSearch() {
    if (!searchInput) return;
    searchInput.value = '';
    filterServices();
    searchInput.focus();
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterServices);
  }
  if (resetSearchBtn) resetSearchBtn.addEventListener('click', clearSearch);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', clearSearch);

  // Smooth Accordion Animation (eliminates snappy jump, Apple-grade fluid expand/collapse)
  function initSmoothAccordion(detailsEl) {
    const summary = detailsEl.querySelector('summary');
    const content = detailsEl.querySelector('.service-body') || detailsEl.querySelector('.faq-answer');
    if (!summary || !content) return;

    let heightAnimation = null;
    let contentAnimation = null;
    let isClosing = false;
    let isExpanding = false;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) {
        detailsEl.open = !detailsEl.open;
        return;
      }

      detailsEl.style.overflow = 'hidden';

      if (isClosing || !detailsEl.open) {
        // Expand
        detailsEl.style.height = `${detailsEl.offsetHeight}px`;
        detailsEl.open = true;
        window.requestAnimationFrame(() => {
          isExpanding = true;
          const startHeight = `${detailsEl.offsetHeight}px`;
          const endHeight = `${summary.offsetHeight + content.offsetHeight}px`;

          if (heightAnimation) heightAnimation.cancel();
          if (contentAnimation) contentAnimation.cancel();

          // Animate UI transition.disclosure: 350ms on ease.soft
          heightAnimation = detailsEl.animate({
            height: [startHeight, endHeight]
          }, {
            duration: 350,
            easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
          });

          // Content un-blurs and fades in from blur.disclosure
          contentAnimation = content.animate({
            opacity: [0, 1],
            filter: ['blur(2px)', 'blur(0px)']
          }, {
            duration: 350,
            easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
          });

          heightAnimation.onfinish = () => {
            detailsEl.open = true;
            heightAnimation = null;
            contentAnimation = null;
            isExpanding = false;
            detailsEl.style.height = '';
            detailsEl.style.overflow = '';
            const card = detailsEl.closest('.service-ledger-item');
            if (card) {
              trackEvent({
                type: 'service_open',
                serviceId: card.getAttribute('data-service-id'),
                serviceName: card.getAttribute('data-service-name')
              });
            }
          };
          heightAnimation.oncancel = () => { isExpanding = false; };
        });
      } else if (isExpanding || detailsEl.open) {
        // Collapse
        isClosing = true;
        const startHeight = `${detailsEl.offsetHeight}px`;
        const endHeight = `${summary.offsetHeight}px`;

        if (heightAnimation) heightAnimation.cancel();
        if (contentAnimation) contentAnimation.cancel();

        heightAnimation = detailsEl.animate({
          height: [startHeight, endHeight]
        }, {
          duration: 300,
          easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
        });

        contentAnimation = content.animate({
          opacity: [1, 0],
          filter: ['blur(0px)', 'blur(2px)']
        }, {
          duration: 250,
          easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
        });

        heightAnimation.onfinish = () => {
          detailsEl.open = false;
          heightAnimation = null;
          contentAnimation = null;
          isClosing = false;
          detailsEl.style.height = '';
          detailsEl.style.overflow = '';
        };
        heightAnimation.oncancel = () => { isClosing = false; };
      }
    });
  }

  document.querySelectorAll('.service-details, .faq-item').forEach(initSmoothAccordion);

  // Dialog helpers using native <dialog> with Animate UI motion (R-26, R-32)
  function openDialogById(id) {
    const dlg = document.getElementById(id);
    if (!dlg) return;
    dlg.classList.remove('closing');
    if (typeof dlg.showModal === 'function') {
      dlg.showModal();
    } else {
      dlg.setAttribute('open', 'true');
    }
  }

  function closeDialogById(id) {
    const dlg = document.getElementById(id);
    if (!dlg) return;
    if (dlg.classList.contains('closing')) return;
    if (!dlg.hasAttribute('open') && !dlg.open) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (typeof dlg.close === 'function') dlg.close();
      else dlg.removeAttribute('open');
      return;
    }
    dlg.classList.add('closing');
    setTimeout(() => {
      dlg.classList.remove('closing');
      if (typeof dlg.close === 'function') {
        dlg.close();
      } else {
        dlg.removeAttribute('open');
      }
    }, 190);
  }

  document.querySelectorAll('[data-close-dialog]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeDialogById(btn.getAttribute('data-close-dialog'));
    });
  });

  // Close dialog on clicking backdrop outside card with smooth Animate UI dismissal
  document.querySelectorAll('dialog').forEach((dlg) => {
    dlg.addEventListener('click', (e) => {
      const rect = dlg.getBoundingClientRect();
      const clickedInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!clickedInside) {
        closeDialogById(dlg.id);
      }
    });

    dlg.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeDialogById(dlg.id);
    });
  });

  // Animate UI Scroll Reveals (recipes/page.md)
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    document.querySelectorAll('.animate-ui-reveal').forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.animate-ui-reveal').forEach((el) => {
      el.classList.add('in-view');
    });
  }

  const openPrivacyBtn = document.getElementById('open-privacy-btn');
  if (openPrivacyBtn) {
    openPrivacyBtn.addEventListener('click', () => openDialogById('privacy-dialog'));
  }

  const openPejabatListBtn = document.getElementById('open-pejabat-list-btn');
  if (openPejabatListBtn) {
    openPejabatListBtn.addEventListener('click', () => openDialogById('pejabat-list-dialog'));
  }

  const openBranchesBtn = document.getElementById('open-branches-btn');
  if (openBranchesBtn) {
    openBranchesBtn.addEventListener('click', () => openDialogById('branches-dialog'));
  }

  // Interactive Pejabat Detail Showcase Modal
  function openOfficialShowcase(idx) {
    const panels = document.querySelectorAll('#pejabat-detail-dialog .pejabat-showcase-panel');
    let matched = false;
    panels.forEach((panel) => {
      const isTarget = panel.getAttribute('data-official-panel') === String(idx);
      panel.hidden = !isTarget;
      if (isTarget) matched = true;
    });
    if (matched) {
      openDialogById('pejabat-detail-dialog');
    }
  }

  document.querySelectorAll('.official-card').forEach((card) => {
    function triggerOfficial() {
      const idx = card.getAttribute('data-official-card');
      if (idx !== null) openOfficialShowcase(idx);
    }
    card.addEventListener('click', triggerOfficial);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerOfficial();
      }
    });
  });

  // Channel Switcher (Kanal Pengaduan vs Kanal Saran dan Masukan) & Shared Form Handler
  const channelButtons = Array.from(document.querySelectorAll('.channel-switch-btn[data-channel-target]'));
  const channelPanels = {
    complaint: document.getElementById('channel-card-complaint'),
    suggestion: document.getElementById('channel-card-suggestion')
  };

  function activateChannel(targetKey) {
    channelButtons.forEach((btn) => {
      const isSelected = btn.getAttribute('data-channel-target') === targetKey;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
    Object.entries(channelPanels).forEach(([key, panel]) => {
      if (!panel) return;
      panel.hidden = key !== targetKey;
    });
  }

  channelButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      activateChannel(btn.getAttribute('data-channel-target'));
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = channelButtons[(idx + 1) % channelButtons.length];
        next?.focus();
        activateChannel(next?.getAttribute('data-channel-target'));
      }
    });
  });

  function showPublicToast({ title, message }) {
    const stack = document.getElementById('public-toast-stack');
    if (!stack) return;
    const item = document.createElement('li');
    item.className = 'public-toast-item';
    item.setAttribute('role', 'status');
    item.innerHTML = `
      <span class="aui-toast-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path class="aui-check-path" d="M20 6 9 17l-5-5"/>
        </svg>
      </span>
      <div class="public-toast-copy">
        <strong class="public-toast-title"></strong>
        <p class="public-toast-message"></p>
      </div>
    `;
    item.querySelector('.public-toast-title').textContent = title;
    item.querySelector('.public-toast-message').textContent = message;
    stack.appendChild(item);

    window.setTimeout(() => {
      item.classList.add('is-leaving');
      item.addEventListener('animationend', () => item.remove(), { once: true });
      window.setTimeout(() => {
        if (item.parentNode) item.remove();
      }, 260);
    }, 4200);
  }

  function bindFeedbackChannelForm({
    formId,
    feedbackId,
    prefix,
    channel,
    dialogTitle,
    successText,
    consentErrorText
  }) {
    const formEl = document.getElementById(formId);
    const feedbackEl = document.getElementById(feedbackId);
    if (!formEl || !feedbackEl) return;

    const submitBtn = formEl.querySelector('button[type="submit"]');
    const defaultBtnText = submitBtn ? submitBtn.textContent : '';

    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const category = (document.getElementById(`${prefix}-category`)?.value || '').trim();
      const loc = (document.getElementById(`${prefix}-location`)?.value || '').trim();
      const subject = (document.getElementById(`${prefix}-subject`)?.value || '').trim();
      const details = (document.getElementById(`${prefix}-details`)?.value || '').trim();
      const consent = Boolean(document.getElementById(`${prefix}-consent`)?.checked);

      if (!category || !loc || !subject || !details || !consent) {
        feedbackEl.hidden = false;
        feedbackEl.className = 'complaint-feedback complaint-feedback-error complaint-field-full';
        feedbackEl.textContent = consentErrorText;
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim...';
      }

      try {
        const res = await fetch('/api/public/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel, category, location: loc, subject, details, consent })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Gagal mengirim ke server. Silakan coba lagi.');
        }

        feedbackEl.hidden = true;
        feedbackEl.textContent = '';

        showPublicToast({ title: dialogTitle, message: successText });
        announce(`${dialogTitle}. ${successText}`);
        formEl.reset();
      } catch (err) {
        feedbackEl.hidden = false;
        feedbackEl.className = 'complaint-feedback complaint-feedback-error complaint-field-full';
        feedbackEl.textContent = err.message || 'Terjadi kesalahan saat mengirim.';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultBtnText;
        }
      }
    });
  }

  bindFeedbackChannelForm({
    formId: 'complaint-form',
    feedbackId: 'complaint-feedback',
    prefix: 'complaint',
    channel: 'complaint',
    dialogTitle: 'Pengaduan Berhasil Terkirim',
    successText: 'Terima kasih. Laporan pengaduan Anda telah tersimpan di sistem SAPA NAMBASO untuk ditindaklanjuti petugas.',
    consentErrorText: 'Mohon lengkapi seluruh kolom bertanda (*) dan centang pernyataan kebenaran laporan.'
  });

  bindFeedbackChannelForm({
    formId: 'suggestion-form',
    feedbackId: 'suggestion-feedback',
    prefix: 'suggestion',
    channel: 'suggestion',
    dialogTitle: 'Saran & Masukan Terkirim',
    successText: 'Terima kasih. Saran dan masukan Anda telah tersimpan untuk peningkatan layanan UPTB Samsat Palu.',
    consentErrorText: 'Mohon lengkapi seluruh kolom bertanda (*) dan centang pernyataan persetujuan.'
  });

  // QR Dialog (F12)
  const qrSvgContainer = document.getElementById('qr-svg-container');
  const qrTargetLabel = document.getElementById('qr-target-label');
  document.querySelectorAll('.qr-trigger').forEach((btn) => {
    btn.addEventListener('click', async () => {
      let targetUrl = btn.getAttribute('data-qr-url') || '/';
      if (targetUrl.startsWith('/')) {
        targetUrl = window.location.origin + targetUrl;
      }
      const title = btn.getAttribute('data-qr-title') || 'Tautan SAPA NAMBASO';
      if (qrTargetLabel) qrTargetLabel.textContent = `${title}: ${targetUrl}`;
      if (qrSvgContainer) qrSvgContainer.textContent = 'Membuat kode QR...';
      openDialogById('qr-dialog');

      try {
        const res = await fetch(`/api/public/qr?url=${encodeURIComponent(targetUrl)}`);
        if (!res.ok) throw new Error('Gagal membuat QR');
        const svgText = await res.text();
        if (qrSvgContainer) {
          const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
          const svgNode = doc.documentElement;
          qrSvgContainer.replaceChildren(document.importNode(svgNode, true));
        }
      } catch {
        if (qrSvgContainer) qrSvgContainer.textContent = 'Gagal memuat kode QR. Silakan gunakan tombol Petunjuk Arah.';
      }
    });
  });

  // Track action clicks (G9, G10)
  document.querySelectorAll('[data-track-action]').forEach((el) => {
    el.addEventListener('click', () => {
      trackEvent({
        type: 'action_click',
        actionName: el.getAttribute('data-track-action'),
        locationId: el.getAttribute('data-location-id') || null,
        locationName: el.getAttribute('data-location-name') || null
      });
    });
  });

  // Track initial pageview, performance load time (G13), and section visibility (G7)
  const seenSections = new Set();
  const pageStart = performance.now();

  window.addEventListener('load', () => {
    const navTiming = performance.getEntriesByType('navigation')[0];
    const loadMs = navTiming ? Math.round(navTiming.loadEventEnd || performance.now()) : Math.round(performance.now());
    trackEvent({ type: 'pageview', loadMs });
  });

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.target.id && !seenSections.has(entry.target.id)) {
          seenSections.add(entry.target.id);
          const idx = Array.from(document.querySelectorAll('main > section')).indexOf(entry.target);
          const total = document.querySelectorAll('main > section').length || 1;
          const scrollDepth = Math.round(((idx + 1) / total) * 100);
          trackEvent({ type: 'section_view', section: entry.target.id, scrollDepth });
        }
      }
    }, { threshold: 0.35 });

    document.querySelectorAll('main > section[id]').forEach((sec) => sectionObserver.observe(sec));
  }

  // Announcements & Events auto-playing carousel
  document.querySelectorAll('[data-announcement-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const progressBar = carousel.querySelector('.announcement-progress-bar');

    if (!track || slides.length <= 1) return;

    let activeIdx = 0;
    let timerId = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const INTERVAL_MS = 5500;

    function resetProgressAnimation() {
      if (!progressBar) return;
      progressBar.style.animation = 'none';
      // Force reflow so keyframe animation restarts cleanly
      void progressBar.offsetWidth;
      progressBar.style.animation = '';
    }

    function goToSlide(idx, restartProgress = true) {
      activeIdx = (idx + slides.length) % slides.length;
      track.style.transform = `translate3d(-${activeIdx * 100}%, 0, 0)`;
      slides.forEach((slide, i) => {
        slide.setAttribute('aria-hidden', i === activeIdx ? 'false' : 'true');
      });
      dots.forEach((dot, i) => {
        const isSelected = i === activeIdx;
        dot.classList.toggle('is-active', isSelected);
        dot.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });
      if (restartProgress) resetProgressAnimation();
    }

    function stopAutoPlay() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      carousel.classList.add('is-paused');
    }

    function startAutoPlay() {
      if (reducedMotion) {
        carousel.classList.add('is-paused');
        return;
      }
      stopAutoPlay();
      carousel.classList.remove('is-paused');
      resetProgressAnimation();
      timerId = setInterval(() => {
        goToSlide(activeIdx + 1, true);
      }, INTERVAL_MS);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(activeIdx - 1, true);
        startAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(activeIdx + 1, true);
        startAutoPlay();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.getAttribute('data-carousel-dot') || 0);
        goToSlide(idx, true);
        startAutoPlay();
      });
    });

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    carousel.addEventListener('focusin', stopAutoPlay);
    carousel.addEventListener('focusout', (e) => {
      if (!carousel.contains(e.relatedTarget)) startAutoPlay();
    });

    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) >= 45) {
        goToSlide(dx > 0 ? activeIdx - 1 : activeIdx + 1, true);
        startAutoPlay();
      }
    }, { passive: true });

    startAutoPlay();
  });

  window.addEventListener('pagehide', () => {
    const durationMs = Math.round(performance.now() - pageStart);
    trackEvent({ type: 'session_end', durationMs });
  });
})();

