'use strict';

const { buildGoogleMapsDirectionsUrl } = require('./seed');
const { buildThemeCss } = require('../public/theme-utils');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(url, fallback = '#') {
  const str = String(url || '').trim();
  if (!str) return fallback;
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(str)) {
    return str;
  }
  return fallback;
}

function formatIndonesianDate(isoString) {
  if (!isoString) return 'Belum tercatat';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function getWitaStatus(hoursConfig, nowDate = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(nowDate);

  const map = {};
  for (const p of parts) map[p.type] = p.value;

  const isoDate = `${map.year}-${map.month}-${map.day}`;
  const currentTime = `${map.hour}:${map.minute}`;
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayIndex = weekdayMap[map.weekday] ?? 1;

  const exception = (hoursConfig.exceptions || []).find((ex) => ex.date === isoDate);
  if (exception) {
    if (exception.status === 'closed') {
      return {
        isOpen: false,
        statusLabel: 'Tutup',
        reason: `${exception.title} (${exception.note || 'Hari libur'})`,
        currentTimeWita: `${currentTime} WITA`,
        isoDate
      };
    }
    const open = exception.openTime || '08:00';
    const close = exception.closeTime || '12:00';
    const isOpen = currentTime >= open && currentTime < close;
    return {
      isOpen,
      statusLabel: isOpen ? 'Buka' : 'Tutup',
      reason: `${exception.title}: ${open.replace(':', '.')} s.d. ${close.replace(':', '.')} WITA`,
      currentTimeWita: `${currentTime} WITA`,
      isoDate
    };
  }

  const todayRule = (hoursConfig.weekly || []).find((d) => d.dayIndex === dayIndex);
  if (!todayRule || !todayRule.isOpen) {
    return {
      isOpen: false,
      statusLabel: 'Tutup',
      reason: 'Hari Minggu loket tidak beroperasi',
      currentTimeWita: `${currentTime} WITA`,
      isoDate
    };
  }

  const isOpen = currentTime >= todayRule.openTime && currentTime < todayRule.closeTime;
  return {
    isOpen,
    statusLabel: isOpen ? 'Buka' : 'Tutup',
    reason: isOpen
      ? `Loket beroperasi hingga pukul ${todayRule.closeTime.replace(':', '.')} WITA`
      : `Jadwal hari ini: ${todayRule.displayText}`,
    currentTimeWita: `${currentTime} WITA`,
    isoDate
  };
}

function getMediaById(mediaList, id, fallback) {
  return (mediaList || []).find((m) => m.id === id) || fallback || {
    url: '/assets/placeholders/foto-lokasi.svg',
    alt: 'Penampung gambar resmi Samsat Palu',
    width: 480,
    height: 300
  };
}

function formatShortDateId(isoDate) {
  if (!isoDate) return '';
  const match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return String(isoDate);
  const dt = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(dt);
}

function renderAnnouncementsCarouselSection(announcements, mediaList, todayIso, sectionTitle) {
  const active = (announcements || []).filter((item) => {
    if (!item.enabled) return false;
    if (item.startDate && todayIso < item.startDate) return false;
    if (item.endDate && todayIso > item.endDate) return false;
    return true;
  });
  if (active.length === 0) return '';

  const fallbackMedia = getMediaById(mediaList, 'media-hero-kantor');
  const slidesHtml = active.map((item, idx) => {
    const img = getMediaById(mediaList, item.imageId, fallbackMedia);
    const hasDates = item.startDate || item.endDate;
    const dateRange = hasDates
      ? [formatShortDateId(item.startDate), formatShortDateId(item.endDate)].filter(Boolean).join(' s.d. ')
      : '';
    const ctaHref = safeUrl(item.ctaUrl, '');
    const isExternal = /^https?:\/\//i.test(ctaHref);
    const ctaHtml = item.ctaLabel && ctaHref
      ? `<a href="${escapeHtml(ctaHref)}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''} class="btn btn-primary btn-sm announcement-cta">${escapeHtml(item.ctaLabel)}</a>`
      : '';
    const isContain = item.imageFit === 'contain';

    return `
      <article class="announcement-slide" data-carousel-slide="${idx}" aria-hidden="${idx === 0 ? 'false' : 'true'}">
        <div class="announcement-slide-media ${isContain ? 'is-contain' : ''}">
          <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt || item.title)}" width="${Number(img.width) || 640}" height="${Number(img.height) || 400}" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async">
        </div>
        <div class="announcement-slide-body">
          <div class="announcement-meta-row">
            <span class="announcement-category-pill">${escapeHtml(item.category || 'Pengumuman')}</span>
            ${dateRange ? `<span class="announcement-date-text num-tabular">${escapeHtml(dateRange)}</span>` : ''}
          </div>
          <h3>${escapeHtml(item.title || 'Informasi Layanan')}</h3>
          <p>${escapeHtml(item.message || '')}</p>
          ${ctaHtml ? `<div class="announcement-cta-row">${ctaHtml}</div>` : ''}
        </div>
      </article>
    `;
  }).join('');

  const multiSlide = active.length > 1;
  const dotsHtml = multiSlide ? `
    <div class="announcement-controls-bar">
      <div class="announcement-dots" role="tablist" aria-label="Pilih slide pengumuman">
        ${active.map((item, idx) => `
          <button type="button" class="announcement-dot${idx === 0 ? ' is-active' : ''}" data-carousel-dot="${idx}" aria-label="Slide ${idx + 1}: ${escapeHtml(item.title || 'Pengumuman')}" aria-selected="${idx === 0 ? 'true' : 'false'}"></button>
        `).join('')}
      </div>
      <div class="announcement-nav-btns">
        <button type="button" class="announcement-carousel-btn" data-carousel-prev aria-label="Slide pengumuman sebelumnya">
          <svg class="aui-lucide-icon" data-aui-icon="chevron-left" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button type="button" class="announcement-carousel-btn" data-carousel-next aria-label="Slide pengumuman berikutnya">
          <svg class="aui-lucide-icon" data-aui-icon="chevron-right" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
    <div class="announcement-progress" aria-hidden="true"><span class="announcement-progress-bar"></span></div>
  ` : '';

  return `
    <section id="pengumuman" class="announcements-section animate-ui-reveal" aria-labelledby="heading-pengumuman">
      <div class="container">
        <div class="ledger-header">
          <div class="ledger-title-group">
            <h2 id="heading-pengumuman">${escapeHtml(sectionTitle || 'Berita, Event, dan Pengumuman')}</h2>
          </div>
        </div>
        <div class="announcement-carousel" data-announcement-carousel data-slide-count="${active.length}" role="region" aria-roledescription="carousel" aria-label="${escapeHtml(sectionTitle || 'Berita, Event, dan Pengumuman')}">
          <div class="announcement-viewport">
            <div class="announcement-track" data-carousel-track>
              ${slidesHtml}
            </div>
          </div>
          ${dotsHtml}
        </div>
      </div>
    </section>
  `;
}

function renderPublicPage(db, options = {}) {
  const isPreview = Boolean(options.preview);
  const content = isPreview ? db.draftContent : db.publishedContent;
  const mediaList = db.media || [];
  const wita = getWitaStatus(content.hours || {});

  const siteLogo = getMediaById(mediaList, content.identity?.siteLogoId);
  const agencyLogo = getMediaById(mediaList, content.identity?.agencyLogoId);
  const sharePreviewMedia = getMediaById(mediaList, content.identity?.sharePreviewImageId || content.hero?.heroImageId);
  const heroMedia = getMediaById(mediaList, content.hero?.heroImageId);
  const orgMedia = getMediaById(mediaList, content.profile?.orgStructureImageId);
  const announcementsSectionHtml = renderAnnouncementsCarouselSection(
    content.announcements,
    mediaList,
    wita.isoDate,
    content.seo?.sectionTitles?.announcements || 'Berita, Event, dan Pengumuman'
  );

  const activeServices = (content.services || [])
    .filter((s) => s.active !== false)
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const sortedLocations = (content.locations || [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const primaryLocation = sortedLocations.find((l) => l.isPrimary) || sortedLocations[0];
  const branchLocations = sortedLocations.filter((l) => l !== primaryLocation);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: content.identity?.siteName || 'SAPA NAMBASO',
    alternateName: content.identity?.siteFullName || '',
    description: content.seo?.metaDescription || '',
    email: content.contacts?.email || '',
    telephone: content.contacts?.phoneNumber || '',
    address: primaryLocation ? {
      '@type': 'PostalAddress',
      streetAddress: primaryLocation.address,
      addressLocality: 'Kota Palu',
      addressRegion: 'Sulawesi Tengah',
      addressCountry: 'ID'
    } : undefined
  };

  const taxUrl = safeUrl(content.taxCheck?.targetUrl, 'https://bapenda.sultengprov.go.id/pkbv2');
  const taxLabel = escapeHtml(content.taxCheck?.buttonLabel || 'Cek Pajak Kendaraan');

  const previewBanner = isPreview ? `
    <div class="preview-banner" role="region" aria-label="Mode pratinjau draf">
      <div class="container preview-banner-inner">
        <p><strong>Mode Pratinjau Draf:</strong> Anda sedang melihat perubahan yang belum diterbitkan ke publik.</p>
        <a href="/admin" class="btn btn-secondary btn-sm">Kembali ke Panel Admin</a>
      </div>
    </div>
  ` : '';

  const weeklyList = content.hours?.weekly || [];
  const weekdayRows = weeklyList.filter((d) => d.dayIndex >= 1 && d.dayIndex <= 5 && d.isOpen);
  const satRow = weeklyList.find((d) => d.dayIndex === 6);
  const sunRow = weeklyList.find((d) => d.dayIndex === 0);

  const weekdayTimeText = weekdayRows.length
    ? `${(weekdayRows[0].openTime || '08:00').replace(':', '.')} - ${(weekdayRows[0].closeTime || '15:00').replace(':', '.')}`
    : '08.00 - 15.00';
  const satTimeText = satRow && satRow.isOpen
    ? `${(satRow.openTime || '08:00').replace(':', '.')} - ${(satRow.closeTime || '12:00').replace(':', '.')}`
    : 'Tutup';
  const sunStatusText = sunRow && sunRow.isOpen
    ? `${(sunRow.openTime || '08:00').replace(':', '.')} - ${(sunRow.closeTime || '12:00').replace(':', '.')}`
    : 'Tutup';

  const hoursTitleClean = String(content.seo?.sectionTitles?.hours || 'Jam Layanan').replace(/\s+WITA\b/gi, '').trim() || 'Jam Layanan';

  const todayIndonesianDate = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const exceptionItems = (content.hours?.exceptions || []).map((ex) => `
    <li>
      <strong>${escapeHtml(ex.date)}:</strong> ${escapeHtml(ex.title)} (${ex.status === 'closed' ? 'Tutup' : `${escapeHtml(ex.openTime)} s.d. ${escapeHtml(ex.closeTime)}`})${ex.note ? `, ${escapeHtml(ex.note)}` : ''}
    </li>
  `).join('');

  const servicesHtml = activeServices.map((svc, idx) => {
    const numberTag = String(idx + 1).padStart(2, '0');
    const feeRows = (svc.pnbpFees || []).map((fee) => `
      <tr>
        <td>${escapeHtml(fee.item)}</td>
        <td class="num-tabular"><strong>${escapeHtml(fee.amount)}</strong></td>
        <td>${escapeHtml(fee.note || '')}</td>
      </tr>
    `).join('');
    const reqItems = (svc.requirements || []).map((req) => `
      <li>${escapeHtml(req)}</li>
    `).join('');
    const searchTokens = `${svc.name} ${svc.summary} ${(svc.requirements || []).join(' ')}`.toLowerCase();

    return `
      <article class="service-ledger-item" data-service-id="${escapeHtml(svc.id)}" data-service-name="${escapeHtml(svc.name)}" data-search="${escapeHtml(searchTokens)}">
        <details class="service-details" data-service-track="${escapeHtml(svc.id)}">
          <summary class="service-summary">
            <span class="service-num num-tabular" aria-hidden="true">${numberTag}</span>
            <span class="service-heading-wrap">
              <span class="service-name">${escapeHtml(svc.name)}</span>
              <span class="service-brief">${escapeHtml(svc.summary)}</span>
            </span>
            <span class="service-toggle-icon" aria-hidden="true">
              <svg class="aui-lucide-icon" data-aui-icon="chevron-down" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </summary>
          <div class="service-body">
            <div class="service-columns">
              <div class="service-panel">
                <h3>Rincian Biaya (PNBP dan Pajak)</h3>
                <div class="table-scroll">
                  <table class="ledger-table">
                    <thead>
                      <tr>
                        <th scope="col">Komponen</th>
                        <th scope="col">Biaya</th>
                        <th scope="col">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${feeRows || '<tr><td colspan="3">[DATA RESMI DIISI PETUGAS]</td></tr>'}
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="service-panel">
                <h3>Dokumen Persyaratan</h3>
                <ul class="req-list">
                  ${reqItems || '<li>[DATA RESMI DIISI PETUGAS]</li>'}
                </ul>
              </div>
            </div>
          </div>
        </details>
      </article>
    `;
  }).join('');

  const primaryLocHtml = primaryLocation ? (() => {
    const img = getMediaById(mediaList, primaryLocation.imageId);
    const mapHref = safeUrl(primaryLocation.mapUrl || buildGoogleMapsDirectionsUrl(primaryLocation.name, primaryLocation.address));
    return `
      <article class="location-primary-card">
        <div class="location-primary-media">
          <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt)}" width="${Number(img.width) || 640}" height="${Number(img.height) || 420}" loading="lazy" decoding="async">
        </div>
        <div class="location-primary-body">
          <span class="location-role-label">Kantor Induk</span>
          <h3>${escapeHtml(primaryLocation.name)}</h3>
          <p class="location-address">${escapeHtml(primaryLocation.address)}</p>
          <dl class="location-meta-list">
            <div>
              <dt>Layanan tersedia</dt>
              <dd>${escapeHtml(primaryLocation.serviceScope || 'Semua layanan Samsat Palu')}</dd>
            </div>
            <div>
              <dt>Jam operasional</dt>
              <dd>${escapeHtml(primaryLocation.hoursNote || '')}</dd>
            </div>
          </dl>
          <div class="location-actions">
            <a href="${escapeHtml(mapHref)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" data-track-action="directions" data-location-id="${escapeHtml(primaryLocation.id)}" data-location-name="${escapeHtml(primaryLocation.name)}">Petunjuk Arah Peta</a>
            ${branchLocations.length ? `<button type="button" id="open-branches-btn" class="btn btn-secondary">Lihat Semua Gerai Layanan</button>` : ''}
          </div>
        </div>
      </article>
    `;
  })() : '';

  const branchCardsHtml = branchLocations.map((loc) => {
    const img = getMediaById(mediaList, loc.imageId);
    const mapHref = safeUrl(loc.mapUrl || buildGoogleMapsDirectionsUrl(loc.name, loc.address));
    return `
      <article class="location-card">
        <div class="location-card-media">
          <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt)}" width="${Number(img.width) || 480}" height="${Number(img.height) || 300}" loading="lazy" decoding="async">
        </div>
        <div class="location-card-body">
          <h3>${escapeHtml(loc.name)}</h3>
          <p class="location-address">${escapeHtml(loc.address)}</p>
          <p class="location-scope"><strong>Layanan:</strong> ${escapeHtml(loc.serviceScope || 'Pengesahan Pajak Tahunan')}</p>
          <p class="location-hours"><strong>Jam:</strong> ${escapeHtml(loc.hoursNote || '')}</p>
          <div class="location-actions">
            <a href="${escapeHtml(mapHref)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" data-track-action="directions" data-location-id="${escapeHtml(loc.id)}" data-location-name="${escapeHtml(loc.name)}">Petunjuk Arah</a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  const orgRolesList = content.profile?.orgRoles || [];
  const officialCardsHtml = orgRolesList.map((r, idx) => {
    const photo = getMediaById(mediaList, r.photoId || 'media-foto-pejabat');
    const holderDisplay = r.holder || '[DATA NAMA PEJABAT DIISI PETUGAS]';
    const roleDisplay = r.role || 'Pejabat Struktural';
    const taglineDisplay = r.tagline || `Mengenal Lebih Dekat ${roleDisplay}`;
    return `
      <article class="official-card" data-official-card="${idx}" tabindex="0" role="button" aria-label="Lihat profil ${escapeHtml(holderDisplay)}">
        <div class="official-card-photo">
          <img src="${escapeHtml(photo.url)}" alt="Foto ${escapeHtml(holderDisplay)}" width="${Number(photo.width) || 320}" height="${Number(photo.height) || 400}" loading="lazy" decoding="async">
        </div>
        <div class="official-card-body">
          <span class="official-role-badge">${escapeHtml(roleDisplay)}</span>
          <h4 class="official-holder-name">${escapeHtml(holderDisplay)}</h4>
          <p class="official-tagline">${escapeHtml(taglineDisplay)}</p>
        </div>
      </article>
    `;
  }).join('');

  const officialPanelsHtml = orgRolesList.map((r, idx) => {
    const photo = getMediaById(mediaList, r.photoId || 'media-foto-pejabat');
    const holderDisplay = r.holder || '[DATA NAMA PEJABAT DIISI PETUGAS]';
    const roleDisplay = r.role || 'Pejabat Struktural';
    const taglineDisplay = r.tagline || `Mengenal Lebih Dekat ${roleDisplay}`;
    const singleDescription = r.bio || r.initiatives || r.philosophy || 'Informasi profil pejabat sedang diperbarui oleh petugas.';

    return `
      <div class="pejabat-showcase-panel" data-official-panel="${idx}" hidden>
        <div class="pejabat-showcase-header">
          <p class="pejabat-showcase-role">${escapeHtml(roleDisplay)}</p>
          <div class="pejabat-divider" aria-hidden="true"><span></span></div>
        </div>
        <div class="pejabat-showcase-grid">
          <div class="pejabat-showcase-photo">
            <img src="${escapeHtml(photo.url)}" alt="Foto resmi ${escapeHtml(holderDisplay)}" width="${Number(photo.width) || 320}" height="${Number(photo.height) || 400}" loading="lazy" decoding="async">
          </div>
          <div class="pejabat-showcase-content">
            <h3 class="pejabat-showcase-name">${escapeHtml(holderDisplay)}</h3>
            <p class="pejabat-showcase-subtitle">${escapeHtml(taglineDisplay)}</p>
            <div class="pejabat-description-box">
              <p>${escapeHtml(singleDescription)}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const faqHtml = (content.faq || []).map((item) => `
    <details class="faq-item">
      <summary>
        <span>${escapeHtml(item.question)}</span>
        <span class="faq-chevron" aria-hidden="true">
          <svg class="aui-lucide-icon" data-aui-icon="chevron-down" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </summary>
      <div class="faq-answer">
        <p>${escapeHtml(item.answer)}</p>
      </div>
    </details>
  `).join('');

  const partnersHtml = (content.partners || []).map((partner) => {
    const logo = getMediaById(mediaList, partner.logoId);
    return `
      <a href="${escapeHtml(safeUrl(partner.url))}" target="_blank" rel="noopener noreferrer" class="partner-item" data-track-action="partner_link" data-action-label="${escapeHtml(partner.name)}">
        <img src="${escapeHtml(logo.url)}" alt="${escapeHtml(logo.alt)}" width="${Number(logo.width) || 180}" height="${Number(logo.height) || 48}" loading="lazy" decoding="async">
        <span class="partner-text">
          <strong>${escapeHtml(partner.name)}</strong>
          <span>${escapeHtml(partner.description)}</span>
        </span>
      </a>
    `;
  }).join('');

  const splashEnabled = Boolean(content.identity?.splashEnabled);
  const splashShowText = content.identity?.splashShowText !== false;
  const splashMedia = getMediaById(mediaList, content.identity?.splashImageId || content.identity?.siteLogoId);
  const splashTitle = content.identity?.splashTitle || 'Selamat Datang di SAPA NAMBASO';
  const splashSubtitle = content.identity?.splashSubtitle || '';
  const splashHtml = splashEnabled ? `
  <div id="sapa-splash" class="sapa-splash" role="status" aria-live="polite" data-duration="3000">
    <div class="sapa-splash-inner">
      <div class="sapa-splash-media">
        <img src="${escapeHtml(splashMedia.url)}" alt="${escapeHtml(splashMedia.alt || splashTitle)}" decoding="async">
      </div>
      ${splashShowText ? `
        <div class="sapa-splash-copy">
          <strong class="sapa-splash-title">${escapeHtml(splashTitle)}</strong>
          ${splashSubtitle ? `<span class="sapa-splash-subtitle">${escapeHtml(splashSubtitle)}</span>` : ''}
        </div>
      ` : ''}
    </div>
  </div>` : '';

  return `<!doctype html>
<html lang="id" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(content.seo?.pageTitle || 'SAPA NAMBASO | Layanan Samsat Palu')}</title>
  <meta name="description" content="${escapeHtml(content.seo?.metaDescription || '')}">
  <meta property="og:title" content="${escapeHtml(content.seo?.pageTitle || 'SAPA NAMBASO')}">
  <meta property="og:description" content="${escapeHtml(content.seo?.metaDescription || '')}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${escapeHtml(safeUrl(sharePreviewMedia.url))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${escapeHtml(safeUrl(sharePreviewMedia.url))}">
  <link rel="icon" href="${escapeHtml(safeUrl(content.identity?.faviconUrl || siteLogo.url))}">
  <link rel="stylesheet" href="/styles.css">${(() => {
    const customCss = buildThemeCss(content.identity?.themeColor, content.identity?.themeStyle);
    return customCss ? `\n  <style id="sapa-custom-theme">\n${customCss}\n  </style>` : '';
  })()}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  ${splashHtml}
  <a href="#konten-utama" class="skip-link">Langsung ke konten utama</a>
  ${previewBanner}

  <header class="site-header">
    <div class="container header-inner">
      <div class="brand-lockup">
        <a href="#beranda" class="brand-link" aria-label="Beranda ${escapeHtml(content.identity?.siteName || 'SAPA NAMBASO')}">
          <img src="${escapeHtml(siteLogo.url)}" alt="${escapeHtml(siteLogo.alt)}" width="${Number(siteLogo.width) || 180}" height="${Number(siteLogo.height) || 48}" class="brand-logo">
          <img src="${escapeHtml(agencyLogo.url)}" alt="${escapeHtml(agencyLogo.alt)}" width="${Number(agencyLogo.width) || 180}" height="${Number(agencyLogo.height) || 48}" class="brand-logo brand-logo-agency">
        </a>
      </div>

      <nav class="desktop-nav" aria-label="Navigasi utama">
        <a href="#beranda">Beranda</a>
        ${announcementsSectionHtml ? '<a href="#pengumuman">Pengumuman</a>' : ''}
        <a href="#profil">Profil</a>
        <a href="#layanan">Layanan</a>
        <a href="#jam-layanan">Jam Layanan</a>
        <a href="#lokasi">Lokasi</a>
        <a href="#kontak">Kontak</a>
      </nav>

      <div class="header-actions">
        <button type="button" id="theme-toggle" class="theme-toggler-btn" aria-pressed="false" aria-label="Ganti ke mode gelap" title="Ganti Mode Terang / Gelap" data-slot="theme-toggler-button">
          <span class="theme-icon-swap" aria-hidden="true">
            <svg class="theme-icon theme-icon-sun aui-lucide-icon" data-aui-icon="sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
            <svg class="theme-icon theme-icon-moon aui-lucide-icon" data-aui-icon="moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </span>
          <span class="sr-only">Ganti Mode Terang / Gelap</span>
        </button>
        <a href="${escapeHtml(taxUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-accent nav-tax-cta" data-track-action="cek_pajak">${taxLabel}</a>
        <button type="button" id="mobile-menu-btn" class="btn btn-secondary mobile-menu-toggle" aria-expanded="false" aria-controls="mobile-nav-drawer">Menu</button>
      </div>
    </div>

    <div id="mobile-nav-drawer" class="mobile-nav-drawer" hidden>
      <nav aria-label="Navigasi ponsel">
        <a href="#beranda">Beranda</a>
        ${announcementsSectionHtml ? '<a href="#pengumuman">Berita &amp; Pengumuman</a>' : ''}
        <a href="#profil">Profil Instansi</a>
        <a href="#layanan">Jenis Layanan</a>
        <a href="#jam-layanan">Jam Layanan</a>
        <a href="#lokasi">Lokasi Kantor</a>
        <a href="#kontak">Kontak dan Pengaduan</a>
        <a href="#faq">Pertanyaan Umum</a>
      </nav>
    </div>
  </header>

  <main id="konten-utama" tabindex="-1">
    <section id="beranda" class="hero-section">
      <div class="container">
        <div class="hero-showcase">
          <div class="hero-grid">
            <div class="hero-copy">
              <h1>${escapeHtml(content.hero?.title || 'SAPA NAMBASO')}</h1>
              <p class="hero-full-name">${escapeHtml(content.identity?.siteFullName || '')}</p>
              <p class="hero-subtitle">${escapeHtml(content.hero?.subtitle || '')}</p>
              <div class="hero-cta-group">
                <a href="${escapeHtml(taxUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-hero-primary btn-lg" data-track-action="cek_pajak">${escapeHtml(content.hero?.primaryCtaLabel || taxLabel)}</a>
                <a href="#lokasi" class="btn btn-hero-secondary btn-lg">${escapeHtml(content.hero?.secondaryLocationLabel || 'Lokasi Kantor')}</a>
                <a href="#kontak" class="btn btn-hero-ghost btn-lg">${escapeHtml(content.hero?.secondaryContactLabel || 'Hubungi Kami')}</a>
              </div>
            </div>
            <div class="hero-dashboard-card">
              <div class="hero-dashboard-top">
                <div class="hero-op-status">
                  <span class="status-badge ${wita.isOpen ? 'status-open' : 'status-closed'}">
                    <span class="status-symbol" aria-hidden="true">${wita.isOpen ? 'BUKA' : 'TUTUP'}</span>
                    <span>${wita.isOpen ? 'Loket beroperasi' : 'Loket tutup'}</span>
                  </span>
                  <span class="hero-op-time num-tabular">${escapeHtml(wita.currentTimeWita)}</span>
                </div>
                <div class="hero-op-office">
                  <span class="hero-op-office-name">${escapeHtml(primaryLocation ? primaryLocation.name : 'Kantor Induk Samsat Palu')}</span>
                  <a href="#jam-layanan" class="hero-op-link">Lihat jadwal</a>
                </div>
              </div>
              <figure class="hero-figure">
                <img src="${escapeHtml(heroMedia.url)}" alt="${escapeHtml(heroMedia.alt)}" width="${Number(heroMedia.width) || 640}" height="${Number(heroMedia.height) || 420}" fetchpriority="high" decoding="sync">
                <figcaption>${escapeHtml(content.hero?.heroCaption || '')}</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${announcementsSectionHtml}

    <section id="jam-layanan" class="hours-section animate-ui-reveal" aria-labelledby="heading-jam">
      <div class="container">
        <div class="ledger-header">
          <div class="ledger-title-group">
            <h2 id="heading-jam">${escapeHtml(hoursTitleClean)}</h2>
          </div>
        </div>

        <div class="hours-compact-shell wita-status-bar" data-hours-config='${escapeHtml(JSON.stringify(content.hours || {}))}'>
          <div class="hours-compact-grid">
            <article class="hours-compact-card hours-live-card">
              <div class="hours-card-top">
                <span class="hours-eyebrow">JAM LAYANAN TERPADU</span>
                <span id="wita-status-badge" class="status-pill ${wita.isOpen ? 'status-open' : 'status-closed'}">
                  <span class="status-dot" aria-hidden="true"></span>
                  <span id="wita-status-text">${wita.isOpen ? 'Loket Buka' : 'Loket Tutup'}</span>
                </span>
              </div>
              <div class="hours-clock-row">
                <strong id="wita-clock-value" class="hours-clock-digits num-tabular">${escapeHtml(wita.currentTimeWita.replace(' WITA', ''))}:00</strong>
              </div>
              <p id="wita-date-value" class="hours-live-date">${escapeHtml(todayIndonesianDate)}</p>
              <p id="wita-status-reason" class="hours-sync-note">${escapeHtml(wita.reason)}</p>
            </article>

            <article class="hours-compact-card">
              <div class="hours-card-head">
                <span class="hours-day-icon" aria-hidden="true">
                  <svg class="aui-lucide-icon" data-aui-icon="calendar" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                <h3>Senin - Jumat</h3>
              </div>
              <p class="hours-big-time num-tabular">${escapeHtml(weekdayTimeText)}</p>
              <p class="hours-sub-label">Layanan Penuh</p>
              <p class="hours-card-desc">Pelayanan loket pendaftaran, kasir Bank Sulteng, dan pengesahan STNK.</p>
            </article>

            <article class="hours-compact-card">
              <div class="hours-card-head">
                <span class="hours-day-icon" aria-hidden="true">
                  <svg class="aui-lucide-icon" data-aui-icon="calendar" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                <h3>Sabtu</h3>
              </div>
              <p class="hours-big-time num-tabular">${escapeHtml(satTimeText)}</p>
              <p class="hours-sub-label">Setengah Hari</p>
              <p class="hours-card-desc">Fokus pembayaran pajak tahunan di Kantor Induk dan Samsat Drive Thru.</p>
            </article>

            <article class="hours-compact-card hours-closed-card">
              <div class="hours-card-head">
                <span class="hours-day-icon hours-day-icon-closed" aria-hidden="true">
                  <svg class="aui-lucide-icon" data-aui-icon="calendar" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                <h3>Minggu &amp; Libur</h3>
              </div>
              <p class="hours-big-time hours-closed-text">${escapeHtml(sunStatusText)}</p>
              <p class="hours-sub-label">Hari Libur Nasional</p>
              <p class="hours-card-desc">${escapeHtml(content.hours?.holidayNote || 'Gunakan e-Samsat Digital Nasional / SIGNAL untuk transaksi di hari libur.')}</p>
            </article>
          </div>
          ${exceptionItems ? `<div class="hours-exception-strip"><strong>Pengecualian Jadwal Terdekat:</strong> <ul class="exception-list">${exceptionItems}</ul></div>` : ''}
        </div>
      </div>
    </section>

    <section id="layanan" class="services-section animate-ui-reveal" aria-labelledby="heading-layanan">
      <div class="container">
        <div class="ledger-header">
          <div class="ledger-title-group">
            <h2 id="heading-layanan">${escapeHtml(content.seo?.sectionTitles?.services || 'Jenis Layanan, Biaya PNBP, dan Persyaratan')}</h2>
          </div>
        </div>
        <p class="section-intro">Ketuk atau pilih nama layanan di bawah untuk membuka rincian tarif PNBP dan dokumen persyaratan yang perlu disiapkan sebelum ke loket.</p>

        <div class="service-search-bar">
          <label for="cari-layanan" class="search-label">Cari layanan atau dokumen persyaratan</label>
          <div class="search-input-row">
            <input type="search" id="cari-layanan" placeholder="Contoh: STNK, BPKB, mutasi, atau balik nama" autocomplete="off">
            <button type="button" id="reset-cari-layanan" class="btn btn-secondary" hidden>Hapus Pencarian</button>
          </div>
        </div>

        <div id="services-list" class="services-ledger">
          ${servicesHtml}
        </div>

        <div id="services-empty" class="state-box state-empty" hidden>
          <h3>Layanan tidak ditemukan</h3>
          <p id="services-empty-msg">Tidak ada layanan yang cocok dengan kata kunci pencarian Anda.</p>
          <button type="button" id="empty-reset-search" class="btn btn-secondary">Tampilkan Semua Layanan</button>
        </div>
      </div>
    </section>

    <section id="profil" class="profile-section animate-ui-reveal" aria-labelledby="heading-profil">
      <div class="container">
        <div class="ledger-header">
          <div class="ledger-title-group">
            <h2 id="heading-profil">${escapeHtml(content.seo?.sectionTitles?.profile || content.profile?.sectionTitle || 'Profil UPTB Pendapatan Daerah Wilayah I Palu')}</h2>
          </div>
        </div>

        <div class="profile-cards-stack">
          <div class="profile-card profile-desc-card">
            <h3 class="profile-card-title text-center">${escapeHtml(content.profile?.aboutTitle || 'UPTB Pendapatan Daerah Wilayah I Palu')}</h3>
            <p class="profile-card-text text-center">${escapeHtml(content.profile?.aboutText || '')}</p>
          </div>

          <div class="profile-vm-grid">
            <div class="profile-card profile-vision-card">
              <h3 class="profile-card-title text-center">Visi</h3>
              <p class="profile-vision-text text-center">${escapeHtml(content.profile?.vision || '')}</p>
            </div>
            <div class="profile-card profile-mission-card">
              <h3 class="profile-card-title text-center">Misi</h3>
              <ol class="mission-list">
                ${(content.profile?.missions || []).map((m) => `<li>${escapeHtml(m)}</li>`).join('')}
              </ol>
            </div>
          </div>

          <div class="profile-card profile-org-card">
            <h3 class="profile-card-title text-center">${escapeHtml(content.profile?.orgStructureTitle || 'Struktur Organisasi')}</h3>
            <figure class="org-figure-centered">
              <img src="${escapeHtml(orgMedia.url)}" alt="${escapeHtml(orgMedia.alt)}" width="${Number(orgMedia.width) || 720}" height="${Number(orgMedia.height) || 400}" loading="lazy" decoding="async">
            </figure>
            <div class="profile-org-actions">
              <button type="button" id="open-pejabat-list-btn" class="btn btn-primary btn-block">Lihat Daftar Pejabat Struktural</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="lokasi" class="locations-section animate-ui-reveal" aria-labelledby="heading-lokasi">
      <div class="container">
        <div class="ledger-header">
          <div class="ledger-title-group">
            <h2 id="heading-lokasi">${escapeHtml(content.seo?.sectionTitles?.locations || 'Lokasi Kantor Induk dan Gerai Samsat Palu')}</h2>
          </div>
        </div>
        ${primaryLocHtml}
      </div>
    </section>

    <section id="kontak" class="contacts-section animate-ui-reveal" aria-labelledby="heading-kontak">
      <div class="container">
        <div class="contacts-header-split">
          <div class="contacts-title-col">
            <h2 id="heading-kontak">Saluran Komunikasi Resmi</h2>
          </div>
          <div class="contacts-desc-col">
            <p>Pilihan kanal komunikasi yang paling sesuai dengan kebutuhan administratif Anda. Respon cepat dilayani oleh petugas loket resmi.</p>
          </div>
        </div>

        <div class="contact-cards-grid">
          <article class="contact-compact-card">
            <div class="contact-card-top">
              <span class="contact-icon-box contact-icon-wa" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.07c-.24.68-1.41 1.3-1.95 1.38-.5.07-1.13.1-1.82-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.18-4.93-4.37-.15-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.01-2.42.27-.29.58-.36.77-.36.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.32-.29.48-.15.17-.3.38-.43.51-.14.15-.29.31-.12.6.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.42.29.15.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.15.27.1 1.69.8 1.98.94.29.15.48.22.55.34.07.12.07.69-.17 1.37z"/></svg>
              </span>
              <span class="contact-pill contact-pill-green">Responsif</span>
            </div>
            <h3>WhatsApp Resmi</h3>
            <p class="contact-card-desc">Konsultasi persyaratan berkas, cek status mutasi, dan layanan aduan cepat.</p>
            <p class="contact-card-value num-tabular">${escapeHtml(content.contacts?.whatsappNumber || '')}</p>
            <a href="${escapeHtml(safeUrl(content.contacts?.whatsappUrl))}" target="_blank" rel="noopener noreferrer" class="btn btn-wa-solid contact-card-cta" data-track-action="whatsapp">Chat WhatsApp Sekarang &nearr;</a>
          </article>

          <article class="contact-compact-card">
            <div class="contact-card-top">
              <span class="contact-icon-box" aria-hidden="true">
                <svg class="aui-lucide-icon" data-aui-icon="mail" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <span class="contact-pill">Korespondensi</span>
            </div>
            <h3>Email Resmi</h3>
            <p class="contact-card-desc">Pengiriman berkas dinas, dokumen formal, permohonan dispensasi, dan aduan tertulis.</p>
            <p class="contact-card-value contact-card-email">${escapeHtml(content.contacts?.email || '')}</p>
            <a href="mailto:${escapeHtml(content.contacts?.email || '')}?subject=Layanan%20Samsat%20Palu" class="btn btn-primary contact-card-cta" data-track-action="email">Kirim Pesan Email &blacktriangleright;</a>
          </article>

          <article class="contact-compact-card">
            <div class="contact-card-top">
              <span class="contact-icon-box" aria-hidden="true">
                <svg class="aui-lucide-icon" data-aui-icon="share-2" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </span>
              <span class="contact-pill">Informasi</span>
            </div>
            <h3>Media Sosial Resmi</h3>
            <p class="contact-card-desc">Kabar pemutihan denda, jadwal keliling, dan siaran langsung kegiatan UPTB Palu.</p>
            <div class="contact-social-handles">
              <span><strong>Instagram:</strong> ${escapeHtml(content.contacts?.instagramHandle || '')}</span>
              <span><strong>Facebook:</strong> ${escapeHtml(content.contacts?.facebookName || '')}</span>
              <span><strong>TikTok:</strong> ${escapeHtml(content.contacts?.tiktokHandle || content.contacts?.instagramHandle || '')}</span>
            </div>
            <div class="contact-social-pills">
              <a href="${escapeHtml(safeUrl(content.contacts?.instagramUrl))}" target="_blank" rel="noopener noreferrer" class="social-pill-btn" data-track-action="social_instagram" aria-label="Instagram Resmi">
                <span>Instagram &nearr;</span>
              </a>
              <a href="${escapeHtml(safeUrl(content.contacts?.facebookUrl))}" target="_blank" rel="noopener noreferrer" class="social-pill-btn" data-track-action="social_facebook" aria-label="Facebook Resmi">
                <span>Facebook &nearr;</span>
              </a>
              <a href="${escapeHtml(safeUrl(content.contacts?.tiktokUrl))}" target="_blank" rel="noopener noreferrer" class="social-pill-btn" data-track-action="social_tiktok" aria-label="TikTok Resmi">
                <span>TikTok &nearr;</span>
              </a>
            </div>
          </article>

          <article class="contact-compact-card">
            <div class="contact-card-top">
              <span class="contact-icon-box" aria-hidden="true">
                <svg class="aui-lucide-icon" data-aui-icon="building-2" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>
              </span>
              <span class="contact-pill">Kantor Induk</span>
            </div>
            <h3>Kantor Pusat Palu</h3>
            <p class="contact-card-desc">Loket utama pengurusan 5 tahunan, cek fisik, mutasi luar kota, dan BBNKB.</p>
            <p class="contact-card-address">${escapeHtml(primaryLocation ? primaryLocation.address : 'Jl. Kartini, Lolu Utara, Kec. Palu Selatan, Kota Palu, Sulawesi Tengah')}</p>
            <a href="${escapeHtml(safeUrl(primaryLocation?.mapUrl || buildGoogleMapsDirectionsUrl(primaryLocation?.name, primaryLocation?.address)))}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary contact-card-cta" data-track-action="directions" data-location-id="${escapeHtml(primaryLocation?.id || 'loc-induk')}" data-location-name="${escapeHtml(primaryLocation?.name || 'Kantor Induk')}">Petunjuk Arah Maps &blacktriangleright;</a>
          </article>
        </div>
      </div>
    </section>

    <section id="pengaduan" class="complaint-section animate-ui-reveal" aria-labelledby="complaint-heading">
      <div class="container">
        <div class="complaint-card">
          <div class="complaint-header">
            <div class="complaint-badge-row">
              <span class="complaint-icon-badge" aria-hidden="true">
                <svg class="aui-lucide-icon" data-aui-icon="message-square" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span>
              <span class="complaint-badge-title">ASPIRASI &amp; PENGADUAN WARGA</span>
            </div>
            <h2 id="complaint-heading" class="complaint-main-title">${escapeHtml(content.contacts?.complaintTitle || 'Formulir Pengaduan Pelayanan')}</h2>
            <p class="complaint-intro-text">${escapeHtml(content.contacts?.complaintText || 'Laporkan kendala antrean, pungutan tidak resmi, atau berikan usulan perbaikan loket Samsat Palu secara langsung. Sesuai prinsip perlindungan privasi PRD, formulir ini tidak meminta NIK atau data pribadi rahasia.')}</p>
          </div>

          <form id="complaint-form" class="complaint-form-layout" data-wa-url="${escapeHtml(safeUrl(content.contacts?.whatsappUrl))}">
            <div class="form-row-2col">
              <div class="form-group">
                <label for="complaint-name">Nama / Inisial Pelapor <span class="required-star">*</span></label>
                <input id="complaint-name" name="name" type="text" required placeholder="Contoh: Ahmad / Inisial A.R.">
              </div>
              <div class="form-group">
                <label for="complaint-phone">Nomor WhatsApp Aktif <span class="required-star">*</span></label>
                <input id="complaint-phone" name="phone" type="tel" required placeholder="08xxxxxxxxxx">
              </div>
            </div>

            <div class="form-row-2col">
              <div class="form-group">
                <label for="complaint-category">Kategori Layanan <span class="required-star">*</span></label>
                <select id="complaint-category" name="category" required>
                  <option value="">Pilih Kategori...</option>
                  <option value="Pajak Tahunan">Pajak Tahunan</option>
                  <option value="Pergantian STNK 5 Tahun">Pergantian STNK 5 Tahun</option>
                  <option value="Mutasi Masuk / Keluar">Mutasi Masuk / Keluar</option>
                  <option value="Kendaraan Baru / Balik Nama">Kendaraan Baru / Balik Nama</option>
                  <option value="Pelayanan Loket / Antrean">Pelayanan Loket / Antrean</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div class="form-group">
                <label for="complaint-location">Lokasi Pelayanan Terkait <span class="required-star">*</span></label>
                <select id="complaint-location" name="location" required>
                  ${sortedLocations.map((loc) => `<option value="${escapeHtml(loc.name)}">${escapeHtml(loc.name)}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="complaint-subject">Subjek Aduan / Usulan <span class="required-star">*</span></label>
              <input id="complaint-subject" name="subject" type="text" required placeholder="Contoh: Waktu tunggu cetak SKPD agak lama di loket 3">
            </div>

            <div class="form-group">
              <label for="complaint-details">Rincian Laporan / Pengaduan <span class="required-star">*</span></label>
              <textarea id="complaint-details" name="details" rows="4" required placeholder="Tuliskan tanggal kejadian, jam, nama loket bila ada, serta deskripsi keluhan dengan bahasa yang santun..."></textarea>
            </div>

            <div class="form-group form-consent-group">
              <label class="complaint-checkbox-label">
                <input type="checkbox" id="complaint-consent" required>
                <span>Saya menyatakan bahwa laporan ini dibuat dengan data yang sebenarnya tanpa muatan SARA, ujaran kebencian, atau hoaks demi evaluasi UPTB Samsat Palu.</span>
              </label>
            </div>

            <div class="complaint-footer-row">
              <span class="complaint-footer-note">Respon tiket melalui WhatsApp Petugas Admin</span>
              <button type="submit" class="btn btn-primary btn-submit-aduan">Kirimkan Aduan &blacktriangleright;</button>
            </div>
            <div id="complaint-feedback" class="complaint-feedback-box" hidden aria-live="polite"></div>
          </form>
        </div>
      </div>
    </section>

    <section id="faq" class="faq-section animate-ui-reveal" aria-labelledby="heading-faq">
      <div class="container">
        <div class="faq-header-centered">
          <span class="faq-badge-pill">
            <svg class="aui-lucide-icon" data-aui-icon="help-circle" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>PERTANYAAN WARGA (FAQ)</span>
          </span>
          <h2 id="heading-faq" class="faq-centered-title">${escapeHtml(content.seo?.sectionTitles?.faq || 'Sering Ditanyakan Seputar Pajak Kendaraan')}</h2>
          <p class="faq-centered-subtitle">Temukan jawaban cepat atas pertanyaan administratif paling sering diajukan warga Kota Palu tanpa perlu menunggu antrean loket.</p>
        </div>
        <div class="faq-list-wrap">
          ${faqHtml}
        </div>
      </div>
    </section>

    <section id="mitra" class="partners-section animate-ui-reveal" aria-labelledby="heading-mitra">
      <div class="container">
        <div class="partners-header-split">
          <div class="partners-title-col">
            <span class="partners-badge-pill">KOLABORASI TRIPARTIT</span>
            <h2 id="heading-mitra" class="partners-main-title">${escapeHtml(content.seo?.sectionTitles?.partners || 'Tim Pembina Samsat Terpadu Palu')}</h2>
          </div>
          <div class="partners-desc-col">
            <p>Sinergi 3 instansi pemerintah dalam memberikan kepastian hukum, perlindungan asuransi kecelakaan, serta transparansi penerimaan pajak daerah di Sulawesi Tengah.</p>
          </div>
        </div>

        <div class="partners-tripartite-grid">
          <article class="partner-tripartite-card">
            <div class="partner-card-icon-box" aria-hidden="true">
              <svg class="aui-lucide-icon" data-aui-icon="landmark" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 10v11"/><path d="M19 10v11"/><path d="M9 10v11"/><path d="M15 10v11"/><path d="M12 2l10 5H2l10-5z"/></svg>
            </div>
            <div class="partner-card-head">
              <h3>BAPENDA</h3>
              <p class="partner-card-sub">Provinsi Sulawesi Tengah</p>
            </div>
            <p class="partner-card-body">Bertanggung jawab penuh atas pengelolaan Pendapatan Asli Daerah (PAD) melalui PKB dan Bea Balik Nama Kendaraan Bermotor (BBNKB).</p>
            <a href="https://bapenda.sultengprov.go.id" target="_blank" rel="noopener noreferrer" class="partner-card-link">Portal Resmi Bapenda Sulteng &nearr;</a>
          </article>

          <article class="partner-tripartite-card">
            <div class="partner-card-icon-box" aria-hidden="true">
              <svg class="aui-lucide-icon" data-aui-icon="shield" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="partner-card-head">
              <h3>DITLANTAS</h3>
              <p class="partner-card-sub">Polda Sulawesi Tengah</p>
            </div>
            <p class="partner-card-body">Regulasi legalitas registrasi, identifikasi nomor kendaraan (TNKB), verifikasi keabsahan STNK, dan pengawasan fisik kendaraan.</p>
            <a href="https://korlantas.polri.go.id" target="_blank" rel="noopener noreferrer" class="partner-card-link">Portal Ditlantas Korlantas Polri &nearr;</a>
          </article>

          <article class="partner-tripartite-card">
            <div class="partner-card-icon-box" aria-hidden="true">
              <svg class="aui-lucide-icon" data-aui-icon="shield-plus" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>
            </div>
            <div class="partner-card-head">
              <h3>PT JASA RAHARJA</h3>
              <p class="partner-card-sub">Cabang Sulawesi Tengah</p>
            </div>
            <p class="partner-card-body">Penyelenggara perlindungan asuransi kecelakaan penumpang dan lalu lintas jalan melalui pengelolaan dana SWDKLLJ terpadu.</p>
            <a href="https://www.jasaraharja.co.id" target="_blank" rel="noopener noreferrer" class="partner-card-link">Website PT Jasa Raharja &nearr;</a>
          </article>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-pro-grid">
        <div class="footer-brand-col">
          <div class="footer-brand-row">
            <img src="${escapeHtml(siteLogo.url)}" alt="${escapeHtml(siteLogo.alt)}" width="120" height="32" class="footer-brand-logo">
            <strong>${escapeHtml(content.identity?.siteName || 'SAPA NAMBASO')}</strong>
          </div>
          <p class="footer-brand-desc">${escapeHtml(content.identity?.ownerName || 'Sistem Administrasi Pelayanan Pajak Daerah & Retribusi UPTB Pendapatan Daerah Wilayah I Palu, Bapenda Provinsi Sulawesi Tengah.')}</p>
          <span class="footer-trust-badge">
            <svg class="aui-lucide-icon" data-aui-icon="shield-check" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 14 15 11"/></svg>
            <span>Pelayanan Prima, Cepat &amp; Akuntabel</span>
          </span>
        </div>

        <div class="footer-col">
          <h3>TAUTAN CEPAT</h3>
          <ul>
            <li><a href="#layanan">Jadwal Samsat Keliling</a></li>
            <li><a href="${escapeHtml(taxUrl)}" target="_blank" rel="noopener noreferrer">Simulasi Tarif PKB &amp; BBNKB</a></li>
            <li><a href="#layanan">Panduan Pembayaran Digital</a></li>
            <li><a href="#layanan">Syarat Perpanjangan STNK</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3>KANTOR SAMSAT PALU</h3>
          <p class="footer-address">${escapeHtml(primaryLocation ? primaryLocation.address : 'Jl. Moh. Hatta No. 42, Lolu Utara, Kec. Palu Timur, Kota Palu, Sulawesi Tengah 94112')}</p>
          <p class="footer-hotline-label">Hotline / WhatsApp Resmi:</p>
          <a href="${escapeHtml(safeUrl(content.contacts?.whatsappUrl))}" target="_blank" rel="noopener noreferrer" class="footer-hotline-num num-tabular">${escapeHtml(content.contacts?.whatsappNumber || '0821-2854-4041')}</a>
        </div>

        <div class="footer-col">
          <h3>JAM OPERASIONAL PELAYANAN</h3>
          <div class="footer-hours-box">
            <div class="footer-hours-row">
              <strong>Senin - Kamis</strong>
              <span class="num-tabular">08:00 - 14:30 WITA</span>
            </div>
            <div class="footer-hours-row">
              <strong>Jumat</strong>
              <span class="num-tabular">08:00 - 11:30 WITA</span>
            </div>
            <div class="footer-hours-row">
              <strong>Sabtu</strong>
              <span class="num-tabular">08:30 - 12:00 WITA</span>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom-bar">
        <p class="footer-copyright">&copy; 2026 UPTB Pendapatan Daerah Wilayah I Palu &bull; Bapenda Provinsi Sulawesi Tengah. Hak Cipta Dilindungi.</p>
        <p class="footer-portal-note">Portal Informasi Layanan Pajak Daerah Resmi Pemerintah Provinsi Sulawesi Tengah</p>
      </div>
    </div>
  </footer>

  <div class="mobile-bottom-bar" role="region" aria-label="Akses cepat ponsel">
    <a href="${escapeHtml(taxUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-accent mobile-bar-btn" data-track-action="cek_pajak">${taxLabel}</a>
    <a href="#lokasi" class="btn btn-secondary mobile-bar-btn">Lokasi Kantor</a>
  </div>

  <dialog id="pejabat-list-dialog" class="civic-dialog glass-dialog" aria-labelledby="pejabat-list-title">
    <button type="button" class="glass-close-btn" data-close-dialog="pejabat-list-dialog" aria-label="Tutup daftar pejabat">
      <svg class="aui-lucide-icon" data-aui-icon="x" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="dialog-header glass-dialog-header">
      <h2 id="pejabat-list-title">Daftar Pejabat Struktural</h2>
    </div>
    <div class="dialog-body glass-dialog-body">
      <div class="official-cards-grid">
        ${officialCardsHtml || '<p class="muted-note">Data pejabat struktural belum ditambahkan.</p>'}
      </div>
    </div>
  </dialog>

  <dialog id="branches-dialog" class="civic-dialog glass-dialog" aria-labelledby="branches-modal-title">
    <button type="button" class="glass-close-btn" data-close-dialog="branches-dialog" aria-label="Tutup daftar gerai">
      <svg class="aui-lucide-icon" data-aui-icon="x" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="dialog-header glass-dialog-header">
      <h2 id="branches-modal-title">Seluruh Gerai dan Unit Layanan Samsat Palu</h2>
    </div>
    <div class="dialog-body glass-dialog-body">
      <div class="locations-grid">
        ${branchCardsHtml}
      </div>
    </div>
  </dialog>

  <dialog id="pejabat-detail-dialog" class="civic-dialog glass-dialog pejabat-dialog" aria-labelledby="pejabat-modal-title">
    <button type="button" class="glass-close-btn" data-close-dialog="pejabat-detail-dialog" aria-label="Tutup profil pejabat">
      <svg class="aui-lucide-icon" data-aui-icon="x" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="dialog-header glass-dialog-header">
      <h2 id="pejabat-modal-title">Profil Pejabat Struktural</h2>
    </div>
    <div class="dialog-body glass-dialog-body">
      ${officialPanelsHtml}
    </div>
  </dialog>

  <dialog id="privacy-dialog" class="civic-dialog glass-dialog" aria-labelledby="privacy-dialog-title">
    <button type="button" class="glass-close-btn" data-close-dialog="privacy-dialog" aria-label="Tutup kebijakan privasi">
      <svg class="aui-lucide-icon" data-aui-icon="x" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="dialog-header glass-dialog-header">
      <h2 id="privacy-dialog-title">Kebijakan Privasi Situs SAPA NAMBASO</h2>
    </div>
    <div class="dialog-body glass-dialog-body">
      <p>SAPA NAMBASO menghormati privasi pengunjung sesuai standar layanan publik:</p>
      <ul class="req-list">
        <li>Situs ini tidak menggunakan cookie pelacak lintas situs.</li>
        <li>Situs ini tidak menyimpan alamat IP utuh pengunjung di basis data.</li>
        <li>Kunjungan dihitung memakai pengenal acak harian yang tidak dapat ditelusuri kembali ke individu.</li>
        <li>Situs ini tidak menyediakan formulir yang meminta nomor polisi, NIK, atau data pribadi warga.</li>
      </ul>
    </div>
  </dialog>

  <div id="polite-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>
  <script src="/app.js" defer></script>
</body>
</html>`;
}

module.exports = {
  renderPublicPage,
  getWitaStatus,
  escapeHtml
};

