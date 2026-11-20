'use strict';

(function () {
  const htmlEl = document.documentElement;
  const loginView = document.getElementById('login-view');
  const workspaceView = document.getElementById('workspace-view');
  const loginForm = document.getElementById('login-form');
  const otpForm = document.getElementById('otp-form');
  const resetForm = document.getElementById('reset-form');
  const loginErrorBox = document.getElementById('login-error-box');
  const devOtpNotice = document.getElementById('dev-otp-notice');
  const logoutBtn = document.getElementById('logout-btn');
  const roleBadge = document.getElementById('admin-role-badge');
  const moduleNav = document.getElementById('admin-module-nav');
  const mobilePicker = document.getElementById('mobile-module-select');
  const moduleContent = document.getElementById('module-content');
  const draftStatusPill = document.getElementById('draft-status-pill');
  const draftStateLabel = document.getElementById('draft-state-label');
  const publishedMetaLabel = document.getElementById('published-meta-label');
  const stalenessBanner = document.getElementById('staleness-banner');
  const feedbackBox = document.getElementById('workspace-feedback');
  const publishBtn = document.getElementById('publish-btn');
  const discardBtn = document.getElementById('discard-draft-btn');
  const themeBtn = document.getElementById('admin-theme-toggle');

  const MODULES = [
    { id: 'analytics', group: 'Ringkasan', label: 'Analitik Kunjungan', icon: 'bar-chart-3' },
    { id: 'feedbacks', group: 'Ringkasan', label: 'Aduan & Saran', icon: 'message-square' },
    { id: 'identity', group: 'Konten Situs Publik', label: 'Identitas dan Logo', icon: 'shield-check' },
    { id: 'hero-tax', group: 'Konten Situs Publik', label: 'Beranda dan Cek Pajak', icon: 'car' },
    { id: 'services', group: 'Konten Situs Publik', label: 'Layanan dan Tarif PNBP', icon: 'file-text' },
    { id: 'hours', group: 'Konten Situs Publik', label: 'Jam Operasional WITA', icon: 'clock' },
    { id: 'samsat-keliling', group: 'Konten Situs Publik', label: 'Jadwal Samsat Keliling', icon: 'car' },
    { id: 'locations', group: 'Konten Situs Publik', label: 'Lokasi Kantor dan Gerai', icon: 'map-pin' },
    { id: 'profile', group: 'Konten Situs Publik', label: 'Profil dan Struktur', icon: 'building-2' },
    { id: 'contacts', group: 'Konten Situs Publik', label: 'Kontak dan Pengaduan', icon: 'phone' },
    { id: 'announcements', group: 'Konten Situs Publik', label: 'Berita, Event, dan Pengumuman', icon: 'megaphone' },
    { id: 'extras', group: 'Konten Situs Publik', label: 'Tautan Mitra, FAQ, dan SEO', icon: 'help-circle' },
    { id: 'assets', group: 'Pengaturan dan Aset', label: 'Kelola Foto & Aset', icon: 'image' }
  ];

  const LUCIDE_PATHS = {
    'bar-chart-3': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    'file-text': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    'check-circle-2': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    'edit-3': '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    'grip-vertical': '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
    navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    'external-link': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'
  };

  function lucideIcon(name, size = 18) {
    const inner = LUCIDE_PATHS[name] || LUCIDE_PATHS.info;
    return `<svg class="aui-lucide-icon" data-aui-icon="${esc(name)}" viewBox="0 0 24 24" width="${Number(size) || 18}" height="${Number(size) || 18}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  }

  function buildGoogleMapsDirectionsUrl(name, address) {
    const parts = [String(name || '').trim(), String(address || '').trim()].filter(Boolean);
    const destination = parts.length ? parts.join(', ') : 'Samsat Palu, Sulawesi Tengah';
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  }

  function bindSmoothAccordionDetails(rootEl) {
    if (!rootEl) return;
    const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DISCLOSURE_EASING = 'cubic-bezier(0.215, 0.61, 0.355, 1)';

    rootEl.querySelectorAll('.admin-svc-details').forEach((details) => {
      if (details.dataset.auiAccordionBound === '1') return;
      details.dataset.auiAccordionBound = '1';

      const summary = details.querySelector(':scope > .admin-svc-summary');
      const body = details.querySelector(':scope > .admin-svc-body');
      if (!summary || !body) return;

      summary.querySelectorAll('button').forEach((btn) => {
        if (btn.dataset.auiSummaryStop === '1') return;
        btn.dataset.auiSummaryStop = '1';
        btn.addEventListener('click', (ev) => {
          ev.preventDefault();
        });
      });

      let anim = null;
      let isClosing = false;
      let isExpanding = false;

      summary.addEventListener('click', (e) => {
        if (e.target.closest('button, a, .aui-drag-handle') || details._justDragged) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        if (prefersReduced()) {
          details.open = !details.open;
          return;
        }
        details.style.overflow = 'hidden';
        if (isClosing || !details.open) {
          details.style.height = `${details.offsetHeight}px`;
          details.open = true;
          window.requestAnimationFrame(() => {
            isExpanding = true;
            const startH = `${details.offsetHeight}px`;
            const endH = `${summary.offsetHeight + body.offsetHeight}px`;
            if (anim) anim.cancel();
            anim = details.animate({ height: [startH, endH] }, { duration: 350, easing: DISCLOSURE_EASING });
            anim.onfinish = () => {
              details.style.height = '';
              details.style.overflow = '';
              isExpanding = false;
              isClosing = false;
              anim = null;
            };
            anim.oncancel = () => { isExpanding = false; };
          });
        } else if (isExpanding || details.open) {
          isClosing = true;
          details.style.height = `${details.offsetHeight}px`;
          const startH = `${details.offsetHeight}px`;
          const endH = `${summary.offsetHeight}px`;
          if (anim) anim.cancel();
          anim = details.animate({ height: [startH, endH] }, { duration: 350, easing: DISCLOSURE_EASING });
          anim.onfinish = () => {
            details.open = false;
            details.style.height = '';
            details.style.overflow = '';
            isClosing = false;
            anim = null;
          };
          anim.oncancel = () => { isClosing = false; };
        }
      });
    });
  }

  function bindAnimateUiSortable(listEl, options = {}) {
    if (!listEl || listEl.dataset.auiSortableBound === '1') return;
    listEl.dataset.auiSortableBound = '1';

    const itemSelector = options.itemSelector || '.repeater-card';
    const onReorder = typeof options.onReorder === 'function' ? options.onReorder : () => { };
    const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SPRING_REFLOW_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

    let liveRegion = listEl.parentElement?.querySelector('.aui-sort-live');
    if (!liveRegion && listEl.parentElement) {
      liveRegion = document.createElement('p');
      liveRegion.className = 'sr-only aui-sort-live';
      liveRegion.setAttribute('aria-live', 'polite');
      listEl.parentElement.appendChild(liveRegion);
    }

    function getItems() {
      return Array.from(listEl.children).filter((el) => el.matches(itemSelector));
    }

    function announcePosition(item) {
      if (!liveRegion) return;
      const items = getItems();
      const idx = items.indexOf(item);
      if (idx >= 0) {
        liveRegion.textContent = `Urutan item dipindahkan ke posisi ${idx + 1} dari ${items.length}.`;
      }
    }

    function flipAnimateSiblings(oldTopMap, draggedItem) {
      if (prefersReduced()) return;
      getItems().forEach((el) => {
        if (el === draggedItem) return;
        const oldTop = oldTopMap.get(el);
        if (typeof oldTop !== 'number') return;
        const newTop = el.getBoundingClientRect().top;
        const deltaY = oldTop - newTop;
        if (Math.abs(deltaY) < 0.5 || typeof el.animate !== 'function') return;
        const anim = el.animate(
          [{ transform: `translate3d(0, ${deltaY}px, 0)` }, { transform: 'translate3d(0, 0, 0)' }],
          { duration: 220, easing: SPRING_REFLOW_EASING }
        );
        el._auiFlipAnim = anim;
        anim.onfinish = () => { if (el._auiFlipAnim === anim) el._auiFlipAnim = null; };
        anim.oncancel = () => { if (el._auiFlipAnim === anim) el._auiFlipAnim = null; };
      });
    }

    function moveItemKeyboard(item, direction) {
      const items = getItems();
      const idx = items.indexOf(item);
      const targetIdx = idx + direction;
      if (idx < 0 || targetIdx < 0 || targetIdx >= items.length) return;

      const oldTopMap = new Map();
      items.forEach((el) => {
        oldTopMap.set(el, el.getBoundingClientRect().top);
        if (el._auiFlipAnim) {
          el._auiFlipAnim.cancel();
          el._auiFlipAnim = null;
        }
      });

      const targetSibling = items[targetIdx];
      if (direction < 0) {
        listEl.insertBefore(item, targetSibling);
      } else {
        listEl.insertBefore(item, targetSibling.nextElementSibling);
      }

      flipAnimateSiblings(oldTopMap, null);
      onReorder(item, getItems());
      announcePosition(item);
      const handle = item.querySelector('.aui-drag-handle');
      if (handle) window.requestAnimationFrame(() => handle.focus());
    }

    listEl.addEventListener('keydown', (e) => {
      const handle = e.target.closest('.aui-drag-handle');
      if (!handle || handle.disabled || !canEditDraft()) return;
      const item = handle.closest(itemSelector);
      if (!item || item.parentElement !== listEl) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveItemKeyboard(item, -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveItemKeyboard(item, 1);
      }
    });

    listEl.addEventListener('pointerdown', (e) => {
      if (e.button && e.button !== 0) return;
      if (!canEditDraft()) return;
      const item = e.target.closest(itemSelector);
      if (!item || item.parentElement !== listEl) return;

      const dragHandle = e.target.closest('.aui-drag-handle');
      if (dragHandle && dragHandle.disabled) return;
      if (!dragHandle) {
        if (e.target.closest('button, a, input, select, textarea, option, label, [contenteditable]')) return;
        if (!e.target.closest('.admin-svc-summary, .repeater-card-top, .pejabat-admin-card')) return;
        if (item.matches('details') && !e.target.closest('.admin-svc-summary')) return;
      }

      if (getItems().length < 2) return;

      const startY = e.clientY;
      let dragOriginY = startY;
      let currentTranslateY = 0;
      let activeDrag = false;
      const threshold = dragHandle ? 2 : 6;
      const pointerId = e.pointerId;
      const captureTarget = dragHandle || item;

      function activateDrag() {
        activeDrag = true;
        item._justDragged = true;
        item.classList.add('aui-sortable-item', 'is-aui-dragging');
        try { captureTarget.setPointerCapture(pointerId); } catch (_) { /* ignore */ }
      }

      function onPointerMove(moveEvt) {
        if (moveEvt.pointerId !== pointerId) return;
        if (!activeDrag) {
          if (Math.abs(moveEvt.clientY - startY) < threshold) return;
          activateDrag();
        }
        moveEvt.preventDefault();

        const siblings = getItems();
        const idx = siblings.indexOf(item);
        const prevItem = idx > 0 ? siblings[idx - 1] : null;
        const nextItem = idx < siblings.length - 1 ? siblings[idx + 1] : null;

        let swapped = false;
        const oldTopMap = new Map();
        const oldNaturalTop = item.getBoundingClientRect().top - currentTranslateY;

        if (prevItem) {
          const prevRect = prevItem.getBoundingClientRect();
          if (moveEvt.clientY < prevRect.top + prevRect.height * 0.5) {
            siblings.forEach((el) => {
              if (el !== item) {
                oldTopMap.set(el, el.getBoundingClientRect().top);
                if (el._auiFlipAnim) {
                  el._auiFlipAnim.cancel();
                  el._auiFlipAnim = null;
                }
              }
            });
            listEl.insertBefore(item, prevItem);
            swapped = true;
          }
        }

        if (!swapped && nextItem) {
          const nextRect = nextItem.getBoundingClientRect();
          if (moveEvt.clientY > nextRect.top + nextRect.height * 0.5) {
            siblings.forEach((el) => {
              if (el !== item) {
                oldTopMap.set(el, el.getBoundingClientRect().top);
                if (el._auiFlipAnim) {
                  el._auiFlipAnim.cancel();
                  el._auiFlipAnim = null;
                }
              }
            });
            listEl.insertBefore(item, nextItem.nextElementSibling);
            swapped = true;
          }
        }

        if (swapped) {
          const newNaturalTop = item.getBoundingClientRect().top - currentTranslateY;
          dragOriginY += (newNaturalTop - oldNaturalTop);
          flipAnimateSiblings(oldTopMap, item);
          onReorder(item, getItems());
        }

        currentTranslateY = moveEvt.clientY - dragOriginY;
        item.style.transform = `translate3d(0, ${currentTranslateY}px, 0)`;
      }

      function finishDrag(endEvt) {
        if (endEvt && endEvt.pointerId !== pointerId) return;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', finishDrag);
        window.removeEventListener('pointercancel', finishDrag);
        if (activeDrag) {
          try { captureTarget.releasePointerCapture(pointerId); } catch (_) { /* ignore */ }
          const settleY = currentTranslateY;
          item.classList.remove('is-aui-dragging');
          item.style.transform = '';
          if (!prefersReduced() && Math.abs(settleY) > 0.5 && typeof item.animate === 'function') {
            item.animate(
              [{ transform: `translate3d(0, ${settleY}px, 0)` }, { transform: 'translate3d(0, 0, 0)' }],
              { duration: 190, easing: SPRING_REFLOW_EASING }
            );
          }
          onReorder(item, getItems());
          announcePosition(item);
          setTimeout(() => { item._justDragged = false; }, 50);
        }
      }

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', finishDrag);
      window.addEventListener('pointercancel', finishDrag);
    });
  }

  const state = {
    user: null,
    csrfToken: null,
    challengeToken: null,
    activeModule: 'analytics',
    quickUploadTargetSelectId: null,
    adminData: null,
    analyticsData: null,
    analyticsFilters: {
      range: '30d',
      startDate: '',
      endDate: '',
      device: 'all',
      source: 'all',
      region: 'all',
      granularity: 'daily'
    }
  };

  function esc(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function canEditDraft() {
    return state.user && ['Super Admin', 'Penyunting Senior', 'Editor'].includes(state.user.role);
  }

  function canPublish() {
    return state.user && ['Super Admin', 'Penyunting Senior'].includes(state.user.role);
  }

  function isSuperAdmin() {
    return state.user && state.user.role === 'Super Admin';
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    window.localStorage.setItem('sapa_theme', theme);
    if (themeBtn) {
      const dark = theme === 'dark';
      themeBtn.setAttribute('aria-pressed', String(dark));
      const label = dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap';
      themeBtn.setAttribute('aria-label', label);
      themeBtn.setAttribute('title', label);
      const iconSwap = themeBtn.querySelector('.theme-icon-swap');
      if (!iconSwap) {
        themeBtn.textContent = dark ? 'Mode Terang' : 'Mode Gelap';
      }
    }
    if (state.activeModule === 'analytics' && state.analyticsData && typeof echarts !== 'undefined') {
      setTimeout(() => initAnalyticsEcharts(state.analyticsData), 60);
    }
  }

  const savedTheme = window.localStorage.getItem('sapa_theme');
  if (savedTheme === 'dark' || savedTheme === 'light') applyTheme(savedTheme);
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
    });
  }

  function showLoginError(msg) {
    if (!loginErrorBox) return;
    if (!msg) {
      loginErrorBox.hidden = true;
      loginErrorBox.textContent = '';
      return;
    }
    loginErrorBox.hidden = false;
    loginErrorBox.textContent = msg;
  }

  const toastStack = document.getElementById('admin-toast-stack');

  function showToast(msg, kind = 'success', titleOverride = '') {
    if (!toastStack || !msg) return;
    const isErr = kind === 'error';
    const isInfo = kind === 'info';
    const iconName = isErr ? 'alert-triangle' : (isInfo ? 'info' : 'check-circle-2');
    const title = titleOverride || (isErr ? 'Gagal Menyimpan' : (isInfo ? 'Informasi' : 'Perubahan Tersimpan'));

    const item = document.createElement('li');
    item.className = `admin-toast-item toast-${isErr ? 'error' : (isInfo ? 'info' : 'success')}`;
    item.setAttribute('role', isErr ? 'alert' : 'status');
    item.innerHTML = `
      <span class="toast-icon-badge" aria-hidden="true">${lucideIcon(iconName, 18)}</span>
      <div class="toast-copy">
        <strong class="toast-title">${esc(title)}</strong>
        <p class="toast-desc">${esc(msg)}</p>
      </div>
      <button type="button" class="toast-dismiss-btn" aria-label="Tutup notifikasi">${lucideIcon('x', 14)}</button>
    `;

    let closed = false;
    const closeToast = () => {
      if (closed) return;
      closed = true;
      item.classList.add('is-leaving');
      setTimeout(() => {
        if (item.parentNode) item.parentNode.removeChild(item);
      }, 220);
    };

    item.querySelector('.toast-dismiss-btn').addEventListener('click', closeToast);
    toastStack.appendChild(item);

    while (toastStack.children.length > 4) {
      const oldest = toastStack.firstElementChild;
      if (oldest) oldest.remove();
    }

    setTimeout(closeToast, 4400);
  }

  function showFeedback(msg, kind = 'success') {
    if (feedbackBox) {
      if (!msg) {
        feedbackBox.hidden = true;
      } else {
        feedbackBox.hidden = false;
        feedbackBox.className = `alert-box alert-${kind}`;
        feedbackBox.textContent = msg;
      }
    }
    if (msg) {
      showToast(msg, kind);
    }
  }

  function confirmAdminAction(options = {}) {
    const dlg = document.getElementById('admin-confirm-dialog');
    const titleEl = document.getElementById('confirm-dialog-title');
    const msgEl = document.getElementById('confirm-dialog-message');
    const inputWrap = document.getElementById('confirm-dialog-input-wrap');
    const inputLabelEl = document.getElementById('confirm-dialog-input-label');
    const inputEl = document.getElementById('confirm-dialog-input');
    const okBtn = document.getElementById('confirm-dialog-ok');
    const cancelBtn = document.getElementById('confirm-dialog-cancel');

    if (!dlg) {
      const ok = window.confirm(options.message || 'Apakah Anda yakin ingin menyimpan perubahan?');
      return Promise.resolve({ confirmed: ok, inputValue: options.defaultValue || '' });
    }

    dlg.classList.toggle('is-danger', options.variant === 'danger');
    if (titleEl) titleEl.textContent = options.title || 'Konfirmasi Simpan Perubahan';
    if (msgEl) msgEl.textContent = options.message || 'Apakah Anda yakin ingin menyimpan perubahan ini ke draf?';
    if (okBtn) {
      okBtn.textContent = options.confirmLabel || 'Ya, Simpan Perubahan';
      okBtn.className = `btn ${options.variant === 'danger' ? 'btn-danger' : 'btn-primary'}`;
    }

    if (inputWrap && inputEl) {
      if (options.showInput) {
        inputWrap.hidden = false;
        if (inputLabelEl) inputLabelEl.textContent = options.inputLabel || 'Catatan Revisi (Opsional)';
        inputEl.placeholder = options.inputPlaceholder || '';
        inputEl.value = options.defaultValue || '';
      } else {
        inputWrap.hidden = true;
        inputEl.value = '';
      }
    }

    return new Promise((resolve) => {
      let settled = false;
      function cleanup(confirmed) {
        if (settled) return;
        settled = true;
        okBtn?.removeEventListener('click', onOk);
        cancelBtn?.removeEventListener('click', onCancel);
        dlg.removeEventListener('cancel', onDialogCancel);
        dlg.removeEventListener('click', onBackdrop);
        if (dlg.open && typeof dlg.close === 'function') dlg.close();
        else dlg.removeAttribute('open');
        resolve({ confirmed, inputValue: inputEl ? inputEl.value : '' });
      }

      function onOk() {
        cleanup(true);
      }

      function onCancel() {
        cleanup(false);
      }

      function onDialogCancel(e) {
        e.preventDefault();
        cleanup(false);
      }

      function onBackdrop(e) {
        if (e.target === dlg) cleanup(false);
      }

      okBtn?.addEventListener('click', onOk);
      cancelBtn?.addEventListener('click', onCancel);
      dlg.addEventListener('cancel', onDialogCancel);
      dlg.addEventListener('click', onBackdrop);

      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', 'true');
      if (options.showInput && inputEl) inputEl.focus();
      else okBtn?.focus();
    });
  }

  async function api(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (state.csrfToken && options.method && options.method !== 'GET') {
      headers['X-CSRF-Token'] = state.csrfToken;
    }
    const res = await fetch(url, { ...options, headers, credentials: 'same-origin' });
    const text = await res.text();
    let json = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { error: text || 'Respons server tidak valid' };
    }
    if (res.status === 401 && !url.includes('/login') && !url.includes('/verify-2fa')) {
      showLoginView('Sesi Anda berakhir atau belum masuk. Silakan masuk kembali.');
      throw new Error(json.error || 'Sesi berakhir');
    }
    if (!res.ok) {
      throw new Error(json.error || `Permintaan gagal (${res.status})`);
    }
    return json;
  }

  function showLoginView(msg = '') {
    loginView.hidden = false;
    workspaceView.hidden = true;
    logoutBtn.hidden = true;
    roleBadge.hidden = true;
    loginForm.hidden = false;
    otpForm.hidden = true;
    resetForm.hidden = true;
    showLoginError(msg);
  }

  function showWorkspaceView() {
    loginView.hidden = true;
    workspaceView.hidden = false;
    logoutBtn.hidden = false;
    roleBadge.hidden = false;
    roleBadge.textContent = `${state.user.name} (${state.user.role})`;
    renderNav();
  }

  // Login, 2FA, and Reset Password handlers (A1)
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoginError('');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
      showLoginError('Isi email petugas dan kata sandi terlebih dahulu.');
      return;
    }
    try {
      const data = await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      state.challengeToken = data.challengeToken;
      loginForm.hidden = true;
      otpForm.hidden = false;
      if (data.devOtpHint) {
        devOtpNotice.hidden = false;
        devOtpNotice.textContent = `Kode verifikasi lokal sementara: ${data.devOtpHint} (berlaku 5 menit).`;
      } else {
        devOtpNotice.hidden = true;
      }
      document.getElementById('otp-code').focus();
    } catch (err) {
      showLoginError(err.message);
    }
  });

  otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoginError('');
    const code = document.getElementById('otp-code').value.trim();
    try {
      const data = await api('/api/admin/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ challengeToken: state.challengeToken, code })
      });
      state.user = data.user;
      state.csrfToken = data.csrfToken;
      document.getElementById('login-password').value = '';
      document.getElementById('otp-code').value = '';
      showWorkspaceView();
      await loadAdminState();
    } catch (err) {
      showLoginError(err.message);
    }
  });

  document.getElementById('otp-back-btn').addEventListener('click', () => {
    otpForm.hidden = true;
    loginForm.hidden = false;
    showLoginError('');
  });

  document.getElementById('open-reset-btn').addEventListener('click', () => {
    loginForm.hidden = true;
    resetForm.hidden = false;
    document.getElementById('reset-token-step').hidden = true;
    document.getElementById('reset-submit-btn').textContent = 'Kirim Permintaan Reset';
    showLoginError('');
  });

  document.getElementById('reset-back-btn').addEventListener('click', () => {
    resetForm.hidden = true;
    loginForm.hidden = false;
    showLoginError('');
  });

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoginError('');
    const email = document.getElementById('reset-email').value.trim();
    const tokenStep = document.getElementById('reset-token-step');
    const tokenHint = document.getElementById('reset-token-hint');

    try {
      if (tokenStep.hidden) {
        const res = await api('/api/admin/reset-password', {
          method: 'POST',
          body: JSON.stringify({ action: 'request', email })
        });
        tokenStep.hidden = false;
        document.getElementById('reset-submit-btn').textContent = 'Simpan Kata Sandi Baru';
        if (res.devResetToken) {
          tokenHint.hidden = false;
          tokenHint.textContent = `Token reset lokal: ${res.devResetToken}`;
        }
      } else {
        const token = document.getElementById('reset-token').value.trim();
        const newPassword = document.getElementById('reset-new-password').value;
        await api('/api/admin/reset-password', {
          method: 'POST',
          body: JSON.stringify({ action: 'confirm', email, token, newPassword })
        });
        resetForm.hidden = true;
        loginForm.hidden = false;
        showLoginError('');
        alert('Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru.');
      }
    } catch (err) {
      showLoginError(err.message);
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      await api('/api/admin/logout', { method: 'POST', body: JSON.stringify({}) });
    } catch {
      // Ignore logout failure and reset client session view.
    }
    state.user = null;
    state.csrfToken = null;
    showLoginView();
  });

  function renderNav() {
    const groups = [];
    for (const m of MODULES) {
      let g = groups.find((x) => x.name === m.group);
      if (!g) {
        g = { name: m.group, items: [] };
        groups.push(g);
      }
      g.items.push(m);
    }

    moduleNav.innerHTML = groups.map((g) => `
      <div class="nav-group">
        <span class="nav-group-label">${esc(g.name)}</span>
        ${g.items.map((m) => `
          <button type="button" class="btn sidebar-item" data-module="${esc(m.id)}" ${state.activeModule === m.id ? 'aria-current="page"' : ''}>
            ${lucideIcon(m.icon, 17)}
            <span>${esc(m.label)}</span>
          </button>
        `).join('')}
      </div>
    `).join('');

    moduleNav.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeModule = btn.getAttribute('data-module');
        renderNav();
        renderActiveModule();
      });
    });

    mobilePicker.innerHTML = groups.map((g) => `
      <optgroup label="${esc(g.name)}">
        ${g.items.map((m) => `
          <option value="${esc(m.id)}" ${state.activeModule === m.id ? 'selected' : ''}>${esc(m.label)}</option>
        `).join('')}
      </optgroup>
    `).join('');

    if (typeof mobilePicker._syncCustomSelect === 'function') {
      mobilePicker._syncCustomSelect();
    } else if (mobilePicker.parentElement) {
      enhanceAdminControls(mobilePicker.parentElement);
    }
  }

  mobilePicker.addEventListener('change', () => {
    state.activeModule = mobilePicker.value;
    renderNav();
    renderActiveModule();
  });

  async function loadAdminState() {
    try {
      const data = await api('/api/admin/state');
      state.adminData = data;
      updateDecisionBar();
      renderActiveModule();
    } catch (err) {
      moduleContent.innerHTML = `<div class="state-box alert-error"><p>Gagal memuat data admin: ${esc(err.message)}</p></div>`;
    }
  }

  function updateDecisionBar() {
    const d = state.adminData;
    if (!d) return;
    if (d.hasUnpublishedChanges) {
      if (draftStatusPill) {
        draftStatusPill.textContent = 'Status Draf: Ada Perubahan Belum Ditayangkan';
        draftStatusPill.className = 'status-pill status-pill-draft';
      }
      draftStateLabel.textContent = 'Simpanan draf berbeda dengan tampilan situs publik saat ini.';
    } else {
      if (draftStatusPill) {
        draftStatusPill.textContent = 'Status Publik: Sudah Selaras';
        draftStatusPill.className = 'status-pill status-pill-synced';
      }
      draftStateLabel.textContent = 'Semua konten yang tampil ke publik sudah memakai versi terbaru.';
    }
    publishedMetaLabel.textContent = `Terbit terakhir: ${d.publishedAt ? new Date(d.publishedAt).toLocaleString('id-ID') : '-'} oleh ${d.publishedBy || '-'}`;

    publishBtn.disabled = !canPublish() || !d.hasUnpublishedChanges;
    discardBtn.disabled = !canEditDraft() || !d.hasUnpublishedChanges;
    if (!canPublish()) {
      publishBtn.title = 'Hanya Super Admin atau Penyunting Senior yang dapat menerbitkan draf.';
    }

    if (d.stalenessAlerts && d.stalenessAlerts.length > 0) {
      stalenessBanner.hidden = false;
      const chips = d.stalenessAlerts
        .map((a) => `<span class="staleness-chip" title="${esc(a.reason)}">${esc(a.name)}</span>`)
        .join('');
      stalenessBanner.innerHTML = `
        <div class="staleness-callout">
          <div class="staleness-copy">
            <strong>Data Layanan Perlu Dilengkapi atau Diperbarui (${d.stalenessAlerts.length} layanan)</strong>
            <div class="staleness-chips">${chips}</div>
          </div>
          <button type="button" id="jump-services-btn" class="btn btn-secondary btn-sm">Buka Layanan dan Tarif PNBP</button>
        </div>
      `;
      const jumpBtn = document.getElementById('jump-services-btn');
      if (jumpBtn) {
        jumpBtn.addEventListener('click', () => {
          state.activeModule = 'services';
          renderNav();
          renderActiveModule();
        });
      }
    } else {
      stalenessBanner.hidden = true;
    }
  }

  publishBtn.addEventListener('click', async () => {
    if (!canPublish()) return;
    const { confirmed, inputValue } = await confirmAdminAction({
      title: 'Terbitkan Perubahan ke Situs Publik?',
      message: 'Semua draf yang sudah disimpan akan langsung tayang dan dapat dilihat warga Palu.',
      confirmLabel: 'Ya, Terbitkan Sekarang',
      showInput: true,
      inputLabel: 'Catatan Singkat Pembaruan (Opsional)',
      inputPlaceholder: 'Contoh: Pembaruan pengumuman layanan Sabtu',
      defaultValue: 'Pembaruan konten oleh Super Admin'
    });
    if (!confirmed) return;
    try {
      await api('/api/admin/publish', {
        method: 'POST',
        body: JSON.stringify({ summary: inputValue || 'Pembaruan konten oleh Super Admin' })
      });
      showFeedback('Perubahan draf berhasil diterbitkan ke situs publik.', 'success');
      await loadAdminState();
    } catch (err) {
      showFeedback(err.message || 'Gagal menerbitkan perubahan.', 'error');
    }
  });

  discardBtn.addEventListener('click', async () => {
    if (!canEditDraft()) return;
    const { confirmed } = await confirmAdminAction({
      title: 'Batalkan Semua Perubahan Draf?',
      message: 'Seluruh perubahan yang belum diterbitkan akan dihapus dan dikembalikan ke versi tayang saat ini.',
      confirmLabel: 'Ya, Kembalikan Draf',
      variant: 'danger'
    });
    if (!confirmed) return;
    try {
      await api('/api/admin/discard-draft', { method: 'POST', body: JSON.stringify({}) });
      showFeedback('Draf berhasil dikembalikan ke versi yang sedang tayang.', 'info');
      await loadAdminState();
    } catch (err) {
      showFeedback(err.message || 'Gagal membatalkan draf.', 'error');
    }
  });

  document.querySelectorAll('dialog.admin-dialog:not(#admin-confirm-dialog)').forEach((dlg) => {
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) {
        if (typeof dlg.close === 'function') dlg.close();
        else dlg.removeAttribute('open');
      }
    });
  });

  async function saveDraftSections(pairs, successMsg, confirmOpts = {}) {
    if (!canEditDraft()) {
      showFeedback('Peran Anda hanya memiliki izin lihat.', 'error');
      return false;
    }
    if (!confirmOpts.skipConfirm) {
      const { confirmed } = await confirmAdminAction({
        title: confirmOpts.title || 'Simpan Perubahan Draf?',
        message: confirmOpts.message || 'Apakah Anda yakin ingin menyimpan perubahan ini ke draf? Anda dapat memeriksa pratinjau sebelum menerbitkan ke publik.',
        confirmLabel: confirmOpts.confirmLabel || 'Ya, Simpan Draf',
        variant: confirmOpts.variant
      });
      if (!confirmed) return false;
    }

    try {
      for (const [section, payload] of pairs) {
        await api(`/api/admin/draft/${encodeURIComponent(section)}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      }
      showFeedback(successMsg || 'Draf berhasil disimpan. Klik Lihat Pratinjau atau Terbitkan ke Publik.', 'success');
      await loadAdminState();
      return true;
    } catch (err) {
      showFeedback(err.message || 'Terjadi kesalahan saat menyimpan perubahan.', 'error');
      return false;
    }
  }

  async function saveDraftSection(section, payload, successMsg, confirmOpts = {}) {
    return saveDraftSections([[section, payload]], successMsg, confirmOpts);
  }

  function findMediaItem(mediaId) {
    const media = state.adminData?.media || [];
    return media.find((m) => m.id === mediaId) || media[0] || {
      id: '',
      url: '/assets/placeholders/foto-lokasi.svg',
      filename: 'Belum dipilih',
      alt: 'Pratinjau gambar',
      width: 480,
      height: 300
    };
  }

  function mediaSelectOptions(selectedId) {
    const media = state.adminData?.media || [];
    return media.map((m) => {
      const label = m.alt || m.filename;
      return `<option value="${esc(m.id)}" ${m.id === selectedId ? 'selected' : ''}>${esc(label)}</option>`;
    }).join('');
  }

  async function processImageFile(file, cropMode) {
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Ukuran berkas melebihi batas maksimal 2 MB.');
    }
    if (file.type === 'image/svg+xml') {
      const text = await file.text();
      return {
        dataUrl: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(text)))}`,
        width: 480,
        height: 300,
        mimeType: 'image/svg+xml'
      };
    }

    const bitmap = await createImageBitmap(file);
    let sx = 0;
    let sy = 0;
    let sw = bitmap.width;
    let sh = bitmap.height;

    if (cropMode !== 'free') {
      const targetRatio = cropMode === '16:10' ? 1.6 : 4 / 3;
      const srcRatio = sw / sh;
      if (srcRatio > targetRatio) {
        sw = Math.round(sh * targetRatio);
        sx = Math.round((bitmap.width - sw) / 2);
      } else {
        sh = Math.round(sw / targetRatio);
        sy = Math.round((bitmap.height - sh) / 2);
      }
    }

    const maxWidth = 1280;
    const scale = sw > maxWidth ? maxWidth / sw : 1;
    const outW = Math.max(1, Math.round(sw * scale));
    const outH = Math.max(1, Math.round(sh * scale));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH);
    const dataUrl = canvas.toDataURL('image/webp', 0.82);
    return { dataUrl, width: outW, height: outH, mimeType: 'image/webp' };
  }

  function showFilePreview(file, previewWrap, previewImg, nameEl, infoEl, altInput) {
    if (!file || !previewWrap || !previewImg) return;
    const reader = new FileReader();
    reader.onload = () => {
      previewImg.src = reader.result;
      previewWrap.hidden = false;
    };
    reader.readAsDataURL(file);
    if (nameEl) nameEl.textContent = file.name;
    if (infoEl) infoEl.textContent = `Ukuran asli: ${Math.max(1, Math.round(file.size / 1024))} KB`;
    if (altInput && !altInput.value.trim()) {
      altInput.value = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
    }
  }

  function bindDropzone(dropzoneEl, fileInput, onFileReady) {
    if (!dropzoneEl || !fileInput) return;
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) onFileReady(fileInput.files[0]);
    });
    ['dragenter', 'dragover'].forEach((evt) => {
      dropzoneEl.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzoneEl.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach((evt) => {
      dropzoneEl.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzoneEl.classList.remove('drag-over');
      });
    });
    dropzoneEl.addEventListener('drop', (e) => {
      const files = e.dataTransfer?.files;
      if (files && files[0]) {
        const dt = new DataTransfer();
        dt.items.add(files[0]);
        fileInput.files = dt.files;
        onFileReady(files[0]);
      }
    });
  }

  const CALENDAR_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const CALENDAR_SHORT_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  function formatDisplayDateId(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return 'Pilih tanggal';
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${CALENDAR_SHORT_MONTHS[m - 1] || m} ${y}`;
  }

  function toIsoDate(year, monthIndex, day) {
    const m = String(monthIndex + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function closeAllCustomPopovers(exceptWrap) {
    document.querySelectorAll('.custom-select-wrap.is-open').forEach((wrap) => {
      if (wrap === exceptWrap) return;
      wrap.classList.remove('is-open');
      const trig = wrap.querySelector('.custom-select-trigger');
      const menu = wrap.querySelector('.custom-select-menu');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      if (menu) menu.hidden = true;
    });
    document.querySelectorAll('.custom-date-wrap.is-open').forEach((wrap) => {
      if (wrap === exceptWrap) return;
      wrap.classList.remove('is-open');
      const trig = wrap.querySelector('.custom-date-trigger');
      const pop = wrap.querySelector('.custom-date-popover');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      if (pop) pop.hidden = true;
    });
    document.querySelectorAll('.aui-combobox-wrap.is-open').forEach((wrap) => {
      if (wrap === exceptWrap) return;
      wrap.classList.remove('is-open');
      wrap.classList.remove('popover-open-up');
      const trig = wrap.querySelector('.aui-combobox-trigger');
      const pop = wrap.querySelector('.aui-combobox-popover');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      if (pop) pop.hidden = true;
    });
  }

  document.addEventListener('click', (e) => {
    const insideWrap = e.target.closest('.custom-select-wrap, .custom-date-wrap, .aui-combobox-wrap');
    if (!insideWrap) closeAllCustomPopovers(null);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllCustomPopovers(null);
  });

  function enhanceSelect(sel) {
    if (!sel || sel.dataset.enhanced === 'true') {
      if (sel && typeof sel._syncCustomSelect === 'function') sel._syncCustomSelect();
      return;
    }
    sel.dataset.enhanced = 'true';

    const wrap = document.createElement('div');
    wrap.className = 'custom-select-wrap';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add('sr-only');
    sel.tabIndex = -1;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<span class="custom-select-label"></span><svg class="custom-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;

    wrap.appendChild(trigger);
    wrap.appendChild(menu);

    const labelSpan = trigger.querySelector('.custom-select-label');

    function buildMenuItems() {
      menu.innerHTML = '';
      const appendOptionBtn = (opt) => {
        const itemBtn = document.createElement('button');
        itemBtn.type = 'button';
        itemBtn.className = 'custom-select-option';
        itemBtn.setAttribute('role', 'option');
        const selected = opt.value === sel.value;
        itemBtn.setAttribute('aria-selected', selected ? 'true' : 'false');
        itemBtn.disabled = Boolean(opt.disabled);
        const textSpan = document.createElement('span');
        textSpan.textContent = opt.textContent;
        itemBtn.appendChild(textSpan);
        if (selected) {
          const check = document.createElement('span');
          check.setAttribute('aria-hidden', 'true');
          check.textContent = '✓';
          itemBtn.appendChild(check);
        }
        itemBtn.addEventListener('click', () => {
          sel.value = opt.value;
          sel._syncCustomSelect();
          closeAllCustomPopovers(null);
          trigger.focus();
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        });
        menu.appendChild(itemBtn);
      };

      Array.from(sel.children).forEach((child) => {
        if (child.tagName === 'OPTGROUP') {
          const gLabel = document.createElement('div');
          gLabel.className = 'custom-select-group-label';
          gLabel.textContent = child.label || '';
          menu.appendChild(gLabel);
          Array.from(child.children).forEach((opt) => {
            if (opt.tagName === 'OPTION') appendOptionBtn(opt);
          });
        } else if (child.tagName === 'OPTION') {
          appendOptionBtn(child);
        }
      });
    }

    sel._syncCustomSelect = function syncCustomSelect() {
      const selectedOpt = sel.options[sel.selectedIndex] || sel.options[0];
      labelSpan.textContent = selectedOpt ? selectedOpt.textContent : 'Pilih opsi';
      trigger.disabled = Boolean(sel.disabled);
      buildMenuItems();
    };

    trigger.addEventListener('click', () => {
      if (trigger.disabled) return;
      const opening = menu.hidden;
      closeAllCustomPopovers(opening ? wrap : null);
      menu.hidden = !opening;
      wrap.classList.toggle('is-open', opening);
      trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
    });

    sel.addEventListener('change', () => sel._syncCustomSelect());
    sel.addEventListener('focus', () => trigger.focus());
    sel._syncCustomSelect();
  }

  function enhanceDateInput(input) {
    if (!input || input.dataset.enhanced === 'true') {
      if (input && typeof input._syncCustomDate === 'function') input._syncCustomDate();
      return;
    }
    input.dataset.enhanced = 'true';

    const wrap = document.createElement('div');
    wrap.className = 'custom-date-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    input.classList.add('sr-only');
    input.tabIndex = -1;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-date-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<span class="custom-date-leading"><svg class="custom-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span class="custom-date-label"></span></span><svg class="custom-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    const popover = document.createElement('div');
    popover.className = 'custom-date-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Pilih tanggal');
    popover.hidden = true;

    wrap.appendChild(trigger);
    wrap.appendChild(popover);

    const labelSpan = trigger.querySelector('.custom-date-label');
    const now = new Date();
    let viewYear = now.getFullYear();
    let viewMonth = now.getMonth();

    function syncMonthFromInput() {
      if (input.value && /^\d{4}-\d{2}-\d{2}$/.test(input.value)) {
        const [y, m] = input.value.split('-').map(Number);
        viewYear = y;
        viewMonth = m - 1;
      }
    }

    function commitDate(iso) {
      input.value = iso;
      input._syncCustomDate();
      closeAllCustomPopovers(null);
      trigger.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function renderCalendar() {
      const today = new Date();
      const todayIso = toIsoDate(today.getFullYear(), today.getMonth(), today.getDate());
      const firstDay = new Date(viewYear, viewMonth, 1);
      const startOffset = (firstDay.getDay() + 6) % 7;
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

      popover.innerHTML = `
        <div class="calendar-header">
          <button type="button" class="calendar-nav-btn" data-cal-nav="-1" aria-label="Bulan sebelumnya">&lt;</button>
          <span class="calendar-title">${esc(CALENDAR_MONTHS[viewMonth])} ${viewYear}</span>
          <button type="button" class="calendar-nav-btn" data-cal-nav="1" aria-label="Bulan berikutnya">&gt;</button>
        </div>
        <div class="calendar-weekdays" aria-hidden="true">
          <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
        </div>
        <div class="calendar-grid"></div>
        <div class="calendar-footer">
          <button type="button" class="btn btn-secondary btn-sm" data-cal-clear>Hapus</button>
          <button type="button" class="btn btn-accent btn-sm" data-cal-today>Hari Ini</button>
        </div>
      `;

      const grid = popover.querySelector('.calendar-grid');
      const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

      for (let i = 0; i < totalCells; i += 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'calendar-day';

        let cellYear = viewYear;
        let cellMonth = viewMonth;
        let dayNum;

        if (i < startOffset) {
          dayNum = prevMonthDays - startOffset + i + 1;
          cellMonth -= 1;
          if (cellMonth < 0) {
            cellMonth = 11;
            cellYear -= 1;
          }
          btn.classList.add('is-muted');
        } else if (i >= startOffset + daysInMonth) {
          dayNum = i - (startOffset + daysInMonth) + 1;
          cellMonth += 1;
          if (cellMonth > 11) {
            cellMonth = 0;
            cellYear += 1;
          }
          btn.classList.add('is-muted');
        } else {
          dayNum = i - startOffset + 1;
        }

        const iso = toIsoDate(cellYear, cellMonth, dayNum);
        btn.textContent = String(dayNum);
        if (iso === todayIso) btn.classList.add('is-today');
        if (iso === input.value) btn.classList.add('is-selected');
        btn.addEventListener('click', () => commitDate(iso));
        grid.appendChild(btn);
      }

      popover.querySelectorAll('[data-cal-nav]').forEach((navBtn) => {
        navBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          viewMonth += Number(navBtn.getAttribute('data-cal-nav'));
          if (viewMonth < 0) {
            viewMonth = 11;
            viewYear -= 1;
          } else if (viewMonth > 11) {
            viewMonth = 0;
            viewYear += 1;
          }
          renderCalendar();
        });
      });

      popover.querySelector('[data-cal-today]').addEventListener('click', () => commitDate(todayIso));
      popover.querySelector('[data-cal-clear]').addEventListener('click', () => commitDate(''));
    }

    input._syncCustomDate = function syncCustomDate() {
      labelSpan.textContent = formatDisplayDateId(input.value);
      trigger.disabled = Boolean(input.disabled);
      syncMonthFromInput();
    };

    trigger.addEventListener('click', () => {
      if (trigger.disabled) return;
      const opening = popover.hidden;
      closeAllCustomPopovers(opening ? wrap : null);
      if (opening) {
        syncMonthFromInput();
        renderCalendar();
      }
      popover.hidden = !opening;
      wrap.classList.toggle('is-open', opening);
      trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
    });

    input.addEventListener('change', () => input._syncCustomDate());
    input.addEventListener('focus', () => trigger.focus());
    input._syncCustomDate();
  }

  function enhanceAdminControls(root = document) {
    if (!root) return;
    root.querySelectorAll('select').forEach((sel) => {
      if (sel.classList.contains('media-picker-select')) {
        enhanceMediaCombobox(sel);
      } else {
        enhanceSelect(sel);
      }
    });
    root.querySelectorAll('input[type="date"]').forEach((inp) => enhanceDateInput(inp));
  }

  function enhanceMediaCombobox(sel) {
    if (!sel) return;
    if (sel.dataset.enhanced === 'true') {
      if (typeof sel._syncMediaCombobox === 'function') sel._syncMediaCombobox();
      return;
    }
    sel.dataset.enhanced = 'true';

    const wrap = document.createElement('div');
    wrap.className = 'aui-combobox-wrap';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add('sr-only');
    sel.tabIndex = -1;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'aui-combobox-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = `
      <span class="aui-combobox-trigger-content">
        <span class="aui-combobox-trigger-thumb"><img src="" alt=""></span>
        <span class="aui-combobox-trigger-name"></span>
        <span class="aui-combobox-badge"></span>
      </span>
      <span class="aui-combobox-chevron">${lucideIcon('chevron-down', 16)}</span>
    `;

    const popover = document.createElement('div');
    popover.className = 'aui-combobox-popover';
    popover.hidden = true;
    popover.innerHTML = `
      <div class="aui-combobox-search-box">
        <span class="aui-combobox-search-icon">${lucideIcon('search', 14)}</span>
        <input type="text" class="aui-combobox-search-input" placeholder="Cari foto atau nama aset..." autocomplete="off">
      </div>
      <div class="aui-combobox-list" role="listbox"></div>
      <div class="aui-combobox-empty" hidden>Foto tidak ditemukan.</div>
    `;

    wrap.appendChild(trigger);
    wrap.appendChild(popover);

    const thumbImg = trigger.querySelector('.aui-combobox-trigger-thumb img');
    const nameSpan = trigger.querySelector('.aui-combobox-trigger-name');
    const badgeSpan = trigger.querySelector('.aui-combobox-badge');
    const searchInput = popover.querySelector('.aui-combobox-search-input');
    const listEl = popover.querySelector('.aui-combobox-list');
    const emptyEl = popover.querySelector('.aui-combobox-empty');

    function renderItems(filterQuery = '') {
      const q = filterQuery.trim().toLowerCase();
      const media = state.adminData?.media || [];
      const filtered = media.filter((m) => {
        if (!q) return true;
        const fn = (m.filename || '').toLowerCase();
        const alt = (m.alt || '').toLowerCase();
        const badge = m.isPlaceholder ? 'bawaan placeholder' : 'asli foto';
        return fn.includes(q) || alt.includes(q) || badge.includes(q);
      });

      listEl.innerHTML = '';
      if (!filtered.length) {
        emptyEl.hidden = false;
        return;
      }
      emptyEl.hidden = true;

      filtered.forEach((m) => {
        const itemBtn = document.createElement('button');
        itemBtn.type = 'button';
        itemBtn.className = 'aui-combobox-item';
        itemBtn.setAttribute('role', 'option');
        const isSelected = m.id === sel.value;
        itemBtn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        const displayName = m.alt || m.filename;
        const subtext = m.isPlaceholder
          ? `Aset Bawaan (${m.filename})`
          : `${m.filename} • ${m.width || 0}x${m.height || 0} px`;
        itemBtn.innerHTML = `
          <span class="aui-combobox-item-main">
            <span class="aui-combobox-item-thumb"><img src="${esc(m.url)}" alt="${esc(displayName)}"></span>
            <div class="aui-combobox-item-info">
              <strong class="aui-combobox-item-name">${esc(displayName)}</strong>
              <span class="aui-combobox-item-meta">${esc(subtext)}</span>
            </div>
          </span>
          <div class="aui-combobox-item-right">
            <span class="aui-combobox-badge ${m.isPlaceholder ? '' : 'is-custom'}">${m.isPlaceholder ? 'Bawaan' : 'Foto Asli'}</span>
            <span class="aui-combobox-check" aria-hidden="true">${isSelected ? lucideIcon('check-circle-2', 16) : ''}</span>
          </div>
        `;

        itemBtn.addEventListener('click', () => {
          sel.value = m.id;
          sel._syncMediaCombobox();
          closeAllCustomPopovers(null);
          trigger.focus();
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        });

        listEl.appendChild(itemBtn);
      });
    }

    sel._syncMediaCombobox = function syncMediaCombobox() {
      const current = findMediaItem(sel.value);
      const displayLabel = current.alt || current.filename || 'Pilih foto';
      if (thumbImg) {
        thumbImg.src = current.url || '/assets/placeholders/foto-lokasi.svg';
        thumbImg.alt = displayLabel;
      }
      if (nameSpan) {
        nameSpan.textContent = displayLabel;
        nameSpan.title = `${displayLabel} (${current.filename || ''})`;
      }
      if (badgeSpan) {
        badgeSpan.textContent = current.isPlaceholder ? 'Bawaan' : 'Foto Asli';
        badgeSpan.className = `aui-combobox-badge ${current.isPlaceholder ? '' : 'is-custom'}`;
      }
      trigger.disabled = Boolean(sel.disabled);
      renderItems(searchInput ? searchInput.value : '');
    };

    trigger.addEventListener('click', () => {
      if (trigger.disabled) return;
      const opening = popover.hidden;
      closeAllCustomPopovers(opening ? wrap : null);
      popover.hidden = !opening;
      wrap.classList.toggle('is-open', opening);
      trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
      if (opening) {
        const rect = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < 320 && rect.top > 260;
        wrap.classList.toggle('popover-open-up', openUp);

        const scrollParent = trigger.closest('.dialog-body, .modal-card, .admin-dialog');
        if (scrollParent) {
          trigger.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        if (searchInput) {
          searchInput.value = '';
          renderItems('');
          setTimeout(() => searchInput.focus(), 60);
        }
        const activeItem = listEl.querySelector('.aui-combobox-item[aria-selected="true"]');
        if (activeItem) {
          setTimeout(() => activeItem.scrollIntoView({ block: 'nearest' }), 70);
        }
      } else {
        wrap.classList.remove('popover-open-up');
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderItems(searchInput.value);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const first = listEl.querySelector('.aui-combobox-item');
          if (first) first.focus();
        } else if (e.key === 'Escape') {
          closeAllCustomPopovers(null);
          trigger.focus();
        }
      });
    }

    listEl.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (!active || !active.classList.contains('aui-combobox-item')) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = active.nextElementSibling;
        if (next && next.classList.contains('aui-combobox-item')) next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = active.previousElementSibling;
        if (prev && prev.classList.contains('aui-combobox-item')) {
          prev.focus();
        } else if (searchInput) {
          searchInput.focus();
        }
      } else if (e.key === 'Escape') {
        closeAllCustomPopovers(null);
        trigger.focus();
      }
    });

    sel.addEventListener('change', () => sel._syncMediaCombobox());
    sel.addEventListener('focus', () => trigger.focus());
    sel._syncMediaCombobox();
  }

  function renderMediaPickerField({ selectId, label, selectedId, defaultAlt, readOnlyAttr, cropDefault = 'free' }) {
    const current = findMediaItem(selectedId);
    const sizeKb = current.sizeBytes ? `${Math.max(1, Math.round(current.sizeBytes / 1024))} KB` : 'Aset bawaan';
    return `
      <div class="field-group">
        <label for="${esc(selectId)}">${esc(label)}</label>
        <div class="media-picker-card" data-picker-for="${esc(selectId)}">
          <div class="media-picker-thumb">
            <img src="${esc(current.url)}" alt="${esc(current.alt)}" data-picker-img="${esc(selectId)}">
          </div>
          <div class="media-picker-controls">
            <select id="${esc(selectId)}" class="media-picker-select" ${readOnlyAttr}>${mediaSelectOptions(selectedId)}</select>
            <div class="media-picker-actions">
              <span class="media-picker-meta" data-picker-meta="${esc(selectId)}">${esc(current.width || 0)}x${esc(current.height || 0)} px, ${esc(sizeKb)}</span>
              <button type="button" class="btn btn-accent btn-sm quick-upload-trigger" data-target-select="${esc(selectId)}" data-default-alt="${esc(defaultAlt)}" data-default-crop="${esc(cropDefault)}" ${readOnlyAttr}>+ Unggah Foto Baru</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindMediaPickers(container) {
    container.querySelectorAll('.media-picker-select').forEach((sel) => {
      sel.addEventListener('change', () => {
        const m = findMediaItem(sel.value);
        const img = container.querySelector(`[data-picker-img="${CSS.escape(sel.id)}"]`);
        const meta = container.querySelector(`[data-picker-meta="${CSS.escape(sel.id)}"]`);
        if (img) {
          img.src = m.url;
          img.alt = m.alt;
        }
        if (meta) {
          const sizeKb = m.sizeBytes ? `${Math.max(1, Math.round(m.sizeBytes / 1024))} KB` : 'Aset bawaan';
          meta.textContent = `${m.width || 0}x${m.height || 0} px, ${sizeKb}`;
        }
      });
    });

    container.querySelectorAll('.quick-upload-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        openQuickUploadDialog(
          btn.getAttribute('data-target-select'),
          btn.getAttribute('data-default-alt') || '',
          btn.getAttribute('data-default-crop') || 'free'
        );
      });
    });
  }

  const quickDlg = document.getElementById('quick-upload-dialog');
  const quickForm = document.getElementById('quick-upload-form');
  const quickFile = document.getElementById('quick-media-file');
  const quickDrop = document.getElementById('quick-upload-dropzone');
  const quickPreviewWrap = document.getElementById('quick-upload-preview');
  const quickPreviewImg = document.getElementById('quick-upload-preview-img');
  const quickFileName = document.getElementById('quick-upload-file-name');
  const quickFileInfo = document.getElementById('quick-upload-file-info');
  const quickCrop = document.getElementById('quick-media-crop');
  const quickAlt = document.getElementById('quick-media-alt');
  const quickError = document.getElementById('quick-upload-error');

  function closeQuickUploadDialog() {
    if (!quickDlg) return;
    if (typeof quickDlg.close === 'function') quickDlg.close();
    else quickDlg.removeAttribute('open');
  }

  function openQuickUploadDialog(targetSelectId, defaultAlt, defaultCrop) {
    if (!quickDlg) return;
    state.quickUploadTargetSelectId = targetSelectId;
    if (quickForm) quickForm.reset();
    if (quickPreviewWrap) quickPreviewWrap.hidden = true;
    if (quickError) {
      quickError.hidden = true;
      quickError.textContent = '';
    }
    if (quickAlt) quickAlt.value = defaultAlt || '';
    if (quickCrop) {
      quickCrop.value = defaultCrop || 'free';
      if (typeof quickCrop._syncCustomSelect === 'function') quickCrop._syncCustomSelect();
    }
    if (typeof quickDlg.showModal === 'function') quickDlg.showModal();
    else quickDlg.setAttribute('open', 'true');
  }

  const quickCloseBtn = document.getElementById('quick-upload-close');
  const quickCancelBtn = document.getElementById('quick-upload-cancel');
  if (quickCloseBtn) quickCloseBtn.addEventListener('click', closeQuickUploadDialog);
  if (quickCancelBtn) quickCancelBtn.addEventListener('click', closeQuickUploadDialog);

  bindDropzone(quickDrop, quickFile, (file) => {
    showFilePreview(file, quickPreviewWrap, quickPreviewImg, quickFileName, quickFileInfo, quickAlt);
  });

  if (quickForm) {
    quickForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (quickError) quickError.hidden = true;
      const file = quickFile?.files?.[0];
      const alt = quickAlt?.value.trim() || '';
      if (!file) {
        if (quickError) {
          quickError.textContent = 'Pilih file gambar dari perangkat Anda terlebih dahulu.';
          quickError.hidden = false;
        }
        return;
      }
      if (!alt) {
        if (quickError) {
          quickError.textContent = 'Keterangan gambar wajib diisi sebelum mengunggah.';
          quickError.hidden = false;
        }
        return;
      }

      const submitBtn = document.getElementById('quick-upload-submit');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const processed = await processImageFile(file, quickCrop?.value || 'free');
        const res = await api('/api/admin/media', {
          method: 'POST',
          body: JSON.stringify({
            filename: file.name.replace(/\.[^.]+$/, '') + (processed.mimeType === 'image/webp' ? '.webp' : '.svg'),
            alt,
            ...processed
          })
        });
        const uploaded = res.media;
        if (!state.adminData.media) state.adminData.media = [];
        state.adminData.media.push(uploaded);

        // Refresh all media dropdowns on the current form or open dialog in-place so unsaved text edits stay intact
        document.querySelectorAll('.media-picker-select').forEach((sel) => {
          const prevVal = sel.id === state.quickUploadTargetSelectId ? uploaded.id : sel.value;
          sel.innerHTML = mediaSelectOptions(prevVal);
          sel.value = prevVal;
          if (typeof sel._syncCustomSelect === 'function') sel._syncCustomSelect();
          if (typeof sel._syncMediaCombobox === 'function') sel._syncMediaCombobox();
          if (sel.id === state.quickUploadTargetSelectId) {
            sel.dispatchEvent(new Event('change'));
          }
        });

        closeQuickUploadDialog();
        if (state.activeModule === 'assets') {
          renderActiveModule();
          showFeedback('Foto baru berhasil diunggah ke pustaka aset.', 'success');
        } else {
          showFeedback('Foto baru berhasil diunggah dan dipilih. Klik tombol Simpan Draf di bagian bawah untuk menyimpan perubahan.', 'success');
        }
      } catch (err) {
        if (quickError) {
          quickError.textContent = err.message;
          quickError.hidden = false;
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  function renderActiveModule() {
    if (!state.adminData) return;
    const draft = state.adminData.draftContent;
    const readOnlyAttr = canEditDraft() ? '' : 'disabled';

    switch (state.activeModule) {
      case 'analytics':
        renderAnalyticsModule();
        break;
      case 'feedbacks':
        renderFeedbacksModule(readOnlyAttr);
        break;
      case 'identity':
        renderIdentityModule(draft, readOnlyAttr);
        break;
      case 'hero-tax':
        renderHeroTaxModule(draft, readOnlyAttr);
        break;
      case 'services':
        renderServicesModule(draft, readOnlyAttr);
        break;
      case 'hours':
        renderHoursModule(draft, readOnlyAttr);
        break;
      case 'samsat-keliling':
        renderSamsatKelilingModule(draft, readOnlyAttr);
        break;
      case 'locations':
        renderLocationsModule(draft, readOnlyAttr);
        break;
      case 'profile':
        renderProfileModule(draft, readOnlyAttr);
        break;
      case 'contacts':
        renderContactsModule(draft, readOnlyAttr);
        break;
      case 'announcements':
        renderAnnouncementsModule(draft, readOnlyAttr);
        break;
      case 'extras':
        renderExtrasModule(draft, readOnlyAttr);
        break;
      case 'assets':
        renderAssetsModule(readOnlyAttr);
        break;
      default:
        state.activeModule = 'analytics';
        renderAnalyticsModule();
        break;
    }

    enhanceAdminControls(moduleContent);
  }

  // Module A14 & G1-G13: Analytics Dashboard
  async function renderAnalyticsModule() {
    const f = state.analyticsFilters;
    moduleContent.innerHTML = `
      <div class="module-header">
        <h1>Analitik Kunjungan SAPA NAMBASO</h1>
        <div class="form-actions no-print" style="margin-top:0">
          <a id="csv-export-link" href="/api/admin/analytics/export.csv?range=${encodeURIComponent(f.range)}&device=${encodeURIComponent(f.device)}&source=${encodeURIComponent(f.source)}&region=${encodeURIComponent(f.region)}" class="btn btn-secondary">Unduh CSV</a>
          <button type="button" id="print-pdf-btn" class="btn btn-primary">Cetak Laporan PDF</button>
        </div>
      </div>

      <form id="analytics-filter-form" class="analytics-filters">
        <div class="field-group" style="margin-bottom:0">
          <label for="an-range">Rentang Waktu</label>
          <select id="an-range" name="range">
            <option value="today" ${f.range === 'today' ? 'selected' : ''}>Hari Ini</option>
            <option value="7d" ${f.range === '7d' ? 'selected' : ''}>7 Hari Terakhir</option>
            <option value="30d" ${f.range === '30d' ? 'selected' : ''}>30 Hari Terakhir</option>
            <option value="12m" ${f.range === '12m' ? 'selected' : ''}>12 Bulan Terakhir</option>
            <option value="custom" ${f.range === 'custom' ? 'selected' : ''}>Rentang Bebas</option>
          </select>
        </div>
        <div class="field-group" style="margin-bottom:0">
          <label for="an-granularity">Periode Tren</label>
          <select id="an-granularity" name="granularity">
            <option value="daily" ${f.granularity === 'daily' ? 'selected' : ''}>Harian</option>
            <option value="weekly" ${f.granularity === 'weekly' ? 'selected' : ''}>Mingguan</option>
            <option value="monthly" ${f.granularity === 'monthly' ? 'selected' : ''}>Bulanan</option>
          </select>
        </div>
        <div class="field-group" style="margin-bottom:0">
          <label for="an-device">Perangkat</label>
          <select id="an-device" name="device">
            <option value="all" ${f.device === 'all' ? 'selected' : ''}>Semua Perangkat</option>
            <option value="Ponsel" ${f.device === 'Ponsel' ? 'selected' : ''}>Ponsel</option>
            <option value="Tablet" ${f.device === 'Tablet' ? 'selected' : ''}>Tablet</option>
            <option value="Komputer" ${f.device === 'Komputer' ? 'selected' : ''}>Komputer</option>
          </select>
        </div>
        <div class="field-group" style="margin-bottom:0">
          <label for="an-source">Sumber Trafik</label>
          <select id="an-source" name="source">
            <option value="all" ${f.source === 'all' ? 'selected' : ''}>Semua Sumber</option>
            <option value="Langsung" ${f.source === 'Langsung' ? 'selected' : ''}>Langsung</option>
            <option value="Mesin Pencari" ${f.source === 'Mesin Pencari' ? 'selected' : ''}>Mesin Pencari</option>
            <option value="Media Sosial" ${f.source === 'Media Sosial' ? 'selected' : ''}>Media Sosial</option>
            <option value="Tautan Situs Lain" ${f.source === 'Tautan Situs Lain' ? 'selected' : ''}>Tautan Situs Lain</option>
          </select>
        </div>
        <div class="field-group" style="margin-bottom:0">
          <label for="an-region">Wilayah</label>
          <select id="an-region" name="region">
            <option value="all" ${f.region === 'all' ? 'selected' : ''}>Semua Wilayah</option>
            <option value="Kota Palu" ${f.region === 'Kota Palu' ? 'selected' : ''}>Kota Palu</option>
            <option value="Kab. Sigi" ${f.region === 'Kab. Sigi' ? 'selected' : ''}>Kab. Sigi</option>
            <option value="Kab. Donggala" ${f.region === 'Kab. Donggala' ? 'selected' : ''}>Kab. Donggala</option>
            <option value="Kab. Parigi Moutong" ${f.region === 'Kab. Parigi Moutong' ? 'selected' : ''}>Kab. Parigi Moutong</option>
            <option value="Lainnya" ${f.region === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
          </select>
        </div>
        <div id="custom-dates-wrap" style="display:${f.range === 'custom' ? 'contents' : 'none'}">
          <div class="field-group" style="margin-bottom:0">
            <label for="an-start">Dari Tanggal</label>
            <input type="date" id="an-start" value="${esc(f.startDate)}">
          </div>
          <div class="field-group" style="margin-bottom:0">
            <label for="an-end">Sampai Tanggal</label>
            <input type="date" id="an-end" value="${esc(f.endDate)}">
          </div>
        </div>
      </form>

      <div id="analytics-body">
        <div class="state-box"><p>Memuat data analitik kunjungan...</p></div>
      </div>
    `;

    document.getElementById('print-pdf-btn').addEventListener('click', () => window.print());

    const rangeEl = document.getElementById('an-range');
    const customWrap = document.getElementById('custom-dates-wrap');
    const reload = async () => {
      state.analyticsFilters = {
        range: rangeEl.value,
        granularity: document.getElementById('an-granularity').value,
        device: document.getElementById('an-device').value,
        source: document.getElementById('an-source').value,
        region: document.getElementById('an-region').value,
        startDate: document.getElementById('an-start').value,
        endDate: document.getElementById('an-end').value
      };
      customWrap.style.display = rangeEl.value === 'custom' ? 'contents' : 'none';
      const qs = new URLSearchParams(state.analyticsFilters).toString();
      document.getElementById('csv-export-link').href = `/api/admin/analytics/export.csv?${qs}`;
      await fetchAndPaintAnalytics(qs);
    };

    ['an-range', 'an-granularity', 'an-device', 'an-source', 'an-region', 'an-start', 'an-end'].forEach((id) => {
      document.getElementById(id).addEventListener('change', reload);
    });

    await fetchAndPaintAnalytics(new URLSearchParams(state.analyticsFilters).toString());
  }

  let activeEcharts = [];
  let activeChartObservers = [];

  function clearActiveEcharts() {
    activeChartObservers.forEach((obs) => {
      try { obs.disconnect(); } catch { }
    });
    activeChartObservers = [];
    activeEcharts.forEach((ch) => {
      try { ch.dispose(); } catch { }
    });
    activeEcharts = [];
  }

  function observeAndInitChart(targetEl, initFn) {
    if (!targetEl) return;
    if (typeof IntersectionObserver === 'undefined' || targetEl.classList.contains('is-revealed')) {
      targetEl.classList.add('is-revealed');
      initFn();
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          targetEl.classList.add('is-revealed');
          initFn();
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    observer.observe(targetEl);
    activeChartObservers.push(observer);
  }

  function renderSlidingNumber(rawVal, suffix = '') {
    const str = String(rawVal ?? 0);
    let digitIdx = 0;
    const chars = str.split('').map((ch) => {
      if (/\d/.test(ch)) {
        const d = parseInt(ch, 10);
        const idx = digitIdx++;
        return `
          <span class="aui-sliding-digit" aria-hidden="true">
            <span class="aui-sliding-reel" style="--digit-index:${idx};--target-digit:${d};">
              <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
            </span>
          </span>
        `;
      }
      return `<span class="aui-sliding-symbol" aria-hidden="true">${esc(ch)}</span>`;
    }).join('');

    const suffixHtml = suffix ? `<span class="aui-sliding-symbol" aria-hidden="true">${esc(suffix)}</span>` : '';
    return `<span class="aui-sliding-number-wrapper" aria-label="${esc(str + suffix)}"><span class="aui-sliding-number-track">${chars}${suffixHtml}</span></span>`;
  }

  window.addEventListener('resize', () => {
    activeEcharts.forEach((ch) => {
      try { ch.resize(); } catch { }
    });
  });

  function getEchartsThemeConfig() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      isDark,
      textColor: isDark ? '#F8FAFC' : '#0F172A',
      secondaryText: isDark ? '#94A3B8' : '#475569',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(186, 230, 253, 0.6)',
      splitLineColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(224, 242, 254, 0.7)',
      primaryColor: isDark ? '#38BDF8' : '#0284C7',
      primaryDark: isDark ? '#0284C7' : '#075985',
      accentColor: '#38BDF8',
      previousColor: isDark ? '#64748B' : '#94A3B8',
      palette: ['#0284C7', '#38BDF8', '#0EA5E9', '#075985', '#60A5FA', '#818CF8', '#34D399', '#F59E0B']
    };
  }

  function initAnalyticsEcharts(data) {
    if (typeof echarts === 'undefined' || !data) return;
    clearActiveEcharts();
    const tc = getEchartsThemeConfig();

    const commonTooltip = {
      backgroundColor: tc.isDark ? '#1E293B' : '#FFFFFF',
      borderColor: tc.borderColor,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: tc.textColor, fontSize: 12 },
      extraCssText: 'box-shadow: 0 8px 24px rgba(0,0,0,0.15); border-radius: 8px;'
    };

    function setupHBar(domId, items, labelFormatter, barColor) {
      const el = document.getElementById(domId);
      if (!el) return;
      const card = el.closest('.chart-card') || el;
      if (!items || !items.length) {
        el.innerHTML = '<p class="meta-text" style="padding:1rem">Belum ada peristiwa tercatat pada filter ini.</p>';
        card.classList.add('is-revealed');
        return;
      }
      observeAndInitChart(card, () => {
        const chart = echarts.init(el, null, { renderer: 'canvas' });
        activeEcharts.push(chart);
        const rows = [...items].slice(0, 10).reverse();
        chart.setOption({
          tooltip: {
            ...commonTooltip,
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: labelFormatter || ((params) => {
              const p = params[0];
              return `${p.name}: <strong>${p.value}</strong>`;
            })
          },
          grid: { left: '3%', right: '8%', bottom: '3%', top: 12, containLabel: true },
          xAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: tc.splitLineColor } },
            axisLabel: { color: tc.secondaryText }
          },
          yAxis: {
            type: 'category',
            data: rows.map((r) => r.label),
            axisLine: { lineStyle: { color: tc.secondaryText } },
            axisLabel: { color: tc.secondaryText, fontSize: 11, width: 130, overflow: 'truncate' }
          },
          series: [{
            type: 'bar',
            data: rows.map((r) => r.count),
            itemStyle: {
              borderRadius: [0, 6, 6, 0],
              color: barColor || new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: tc.primaryDark },
                { offset: 1, color: tc.primaryColor }
              ])
            },
            label: {
              show: true,
              position: 'right',
              color: tc.secondaryText,
              fontSize: 11
            }
          }]
        });
      });
    }

    // G1: Tren Kunjungan Situs
    const g1El = document.getElementById('chart-g1');
    if (g1El && data.g1Series && data.g1Series.length) {
      observeAndInitChart(g1El.closest('.chart-card') || g1El, () => {
        const chart = echarts.init(g1El, null, { renderer: 'canvas' });
        activeEcharts.push(chart);
        chart.setOption({
          tooltip: {
            ...commonTooltip,
            trigger: 'axis'
          },
          legend: {
            data: ['Periode Berjalan', 'Periode Sebelumnya'],
            textStyle: { color: tc.secondaryText },
            top: 0
          },
          grid: { left: '3%', right: '4%', bottom: '3%', top: 38, containLabel: true },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.g1Series.map((s) => s.label),
            axisLine: { lineStyle: { color: tc.secondaryText } },
            axisLabel: { color: tc.secondaryText, fontSize: 11 }
          },
          yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: tc.splitLineColor } },
            axisLabel: { color: tc.secondaryText }
          },
          series: [
            {
              name: 'Periode Berjalan',
              type: 'line',
              smooth: true,
              showSymbol: false,
              data: data.g1Series.map((s) => s.current),
              itemStyle: { color: tc.primaryColor },
              lineStyle: { width: 3, color: tc.primaryColor },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: tc.isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.35)' },
                  { offset: 1, color: 'rgba(56, 189, 248, 0.02)' }
                ])
              }
            },
            {
              name: 'Periode Sebelumnya',
              type: 'line',
              smooth: true,
              showSymbol: false,
              data: data.g1Series.map((s) => s.previous),
              lineStyle: { width: 2, type: 'dashed', color: tc.previousColor },
              itemStyle: { color: tc.previousColor }
            }
          ]
        });
      });
    }

    // G2: Pengunjung Baru vs Pengunjung Kembali
    const g2El = document.getElementById('chart-g2');
    if (g2El && data.g2NewVsReturning && data.g2NewVsReturning.length) {
      observeAndInitChart(g2El.closest('.chart-card') || g2El, () => {
        const chart = echarts.init(g2El, null, { renderer: 'canvas' });
        activeEcharts.push(chart);
        chart.setOption({
          tooltip: {
            ...commonTooltip,
            trigger: 'item',
            formatter: '{b}: <strong>{c}</strong> ({d}%)'
          },
          legend: {
            bottom: 0,
            textStyle: { color: tc.secondaryText }
          },
          series: [
            {
              name: 'Pengunjung',
              type: 'pie',
              radius: ['45%', '72%'],
              center: ['50%', '45%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 8,
                borderColor: tc.isDark ? '#111E36' : '#FFFFFF',
                borderWidth: 2
              },
              label: { show: false },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: tc.textColor
                }
              },
              data: data.g2NewVsReturning.map((r, i) => ({
                name: r.label,
                value: r.count,
                itemStyle: { color: i === 0 ? tc.primaryColor : tc.primaryDark }
              }))
            }
          ]
        });
      });
    }

    // G3: Waktu Akses Tertinggi Heatmap
    const g3El = document.getElementById('chart-g3');
    if (g3El && data.g3Heatmap && data.g3Heatmap.length) {
      observeAndInitChart(g3El.closest('.chart-card') || g3El, () => {
        const chart = echarts.init(g3El, null, { renderer: 'canvas' });
        activeEcharts.push(chart);
        const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
        const days = data.g3Heatmap.map((d) => d.day);
        const points = [];
        let maxVal = 1;
        data.g3Heatmap.forEach((d, yIdx) => {
          d.buckets.forEach((b, xIdx) => {
            if (b.count > maxVal) maxVal = b.count;
            points.push([xIdx, yIdx, b.count]);
          });
        });
        chart.setOption({
          tooltip: {
            ...commonTooltip,
            position: 'top',
            formatter: (p) => `${days[p.value[1]]} jam ${hours[p.value[0]]} WITA: <strong>${p.value[2]} kunjungan</strong>`
          },
          grid: { top: 15, bottom: 65, left: '6%', right: '4%' },
          xAxis: {
            type: 'category',
            data: hours,
            splitArea: { show: true },
            axisLabel: { color: tc.secondaryText, fontSize: 11 },
            axisLine: { lineStyle: { color: tc.secondaryText } }
          },
          yAxis: {
            type: 'category',
            data: days,
            splitArea: { show: true },
            axisLabel: { color: tc.secondaryText, fontWeight: 700 },
            axisLine: { lineStyle: { color: tc.secondaryText } }
          },
          visualMap: {
            min: 0,
            max: maxVal,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: 8,
            inRange: {
              color: tc.isDark ? ['#111E36', '#0284C7', '#38BDF8', '#BAE6FD'] : ['#F0F9FF', '#BAE6FD', '#38BDF8', '#0284C7']
            },
            textStyle: { color: tc.secondaryText }
          },
          series: [{
            name: 'Waktu Akses',
            type: 'heatmap',
            data: points,
            label: {
              show: true,
              color: tc.isDark ? '#F8FAFC' : '#0F172A',
              fontSize: 10
            },
            itemStyle: {
              borderRadius: 4,
              borderColor: tc.isDark ? '#091122' : '#FFFFFF',
              borderWidth: 2
            }
          }]
        });
      });
    }

    // G4: Sumber Kedatangan
    const g4El = document.getElementById('chart-g4');
    if (g4El && data.g4Sources && data.g4Sources.length) {
      observeAndInitChart(g4El.closest('.chart-card') || g4El, () => {
        const chart = echarts.init(g4El, null, { renderer: 'canvas' });
        activeEcharts.push(chart);
        chart.setOption({
          tooltip: {
            ...commonTooltip,
            trigger: 'item',
            formatter: '{b}: <strong>{c}</strong> ({d}%)'
          },
          legend: { bottom: 0, textStyle: { color: tc.secondaryText } },
          series: [{
            name: 'Sumber',
            type: 'pie',
            radius: ['42%', '70%'],
            center: ['50%', '45%'],
            itemStyle: { borderRadius: 6, borderColor: tc.isDark ? '#111E36' : '#FFFFFF', borderWidth: 2 },
            data: data.g4Sources.map((s, idx) => ({
              name: s.label,
              value: s.count,
              itemStyle: { color: tc.palette[idx % tc.palette.length] }
            }))
          }]
        });
      });
    }

    // G5 Devices
    const g5dEl = document.getElementById('chart-g5-device');
    if (g5dEl && data.g5Devices && data.g5Devices.length) {
      observeAndInitChart(g5dEl.closest('.chart-card') || g5dEl, () => {
        const chart = echarts.init(g5dEl, null, { renderer: 'canvas' });
        activeEcharts.push(chart);
        chart.setOption({
          tooltip: { ...commonTooltip, trigger: 'item', formatter: '{b}: <strong>{c}</strong> ({d}%)' },
          legend: { bottom: 0, textStyle: { color: tc.secondaryText } },
          series: [{
            type: 'pie',
            radius: ['42%', '70%'],
            center: ['50%', '42%'],
            itemStyle: { borderRadius: 6, borderColor: tc.isDark ? '#111E36' : '#FFFFFF', borderWidth: 2 },
            data: data.g5Devices.map((d, i) => ({
              name: d.label,
              value: d.count,
              itemStyle: { color: tc.palette[i % tc.palette.length] }
            }))
          }]
        });
      });
    }

    // G5 OS and Browser
    setupHBar('chart-g5-os', data.g5OsBrowser);

    // G6: Sebaran Wilayah
    setupHBar('chart-g6', data.g6Regions);

    // G7: Bagian Halaman Paling Sering Dilihat
    setupHBar('chart-g7', data.g7Sections, (params) => {
      const p = params[0];
      const row = (data.g7Sections || []).find((x) => x.label === p.name);
      return `${p.name}: <strong>${p.value} tayangan</strong>${row && row.extra ? `<br>${row.extra}` : ''}`;
    });

    // G8: Layanan Paling Banyak Dibuka
    const g8El = document.getElementById('chart-g8');
    if (g8El && data.g8Services && data.g8Services.length) {
      observeAndInitChart(g8El.closest('.chart-card') || g8El, () => {
        const chart = echarts.init(g8El, null, { renderer: 'canvas' });
        activeEcharts.push(chart);
        const rows = data.g8Services.slice(0, 6);
        chart.setOption({
          tooltip: { ...commonTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '3%', right: '4%', bottom: '15%', top: 30, containLabel: true },
          xAxis: {
            type: 'category',
            data: rows.map((r) => r.label),
            axisLine: { lineStyle: { color: tc.secondaryText } },
            axisLabel: { color: tc.secondaryText, fontSize: 11, interval: 0, rotate: 20 }
          },
          yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: tc.splitLineColor } },
            axisLabel: { color: tc.secondaryText }
          },
          series: [{
            type: 'bar',
            data: rows.map((r) => r.count),
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: tc.accentColor },
                { offset: 1, color: tc.primaryColor }
              ])
            },
            label: { show: true, position: 'top', color: tc.secondaryText, fontSize: 11 }
          }]
        });
      });
    }

    // G9: Tindakan Utama
    setupHBar('chart-g9', data.g9Actions);

    // G10: Lokasi Kantor
    setupHBar('chart-g10', data.g10Locations);

    // G11: Alur Tindakan (Funnel)
    const g11El = document.getElementById('chart-g11');
    if (g11El && data.g11Funnel && data.g11Funnel.length) {
      observeAndInitChart(g11El.closest('.chart-card') || g11El, () => {
        const chart = echarts.init(g11El, null, { renderer: 'canvas' });
        activeEcharts.push(chart);
        chart.setOption({
          tooltip: {
            ...commonTooltip,
            trigger: 'item',
            formatter: '{b}: <strong>{c} sesi</strong>'
          },
          series: [{
            name: 'Alur Tindakan',
            type: 'funnel',
            left: '10%',
            width: '80%',
            top: 20,
            bottom: 20,
            minSize: '15%',
            maxSize: '100%',
            sort: 'descending',
            gap: 6,
            label: {
              show: true,
              position: 'inside',
              formatter: '{b}\n{c} sesi',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 12
            },
            itemStyle: {
              borderColor: tc.isDark ? '#111E36' : '#FFFFFF',
              borderWidth: 2
            },
            data: data.g11Funnel.map((f, i) => ({
              name: f.label,
              value: f.count,
              itemStyle: { color: tc.palette[i % tc.palette.length] }
            }))
          }]
        });
      });
    }

    // G12: Kata Kunci Pencarian
    setupHBar('chart-g12', data.g12SearchTerms);

    // G13: Kecepatan Muat dan Kesehatan Situs
    const g13El = document.getElementById('chart-g13');
    if (g13El && data.g13PerfSeries && data.g13PerfSeries.length) {
      observeAndInitChart(g13El.closest('.chart-card') || g13El, () => {
        const chart = echarts.init(g13El, null, { renderer: 'canvas' });
        activeEcharts.push(chart);
        chart.setOption({
          tooltip: {
            ...commonTooltip,
            trigger: 'axis'
          },
          legend: {
            data: ['Waktu Muat (ms)', 'Galat'],
            textStyle: { color: tc.secondaryText },
            top: 0
          },
          grid: { left: '3%', right: '4%', bottom: '3%', top: 38, containLabel: true },
          xAxis: {
            type: 'category',
            data: data.g13PerfSeries.map((s) => s.label),
            axisLine: { lineStyle: { color: tc.secondaryText } },
            axisLabel: { color: tc.secondaryText, fontSize: 11 }
          },
          yAxis: [
            {
              type: 'value',
              name: 'ms',
              splitLine: { lineStyle: { color: tc.splitLineColor } },
              axisLabel: { color: tc.secondaryText }
            },
            {
              type: 'value',
              name: 'galat',
              minInterval: 1,
              splitLine: { show: false },
              axisLabel: { color: '#EF4444' }
            }
          ],
          series: [
            {
              name: 'Waktu Muat (ms)',
              type: 'line',
              smooth: true,
              showSymbol: false,
              data: data.g13PerfSeries.map((s) => s.avgLoadMs),
              itemStyle: { color: tc.primaryColor },
              lineStyle: { width: 3, color: tc.primaryColor },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: tc.isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.25)' },
                  { offset: 1, color: 'rgba(56, 189, 248, 0.01)' }
                ])
              }
            },
            {
              name: 'Galat',
              type: 'bar',
              yAxisIndex: 1,
              data: data.g13PerfSeries.map((s) => s.errors),
              itemStyle: { color: '#EF4444', borderRadius: [4, 4, 0, 0] }
            }
          ]
        });
      });
    }

    // Reveal any chart card that may not have had a chart initialization
    document.querySelectorAll('.chart-card').forEach((card) => {
      if (!card.classList.contains('is-revealed')) {
        observeAndInitChart(card, () => { });
      }
    });
  }

  function renderBars(rows, accentFirst = false) {
    if (!rows || rows.length === 0) {
      return '<p class="meta-text">Belum ada peristiwa tercatat pada filter ini.</p>';
    }
    const max = Math.max(1, ...rows.map((r) => r.count));
    return rows.map((r, idx) => {
      const pct = Math.round((r.count / max) * 100);
      return `
        <div class="bar-row">
          <span>${esc(r.label)}</span>
          <div class="bar-track" aria-hidden="true">
            <div class="bar-fill ${accentFirst && idx === 0 ? 'bar-fill-accent' : ''}" style="width:${pct}%"></div>
          </div>
          <strong class="num-tabular">${esc(r.count)}${r.extra ? ` (${esc(r.extra)})` : ''}</strong>
        </div>
      `;
    }).join('');
  }

  function renderLineSvg(points, valueKey = 'current', compareKey = 'previous') {
    if (!points || points.length === 0) {
      return '<p class="meta-text">Belum ada deret waktu kunjungan pada rentang ini.</p>';
    }
    const width = 520;
    const height = 160;
    const pad = 20;
    const maxVal = Math.max(1, ...points.flatMap((p) => [p[valueKey] || 0, p[compareKey] || 0]));
    const stepX = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;

    const toPath = (key) => points.map((p, i) => {
      const x = pad + i * stepX;
      const y = height - pad - ((p[key] || 0) / maxVal) * (height - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="160" role="img" aria-label="Grafik garis perbandingan periode saat ini dan periode sebelumnya">
        <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#64748B" stroke-width="1"/>
        <path d="${toPath(compareKey)}" fill="none" stroke="#64748B" stroke-width="2" stroke-dasharray="4 3"/>
        <path d="${toPath(valueKey)}" fill="none" stroke="#0284C7" stroke-width="2.5"/>
      </svg>
      <p class="meta-text">Garis solid: periode berjalan (${points.map((p) => `${esc(p.label)}: ${p[valueKey]}`).slice(-4).join(', ')}). Garis putus: periode lalu.</p>
    `;
  }

  async function fetchAndPaintAnalytics(qs) {
    const bodyEl = document.getElementById('analytics-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = '<div class="state-box"><p>Memuat metrik kunjungan nyata...</p></div>';
    try {
      const data = await api(`/api/admin/analytics?${qs}`);
      state.analyticsData = data;
      const s = data.summary;

      if (s.totalVisits === 0 && s.pageviews === 0) {
        bodyEl.innerHTML = `
          <div class="state-box">
            <h2>Belum ada rekaman kunjungan pada rentang ini</h2>
            <p>Laporan analitik akan terisi otomatis dari kunjungan nyata warga ke situs publik tanpa cookie pelacak dan tanpa menyimpan IP utuh.</p>
            <a href="/" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Buka Situs Publik untuk Pengujian</a>
          </div>
        `;
        return;
      }

      const heatRows = (data.g3Heatmap || []).map((dayRow) => {
        const maxCell = Math.max(1, ...data.g3Heatmap.flatMap((r) => r.buckets.map((b) => b.count)));
        const cells = dayRow.buckets.map((b) => {
          const alpha = b.count === 0 ? 0.05 : 0.2 + (b.count / maxCell) * 0.75;
          return `<div class="heat-cell num-tabular" title="${esc(dayRow.day)} ${esc(b.label)}: ${b.count}" style="background:rgba(29,78,216,${alpha.toFixed(2)});color:${alpha > 0.5 ? '#FFF' : 'inherit'}">${b.count}</div>`;
        }).join('');
        return `<div><strong>${esc(dayRow.day)}</strong></div>${cells}`;
      }).join('');

      bodyEl.innerHTML = `
        <div class="summary-strip">
          <div class="summary-tile">
            <span class="summary-label">Pengunjung Unik</span>
            <strong class="summary-value num-tabular">${renderSlidingNumber(s.uniqueVisitors)}</strong>
            <span class="summary-delta">${esc(s.deltas.uniqueVisitors)}</span>
          </div>
          <div class="summary-tile">
            <span class="summary-label">Total Kunjungan</span>
            <strong class="summary-value num-tabular">${renderSlidingNumber(s.totalVisits)}</strong>
            <span class="summary-delta">${esc(s.deltas.totalVisits)}</span>
          </div>
          <div class="summary-tile">
            <span class="summary-label">Tampilan Halaman</span>
            <strong class="summary-value num-tabular">${renderSlidingNumber(s.pageviews)}</strong>
            <span class="summary-delta">${esc(s.deltas.pageviews)}</span>
          </div>
          <div class="summary-tile">
            <span class="summary-label">Rata-rata Durasi</span>
            <strong class="summary-value num-tabular">${renderSlidingNumber(s.avgDurationSec, ' dtk')}</strong>
            <span class="summary-delta">${esc(s.deltas.avgDurationSec)}</span>
          </div>
          <div class="summary-tile">
            <span class="summary-label">Pengunjung Berinteraksi</span>
            <strong class="summary-value num-tabular">${renderSlidingNumber(s.engagedRatePct, '%')}</strong>
            <span class="summary-delta">${esc(s.deltas.engagedRatePct)}</span>
          </div>
          <div class="summary-tile">
            <span class="summary-label">Pengunjung Aktif (5 mnt)</span>
            <strong class="summary-value num-tabular">${renderSlidingNumber(s.activeNow)}</strong>
            <span class="summary-delta">Terhitung langsung tanpa cookie</span>
          </div>
        </div>

        <div class="charts-grid">
          <article class="chart-card">
            <h2>Tren Kunjungan Situs</h2>
            <p class="chart-subtitle">Perbandingan kunjungan periode saat ini terhadap periode sebelumnya.</p>
            <div id="chart-g1" class="echarts-box"></div>
          </article>

          <article class="chart-card">
            <h2>Pengunjung Baru dan Pengunjung Kembali</h2>
            <p class="chart-subtitle">Perbandingan warga yang baru pertama kali berkunjung dan yang kembali.</p>
            <div id="chart-g2" class="echarts-box"></div>
          </article>

          <article class="chart-card" style="grid-column:1 / -1">
            <h2>Waktu Akses Tertinggi (Hari x Jam WITA)</h2>
            <p class="chart-subtitle">Pengelompokan 2 jam dalam Waktu Indonesia Tengah (00 sampai 22 WITA).</p>
            <div id="chart-g3" class="echarts-box-wide"></div>
          </article>

          <article class="chart-card">
            <h2>Sumber Kedatangan Pengunjung</h2>
            <p class="chart-subtitle">Dari mana warga menemukan dan mengakses situs publik.</p>
            <div id="chart-g4" class="echarts-box"></div>
          </article>

          <article class="chart-card">
            <h2>Perangkat, Sistem Operasi, dan Peramban</h2>
            <p class="chart-subtitle">Proporsi akses melalui ponsel, tablet, atau komputer.</p>
            <div id="chart-g5-device" class="echarts-box" style="height:230px;min-height:230px"></div>
            <h3 style="margin-top:1rem;margin-bottom:0.25rem;font-size:0.95rem;color:var(--brand-primary)">Sistem Operasi dan Peramban</h3>
            <div id="chart-g5-os" class="echarts-box" style="height:210px;min-height:210px"></div>
          </article>

          <article class="chart-card">
            <h2>Sebaran Wilayah Pengunjung</h2>
            <p class="chart-subtitle">Wilayah kota dan kabupaten di Sulawesi Tengah.</p>
            <div id="chart-g6" class="echarts-box"></div>
          </article>

          <article class="chart-card">
            <h2>Bagian Halaman Paling Sering Dilihat</h2>
            <p class="chart-subtitle">Informasi utama yang paling banyak dibaca beserta kedalaman gulir.</p>
            <div id="chart-g7" class="echarts-box"></div>
          </article>

          <article class="chart-card">
            <h2>Layanan yang Paling Banyak Dibuka</h2>
            <p class="chart-subtitle">Frekuensi pembukaan rincian tarif PNBP dan syarat layanan.</p>
            <div id="chart-g8" class="echarts-box"></div>
          </article>

          <article class="chart-card">
            <h2>Tindakan Utama Pengunjung</h2>
            <p class="chart-subtitle">Klik Cek Pajak, petunjuk arah, WhatsApp, telepon, email, dan media sosial.</p>
            <div id="chart-g9" class="echarts-box"></div>
          </article>

          <article class="chart-card">
            <h2>Lokasi Kantor dan Gerai yang Paling Banyak Dituju</h2>
            <p class="chart-subtitle">Klik tombol Petunjuk Arah pada tiap lokasi layanan.</p>
            <div id="chart-g10" class="echarts-box"></div>
          </article>

          <article class="chart-card">
            <h2>Alur Tindakan Pengunjung (Funnel Konversi)</h2>
            <p class="chart-subtitle">Tahapan dari Kunjungan, Lihat Layanan, hingga Klik Cek Pajak.</p>
            <div id="chart-g11" class="echarts-box"></div>
          </article>

          <article class="chart-card">
            <h2>Kata Kunci Pencarian Layanan</h2>
            <p class="chart-subtitle">Topik yang paling sering diketik warga di kolom cari layanan.</p>
            <div id="chart-g12" class="echarts-box"></div>
          </article>

          <article class="chart-card">
            <h2>Kecepatan Muat dan Kesehatan Situs</h2>
            <p class="chart-subtitle">Rata-rata waktu muat (ms) dan catatan galat halaman.</p>
            <div id="chart-g13" class="echarts-box"></div>
          </article>
        </div>
      `;
      initAnalyticsEcharts(data);
    } catch (err) {
      bodyEl.innerHTML = `<div class="state-box alert-error"><p>Gagal memuat analitik: ${esc(err.message)}</p></div>`;
    }
  }

  // Identity & Logos
  function renderIdentityModule(draft, readOnlyAttr) {
    const id = draft.identity;
    moduleContent.innerHTML = `
      <div class="module-header">
        <h1>Identitas Situs dan Logo Instansi</h1>
      </div>
      <form id="identity-form" class="panel-card">
        <div class="grid-2">
          <div class="field-group">
            <label for="id-siteName">Nama Situs</label>
            <input type="text" id="id-siteName" value="${esc(id.siteName)}" ${readOnlyAttr} required>
          </div>
          <div class="field-group">
            <label for="id-siteFullName">Kepanjangan Nama</label>
            <input type="text" id="id-siteFullName" value="${esc(id.siteFullName)}" ${readOnlyAttr} required>
          </div>
        </div>
        <div class="field-group">
          <label for="id-ownerName">Nama Instansi Pemilik</label>
          <input type="text" id="id-ownerName" value="${esc(id.ownerName)}" ${readOnlyAttr} required>
        </div>
        <div class="field-group">
          <label for="id-tagline">Tagline Situs</label>
          <input type="text" id="id-tagline" value="${esc(id.tagline)}" ${readOnlyAttr}>
        </div>
        <div class="grid-2">
          ${renderMediaPickerField({
      selectId: 'id-siteLogo',
      label: 'Logo SAPA NAMBASO',
      selectedId: id.siteLogoId,
      defaultAlt: 'Logo resmi SAPA NAMBASO Samsat Palu',
      readOnlyAttr,
      cropDefault: 'free'
    })}
          ${renderMediaPickerField({
      selectId: 'id-agencyLogo',
      label: 'Logo Instansi (Samsat / Bapenda / Mitra)',
      selectedId: id.agencyLogoId,
      defaultAlt: 'Logo Bapenda Provinsi Sulawesi Tengah / Samsat Palu',
      readOnlyAttr,
      cropDefault: 'free'
    })}
          ${renderMediaPickerField({
      selectId: 'id-sharePreview',
      label: 'Gambar Pratinjau Saat Tautan Dibagikan',
      selectedId: id.sharePreviewImageId,
      defaultAlt: 'Gambar pratinjau SAPA NAMBASO Samsat Palu',
      readOnlyAttr,
      cropDefault: '16:10'
    })}
          <div class="field-group">
            <label for="id-favicon">Alamat Favicon</label>
            <input type="text" id="id-favicon" value="${esc(id.faviconUrl)}" ${readOnlyAttr}>
          </div>
        </div>
        ${renderThemeColorPicker(id.themeColor, id.themeStyle, readOnlyAttr)}
        ${renderSplashSettings(id, readOnlyAttr)}
        <button type="submit" class="btn btn-primary" ${readOnlyAttr}>Simpan Draf Identitas</button>
      </form>
    `;
    bindMediaPickers(moduleContent);
    bindThemeColorPicker(id.themeColor, id.themeStyle, Boolean(readOnlyAttr));
    bindSplashSettings();

    document.getElementById('identity-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawTheme = document.getElementById('id-themeColor').value.trim();
      const normalizedTheme = window.SapaTheme?.normalizeHex(rawTheme) || '#38BDF8';
      const themeStyle = document.getElementById('id-themeStyle')?.value === 'flat' ? 'flat' : 'gradient';
      await saveDraftSection('identity', {
        siteName: document.getElementById('id-siteName').value.trim(),
        siteFullName: document.getElementById('id-siteFullName').value.trim(),
        ownerName: document.getElementById('id-ownerName').value.trim(),
        tagline: document.getElementById('id-tagline').value.trim(),
        siteLogoId: document.getElementById('id-siteLogo').value,
        agencyLogoId: document.getElementById('id-agencyLogo').value,
        sharePreviewImageId: document.getElementById('id-sharePreview').value,
        faviconUrl: document.getElementById('id-favicon').value.trim(),
        themeColor: normalizedTheme,
        themeStyle,
        splashEnabled: Boolean(document.getElementById('id-splashEnabled')?.checked),
        splashShowText: Boolean(document.getElementById('id-splashShowText')?.checked),
        splashImageId: document.getElementById('id-splashImage')?.value || id.siteLogoId,
        splashTitle: document.getElementById('id-splashTitle')?.value.trim() || 'Selamat Datang di SAPA NAMBASO',
        splashSubtitle: document.getElementById('id-splashSubtitle')?.value.trim() || ''
      });
    });
  }

  function renderSplashSettings(id, readOnlyAttr) {
    const splashEnabled = Boolean(id.splashEnabled);
    const splashShowText = id.splashShowText !== false;
    const splashImageId = id.splashImageId || id.siteLogoId || 'media-logo-sapa';
    const splashTitle = id.splashTitle || 'Selamat Datang di SAPA NAMBASO';
    const splashSubtitle = id.splashSubtitle ?? 'UPTB Pendapatan Daerah Wilayah I Palu (Samsat Palu)';

    return `
      <section class="aui-theme-picker-card" aria-label="Pengaturan layar sambutan (Splash Screen)">
        <div class="aui-theme-picker-header">
          <div class="aui-theme-picker-title">
            <h3>Layar Sambutan 3 Detik (Splash Screen)</h3>
            <p>Tampilkan logo atau gambar sambutan dengan animasi fade-in dan fade-out selama 3 detik sebelum halaman publik muncul.</p>
          </div>
          <label class="aui-swatch-pill" style="cursor:pointer">
            <input type="checkbox" id="id-splashEnabled" ${splashEnabled ? 'checked' : ''} ${readOnlyAttr}>
            <span>Aktifkan Layar Sambutan</span>
          </label>
        </div>
        <div id="id-splash-body" ${splashEnabled ? '' : 'hidden'}>
          ${renderMediaPickerField({
      selectId: 'id-splashImage',
      label: 'Logo / Gambar Layar Sambutan',
      selectedId: splashImageId,
      defaultAlt: 'Logo layar sambutan SAPA NAMBASO',
      readOnlyAttr,
      cropDefault: 'free'
    })}
          <div class="field-group" style="margin-top:0.5rem">
            <label class="aui-swatch-pill" style="cursor:pointer">
              <input type="checkbox" id="id-splashShowText" ${splashShowText ? 'checked' : ''} ${readOnlyAttr}>
              <span>Tampilkan Teks Sambutan di Bawah Logo</span>
            </label>
          </div>
          <div id="id-splash-text-fields" class="grid-2" ${splashShowText ? '' : 'hidden'}>
            <div class="field-group" style="margin-bottom:0">
              <label for="id-splashTitle">Judul Sambutan</label>
              <input type="text" id="id-splashTitle" value="${esc(splashTitle)}" placeholder="Selamat Datang di SAPA NAMBASO" ${readOnlyAttr}>
            </div>
            <div class="field-group" style="margin-bottom:0">
              <label for="id-splashSubtitle">Subjudul Sambutan (Opsional)</label>
              <input type="text" id="id-splashSubtitle" value="${esc(splashSubtitle)}" placeholder="UPTB Pendapatan Daerah Wilayah I Palu" ${readOnlyAttr}>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function bindSplashSettings() {
    const enabledCb = document.getElementById('id-splashEnabled');
    const showTextCb = document.getElementById('id-splashShowText');
    const bodyEl = document.getElementById('id-splash-body');
    const textWrapEl = document.getElementById('id-splash-text-fields');
    if (enabledCb && bodyEl) {
      enabledCb.addEventListener('change', () => {
        bodyEl.hidden = !enabledCb.checked;
      });
    }
    if (showTextCb && textWrapEl) {
      showTextCb.addEventListener('change', () => {
        textWrapEl.hidden = !showTextCb.checked;
      });
    }
  }

  function renderThemeColorPicker(currentHex, currentStyle, readOnlyAttr) {
    const theme = window.SapaTheme;
    const activeHex = theme?.normalizeHex(currentHex) || theme?.DEFAULT_THEME_COLOR || '#38BDF8';
    const activeStyle = currentStyle === 'flat' ? 'flat' : 'gradient';
    const presets = theme?.THEME_PRESETS || [];
    return `
      <section class="aui-theme-picker-card" aria-label="Pengaturan tema warna situs publik">
        <div class="aui-theme-picker-header">
          <div class="aui-theme-picker-title">
            <h3>Tema Warna Situs Publik (Color Wheel)</h3>
            <p>Ubah warna utama halaman publik, tombol aksi, dan banner beranda dengan kontras WCAG AA otomatis.</p>
          </div>
          <button type="button" id="aui-theme-reset-btn" class="btn btn-secondary btn-sm" ${readOnlyAttr}>Reset ke Biru Bawaan</button>
        </div>
        <div class="aui-theme-picker-grid">
          <div class="aui-wheel-column">
            <div class="aui-wheel-wrap" id="aui-wheel-wrap" title="Geser atau klik lingkaran untuk memilih warna">
              <canvas id="aui-wheel-canvas" class="aui-wheel-canvas" width="176" height="176"></canvas>
              <div id="aui-wheel-thumb" class="aui-wheel-thumb" aria-hidden="true"></div>
            </div>
            <div class="aui-brightness-wrap">
              <div class="aui-brightness-label">
                <label for="aui-wheel-brightness">Kecerahan</label>
                <span id="aui-brightness-val" class="num-tabular">100%</span>
              </div>
              <input type="range" id="aui-wheel-brightness" class="aui-brightness-slider" min="25" max="100" value="100" ${readOnlyAttr}>
            </div>
          </div>
          <div class="aui-theme-controls-col">
            <div class="aui-hex-row">
              <input type="color" id="id-themeColorNative" class="aui-native-color-btn" value="${esc(activeHex)}" aria-label="Pemilih warna sistem" ${readOnlyAttr}>
              <input type="text" id="id-themeColor" class="aui-hex-input" value="${esc(activeHex)}" maxlength="7" placeholder="#38BDF8" aria-label="Kode warna HEX" ${readOnlyAttr}>
              <input type="hidden" id="id-themeStyle" value="${esc(activeStyle)}">
              <div class="aui-style-toggle" role="group" aria-label="Gaya warna banner beranda">
                <button type="button" class="aui-style-btn ${activeStyle === 'gradient' ? 'is-active' : ''}" data-theme-style="gradient" aria-pressed="${activeStyle === 'gradient'}" ${readOnlyAttr}>Gradien</button>
                <button type="button" class="aui-style-btn ${activeStyle === 'flat' ? 'is-active' : ''}" data-theme-style="flat" aria-pressed="${activeStyle === 'flat'}" ${readOnlyAttr}>Flat (Solid)</button>
              </div>
            </div>
            <div class="aui-preset-swatches" role="group" aria-label="Pilihan warna cepat">
              ${presets.map((p) => `
                <button type="button" class="aui-swatch-pill ${p.hex === activeHex ? 'is-active' : ''}" data-preset-hex="${esc(p.hex)}" ${readOnlyAttr}>
                  <span class="aui-swatch-dot" style="background:${esc(p.hex)}"></span>
                  <span>${esc(p.name)}</span>
                </button>
              `).join('')}
            </div>
            <div class="aui-theme-preview-box" id="aui-theme-preview-box">
              <div class="aui-theme-preview-hero" id="aui-theme-preview-hero">
                <div>
                  <strong id="aui-preview-title" style="display:block;font-size:0.95rem">SAPA NAMBASO</strong>
                  <span id="aui-preview-sub" style="font-size:0.78rem;opacity:0.9">Pratinjau Banner &amp; Tombol Publik</span>
                </div>
                <span class="aui-theme-preview-cta" id="aui-theme-preview-cta">Cek Pajak Kendaraan</span>
              </div>
              <div class="aui-theme-contrast-meta">
                <span>Kontras Tombol: <strong id="aui-contrast-ratio" class="num-tabular">-</strong></span>
                <span id="aui-contrast-badge" class="aui-contrast-badge is-pass">WCAG AA Aman</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function bindThemeColorPicker(initialHex, initialStyle, isReadOnly) {
    const theme = window.SapaTheme;
    if (!theme) return;

    const canvas = document.getElementById('aui-wheel-canvas');
    const wheelWrap = document.getElementById('aui-wheel-wrap');
    const thumb = document.getElementById('aui-wheel-thumb');
    const brightnessInput = document.getElementById('aui-wheel-brightness');
    const brightnessLabel = document.getElementById('aui-brightness-val');
    const nativeInput = document.getElementById('id-themeColorNative');
    const hexInput = document.getElementById('id-themeColor');
    const styleInput = document.getElementById('id-themeStyle');
    const styleBtns = Array.from(document.querySelectorAll('.aui-style-btn[data-theme-style]'));
    const resetBtn = document.getElementById('aui-theme-reset-btn');
    const previewBox = document.getElementById('aui-theme-preview-box');
    const previewHero = document.getElementById('aui-theme-preview-hero');
    const previewCta = document.getElementById('aui-theme-preview-cta');
    const ratioEl = document.getElementById('aui-contrast-ratio');
    const badgeEl = document.getElementById('aui-contrast-badge');
    const presetBtns = Array.from(document.querySelectorAll('.aui-swatch-pill[data-preset-hex]'));

    if (!canvas || !wheelWrap || !thumb || !brightnessInput || !nativeInput || !hexInput) return;

    let currentHex = theme.normalizeHex(initialHex) || theme.DEFAULT_THEME_COLOR;
    let currentStyle = initialStyle === 'flat' ? 'flat' : 'gradient';
    let hsv = theme.hexToHsv(currentHex);
    const size = canvas.width;
    const radius = size / 2;

    function drawWheel(valPct) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = ctx.createImageData(size, size);
      const data = img.data;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - radius;
          const dy = y - radius;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const idx = (y * size + x) * 4;
          if (dist <= radius) {
            const sat = (dist / radius) * 100;
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const hue = (angle + 360) % 360;
            const hex = theme.hsvToHex(hue, sat, valPct);
            const rgb = theme.hexToRgb(hex);
            data[idx] = rgb.r;
            data[idx + 1] = rgb.g;
            data[idx + 2] = rgb.b;
            data[idx + 3] = dist > radius - 1.2 ? Math.max(0, Math.round((radius - dist) * 210)) : 255;
          } else {
            data[idx + 3] = 0;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function updateUiFromHex(nextHex, syncHsv = true) {
      const norm = theme.normalizeHex(nextHex);
      if (!norm) return;
      currentHex = norm;
      if (syncHsv) hsv = theme.hexToHsv(norm);

      const angleRad = (hsv.h * Math.PI) / 180;
      const dist = (hsv.s / 100) * (radius - 6);
      const tx = 4 + radius + Math.cos(angleRad) * dist;
      const ty = 4 + radius + Math.sin(angleRad) * dist;

      thumb.style.left = `${tx}px`;
      thumb.style.top = `${ty}px`;
      thumb.style.backgroundColor = currentHex;

      brightnessInput.value = String(Math.max(25, hsv.v));
      brightnessLabel.textContent = `${Math.max(25, hsv.v)}%`;
      const pureHueHex = theme.hsvToHex(hsv.h, hsv.s, 100);
      brightnessInput.style.background = `linear-gradient(90deg, #1E293B 0%, ${pureHueHex} 100%)`;

      nativeInput.value = currentHex;
      if (document.activeElement !== hexInput) {
        hexInput.value = currentHex;
      }

      for (const btn of presetBtns) {
        btn.classList.toggle('is-active', btn.dataset.presetHex === currentHex);
      }

      const tokens = theme.buildThemeTokens(currentHex, currentStyle);
      const light = tokens ? tokens.light : {
        bgPage: '#F0F9FF',
        borderSoft: '#BAE6FD',
        heroBg: '#7DD3FC',
        heroGradient: 'linear-gradient(145deg, #BAE6FD 0%, #7DD3FC 48%, #38BDF8 100%)',
        heroInk: '#082F49',
        accentPrimary: '#38BDF8',
        accentInk: '#082F49'
      };

      if (styleInput) styleInput.value = currentStyle;
      for (const btn of styleBtns) {
        const active = btn.dataset.themeStyle === currentStyle;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      }

      previewBox.style.backgroundColor = light.bgPage;
      previewBox.style.borderColor = light.borderSoft;
      previewHero.style.backgroundColor = light.heroBg;
      previewHero.style.backgroundImage = light.heroGradient;
      previewHero.style.color = light.heroInk;
      previewCta.style.backgroundColor = light.accentPrimary;
      previewCta.style.color = light.accentInk;

      const ratio = theme.getContrastRatio(light.accentPrimary, light.accentInk);
      ratioEl.textContent = `${ratio.toFixed(2)}:1`;
      if (ratio >= 4.5) {
        badgeEl.className = 'aui-contrast-badge is-pass';
        badgeEl.textContent = 'WCAG AA Aman';
      } else {
        badgeEl.className = 'aui-contrast-badge is-warn';
        badgeEl.textContent = 'Kontras Rendah';
      }
    }

    drawWheel(Math.max(25, hsv.v));
    updateUiFromHex(currentHex, false);

    if (isReadOnly) return;

    function pickFromPointer(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      const maxR = rect.width / 2;
      const clampedDist = Math.min(Math.sqrt(dx * dx + dy * dy), maxR);
      const sat = Math.round((clampedDist / maxR) * 100);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const hue = Math.round((angle + 360) % 360);
      hsv = { h: hue, s: sat, v: Math.max(25, Number(brightnessInput.value)) };
      const nextHex = theme.hsvToHex(hsv.h, hsv.s, hsv.v);
      updateUiFromHex(nextHex, false);
    }

    let dragging = false;
    wheelWrap.addEventListener('pointerdown', (e) => {
      dragging = true;
      wheelWrap.classList.add('is-dragging');
      wheelWrap.setPointerCapture(e.pointerId);
      pickFromPointer(e.clientX, e.clientY);
    });

    wheelWrap.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      pickFromPointer(e.clientX, e.clientY);
    });

    const stopDrag = () => {
      if (!dragging) return;
      dragging = false;
      wheelWrap.classList.remove('is-dragging');
    };
    wheelWrap.addEventListener('pointerup', stopDrag);
    wheelWrap.addEventListener('pointercancel', stopDrag);

    brightnessInput.addEventListener('input', () => {
      const val = Math.max(25, Number(brightnessInput.value));
      hsv = { ...hsv, v: val };
      drawWheel(val);
      updateUiFromHex(theme.hsvToHex(hsv.h, hsv.s, val), false);
    });

    nativeInput.addEventListener('input', () => {
      const nextHex = theme.normalizeHex(nativeInput.value);
      if (!nextHex) return;
      const nextHsv = theme.hexToHsv(nextHex);
      drawWheel(Math.max(25, nextHsv.v));
      updateUiFromHex(nextHex, true);
    });

    hexInput.addEventListener('input', () => {
      const nextHex = theme.normalizeHex(hexInput.value);
      if (!nextHex) return;
      const nextHsv = theme.hexToHsv(nextHex);
      drawWheel(Math.max(25, nextHsv.v));
      updateUiFromHex(nextHex, true);
    });

    for (const btn of presetBtns) {
      btn.addEventListener('click', () => {
        const nextHex = btn.dataset.presetHex;
        const nextHsv = theme.hexToHsv(nextHex);
        drawWheel(Math.max(25, nextHsv.v));
        updateUiFromHex(nextHex, true);
      });
    }

    for (const btn of styleBtns) {
      btn.addEventListener('click', () => {
        currentStyle = btn.dataset.themeStyle === 'flat' ? 'flat' : 'gradient';
        updateUiFromHex(currentHex, false);
      });
    }

    resetBtn?.addEventListener('click', () => {
      const def = theme.DEFAULT_THEME_COLOR;
      currentStyle = 'gradient';
      const nextHsv = theme.hexToHsv(def);
      drawWheel(Math.max(25, nextHsv.v));
      updateUiFromHex(def, true);
    });
  }

  // Module A3 & A9: Hero and Tax Check Redirect
  function renderHeroTaxModule(draft, readOnlyAttr) {
    const h = draft.hero;
    const t = draft.taxCheck;
    moduleContent.innerHTML = `
      <div class="module-header">
        <h1>Beranda dan Tautan Cek Pajak</h1>
      </div>

      <form id="hero-form" class="panel-card">
        <h2>Konten Utama Beranda</h2>
        <div class="field-group">
          <label for="hero-title">Judul Utama Beranda (H1)</label>
          <input type="text" id="hero-title" value="${esc(h.title)}" ${readOnlyAttr} required>
        </div>
        <div class="field-group">
          <label for="hero-subtitle">Kalimat Sambutan</label>
          <textarea id="hero-subtitle" ${readOnlyAttr} required>${esc(h.subtitle)}</textarea>
        </div>
        <div class="grid-2">
          <div class="field-group">
            <label for="hero-cta1">Teks Tombol Utama</label>
            <input type="text" id="hero-cta1" value="${esc(h.primaryCtaLabel)}" ${readOnlyAttr} required>
          </div>
          <div class="field-group">
            <label for="hero-cta2">Teks Tombol Lokasi</label>
            <input type="text" id="hero-cta2" value="${esc(h.secondaryLocationLabel)}" ${readOnlyAttr}>
          </div>
          <div class="field-group">
            <label for="hero-cta3">Teks Tombol Kontak</label>
            <input type="text" id="hero-cta3" value="${esc(h.secondaryContactLabel)}" ${readOnlyAttr}>
          </div>
          ${renderMediaPickerField({
      selectId: 'hero-img',
      label: 'Foto Utama Beranda',
      selectedId: h.heroImageId,
      defaultAlt: 'Foto gedung dan pelayanan Samsat Palu',
      readOnlyAttr,
      cropDefault: '16:10'
    })}
        </div>
        <div class="field-group">
          <label for="hero-caption">Keterangan Foto Utama</label>
          <input type="text" id="hero-caption" value="${esc(h.heroCaption)}" ${readOnlyAttr}>
        </div>
        <button type="submit" class="btn btn-primary" ${readOnlyAttr}>Simpan Draf Beranda</button>
      </form>

      <form id="tax-form" class="panel-card">
        <h2>Pengaturan Tautan Cek Pajak Kendaraan</h2>
        <div class="field-group">
          <label for="tax-url">Alamat Tujuan Resmi Cek Pajak</label>
          <input type="url" id="tax-url" value="${esc(t.targetUrl)}" ${readOnlyAttr} required>
        </div>
        <div class="field-group">
          <label for="tax-label">Teks Tombol Cek Pajak</label>
          <input type="text" id="tax-label" value="${esc(t.buttonLabel)}" ${readOnlyAttr} required>
        </div>
        <div class="field-group">
          <label for="tax-notice">Keterangan Pengalihan ke Bapenda Sulteng</label>
          <textarea id="tax-notice" ${readOnlyAttr} required>${esc(t.redirectNotice)}</textarea>
        </div>
        <p class="meta-text" id="link-health-text">Status pemantauan tautan terakhir: ${esc(t.lastCheckStatus || 'Belum diperiksa')}</p>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" ${readOnlyAttr}>Simpan Draf Cek Pajak</button>
          <button type="button" id="check-tax-link-btn" class="btn btn-secondary">Uji Ketersediaan Tautan Sekarang</button>
        </div>
      </form>
    `;
    bindMediaPickers(moduleContent);

    document.getElementById('hero-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveDraftSection('hero', {
        title: document.getElementById('hero-title').value.trim(),
        subtitle: document.getElementById('hero-subtitle').value.trim(),
        primaryCtaLabel: document.getElementById('hero-cta1').value.trim(),
        secondaryLocationLabel: document.getElementById('hero-cta2').value.trim(),
        secondaryContactLabel: document.getElementById('hero-cta3').value.trim(),
        heroImageId: document.getElementById('hero-img').value,
        heroCaption: document.getElementById('hero-caption').value.trim()
      });
    });

    document.getElementById('tax-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveDraftSection('taxCheck', {
        ...t,
        targetUrl: document.getElementById('tax-url').value.trim(),
        buttonLabel: document.getElementById('tax-label').value.trim(),
        redirectNotice: document.getElementById('tax-notice').value.trim()
      });
    });

    document.getElementById('check-tax-link-btn').addEventListener('click', async () => {
      const statusEl = document.getElementById('link-health-text');
      statusEl.textContent = 'Sedang memeriksa tautan tujuan...';
      try {
        const res = await api('/api/admin/check-link', {
          method: 'POST',
          body: JSON.stringify({ url: document.getElementById('tax-url').value.trim() })
        });
        statusEl.textContent = `Hasil uji: ${res.statusText}`;
      } catch (err) {
        statusEl.textContent = `Gagal memeriksa tautan: ${err.message}`;
      }
    });
  }

  // Module A5: Services, PNBP fees, Requirements, Collapsible Accordion Cards
  function renderServicesModule(draft, readOnlyAttr) {
    const services = (draft.services || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));

    function feeRowHtml(idx, fIdx, fee = {}) {
      return `
        <div class="repeater-fee-row svc-fee-row">
          <div class="field-group" style="margin-bottom:0">
            <label for="svc-fee-item-${idx}-${fIdx}">Komponen Biaya</label>
            <input type="text" id="svc-fee-item-${idx}-${fIdx}" class="svc-fee-item" value="${esc(fee.item || '')}" placeholder="Contoh: Pengesahan STNK" ${readOnlyAttr}>
          </div>
          <div class="field-group" style="margin-bottom:0">
            <label for="svc-fee-amt-${idx}-${fIdx}">Tarif Resmi</label>
            <input type="text" id="svc-fee-amt-${idx}-${fIdx}" class="svc-fee-amount" value="${esc(fee.amount || '')}" placeholder="Contoh: Rp 50.000" ${readOnlyAttr}>
          </div>
          <div class="field-group" style="margin-bottom:0">
            <label for="svc-fee-note-${idx}-${fIdx}">Keterangan</label>
            <input type="text" id="svc-fee-note-${idx}-${fIdx}" class="svc-fee-note" value="${esc(fee.note || '')}" placeholder="Keterangan tambahan" ${readOnlyAttr}>
          </div>
          <button type="button" class="btn btn-danger btn-sm remove-fee-row" ${readOnlyAttr}>Hapus</button>
        </div>
      `;
    }

    function reqRowHtml(idx, rIdx, reqText = '') {
      return `
        <div class="repeater-inline-row svc-req-row">
          <span class="repeater-badge num-tabular">${String(rIdx + 1).padStart(2, '0')}</span>
          <label class="sr-only" for="svc-req-${idx}-${rIdx}">Syarat ${rIdx + 1}</label>
          <input type="text" id="svc-req-${idx}-${rIdx}" class="svc-req-input" value="${esc(reqText)}" placeholder="Contoh: KTP asli pemilik kendaraan" ${readOnlyAttr}>
          <button type="button" class="btn btn-danger btn-sm remove-req-row" ${readOnlyAttr}>Hapus</button>
        </div>
      `;
    }

    const openIndex = typeof state._openServiceIndex === 'number' ? state._openServiceIndex : -1;
    state._openServiceIndex = null;

    moduleContent.innerHTML = `
      <div class="module-header">
        <div>
          <h1>Kelola Jenis Layanan, Tarif PNBP, dan Persyaratan</h1>
          <p class="meta-text" style="margin:0.25rem 0 0">Klik kartu layanan untuk membuka detail, atau seret pegangan di sebelah kiri untuk mengatur ulang urutan.</p>
        </div>
        <button type="button" id="add-service-btn" class="btn btn-accent" ${readOnlyAttr}>${lucideIcon('plus', 16)} Tambah Layanan Baru</button>
      </div>
      <div id="admin-services-list" class="repeater-list" style="margin-bottom:1.15rem">
        ${services.map((svc, idx) => `
          <details class="admin-svc-details" data-svc-idx="${idx}" ${openIndex === idx ? 'open' : ''}>
            <summary class="admin-svc-summary">
              <button type="button" class="aui-drag-handle" aria-label="Seret untuk mengubah urutan ${esc(svc.name)}" title="Klik, tahan, dan geser untuk mengubah urutan" ${!canEditDraft() ? 'disabled' : ''}>${lucideIcon('grip-vertical', 16)}</button>
              <span class="admin-svc-num num-tabular">${String(idx + 1).padStart(2, '0')}</span>
              <span class="admin-svc-title-group">
                <strong class="admin-svc-title-text">${esc(svc.name)}</strong>
                <span class="admin-svc-meta num-tabular">${(svc.pnbpFees || []).length} tarif PNBP | ${(svc.requirements || []).length} syarat dokumen</span>
              </span>
              <span class="admin-svc-actions-bar">
                <span class="admin-svc-status-badge ${svc.active !== false ? 'is-active' : 'is-inactive'}">${svc.active !== false ? 'Aktif' : 'Nonaktif'}</span>
                <button type="button" class="btn btn-danger btn-sm svc-del" data-idx="${idx}" aria-label="Hapus layanan ${esc(svc.name)}" title="Hapus layanan" ${readOnlyAttr}>${lucideIcon('trash-2', 14)}</button>
                <span class="admin-svc-chevron" aria-hidden="true">${lucideIcon('chevron-down', 18)}</span>
              </span>
            </summary>
            <div class="admin-svc-body">
              <div class="grid-2">
                <div class="field-group">
                  <label for="svc-name-${idx}">Nama Layanan</label>
                  <input type="text" id="svc-name-${idx}" class="svc-name-input" value="${esc(svc.name)}" ${readOnlyAttr}>
                </div>
                <div class="field-group">
                  <label for="svc-active-${idx}">Status Tampil</label>
                  <select id="svc-active-${idx}" class="svc-active-select" ${readOnlyAttr}>
                    <option value="true" ${svc.active !== false ? 'selected' : ''}>Aktif (Tampil di Publik)</option>
                    <option value="false" ${svc.active === false ? 'selected' : ''}>Nonaktif (Disembunyikan)</option>
                  </select>
                </div>
              </div>
              <div class="field-group">
                <label for="svc-summary-${idx}">Ringkasan Layanan</label>
                <input type="text" id="svc-summary-${idx}" value="${esc(svc.summary)}" ${readOnlyAttr}>
              </div>

              <div class="repeater-section">
                <div class="repeater-header">
                  <h3>Rincian Biaya (PNBP dan Pajak)</h3>
                  <button type="button" class="btn btn-secondary btn-sm add-fee-row" data-idx="${idx}" ${readOnlyAttr}>${lucideIcon('plus', 14)} Tambah Komponen Biaya</button>
                </div>
                <div class="repeater-list svc-fees-list" data-fees-for="${idx}">
                  ${(svc.pnbpFees || []).map((f, fIdx) => feeRowHtml(idx, fIdx, f)).join('')}
                </div>
              </div>

              <div class="repeater-section" style="margin-bottom:0">
                <div class="repeater-header">
                  <h3>Daftar Persyaratan Dokumen</h3>
                  <button type="button" class="btn btn-secondary btn-sm add-req-row" data-idx="${idx}" ${readOnlyAttr}>${lucideIcon('plus', 14)} Tambah Syarat Dokumen</button>
                </div>
                <div class="repeater-list svc-reqs-list" data-reqs-for="${idx}">
                  ${(svc.requirements || []).map((req, rIdx) => reqRowHtml(idx, rIdx, req)).join('')}
                </div>
              </div>
            </div>
          </details>
        `).join('')}
      </div>
      <button type="button" id="save-services-btn" class="btn btn-primary" ${readOnlyAttr}>${lucideIcon('save', 16)} Simpan Semua Draf Layanan</button>
    `;

    const servicesListEl = document.getElementById('admin-services-list');

    function renumberServiceCards() {
      Array.from(servicesListEl.querySelectorAll('details.admin-svc-details')).forEach((card, domIdx) => {
        const numEl = card.querySelector('.admin-svc-num');
        if (numEl) numEl.textContent = String(domIdx + 1).padStart(2, '0');
      });
    }

    bindSmoothAccordionDetails(moduleContent);
    bindAnimateUiSortable(servicesListEl, {
      itemSelector: 'details.admin-svc-details',
      onReorder: renumberServiceCards
    });

    function updateSummaryMeta(card) {
      if (!card) return;
      const idx = card.getAttribute('data-svc-idx');
      const titleEl = card.querySelector('.admin-svc-title-text');
      const metaEl = card.querySelector('.admin-svc-meta');
      const statusBadge = card.querySelector('.admin-svc-status-badge');
      const nameInput = document.getElementById(`svc-name-${idx}`);
      const activeSel = document.getElementById(`svc-active-${idx}`);
      if (titleEl && nameInput) titleEl.textContent = nameInput.value.trim() || 'Layanan Tanpa Nama';
      if (metaEl) {
        const feeCount = card.querySelectorAll('.svc-fee-row').length;
        const reqCount = card.querySelectorAll('.svc-req-row').length;
        metaEl.textContent = `${feeCount} tarif PNBP | ${reqCount} syarat dokumen`;
      }
      if (statusBadge && activeSel) {
        const isActive = activeSel.value === 'true';
        statusBadge.textContent = isActive ? 'Aktif' : 'Nonaktif';
        statusBadge.className = `admin-svc-status-badge ${isActive ? 'is-active' : 'is-inactive'}`;
      }
    }

    moduleContent.querySelectorAll('.svc-name-input, .svc-active-select').forEach((inp) => {
      const handler = () => updateSummaryMeta(inp.closest('details.admin-svc-details'));
      inp.addEventListener('input', handler);
      inp.addEventListener('change', handler);
    });

    function renumberReqs(listEl) {
      listEl.querySelectorAll('.svc-req-row').forEach((row, i) => {
        const badge = row.querySelector('.repeater-badge');
        if (badge) badge.textContent = String(i + 1).padStart(2, '0');
      });
    }

    moduleContent.querySelectorAll('.add-fee-row').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-idx');
        const listEl = moduleContent.querySelector(`[data-fees-for="${idx}"]`);
        const nextIdx = Date.now().toString(36);
        listEl.insertAdjacentHTML('beforeend', feeRowHtml(idx, nextIdx, { item: '', amount: '[DATA RESMI DIISI PETUGAS]', note: '' }));
        updateSummaryMeta(btn.closest('details.admin-svc-details'));
      });
    });

    moduleContent.querySelectorAll('.add-req-row').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-idx');
        const listEl = moduleContent.querySelector(`[data-reqs-for="${idx}"]`);
        const nextIdx = Date.now().toString(36);
        listEl.insertAdjacentHTML('beforeend', reqRowHtml(idx, nextIdx, ''));
        renumberReqs(listEl);
        updateSummaryMeta(btn.closest('details.admin-svc-details'));
      });
    });

    moduleContent.addEventListener('click', (e) => {
      const remFee = e.target.closest('.remove-fee-row');
      if (remFee) {
        const card = remFee.closest('details.admin-svc-details');
        remFee.closest('.svc-fee-row')?.remove();
        updateSummaryMeta(card);
        return;
      }
      const remReq = e.target.closest('.remove-req-row');
      if (remReq) {
        const card = remReq.closest('details.admin-svc-details');
        const listEl = remReq.closest('.svc-reqs-list');
        remReq.closest('.svc-req-row')?.remove();
        if (listEl) renumberReqs(listEl);
        updateSummaryMeta(card);
      }
    });

    function collectServices() {
      const cards = Array.from(servicesListEl.querySelectorAll('details.admin-svc-details'));
      return cards.map((card, domIdx) => {
        const origIdx = Number(card.getAttribute('data-svc-idx'));
        const svc = services[origIdx] || {};
        const pnbpFees = Array.from(card.querySelectorAll('.svc-fee-row')).map((row) => ({
          item: row.querySelector('.svc-fee-item').value.trim(),
          amount: row.querySelector('.svc-fee-amount').value.trim(),
          note: row.querySelector('.svc-fee-note').value.trim()
        })).filter((f) => f.item || f.amount);
        const requirements = Array.from(card.querySelectorAll('.svc-req-input'))
          .map((inp) => inp.value.trim())
          .filter(Boolean);
        return {
          ...svc,
          order: domIdx + 1,
          name: document.getElementById(`svc-name-${origIdx}`).value.trim(),
          active: document.getElementById(`svc-active-${origIdx}`).value === 'true',
          summary: document.getElementById(`svc-summary-${origIdx}`).value.trim(),
          pnbpFees,
          requirements,
          updatedAt: new Date().toISOString()
        };
      });
    }

    document.getElementById('save-services-btn').addEventListener('click', async () => {
      await saveDraftSection('services', collectServices(), 'Draf layanan dan biaya PNBP berhasil diperbarui.');
    });

    document.getElementById('add-service-btn').addEventListener('click', async () => {
      const updated = collectServices();
      state._openServiceIndex = updated.length;
      updated.push({
        id: `layanan-${Date.now().toString(36)}`,
        order: updated.length + 1,
        active: true,
        name: 'Layanan Baru',
        summary: 'Ringkasan layanan baru',
        updatedAt: new Date().toISOString(),
        imageId: 'media-lokasi-default',
        pnbpFees: [{ item: 'Komponen PNBP', amount: '[DATA RESMI DIISI PETUGAS]', note: '' }],
        requirements: ['[DATA RESMI DIISI PETUGAS]']
      });
      await saveDraftSection('services', updated, 'Layanan baru ditambahkan ke draf.', {
        title: 'Tambah Layanan Baru?',
        message: 'Layanan baru akan ditambahkan ke daftar draf dan langsung siap disunting.'
      });
    });

    moduleContent.querySelectorAll('.svc-del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const targetCard = btn.closest('details.admin-svc-details');
        const domCards = Array.from(servicesListEl.querySelectorAll('details.admin-svc-details'));
        const domIdx = domCards.indexOf(targetCard);
        const origIdx = Number(targetCard?.getAttribute('data-svc-idx'));
        const targetName = services[origIdx]?.name || 'layanan ini';
        const list = collectServices().filter((_, i) => i !== domIdx);
        list.forEach((s, i) => { s.order = i + 1; });
        await saveDraftSection('services', list, 'Layanan dihapus dari draf.', {
          title: 'Hapus Jenis Layanan?',
          message: `Anda akan menghapus "${targetName}" dari draf daftar layanan.`,
          confirmLabel: 'Ya, Hapus Layanan',
          variant: 'danger'
        });
      });
    });
  }

  // Module A6: Simplify-UI Weekly Hours & Untitled UI Interactive Holiday Calendar
  function renderHoursModule(draft, readOnlyAttr) {
    const h = draft.hours || {};
    let currentExceptions = (h.exceptions || []).map((ex, i) => ({
      id: ex.id || `ex-${i}`,
      date: ex.date || '',
      title: ex.title || '',
      status: ex.status === 'closed' ? 'closed' : 'custom',
      openTime: ex.openTime || '08:00',
      closeTime: ex.closeTime || '12:00',
      note: ex.note || ''
    })).filter((ex) => ex.date);

    const witaTodayParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Makassar',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date()).split('-').map(Number);
    const todayIsoStr = toIsoDate(witaTodayParts[0], witaTodayParts[1] - 1, witaTodayParts[2]);
    let calYear = witaTodayParts[0];
    let calMonth = witaTodayParts[1] - 1;

    moduleContent.innerHTML = `
      <div class="module-header">
        <div>
          <h1>Jam Layanan WITA dan Kalender Hari Libur</h1>
          <p class="meta-text" style="margin:0.25rem 0 0">Atur status Buka atau Tutup per hari dengan tombol cepat, serta klik tanggal pada kalender untuk menandai hari libur.</p>
        </div>
      </div>
      <form id="hours-form">
        <div class="panel-card">
          <h2>Jadwal Mingguan Reguler</h2>
          <div id="hours-days-list" class="hours-days-list">
            ${(h.weekly || []).map((row, idx) => `
              <div class="hours-day-row-card${row.isOpen ? '' : ' is-closed'}" data-day-idx="${idx}" data-day-open="${row.isOpen ? 'true' : 'false'}">
                <div class="hours-day-label">${esc(row.dayName)}</div>
                <div class="hours-toggle-group" role="group" aria-label="Status layanan ${esc(row.dayName)}">
                  <button type="button" class="hours-toggle-pill pill-open${row.isOpen ? ' is-active' : ''}" data-set-open="true" ${readOnlyAttr}>Buka</button>
                  <button type="button" class="hours-toggle-pill pill-closed${!row.isOpen ? ' is-active' : ''}" data-set-open="false" ${readOnlyAttr}>Tutup</button>
                </div>
                <div class="hours-time-group">
                  <label class="sr-only" for="hr-start-${idx}">Jam buka ${esc(row.dayName)}</label>
                  <input type="time" id="hr-start-${idx}" class="hr-start-input" value="${esc(row.openTime || '08:00')}" ${!row.isOpen ? 'disabled' : ''} ${readOnlyAttr}>
                  <span class="hours-time-sep">s.d.</span>
                  <label class="sr-only" for="hr-end-${idx}">Jam tutup ${esc(row.dayName)}</label>
                  <input type="time" id="hr-end-${idx}" class="hr-end-input" value="${esc(row.closeTime || '15:00')}" ${!row.isOpen ? 'disabled' : ''} ${readOnlyAttr}>
                </div>
                <div class="field-group" style="margin-bottom:0">
                  <label class="sr-only" for="hr-disp-${idx}">Teks tampil publik ${esc(row.dayName)}</label>
                  <input type="text" id="hr-disp-${idx}" value="${esc(row.displayText)}" placeholder="Contoh: 08.00 s.d. 15.00 WITA" ${readOnlyAttr}>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="field-group" style="margin-top:1.15rem;margin-bottom:0">
            <label for="hr-holiday-note">Catatan Hari Libur Nasional</label>
            <input type="text" id="hr-holiday-note" value="${esc(h.holidayNote || '')}" ${readOnlyAttr}>
          </div>
        </div>

        <div class="panel-card">
          <div id="holiday-calendar-mount"></div>
          <div id="holiday-chips-mount" class="staleness-chips" style="margin-top:0.85rem"></div>
        </div>

        <button type="submit" class="btn btn-primary" ${readOnlyAttr}>${lucideIcon('save', 16)} Simpan Draf Jam Layanan</button>
      </form>
    `;

    function syncRowDisplay(card) {
      const idx = card.getAttribute('data-day-idx');
      const isOpen = card.getAttribute('data-day-open') === 'true';
      const startInp = document.getElementById(`hr-start-${idx}`);
      const endInp = document.getElementById(`hr-end-${idx}`);
      const dispInp = document.getElementById(`hr-disp-${idx}`);
      if (!dispInp) return;
      if (!isOpen) {
        dispInp.value = 'Tutup';
      } else {
        const s = (startInp?.value || '08:00').replace(':', '.');
        const e = (endInp?.value || '15:00').replace(':', '.');
        dispInp.value = `${s} s.d. ${e} WITA`;
      }
    }

    moduleContent.querySelectorAll('.hours-day-row-card').forEach((card) => {
      const idx = card.getAttribute('data-day-idx');
      const startInp = document.getElementById(`hr-start-${idx}`);
      const endInp = document.getElementById(`hr-end-${idx}`);
      card.querySelectorAll('[data-set-open]').forEach((pill) => {
        pill.addEventListener('click', () => {
          if (!canEditDraft()) return;
          const openBool = pill.getAttribute('data-set-open') === 'true';
          card.setAttribute('data-day-open', openBool ? 'true' : 'false');
          card.classList.toggle('is-closed', !openBool);
          card.querySelector('.pill-open')?.classList.toggle('is-active', openBool);
          card.querySelector('.pill-closed')?.classList.toggle('is-active', !openBool);
          if (startInp) startInp.disabled = !openBool;
          if (endInp) endInp.disabled = !openBool;
          syncRowDisplay(card);
        });
      });
      startInp?.addEventListener('change', () => syncRowDisplay(card));
      endInp?.addEventListener('change', () => syncRowDisplay(card));
    });

    const holidayDlg = document.getElementById('holiday-date-dialog');
    const holidayForm = document.getElementById('holiday-date-form');
    const holidayBadge = document.getElementById('holiday-dialog-date-badge');
    const holidayIsoInp = document.getElementById('holiday-dialog-iso');
    const holidayNameInp = document.getElementById('holiday-dialog-name');
    const holidayStatusSel = document.getElementById('holiday-dialog-status');
    const holidayHoursWrap = document.getElementById('holiday-dialog-hours-wrap');
    const holidayOpenInp = document.getElementById('holiday-dialog-open');
    const holidayCloseTimeInp = document.getElementById('holiday-dialog-close-time');
    const holidayNoteInp = document.getElementById('holiday-dialog-note');
    const holidayDeleteBtn = document.getElementById('holiday-dialog-delete');
    const holidayCloseBtn = document.getElementById('holiday-dialog-close');
    const holidayCancelBtn = document.getElementById('holiday-dialog-cancel');

    function syncHolidayHoursVisibility() {
      if (!holidayStatusSel || !holidayHoursWrap) return;
      holidayHoursWrap.hidden = holidayStatusSel.value !== 'special';
    }

    if (holidayDlg) {
      enhanceAdminControls(holidayDlg);
      holidayStatusSel?.addEventListener('change', syncHolidayHoursVisibility);
      const closeHolidayDlg = () => {
        if (typeof holidayDlg.close === 'function') holidayDlg.close();
        else holidayDlg.removeAttribute('open');
      };
      if (holidayCloseBtn) holidayCloseBtn.onclick = closeHolidayDlg;
      if (holidayCancelBtn) holidayCancelBtn.onclick = closeHolidayDlg;

      if (holidayForm) {
        holidayForm.onsubmit = (e) => {
          e.preventDefault();
          if (!canEditDraft()) return;
          const iso = holidayIsoInp.value;
          const title = holidayNameInp.value.trim();
          if (!title) {
            holidayNameInp.focus();
            showToast('Nama hari libur atau kegiatan khusus wajib diisi.', 'error', 'Validasi Kalender');
            return;
          }
          const isClosed = holidayStatusSel.value === 'closed';
          const updatedItem = {
            id: `ex-${iso}`,
            date: iso,
            title,
            status: isClosed ? 'closed' : 'custom',
            openTime: isClosed ? '' : (holidayOpenInp.value || '08:00'),
            closeTime: isClosed ? '' : (holidayCloseTimeInp.value || '12:00'),
            note: holidayNoteInp.value.trim()
          };
          const existingIdx = currentExceptions.findIndex((item) => item.date === iso);
          if (existingIdx >= 0) currentExceptions[existingIdx] = updatedItem;
          else currentExceptions.push(updatedItem);
          currentExceptions.sort((a, b) => a.date.localeCompare(b.date));
          closeHolidayDlg();
          renderHolidayCalendar();
          showToast(
            `Tanggal ${formatDisplayDateId(iso)} ditandai "${title}". Klik Simpan Draf Jam Layanan untuk menyimpan perubahan.`,
            'info',
            'Kalender Diperbarui'
          );
        };
      }

      if (holidayDeleteBtn) {
        holidayDeleteBtn.onclick = () => {
          if (!canEditDraft()) return;
          const iso = holidayIsoInp.value;
          currentExceptions = currentExceptions.filter((item) => item.date !== iso);
          closeHolidayDlg();
          renderHolidayCalendar();
          showToast(
            `Pengecualian tanggal ${formatDisplayDateId(iso)} dihapus dari kalender. Klik Simpan Draf Jam Layanan untuk menyimpan.`,
            'info',
            'Kalender Diperbarui'
          );
        };
      }
    }

    function openHolidayModal(iso) {
      if (!holidayDlg) return;
      const existing = currentExceptions.find((item) => item.date === iso);
      if (holidayBadge) holidayBadge.textContent = formatDisplayDateId(iso);
      if (holidayIsoInp) holidayIsoInp.value = iso;
      if (holidayNameInp) {
        holidayNameInp.value = existing ? existing.title : '';
        holidayNameInp.disabled = !canEditDraft();
      }
      if (holidayStatusSel) {
        holidayStatusSel.value = existing && existing.status !== 'closed' ? 'special' : 'closed';
        holidayStatusSel.disabled = !canEditDraft();
        if (typeof holidayStatusSel._syncCustomSelect === 'function') holidayStatusSel._syncCustomSelect();
      }
      if (holidayOpenInp) {
        holidayOpenInp.value = existing?.openTime || '08:00';
        holidayOpenInp.disabled = !canEditDraft();
      }
      if (holidayCloseTimeInp) {
        holidayCloseTimeInp.value = existing?.closeTime || '12:00';
        holidayCloseTimeInp.disabled = !canEditDraft();
      }
      if (holidayNoteInp) {
        holidayNoteInp.value = existing?.note || '';
        holidayNoteInp.disabled = !canEditDraft();
      }
      if (holidayDeleteBtn) {
        holidayDeleteBtn.hidden = !existing || !canEditDraft();
      }
      syncHolidayHoursVisibility();
      if (typeof holidayDlg.showModal === 'function') holidayDlg.showModal();
      else holidayDlg.setAttribute('open', 'true');
      holidayNameInp?.focus();
    }

    function renderHolidayCalendar() {
      const mount = document.getElementById('holiday-calendar-mount');
      const chipsMount = document.getElementById('holiday-chips-mount');
      if (!mount) return;

      const exceptionMap = new Map();
      currentExceptions.forEach((ex) => {
        if (ex.date) exceptionMap.set(ex.date, ex);
      });

      const firstOfMonth = new Date(calYear, calMonth, 1);
      const startOffset = (firstOfMonth.getDay() + 6) % 7; // Mon=0 ... Sun=6
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
      const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

      const cellsHtml = [];
      for (let cellIdx = 0; cellIdx < totalCells; cellIdx++) {
        const cellDate = new Date(calYear, calMonth, 1 - startOffset + cellIdx);
        const y = cellDate.getFullYear();
        const m = cellDate.getMonth();
        const d = cellDate.getDate();
        const iso = toIsoDate(y, m, d);
        const isOutside = m !== calMonth;
        const isToday = iso === todayIsoStr;
        const ex = exceptionMap.get(iso);

        cellsHtml.push(`
          <button type="button" class="holiday-cal-cell${isOutside ? ' is-outside' : ''}${isToday ? ' is-today' : ''}${ex ? ' has-holiday' : ''}" data-cal-iso="${esc(iso)}" aria-label="${esc(formatDisplayDateId(iso))}${ex ? `, ${esc(ex.title)}` : ', Klik untuk atur libur'}">
            <span class="holiday-day-num num-tabular">${d}</span>
            ${ex ? `<span class="holiday-event-pill ${ex.status === 'closed' ? 'holiday-event-closed' : 'holiday-event-special'}">${esc(ex.title || (ex.status === 'closed' ? 'Libur' : 'Jam Khusus'))}</span>` : ''}
          </button>
        `);
      }

      const emblemDay = (calYear === witaTodayParts[0] && calMonth === (witaTodayParts[1] - 1)) ? witaTodayParts[2] : 1;

      mount.innerHTML = `
        <div class="holiday-calendar-card">
          <div class="holiday-cal-header">
            <div class="holiday-cal-month-group">
              <div class="holiday-month-emblem" aria-hidden="true">
                <span class="holiday-emblem-month">${esc(CALENDAR_SHORT_MONTHS[calMonth])}</span>
                <span class="holiday-emblem-day num-tabular">${emblemDay}</span>
              </div>
              <div class="holiday-cal-title-wrap">
                <h3>Kalender Libur dan Pengecualian (${esc(CALENDAR_MONTHS[calMonth])} ${calYear})</h3>
                <p>${currentExceptions.length} tanggal pengecualian tercatat. Klik tanggal mana saja untuk menambah atau mengubah.</p>
              </div>
            </div>
            <div class="holiday-cal-controls">
              <button type="button" id="cal-prev-month" class="btn btn-secondary btn-sm" aria-label="Bulan sebelumnya">${lucideIcon('chevron-left', 16)}</button>
              <button type="button" id="cal-today-btn" class="btn btn-secondary btn-sm">Hari Ini</button>
              <button type="button" id="cal-next-month" class="btn btn-secondary btn-sm" aria-label="Bulan berikutnya">${lucideIcon('chevron-right', 16)}</button>
            </div>
          </div>
          <div class="holiday-cal-weekdays" aria-hidden="true">
            <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
          </div>
          <div class="holiday-cal-grid">
            ${cellsHtml.join('')}
          </div>
        </div>
      `;

      document.getElementById('cal-prev-month')?.addEventListener('click', () => {
        calMonth -= 1;
        if (calMonth < 0) { calMonth = 11; calYear -= 1; }
        renderHolidayCalendar();
      });
      document.getElementById('cal-next-month')?.addEventListener('click', () => {
        calMonth += 1;
        if (calMonth > 11) { calMonth = 0; calYear += 1; }
        renderHolidayCalendar();
      });
      document.getElementById('cal-today-btn')?.addEventListener('click', () => {
        calYear = witaTodayParts[0];
        calMonth = witaTodayParts[1] - 1;
        renderHolidayCalendar();
      });

      mount.querySelectorAll('.holiday-cal-cell').forEach((cell) => {
        cell.addEventListener('click', () => {
          const iso = cell.getAttribute('data-cal-iso');
          if (iso) openHolidayModal(iso);
        });
      });

      if (chipsMount) {
        if (currentExceptions.length === 0) {
          chipsMount.innerHTML = '<span class="meta-text">Belum ada tanggal libur khusus yang ditambahkan.</span>';
        } else {
          chipsMount.innerHTML = currentExceptions.map((ex) => `
            <button type="button" class="staleness-chip" data-jump-iso="${esc(ex.date)}" title="Klik untuk sunting tanggal ini">
              ${esc(formatDisplayDateId(ex.date))}: ${esc(ex.title)} (${ex.status === 'closed' ? 'Tutup' : 'Khusus'})
            </button>
          `).join('');
          chipsMount.querySelectorAll('[data-jump-iso]').forEach((chip) => {
            chip.addEventListener('click', () => {
              const iso = chip.getAttribute('data-jump-iso');
              if (!iso) return;
              const [y, m] = iso.split('-').map(Number);
              if (y && m) {
                calYear = y;
                calMonth = m - 1;
                renderHolidayCalendar();
              }
              openHolidayModal(iso);
            });
          });
        }
      }
    }

    renderHolidayCalendar();

    document.getElementById('hours-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const weekly = (h.weekly || []).map((row, idx) => {
        const card = moduleContent.querySelector(`.hours-day-row-card[data-day-idx="${idx}"]`);
        const isOpen = card ? card.getAttribute('data-day-open') === 'true' : Boolean(row.isOpen);
        return {
          ...row,
          isOpen,
          openTime: (document.getElementById(`hr-start-${idx}`)?.value || row.openTime || '08:00').trim(),
          closeTime: (document.getElementById(`hr-end-${idx}`)?.value || row.closeTime || '15:00').trim(),
          displayText: (document.getElementById(`hr-disp-${idx}`)?.value || (isOpen ? '08.00 s.d. 15.00 WITA' : 'Tutup')).trim()
        };
      });

      await saveDraftSection('hours', {
        ...h,
        weekly,
        holidayNote: document.getElementById('hr-holiday-note').value.trim(),
        exceptions: currentExceptions
      }, 'Draf jam operasional WITA dan kalender libur berhasil disimpan.');
    });
  }

  // Module A7: Locations (Collapsible + Drag-and-Drop + Automatic Google Maps Directions)
  // Module A6: Office & Branch Locations with Spacious Modal Card
  function renderLocationsModule(draft, readOnlyAttr) {
    let currentLocations = (draft.locations || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));

    moduleContent.innerHTML = `
      <div class="module-header">
        <div>
          <h1>Kelola Lokasi Kantor dan Gerai Samsat Palu</h1>
          <p class="meta-text" style="margin:0.25rem 0 0">Atur daftar gerai layanan, ubah urutan dengan seret kartu, atau klik Edit Detail untuk menyunting rincian alamat, tautan peta, dan foto lokasi pada popup.</p>
        </div>
        <button type="button" id="add-loc-btn" class="btn btn-accent" ${readOnlyAttr}>${lucideIcon('plus', 16)} Tambah Lokasi Baru</button>
      </div>
      <div id="admin-locations-list" class="repeater-list" style="margin-bottom:1.15rem"></div>
      <button type="button" id="save-locs-btn" class="btn btn-primary" ${readOnlyAttr}>${lucideIcon('save', 16)} Simpan Semua Draf Lokasi</button>
    `;

    const locsListEl = document.getElementById('admin-locations-list');
    const locDlg = document.getElementById('location-detail-dialog');
    const locForm = document.getElementById('location-detail-form');
    const locPhotoWrap = document.getElementById('dlg-loc-photo-wrap');
    let editingLocIdx = -1;
    let isNewLocDraft = false;

    function renderLocationsList() {
      if (!currentLocations.length) {
        locsListEl.innerHTML = `
          <div class="panel-card" style="text-align:center;padding:2rem 1rem;color:var(--text-secondary)">
            <p style="margin:0">Belum ada lokasi layanan. Klik tombol <strong>+ Tambah Lokasi Baru</strong> di atas untuk menambahkan.</p>
          </div>
        `;
        return;
      }

      locsListEl.innerHTML = currentLocations.map((loc, idx) => {
        const isPrimary = Boolean(loc.isPrimary);
        const thumbMedia = findMediaItem(loc.imageId);
        return `
          <div class="loc-admin-card" data-loc-idx="${idx}">
            <div class="loc-admin-card-main">
              <button type="button" class="aui-drag-handle" aria-label="Seret untuk mengubah urutan ${esc(loc.name)}" title="Klik, tahan, dan geser untuk mengubah urutan" ${!canEditDraft() ? 'disabled' : ''}>${lucideIcon('grip-vertical', 16)}</button>
              <span class="admin-svc-num num-tabular">${String(idx + 1).padStart(2, '0')}</span>
              <div class="admin-loc-thumb-wrap">
                <img src="${esc(thumbMedia.url || '/assets/placeholders/foto-lokasi.svg')}" alt="${esc(loc.name)}" loading="lazy">
              </div>
              <div class="admin-svc-title-group">
                <strong class="admin-svc-title-text">${esc(loc.name)}</strong>
                <span class="admin-svc-meta">${isPrimary ? 'Kantor Induk' : 'Gerai Layanan'} | ${esc(loc.address || 'Alamat belum diisi')}</span>
              </div>
            </div>
            <div class="admin-svc-actions-bar">
              <span class="admin-svc-status-badge ${isPrimary ? 'is-active' : 'is-inactive'}" style="${!isPrimary ? 'background:var(--bg-subtle);color:var(--brand-primary);border-color:var(--border-soft);' : ''}">${isPrimary ? 'Kantor Induk' : 'Gerai'}</span>
              <button type="button" class="btn btn-secondary btn-sm loc-edit-btn" data-idx="${idx}" aria-label="Edit detail ${esc(loc.name)}" title="Buka popup edit detail lokasi" ${readOnlyAttr}>${lucideIcon('edit-3', 14)} Edit Detail</button>
              <button type="button" class="btn btn-danger btn-sm loc-del-btn" data-idx="${idx}" aria-label="Hapus lokasi ${esc(loc.name)}" title="Hapus lokasi" ${readOnlyAttr}>${lucideIcon('trash-2', 14)}</button>
            </div>
          </div>
        `;
      }).join('');

      bindAnimateUiSortable(locsListEl, {
        itemSelector: '.loc-admin-card',
        onReorder: syncLocationsOrderFromDom
      });
    }

    function syncLocationsOrderFromDom() {
      const cards = Array.from(locsListEl.querySelectorAll('.loc-admin-card'));
      const newOrdered = [];
      cards.forEach((c, i) => {
        const oldIdx = Number(c.getAttribute('data-loc-idx'));
        if (currentLocations[oldIdx]) {
          newOrdered.push({ ...currentLocations[oldIdx], order: i + 1 });
        }
        const numEl = c.querySelector('.admin-svc-num');
        if (numEl) numEl.textContent = String(i + 1).padStart(2, '0');
      });
      currentLocations = newOrdered;
      cards.forEach((c, i) => c.setAttribute('data-loc-idx', String(i)));
    }

    function openLocationDetailDialog(idx, asNew = false) {
      if (!locDlg) return;
      editingLocIdx = idx;
      isNewLocDraft = asNew;
      const item = asNew
        ? {
          id: `lok-${Date.now().toString(36)}`,
          name: '',
          isPrimary: false,
          address: '',
          serviceScope: 'Pengesahan Pajak Tahunan',
          hoursNote: 'Senin sampai Jumat 08.00 s.d. 15.00 WITA',
          mapUrl: '',
          imageId: 'media-lokasi-default'
        }
        : currentLocations[idx];

      const titleEl = document.getElementById('location-detail-title');
      if (titleEl) {
        titleEl.textContent = asNew ? 'Tambah Lokasi Pelayanan Baru' : `Edit Detail: ${item.name || 'Lokasi Layanan'}`;
      }

      document.getElementById('dlg-loc-name').value = item.name || '';
      document.getElementById('dlg-loc-primary').value = item.isPrimary ? 'true' : 'false';
      document.getElementById('dlg-loc-addr').value = item.address || '';
      document.getElementById('dlg-loc-scope').value = item.serviceScope || '';
      document.getElementById('dlg-loc-hours').value = item.hoursNote || '';

      const autoUrl = buildGoogleMapsDirectionsUrl(item.name, item.address);
      const curMap = item.mapUrl || autoUrl;
      const mapInp = document.getElementById('dlg-loc-map');
      const mapPreview = document.getElementById('dlg-loc-map-preview');
      if (mapInp) mapInp.value = item.mapUrl || '';
      if (mapPreview) mapPreview.href = curMap;

      locPhotoWrap.innerHTML = renderMediaPickerField({
        selectId: 'dlg-loc-img',
        label: 'Foto Lokasi Layanan',
        selectedId: item.imageId || 'media-lokasi-default',
        defaultAlt: `Foto ${item.name || 'lokasi pelayanan Samsat Palu'}`,
        readOnlyAttr,
        cropDefault: '16:10'
      });
      bindMediaPickers(locPhotoWrap);
      enhanceAdminControls(locPhotoWrap);

      if (typeof locDlg.showModal === 'function') locDlg.showModal();
      else locDlg.setAttribute('open', 'true');
      document.getElementById('dlg-loc-name').focus();
    }

    function closeLocationDetailDialog() {
      if (!locDlg) return;
      if (typeof locDlg.close === 'function') locDlg.close();
      else locDlg.removeAttribute('open');
    }

    const locCloseBtn = document.getElementById('location-detail-close');
    if (locCloseBtn) locCloseBtn.onclick = closeLocationDetailDialog;

    const locCancelBtn = document.getElementById('location-detail-cancel');
    if (locCancelBtn) locCancelBtn.onclick = closeLocationDetailDialog;

    const genMapBtn = document.getElementById('dlg-loc-gen-map-btn');
    if (genMapBtn) {
      genMapBtn.onclick = () => {
        const nameVal = document.getElementById('dlg-loc-name').value.trim();
        const addrVal = document.getElementById('dlg-loc-addr').value.trim();
        const autoUrl = buildGoogleMapsDirectionsUrl(nameVal, addrVal);
        const mapInp = document.getElementById('dlg-loc-map');
        const mapPreview = document.getElementById('dlg-loc-map-preview');
        if (mapInp) mapInp.value = autoUrl;
        if (mapPreview) mapPreview.href = autoUrl;
        showFeedback('Tautan Google Maps berhasil dibuat otomatis dari nama dan alamat gerai.', 'info');
      };
    }

    const dlgMapInp = document.getElementById('dlg-loc-map');
    if (dlgMapInp) {
      dlgMapInp.oninput = (e) => {
        const val = e.target.value.trim();
        const mapPreview = document.getElementById('dlg-loc-map-preview');
        if (mapPreview) {
          if (val) {
            mapPreview.href = val;
          } else {
            const nameVal = document.getElementById('dlg-loc-name').value.trim();
            const addrVal = document.getElementById('dlg-loc-addr').value.trim();
            mapPreview.href = buildGoogleMapsDirectionsUrl(nameVal, addrVal);
          }
        }
      };
    }

    if (locForm) {
      locForm.onsubmit = (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('dlg-loc-name').value.trim();
        const addrVal = document.getElementById('dlg-loc-addr').value.trim();
        if (!nameVal) {
          document.getElementById('dlg-loc-name').focus();
          return;
        }
        if (!addrVal) {
          document.getElementById('dlg-loc-addr').focus();
          return;
        }
        const existing = !isNewLocDraft && currentLocations[editingLocIdx] ? currentLocations[editingLocIdx] : {};
        const isPrimary = document.getElementById('dlg-loc-primary').value === 'true';

        if (isPrimary) {
          currentLocations.forEach((l) => { l.isPrimary = false; });
        }

        const mapInpVal = document.getElementById('dlg-loc-map').value.trim();
        const updatedLoc = {
          id: existing.id || `lok-${Date.now().toString(36)}`,
          order: isNewLocDraft ? currentLocations.length + 1 : (existing.order || editingLocIdx + 1),
          isPrimary,
          name: nameVal,
          address: addrVal,
          serviceScope: document.getElementById('dlg-loc-scope').value.trim() || 'Pengesahan Pajak Tahunan',
          hoursNote: document.getElementById('dlg-loc-hours').value.trim() || 'Senin sampai Jumat 08.00 s.d. 15.00 WITA',
          mapUrl: mapInpVal || buildGoogleMapsDirectionsUrl(nameVal, addrVal),
          imageId: document.getElementById('dlg-loc-img')?.value || 'media-lokasi-default'
        };

        if (isNewLocDraft) currentLocations.push(updatedLoc);
        else currentLocations[editingLocIdx] = updatedLoc;

        closeLocationDetailDialog();
        renderLocationsList();
        showFeedback(`Rincian lokasi "${nameVal}" diterapkan ke draf. Klik tombol "Simpan Semua Draf Lokasi" di bawah untuk mempublikasikan.`, 'success');
      };
    }

    locsListEl.onclick = async (e) => {
      const editBtn = e.target.closest('.loc-edit-btn');
      if (editBtn) {
        openLocationDetailDialog(Number(editBtn.getAttribute('data-idx')), false);
        return;
      }
      const delBtn = e.target.closest('.loc-del-btn');
      if (delBtn) {
        const idx = Number(delBtn.getAttribute('data-idx'));
        const locItem = currentLocations[idx];
        const res = await confirmAdminAction({
          title: 'Hapus Lokasi Pelayanan?',
          message: `Apakah Anda yakin ingin menghapus "${locItem?.name || 'lokasi ini'}" dari draf daftar lokasi?`,
          confirmLabel: 'Ya, Hapus Lokasi',
          variant: 'danger'
        });
        if (!res.confirmed) return;
        currentLocations.splice(idx, 1);
        currentLocations.forEach((l, i) => { l.order = i + 1; });
        renderLocationsList();
        showFeedback(`Lokasi "${locItem?.name || ''}" dihapus dari draf.`, 'info');
      }
    };

    document.getElementById('add-loc-btn').onclick = () => openLocationDetailDialog(-1, true);

    document.getElementById('save-locs-btn').onclick = async () => {
      syncLocationsOrderFromDom();
      await saveDraftSection('locations', currentLocations, 'Draf lokasi kantor dan gerai berhasil disimpan.');
    };

    renderLocationsList();
  }

  // Module A4: Profile, Vision, Mission, Org Structure
  function renderProfileModule(draft, readOnlyAttr) {
    const p = draft.profile;
    let currentMissions = (p.missions || []).slice();
    let currentOrgRoles = (p.orgRoles || []).map((r, i) => ({
      id: r.id || `pejabat-${i + 1}`,
      role: r.role || '',
      holder: r.holder || '',
      photoId: r.photoId || 'media-foto-pejabat',
      tagline: r.tagline || '',
      bio: r.bio || '',
      orgExperience: r.orgExperience || '',
      careerHistory: r.careerHistory || '',
      philosophy: r.philosophy || '',
      initiatives: r.initiatives || ''
    }));

    moduleContent.innerHTML = `
      <div class="module-header">
        <h1>Profil Instansi, Visi, Misi, dan Struktur Organisasi</h1>
      </div>
      <form id="profile-form" class="panel-card">
        <div class="field-group">
          <label for="prof-aboutTitle">Judul Profil</label>
          <input type="text" id="prof-aboutTitle" value="${esc(p.aboutTitle)}" ${readOnlyAttr}>
        </div>
        <div class="field-group">
          <label for="prof-aboutText">Tentang Instansi</label>
          <textarea id="prof-aboutText" ${readOnlyAttr}>${esc(p.aboutText)}</textarea>
        </div>
        <div class="field-group">
          <label for="prof-vision">Visi</label>
          <textarea id="prof-vision" ${readOnlyAttr}>${esc(p.vision)}</textarea>
        </div>

        <div class="repeater-section">
          <div class="repeater-header">
            <h3>Daftar Misi Instansi (<span id="prof-missions-count">${currentMissions.length}</span> poin)</h3>
            <div class="repeater-actions-row">
              <button type="button" id="open-missions-modal-btn" class="btn btn-accent btn-sm" ${readOnlyAttr}>Kelola Misi di Popup Card</button>
            </div>
          </div>
          <div id="prof-missions-preview" class="summary-preview-grid"></div>
        </div>

        ${renderMediaPickerField({
      selectId: 'prof-orgImg',
      label: 'Gambar Bagan Struktur Organisasi',
      selectedId: p.orgStructureImageId,
      defaultAlt: 'Bagan struktur organisasi Samsat Palu',
      readOnlyAttr,
      cropDefault: 'free'
    })}

        <div class="repeater-section">
          <div class="repeater-header">
            <h3>Daftar Jabatan dan Profil Pejabat (<span id="prof-roles-count">${currentOrgRoles.length}</span> jabatan)</h3>
            <div class="repeater-actions-row">
              <button type="button" id="add-direct-role-btn" class="btn btn-accent btn-sm" ${readOnlyAttr}>+ Tambah Jabatan</button>
              <button type="button" id="open-roles-modal-btn" class="btn btn-secondary btn-sm" ${readOnlyAttr}>Kelola Jabatan (Popup)</button>
            </div>
          </div>
          <div id="prof-roles-preview" class="repeater-list"></div>
        </div>

        <button type="submit" class="btn btn-primary" ${readOnlyAttr}>Simpan Draf Profil</button>
      </form>
    `;
    bindMediaPickers(moduleContent);

    const missionsPreviewEl = document.getElementById('prof-missions-preview');
    const missionsCountEl = document.getElementById('prof-missions-count');
    const rolesPreviewEl = document.getElementById('prof-roles-preview');
    const rolesCountEl = document.getElementById('prof-roles-count');

    const missionsDlg = document.getElementById('missions-dialog');
    const missionsModalList = document.getElementById('missions-modal-list');
    const newMissionInput = document.getElementById('new-mission-input');

    const rolesDlg = document.getElementById('org-roles-dialog');
    const rolesModalList = document.getElementById('org-roles-modal-list');

    const offDlg = document.getElementById('official-detail-dialog');
    const offForm = document.getElementById('official-detail-form');
    const offPhotoWrap = document.getElementById('off-photo-picker-wrap');
    const offBackBtn = document.getElementById('official-detail-back');

    function renderMissionsPreview() {
      if (missionsCountEl) missionsCountEl.textContent = String(currentMissions.length);
      if (!currentMissions.length) {
        missionsPreviewEl.innerHTML = '<div class="state-box"><p class="meta-text" style="margin:0">Belum ada poin misi. Klik tombol <strong>Kelola Misi di Popup Card</strong> untuk menambah.</p></div>';
        return;
      }
      missionsPreviewEl.innerHTML = currentMissions.map((m, idx) => `
        <div class="mission-preview-card">
          <div class="mission-preview-text">
            <span class="repeater-badge num-tabular">${String(idx + 1).padStart(2, '0')}</span>
            <span>${esc(m)}</span>
          </div>
          <div class="repeater-actions-row">
            <button type="button" class="btn btn-secondary btn-sm prof-mission-edit" data-idx="${idx}" ${readOnlyAttr}>Edit</button>
            <button type="button" class="btn btn-danger btn-sm prof-mission-del" data-idx="${idx}" ${readOnlyAttr}>Hapus</button>
          </div>
        </div>
      `).join('');
    }

    function refreshRoleIndices(containerEl) {
      Array.from(containerEl.querySelectorAll('.pejabat-admin-card')).forEach((card, i) => {
        const editBtn = card.querySelector('.prof-role-detail, .modal-role-edit');
        const delBtn = card.querySelector('.prof-role-del, .modal-role-del');
        if (editBtn) editBtn.setAttribute('data-idx', String(i));
        if (delBtn) delBtn.setAttribute('data-idx', String(i));
      });
    }

    function syncOrgRolesFromDom(containerEl) {
      const byId = new Map(currentOrgRoles.map((item) => [item.id, item]));
      const ordered = Array.from(containerEl.querySelectorAll('.pejabat-admin-card'))
        .map((card) => byId.get(card.getAttribute('data-role-id')))
        .filter(Boolean);
      if (ordered.length === currentOrgRoles.length) {
        currentOrgRoles = ordered;
        refreshRoleIndices(containerEl);
        if (containerEl === rolesModalList) renderRolesPreview();
      }
    }

    function renderRolesPreview() {
      if (rolesCountEl) rolesCountEl.textContent = String(currentOrgRoles.length);
      if (!currentOrgRoles.length) {
        rolesPreviewEl.innerHTML = '<div class="state-box"><p class="meta-text" style="margin:0">Belum ada jabatan struktural. Klik <strong>+ Tambah Jabatan</strong> untuk menambahkan pejabat.</p></div>';
        return;
      }
      rolesPreviewEl.innerHTML = currentOrgRoles.map((r, idx) => {
        const photo = findMediaItem(r.photoId || 'media-foto-pejabat');
        return `
          <article class="pejabat-admin-card has-drag-handle" data-role-id="${esc(r.id)}">
            <button type="button" class="aui-drag-handle" aria-label="Seret untuk mengubah urutan ${esc(r.role || 'pejabat')}" title="Klik, tahan, dan geser untuk mengubah urutan" ${!canEditDraft() ? 'disabled' : ''}>${lucideIcon('grip-vertical', 16)}</button>
            <div class="pejabat-admin-thumb">
              <img src="${esc(photo.url)}" alt="${esc(r.holder || r.role)}">
            </div>
            <div class="pejabat-admin-info">
              <span class="repeater-badge" style="align-self:flex-start">${esc(r.role || 'Jabatan Baru')}</span>
              <strong>${esc(r.holder || 'Belum diisi nama pejabat')}</strong>
              <span class="meta-text">${esc(r.tagline || 'Klik Edit Detail Pejabat untuk mengisi deskripsi dan riwayat.')}</span>
            </div>
            <div class="pejabat-admin-actions">
              <button type="button" class="btn btn-accent btn-sm prof-role-detail" data-idx="${idx}" ${readOnlyAttr}>Edit Detail Pejabat</button>
              <button type="button" class="btn btn-danger btn-sm prof-role-del" data-idx="${idx}" ${readOnlyAttr}>Hapus</button>
            </div>
          </article>
        `;
      }).join('');
    }

    bindAnimateUiSortable(rolesPreviewEl, {
      itemSelector: 'article.pejabat-admin-card',
      onReorder: () => syncOrgRolesFromDom(rolesPreviewEl)
    });

    let modalMissions = [];
    function refreshMissionBadges() {
      Array.from(missionsModalList.querySelectorAll('article.repeater-card')).forEach((card, i) => {
        const badge = card.querySelector('.repeater-badge');
        if (badge) badge.textContent = `Misi ${String(i + 1).padStart(2, '0')}`;
      });
    }

    function renderMissionsModalList(focusIdx = -1) {
      if (!modalMissions.length) {
        missionsModalList.innerHTML = '<div class="state-box"><p class="meta-text" style="margin:0">Belum ada poin misi. Ketik misi baru pada kolom di atas lalu klik <strong>+ Tambah Misi</strong>.</p></div>';
        return;
      }
      missionsModalList.innerHTML = modalMissions.map((m, idx) => `
        <article class="repeater-card">
          <div class="repeater-card-top">
            <div class="repeater-card-head-left">
              <button type="button" class="aui-drag-handle" aria-label="Seret untuk mengubah urutan Misi ${idx + 1}" title="Klik, tahan, dan geser untuk mengubah urutan">${lucideIcon('grip-vertical', 16)}</button>
              <span class="repeater-badge num-tabular">Misi ${String(idx + 1).padStart(2, '0')}</span>
            </div>
            <div class="repeater-actions-row">
              <button type="button" class="btn btn-danger btn-sm modal-mis-del" data-idx="${idx}">${lucideIcon('trash-2', 14)} Hapus</button>
            </div>
          </div>
          <label class="sr-only" for="modal-mis-inp-${idx}">Teks Misi ${idx + 1}</label>
          <input type="text" id="modal-mis-inp-${idx}" class="modal-mis-input" data-idx="${idx}" value="${esc(m)}" placeholder="Tulis poin misi pelayanan...">
        </article>
      `).join('');
      if (focusIdx >= 0) {
        const inputs = missionsModalList.querySelectorAll('.modal-mis-input');
        const target = inputs[focusIdx];
        if (target) target.focus();
      }
    }

    function openMissionsModal(focusIdx = -1) {
      if (!missionsDlg) return;
      modalMissions = currentMissions.slice();
      if (newMissionInput) newMissionInput.value = '';
      renderMissionsModalList(focusIdx);
      if (typeof missionsDlg.showModal === 'function') missionsDlg.showModal();
      else missionsDlg.setAttribute('open', 'true');
      if (focusIdx < 0 && newMissionInput) newMissionInput.focus();
    }

    function closeMissionsModal() {
      if (!missionsDlg) return;
      if (typeof missionsDlg.close === 'function') missionsDlg.close();
      else missionsDlg.removeAttribute('open');
    }

    function syncModalMissionsFromInputs() {
      const inputs = Array.from(missionsModalList.querySelectorAll('.modal-mis-input'));
      if (inputs.length > 0 || missionsModalList.querySelector('article.repeater-card')) {
        modalMissions = inputs.map((inp) => inp.value);
      }
    }

    bindAnimateUiSortable(missionsModalList, {
      itemSelector: 'article.repeater-card',
      onReorder: () => {
        refreshMissionBadges();
        syncModalMissionsFromInputs();
      }
    });

    missionsModalList.onclick = (e) => {
      syncModalMissionsFromInputs();
      const delBtn = e.target.closest('.modal-mis-del');
      if (delBtn) {
        const cards = Array.from(missionsModalList.querySelectorAll('article.repeater-card'));
        const idx = cards.indexOf(delBtn.closest('article.repeater-card'));
        if (idx >= 0) {
          modalMissions.splice(idx, 1);
          renderMissionsModalList();
        }
      }
    };

    const addMissionFromBar = () => {
      syncModalMissionsFromInputs();
      const txt = newMissionInput ? newMissionInput.value.trim() : '';
      if (!txt) {
        modalMissions.push('');
        renderMissionsModalList(modalMissions.length - 1);
        return;
      }
      modalMissions.push(txt);
      if (newMissionInput) newMissionInput.value = '';
      renderMissionsModalList();
      if (newMissionInput) newMissionInput.focus();
    };

    document.getElementById('add-mission-modal-btn').onclick = addMissionFromBar;
    if (newMissionInput) {
      newMissionInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addMissionFromBar();
        }
      };
    }
    document.getElementById('missions-dialog-close').onclick = closeMissionsModal;
    document.getElementById('missions-dialog-cancel').onclick = closeMissionsModal;
    document.getElementById('missions-dialog-apply').onclick = () => {
      syncModalMissionsFromInputs();
      currentMissions = modalMissions.map((s) => s.trim()).filter(Boolean);
      renderMissionsPreview();
      closeMissionsModal();
    };

    function renderRolesModalList() {
      if (!currentOrgRoles.length) {
        rolesModalList.innerHTML = '<div class="state-box"><p class="meta-text" style="margin:0">Belum ada jabatan struktural. Klik <strong>+ Tambah Jabatan Baru</strong>.</p></div>';
        return;
      }
      rolesModalList.innerHTML = currentOrgRoles.map((r, idx) => {
        const photo = findMediaItem(r.photoId || 'media-foto-pejabat');
        return `
          <article class="pejabat-admin-card has-drag-handle" data-role-id="${esc(r.id)}">
            <button type="button" class="aui-drag-handle" aria-label="Seret untuk mengubah urutan ${esc(r.role || 'pejabat')}" title="Klik, tahan, dan geser untuk mengubah urutan">${lucideIcon('grip-vertical', 16)}</button>
            <div class="pejabat-admin-thumb">
              <img src="${esc(photo.url)}" alt="${esc(r.holder || r.role)}">
            </div>
            <div class="pejabat-admin-info">
              <span class="repeater-badge" style="align-self:flex-start">${esc(r.role || 'Jabatan Baru')}</span>
              <strong>${esc(r.holder || 'Belum diisi nama pejabat')}</strong>
              <span class="meta-text">${esc(r.tagline || 'Belum ada deskripsi singkat')}</span>
            </div>
            <div class="pejabat-admin-actions">
              <button type="button" class="btn btn-accent btn-sm modal-role-edit" data-idx="${idx}">Edit Detail Pejabat</button>
              <button type="button" class="btn btn-danger btn-sm modal-role-del" data-idx="${idx}">${lucideIcon('trash-2', 14)} Hapus</button>
            </div>
          </article>
        `;
      }).join('');
    }

    bindAnimateUiSortable(rolesModalList, {
      itemSelector: 'article.pejabat-admin-card',
      onReorder: () => syncOrgRolesFromDom(rolesModalList)
    });

    function openRolesModal() {
      if (!rolesDlg) return;
      renderRolesModalList();
      if (typeof rolesDlg.showModal === 'function') rolesDlg.showModal();
      else rolesDlg.setAttribute('open', 'true');
    }

    function closeRolesModal() {
      if (!rolesDlg) return;
      if (typeof rolesDlg.close === 'function') rolesDlg.close();
      else rolesDlg.removeAttribute('open');
      renderRolesPreview();
    }

    let editingRoleIdx = -1;
    let isNewRoleDraft = false;

    function openOfficialDetailDialog(idx, asNew = false) {
      if (!offDlg) return;
      editingRoleIdx = idx;
      isNewRoleDraft = asNew;
      const item = asNew
        ? {
          id: `pejabat-${Date.now().toString(36)}`,
          role: '',
          holder: '',
          photoId: 'media-foto-pejabat',
          tagline: '',
          bio: ''
        }
        : currentOrgRoles[idx];

      document.getElementById('off-role').value = item.role || '';
      document.getElementById('off-holder').value = item.holder || '';
      document.getElementById('off-tagline').value = item.tagline || '';
      document.getElementById('off-bio').value = item.bio || item.careerHistory || item.philosophy || '';

      offPhotoWrap.innerHTML = renderMediaPickerField({
        selectId: 'off-photo',
        label: 'Foto Profil Pejabat',
        selectedId: item.photoId || 'media-foto-pejabat',
        defaultAlt: `Foto resmi ${item.holder || item.role || 'Pejabat Samsat Palu'}`,
        readOnlyAttr,
        cropDefault: 'free'
      });
      bindMediaPickers(offPhotoWrap);
      enhanceAdminControls(offPhotoWrap);

      if (offBackBtn) {
        offBackBtn.textContent = rolesDlg && rolesDlg.open ? 'Kembali ke Daftar Jabatan' : 'Batal';
      }

      if (typeof offDlg.showModal === 'function') offDlg.showModal();
      else offDlg.setAttribute('open', 'true');
      document.getElementById('off-role').focus();
    }

    function closeOfficialDetailDialog() {
      if (!offDlg) return;
      if (typeof offDlg.close === 'function') offDlg.close();
      else offDlg.removeAttribute('open');
    }

    document.getElementById('official-detail-close').onclick = closeOfficialDetailDialog;
    if (offBackBtn) offBackBtn.onclick = closeOfficialDetailDialog;

    offForm.onsubmit = (e) => {
      e.preventDefault();
      const roleVal = document.getElementById('off-role').value.trim();
      const holderVal = document.getElementById('off-holder').value.trim();
      if (!roleVal) {
        document.getElementById('off-role').focus();
        return;
      }
      const existing = !isNewRoleDraft && currentOrgRoles[editingRoleIdx] ? currentOrgRoles[editingRoleIdx] : {};
      const updatedRole = {
        id: existing.id || `pejabat-${Date.now().toString(36)}`,
        role: roleVal,
        holder: holderVal || '[DATA NAMA PEJABAT DIISI PETUGAS]',
        photoId: document.getElementById('off-photo')?.value || 'media-foto-pejabat',
        tagline: document.getElementById('off-tagline').value.trim() || `Mengenal Lebih Dekat ${roleVal}`,
        bio: document.getElementById('off-bio').value.trim()
      };
      if (isNewRoleDraft) currentOrgRoles.push(updatedRole);
      else currentOrgRoles[editingRoleIdx] = updatedRole;

      closeOfficialDetailDialog();
      if (rolesDlg && rolesDlg.open) renderRolesModalList();
      renderRolesPreview();
    };

    rolesModalList.onclick = (e) => {
      const editBtn = e.target.closest('.modal-role-edit');
      if (editBtn) {
        openOfficialDetailDialog(Number(editBtn.getAttribute('data-idx')), false);
        return;
      }
      const delBtn = e.target.closest('.modal-role-del');
      if (delBtn) {
        const idx = Number(delBtn.getAttribute('data-idx'));
        currentOrgRoles.splice(idx, 1);
        renderRolesModalList();
        renderRolesPreview();
      }
    };

    document.getElementById('add-org-role-modal-btn').onclick = () => openOfficialDetailDialog(-1, true);
    document.getElementById('org-roles-dialog-close').onclick = closeRolesModal;
    document.getElementById('org-roles-dialog-done').onclick = closeRolesModal;

    document.getElementById('open-missions-modal-btn').addEventListener('click', () => openMissionsModal());
    document.getElementById('open-roles-modal-btn').addEventListener('click', () => openRolesModal());
    document.getElementById('add-direct-role-btn').addEventListener('click', () => openOfficialDetailDialog(-1, true));

    missionsPreviewEl.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.prof-mission-edit');
      if (editBtn) {
        openMissionsModal(Number(editBtn.getAttribute('data-idx')));
        return;
      }
      const delBtn = e.target.closest('.prof-mission-del');
      if (delBtn) {
        const idx = Number(delBtn.getAttribute('data-idx'));
        currentMissions.splice(idx, 1);
        renderMissionsPreview();
      }
    });

    rolesPreviewEl.addEventListener('click', (e) => {
      const detailBtn = e.target.closest('.prof-role-detail');
      if (detailBtn) {
        openOfficialDetailDialog(Number(detailBtn.getAttribute('data-idx')), false);
        return;
      }
      const delBtn = e.target.closest('.prof-role-del');
      if (delBtn) {
        const idx = Number(delBtn.getAttribute('data-idx'));
        currentOrgRoles.splice(idx, 1);
        renderRolesPreview();
      }
    });

    renderMissionsPreview();
    renderRolesPreview();

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveDraftSection('profile', {
        ...p,
        aboutTitle: document.getElementById('prof-aboutTitle').value.trim(),
        aboutText: document.getElementById('prof-aboutText').value.trim(),
        vision: document.getElementById('prof-vision').value.trim(),
        missions: currentMissions.filter(Boolean),
        orgStructureImageId: document.getElementById('prof-orgImg').value,
        orgRoles: currentOrgRoles
      });
    });
  }

  // Module A8: Contacts & Complaints (Synchronized with Public Website)
  function renderContactsModule(draft, readOnlyAttr) {
    const c = draft.contacts;

    moduleContent.innerHTML = `
      <div class="module-header">
        <div>
          <h1>Kontak Resmi dan Pengaduan Masyarakat</h1>
          <p class="meta-text" style="margin:0.25rem 0 0">Data pada panel ini tersinkronisasi langsung dengan bagian Saluran Komunikasi Resmi dan Formulir Pengaduan di situs publik.</p>
        </div>
      </div>
      <form id="contacts-form" class="panel-card">
        <h2>Kanal Utama dan Media Sosial Resmi</h2>
        <div class="grid-2">
          <div class="field-group">
            <label for="ct-wa">Nomor WhatsApp</label>
            <input type="text" id="ct-wa" value="${esc(c.whatsappNumber)}" ${readOnlyAttr}>
          </div>
          <div class="field-group">
            <label for="ct-wa-url">Tautan WhatsApp (wa.me)</label>
            <input type="url" id="ct-wa-url" value="${esc(c.whatsappUrl)}" ${readOnlyAttr}>
          </div>
          <div class="field-group">
            <label for="ct-phone">Nomor Telepon</label>
            <input type="text" id="ct-phone" value="${esc(c.phoneNumber)}" ${readOnlyAttr}>
          </div>
          <div class="field-group">
            <label for="ct-email">Email Resmi</label>
            <input type="email" id="ct-email" value="${esc(c.email)}" ${readOnlyAttr}>
          </div>
          <div class="field-group">
            <label for="ct-ig">Akun Instagram</label>
            <input type="text" id="ct-ig" value="${esc(c.instagramHandle)}" ${readOnlyAttr}>
          </div>
          <div class="field-group">
            <label for="ct-ig-url">Tautan Instagram</label>
            <input type="url" id="ct-ig-url" value="${esc(c.instagramUrl)}" ${readOnlyAttr}>
          </div>
          <div class="field-group">
            <label for="ct-tt">Akun TikTok</label>
            <input type="text" id="ct-tt" value="${esc(c.tiktokHandle)}" ${readOnlyAttr}>
          </div>
          <div class="field-group">
            <label for="ct-tt-url">Tautan TikTok</label>
            <input type="url" id="ct-tt-url" value="${esc(c.tiktokUrl)}" ${readOnlyAttr}>
          </div>
          <div class="field-group">
            <label for="ct-fb">Nama Halaman Facebook</label>
            <input type="text" id="ct-fb" value="${esc(c.facebookName)}" ${readOnlyAttr}>
          </div>
          <div class="field-group">
            <label for="ct-fb-url">Tautan Facebook</label>
            <input type="url" id="ct-fb-url" value="${esc(c.facebookUrl)}" ${readOnlyAttr}>
          </div>
        </div>

        <div class="field-group">
          <label for="ct-comp-title">Judul Blok Pengaduan</label>
          <input type="text" id="ct-comp-title" value="${esc(c.complaintTitle)}" ${readOnlyAttr}>
        </div>
        <div class="field-group">
          <label for="ct-comp-text">Teks Penjelasan Pengaduan dan Saran</label>
          <textarea id="ct-comp-text" rows="3" ${readOnlyAttr}>${esc(c.complaintText)}</textarea>
        </div>
        <button type="submit" class="btn btn-primary" ${readOnlyAttr}>${lucideIcon('save', 16)} Simpan Draf Kontak</button>
      </form>
    `;

    document.getElementById('contacts-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const phone = document.getElementById('ct-phone').value.trim();

      await saveDraftSection('contacts', {
        whatsappNumber: document.getElementById('ct-wa').value.trim(),
        whatsappUrl: document.getElementById('ct-wa-url').value.trim(),
        phoneNumber: phone,
        phoneUrl: `tel:+62${phone.replace(/^0/, '').replace(/[^0-9]/g, '')}`,
        email: document.getElementById('ct-email').value.trim(),
        instagramHandle: document.getElementById('ct-ig').value.trim(),
        instagramUrl: document.getElementById('ct-ig-url').value.trim(),
        tiktokHandle: document.getElementById('ct-tt').value.trim(),
        tiktokUrl: document.getElementById('ct-tt-url').value.trim(),
        facebookName: document.getElementById('ct-fb').value.trim(),
        facebookUrl: document.getElementById('ct-fb-url').value.trim(),
        complaintTitle: document.getElementById('ct-comp-title').value.trim(),
        complaintText: document.getElementById('ct-comp-text').value.trim()
      }, 'Draf kontak resmi dan pengaduan berhasil diperbarui.');
    });
  }

  // Module A9: Berita, Event, & Pengumuman Carousel (Collapsible + Drag-and-Drop)
  function renderAnnouncementsModule(draft, readOnlyAttr) {
    const items = Array.isArray(draft.announcements) ? draft.announcements : [];
    const seo = draft.seo || {};
    const sectionTitle = seo.sectionTitles?.announcements || 'Berita, Event, dan Pengumuman';
    let annUidSeq = 0;

    function formatAnnDateRange(startDate, endDate) {
      if (startDate && endDate) return `${startDate} s.d. ${endDate}`;
      if (startDate) return `Mulai ${startDate}`;
      if (endDate) return `Hingga ${endDate}`;
      return 'Tayang sepanjang waktu';
    }

    function annCardHtml(item = {}, idx = 0, isOpen = false) {
      annUidSeq += 1;
      const uid = `ann-${annUidSeq}`;
      const isEnabled = item.enabled !== false;
      const categoryText = item.category || 'Pengumuman';
      const rangeText = formatAnnDateRange(item.startDate || '', item.endDate || '');
      const titleText = item.title || 'Slide Pengumuman Baru';
      return `
        <details class="admin-svc-details ann-slide-card" data-ann-id="${esc(item.id || uid)}" ${isOpen ? 'open' : ''}>
          <summary class="admin-svc-summary">
            <button type="button" class="aui-drag-handle" aria-label="Seret untuk mengubah urutan slide ${esc(titleText)}" title="Klik, tahan, dan geser untuk mengubah urutan" ${!canEditDraft() ? 'disabled' : ''}>${lucideIcon('grip-vertical', 16)}</button>
            <span class="admin-svc-num num-tabular">${String(idx + 1).padStart(2, '0')}</span>
            <span class="admin-svc-title-group">
              <strong class="admin-svc-title-text">${esc(titleText)}</strong>
              <span class="admin-svc-meta num-tabular">${esc(categoryText)} | ${esc(rangeText)}</span>
            </span>
            <span class="admin-svc-actions-bar">
              <span class="admin-svc-status-badge ${isEnabled ? 'is-active' : 'is-inactive'}">${isEnabled ? 'Aktif' : 'Nonaktif'}</span>
              <button type="button" class="btn btn-danger btn-sm ann-remove" aria-label="Hapus slide ${esc(titleText)}" title="Hapus slide" ${readOnlyAttr}>${lucideIcon('trash-2', 14)}</button>
              <span class="admin-svc-chevron" aria-hidden="true">${lucideIcon('chevron-down', 18)}</span>
            </span>
          </summary>
          <div class="admin-svc-body">
            <div class="grid-2">
              <div class="field-group">
                <label for="ann-enabled-${uid}">Status Tampil Carousel</label>
                <select id="ann-enabled-${uid}" class="ann-enabled-input" ${readOnlyAttr}>
                  <option value="true" ${isEnabled ? 'selected' : ''}>Aktif (Tampil di Situs Publik)</option>
                  <option value="false" ${!isEnabled ? 'selected' : ''}>Nonaktif (Sembunyikan)</option>
                </select>
              </div>
              <div class="field-group">
                <label for="ann-cat-${uid}">Kategori Label</label>
                <select id="ann-cat-${uid}" class="ann-category-input" ${readOnlyAttr}>
                  ${['Pengumuman', 'Event Layanan', 'Informasi Pajak', 'Jadwal Khusus'].map((cat) => `<option value="${esc(cat)}" ${categoryText === cat ? 'selected' : ''}>${esc(cat)}</option>`).join('')}
                </select>
              </div>
              <div class="field-group">
                <label for="ann-start-${uid}">Tanggal Mulai Tayang</label>
                <input type="date" id="ann-start-${uid}" class="ann-start-input" value="${esc(item.startDate || '')}" ${readOnlyAttr}>
              </div>
              <div class="field-group">
                <label for="ann-end-${uid}">Tanggal Berakhir Tayang</label>
                <input type="date" id="ann-end-${uid}" class="ann-end-input" value="${esc(item.endDate || '')}" ${readOnlyAttr}>
              </div>
            </div>
            <div class="field-group">
              <label for="ann-title-${uid}">Judul Berita / Event / Pengumuman</label>
              <input type="text" id="ann-title-${uid}" class="ann-title-input" value="${esc(item.title || '')}" placeholder="Contoh: Pelayanan Samsat Palu Tetap Buka Hari Sabtu" ${readOnlyAttr}>
            </div>
            <div class="field-group">
              <label for="ann-msg-${uid}">Deskripsi Singkat Carousel</label>
              <textarea id="ann-msg-${uid}" class="ann-msg-input" rows="3" placeholder="Tuliskan detail berita, jadwal event, atau pengumuman untuk warga..." ${readOnlyAttr}>${esc(item.message || '')}</textarea>
            </div>
            ${renderMediaPickerField({
        selectId: `ann-img-${uid}`,
        label: 'Foto / Banner Event Carousel',
        selectedId: item.imageId || 'media-hero-kantor',
        defaultAlt: `Foto ${item.title || 'berita dan pengumuman Samsat Palu'}`,
        readOnlyAttr,
        cropDefault: 'free'
      })}
            <div class="field-group">
              <label for="ann-fit-${uid}">Gaya Tampilan Foto di Carousel</label>
              <select id="ann-fit-${uid}" class="ann-fit-input" ${readOnlyAttr}>
                <option value="cover" ${item.imageFit !== 'contain' ? 'selected' : ''}>Penuh Bingkai (Cover - cocok untuk foto pemandangan atau dokumentasi kantor)</option>
                <option value="contain" ${item.imageFit === 'contain' ? 'selected' : ''}>Muat Utuh (Fit / Bebas Potong - cocok untuk logo 1:1, flyer, infografis)</option>
              </select>
              <small class="field-hint" style="display:block;margin-top:0.35rem;font-size:0.8rem;color:var(--text-secondary);">
                Pilih <strong>Muat Utuh (Fit)</strong> agar gambar berasio 1:1 (persegi) atau poster vertikal tampil lengkap tanpa ada teks atau logo yang terpotong.
              </small>
            </div>
            <div class="grid-2" style="margin-bottom:0">
              <div class="field-group" style="margin-bottom:0">
                <label for="ann-cta-label-${uid}">Teks Tombol Tautan (Opsional)</label>
                <input type="text" id="ann-cta-label-${uid}" class="ann-cta-label-input" value="${esc(item.ctaLabel || '')}" placeholder="Contoh: Lihat Jam Layanan" ${readOnlyAttr}>
              </div>
              <div class="field-group" style="margin-bottom:0">
                <label for="ann-cta-url-${uid}">Tujuan Tautan / URL (Opsional)</label>
                <input type="text" id="ann-cta-url-${uid}" class="ann-cta-url-input" value="${esc(item.ctaUrl || '')}" placeholder="Contoh: #jam-layanan atau https://..." ${readOnlyAttr}>
              </div>
            </div>
          </div>
        </details>
      `;
    }

    moduleContent.innerHTML = `
      <div class="module-header">
        <div>
          <h1>Berita, Event, dan Pengumuman Carousel</h1>
          <p class="meta-text" style="margin:0.25rem 0 0">Klik kartu slide untuk menyunting isi atau seret pegangan di kiri untuk mengatur ulang urutan carousel di halaman publik.</p>
        </div>
        <button type="button" id="add-ann-btn" class="btn btn-accent" ${readOnlyAttr}>${lucideIcon('plus', 16)} Tambah Slide Carousel</button>
      </div>

      <form id="announcements-form" class="panel-card">
        <div class="field-group">
          <label for="ann-section-title">Judul Seksi Carousel di Halaman Publik</label>
          <input type="text" id="ann-section-title" value="${esc(sectionTitle)}" placeholder="Berita, Event, dan Pengumuman" ${readOnlyAttr}>
        </div>

        <div id="ann-cards-list" class="repeater-list" style="margin-bottom:1.15rem">
          ${items.length
        ? items.map((item, idx) => annCardHtml(item, idx, false)).join('')
        : '<div class="state-box"><p>Belum ada slide pengumuman. Klik Tambah Slide Carousel untuk membuat pengumuman atau foto event baru.</p></div>'}
        </div>

        <button type="submit" class="btn btn-primary" ${readOnlyAttr}>${lucideIcon('save', 16)} Simpan Draf Carousel Pengumuman</button>
      </form>
    `;

    bindMediaPickers(moduleContent);
    const listEl = document.getElementById('ann-cards-list');

    function syncAnnSummaryMeta(card) {
      if (!card) return;
      const titleEl = card.querySelector('.admin-svc-title-text');
      const metaEl = card.querySelector('.admin-svc-meta');
      const statusBadge = card.querySelector('.admin-svc-status-badge');
      const titleVal = card.querySelector('.ann-title-input')?.value.trim() || '';
      const catVal = card.querySelector('.ann-category-input')?.value || 'Pengumuman';
      const startVal = card.querySelector('.ann-start-input')?.value || '';
      const endVal = card.querySelector('.ann-end-input')?.value || '';
      const isEnabled = card.querySelector('.ann-enabled-input')?.value === 'true';

      if (titleEl) titleEl.textContent = titleVal || 'Slide Pengumuman Baru';
      if (metaEl) metaEl.textContent = `${catVal} | ${formatAnnDateRange(startVal, endVal)}`;
      if (statusBadge) {
        statusBadge.textContent = isEnabled ? 'Aktif' : 'Nonaktif';
        statusBadge.className = `admin-svc-status-badge ${isEnabled ? 'is-active' : 'is-inactive'}`;
      }
    }

    function bindAnnCardLiveSync(card) {
      if (!card || card.dataset.annLiveBound === '1') return;
      card.dataset.annLiveBound = '1';
      card.querySelectorAll('.ann-title-input, .ann-category-input, .ann-start-input, .ann-end-input, .ann-enabled-input').forEach((inp) => {
        const handler = () => syncAnnSummaryMeta(card);
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
      });
    }

    function refreshAnnBadges() {
      const cards = Array.from(listEl.querySelectorAll('.ann-slide-card'));
      cards.forEach((card, i) => {
        const numEl = card.querySelector('.admin-svc-num');
        if (numEl) numEl.textContent = String(i + 1).padStart(2, '0');
      });
      if (!cards.length && !listEl.querySelector('.state-box')) {
        listEl.innerHTML = '<div class="state-box"><p>Belum ada slide pengumuman. Klik Tambah Slide Carousel untuk membuat pengumuman atau foto event baru.</p></div>';
      }
    }

    listEl.querySelectorAll('.ann-slide-card').forEach(bindAnnCardLiveSync);
    refreshAnnBadges();
    bindSmoothAccordionDetails(moduleContent);
    bindAnimateUiSortable(listEl, {
      itemSelector: 'details.ann-slide-card',
      onReorder: refreshAnnBadges
    });

    document.getElementById('add-ann-btn').addEventListener('click', () => {
      const emptyBox = listEl.querySelector('.state-box');
      if (emptyBox) emptyBox.remove();
      const wrapper = document.createElement('div');
      wrapper.innerHTML = annCardHtml({
        id: `ann-${Date.now().toString(36)}`,
        enabled: true,
        category: 'Event Layanan',
        title: '',
        message: '',
        startDate: '',
        endDate: '',
        imageId: 'media-hero-kantor',
        imageFit: 'cover',
        ctaLabel: '',
        ctaUrl: ''
      }, listEl.querySelectorAll('.ann-slide-card').length, true).trim();
      const card = wrapper.firstElementChild;
      listEl.appendChild(card);
      bindMediaPickers(card);
      enhanceAdminControls(card);
      bindSmoothAccordionDetails(listEl);
      bindAnnCardLiveSync(card);
      refreshAnnBadges();
      card.querySelector('.ann-title-input')?.focus();
    });

    listEl.addEventListener('click', (e) => {
      const card = e.target.closest('.ann-slide-card');
      if (!card) return;
      if (e.target.closest('.ann-remove')) {
        card.remove();
        refreshAnnBadges();
      }
    });

    document.getElementById('announcements-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedItems = Array.from(listEl.querySelectorAll('.ann-slide-card')).map((card, i) => ({
        id: card.getAttribute('data-ann-id') || `ann-${i + 1}`,
        enabled: card.querySelector('.ann-enabled-input').value === 'true',
        category: card.querySelector('.ann-category-input').value || 'Pengumuman',
        title: card.querySelector('.ann-title-input').value.trim(),
        message: card.querySelector('.ann-msg-input').value.trim(),
        startDate: card.querySelector('.ann-start-input').value,
        endDate: card.querySelector('.ann-end-input').value,
        imageId: card.querySelector('.media-picker-select')?.value || 'media-hero-kantor',
        imageFit: card.querySelector('.ann-fit-input')?.value || 'cover',
        ctaLabel: card.querySelector('.ann-cta-label-input').value.trim(),
        ctaUrl: card.querySelector('.ann-cta-url-input').value.trim()
      })).filter((it) => it.title || it.message);

      const nextSeo = {
        ...seo,
        sectionTitles: {
          ...(seo.sectionTitles || {}),
          announcements: document.getElementById('ann-section-title').value.trim() || 'Berita, Event, dan Pengumuman'
        }
      };

      await saveDraftSections(
        [['announcements', updatedItems], ['seo', nextSeo]],
        'Draf berita, event, dan pengumuman carousel berhasil diperbarui.'
      );
    });
  }

  // Partners, FAQ, SEO
  function renderExtrasModule(draft, readOnlyAttr) {
    const seo = draft.seo || {};
    let partnerUidSeq = 0;

    function faqCardHtml(f = {}, idx = 0) {
      partnerUidSeq += 1;
      const uid = `faq-${partnerUidSeq}`;
      return `
        <article class="repeater-card faq-card">
          <div class="repeater-card-top">
            <div class="repeater-card-head-left">
              <button type="button" class="aui-drag-handle" aria-label="Seret untuk mengubah urutan Pertanyaan ${idx + 1}" title="Klik, tahan, dan geser untuk mengubah urutan" ${!canEditDraft() ? 'disabled' : ''}>${lucideIcon('grip-vertical', 16)}</button>
              <span class="repeater-badge num-tabular">Pertanyaan #${idx + 1}</span>
            </div>
            <div class="repeater-actions-row">
              <button type="button" class="btn btn-danger btn-sm faq-remove" ${readOnlyAttr}>${lucideIcon('trash-2', 14)} Hapus</button>
            </div>
          </div>
          <div class="field-group">
            <label for="faq-q-${uid}">Pertanyaan</label>
            <input type="text" id="faq-q-${uid}" class="faq-q-input" value="${esc(f.question || '')}" placeholder="Tulis pertanyaan yang sering diajukan warga..." ${readOnlyAttr}>
          </div>
          <div class="field-group" style="margin-bottom:0">
            <label for="faq-a-${uid}">Jawaban Resmi</label>
            <textarea id="faq-a-${uid}" class="faq-a-input" rows="3" placeholder="Tulis jawaban lengkap dan jelas..." ${readOnlyAttr}>${esc(f.answer || '')}</textarea>
          </div>
        </article>
      `;
    }

    function partnerCardHtml(pt = {}, idx = 0) {
      partnerUidSeq += 1;
      const uid = `pt-${partnerUidSeq}`;
      return `
        <article class="repeater-card partner-card">
          <div class="repeater-card-top">
            <div class="repeater-card-head-left">
              <button type="button" class="aui-drag-handle" aria-label="Seret untuk mengubah urutan Instansi Mitra ${idx + 1}" title="Klik, tahan, dan geser untuk mengubah urutan" ${!canEditDraft() ? 'disabled' : ''}>${lucideIcon('grip-vertical', 16)}</button>
              <span class="repeater-badge num-tabular">Instansi Mitra #${idx + 1}</span>
            </div>
            <div class="repeater-actions-row">
              <button type="button" class="btn btn-danger btn-sm partner-remove" ${readOnlyAttr}>${lucideIcon('trash-2', 14)} Hapus</button>
            </div>
          </div>
          <div class="grid-2">
            <div class="field-group">
              <label for="pt-name-${uid}">Nama Instansi Mitra</label>
              <input type="text" id="pt-name-${uid}" class="partner-name-input" value="${esc(pt.name || '')}" placeholder="Contoh: Bapenda Provinsi Sulawesi Tengah" ${readOnlyAttr}>
            </div>
            <div class="field-group">
              <label for="pt-url-${uid}">Alamat Tautan Resmi (URL)</label>
              <input type="url" id="pt-url-${uid}" class="partner-url-input" value="${esc(pt.url || '')}" placeholder="https://..." ${readOnlyAttr}>
            </div>
          </div>
          <div class="field-group">
            <label for="pt-desc-${uid}">Deskripsi Singkat</label>
            <input type="text" id="pt-desc-${uid}" class="partner-desc-input" value="${esc(pt.description || '')}" placeholder="Penjelasan peran atau layanan mitra" ${readOnlyAttr}>
          </div>
          ${renderMediaPickerField({
        selectId: `pt-logo-${uid}`,
        label: 'Logo Instansi Mitra',
        selectedId: pt.logoId || 'media-logo-instansi',
        defaultAlt: `Logo ${pt.name || 'instansi mitra Samsat Palu'}`,
        readOnlyAttr,
        cropDefault: 'free'
      })}
        </article>
      `;
    }

    moduleContent.innerHTML = `
      <div class="module-header">
        <h1>Tautan Mitra, Tanya-Jawab (FAQ), dan SEO</h1>
      </div>

      <form id="faq-partners-form" class="panel-card">
        <h2>Pertanyaan Umum (FAQ) dan Instansi Mitra</h2>

        <div class="repeater-section">
          <div class="repeater-header">
            <h3>Kartu Tanya-Jawab (FAQ)</h3>
            <button type="button" id="add-faq-btn" class="btn btn-accent btn-sm" ${readOnlyAttr}>+ Tambah Pertanyaan FAQ</button>
          </div>
          <div id="faq-cards-list" class="repeater-list">
            ${(draft.faq || []).map((f, idx) => faqCardHtml(f, idx)).join('')}
          </div>
        </div>

        <div class="repeater-section">
          <div class="repeater-header">
            <h3>Kartu Tautan Instansi Mitra</h3>
            <button type="button" id="add-partner-btn" class="btn btn-accent btn-sm" ${readOnlyAttr}>+ Tambah Instansi Mitra</button>
          </div>
          <div id="partner-cards-list" class="repeater-list">
            ${(draft.partners || []).map((pt, idx) => partnerCardHtml(pt, idx)).join('')}
          </div>
        </div>

        <button type="submit" class="btn btn-primary" ${readOnlyAttr}>Simpan Draf FAQ dan Mitra</button>
      </form>

      <form id="seo-form" class="panel-card">
        <h2>Pengaturan SEO Halaman</h2>
        <div class="field-group">
          <label for="seo-title">Judul Halaman (&lt;title&gt;)</label>
          <input type="text" id="seo-title" value="${esc(seo.pageTitle)}" ${readOnlyAttr}>
        </div>
        <div class="field-group">
          <label for="seo-desc">Meta Deskripsi</label>
          <textarea id="seo-desc" ${readOnlyAttr}>${esc(seo.metaDescription)}</textarea>
        </div>
        <button type="submit" class="btn btn-primary" ${readOnlyAttr}>Simpan Draf SEO</button>
      </form>
    `;
    bindMediaPickers(moduleContent);

    const faqListEl = document.getElementById('faq-cards-list');
    const partnerListEl = document.getElementById('partner-cards-list');

    function refreshCardBadges(listEl, selector, labelPrefix) {
      const cards = Array.from(listEl.querySelectorAll(selector));
      cards.forEach((card, i) => {
        const badge = card.querySelector('.repeater-badge');
        if (badge) badge.textContent = `${labelPrefix} #${i + 1}`;
      });
    }

    bindAnimateUiSortable(faqListEl, {
      itemSelector: '.faq-card',
      onReorder: () => refreshCardBadges(faqListEl, '.faq-card', 'Pertanyaan')
    });

    bindAnimateUiSortable(partnerListEl, {
      itemSelector: '.partner-card',
      onReorder: () => refreshCardBadges(partnerListEl, '.partner-card', 'Instansi Mitra')
    });

    document.getElementById('add-faq-btn').addEventListener('click', () => {
      partnerUidSeq += 1;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = faqCardHtml({ question: '', answer: '' }, faqListEl.children.length).trim();
      const card = wrapper.firstElementChild;
      faqListEl.appendChild(card);
      refreshCardBadges(faqListEl, '.faq-card', 'Pertanyaan');
      card.querySelector('.faq-q-input')?.focus();
    });

    faqListEl.addEventListener('click', (e) => {
      const card = e.target.closest('.faq-card');
      if (!card) return;
      if (e.target.closest('.faq-remove')) {
        card.remove();
        refreshCardBadges(faqListEl, '.faq-card', 'Pertanyaan');
      }
    });

    document.getElementById('add-partner-btn').addEventListener('click', () => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = partnerCardHtml({ name: '', url: '', description: '', logoId: 'media-logo-instansi' }, partnerListEl.children.length).trim();
      const card = wrapper.firstElementChild;
      partnerListEl.appendChild(card);
      bindMediaPickers(card);
      enhanceAdminControls(card);
      refreshCardBadges(partnerListEl, '.partner-card', 'Instansi Mitra');
      card.querySelector('.partner-name-input')?.focus();
    });

    partnerListEl.addEventListener('click', (e) => {
      const card = e.target.closest('.partner-card');
      if (!card) return;
      if (e.target.closest('.partner-remove')) {
        card.remove();
        refreshCardBadges(partnerListEl, '.partner-card', 'Instansi Mitra');
      }
    });

    refreshCardBadges(faqListEl, '.faq-card', 'Pertanyaan');
    refreshCardBadges(partnerListEl, '.partner-card', 'Instansi Mitra');

    document.getElementById('faq-partners-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const faq = Array.from(faqListEl.querySelectorAll('.faq-card')).map((card, i) => ({
        id: `faq-${i}`,
        question: card.querySelector('.faq-q-input').value.trim(),
        answer: card.querySelector('.faq-a-input').value.trim()
      })).filter((item) => item.question || item.answer);

      const partners = Array.from(partnerListEl.querySelectorAll('.partner-card')).map((card, i) => ({
        id: `mitra-${i}`,
        name: card.querySelector('.partner-name-input').value.trim(),
        url: card.querySelector('.partner-url-input').value.trim(),
        description: card.querySelector('.partner-desc-input').value.trim(),
        logoId: card.querySelector('.media-picker-select')?.value || 'media-logo-instansi'
      })).filter((pt) => pt.name || pt.url);

      await saveDraftSections([['faq', faq], ['partners', partners]], 'Draf FAQ dan mitra berhasil disimpan.');
    });

    document.getElementById('seo-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveDraftSection('seo', {
        ...seo,
        pageTitle: document.getElementById('seo-title').value.trim(),
        metaDescription: document.getElementById('seo-desc').value.trim()
      });
    });
  }

  // Module A11: Asset & Photo Organizer
  function renderAssetsModule(readOnlyAttr) {
    const mediaList = (state.adminData?.media || []).slice().reverse();
    const usageMap = state.adminData?.mediaUsage || {};
    let currentFilter = 'all';
    let searchQuery = '';

    const customItems = mediaList.filter((m) => !m.isPlaceholder);
    const unusedCustomCount = customItems.filter((m) => !(usageMap[m.id] && usageMap[m.id].length)).length;
    const usedCustomCount = customItems.length - unusedCustomCount;

    moduleContent.innerHTML = `
      <div class="module-header">
        <div>
          <h1>Kelola Foto dan Aset Gambar</h1>
          <p class="meta-text" style="margin:0.25rem 0 0">Lihat semua foto yang pernah diunggah, ubah keterangan gambar untuk memudahkan pencarian di dropdown, atau hapus foto yang salah unggah.</p>
        </div>
        <button type="button" id="asset-upload-btn" class="btn btn-accent" ${readOnlyAttr}>${lucideIcon('upload', 16)} Unggah Foto Baru</button>
      </div>

      <div class="summary-strip" style="margin-bottom:1.25rem">
        <div class="summary-tile">
          <span class="summary-label">Foto Unggahan Admin</span>
          <strong class="summary-value num-tabular">${customItems.length}</strong>
          <span class="summary-delta">Total berkas foto asli</span>
        </div>
        <div class="summary-tile">
          <span class="summary-label">Sedang Digunakan</span>
          <strong class="summary-value num-tabular">${usedCustomCount}</strong>
          <span class="summary-delta">Terpasang di draf atau situs publik</span>
        </div>
        <div class="summary-tile">
          <span class="summary-label">Belum Terpakai</span>
          <strong class="summary-value num-tabular">${unusedCustomCount}</strong>
          <span class="summary-delta">Aman untuk dihapus jika salah unggah</span>
        </div>
      </div>

      <div class="panel-card">
        <div class="asset-toolbar">
          <div class="asset-search-wrap">
            ${lucideIcon('search', 16)}
            <input type="text" id="asset-search-input" placeholder="Cari keterangan gambar atau nama file..." autocomplete="off">
          </div>
          <div class="asset-filter-tabs" role="tablist" aria-label="Filter jenis aset">
            <button type="button" class="asset-filter-btn is-active" data-filter="all">Semua (${mediaList.length})</button>
            <button type="button" class="asset-filter-btn" data-filter="custom">Foto Unggahan (${customItems.length})</button>
            <button type="button" class="asset-filter-btn" data-filter="unused">Belum Terpakai (${unusedCustomCount})</button>
            <button type="button" class="asset-filter-btn" data-filter="builtin">Aset Bawaan (${mediaList.length - customItems.length})</button>
          </div>
        </div>

        <div id="asset-organizer-grid" class="asset-organizer-grid"></div>
      </div>
    `;

    const gridEl = document.getElementById('asset-organizer-grid');
    const searchInput = document.getElementById('asset-search-input');

    function paintGrid() {
      const q = searchQuery.trim().toLowerCase();
      const currentList = (state.adminData?.media || []).slice().reverse();
      const filtered = currentList.filter((m) => {
        const usedIn = usageMap[m.id] || [];
        if (currentFilter === 'custom' && m.isPlaceholder) return false;
        if (currentFilter === 'builtin' && !m.isPlaceholder) return false;
        if (currentFilter === 'unused' && (m.isPlaceholder || usedIn.length > 0)) return false;
        if (q) {
          const altMatch = (m.alt || '').toLowerCase().includes(q);
          const fnMatch = (m.filename || '').toLowerCase().includes(q);
          return altMatch || fnMatch;
        }
        return true;
      });

      if (!filtered.length) {
        gridEl.innerHTML = `
          <div class="state-box" style="grid-column:1 / -1">
            <p>Tidak ada foto atau aset yang cocok dengan filter pencarian ini.</p>
          </div>
        `;
        return;
      }

      gridEl.innerHTML = filtered.map((m) => {
        const usedIn = usageMap[m.id] || [];
        const isUsed = usedIn.length > 0;
        const sizeKb = m.sizeBytes ? `${Math.max(1, Math.round(m.sizeBytes / 1024))} KB` : 'Bawaan';
        const dims = `${m.width || 0} x ${m.height || 0} px`;
        const dateText = m.uploadedAt ? new Date(m.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

        return `
          <article class="asset-card" data-media-id="${esc(m.id)}">
            <div class="asset-card-preview">
              <img src="${esc(m.url)}" alt="${esc(m.alt || m.filename)}" loading="lazy">
              <div class="asset-card-badges">
                <span class="asset-type-pill ${m.isPlaceholder ? 'is-builtin' : 'is-custom'}">${m.isPlaceholder ? 'Aset Bawaan' : 'Foto Asli'}</span>
                <span class="asset-usage-pill ${isUsed ? 'is-used' : 'is-unused'}">${isUsed ? `Dipakai (${usedIn.length})` : 'Belum Terpakai'}</span>
              </div>
            </div>
            <div class="asset-card-body">
              <div>
                <label class="asset-alt-label" for="asset-alt-${esc(m.id)}">Keterangan Gambar (Tampil di Dropdown)</label>
                <div class="asset-alt-row">
                  <input type="text" id="asset-alt-${esc(m.id)}" class="asset-alt-input" value="${esc(m.alt || '')}" ${m.isPlaceholder || !canEditDraft() ? 'readonly' : ''}>
                  ${!m.isPlaceholder && canEditDraft() ? `<button type="button" class="btn btn-secondary btn-sm asset-save-alt-btn" title="Simpan keterangan gambar">${lucideIcon('save', 14)}</button>` : ''}
                </div>
              </div>
              <div class="asset-meta-line num-tabular">
                <span title="${esc(m.filename)}">${esc(m.filename.length > 32 ? `${m.filename.slice(0, 29)}...` : m.filename)}</span>
                <span>${esc(dims)} • ${esc(sizeKb)}</span>
                ${dateText ? `<span>${esc(dateText)}</span>` : ''}
              </div>
              ${isUsed ? `
                <div class="asset-usage-list">
                  ${usedIn.map((u) => `<span class="asset-usage-tag">${esc(u)}</span>`).join('')}
                </div>
              ` : '<div class="meta-text" style="font-size:0.78rem">Tidak sedang dipasang di modul mana pun.</div>'}
            </div>
            <div class="asset-card-footer">
              <a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm">${lucideIcon('external-link', 14)} Buka Penuh</a>
              ${m.isPlaceholder
            ? '<span class="meta-text" style="font-size:0.78rem">Bawaan sistem</span>'
            : `<button type="button" class="btn btn-danger btn-sm asset-delete-btn" ${!canEditDraft() ? 'disabled title="Tidak memiliki izin hapus"' : (isUsed ? 'title="Hapus foto dan kembalikan modul terkait ke aset bawaan"' : 'title="Hapus foto permanen"')}>${lucideIcon('trash-2', 14)} Hapus</button>`}
            </div>
          </article>
        `;
      }).join('');
    }

    paintGrid();

    document.getElementById('asset-upload-btn')?.addEventListener('click', () => {
      openQuickUploadDialog(null, '', 'free');
    });

    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      paintGrid();
    });

    moduleContent.querySelectorAll('.asset-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        moduleContent.querySelectorAll('.asset-filter-btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentFilter = btn.getAttribute('data-filter') || 'all';
        paintGrid();
      });
    });

    gridEl.addEventListener('click', async (e) => {
      const card = e.target.closest('.asset-card');
      if (!card) return;
      const mediaId = card.getAttribute('data-media-id');

      if (e.target.closest('.asset-save-alt-btn')) {
        const inp = card.querySelector('.asset-alt-input');
        const newAlt = inp?.value.trim() || '';
        if (!newAlt) {
          showFeedback('Keterangan gambar tidak boleh kosong.', 'error');
          inp?.focus();
          return;
        }
        try {
          const res = await api(`/api/admin/media/${encodeURIComponent(mediaId)}`, {
            method: 'PATCH',
            body: JSON.stringify({ alt: newAlt })
          });
          const item = (state.adminData?.media || []).find((m) => m.id === mediaId);
          if (item && res.media) item.alt = res.media.alt;
          showFeedback('Keterangan gambar berhasil diperbarui.', 'success');
        } catch (err) {
          showFeedback(`Gagal mengubah keterangan: ${err.message}`, 'error');
        }
        return;
      }

      if (e.target.closest('.asset-delete-btn')) {
        const item = (state.adminData?.media || []).find((m) => m.id === mediaId);
        const label = item?.alt || item?.filename || 'foto ini';
        const usedIn = usageMap[mediaId] || [];
        const usageNotice = usedIn.length
          ? ` Foto ini sedang dipakai di: ${usedIn.join(', ')}. Jika dihapus, bagian tersebut otomatis dikembalikan ke aset bawaan sistem.`
          : '';
        const { confirmed } = await confirmAdminAction({
          title: 'Hapus Foto Permanen?',
          message: `Apakah Anda yakin ingin menghapus "${label}" dari server?${usageNotice} Tindakan ini tidak dapat dibatalkan.`,
          confirmLabel: 'Ya, Hapus Foto',
          variant: 'danger'
        });
        if (!confirmed) return;
        try {
          const delRes = await api(`/api/admin/media/${encodeURIComponent(mediaId)}`, { method: 'DELETE' });
          state.adminData.media = (state.adminData.media || []).filter((m) => m.id !== mediaId);
          if (delRes.draftContent) state.adminData.draftContent = delRes.draftContent;
          if (delRes.publishedContent) state.adminData.publishedContent = delRes.publishedContent;
          if (typeof delRes.hasUnpublishedChanges === 'boolean') {
            state.adminData.hasUnpublishedChanges = delRes.hasUnpublishedChanges;
          }
          updateDecisionBar();
          const resetMsg = delRes.replacedCount
            ? ` Bagian terkait otomatis dikembalikan ke aset bawaan.`
            : '';
          showFeedback(`Foto "${label}" berhasil dihapus dari server.${resetMsg}`, 'success');
          renderAssetsModule(readOnlyAttr);
        } catch (err) {
          showFeedback(`Gagal menghapus foto: ${err.message}`, 'error');
        }
      }
    });
  }

  async function renderFeedbacksModule(readOnlyAttr) {
    moduleContent.innerHTML = `
      <div class="module-header">
        <div>
          <h1>Kotak Masuk Aduan &amp; Saran Warga</h1>
          <p class="meta-text" style="margin:0.25rem 0 0">Kelola laporan dari Kanal Pengaduan dan masukan dari Kanal Saran secara terpisah dengan pelacakan status tindak lanjut.</p>
        </div>
        <a id="feedback-export-csv" href="/api/admin/feedbacks/export.csv?channel=all" class="btn btn-secondary">${lucideIcon('download', 16)} Unduh CSV</a>
      </div>
      <div id="feedbacks-body">
        <div class="state-box"><p>Memuat daftar aduan dan saran...</p></div>
      </div>
    `;

    const bodyEl = document.getElementById('feedbacks-body');
    const exportLink = document.getElementById('feedback-export-csv');
    let allItems = [];
    let activeChannel = 'all';
    let activeStatus = 'all';
    let searchQuery = '';

    try {
      const res = await api('/api/admin/feedbacks');
      allItems = Array.isArray(res.feedbacks) ? res.feedbacks : [];
    } catch (err) {
      if (bodyEl) bodyEl.innerHTML = `<div class="state-box alert-error"><p>Gagal memuat kotak masuk: ${esc(err.message)}</p></div>`;
      return;
    }

    function formatWitaDate(iso) {
      if (!iso) return '-';
      const dt = new Date(iso);
      if (Number.isNaN(dt.getTime())) return String(iso);
      return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dt) + ' WITA';
    }

    function statusLabel(status) {
      if (status === 'diproses') return 'Diproses';
      if (status === 'selesai') return 'Selesai';
      return 'Baru';
    }

    function paintInbox() {
      if (!bodyEl) return;
      const complaintCount = allItems.filter((f) => f.channel !== 'suggestion').length;
      const suggestionCount = allItems.filter((f) => f.channel === 'suggestion').length;
      const newCount = allItems.filter((f) => f.status === 'baru').length;

      if (exportLink) {
        exportLink.href = `/api/admin/feedbacks/export.csv?channel=${encodeURIComponent(activeChannel)}`;
      }

      const q = searchQuery.trim().toLowerCase();
      const filtered = allItems.filter((item) => {
        if (activeChannel !== 'all' && item.channel !== activeChannel) return false;
        if (activeStatus !== 'all' && item.status !== activeStatus) return false;
        if (q) {
          const hay = `${item.ticketCode} ${item.subject} ${item.details} ${item.category} ${item.location} ${item.adminNote || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      const listHtml = filtered.length
        ? filtered.map((item) => {
            const isSuggestion = item.channel === 'suggestion';
            const channelText = isSuggestion ? 'Saran & Masukan' : 'Pengaduan';
            return `
              <article class="panel-card feedback-ticket-card" data-fb-id="${esc(item.id)}">
                <div class="feedback-ticket-top">
                  <div class="feedback-ticket-badges">
                    <span class="feedback-ticket-code num-tabular">${esc(item.ticketCode)}</span>
                    <span class="feedback-channel-pill ${isSuggestion ? 'is-suggestion' : 'is-complaint'}">${esc(channelText)}</span>
                    <span class="feedback-status-pill is-${esc(item.status || 'baru')}">${esc(statusLabel(item.status))}</span>
                  </div>
                  <span class="meta-text num-tabular">${esc(formatWitaDate(item.createdAt))}</span>
                </div>
                <h3 class="feedback-ticket-subject">${esc(item.subject)}</h3>
                <p class="feedback-ticket-meta">
                  <strong>${isSuggestion ? 'Aspek' : 'Kategori'}:</strong> ${esc(item.category)} |
                  <strong>Lokasi:</strong> ${esc(item.location)}
                </p>
                <p class="feedback-ticket-details">${esc(item.details)}</p>
                <div class="feedback-officer-bar">
                  <div class="feedback-officer-fields">
                    <select class="fb-status-select" aria-label="Status tindak lanjut ${esc(item.ticketCode)}" ${readOnlyAttr}>
                      <option value="baru" ${item.status === 'baru' ? 'selected' : ''}>Baru</option>
                      <option value="diproses" ${item.status === 'diproses' ? 'selected' : ''}>Diproses</option>
                      <option value="selesai" ${item.status === 'selesai' ? 'selected' : ''}>Selesai</option>
                    </select>
                    <input type="text" class="fb-note-input" value="${esc(item.adminNote || '')}" placeholder="Catatan tindak lanjut petugas (opsional)..." ${readOnlyAttr}>
                  </div>
                  <div class="feedback-officer-actions">
                    <button type="button" class="btn btn-primary btn-sm fb-save-btn" ${readOnlyAttr}>${lucideIcon('save', 14)} Simpan Status</button>
                    <button type="button" class="btn btn-danger btn-sm fb-delete-btn" ${readOnlyAttr}>${lucideIcon('trash-2', 14)} Hapus</button>
                  </div>
                </div>
              </article>
            `;
          }).join('')
        : '<div class="state-box"><p>Belum ada data aduan atau saran yang sesuai dengan filter.</p></div>';

      bodyEl.innerHTML = `
        <div class="feedback-summary-row">
          <div class="panel-card feedback-stat-box">
            <span class="meta-text">Kanal Pengaduan</span>
            <strong class="num-tabular">${complaintCount}</strong>
          </div>
          <div class="panel-card feedback-stat-box">
            <span class="meta-text">Kanal Saran &amp; Masukan</span>
            <strong class="num-tabular">${suggestionCount}</strong>
          </div>
          <div class="panel-card feedback-stat-box">
            <span class="meta-text">Berstatus Baru</span>
            <strong class="num-tabular">${newCount}</strong>
          </div>
        </div>

        <div class="asset-toolbar panel-card" style="margin-bottom:1rem">
          <div class="asset-filter-tabs" role="group" aria-label="Filter kanal">
            <button type="button" class="asset-filter-btn fb-channel-btn ${activeChannel === 'all' ? 'is-active' : ''}" data-fb-channel="all">Semua (${allItems.length})</button>
            <button type="button" class="asset-filter-btn fb-channel-btn ${activeChannel === 'complaint' ? 'is-active' : ''}" data-fb-channel="complaint">Pengaduan (${complaintCount})</button>
            <button type="button" class="asset-filter-btn fb-channel-btn ${activeChannel === 'suggestion' ? 'is-active' : ''}" data-fb-channel="suggestion">Saran &amp; Masukan (${suggestionCount})</button>
          </div>
          <div class="feedback-toolbar-right">
            <select id="fb-status-filter" aria-label="Filter status">
              <option value="all" ${activeStatus === 'all' ? 'selected' : ''}>Semua Status</option>
              <option value="baru" ${activeStatus === 'baru' ? 'selected' : ''}>Baru</option>
              <option value="diproses" ${activeStatus === 'diproses' ? 'selected' : ''}>Diproses</option>
              <option value="selesai" ${activeStatus === 'selesai' ? 'selected' : ''}>Selesai</option>
            </select>
            <div class="asset-search-wrap">
              ${lucideIcon('search', 16)}
              <input type="search" id="fb-search-input" value="${esc(searchQuery)}" placeholder="Cari kode tiket, topik, lokasi...">
            </div>
          </div>
        </div>

        <div id="feedback-inbox-list" class="feedback-inbox-list">${listHtml}</div>
      `;

      bodyEl.querySelectorAll('.fb-channel-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeChannel = btn.getAttribute('data-fb-channel') || 'all';
          paintInbox();
        });
      });

      document.getElementById('fb-status-filter')?.addEventListener('change', (e) => {
        activeStatus = e.target.value || 'all';
        paintInbox();
      });

      document.getElementById('fb-search-input')?.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        paintInbox();
        const inp = document.getElementById('fb-search-input');
        if (inp) {
          inp.focus();
          inp.setSelectionRange(inp.value.length, inp.value.length);
        }
      });

      document.getElementById('feedback-inbox-list')?.addEventListener('click', async (e) => {
        const card = e.target.closest('.feedback-ticket-card');
        if (!card) return;
        const fbId = card.getAttribute('data-fb-id');

        if (e.target.closest('.fb-save-btn')) {
          const status = card.querySelector('.fb-status-select')?.value || 'baru';
          const adminNote = card.querySelector('.fb-note-input')?.value.trim() || '';
          try {
            const updated = await api(`/api/admin/feedbacks/${encodeURIComponent(fbId)}`, {
              method: 'PATCH',
              body: JSON.stringify({ status, adminNote })
            });
            const target = allItems.find((x) => x.id === fbId);
            if (target && updated.item) {
              target.status = updated.item.status;
              target.adminNote = updated.item.adminNote;
            }
            showFeedback(`Status tiket ${target?.ticketCode || ''} berhasil diperbarui.`, 'success');
            paintInbox();
          } catch (err) {
            showFeedback(`Gagal memperbarui status: ${err.message}`, 'error');
          }
          return;
        }

        if (e.target.closest('.fb-delete-btn')) {
          const target = allItems.find((x) => x.id === fbId);
          const { confirmed } = await confirmAdminAction({
            title: 'Hapus Tiket Aduan / Saran?',
            message: `Apakah Anda yakin ingin menghapus tiket "${target?.ticketCode || ''}"?`,
            confirmLabel: 'Ya, Hapus',
            variant: 'danger'
          });
          if (!confirmed) return;
          try {
            await api(`/api/admin/feedbacks/${encodeURIComponent(fbId)}`, { method: 'DELETE' });
            allItems = allItems.filter((x) => x.id !== fbId);
            showFeedback(`Tiket ${target?.ticketCode || ''} berhasil dihapus.`, 'success');
            paintInbox();
          } catch (err) {
            showFeedback(`Gagal menghapus tiket: ${err.message}`, 'error');
          }
        }
      });
    }

    paintInbox();
  }

  function renderSamsatKelilingModule(draft, readOnlyAttr) {
    const items = Array.isArray(draft.samsatKeliling) ? draft.samsatKeliling : [];
    let skSeq = 0;

    function skCardHtml(item = {}, idx = 0, isOpen = false) {
      skSeq += 1;
      const uid = `sk-${skSeq}`;
      const isEnabled = item.enabled !== false;
      const dayLabel = item.dayLabel || 'Jadwal Baru';
      const timeRange = item.timeRange || '08.30 s.d. 12.00 WITA';
      return `
        <details class="admin-svc-details sk-item-card" data-sk-id="${esc(item.id || uid)}" ${isOpen ? 'open' : ''}>
          <summary class="admin-svc-summary">
            <button type="button" class="aui-drag-handle" aria-label="Seret untuk mengubah urutan jadwal ${esc(dayLabel)}" ${!canEditDraft() ? 'disabled' : ''}>${lucideIcon('grip-vertical', 16)}</button>
            <span class="admin-svc-num num-tabular">${String(idx + 1).padStart(2, '0')}</span>
            <span class="admin-svc-title-group">
              <strong class="admin-svc-title-text">${esc(dayLabel)}</strong>
              <span class="admin-svc-meta num-tabular">${esc(timeRange)} | ${esc(item.location || 'Lokasi belum diisi')}</span>
            </span>
            <span class="admin-svc-actions-bar">
              <span class="admin-svc-status-badge ${isEnabled ? 'is-active' : 'is-inactive'}">${isEnabled ? 'Aktif' : 'Nonaktif'}</span>
              <button type="button" class="btn btn-danger btn-sm sk-remove-btn" aria-label="Hapus jadwal ${esc(dayLabel)}" ${readOnlyAttr}>${lucideIcon('trash-2', 14)}</button>
              <span class="admin-svc-chevron" aria-hidden="true">${lucideIcon('chevron-down', 18)}</span>
            </span>
          </summary>
          <div class="admin-svc-body">
            <div class="grid-2">
              <div class="field-group">
                <label for="sk-enabled-${uid}">Status Tampil</label>
                <select id="sk-enabled-${uid}" class="sk-enabled-input" ${readOnlyAttr}>
                  <option value="true" ${isEnabled ? 'selected' : ''}>Aktif (Tampil di Situs Publik)</option>
                  <option value="false" ${!isEnabled ? 'selected' : ''}>Nonaktif (Sembunyikan)</option>
                </select>
              </div>
              <div class="field-group">
                <label for="sk-day-${uid}">Hari / Periode</label>
                <input type="text" id="sk-day-${uid}" class="sk-day-input" value="${esc(item.dayLabel || '')}" placeholder="Contoh: Senin s.d. Kamis" ${readOnlyAttr} required>
              </div>
              <div class="field-group">
                <label for="sk-time-${uid}">Jam Operasional (WITA)</label>
                <input type="text" id="sk-time-${uid}" class="sk-time-input" value="${esc(item.timeRange || '')}" placeholder="Contoh: 08.30 s.d. 13.00 WITA" ${readOnlyAttr} required>
              </div>
              <div class="field-group">
                <label for="sk-scope-${uid}">Jenis Layanan</label>
                <input type="text" id="sk-scope-${uid}" class="sk-scope-input" value="${esc(item.serviceScope || '')}" placeholder="Contoh: Pengesahan Pajak Tahunan" ${readOnlyAttr}>
              </div>
            </div>
            <div class="field-group">
              <label for="sk-loc-${uid}">Lokasi / Titik Mangkal</label>
              <input type="text" id="sk-loc-${uid}" class="sk-loc-input" value="${esc(item.location || '')}" placeholder="Contoh: Area Taman GOR / Jl. Moh. Hatta, Kota Palu" ${readOnlyAttr} required>
            </div>
            <div class="field-group" style="margin-bottom:0">
              <label for="sk-note-${uid}">Catatan Tambahan (Opsional)</label>
              <input type="text" id="sk-note-${uid}" class="sk-note-input" value="${esc(item.note || '')}" placeholder="Contoh: Siapkan STNK asli dan KTP pemilik kendaraan." ${readOnlyAttr}>
            </div>
          </div>
        </details>
      `;
    }

    moduleContent.innerHTML = `
      <div class="module-header">
        <div>
          <h1>Jadwal Samsat Keliling (Rutin)</h1>
          <p class="meta-text" style="margin:0.25rem 0 0">Atur jadwal rutin layanan mobil Samsat Keliling secara terpisah dari event/pengumuman.</p>
        </div>
        <button type="button" id="add-sk-btn" class="btn btn-accent" ${readOnlyAttr}>${lucideIcon('plus', 16)} Tambah Jadwal</button>
      </div>
      <form id="sk-form" class="panel-card">
        <div id="sk-cards-list" class="repeater-list" style="margin-bottom:1.15rem">
          ${items.length
        ? items.map((item, idx) => skCardHtml(item, idx, false)).join('')
        : '<div class="state-box"><p>Belum ada jadwal Samsat Keliling. Klik Tambah Jadwal untuk menambahkan.</p></div>'}
        </div>
        <button type="submit" class="btn btn-primary" ${readOnlyAttr}>${lucideIcon('save', 16)} Simpan Draf Jadwal Samsat Keliling</button>
      </form>
    `;

    const listEl = document.getElementById('sk-cards-list');
    function refreshSkBadges() {
      const cards = Array.from(listEl.querySelectorAll('.sk-item-card'));
      cards.forEach((card, i) => {
        const num = card.querySelector('.admin-svc-num');
        if (num) num.textContent = String(i + 1).padStart(2, '0');
      });
      if (!cards.length && !listEl.querySelector('.state-box')) {
        listEl.innerHTML = '<div class="state-box"><p>Belum ada jadwal Samsat Keliling. Klik Tambah Jadwal untuk menambahkan.</p></div>';
      }
    }

    bindSmoothAccordionDetails(moduleContent);
    bindAnimateUiSortable(listEl, {
      itemSelector: 'details.sk-item-card',
      onReorder: refreshSkBadges
    });

    document.getElementById('add-sk-btn')?.addEventListener('click', () => {
      const emptyBox = listEl.querySelector('.state-box');
      if (emptyBox) emptyBox.remove();
      const wrap = document.createElement('div');
      wrap.innerHTML = skCardHtml({
        id: `sk-${Date.now().toString(36)}`,
        enabled: true,
        dayLabel: '',
        timeRange: '08.30 s.d. 13.00 WITA',
        location: '',
        serviceScope: 'Pengesahan Pajak Tahunan',
        note: ''
      }, listEl.querySelectorAll('.sk-item-card').length, true).trim();
      const card = wrap.firstElementChild;
      listEl.appendChild(card);
      enhanceAdminControls(card);
      bindSmoothAccordionDetails(listEl);
      refreshSkBadges();
      card.querySelector('.sk-day-input')?.focus();
    });

    listEl.addEventListener('click', (e) => {
      const card = e.target.closest('.sk-item-card');
      if (!card) return;
      if (e.target.closest('.sk-remove-btn')) {
        card.remove();
        refreshSkBadges();
      }
    });

    document.getElementById('sk-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updated = Array.from(listEl.querySelectorAll('.sk-item-card')).map((card, i) => ({
        id: card.getAttribute('data-sk-id') || `sk-${i + 1}`,
        enabled: card.querySelector('.sk-enabled-input')?.value === 'true',
        dayLabel: card.querySelector('.sk-day-input')?.value.trim() || '',
        timeRange: card.querySelector('.sk-time-input')?.value.trim() || '',
        location: card.querySelector('.sk-loc-input')?.value.trim() || '',
        serviceScope: card.querySelector('.sk-scope-input')?.value.trim() || '',
        note: card.querySelector('.sk-note-input')?.value.trim() || ''
      }));
      await saveDraftSection('samsatKeliling', updated);
    });
  }

  enhanceAdminControls(document);

  // Bootstrap existing session on page load
  api('/api/admin/session')
    .then((data) => {
      if (data && data.authenticated) {
        state.user = data.user;
        state.csrfToken = data.csrfToken;
        showWorkspaceView();
        return loadAdminState();
      }
      showLoginView();
    })
    .catch(() => showLoginView());
})();

