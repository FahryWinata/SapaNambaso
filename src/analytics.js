'use strict';

function resolveDateRange(query) {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);

  switch (query.range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case '7d':
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;
    case '12m':
      start.setMonth(start.getMonth() - 11);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'custom': {
      const s = Date.parse(query.startDate || '');
      const e = Date.parse(query.endDate || '');
      if (Number.isFinite(s) && Number.isFinite(e) && s <= e) {
        start = new Date(s);
        end.setTime(e);
        end.setHours(23, 59, 59, 999);
      } else {
        start.setDate(start.getDate() - 29);
      }
      break;
    }
    case '30d':
    default:
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      break;
  }

  const spanMs = Math.max(24 * 60 * 60 * 1000, end.getTime() - start.getTime());
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - spanMs);
  return { start, end, prevStart, prevEnd };
}

function filterEvents(events, start, end, filters) {
  return events.filter((ev) => {
    const ms = Date.parse(ev.ts);
    if (!Number.isFinite(ms) || ms < start.getTime() || ms > end.getTime()) return false;
    if (filters.device && filters.device !== 'all' && ev.device !== filters.device) return false;
    if (filters.source && filters.source !== 'all' && ev.source !== filters.source) return false;
    if (filters.region && filters.region !== 'all' && ev.region !== filters.region) return false;
    return true;
  });
}

function formatDelta(current, previous, suffix = '%') {
  if (previous === 0 && current === 0) return 'Belum ada data pembanding';
  if (previous === 0) return 'Periode lalu 0';
  const pct = Math.round(((current - previous) / previous) * 100);
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct}${suffix} dibanding periode lalu`;
}

function summarizePeriod(events) {
  const visitors = new Set();
  const sessions = new Set();
  const engagedSessions = new Set();
  const durations = [];
  let pageviews = 0;

  for (const ev of events) {
    visitors.add(ev.visitorId);
    sessions.add(ev.sessionId);
    if (ev.type === 'pageview') pageviews += 1;
    if (ev.type === 'service_open' || ev.type === 'action_click' || ev.type === 'search') {
      engagedSessions.add(ev.sessionId);
    }
    if (ev.type === 'session_end' && Number.isFinite(ev.durationMs)) {
      durations.push(ev.durationMs);
    }
  }

  const totalVisits = sessions.size;
  const avgDurationSec = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 1000)
    : 0;
  const engagedRatePct = totalVisits > 0
    ? Math.round((engagedSessions.size / totalVisits) * 100)
    : 0;

  return {
    uniqueVisitors: visitors.size,
    totalVisits,
    pageviews,
    avgDurationSec,
    engagedRatePct
  };
}

function countBy(items, getKey) {
  const map = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function bucketKey(isoTs, granularity) {
  const d = new Date(isoTs);
  if (granularity === 'monthly') return isoTs.slice(0, 7);
  if (granularity === 'weekly') {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d);
    mon.setDate(diff);
    return mon.toISOString().slice(0, 10);
  }
  return isoTs.slice(0, 10);
}

function buildAnalyticsReport(allEvents, query) {
  const { start, end, prevStart, prevEnd } = resolveDateRange(query);
  const currentEvents = filterEvents(allEvents, start, end, query);
  const prevEvents = filterEvents(allEvents, prevStart, prevEnd, query);

  const curSum = summarizePeriod(currentEvents);
  const prevSum = summarizePeriod(prevEvents);
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const activeSessions = new Set(
    allEvents.filter((ev) => Date.parse(ev.ts) >= fiveMinAgo).map((ev) => ev.sessionId)
  );

  const summary = {
    ...curSum,
    activeNow: activeSessions.size,
    deltas: {
      uniqueVisitors: formatDelta(curSum.uniqueVisitors, prevSum.uniqueVisitors),
      totalVisits: formatDelta(curSum.totalVisits, prevSum.totalVisits),
      pageviews: formatDelta(curSum.pageviews, prevSum.pageviews),
      avgDurationSec: formatDelta(curSum.avgDurationSec, prevSum.avgDurationSec),
      engagedRatePct: formatDelta(curSum.engagedRatePct, prevSum.engagedRatePct, ' poin')
    }
  };

  // G1 & G13 time series
  const gran = query.granularity || 'daily';
  const curBuckets = new Map();
  const prevBuckets = new Map();
  const perfBuckets = new Map();

  for (const ev of currentEvents) {
    const k = bucketKey(ev.ts, gran);
    if (ev.type === 'pageview') {
      curBuckets.set(k, (curBuckets.get(k) || 0) + 1);
      const p = perfBuckets.get(k) || { sumLoad: 0, loadCount: 0, errors: 0 };
      if (Number.isFinite(ev.loadMs)) {
        p.sumLoad += ev.loadMs;
        p.loadCount += 1;
      }
      if (ev.isError) p.errors += 1;
      perfBuckets.set(k, p);
    }
  }
  for (const ev of prevEvents) {
    if (ev.type === 'pageview') {
      const k = bucketKey(ev.ts, gran);
      prevBuckets.set(k, (prevBuckets.get(k) || 0) + 1);
    }
  }
  const prevValues = Array.from(prevBuckets.values());
  const g1Keys = Array.from(curBuckets.keys()).sort();
  const g1Series = g1Keys.map((k, idx) => ({
    label: k,
    current: curBuckets.get(k) || 0,
    previous: prevValues[idx] || 0
  }));

  const g13PerfSeries = g1Keys.map((k) => {
    const p = perfBuckets.get(k) || { sumLoad: 0, loadCount: 0, errors: 0 };
    return {
      label: k,
      avgLoadMs: p.loadCount > 0 ? Math.round(p.sumLoad / p.loadCount) : 0,
      errors: p.errors
    };
  });

  // G2 New vs Returning (by whether visitorId appeared before current start date)
  const priorVisitors = new Set(
    allEvents.filter((ev) => Date.parse(ev.ts) < start.getTime()).map((ev) => ev.visitorId)
  );
  const seenInCurrent = new Set();
  let newVisitors = 0;
  let returningVisitors = 0;
  for (const ev of currentEvents) {
    if (seenInCurrent.has(ev.visitorId)) continue;
    seenInCurrent.add(ev.visitorId);
    if (priorVisitors.has(ev.visitorId)) returningVisitors += 1;
    else newVisitors += 1;
  }
  const g2NewVsReturning = [
    { label: 'Pengunjung Baru', count: newVisitors },
    { label: 'Pengunjung Kembali', count: returningVisitors }
  ];

  // G3 Heatmap (Day x 2-hour WITA bucket)
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const heatCounts = Array.from({ length: 7 }, () => new Array(12).fill(0));
  for (const ev of currentEvents) {
    if (ev.type !== 'pageview') continue;
    const witaStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Makassar',
      weekday: 'short',
      hour: '2-digit',
      hour12: false
    }).formatToParts(new Date(ev.ts));
    const map = {};
    for (const p of witaStr) map[p.type] = p.value;
    const dayIdx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday] ?? 0;
    const hourBucket = Math.min(11, Math.floor((Number(map.hour) || 0) / 2));
    heatCounts[dayIdx][hourBucket] += 1;
  }
  const g3Heatmap = dayNames.map((day, dIdx) => ({
    day,
    buckets: heatCounts[dIdx].map((count, bIdx) => ({
      label: `${String(bIdx * 2).padStart(2, '0')}:00`,
      count
    }))
  }));

  const pageviewsList = currentEvents.filter((e) => e.type === 'pageview');
  const g4Sources = countBy(pageviewsList, (e) => e.source);
  const g5Devices = countBy(pageviewsList, (e) => e.device);
  const g5OsBrowser = countBy(pageviewsList, (e) => `${e.os} / ${e.browser}`);
  const g6Regions = countBy(pageviewsList, (e) => e.region);

  // G7 Sections & scroll depth
  const secMap = new Map();
  for (const ev of currentEvents) {
    if (ev.type === 'section_view' && ev.section) {
      const prev = secMap.get(ev.section) || { count: 0, depthSum: 0 };
      prev.count += 1;
      prev.depthSum += ev.scrollDepth || 0;
      secMap.set(ev.section, prev);
    }
  }
  const g7Sections = Array.from(secMap.entries())
    .map(([label, v]) => ({
      label: `#${label}`,
      count: v.count,
      extra: `gulir ${Math.round(v.depthSum / Math.max(1, v.count))}%`
    }))
    .sort((a, b) => b.count - a.count);

  const g8Services = countBy(
    currentEvents.filter((e) => e.type === 'service_open'),
    (e) => e.serviceName || e.serviceId
  );

  const actionNames = {
    cek_pajak: 'Cek Pajak Kendaraan',
    directions: 'Petunjuk Arah Peta',
    whatsapp: 'WhatsApp',
    phone: 'Telepon',
    email: 'Email',
    social_instagram: 'Instagram',
    social_tiktok: 'TikTok',
    social_facebook: 'Facebook',
    partner_link: 'Tautan Mitra'
  };
  const g9Actions = countBy(
    currentEvents.filter((e) => e.type === 'action_click'),
    (e) => actionNames[e.actionName] || e.actionName
  );

  const g10Locations = countBy(
    currentEvents.filter((e) => e.type === 'action_click' && e.actionName === 'directions'),
    (e) => e.locationName || e.locationId
  );

  // G11 Funnel
  const visitSessions = new Set(pageviewsList.map((e) => e.sessionId));
  const serviceSessions = new Set(currentEvents.filter((e) => e.type === 'service_open').map((e) => e.sessionId));
  const taxSessions = new Set(currentEvents.filter((e) => e.type === 'action_click' && e.actionName === 'cek_pajak').map((e) => e.sessionId));
  const g11Funnel = [
    { label: '1. Kunjungan Situs', count: visitSessions.size },
    { label: '2. Buka Rincian Layanan', count: serviceSessions.size },
    { label: '3. Klik Cek Pajak Bapenda', count: taxSessions.size }
  ];

  const g12SearchTerms = countBy(
    currentEvents.filter((e) => e.type === 'search'),
    (e) => e.searchQuery
  ).slice(0, 15);

  return {
    summary,
    g1Series,
    g2NewVsReturning,
    g3Heatmap,
    g4Sources,
    g5Devices,
    g5OsBrowser,
    g6Regions,
    g7Sections,
    g8Services,
    g9Actions,
    g10Locations,
    g11Funnel,
    g12SearchTerms,
    g13PerfSeries
  };
}

module.exports = {
  buildAnalyticsReport,
  filterEvents,
  resolveDateRange
};

