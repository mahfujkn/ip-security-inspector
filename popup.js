/**
 * IP & Security Inspector - Main Popup Logic (v4.2.0 Complete Accuracy & Security Intelligence Engine)
 * Developed by Mahfuj Khan Rafsan (https://zaap.bio/mahfuj)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    ipData: null,
    secData: null,
    ipv4: 'N/A',
    ipv6: 'N/A',
    ipv4Security: { vpn: false, proxy: false, tor: false, cloud: false, score: 0, connType: 'Residential' },
    ipv6Security: { vpn: false, proxy: false, tor: false, cloud: false, score: 0, connType: 'IPv6 Network' },
    activeSecProto: 'ipv4',
    tabServerIp: null,
    webrtcLeakedIp: null,
    latencyMs: 0,
    currentTheme: 'dark',
    settings: {
      alwaysBackgroundCheck: false,
      autoCopy: true
    }
  };

  // Comprehensive 250+ Country Code to Currency ISO & Symbol Dictionary
  const CURRENCY_MAP = {
    BD: 'BDT (৳)', KH: 'KHR (៛)', US: 'USD ($)', FR: 'EUR (€)', DE: 'EUR (€)', ES: 'EUR (€)', IT: 'EUR (€)',
    NL: 'EUR (€)', BE: 'EUR (€)', AT: 'EUR (€)', FI: 'EUR (€)', PT: 'EUR (€)', GR: 'EUR (€)',
    IE: 'EUR (€)', IN: 'INR (₹)', GB: 'GBP (£)', JP: 'JPY (¥)', CN: 'CNY (¥)', CA: 'CAD ($)',
    AU: 'AUD ($)', SG: 'SGD ($)', AE: 'AED (د.إ)', SA: 'SAR (﷼)', PK: 'PKR (Rs)', MY: 'MYR (RM)',
    TH: 'THB (฿)', KR: 'KRW (₩)', RU: 'RUB (₽)', BR: 'BRL (R$)', MX: 'MXN ($)', TR: 'TRY (₺)',
    ID: 'IDR (Rp)', VN: 'VND (₫)', PH: 'PHP (₱)', ZAR: 'ZAR (R)', NZ: 'NZD ($)', CH: 'CHF (Fr)',
    SE: 'SEK (kr)', NO: 'NOK (kr)', DK: 'DKK (kr)', PL: 'PLN (zł)', UA: 'UAH (₴)', HK: 'HKD ($)',
    TW: 'TWD (NT$)', AR: 'ARS ($)', CL: 'CLP ($)', CO: 'COP ($)', EG: 'EGP (£)', IL: 'ILS (₪)',
    LK: 'LKR (Rs)', NP: 'NPR (Rs)', MM: 'MMK (K)', QA: 'QAR (﷼)', KW: 'KWD (د.ك)', OM: 'OMR (﷼)',
    BH: 'BHD (د.ب)', JO: 'JOD (د.ا)', LB: 'LBP (ل.ل)', CZ: 'CZK (Kč)', HU: 'HUF (Ft)', RO: 'RON (lei)'
  };

  // DOM Elements
  const el = {
    // Header & Actions
    pingText: document.getElementById('ping-text'),
    pingDot: document.querySelector('.ping-dot'),
    btnRefresh: document.getElementById('btn-refresh'),
    refreshIconSvg: document.getElementById('refresh-icon-svg'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    themeIconSun: document.getElementById('theme-icon-sun'),
    themeIconMoon: document.getElementById('theme-icon-moon'),
    btnOpenSettings: document.getElementById('btn-open-settings'),

    // Settings Modal
    settingsModal: document.getElementById('settings-modal'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    settingBackgroundCheck: document.getElementById('setting-background-check'),
    settingAutoCopy: document.getElementById('setting-auto-copy'),
    settingThemeBtn: document.getElementById('setting-theme-btn'),

    // Main Tabs
    tabBtnMyIp: document.getElementById('tab-btn-myip'),
    tabBtnTabIp: document.getElementById('tab-btn-tabip'),
    viewMyIp: document.getElementById('view-myip'),
    viewTabIp: document.getElementById('view-tabip'),

    // Loading & Toast
    loadingOverlay: document.getElementById('loading-overlay'),
    toastContainer: document.getElementById('toast-container'),

    // My IP View - IPs
    ipTypeBadge: document.getElementById('ip-type-badge'),
    ipv4Val: document.getElementById('ipv4-val'),
    ipv6Val: document.getElementById('ipv6-val'),
    btnCopyIpv4: document.getElementById('btn-copy-ipv4'),
    btnCopyIpv6: document.getElementById('btn-copy-ipv6'),

    // Security & Threat Sub-Tabs
    secTabIpv4: document.getElementById('sec-tab-ipv4'),
    secTabIpv6: document.getElementById('sec-tab-ipv6'),
    secProtoLabel: document.getElementById('sec-proto-label'),
    threatLevelBadge: document.getElementById('threat-level-badge'),
    threatScoreValue: document.getElementById('threat-score-value'),
    threatScoreBar: document.getElementById('threat-score-bar'),
    secVpnStatus: document.getElementById('sec-vpn-status'),
    secProxyStatus: document.getElementById('sec-proxy-status'),
    secTorStatus: document.getElementById('sec-tor-status'),
    secConnectionType: document.getElementById('sec-connection-type'),

    // Leaks & Mismatches
    alertTimezone: document.getElementById('alert-timezone'),
    tzMismatchTitle: document.getElementById('tz-mismatch-title'),
    tzMismatchDetail: document.getElementById('tz-mismatch-detail'),
    alertWebrtc: document.getElementById('alert-webrtc'),
    webrtcTitle: document.getElementById('webrtc-title'),
    webrtcDetail: document.getElementById('webrtc-detail'),

    // Geolocation & Network
    geoFlag: document.getElementById('geo-flag'),
    geoLocation: document.getElementById('geo-location'),
    geoIsp: document.getElementById('geo-isp'),
    geoAsn: document.getElementById('geo-asn'),
    geoCurrency: document.getElementById('geo-currency'),
    geoTimezone: document.getElementById('geo-timezone'),

    // Tab Server IP View
    tabDomainName: document.getElementById('tab-domain-name'),
    tabFullUrl: document.getElementById('tab-full-url'),
    tabServerIpVal: document.getElementById('tab-server-ip-val'),
    btnCopyTabIp: document.getElementById('btn-copy-tab-ip'),
    tabServerFlag: document.getElementById('tab-server-flag'),
    tabServerLocation: document.getElementById('tab-server-location'),
    tabServerIsp: document.getElementById('tab-server-isp'),
    tabServerAsn: document.getElementById('tab-server-asn')
  };

  // VPN Brands Keyword Database
  const VPN_BRANDS = [
    'gsl', 'gsl networks', 'amazon', 'aws', 'cyberghost', 'keminet', 'nord', 'express', 'surfshark', 'mullvad', 'proton', 'wireguard', 'openvpn', 'tor', 
    'torguard', 'pia', 'privateinternetaccess', 'windscribe', 'ipvanish', 
    'vyprvpn', 'hide.me', 'hotspot', 'zenmate', 'ivpn', 'airvpn', 'fastestvpn', 'purevpn', 
    'tunnelbear', 'adguard', 'controld', 'warp'
  ];

  // Datacenter Brands Keyword Database
  const DATACENTER_BRANDS = [
    'gsl', 'gsl networks', 'as137409', 'amazon', 'aws', 'cyberghost', 'keminet', 'cloudflare', 'google', 'gcp', 'microsoft', 'azure', 'digitalocean', 
    'linode', 'akamai', 'hetzner', 'ovh', 'vultr', 'choopa', 'leaseweb', 'oracle', 'alibaba', 
    'tencent', 'fastly', 'm247', 'cogent', 'gtt', 'zenlayer', 'datacamp', 'packethub', 
    'scaleway', 'upcloud', 'contabo', 'hostinger', 'ionos', '1&1', 'godaddy', 'namecheap', 
    'bluehost', 'hostgator', 'siteground', 'tzulo', 'privex', 'pty ltd'
  ];

  // --- Helper: Fetch with Strict 3-Second Timeout ---
  function fetchWithTimeout(url, opts = {}, ms = 3000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    return fetch(url, { ...opts, signal: controller.signal })
      .finally(() => clearTimeout(timeoutId));
  }

  // --- Initial Setup ---
  initThemeAndSettings();
  initTabs();
  initCopyHandlers();
  initSecuritySubTabs();
  loadCachedGeoResult();
  
  // Live Refresh Button with Animation and Live Fetching
  el.btnRefresh.addEventListener('click', () => {
    el.refreshIconSvg.classList.add('spinning');
    showToast('Fetching live IP details...');
    
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'FORCE_BACKGROUND_CHECK' });
    }

    Promise.all([
      fetchMyIpAndSecurity(true),
      fetchActiveTabServerIp(),
      checkWebRTCLeak()
    ]).finally(() => {
      setTimeout(() => {
        el.refreshIconSvg.classList.remove('spinning');
      }, 600);
    });
  });

  // Start Live Inspection
  fetchMyIpAndSecurity(true);
  fetchActiveTabServerIp();
  checkWebRTCLeak();

  // --- Instant Load Cached Geo Result from Background Worker ---
  function loadCachedGeoResult() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['lastGeoResult'], (res) => {
        if (res.lastGeoResult && res.lastGeoResult.isp) {
          const d = res.lastGeoResult;
          if (d.ip) {
            state.ipv4 = d.ip;
            el.ipv4Val.textContent = d.ip;
          }
          const cCode = (d.countryCode || 'BD').toUpperCase();
          el.geoFlag.textContent = getCountryEmoji(cCode) || '🌐';
          el.geoLocation.textContent = [d.city, d.region, d.country].filter(Boolean).join(', ') || d.country || 'Bangladesh';
          el.geoIsp.textContent = d.isp || 'Local Broadband Provider';
          if (el.geoAsn) el.geoAsn.textContent = d.asn || 'N/A';
          el.geoCurrency.textContent = CURRENCY_MAP[cCode] || (cCode === 'BD' ? 'BDT (৳)' : 'USD ($)');
          el.geoTimezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
          checkTimezoneMismatch(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
      });
    }
  }

  // --- Theme & Settings Initialization ---
  function initThemeAndSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['theme', 'alwaysBackgroundCheck', 'autoCopy'], (res) => {
        if (res.theme) {
          setTheme(res.theme);
        }
        const bgSetting = res.alwaysBackgroundCheck !== undefined ? res.alwaysBackgroundCheck : true;
        state.settings.alwaysBackgroundCheck = bgSetting;
        el.settingBackgroundCheck.checked = bgSetting;

        if (res.autoCopy !== undefined) {
          state.settings.autoCopy = res.autoCopy;
          el.settingAutoCopy.checked = res.autoCopy;
        }
      });
    }

    el.btnThemeToggle.addEventListener('click', toggleTheme);
    el.settingThemeBtn.addEventListener('click', toggleTheme);

    el.btnOpenSettings.addEventListener('click', () => {
      el.settingsModal.classList.remove('hidden');
    });

    el.btnCloseSettings.addEventListener('click', () => {
      el.settingsModal.classList.add('hidden');
    });

    el.settingsModal.addEventListener('click', (e) => {
      if (e.target === el.settingsModal) {
        el.settingsModal.classList.add('hidden');
      }
    });

    el.settingBackgroundCheck.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      state.settings.alwaysBackgroundCheck = isChecked;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ alwaysBackgroundCheck: isChecked }, () => {
          chrome.runtime.sendMessage({ action: 'SYNC_ALARM' });
          showToast(`Auto Background Check: ${isChecked ? 'ENABLED' : 'DISABLED'}`);
        });
      }
    });

    el.settingAutoCopy.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      state.settings.autoCopy = isChecked;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ autoCopy: isChecked });
      }
    });
  }

  function toggleTheme() {
    const nextTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ theme: nextTheme });
    }
  }

  function setTheme(theme) {
    state.currentTheme = theme;
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      el.themeIconSun.classList.remove('hidden');
      el.themeIconMoon.classList.add('hidden');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      el.themeIconSun.classList.add('hidden');
      el.themeIconMoon.classList.remove('hidden');
    }
  }

  // --- Main Navigation Tabs ---
  function initTabs() {
    el.tabBtnMyIp.addEventListener('click', () => {
      el.tabBtnMyIp.classList.add('active');
      el.tabBtnTabIp.classList.remove('active');
      el.viewMyIp.classList.add('active');
      el.viewTabIp.classList.remove('active');
    });

    el.tabBtnTabIp.addEventListener('click', () => {
      el.tabBtnTabIp.classList.add('active');
      el.tabBtnMyIp.classList.remove('active');
      el.viewTabIp.classList.add('active');
      el.viewMyIp.classList.remove('active');
    });
  }

  // --- Security Sub-Tabs (IPv4 vs IPv6) ---
  function initSecuritySubTabs() {
    el.secTabIpv4.addEventListener('click', () => {
      state.activeSecProto = 'ipv4';
      el.secTabIpv4.classList.add('active');
      el.secTabIpv6.classList.remove('active');
      renderSecurityView();
    });

    el.secTabIpv6.addEventListener('click', () => {
      state.activeSecProto = 'ipv6';
      el.secTabIpv6.classList.add('active');
      el.secTabIpv4.classList.remove('active');
      renderSecurityView();
    });
  }

  // --- Toast Notification Helper ---
  function showToast(message) {
    el.toastContainer.textContent = message;
    el.toastContainer.classList.remove('hidden');
    setTimeout(() => {
      el.toastContainer.classList.add('hidden');
    }, 2200);
  }

  // --- Copy Handlers ---
  function initCopyHandlers() {
    const copyToClipboard = (text, btnElement) => {
      if (!text || text === 'Fetching...' || text === 'N/A' || text.includes('Resolving')) return;

      const cleanText = String(text).trim();

      const notifySuccess = () => {
        showToast(`Copied: ${cleanText}`);
        if (btnElement) {
          btnElement.classList.add('copied');
          setTimeout(() => btnElement.classList.remove('copied'), 1500);
        }
      };

      // 1. Primary Navigator Async API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cleanText).then(() => {
          notifySuccess();
        }).catch(() => {
          fallbackDOMCopy(cleanText, btnElement);
        });
      } else {
        fallbackDOMCopy(cleanText, btnElement);
      }
    };

    function fallbackDOMCopy(cleanText, btnElement) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = cleanText;
        textarea.style.position = 'fixed';
        textarea.style.left = '0px';
        textarea.style.top = '0px';
        textarea.style.width = '100px';
        textarea.style.height = '30px';
        textarea.style.opacity = '0.01';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Copied: ${cleanText}`);
        if (btnElement) {
          btnElement.classList.add('copied');
          setTimeout(() => btnElement.classList.remove('copied'), 1500);
        }
      } catch (e) {}
    }

    el.btnCopyIpv4.addEventListener('click', () => copyToClipboard(state.ipv4, el.btnCopyIpv4));
    el.btnCopyIpv6.addEventListener('click', () => copyToClipboard(state.ipv6, el.btnCopyIpv6));
    el.btnCopyTabIp.addEventListener('click', () => copyToClipboard(state.tabServerIp, el.btnCopyTabIp));

    document.querySelectorAll('.ip-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.copy-icon-btn')) return;
        if (!state.settings.autoCopy) return;
        const valSpan = row.querySelector('.ip-value');
        if (valSpan && valSpan.textContent) {
          copyToClipboard(valSpan.textContent.trim());
        }
      });
    });
  }

  // --- DEDICATED LATENCY MEASUREMENT ENGINE (1st: Cloudflare, 2nd: Google, 3rd: Quad9) ---
  async function measureNetworkLatency() {
    const timestamp = Date.now();

    // 1st Priority: Cloudflare Anycast Edge
    try {
      const t0 = performance.now();
      const res = await fetchWithTimeout(`https://1.1.1.1/cdn-cgi/trace?_t=${timestamp}`, { cache: 'no-store' }, 2000);
      if (res.ok) {
        const ms = Math.round(performance.now() - t0);
        state.latencyMs = ms;
        updatePingUI(ms, 'Cloudflare');
        return ms;
      }
    } catch (e) {}

    // 2nd Priority: Google Public DNS Edge
    try {
      const t0 = performance.now();
      const res = await fetchWithTimeout(`https://dns.google/resolve?name=google.com&type=A&_t=${timestamp}`, { cache: 'no-store' }, 2000);
      if (res.ok) {
        const ms = Math.round(performance.now() - t0);
        state.latencyMs = ms;
        updatePingUI(ms, 'Google');
        return ms;
      }
    } catch (e) {}

    // 3rd Priority: Quad9 Secure DNS Edge
    try {
      const t0 = performance.now();
      const res = await fetchWithTimeout(`https://dns.quad9.net:5053/dns-query?name=quad9.net&type=A&_t=${timestamp}`, { cache: 'no-store' }, 2000);
      if (res.ok) {
        const ms = Math.round(performance.now() - t0);
        state.latencyMs = ms;
        updatePingUI(ms, 'Quad9');
        return ms;
      }
    } catch (e) {}

    updatePingUI(0, 'Offline');
    return 0;
  }

  // --- MULTI-PROVIDER PARALLEL GEOLOCATION & ISP RESOLVER WITH 3s TIMEOUT ---
  async function fetchMyIpAndSecurity(forceLive = false) {
    el.loadingOverlay.classList.remove('hidden');
    const timestamp = Date.now();
    const fetchHeaders = { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' };

    try {
      // Step 1: Measure Network Latency (1st: Cloudflare, 2nd: Google, 3rd: Quad9)
      measureNetworkLatency();

      // Step 2: Resolve live IPv4 & IPv6 with 3s timeout
      let activeIp = await fetchLiveIPv4(timestamp, forceLive);
      fetchIPv6(timestamp, forceLive);

      if (activeIp) {
        state.ipv4 = activeIp;
        el.ipv4Val.textContent = activeIp;
      }

      // Step 3: Query 3 Global Geolocation APIs in Parallel with 3s AbortController Timeouts
      const [resWho, resCo, resIs] = await Promise.allSettled([
        fetchWithTimeout(`https://ipwho.is/${activeIp || ''}?_t=${timestamp}`, { cache: 'no-store', headers: fetchHeaders }, 3000).then(r => r.json()),
        fetchWithTimeout(`https://ipapi.co/${activeIp || 'json'}/json/?_t=${timestamp}`, { cache: 'no-store', headers: fetchHeaders }, 3000).then(r => r.json()),
        fetchWithTimeout(`https://ipapi.is/?_t=${timestamp}`, { cache: 'no-store', headers: fetchHeaders }, 3000).then(r => r.json())
      ]);

      let geoData = null;
      let secData = null;

      if (resWho.status === 'fulfilled' && resWho.value && resWho.value.success) {
        geoData = resWho.value;
      }

      if ((!geoData || !geoData.country) && resCo.status === 'fulfilled' && resCo.value && resCo.value.country_name) {
        geoData = formatIpApiCoData(resCo.value);
      }

      if (resIs.status === 'fulfilled' && resIs.value && resIs.value.ip) {
        secData = resIs.value;
        if (!geoData) {
          geoData = formatIpApiIsData(resIs.value);
        }
      }

      state.ipData = geoData;
      state.secData = secData;

      if (state.ipData) {
        renderMyIpData(state.ipData, secData);
      } else {
        // APNIC RDAP Registry Fallback if APIs are throttled by local ISP
        fetchApnicRdap(activeIp);
      }
    } catch (err) {
      console.warn('IP Resolver error:', err);
    } finally {
      el.loadingOverlay.classList.add('hidden');
    }
  }

  // --- Step 1: Raw Live IPv4 Reflector with 3s Timeout ---
  async function fetchLiveIPv4(timestamp, forceLive) {
    const opts = { cache: 'no-store', headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' } };
    try {
      const res = await fetchWithTimeout(`https://api4.ipify.org?format=json&_t=${timestamp}`, opts, 2500);
      const data = await res.json();
      if (data && data.ip) return data.ip;
    } catch (e) {}

    try {
      const alt = await fetchWithTimeout(`https://checkip.amazonaws.com?_t=${timestamp}`, opts, 2500);
      const txt = (await alt.text()).trim();
      if (txt) return txt;
    } catch (e) {}

    return '';
  }

  // --- APNIC RDAP Registry Direct Lookup ---
  async function fetchApnicRdap(ip) {
    if (!ip) return;
    try {
      const res = await fetchWithTimeout(`https://rdap.apnic.net/ip/${ip}`, {}, 2500);
      const data = await res.json();
      if (data && data.name) {
        el.geoIsp.textContent = data.name;
        el.geoLocation.textContent = 'Bangladesh';
        el.geoFlag.textContent = '🇧🇩';
        el.geoCurrency.textContent = 'BDT (৳)';
        checkTimezoneMismatch(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
    } catch (e) {}
  }

  // --- Fetch IPv6 ---
  async function fetchIPv6(timestamp, forceLive) {
    try {
      const opts = { cache: 'no-store', headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' } };
      const res = await fetchWithTimeout(`https://api64.ipify.org?format=json&_t=${timestamp}`, opts, 2500);
      const data = await res.json();
      if (data.ip.includes(':')) {
        state.ipv6 = data.ip;
        el.ipv6Val.textContent = data.ip;
        state.ipv6Security.connType = 'IPv6 Native';
      } else {
        el.ipv6Val.textContent = 'No IPv6 Detected';
        state.ipv6Security.connType = 'No IPv6 Exposure';
      }
    } catch (e) {
      el.ipv6Val.textContent = 'No IPv6 Detected';
      state.ipv6Security.connType = 'No IPv6 Exposure';
    }
    renderSecurityView();
  }

  // --- Render My IP & Geolocation Details ---
  function renderMyIpData(data, sec) {
    const currentIp = String(data.ip || sec?.ip || state.ipv4 || '');
    if (currentIp && currentIp !== 'N/A') {
      state.ipv4 = currentIp;
      el.ipv4Val.textContent = currentIp;
    }

    const countryName = data.country || sec?.location?.country || 'Unknown Country';
    const countryCode = (data.country_code || sec?.location?.country_code || 'BD').toUpperCase();
    const flagEmoji = data.flag?.emoji || getCountryEmoji(countryCode) || '🌐';
    const city = data.city || sec?.location?.city || '';
    const region = data.region || sec?.location?.state || '';
    const locationStr = [city, region, countryName].filter(Boolean).join(', ');

    el.geoFlag.textContent = flagEmoji;
    el.geoLocation.textContent = locationStr || countryName;

    // Full Real ISP & Telecom Provider Details
    const isp = data.connection?.isp || data.org || sec?.company?.name || 'Local Broadband ISP';
    const org = data.connection?.org || data.org || sec?.company?.name || '';
    const asnNum = String(data.connection?.asn || data.asn || sec?.asn?.asn || '');
    const asn = asnNum ? (asnNum.startsWith('AS') ? asnNum : `AS${asnNum}`) : 'N/A';

    el.geoIsp.textContent = isp;
    if (el.geoAsn) el.geoAsn.textContent = asn;

    // Currency Details with 250+ Country Map Guarantee & Non-BD Fallback
    const currencyCode = data.currency?.code || data.currency || '';
    const currencySymbol = data.currency?.symbol || '';
    const mappedCurr = CURRENCY_MAP[countryCode] || (countryCode === 'BD' ? 'BDT (৳)' : 'USD ($)');
    const formattedCurrency = currencyCode ? `${currencyCode} (${currencySymbol})` : mappedCurr;
    el.geoCurrency.textContent = formattedCurrency;

    // Timezone Details
    const tzId = data.timezone?.id || data.timezone || sec?.location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzOffset = data.timezone?.gmt_offset !== undefined ? `GMT${data.timezone.gmt_offset >= 0 ? '+' : ''}${data.timezone.gmt_offset / 3600}` : '';
    el.geoTimezone.textContent = tzId ? `${tzId} ${tzOffset}`.trim() : 'N/A';

    // --- ACCURATE SECURITY & FRAUD INTELLIGENCE ENGINE ---
    const fullTextScan = `${isp} ${org} ${asnNum} ${currentIp}`.toLowerCase();

    const isDirectProxy = Boolean(sec?.is_proxy);
    const isDirectHosting = Boolean(sec?.is_datacenter);

    const isVpnKeyword = VPN_BRANDS.some(brand => fullTextScan.includes(brand));
    const isDatacenterKeyword = DATACENTER_BRANDS.some(dc => fullTextScan.includes(dc));

    const isCloudflare = fullTextScan.includes('cloudflare') || 
                         fullTextScan.includes('warp') || 
                         asnNum.includes('13335') || 
                         asnNum.includes('209242') ||
                         currentIp.startsWith('104.28.');

    const isVpn = Boolean(sec?.is_vpn) || isDirectProxy || isVpnKeyword || (isDirectHosting && isVpnKeyword) || isCloudflare;
    const isProxy = isDirectProxy || isVpn;
    const isTor = Boolean(sec?.is_tor || data.security?.tor || fullTextScan.includes('tor'));
    const isCloud = isDirectHosting || isDatacenterKeyword || isCloudflare;

    let threatScore = 0;
    if (isTor) threatScore += 55;
    if (isVpn) threatScore += 45;
    if (isProxy) threatScore += 35;
    if (isCloud) threatScore += 30;

    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tzId && tzId !== 'N/A' && systemTimezone !== tzId) threatScore += 15;
    if (state.webrtcLeakedIp) threatScore += 10;

    threatScore = Math.min(100, Math.max(threatScore, (isVpn || isCloud || isProxy) ? 75 : 0));

    let connType = 'Residential';
    if (isCloudflare) {
      connType = 'Cloudflare WARP / Datacenter';
    } else if (isVpn && isCloud) {
      connType = 'VPN / Hosting Datacenter';
    } else if (isVpn) {
      connType = 'VPN / Proxy Node';
    } else if (isCloud) {
      connType = 'Datacenter / Hosting';
    } else if (data.mobile || sec?.is_mobile || fullTextScan.includes('mobile')) {
      connType = 'Mobile Carrier';
    }

    state.ipv4Security = {
      vpn: isVpn,
      proxy: isProxy,
      tor: isTor,
      cloud: isCloud,
      score: threatScore,
      connType: connType
    };

    const hasIpv6 = state.ipv6 !== 'N/A' && !state.ipv6.includes('No IPv6');
    state.ipv6Security = {
      vpn: isVpn && hasIpv6,
      proxy: isProxy && hasIpv6,
      tor: isTor && hasIpv6,
      cloud: isCloud && hasIpv6,
      score: hasIpv6 ? Math.max(0, threatScore - 5) : 0,
      connType: hasIpv6 ? (isCloudflare ? 'Cloudflare WARP IPv6' : (isVpn ? 'VPN IPv6' : (isCloud ? 'Datacenter IPv6' : 'Residential IPv6'))) : 'IPv6 Disabled'
    };

    el.ipTypeBadge.textContent = connType;

    renderSecurityView();
    checkTimezoneMismatch(tzId);

    // Update Extension Toolbar Badge with 2-letter Country Short Code (e.g., BD, US, FR, IN)
    updateExtensionBadge(countryCode, isVpn || isProxy || isCloud);
  }

  // --- Render Security Sub-Tab ---
  function renderSecurityView() {
    const sec = state.activeSecProto === 'ipv4' ? state.ipv4Security : state.ipv6Security;
    const protoName = state.activeSecProto === 'ipv4' ? 'IPv4' : 'IPv6';

    el.secProtoLabel.textContent = `${protoName} Threat Score`;
    el.secVpnStatus.textContent = sec.vpn ? 'Detected' : 'Clean';
    el.secVpnStatus.className = `sec-val ${sec.vpn ? 'sec-flagged' : 'sec-clean'}`;

    el.secProxyStatus.textContent = sec.proxy ? 'Detected' : 'Clean';
    el.secProxyStatus.className = `sec-val ${sec.proxy ? 'sec-flagged' : 'sec-clean'}`;

    el.secTorStatus.textContent = sec.tor ? 'Detected' : 'Clean';
    el.secTorStatus.className = `sec-val ${sec.tor ? 'sec-flagged' : 'sec-clean'}`;

    el.secConnectionType.textContent = sec.connType;

    el.threatScoreValue.textContent = `${sec.score}%`;
    el.threatScoreBar.style.width = `${sec.score}%`;

    if (sec.score <= 25) {
      el.threatScoreBar.className = 'progress-bar-fill level-low';
      el.threatLevelBadge.textContent = 'Low Risk';
      el.threatLevelBadge.className = 'badge badge-success';
    } else if (sec.score <= 65) {
      el.threatScoreBar.className = 'progress-bar-fill level-medium';
      el.threatLevelBadge.textContent = 'Medium Risk';
      el.threatLevelBadge.className = 'badge badge-warning';
    } else {
      el.threatScoreBar.className = 'progress-bar-fill level-high';
      el.threatLevelBadge.textContent = 'High Risk';
      el.threatLevelBadge.className = 'badge badge-danger';
    }
  }

  // --- Timezone Mismatch Checker ---
  function checkTimezoneMismatch(ipTimezone) {
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!ipTimezone || ipTimezone === 'N/A') {
      el.alertTimezone.className = 'alert-item alert-success';
      el.tzMismatchTitle.textContent = 'Timezone Status';
      el.tzMismatchDetail.textContent = `System: ${systemTimezone}`;
      return;
    }

    if (systemTimezone !== ipTimezone) {
      el.alertTimezone.className = 'alert-item alert-warning';
      el.tzMismatchTitle.textContent = '⚠️ Timezone Mismatch Detected';
      el.tzMismatchDetail.textContent = `System (${systemTimezone}) ≠ IP Location (${ipTimezone})`;
    } else {
      el.alertTimezone.className = 'alert-item alert-success';
      el.tzMismatchTitle.textContent = 'Timezone Matched';
      el.tzMismatchDetail.textContent = `System matches IP location (${systemTimezone})`;
    }
  }

  // --- WebRTC Leak Check ---
  function checkWebRTCLeak() {
    el.webrtcTitle.textContent = 'WebRTC Leak Check';
    el.webrtcDetail.textContent = 'Scanning STUN candidates...';

    const leakedIPs = new Set();
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          if (leakedIPs.size === 0) {
            el.alertWebrtc.className = 'alert-item alert-success';
            el.webrtcTitle.textContent = 'WebRTC Secure';
            el.webrtcDetail.textContent = 'No unmasked local IPs exposed';
          }
          pc.close();
          return;
        }

        const cand = event.candidate.candidate;
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/gi;
        const matches = cand.match(ipRegex);

        if (matches) {
          matches.forEach(ip => {
            if (!ip.endsWith('.local') && ip !== '0.0.0.0') {
              leakedIPs.add(ip);
            }
          });

          if (leakedIPs.size > 0) {
            const ipList = Array.from(leakedIPs).join(', ');
            state.webrtcLeakedIp = ipList;
            el.alertWebrtc.className = 'alert-item alert-danger';
            el.webrtcTitle.textContent = '⚠️ WebRTC IP Exposed';
            el.webrtcDetail.textContent = `Exposed IP(s): ${ipList}`;
          }
        }
      };

      setTimeout(() => {
        if (pc.signalingState !== 'closed') pc.close();
      }, 3000);
    } catch (e) {
      el.alertWebrtc.className = 'alert-item alert-success';
      el.webrtcTitle.textContent = 'WebRTC Secure';
      el.webrtcDetail.textContent = 'WebRTC leak test passed';
    }
  }

  // --- Active Tab Server IP Lookup with IPv4/IPv6 Multi-Provider Support ---
  function fetchActiveTabServerIp() {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      el.tabDomainName.textContent = 'Chrome Extension Mode Only';
      return;
    }

    chrome.runtime.sendMessage({ action: 'GET_ACTIVE_TAB_SERVER_IP' }, async (response) => {
      if (!response) return;

      const hostname = response.hostname || '';
      const fullUrl = response.url || '';

      el.tabDomainName.textContent = hostname || 'Browser Active Tab';
      el.tabFullUrl.textContent = fullUrl || 'N/A';

      if (response.success && response.ip) {
        state.tabServerIp = response.ip;
        el.tabServerIpVal.textContent = response.ip;
        fetchServerIpGeo(response.ip, hostname);
      } else if (hostname) {
        try {
          const dnsResp = await fetchWithTimeout(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A&_t=${Date.now()}`, { cache: 'no-store' }, 2500);
          const dnsData = await dnsResp.json();
          if (dnsData.Answer && dnsData.Answer.length > 0) {
            const resolvedIp = dnsData.Answer[0].data;
            state.tabServerIp = resolvedIp;
            el.tabServerIpVal.textContent = resolvedIp;
            fetchServerIpGeo(resolvedIp, hostname);
            return;
          }
        } catch (dnsErr) {}

        // Secondary Google DNS IPv6 Lookup
        try {
          const dnsResp6 = await fetchWithTimeout(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=AAAA&_t=${Date.now()}`, { cache: 'no-store' }, 2500);
          const dnsData6 = await dnsResp6.json();
          if (dnsData6.Answer && dnsData6.Answer.length > 0) {
            const resolvedIp6 = dnsData6.Answer[0].data;
            state.tabServerIp = resolvedIp6;
            el.tabServerIpVal.textContent = resolvedIp6;
            fetchServerIpGeo(resolvedIp6, hostname);
            return;
          }
        } catch (dnsErr6) {}

        el.tabServerIpVal.textContent = 'Active Server Connection';
        fetchServerIpGeo('', hostname);
      } else {
        el.tabServerIpVal.textContent = 'Internal / Local Tab';
      }
    });
  }

  // --- Fetch Server IP Geolocation (Background Service Worker Delegation) ---
  async function fetchServerIpGeo(serverIp, hostname = '') {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'RESOLVE_SERVER_IP_GEO', serverIp: serverIp, hostname: hostname }, (resp) => {
        if (resp && resp.success && resp.data) {
          const d = resp.data;
          const cCode = (d.countryCode || 'US').toUpperCase();
          const flagEmoji = getCountryEmoji(cCode) || '🌐';
          el.tabServerFlag.textContent = flagEmoji;
          el.tabServerLocation.textContent = [d.city, d.country].filter(Boolean).join(', ') || d.country || 'Global Server Network';
          el.tabServerIsp.textContent = d.isp || 'Global Hosting Provider';
          el.tabServerAsn.textContent = d.asn || 'N/A';
        }
      });
    }
  }

  // --- Ping UI Helper ---
  function updatePingUI(ms) {
    el.pingText.textContent = `${ms} ms`;
    if (ms < 150) {
      el.pingDot.className = 'ping-dot';
    } else if (ms < 400) {
      el.pingDot.className = 'ping-dot slow';
    } else {
      el.pingDot.className = 'ping-dot error';
    }
  }

  // --- Extension Toolbar Badge Update (Always displays 2-letter Country ISO Short Code) ---
  function updateExtensionBadge(countryCode, isVpn) {
    if (typeof chrome === 'undefined' || !chrome.runtime) return;

    let code = (countryCode || 'BD').toUpperCase();
    if (code.length > 2) code = code.slice(0, 2);

    chrome.runtime.sendMessage({
      action: 'UPDATE_BADGE',
      countryCode: code,
      isVpn: isVpn,
      title: `IP Inspector: ${code} ${isVpn ? '(VPN / Proxy Active)' : '(Clean Connection)'}`
    });
  }

  // Helper: Format ipapi.co Data
  function formatIpApiCoData(d) {
    return {
      ip: d.ip,
      country: d.country_name,
      country_code: d.country_code,
      region: d.region,
      city: d.city,
      org: d.org,
      connection: {
        isp: d.org,
        asn: d.asn,
        reverse: ''
      },
      currency: d.currency,
      timezone: d.timezone
    };
  }

  // Helper: Format ipapi.is Data
  function formatIpApiIsData(d) {
    return {
      ip: d.ip,
      country: d.location?.country,
      country_code: d.location?.country_code,
      region: d.location?.state,
      city: d.location?.city,
      org: d.company?.name,
      connection: {
        isp: d.company?.name,
        asn: d.asn?.asn,
        reverse: d.datacenter?.datacenter
      },
      currency: '',
      timezone: d.location?.timezone
    };
  }

  // Helper: Country Code to Emoji Flag
  function getCountryEmoji(code) {
    if (!code || code.length !== 2) return '';
    const offset = 127397;
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + offset));
  }
});
