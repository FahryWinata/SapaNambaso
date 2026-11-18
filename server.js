'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');

const {
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
  deleteFeedbackEntry
} = require('./src/db');
const { hashPassword, verifyPassword } = require('./src/seed');
const { renderPublicPage, getWitaStatus } = require('./src/render-public');
const { generateQrSvg } = require('./src/qr-svg');
const { buildAnalyticsReport, filterEvents, resolveDateRange } = require('./src/analytics');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(__dirname, 'data', 'uploads');
const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_BODY_BYTES = 4 * 1024 * 1024;

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const sessions = new Map();
const challenges = new Map();
const loginAttempts = new Map();
const resetTokens = new Map();
const feedbackAttempts = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function sendSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'self'"
  );
}

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  sendSecurityHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(payload);
}

function sendText(res, statusCode, contentType, text) {
  sendSecurityHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(text);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const map = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) map[key] = decodeURIComponent(val);
  }
  return map;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error('Ukuran permintaan melebihi batas maksimal 4 MB'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function parseJsonBody(raw) {
  if (!raw) return {};
  return JSON.parse(raw);
}

function base32Decode(str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = String(str || '').toUpperCase().replace(/=+$/, '');
  let bits = '';
  for (const ch of cleaned) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function verifyTotp(secret, code) {
  if (!/^\d{6}$/.test(code)) return false;
  const key = base32Decode(secret);
  const currentCounter = Math.floor(Date.now() / 30000);
  for (const offset of [-1, 0, 1]) {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(BigInt(currentCounter + offset));
    const hmac = crypto.createHmac('sha1', key).update(buf).digest();
    const pos = hmac[hmac.length - 1] & 0x0f;
    const binary = ((hmac[pos] & 0x7f) << 24) |
      ((hmac[pos + 1] & 0xff) << 16) |
      ((hmac[pos + 2] & 0xff) << 8) |
      (hmac[pos + 3] & 0xff);
    const otp = String(binary % 1000000).padStart(6, '0');
    if (otp === code) return true;
  }
  return false;
}

function isStrongPassword(pw) {
  const s = String(pw || '');
  return s.length >= 12 && /[A-Z]/.test(s) && /[a-z]/.test(s) && /\d/.test(s) && /[^A-Za-z0-9]/.test(s);
}

function getActiveSession(req) {
  const cookies = parseCookies(req);
  const sid = cookies.sapa_sid;
  if (!sid) return null;
  const session = sessions.get(sid);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sid);
    return null;
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return { sid, ...session };
}

function requireAuth(req, res, allowedRoles = null) {
  const session = getActiveSession(req);
  if (!session) {
    sendJson(res, 401, { error: 'Autentikasi diperlukan atau sesi telah berakhir' });
    return null;
  }
  const db = loadDatabase();
  const user = db.users.find((u) => u.id === session.userId && u.active);
  if (!user) {
    sessions.delete(session.sid);
    sendJson(res, 401, { error: 'Akun petugas tidak ditemukan atau dinonaktifkan' });
    return null;
  }
  if (req.method !== 'GET' && req.headers['x-csrf-token'] !== session.csrfToken) {
    sendJson(res, 403, { error: 'Token CSRF tidak valid' });
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    sendJson(res, 403, { error: `Peran ${user.role} tidak memiliki izin untuk tindakan ini` });
    return null;
  }
  return { session, user };
}

function serveStaticFile(res, filePath) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(PUBLIC_DIR) && !resolved.startsWith(UPLOADS_DIR)) {
    sendText(res, 403, 'text/plain; charset=utf-8', 'Akses ditolak');
    return true;
  }
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    return false;
  }
  const ext = path.extname(resolved).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  sendSecurityHeaders(res);
  res.writeHead(200, {
    'Content-Type': mime,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
  });
  fs.createReadStream(resolved).pipe(res);
  return true;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt
  };
}

function getRequestProto(req) {
  const forwarded = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  return forwarded === 'https' ? 'https' : 'http';
}

function getClientIp(req) {
  const remote = req.socket?.remoteAddress || '127.0.0.1';
  const isLoopback = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
  if (isLoopback && req.headers['x-forwarded-for']) {
    const first = String(req.headers['x-forwarded-for']).split(',')[0].trim();
    if (first) return first;
  }
  return remote;
}

async function handleRequest(req, res) {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const rawIp = getClientIp(req);

  // Public routes
  if (req.method === 'GET' && pathname === '/') {
    const db = loadDatabase();
    const wantsPreview = parsedUrl.searchParams.get('preview') === '1';
    const session = getActiveSession(req);
    const previewAllowed = wantsPreview && Boolean(session);
    const html = renderPublicPage(db, { preview: previewAllowed });
    sendText(res, 200, 'text/html; charset=utf-8', html);
    return;
  }

  if (req.method === 'GET' && (pathname === '/admin' || pathname === '/admin/')) {
    serveStaticFile(res, path.join(PUBLIC_DIR, 'admin.html'));
    return;
  }

  if (req.method === 'GET' && pathname === '/robots.txt') {
    const proto = getRequestProto(req);
    const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin/\nSitemap: ${proto}://${req.headers.host || 'localhost'}/sitemap.xml\n`;
    sendText(res, 200, 'text/plain; charset=utf-8', body);
    return;
  }

  if (req.method === 'GET' && pathname === '/sitemap.xml') {
    const proto = getRequestProto(req);
    const base = `${proto}://${req.headers.host || 'localhost'}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n</urlset>\n`;
    sendText(res, 200, 'application/xml; charset=utf-8', xml);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/public/content') {
    const db = loadDatabase();
    const wita = getWitaStatus(db.publishedContent.hours || {});
    sendJson(res, 200, {
      publishedAt: db.publishedAt,
      content: db.publishedContent,
      media: db.media,
      wita
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/public/qr') {
    const target = parsedUrl.searchParams.get('url') || '/';
    const svg = generateQrSvg(target);
    sendText(res, 200, 'image/svg+xml', svg);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/analytics/event') {
    const raw = await readBody(req);
    const payload = parseJsonBody(raw);
    const entry = recordAnalyticsEvent(payload, rawIp, req.headers['user-agent']);
    sendJson(res, 202, { recorded: true, id: entry.id });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/public/feedback') {
    const nowMs = Date.now();
    const rec = feedbackAttempts.get(rawIp);
    if (rec && nowMs - rec.windowStart < 15 * 60 * 1000 && rec.count >= 10) {
      sendJson(res, 429, { error: 'Terlalu banyak kiriman dalam waktu singkat. Mohon tunggu beberapa menit.' });
      return;
    }
    const payload = parseJsonBody(await readBody(req));
    const channel = payload.channel === 'suggestion' ? 'suggestion' : (payload.channel === 'complaint' ? 'complaint' : '');
    const category = String(payload.category || '').trim();
    const location = String(payload.location || '').trim();
    const subject = String(payload.subject || '').trim();
    const details = String(payload.details || '').trim();
    if (!channel || !category || !location || !subject || !details || payload.consent !== true) {
      sendJson(res, 400, { error: 'Mohon lengkapi seluruh kolom bertanda (*) dan centang pernyataan persetujuan.' });
      return;
    }
    if (!rec || nowMs - rec.windowStart >= 15 * 60 * 1000) {
      feedbackAttempts.set(rawIp, { count: 1, windowStart: nowMs });
    } else {
      rec.count += 1;
    }
    const saved = addFeedbackEntry({ channel, category, location, subject, details });
    recordAnalyticsEvent(
      { type: 'action_click', actionName: channel === 'suggestion' ? 'suggestion_submit' : 'complaint_submit' },
      rawIp,
      req.headers['user-agent']
    );
    sendJson(res, 201, {
      ok: true,
      id: saved.id,
      ticketCode: saved.ticketCode,
      channel: saved.channel,
      createdAt: saved.createdAt
    });
    return;
  }

  // Admin auth routes (A1)
  if (req.method === 'GET' && pathname === '/api/admin/session') {
    const session = getActiveSession(req);
    if (!session) {
      sendJson(res, 200, { authenticated: false });
      return;
    }
    const db = loadDatabase();
    const user = db.users.find((u) => u.id === session.userId && u.active);
    if (!user) {
      sendJson(res, 200, { authenticated: false });
      return;
    }
    sendJson(res, 200, {
      authenticated: true,
      user: sanitizeUser(user),
      csrfToken: session.csrfToken
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/login') {
    const body = parseJsonBody(await readBody(req));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const attemptKey = `${email}|${rawIp}`;
    const record = loginAttempts.get(attemptKey) || { count: 0, lockUntil: 0 };

    if (Date.now() < record.lockUntil) {
      const waitMin = Math.ceil((record.lockUntil - Date.now()) / 60000);
      sendJson(res, 429, { error: `Terlalu banyak percobaan masuk gagal. Coba lagi dalam ${waitMin} menit.` });
      return;
    }

    const db = loadDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email && u.active);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      record.count += 1;
      if (record.count >= MAX_LOGIN_ATTEMPTS) {
        record.lockUntil = Date.now() + LOCKOUT_MS;
        record.count = 0;
      }
      loginAttempts.set(attemptKey, record);
      sendJson(res, 401, { error: 'Email atau kata sandi tidak sesuai.' });
      return;
    }

    loginAttempts.delete(attemptKey);
    const challengeToken = crypto.randomBytes(24).toString('hex');
    const otp = String(crypto.randomInt(100000, 1000000));
    challenges.set(challengeToken, {
      userId: user.id,
      otp,
      totpSecret: user.totpSecret,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    const response = { challengeToken, requires2fa: true };
    if (process.env.NODE_ENV !== 'production') {
      response.devOtpHint = otp;
    }
    sendJson(res, 200, response);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/verify-2fa') {
    const body = parseJsonBody(await readBody(req));
    const challenge = challenges.get(String(body.challengeToken || ''));
    if (!challenge || Date.now() > challenge.expiresAt) {
      challenges.delete(String(body.challengeToken || ''));
      sendJson(res, 401, { error: 'Sesi verifikasi dua langkah tidak ditemukan atau sudah kedaluwarsa.' });
      return;
    }

    const code = String(body.code || '').trim();
    const valid = code === challenge.otp || verifyTotp(challenge.totpSecret, code);
    if (!valid) {
      sendJson(res, 401, { error: 'Kode verifikasi dua langkah tidak cocok.' });
      return;
    }

    challenges.delete(String(body.challengeToken || ''));
    const db = loadDatabase();
    const user = db.users.find((u) => u.id === challenge.userId && u.active);
    if (!user) {
      sendJson(res, 401, { error: 'Akun petugas tidak aktif.' });
      return;
    }

    const sid = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(24).toString('hex');
    sessions.set(sid, {
      userId: user.id,
      csrfToken,
      expiresAt: Date.now() + SESSION_TTL_MS
    });

    const secureAttr = getRequestProto(req) === 'https' ? '; Secure' : '';
    sendSecurityHeaders(res);
    res.setHeader('Set-Cookie', `sapa_sid=${sid}; HttpOnly; SameSite=Strict; Path=/${secureAttr}`);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ user: sanitizeUser(user), csrfToken }));
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/logout') {
    const cookies = parseCookies(req);
    if (cookies.sapa_sid) sessions.delete(cookies.sapa_sid);
    const secureAttr = getRequestProto(req) === 'https' ? '; Secure' : '';
    sendSecurityHeaders(res);
    res.setHeader('Set-Cookie', `sapa_sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureAttr}`);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/reset-password') {
    const body = parseJsonBody(await readBody(req));
    const email = String(body.email || '').trim().toLowerCase();
    const db = loadDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email && u.active);

    if (body.action === 'request') {
      if (!user) {
        sendJson(res, 404, { error: 'Email petugas tidak ditemukan dalam sistem.' });
        return;
      }
      const token = crypto.randomBytes(6).toString('hex');
      resetTokens.set(email, { token, expiresAt: Date.now() + 15 * 60 * 1000 });
      const resObj = { ok: true };
      if (process.env.NODE_ENV !== 'production') resObj.devResetToken = token;
      sendJson(res, 200, resObj);
      return;
    }

    if (body.action === 'confirm') {
      const entry = resetTokens.get(email);
      if (!user || !entry || entry.token !== String(body.token || '').trim() || Date.now() > entry.expiresAt) {
        sendJson(res, 400, { error: 'Token reset tidak valid atau sudah kedaluwarsa.' });
        return;
      }
      if (!isStrongPassword(body.newPassword)) {
        sendJson(res, 400, { error: 'Kata sandi baru minimal 12 karakter dengan huruf besar, huruf kecil, angka, dan simbol.' });
        return;
      }
      user.passwordHash = hashPassword(body.newPassword);
      saveDatabase(db);
      resetTokens.delete(email);
      sendJson(res, 200, { ok: true });
      return;
    }
    sendJson(res, 400, { error: 'Aksi reset tidak dikenal.' });
    return;
  }

  // Protected Admin CMS & Analytics Routes
  if (req.method === 'GET' && pathname === '/api/admin/state') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const db = loadDatabase();
    sendJson(res, 200, {
      user: sanitizeUser(auth.user),
      draftContent: db.draftContent,
      publishedContent: db.publishedContent,
      publishedAt: db.publishedAt,
      publishedBy: db.publishedBy,
      hasUnpublishedChanges: hasUnpublishedChanges(db),
      stalenessAlerts: getStalenessAlerts(db.draftContent, db.settings?.stalenessAlertDays || 90),
      media: db.media,
      mediaUsage: (() => {
        const draftMap = getMediaUsageMap(db.draftContent);
        const pubMap = getMediaUsageMap(db.publishedContent);
        const merged = {};
        for (const [id, list] of Object.entries(draftMap)) {
          merged[id] = [...list];
        }
        for (const [id, list] of Object.entries(pubMap)) {
          if (!merged[id]) merged[id] = [];
          for (const label of list) {
            if (!merged[id].includes(label)) merged[id].push(`${label} (Tayang Publik)`);
          }
        }
        return merged;
      })(),
      revisions: db.revisions.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        actorEmail: r.actorEmail,
        actorName: r.actorName,
        actorRole: r.actorRole,
        summary: r.summary
      })),
      users: auth.user.role === 'Super Admin' ? db.users.map(sanitizeUser) : []
    });
    return;
  }

  if (req.method === 'PUT' && pathname.startsWith('/api/admin/draft/')) {
    const auth = requireAuth(req, res, ['Super Admin', 'Penyunting Senior', 'Editor']);
    if (!auth) return;
    const section = decodeURIComponent(pathname.slice('/api/admin/draft/'.length));
    const allowedSections = [
      'identity', 'hero', 'taxCheck', 'profile', 'services',
      'hours', 'locations', 'contacts', 'announcements', 'partners', 'faq', 'seo'
    ];
    if (!allowedSections.includes(section)) {
      sendJson(res, 400, { error: 'Bagian konten tidak dikenal.' });
      return;
    }
    if (section === 'identity' && auth.user.role !== 'Super Admin') {
      sendJson(res, 403, { error: 'Hanya Super Admin yang dapat mengubah identitas dan logo utama.' });
      return;
    }
    const payload = parseJsonBody(await readBody(req));
    const db = loadDatabase();
    db.draftContent[section] = payload;
    saveDatabase(db);
    sendJson(res, 200, { ok: true, hasUnpublishedChanges: hasUnpublishedChanges(db) });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/publish') {
    const auth = requireAuth(req, res, ['Super Admin', 'Penyunting Senior']);
    if (!auth) return;
    const body = parseJsonBody(await readBody(req));
    const db = loadDatabase();
    const now = new Date().toISOString();
    db.publishedContent = structuredClone(db.draftContent);
    db.publishedAt = now;
    db.publishedBy = auth.user.email;
    db.revisions.push({
      id: `rev-${Date.now().toString(36)}`,
      timestamp: now,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      actorRole: auth.user.role,
      summary: String(body.summary || 'Pembaruan konten terbit').slice(0, 160),
      snapshot: structuredClone(db.publishedContent)
    });
    if (db.revisions.length > 100) {
      db.revisions = db.revisions.slice(-100);
    }
    saveDatabase(db);
    createBackupFile('publish');
    sendJson(res, 200, { ok: true, publishedAt: now });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/discard-draft') {
    const auth = requireAuth(req, res, ['Super Admin', 'Penyunting Senior', 'Editor']);
    if (!auth) return;
    const db = loadDatabase();
    db.draftContent = structuredClone(db.publishedContent);
    saveDatabase(db);
    sendJson(res, 200, { ok: true });
    return;
  }

  const restoreRevMatch = pathname.match(/^\/api\/admin\/revisions\/([^/]+)\/restore$/);
  if (req.method === 'POST' && restoreRevMatch) {
    const auth = requireAuth(req, res, ['Super Admin', 'Penyunting Senior']);
    if (!auth) return;
    const revId = decodeURIComponent(restoreRevMatch[1]);
    const db = loadDatabase();
    const rev = db.revisions.find((r) => r.id === revId);
    if (!rev) {
      sendJson(res, 404, { error: 'Riwayat versi tidak ditemukan.' });
      return;
    }
    db.draftContent = structuredClone(rev.snapshot);
    saveDatabase(db);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/media') {
    const auth = requireAuth(req, res, ['Super Admin', 'Penyunting Senior', 'Editor']);
    if (!auth) return;
    const body = parseJsonBody(await readBody(req));
    const alt = String(body.alt || '').trim();
    if (!alt) {
      sendJson(res, 400, { error: 'Teks alternatif gambar wajib diisi.' });
      return;
    }
    const dataUrl = String(body.dataUrl || '');
    const match = dataUrl.match(/^data:(image\/(webp|png|jpeg|svg\+xml));base64,(.+)$/);
    if (!match) {
      sendJson(res, 400, { error: 'Format gambar tidak didukung. Gunakan PNG, JPG, WebP, atau SVG.' });
      return;
    }
    const mimeType = match[1];
    const buffer = Buffer.from(match[3], 'base64');
    if (buffer.length > 2 * 1024 * 1024) {
      sendJson(res, 400, { error: 'Ukuran berkas melebihi batas maksimal 2 MB.' });
      return;
    }

    const ext = mimeType === 'image/webp' ? '.webp'
      : mimeType === 'image/png' ? '.png'
      : mimeType === 'image/jpeg' ? '.jpg'
      : '.svg';
    const safeName = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, safeName), buffer);

    const db = loadDatabase();
    const entry = {
      id: `media-${Date.now().toString(36)}`,
      filename: String(body.filename || safeName).slice(0, 80),
      url: `/uploads/${safeName}`,
      alt,
      width: Math.max(1, Number(body.width) || 480),
      height: Math.max(1, Number(body.height) || 300),
      sizeBytes: buffer.length,
      mimeType,
      uploadedAt: new Date().toISOString(),
      isPlaceholder: false
    };
    db.media.push(entry);
    saveDatabase(db);
    sendJson(res, 201, { ok: true, media: entry });
    return;
  }

  const mediaItemMatch = pathname.match(/^\/api\/admin\/media\/([^/]+)$/);
  if (req.method === 'PATCH' && mediaItemMatch) {
    const auth = requireAuth(req, res, ['Super Admin', 'Penyunting Senior', 'Editor']);
    if (!auth) return;
    const mediaId = decodeURIComponent(mediaItemMatch[1]);
    const body = parseJsonBody(await readBody(req));
    const alt = String(body.alt || '').trim();
    if (!alt) {
      sendJson(res, 400, { error: 'Keterangan gambar wajib diisi.' });
      return;
    }
    const db = loadDatabase();
    const item = db.media.find((m) => m.id === mediaId);
    if (!item) {
      sendJson(res, 404, { error: 'Media tidak ditemukan.' });
      return;
    }
    item.alt = alt;
    saveDatabase(db);
    sendJson(res, 200, { ok: true, media: item });
    return;
  }

  if (req.method === 'DELETE' && mediaItemMatch) {
    const auth = requireAuth(req, res, ['Super Admin', 'Penyunting Senior', 'Editor']);
    if (!auth) return;
    const mediaId = decodeURIComponent(mediaItemMatch[1]);
    const db = loadDatabase();
    const item = db.media.find((m) => m.id === mediaId);
    if (!item) {
      sendJson(res, 404, { error: 'Media tidak ditemukan.' });
      return;
    }
    if (item.isPlaceholder) {
      sendJson(res, 400, { error: 'Aset bawaan sistem tidak dapat dihapus.' });
      return;
    }
    const replacedDraft = replaceMediaReferences(db.draftContent, mediaId);
    const replacedPub = replaceMediaReferences(db.publishedContent, mediaId);
    const replacedCount = replacedDraft + replacedPub;
    if (item.url.startsWith('/uploads/')) {
      const diskPath = path.join(UPLOADS_DIR, path.basename(item.url));
      if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
    }
    db.media = db.media.filter((m) => m.id !== mediaId);
    saveDatabase(db);
    sendJson(res, 200, {
      ok: true,
      replacedCount,
      draftContent: db.draftContent,
      publishedContent: db.publishedContent,
      hasUnpublishedChanges: hasUnpublishedChanges(db)
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/users') {
    const auth = requireAuth(req, res, ['Super Admin']);
    if (!auth) return;
    const body = parseJsonBody(await readBody(req));
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim();
    const role = String(body.role || 'Editor');
    if (!email || !name || !['Super Admin', 'Penyunting Senior', 'Editor', 'Penilik'].includes(role)) {
      sendJson(res, 400, { error: 'Nama, email, atau peran tidak valid.' });
      return;
    }
    if (!isStrongPassword(body.password)) {
      sendJson(res, 400, { error: 'Kata sandi minimal 12 karakter dengan huruf besar, huruf kecil, angka, dan simbol.' });
      return;
    }
    const db = loadDatabase();
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      sendJson(res, 409, { error: 'Email petugas sudah terdaftar.' });
      return;
    }
    const newUser = {
      id: `usr-${Date.now().toString(36)}`,
      name,
      email,
      role,
      active: true,
      passwordHash: hashPassword(body.password),
      totpSecret: 'JBSWY3DPEHPK3PXP',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDatabase(db);
    sendJson(res, 201, { ok: true, user: sanitizeUser(newUser) });
    return;
  }

  const userUpdateMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (req.method === 'PUT' && userUpdateMatch) {
    const auth = requireAuth(req, res, ['Super Admin']);
    if (!auth) return;
    const userId = decodeURIComponent(userUpdateMatch[1]);
    if (userId === auth.user.id) {
      sendJson(res, 400, { error: 'Anda tidak dapat mengubah peran atau menonaktifkan akun sendiri.' });
      return;
    }
    const body = parseJsonBody(await readBody(req));
    const db = loadDatabase();
    const target = db.users.find((u) => u.id === userId);
    if (!target) {
      sendJson(res, 404, { error: 'Pengguna tidak ditemukan.' });
      return;
    }
    if (body.role && ['Super Admin', 'Penyunting Senior', 'Editor', 'Penilik'].includes(body.role)) {
      target.role = body.role;
    }
    if (typeof body.active === 'boolean') {
      target.active = body.active;
    }
    saveDatabase(db);
    sendJson(res, 200, { ok: true, user: sanitizeUser(target) });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/admin/analytics') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const db = loadDatabase();
    const query = Object.fromEntries(parsedUrl.searchParams.entries());
    const report = buildAnalyticsReport(db.analytics?.events || [], query);
    sendJson(res, 200, report);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/admin/analytics/export.csv') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const db = loadDatabase();
    const query = Object.fromEntries(parsedUrl.searchParams.entries());
    const { start, end } = resolveDateRange(query);
    const filtered = filterEvents(db.analytics?.events || [], start, end, query);
    const header = 'waktu,tipe,bagian,layanan,tindakan,lokasi,kata_kunci,perangkat,os,peramban,sumber,wilayah,muat_ms\n';
    const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filtered.map((e) => [
      e.ts, e.type, e.section, e.serviceName, e.actionName, e.locationName,
      e.searchQuery, e.device, e.os, e.browser, e.source, e.region, e.loadMs
    ].map(csvCell).join(',')).join('\n');

    sendSecurityHeaders(res);
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="analitik-sapa-nambaso.csv"'
    });
    res.end(header + rows);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/admin/feedbacks') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const db = loadDatabase();
    sendJson(res, 200, { feedbacks: db.feedbacks || [] });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/admin/feedbacks/export.csv') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const db = loadDatabase();
    const channelFilter = parsedUrl.searchParams.get('channel') || 'all';
    const items = (db.feedbacks || []).filter((f) => channelFilter === 'all' || f.channel === channelFilter);
    const header = '\uFEFFkode_tiket,kanal,status,waktu_masuk,kategori_atau_aspek,lokasi,topik,rincian,catatan_petugas\n';
    const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = items.map((f) => [
      f.ticketCode,
      f.channel === 'suggestion' ? 'Saran dan Masukan' : 'Pengaduan',
      f.status,
      f.createdAt,
      f.category,
      f.location,
      f.subject,
      f.details,
      f.adminNote || ''
    ].map(csvCell).join(',')).join('\n');

    sendSecurityHeaders(res);
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="aduan-dan-saran-sapa-nambaso.csv"'
    });
    res.end(header + rows);
    return;
  }

  const feedbackItemMatch = pathname.match(/^\/api\/admin\/feedbacks\/([^/]+)$/);
  if (req.method === 'PATCH' && feedbackItemMatch) {
    const auth = requireAuth(req, res, ['Super Admin', 'Penyunting Senior', 'Editor']);
    if (!auth) return;
    const id = decodeURIComponent(feedbackItemMatch[1]);
    const body = parseJsonBody(await readBody(req));
    const updated = updateFeedbackEntry(id, {
      status: body.status,
      adminNote: body.adminNote
    });
    if (!updated) {
      sendJson(res, 404, { error: 'Data aduan atau saran tidak ditemukan.' });
      return;
    }
    sendJson(res, 200, { ok: true, item: updated });
    return;
  }

  if (req.method === 'DELETE' && feedbackItemMatch) {
    const auth = requireAuth(req, res, ['Super Admin', 'Penyunting Senior', 'Editor']);
    if (!auth) return;
    const id = decodeURIComponent(feedbackItemMatch[1]);
    const deleted = deleteFeedbackEntry(id);
    if (!deleted) {
      sendJson(res, 404, { error: 'Data aduan atau saran tidak ditemukan.' });
      return;
    }
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/check-link') {
    const auth = requireAuth(req, res, ['Super Admin', 'Penyunting Senior', 'Editor']);
    if (!auth) return;
    const body = parseJsonBody(await readBody(req));
    const url = String(body.url || '').trim();
    if (!/^https?:\/\//i.test(url)) {
      sendJson(res, 400, { error: 'URL harus diawali http:// atau https://' });
      return;
    }
    let statusText = 'Tidak dapat dijangkau dari server';
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      const resp = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
      clearTimeout(timer);
      statusText = resp.ok ? `Aktif (HTTP ${resp.status})` : `Respons HTTP ${resp.status}`;
    } catch (err) {
      statusText = `Gagal menjangkau (${err.message})`;
    }
    const db = loadDatabase();
    db.draftContent.taxCheck.lastCheckedAt = new Date().toISOString();
    db.draftContent.taxCheck.lastCheckStatus = statusText;
    saveDatabase(db);
    sendJson(res, 200, { ok: true, statusText });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/admin/backup') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const db = loadDatabase();
    createBackupFile('download');
    sendSecurityHeaders(res);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="cadangan-sapa-nambaso.json"'
    });
    res.end(JSON.stringify(db, null, 2));
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/restore') {
    const auth = requireAuth(req, res, ['Super Admin']);
    if (!auth) return;
    const parsed = parseJsonBody(await readBody(req));
    if (!parsed || !parsed.publishedContent || !parsed.draftContent || !Array.isArray(parsed.users)) {
      sendJson(res, 400, { error: 'Format berkas cadangan tidak valid.' });
      return;
    }
    createBackupFile('pre-restore');
    saveDatabase(parsed);
    sendJson(res, 200, { ok: true });
    return;
  }

  // Static assets from /uploads/ and /
  if (req.method === 'GET' && pathname.startsWith('/uploads/')) {
    const target = path.join(UPLOADS_DIR, path.basename(pathname));
    if (serveStaticFile(res, target)) return;
  }

  if (req.method === 'GET') {
    const safeRel = pathname.replace(/^\/+/, '');
    if (safeRel && serveStaticFile(res, path.join(PUBLIC_DIR, safeRel))) return;
  }

  sendJson(res, 404, { error: 'Halaman atau endpoint tidak ditemukan' });
}

function createServer() {
  return http.createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      if (!res.headersSent) {
        sendJson(res, 500, { error: err.message || 'Terjadi kesalahan pada server' });
      } else {
        res.end();
      }
    });
  });
}

if (require.main === module) {
  loadDatabase();
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`SAPA NAMBASO running at http://${HOST}:${PORT}`);
  });
}

module.exports = { createServer };

