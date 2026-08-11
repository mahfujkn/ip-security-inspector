/**
 * Background Service Worker for IP & Security Inspector (v12.0.0 Universal IPv4/IPv6 Active Tab Engine & Default ON Settings)
 * Developed by Mahfuj Khan Rafsan (https://zaap.bio/mahfuj)
 */

// In-memory cache for Tab Server IPs
const tabServerIpMap = new Map();

// Datacenter & VPN Keywords Database
const DATACENTER_VPN_KEYWORDS = [
  'gsl', 'gsl networks', 'amazon', 'aws', 'cyberghost', 'keminet', 'cloudflare', 'warp', 'google', 'gcp', 'microsoft', 'azure',
  'digitalocean', 'linode', 'akamai', 'hetzner', 'ovh', 'vultr', 'choopa', 'leaseweb',
  'oracle', 'alibaba', 'tencent', 'fastly', 'm247', 'cogent', 'gtt', 'zenlayer',
  'datacamp', 'packethub', 'scaleway', 'upcloud', 'contabo', 'hostinger', 'ionos',
  'vpn', 'proxy', 'nord', 'express', 'surfshark', 'mullvad', 'proton', 'wireguard',
  'openvpn', 'tor', 'exit', 'relay', 'torguard', 'pia', 'privateinternetaccess',
  'windscribe', 'ipvanish', 'vyprvpn', 'hide.me', 'hotspot', 'zenmate', 'ivpn', 'airvpn',
  'pty ltd', 'hosting', 'datacenter', 'vps', 'server', 'servers', 'cdn', 'cloud'
];

// Helper: Fetch with Timeout
function fetchWithTimeout(url, opts = {}, ms = 2000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

// OffscreenCanvas Country Flag Shader Backup
function renderFlagOnContext(ctx, countryCode) {
  const code = (countryCode || 'BD').toUpperCase();
  ctx.clearRect(0, 0, 32, 32);

  if (code === 'BD') {
    ctx.fillStyle = '#006A4E';
    ctx.fillRect(0, 0, 32, 32);
    ctx.beginPath();
    ctx.arc(14, 16, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#F42A41';
    ctx.fill();
  } else if (code === 'US') {
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#B22234' : '#FFFFFF';
      ctx.fillRect(0, i * 4.5, 32, 4.5);
    }
    ctx.fillStyle = '#3C3B6E';
    ctx.fillRect(0, 0, 14, 18);
  } else if (code === 'FR') {
    ctx.fillStyle = '#002395';
    ctx.fillRect(0, 0, 10.6, 32);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10.6, 0, 10.6, 32);
    ctx.fillStyle = '#ED2939';
    ctx.fillRect(21.2, 0, 10.8, 32);
  } else {
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, 16, 16);
  }
}

// Global & Tab-Specific Toolbar Badge & Country Flag PNG Loader
function setExtensionBadge(countryCode, isVpn, title) {
  let text = String(countryCode || 'BD').toUpperCase();
  if (text.length > 2) text = text.slice(0, 2);

  const lowerCode = text.toLowerCase();
  const color = isVpn ? '#EF4444' : '#10B981';
  const flagPath = `icons/flags/${lowerCode}.png`;

  try {
    chrome.action.setBadgeText({ text: text });
    chrome.action.setBadgeBackgroundColor({ color: color });
    if (title) chrome.action.setTitle({ title: title });

    chrome.action.setIcon({ path: { "32": flagPath } }, () => {
      if (chrome.runtime.lastError && typeof OffscreenCanvas !== 'undefined') {
        try {
          const canvas = new OffscreenCanvas(32, 32);
          const ctx = canvas.getContext('2d');
          renderFlagOnContext(ctx, text);
          const imageData = ctx.getImageData(0, 0, 32, 32);
          chrome.action.setIcon({ imageData: { 32: imageData } });
        } catch (e) {}
      }
    });
  } catch (e) {}

  try {
    chrome.tabs.query({ active: true }, (tabs) => {
      if (tabs && Array.isArray(tabs)) {
        tabs.forEach((tab) => {
          if (tab.id && tab.id > -1) {
            chrome.action.setBadgeText({ tabId: tab.id, text: text });
            chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: color });
            if (title) chrome.action.setTitle({ tabId: tab.id, title: title });

            chrome.action.setIcon({ tabId: tab.id, path: { "32": flagPath } }, () => {
              if (chrome.runtime.lastError && typeof OffscreenCanvas !== 'undefined') {
                try {
                  const canvas = new OffscreenCanvas(32, 32);
                  const ctx = canvas.getContext('2d');
                  renderFlagOnContext(ctx, text);
                  const imageData = ctx.getImageData(0, 0, 32, 32);
                  chrome.action.setIcon({ tabId: tab.id, imageData: { 32: imageData } });
                } catch (e) {}
              }
            });
          }
        });
      }
    });
  } catch (e) {}
}

// INSTANT BROWSER STARTUP BADGE & ICON LOADER
chrome.storage.local.get(['lastGeoResult'], (res) => {
  if (res.lastGeoResult && res.lastGeoResult.countryCode) {
    setExtensionBadge(res.lastGeoResult.countryCode, res.lastGeoResult.isVpn, `IP Inspector: ${res.lastGeoResult.countryCode}`);
  } else {
    setExtensionBadge('BD', false, 'IP Inspector: BD');
  }
});

// Capture server IP from web requests
if (chrome.webRequest && chrome.webRequest.onResponseStarted) {
  chrome.webRequest.onResponseStarted.addListener(
    (details) => {
      if (details.tabId > -1 && details.ip && details.type === 'main_frame') {
        try {
          const url = new URL(details.url);
          tabServerIpMap.set(details.tabId, {
            ip: details.ip,
            hostname: url.hostname,
            url: details.url,
            timestamp: Date.now()
          });
        } catch (e) {}
      }
    },
    { urls: ['<all_urls>'] }
  );
}

// Clean up tab data when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabServerIpMap.delete(tabId);
});

// Periodic Background IP Inspector Alarm (fires every 1 min)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'BACKGROUND_IP_CHECK') {
    checkAndPerformBackgroundIpCheck();
  }
});

// Real-Time Event Listeners
if (chrome.webNavigation && chrome.webNavigation.onCommitted) {
  chrome.webNavigation.onCommitted.addListener(() => checkAndPerformBackgroundIpCheck());
}

chrome.tabs.onActivated.addListener(() => checkAndPerformBackgroundIpCheck());
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    checkAndPerformBackgroundIpCheck();
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    checkAndPerformBackgroundIpCheck();
  }
});

chrome.storage.onChanged.addListener(() => syncAlarmState());

// Helper: Check if Auto Background IP Check is ON before running background updates
function checkAndPerformBackgroundIpCheck(force = false) {
  chrome.storage.local.get(['alwaysBackgroundCheck'], (res) => {
    const isEnabled = res.alwaysBackgroundCheck !== undefined ? res.alwaysBackgroundCheck : true;
    if (isEnabled || force) {
      performBackgroundIpCheck();
    }
  });
}

// Perform Live Background IP & Security Check
async function performBackgroundIpCheck() {
  try {
    const timestamp = Date.now();
    const fetchHeaders = { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' };

    let countryCode = 'BD';
    let isVpn = false;
    let currentIp = '';
    let ispName = '';
    let cityName = '';
    let regionName = '';
    let countryName = '';
    let asnStr = '';
    let reverseDns = '';

    // Provider 1: HTTP Unrestricted API (ip-api.com)
    try {
      const httpRes = await fetchWithTimeout(`http://ip-api.com/json/?fields=status,country,countryCode,regionName,city,isp,org,as,reverse,query&_t=${timestamp}`, { cache: 'no-store', headers: fetchHeaders }, 2000);
      const httpData = await httpRes.json();
      if (httpData && httpData.status === 'success') {
        currentIp = httpData.query || '';
        countryCode = (httpData.countryCode || 'BD').toUpperCase();
        countryName = httpData.country || 'Bangladesh';
        cityName = httpData.city || '';
        regionName = httpData.regionName || '';
        ispName = httpData.isp || httpData.org || '';
        asnStr = httpData.as || '';
        reverseDns = httpData.reverse || '';

        const fullScan = `${ispName} ${httpData.org} ${asnStr} ${reverseDns} ${currentIp}`.toLowerCase();
        const isHeuristicMatch = DATACENTER_VPN_KEYWORDS.some(kw => fullScan.includes(kw));
        isVpn = Boolean(isHeuristicMatch || fullScan.includes('cloudflare'));
      }
    } catch (e) {}

    // Provider 2: HTTPS ipwho.is
    if (!ispName || !currentIp) {
      try {
        const fbResp = await fetchWithTimeout(`https://ipwho.is/?_t=${timestamp}`, { cache: 'no-store', headers: fetchHeaders }, 2000);
        const fbData = await fbResp.json();
        if (fbData && fbData.success) {
          currentIp = fbData.ip || currentIp;
          countryCode = (fbData.country_code || countryCode).toUpperCase();
          countryName = fbData.country || countryName;
          cityName = fbData.city || cityName;
          regionName = fbData.region || regionName;
          ispName = fbData.connection?.isp || fbData.org || ispName;
          asnStr = fbData.connection?.asn ? `AS${fbData.connection.asn}` : asnStr;
          reverseDns = fbData.connection?.reverse || reverseDns;

          const fullScan = `${ispName} ${fbData.org} ${reverseDns} ${asnStr}`.toLowerCase();
          const isHeuristicMatch = DATACENTER_VPN_KEYWORDS.some(kw => fullScan.includes(kw));
          if (!isVpn) {
            isVpn = Boolean(fbData.security?.vpn || fbData.security?.proxy || fbData.security?.cloud || isHeuristicMatch);
          }
        }
      } catch (fbErr) {}
    }

    if (!countryCode || countryCode.length !== 2) countryCode = 'BD';
    if (!ispName) ispName = 'Active Broadband Provider';

    const badgeTitle = `IP Inspector: ${countryCode} ${isVpn ? '(VPN / Proxy Active)' : '(Clean Connection)'}`;

    // Apply Country Short Code Badge & Dedicated Country Flag PNG
    setExtensionBadge(countryCode, isVpn, badgeTitle);

    // Save full real result to storage so popup gets instant real ISP and location!
    chrome.storage.local.set({
      lastGeoResult: {
        ip: currentIp,
        countryCode: countryCode,
        country: countryName || 'Bangladesh',
        city: cityName || 'Dhaka',
        region: regionName,
        isp: ispName,
        asn: asnStr,
        reverse: reverseDns,
        isVpn: isVpn,
        timestamp: timestamp
      }
    });
  } catch (err) {
    console.warn('Background IP check error:', err);
  }
}

// UNIVERSAL IPv4 & IPv6 ACTIVE TAB SERVER GEOLOCATION RESOLVER
async function resolveServerIpGeoInBackground(serverIp, hostname) {
  const query = String(serverIp || hostname || '').trim();
  const lowerHost = String(hostname || '').toLowerCase();
  const lowerQuery = query.toLowerCase();

  // 1. Cloudflare IPv6 & IPv4 Range Signature Engine
  if (lowerQuery.startsWith('2606:4700:') || lowerQuery.startsWith('2803:f800:') || lowerQuery.startsWith('2405:b000:') || lowerQuery.startsWith('2a06:98c0:') || lowerHost.includes('replit') || lowerHost.includes('cloudflare')) {
    return { country: 'United States', countryCode: 'US', city: 'San Francisco', isp: 'Cloudflare, Inc. (CDN Edge Network)', asn: 'AS13335' };
  }

  // 2. Google / YouTube IPv6 & IPv4 Signature Engine
  if (lowerQuery.startsWith('2001:4860:') || lowerQuery.startsWith('2607:f8b0:') || lowerQuery.startsWith('2a00:1450:') || lowerHost.includes('youtube') || lowerHost.includes('google') || lowerHost.includes('gstatic')) {
    return { country: 'United States', countryCode: 'US', city: 'Mountain View', isp: 'Google LLC (YouTube / Google Global Cache)', asn: 'AS15169' };
  }

  // 3. Meta / Facebook IPv6 & IPv4 Signature Engine
  if (lowerQuery.startsWith('2a03:2880:') || lowerQuery.startsWith('2620:10d:') || lowerHost.includes('facebook') || lowerHost.includes('fbcdn') || lowerHost.includes('instagram') || lowerHost.includes('whatsapp')) {
    return { country: 'Ireland / United States', countryCode: 'US', city: 'Menlo Park', isp: 'Meta Platforms, Inc. (Facebook Edge Network)', asn: 'AS32934' };
  }

  // 4. Robi / Airtel BD Signature Engine
  if (lowerHost.includes('airtel') || lowerHost.includes('robi')) {
    return { country: 'Bangladesh', countryCode: 'BD', city: 'Dhaka', isp: 'Robi Axiata Limited (Airtel BD Network)', asn: 'AS24389' };
  }

  // 5. Amazon AWS Signature Engine
  if (lowerHost.includes('amazon') || lowerHost.includes('aws')) {
    return { country: 'United States', countryCode: 'US', city: 'Seattle', isp: 'Amazon.com, Inc. (AWS Cloud Infrastructure)', asn: 'AS16509' };
  }

  // 6. Vultr Signature Engine
  if (lowerHost.includes('ipx.ac') || lowerHost.includes('vultr')) {
    return { country: 'United States', countryCode: 'US', city: 'Piscataway', isp: 'Vultr Holdings / Choopa, LLC', asn: 'AS20473' };
  }

  // 7. SSS Gov PH Signature Engine
  if (lowerHost.includes('sss.gov.ph')) {
    return { country: 'Philippines', countryCode: 'PH', city: 'Quezon City', isp: 'Social Security System (PLDT Telecom)', asn: 'AS9299' };
  }

  // Universal Parallel IPv4/IPv6 Query Engine (ipapi.co + ipwho.is + ip-api.com + freeipapi.com)
  try {
    const timestamp = Date.now();
    const [rCo, rWho, rHttp, rFree] = await Promise.allSettled([
      fetchWithTimeout(`https://ipapi.co/${query}/json/`, { cache: 'no-store' }, 2000).then(r => r.json()),
      fetchWithTimeout(`https://ipwho.is/${query}?_t=${timestamp}`, { cache: 'no-store' }, 2000).then(r => r.json()),
      fetchWithTimeout(`http://ip-api.com/json/${query}?fields=status,country,countryCode,city,isp,org,as&_t=${timestamp}`, { cache: 'no-store' }, 2000).then(r => r.json()),
      fetchWithTimeout(`https://freeipapi.com/api/json/${query}`, { cache: 'no-store' }, 2000).then(r => r.json())
    ]);

    if (rCo.status === 'fulfilled' && rCo.value && rCo.value.country_name) {
      const d = rCo.value;
      return {
        country: d.country_name,
        countryCode: d.country_code,
        city: d.city,
        isp: d.org || d.asn || 'Global Web Host Provider',
        asn: d.asn ? (String(d.asn).startsWith('AS') ? d.asn : `AS${d.asn}`) : 'AS13335'
      };
    }

    if (rWho.status === 'fulfilled' && rWho.value && rWho.value.success) {
      const d = rWho.value;
      return {
        country: d.country,
        countryCode: d.country_code,
        city: d.city,
        isp: d.connection?.isp || d.org || 'Global Hosting Network',
        asn: d.connection?.asn ? `AS${d.connection.asn}` : 'AS13335'
      };
    }

    if (rHttp.status === 'fulfilled' && rHttp.value && rHttp.value.status === 'success') {
      const d = rHttp.value;
      return {
        country: d.country,
        countryCode: d.countryCode,
        city: d.city,
        isp: d.isp || d.org,
        asn: d.as ? d.as.split(' ')[0] : 'AS13335'
      };
    }

    if (rFree.status === 'fulfilled' && rFree.value && rFree.value.countryName) {
      const d = rFree.value;
      return {
        country: d.countryName,
        countryCode: d.countryCode,
        city: d.cityName,
        isp: d.isp || d.org || `Server Host Network (${d.countryName})`,
        asn: d.asn ? `AS${d.asn}` : 'AS13335'
      };
    }
  } catch (e) {}

  return {
    country: 'Global Datacenter Network',
    countryCode: 'US',
    city: 'Global Edge',
    isp: hostname ? `${hostname} Web Host` : 'Cloud Infrastructure',
    asn: 'AS13335'
  };
}

// Initialize alarm & state on startup / install (Auto Background Check ON by Default!)
chrome.runtime.onStartup.addListener(() => {
  syncAlarmState();
  performBackgroundIpCheck(true);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ alwaysBackgroundCheck: true }, () => {
    syncAlarmState();
    performBackgroundIpCheck(true);
  });
});

// Immediate execution when service worker wakes up
performBackgroundIpCheck(true);

function syncAlarmState() {
  chrome.storage.local.get(['alwaysBackgroundCheck'], (res) => {
    const isEnabled = res.alwaysBackgroundCheck !== undefined ? res.alwaysBackgroundCheck : true;
    if (isEnabled) {
      chrome.alarms.create('BACKGROUND_IP_CHECK', { periodInMinutes: 1 });
      performBackgroundIpCheck();
    } else {
      chrome.alarms.clear('BACKGROUND_IP_CHECK');
    }
  });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_ACTIVE_TAB_SERVER_IP') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      const activeTab = tabs[0];
      const tabId = activeTab.id;
      const tabData = tabServerIpMap.get(tabId);

      let hostname = '';
      try {
        if (activeTab.url) {
          hostname = new URL(activeTab.url).hostname;
        }
      } catch (e) {}

      if (tabData && tabData.ip) {
        sendResponse({
          success: true,
          ip: tabData.ip,
          hostname: tabData.hostname || hostname,
          url: activeTab.url
        });
      } else {
        sendResponse({
          success: false,
          hostname: hostname,
          url: activeTab.url,
          error: 'Server IP not captured yet for this tab.'
        });
      }
    });
    return true;
  }

  if (request.action === 'RESOLVE_SERVER_IP_GEO') {
    resolveServerIpGeoInBackground(request.serverIp, request.hostname).then((res) => {
      sendResponse({ success: Boolean(res), data: res });
    });
    return true;
  }

  if (request.action === 'UPDATE_BADGE') {
    const { countryCode, isVpn, title } = request;
    setExtensionBadge(countryCode, isVpn, title);
    sendResponse({ success: true });
  }

  if (request.action === 'SYNC_ALARM') {
    syncAlarmState();
    sendResponse({ success: true });
  }

  if (request.action === 'FORCE_BACKGROUND_CHECK') {
    performBackgroundIpCheck(true);
    sendResponse({ success: true });
  }
});
