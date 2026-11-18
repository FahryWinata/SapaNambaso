'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  createInitialDatabase,
  createDefaultAnnouncements,
  createInitialUsers,
  buildGoogleMapsDirectionsUrl
} = require('./seed');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_PATH = path.join(DATA_DIR, 'sapa-nambaso-db.json');

let dbCache = null;

function ensureDirectories() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function writeDatabaseAtomic(data) {
  ensureDirectories();
  const tmpPath = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

function normalizeOrgRoles(roles) {
  return (Array.isArray(roles) ? roles : []).map((r, idx) => {
    const roleTitle = r?.role || 'Pejabat Struktural';
    const bioFallback = r?.bio || r?.initiatives || r?.philosophy || 'Melaksanakan tugas pelayanan dan koordinasi administrasi di lingkungan UPTB Pendapatan Daerah Wilayah I Palu.';
    return {
      id: r?.id || `pejabat-${idx + 1}`,
      role: roleTitle,
      holder: r?.holder || '[DATA NAMA PEJABAT DIISI PETUGAS]',
      photoId: r?.photoId || 'media-foto-pejabat',
      tagline: r?.tagline || `Mengenal Lebih Dekat ${roleTitle}`,
      bio: bioFallback
    };
  });
}

function normalizeAnnouncements(list) {
  const arr = Array.isArray(list) ? list : [];
  const isLegacyPlaceholder =
    arr.length === 1 &&
    arr[0]?.id === 'ann-initial' &&
    (!arr[0]?.enabled || (arr[0]?.title === 'Pemberitahuan Jam Layanan' && !arr[0]?.ctaLabel));
  if (arr.length === 0 || isLegacyPlaceholder) {
    return createDefaultAnnouncements();
  }
  return arr.map((item, idx) => ({
    id: item?.id || `ann-${idx + 1}`,
    enabled: item?.enabled !== false,
    category: item?.category || 'Pengumuman',
    title: item?.title || 'Pengumuman Resmi Samsat Palu',
    message: item?.message || '',
    startDate: item?.startDate || '',
    endDate: item?.endDate || '',
    imageId: item?.imageId || 'media-hero-kantor',
    imageFit: item?.imageFit === 'contain' ? 'contain' : 'cover',
    ctaLabel: item?.ctaLabel || '',
    ctaUrl: item?.ctaUrl || ''
  }));
}

function normalizeDatabase(db) {
  if (!Array.isArray(db.media)) db.media = [];
  if (!db.media.some((m) => m.id === 'media-foto-pejabat')) {
    db.media.push({
      id: 'media-foto-pejabat',
      filename: 'foto-pejabat-placeholder.svg',
      url: '/assets/placeholders/foto-pejabat.svg',
      alt: 'Penampung foto profil pejabat struktural UPTB Samsat Palu',
      width: 320,
      height: 400,
      sizeBytes: 1536,
      mimeType: 'image/svg+xml',
      uploadedAt: new Date().toISOString(),
      isPlaceholder: true
    });
  }

  const usersArr = Array.isArray(db.users) ? db.users : [];
  const primaryAdmin = usersArr.find((u) => u.email?.toLowerCase() === 'admin@samsatpalu.go.id')
    || usersArr.find((u) => u.role === 'Super Admin');
  db.users = primaryAdmin ? [{ ...primaryAdmin, active: true, role: 'Super Admin' }] : createInitialUsers();

  for (const contentKey of ['publishedContent', 'draftContent']) {
    const content = db[contentKey];
    if (!content) continue;
    if (content.profile) {
      content.profile.orgRoles = normalizeOrgRoles(content.profile.orgRoles);
    }
    if (Array.isArray(content.locations)) {
      content.locations = content.locations.map((loc) => ({
        ...loc,
        mapUrl: (loc?.mapUrl && loc.mapUrl.trim()) ? loc.mapUrl.trim() : buildGoogleMapsDirectionsUrl(loc?.name, loc?.address)
      }));
    }
    content.announcements = normalizeAnnouncements(content.announcements);
    if (content.contacts && 'extraChannels' in content.contacts) {
      delete content.contacts.extraChannels;
    }
    if (content.seo && content.seo.sectionTitles && !content.seo.sectionTitles.announcements) {
      content.seo.sectionTitles.announcements = 'Berita, Event, dan Pengumuman';
    }
  }
  if (!Array.isArray(db.feedbacks)) {
    db.feedbacks = [];
  }
  return db;
}

function loadDatabase() {
  if (dbCache) return dbCache;
  ensureDirectories();
  if (!fs.existsSync(DB_PATH)) {
    dbCache = createInitialDatabase();
    writeDatabaseAtomic(dbCache);
    return dbCache;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  dbCache = normalizeDatabase(JSON.parse(raw));
  return dbCache;
}

function saveDatabase(data) {
  dbCache = data;
  writeDatabaseAtomic(data);
}

function createBackupFile(reason = 'manual') {
  const db = loadDatabase();
  ensureDirectories();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${stamp}-${reason}.json`;
  const target = path.join(BACKUP_DIR, filename);
  fs.writeFileSync(target, JSON.stringify(db, null, 2), 'utf8');

  // Keep the most recent 30 backup files per PRD Section 9 availability requirement.
  const files = fs.readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse();
  for (const oldFile of files.slice(30)) {
    fs.unlinkSync(path.join(BACKUP_DIR, oldFile));
  }
  return filename;
}

function hasUnpublishedChanges(db) {
  return JSON.stringify(db.draftContent) !== JSON.stringify(db.publishedContent);
}

function getStalenessAlerts(content, thresholdDays = 90) {
  const nowMs = Date.now();
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  const alerts = [];
  for (const service of content.services || []) {
    const updatedMs = Date.parse(service.updatedAt || '');
    const isPlaceholder = JSON.stringify(service).includes('[DATA RESMI DIISI PETUGAS]');
    if (!Number.isFinite(updatedMs) || nowMs - updatedMs >= thresholdMs) {
      alerts.push({
        id: service.id,
        name: service.name,
        reason: 'Belum diperbarui lebih dari 90 hari',
        updatedAt: service.updatedAt || null
      });
    } else if (isPlaceholder) {
      alerts.push({
        id: service.id,
        name: service.name,
        reason: 'Masih memuat penanda [DATA RESMI DIISI PETUGAS] yang perlu diisi petugas',
        updatedAt: service.updatedAt || null
      });
    }
  }
  return alerts;
}

function getMediaUsageMap(content) {
  const usage = {};
  const addUse = (mediaId, locationLabel) => {
    if (!mediaId) return;
    if (!usage[mediaId]) usage[mediaId] = [];
    if (!usage[mediaId].includes(locationLabel)) {
      usage[mediaId].push(locationLabel);
    }
  };

  addUse(content.identity?.siteLogoId, 'Identitas: Logo SAPA NAMBASO');
  addUse(content.identity?.agencyLogoId, 'Identitas: Logo Instansi');
  addUse(content.identity?.sharePreviewImageId, 'Identitas: Gambar Pratinjau Tautan');
  addUse(content.identity?.splashImageId, 'Identitas: Logo Layar Sambutan');
  addUse(content.hero?.heroImageId, 'Beranda: Foto Utama');
  addUse(content.profile?.orgStructureImageId, 'Profil: Bagan Struktur Organisasi');

  for (const roleItem of content.profile?.orgRoles || []) {
    addUse(roleItem.photoId, `Pejabat: ${roleItem.role}`);
  }
  for (const svc of content.services || []) {
    addUse(svc.imageId, `Layanan: ${svc.name}`);
  }
  for (const loc of content.locations || []) {
    addUse(loc.imageId, `Lokasi: ${loc.name}`);
  }
  for (const ann of content.announcements || []) {
    addUse(ann.imageId, `Pengumuman: ${ann.title}`);
  }
  for (const partner of content.partners || []) {
    addUse(partner.logoId, `Mitra: ${partner.name}`);
  }
  return usage;
}

function replaceMediaReferences(content, targetMediaId) {
  if (!content || !targetMediaId) return 0;
  let count = 0;
  const swapField = (obj, key, fallbackId) => {
    if (obj && obj[key] === targetMediaId) {
      obj[key] = fallbackId;
      count += 1;
    }
  };

  swapField(content.identity, 'siteLogoId', 'media-logo-sapa');
  swapField(content.identity, 'agencyLogoId', 'media-logo-instansi');
  swapField(content.identity, 'sharePreviewImageId', 'media-hero-kantor');
  swapField(content.identity, 'splashImageId', 'media-logo-sapa');
  swapField(content.hero, 'heroImageId', 'media-hero-kantor');
  swapField(content.profile, 'orgStructureImageId', 'media-struktur-org');

  for (const roleItem of content.profile?.orgRoles || []) {
    swapField(roleItem, 'photoId', 'media-foto-pejabat');
  }
  for (const svc of content.services || []) {
    swapField(svc, 'imageId', 'media-lokasi-default');
  }
  for (const loc of content.locations || []) {
    swapField(loc, 'imageId', 'media-lokasi-default');
  }
  for (const ann of content.announcements || []) {
    swapField(ann, 'imageId', 'media-hero-kantor');
  }
  for (const partner of content.partners || []) {
    swapField(partner, 'logoId', 'media-logo-instansi');
  }
  return count;
}

function getDailyVisitorHash(rawIp, userAgent) {
  const db = loadDatabase();
  const today = new Date().toISOString().slice(0, 10);
  if (db.analytics.dailySaltDate !== today) {
    db.analytics.dailySaltDate = today;
    db.analytics.dailySalt = crypto.randomBytes(16).toString('hex');
    saveDatabase(db);
  }
  // Truncate IP before hashing so full client IP is never stored or reconstructible.
  const ipPrefix = String(rawIp || 'local').split('.').slice(0, 2).join('.');
  return crypto
    .createHmac('sha256', db.analytics.dailySalt)
    .update(`${ipPrefix}|${String(userAgent || '').slice(0, 80)}`)
    .digest('hex')
    .slice(0, 16);
}

function recordAnalyticsEvent(eventPayload, rawIp, userAgent) {
  const db = loadDatabase();
  const visitorId = getDailyVisitorHash(rawIp, userAgent);
  const entry = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    visitorId,
    sessionId: String(eventPayload.sessionId || visitorId).slice(0, 48),
    type: String(eventPayload.type || 'pageview').slice(0, 40),
    page: String(eventPayload.page || '/').slice(0, 120),
    section: eventPayload.section ? String(eventPayload.section).slice(0, 64) : null,
    serviceId: eventPayload.serviceId ? String(eventPayload.serviceId).slice(0, 64) : null,
    serviceName: eventPayload.serviceName ? String(eventPayload.serviceName).slice(0, 100) : null,
    actionName: eventPayload.actionName ? String(eventPayload.actionName).slice(0, 64) : null,
    locationId: eventPayload.locationId ? String(eventPayload.locationId).slice(0, 64) : null,
    locationName: eventPayload.locationName ? String(eventPayload.locationName).slice(0, 100) : null,
    searchQuery: eventPayload.searchQuery ? String(eventPayload.searchQuery).slice(0, 80) : null,
    scrollDepth: Number.isFinite(Number(eventPayload.scrollDepth)) ? Number(eventPayload.scrollDepth) : null,
    durationMs: Number.isFinite(Number(eventPayload.durationMs)) ? Number(eventPayload.durationMs) : null,
    loadMs: Number.isFinite(Number(eventPayload.loadMs)) ? Number(eventPayload.loadMs) : null,
    isError: Boolean(eventPayload.isError),
    source: String(eventPayload.source || 'Langsung').slice(0, 40),
    device: String(eventPayload.device || 'Ponsel').slice(0, 24),
    os: String(eventPayload.os || 'Lainnya').slice(0, 24),
    browser: String(eventPayload.browser || 'Lainnya').slice(0, 24),
    region: String(eventPayload.region || 'Kota Palu').slice(0, 40)
  };
  db.analytics.events.push(entry);
  if (db.analytics.events.length > 20000) {
    db.analytics.events = db.analytics.events.slice(-20000);
  }
  saveDatabase(db);
  return entry;
}

function addFeedbackEntry(payload) {
  const db = loadDatabase();
  if (!Array.isArray(db.feedbacks)) db.feedbacks = [];
  const channel = payload.channel === 'suggestion' ? 'suggestion' : 'complaint';
  const now = new Date().toISOString();
  const datePart = now.slice(0, 10).replace(/-/g, '');
  const randPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  const prefix = channel === 'suggestion' ? 'SRN' : 'ADU';
  const entry = {
    id: `fb-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
    ticketCode: `${prefix}-${datePart}-${randPart}`,
    channel,
    category: String(payload.category || '').trim().slice(0, 100),
    location: String(payload.location || '').trim().slice(0, 120),
    subject: String(payload.subject || '').trim().slice(0, 160),
    details: String(payload.details || '').trim().slice(0, 2000),
    status: 'baru',
    adminNote: '',
    createdAt: now,
    updatedAt: now
  };
  db.feedbacks.unshift(entry);
  if (db.feedbacks.length > 5000) {
    db.feedbacks = db.feedbacks.slice(0, 5000);
  }
  saveDatabase(db);
  return entry;
}

function updateFeedbackEntry(id, updates) {
  const db = loadDatabase();
  if (!Array.isArray(db.feedbacks)) db.feedbacks = [];
  const item = db.feedbacks.find((f) => f.id === id);
  if (!item) return null;
  if (updates.status && ['baru', 'diproses', 'selesai'].includes(updates.status)) {
    item.status = updates.status;
  }
  if (typeof updates.adminNote === 'string') {
    item.adminNote = updates.adminNote.trim().slice(0, 500);
  }
  item.updatedAt = new Date().toISOString();
  saveDatabase(db);
  return item;
}

function deleteFeedbackEntry(id) {
  const db = loadDatabase();
  if (!Array.isArray(db.feedbacks)) db.feedbacks = [];
  const before = db.feedbacks.length;
  db.feedbacks = db.feedbacks.filter((f) => f.id !== id);
  if (db.feedbacks.length === before) return false;
  saveDatabase(db);
  return true;
}

module.exports = {
  loadDatabase,
  saveDatabase,
  createBackupFile,
  hasUnpublishedChanges,
  getStalenessAlerts,
  getMediaUsageMap,
  replaceMediaReferences,
  recordAnalyticsEvent,
  addFeedbackEntry,
  updateFeedbackEntry,
  deleteFeedbackEntry,
  BACKUP_DIR,
  DB_PATH
};

