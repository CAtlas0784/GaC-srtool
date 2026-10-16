import { AVATAR_METADATA, getAvatarInfo } from './avatars-data.js';
import { LIGHTCONE_METADATA, RELIC_SET_METADATA, getLightconeInfo, getRelicSetInfo } from './equipment-data.js';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, getCurrentLanguage, setLanguage, t, translateElement, translatePath } from './i18n.js';

// Application State
const state = {
  serverMode: localStorage.getItem('gac_srtool_mode') || 'gac', // 'gac' | 'firefly' | 'robin'
  apiUrl: localStorage.getItem('gac_srtool_api_url') || 'http://localhost:21000',
  pingIntervalSec: parseInt(localStorage.getItem('gac_srtool_ping_interval') || '10', 10),
  isConnected: false,
  statusData: null,
  avatarsList: [],
  fullFreesrData: null,
  persistentData: null,
  currentJsonMode: 'freesr',
  activeTab: 'tab-dashboard',
  selectedLineupSlot: null,
  selectedAvatarDetail: null,
  creativeMode: localStorage.getItem('gac_srtool_creative_mode') === 'true'
};

// UI Elements Map
const el = {
  serverModeSelect: document.getElementById('server-mode-select'),
  settingServerMode: document.getElementById('setting-server-mode'),
  lblActiveMode: document.getElementById('lbl-active-mode'),
  langSelect: document.getElementById('lang-select'),
  statusDot: document.getElementById('status-dot'),
  connectionStatusText: document.getElementById('connection-status-text'),
  btnQuickPing: document.getElementById('btn-quick-ping'),
  btnOpenSettings: document.getElementById('btn-open-settings'),
  modalSettings: document.getElementById('modal-settings'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnModalCancel: document.getElementById('btn-modal-cancel'),
  btnModalSave: document.getElementById('btn-modal-save'),
  modalApiUrl: document.getElementById('modal-api-url'),
  
  // Dashboard
  statAvatars: document.getElementById('stat-avatars'),
  statLightcones: document.getElementById('stat-lightcones'),
  statRelics: document.getElementById('stat-relics'),
  lblApiUrl: document.getElementById('lbl-api-url'),
  lblPlaneId: document.getElementById('lbl-plane-id'),
  lblFloorId: document.getElementById('lbl-floor-id'),
  lblCoordinates: document.getElementById('lbl-coordinates'),
  lineupContainer: document.getElementById('lineup-container'),
  toggleCreativeMode: document.getElementById('toggle-creative-mode'),
  badgeCreativeMode: document.getElementById('badge-creative-mode'),
  btnQuickEnergy50: document.getElementById('btn-quick-energy-50'),
  btnQuickEnergy100: document.getElementById('btn-quick-energy-100'),
  btnQuickUnlockAllAvatars: document.getElementById('btn-quick-unlock-all-avatars'),
  btnQuickAddAllLcs: document.getElementById('btn-quick-add-all-lcs'),
  btnQuickTeleportTrain: document.getElementById('btn-quick-teleport-train'),
  btnQuickClearLineup: document.getElementById('btn-quick-clear-lineup'),

  // Avatars
  avatarsGrid: document.getElementById('avatars-grid'),
  avatarSearch: document.getElementById('avatar-search'),
  avatarFilterRarity: document.getElementById('avatar-filter-rarity'),
  avatarFilterElement: document.getElementById('avatar-filter-element'),
  avatarFilterPath: document.getElementById('avatar-filter-path'),
  btnMaxAllAvatars: document.getElementById('btn-max-all-avatars'),
  btnReloadAvatars: document.getElementById('btn-reload-avatars'),

  // Equipment
  lightconesList: document.getElementById('lightcones-list'),
  relicsList: document.getElementById('relics-list'),
  badgeTotalLc: document.getElementById('badge-total-lc'),
  badgeTotalRelics: document.getElementById('badge-total-relics'),
  btnOpenAddLc: document.getElementById('btn-open-add-lc'),
  modalAddLc: document.getElementById('modal-add-lc'),
  btnCloseAddLcModal: document.getElementById('btn-close-add-lc-modal'),
  btnCancelAddLc: document.getElementById('btn-cancel-add-lc'),
  formAddLc: document.getElementById('form-add-lc'),
  addLcSelect: document.getElementById('add-lc-select'),
  addLcLevel: document.getElementById('add-lc-level'),
  addLcPromotion: document.getElementById('add-lc-promotion'),
  addLcRank: document.getElementById('add-lc-rank'),
  addLcAvatar: document.getElementById('add-lc-avatar'),
  btnOpenAddRelic: document.getElementById('btn-open-add-relic'),
  modalAddRelic: document.getElementById('modal-add-relic'),
  btnCloseAddRelicModal: document.getElementById('btn-close-add-relic-modal'),
  btnCancelAddRelic: document.getElementById('btn-cancel-add-relic'),
  formAddRelic: document.getElementById('form-add-relic'),
  addRelicSet: document.getElementById('add-relic-set'),
  addRelicSlot: document.getElementById('add-relic-slot'),
  addRelicLevel: document.getElementById('add-relic-level'),
  addRelicMainAffix: document.getElementById('add-relic-main-affix'),
  addRelicAvatar: document.getElementById('add-relic-avatar'),

  // Persistent Tab
  tabBtnPersistent: document.getElementById('tab-btn-persistent'),
  formPersistentChars: document.getElementById('form-persistent-chars'),
  persistentMcSelect: document.getElementById('persistent-mc-select'),
  persistentMarchSelect: document.getElementById('persistent-march-select'),
  toggleSwGlobal: document.getElementById('toggle-sw-global'),
  toggleCastoriceGlobal: document.getElementById('toggle-castorice-global'),
  toggleAhaGlobal: document.getElementById('toggle-aha-global'),
  btnSavePersistentToggles: document.getElementById('btn-save-persistent-toggles'),

  // Ex-Rank
  tabBtnExrank: document.getElementById('tab-btn-exrank'),
  exrankList: document.getElementById('exrank-list'),
  btnExrankEnableAll: document.getElementById('btn-exrank-enable-all'),
  btnExrankDisableAll: document.getElementById('btn-exrank-disable-all'),

  // JSON Tab
  btnSelectFreesr: document.getElementById('btn-select-freesr'),
  btnSelectPersistent: document.getElementById('btn-select-persistent'),
  btnJsonBeautify: document.getElementById('btn-json-beautify'),
  btnJsonDownload: document.getElementById('btn-json-download'),
  btnJsonSave: document.getElementById('btn-json-save'),
  jsonFileInput: document.getElementById('json-file-input'),
  jsonEditor: document.getElementById('json-editor'),
  jsonStatusInfo: document.getElementById('json-status-info'),

  // Settings
  formSettings: document.getElementById('form-settings'),
  settingApiUrl: document.getElementById('setting-api-url'),
  settingPingInterval: document.getElementById('setting-ping-interval'),
  btnResetSettings: document.getElementById('btn-reset-settings'),

  // Character Detail Modal
  modalAvatarDetail: document.getElementById('modal-avatar-detail'),
  btnCloseAvatarModal: document.getElementById('btn-close-avatar-modal'),
  modalCharTitle: document.getElementById('modal-char-title'),
  modalCharImg: document.getElementById('modal-char-img'),
  modalCharName: document.getElementById('modal-char-name'),
  modalCharMeta: document.getElementById('modal-char-meta'),
  modalCharLevel: document.getElementById('modal-char-level'),
  modalCharPromotion: document.getElementById('modal-char-promotion'),
  modalCharEidolonBtns: document.getElementById('modal-char-eidolon-btns'),
  btnModalQuickE0: document.getElementById('btn-modal-quick-e0'),
  btnModalQuickE6: document.getElementById('btn-modal-quick-e6'),
  btnModalMaxSkills: document.getElementById('btn-modal-max-skills'),
  btnModalSaveAvatar: document.getElementById('btn-modal-save-avatar'),

  // Skills Info Steppers (Inspired by srtools.punklorde.org/skills-info)
  valSkillBasic: document.getElementById('val-skill-basic'),
  rangeSkillBasic: document.getElementById('range-skill-basic'),
  btnStepDecBasic: document.getElementById('btn-step-dec-basic'),
  btnStepIncBasic: document.getElementById('btn-step-inc-basic'),
  btnSkillMaxBasic: document.getElementById('btn-skill-max-basic'),

  valSkillSkill: document.getElementById('val-skill-skill'),
  rangeSkillSkill: document.getElementById('range-skill-skill'),
  btnStepDecSkill: document.getElementById('btn-step-dec-skill'),
  btnStepIncSkill: document.getElementById('btn-step-inc-skill'),
  btnSkillMaxSkill: document.getElementById('btn-skill-max-skill'),

  valSkillUltra: document.getElementById('val-skill-ultra'),
  rangeSkillUltra: document.getElementById('range-skill-ultra'),
  btnStepDecUltra: document.getElementById('btn-step-dec-ultra'),
  btnStepIncUltra: document.getElementById('btn-step-inc-ultra'),
  btnSkillMaxUltra: document.getElementById('btn-skill-max-ultra'),

  valSkillTalent: document.getElementById('val-skill-talent'),
  rangeSkillTalent: document.getElementById('range-skill-talent'),
  btnStepDecTalent: document.getElementById('btn-step-dec-talent'),
  btnStepIncTalent: document.getElementById('btn-step-inc-talent'),
  btnSkillMaxTalent: document.getElementById('btn-skill-max-talent'),

  checkTraceTechnique: document.getElementById('check-trace-technique'),
  checkTraceA2: document.getElementById('check-trace-a2'),
  checkTraceA4: document.getElementById('check-trace-a4'),
  checkTraceA6: document.getElementById('check-trace-a6'),
  checkTraceStats: document.getElementById('check-trace-stats'),

  btnModalEnergy50: document.getElementById('btn-modal-energy-50'),
  btnModalEnergy100: document.getElementById('btn-modal-energy-100'),
  rangeCharEnergy: document.getElementById('range-char-energy'),
  valCharEnergy: document.getElementById('val-char-energy'),

  btnModalE6S5: document.getElementById('btn-modal-e6s5'),
  btnModalE0S1: document.getElementById('btn-modal-e0s1'),

  // Light Cone View in Modal
  modalLcArtWrapper: document.getElementById('modal-lc-art-wrapper'),
  modalLcFullImg: document.getElementById('modal-lc-full-img'),
  modalLcNoArt: document.getElementById('modal-lc-no-art'),
  modalLcNameDisplay: document.getElementById('modal-lc-name-display'),
  modalLcMetaDisplay: document.getElementById('modal-lc-meta-display'),
  modalLcRankBadge: document.getElementById('modal-lc-rank-badge'),
  rangeLcLevel: document.getElementById('range-lc-level'),
  modalLcLvlVal: document.getElementById('modal-lc-lvl-val'),
  modalLcLevel: document.getElementById('modal-lc-level'),
  modalLcRankBtns: document.getElementById('modal-lc-rank-btns'),
  modalLcPassiveDesc: document.getElementById('modal-lc-passive-desc'),
  selectModalChangeLc: document.getElementById('select-modal-change-lc'),
  btnModalApplyChangeLc: document.getElementById('btn-modal-apply-change-lc'),
  modalLcId: document.getElementById('modal-lc-id'),

  // Showcase View in Modal
  showcaseCardContainer: document.getElementById('showcase-card-container'),
  btnShowcaseCopyText: document.getElementById('btn-showcase-copy-text'),
  btnShowcaseExportImg: document.getElementById('btn-showcase-export-img'),
  btnShowcaseAutoRelics: document.getElementById('btn-showcase-auto-relics'),

  // Lineup Picker Modal
  modalLineupPicker: document.getElementById('modal-lineup-picker'),
  btnClosePickerModal: document.getElementById('btn-close-picker-modal'),
  modalPickerTitle: document.getElementById('modal-picker-title'),
  pickerSearch: document.getElementById('picker-search'),
  pickerAvatarsGrid: document.getElementById('picker-avatars-grid'),

  toastContainer: document.getElementById('toast-container')
};

// Toast notification helper
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  toast.innerHTML = `
    <span>${icons[type] || 'ℹ️'}</span>
    <span style="flex: 1; word-break: break-word;">${message}</span>
  `;

  el.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Low-level API caller
async function apiCall(endpoint, method = 'GET', data = null) {
  const cleanBase = state.apiUrl.replace(/\/+$/, '');
  const url = `${cleanBase}${endpoint}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    options.signal = controller.signal;

    const res = await fetch(url, options);
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out');
    }
    throw err;
  }
}

// Update connection status UI
function setConnectionStatus(connected, extraText = '') {
  state.isConnected = connected;
  if (connected) {
    el.statusDot.classList.add('connected');
    el.connectionStatusText.textContent = extraText || t('online');
    el.connectionStatusText.style.color = 'var(--accent-green)';
  } else {
    el.statusDot.classList.remove('connected');
    el.connectionStatusText.textContent = extraText || t('offline');
    el.connectionStatusText.style.color = 'var(--accent-red)';
  }
}

// Helper to get element CSS class
// Canonical element & path maps (handles English and all 13 supported languages)
const CANONICAL_ELEMENTS = {
  physical: 'Physical', fire: 'Fire', ice: 'Ice', lightning: 'Lightning',
  wind: 'Wind', quantum: 'Quantum', imaginary: 'Imaginary', thunder: 'Lightning'
};

const CANONICAL_PATHS = {
  destruction: 'Destruction', hunt: 'Hunt', 'the hunt': 'Hunt', erudition: 'Erudition',
  harmony: 'Harmony', nihility: 'Nihility', preservation: 'Preservation',
  abundance: 'Abundance', remembrance: 'Remembrance', elation: 'Elation'
};

// Dynamically index all translated element and path strings across languages
for (const langKey in TRANSLATIONS) {
  const tr = TRANSLATIONS[langKey];
  if (tr.elements) {
    for (const [enKey, locVal] of Object.entries(tr.elements)) {
      if (locVal) CANONICAL_ELEMENTS[String(locVal).trim().toLowerCase()] = enKey;
    }
  }
  if (tr.paths) {
    for (const [enKey, locVal] of Object.entries(tr.paths)) {
      if (locVal) CANONICAL_PATHS[String(locVal).trim().toLowerCase()] = (enKey === 'The Hunt' ? 'Hunt' : enKey);
    }
  }
}

function normalizeElement(elem) {
  if (!elem) return 'Physical';
  return CANONICAL_ELEMENTS[String(elem).trim().toLowerCase()] || elem;
}

function normalizePath(p) {
  if (!p) return 'Destruction';
  return CANONICAL_PATHS[String(p).trim().toLowerCase()] || (p === 'The Hunt' ? 'Hunt' : p);
}

function getElementClass(elem) {
  const canonical = normalizeElement(elem);
  const map = {
    Fire: 'elem-fire',
    Ice: 'elem-ice',
    Lightning: 'elem-lightning',
    Wind: 'elem-wind',
    Physical: 'elem-physical',
    Quantum: 'elem-quantum',
    Imaginary: 'elem-imaginary'
  };
  return map[canonical] || 'elem-physical';
}

// Render Element Icon HTML (Official Star Rail Game Icon)
function getElementIconHtml(element, size = 20) {
  if (!element) return '';
  const canonical = normalizeElement(element);
  const elemClass = getElementClass(canonical);
  return `<span class="icon-badge element-icon-badge ${elemClass}" title="${element}">
    <img src="assets/elements/${canonical}.png"
         alt="${element}"
         style="width: ${size}px; height: ${size}px;"
         onerror="if(this.src.indexOf('StarRailRes')===-1){this.src='https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/element/${canonical === 'Lightning' ? 'Thunder' : canonical}.png';}">
  </span>`;
}

// Render Path Icon HTML (Official Star Rail Game Icon)
function getPathIconHtml(path, size = 20) {
  if (!path) return '';
  const canonical = normalizePath(path);
  return `<span class="icon-badge path-icon-badge" title="${path}">
    <img src="assets/paths/${canonical}.png"
         alt="${path}"
         style="width: ${size}px; height: ${size}px;"
         onerror="if(this.src.indexOf('StarRailRes')===-1){this.src='https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/path/${canonical}.png';}">
  </span>`;
}

// Update filter dropdown options to current language
function updateFilterDropdownTranslations() {
  if (el.avatarFilterElement) {
    const selected = el.avatarFilterElement.value;
    const elements = ['Fire', 'Ice', 'Lightning', 'Wind', 'Physical', 'Quantum', 'Imaginary'];
    if (el.avatarFilterElement.options[0]) {
      el.avatarFilterElement.options[0].textContent = t('filterAllElements') || 'ทุกธาตุ';
    }
    elements.forEach((elemKey, idx) => {
      if (el.avatarFilterElement.options[idx + 1]) {
        el.avatarFilterElement.options[idx + 1].textContent = translateElement(elemKey);
      }
    });
    el.avatarFilterElement.value = selected;
  }

  if (el.avatarFilterPath) {
    const selected = el.avatarFilterPath.value;
    const paths = ['Destruction', 'Hunt', 'Erudition', 'Harmony', 'Nihility', 'Preservation', 'Abundance', 'Remembrance', 'Elation'];
    if (el.avatarFilterPath.options[0]) {
      el.avatarFilterPath.options[0].textContent = t('filterAllPaths') || 'ทุกประเภท';
    }
    paths.forEach((pathKey, idx) => {
      if (el.avatarFilterPath.options[idx + 1]) {
        el.avatarFilterPath.options[idx + 1].textContent = translatePath(pathKey);
      }
    });
    el.avatarFilterPath.value = selected;
  }

  const dict = TRANSLATIONS[getCurrentLanguage()] || TRANSLATIONS.en || TRANSLATIONS.th;
  if (el.persistentMcSelect && dict.tbOptions) {
    const curVal = el.persistentMcSelect.value;
    Array.from(el.persistentMcSelect.options).forEach(opt => {
      if (dict.tbOptions[opt.value]) {
        opt.textContent = dict.tbOptions[opt.value];
      }
    });
    el.persistentMcSelect.value = curVal;
  }

  if (el.persistentMarchSelect && dict.marchOptions) {
    const curVal = el.persistentMarchSelect.value;
    Array.from(el.persistentMarchSelect.options).forEach(opt => {
      if (dict.marchOptions[opt.value]) {
        opt.textContent = dict.marchOptions[opt.value];
      }
    });
    el.persistentMarchSelect.value = curVal;
  }
}

// Apply multi-language translations across UI
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    const val = t(key);
    if (val) elem.textContent = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) elem.placeholder = val;
  });

  // Update dynamic filter dropdown options
  updateFilterDropdownTranslations();

  // Update connection status text with new language
  setConnectionStatus(state.isConnected);

  renderLineup(state.statusData?.lineups);
  if (state.statusData?.ex_ranks) {
    renderExRanks(state.statusData.ex_ranks);
  }
  if (state.avatarsList.length > 0) {
    renderAvatarsGrid();
  }
  loadEquipment();
}

// Setup Language Selector
function setupLanguageSelector() {
  el.langSelect.innerHTML = '';
  SUPPORTED_LANGUAGES.forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = `${lang.flag} ${lang.name}`;
    if (lang.code === getCurrentLanguage()) {
      opt.selected = true;
    }
    el.langSelect.appendChild(opt);
  });

  el.langSelect.addEventListener('change', (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    applyTranslations();
    showToast(`Language: ${SUPPORTED_LANGUAGES.find(l => l.code === newLang)?.name || newLang}`, 'info');
  });
}

// Server Mode Setup
function setupServerModes() {
  const updateModeDisplay = (mode) => {
    state.serverMode = mode;
    localStorage.setItem('gac_srtool_mode', mode);
    if (el.serverModeSelect) el.serverModeSelect.value = mode;
    if (el.settingServerMode) el.settingServerMode.value = mode;

    if (mode === 'gac') {
      if (el.lblActiveMode) el.lblActiveMode.textContent = 'GaC-hkrpg-go';
      if (el.tabBtnPersistent) el.tabBtnPersistent.style.display = '';
      if (el.tabBtnExrank) el.tabBtnExrank.style.display = '';
      if (el.btnQuickSyncPersistent) el.btnQuickSyncPersistent.style.display = '';
      if (el.btnSelectPersistent) el.btnSelectPersistent.style.display = '';
    } else {
      if (el.lblActiveMode) el.lblActiveMode.textContent = mode === 'firefly' ? 'FireflyGo' : 'RobinSR';
      if (el.tabBtnPersistent) el.tabBtnPersistent.style.display = 'none';
      if (el.tabBtnExrank) el.tabBtnExrank.style.display = 'none';
      if (el.btnQuickSyncPersistent) el.btnQuickSyncPersistent.style.display = 'none';
      if (el.btnSelectPersistent) el.btnSelectPersistent.style.display = 'none';

      // If user is currently viewing a hidden tab, auto switch back to dashboard
      if (state.activeTab === 'tab-persistent' || state.activeTab === 'tab-exrank') {
        const dashboardBtn = document.querySelector('.tab-btn[data-tab="tab-dashboard"]');
        if (dashboardBtn) dashboardBtn.click();
      }

      // If user is viewing persistent JSON, switch back to freesr
      if (state.currentJsonMode === 'persistent') {
        loadJsonData('freesr');
      }
    }
  };

  if (el.serverModeSelect) {
    el.serverModeSelect.addEventListener('change', (e) => {
      updateModeDisplay(e.target.value);
      showToast(t('toastServerSwitched', { mode: el.lblActiveMode ? el.lblActiveMode.textContent : e.target.value }), 'info');
      refreshStatus();
    });
  }

  if (el.settingServerMode) {
    el.settingServerMode.addEventListener('change', (e) => {
      updateModeDisplay(e.target.value);
      showToast(t('toastServerSwitched', { mode: el.lblActiveMode ? el.lblActiveMode.textContent : e.target.value }), 'info');
      refreshStatus();
    });
  }

  updateModeDisplay(state.serverMode);
}

// Initialize Avatars Database: Populates all known avatars from metadata
function initAvatarsList() {
  if (state.avatarsList.length > 0) return;
  const list = [];
  for (const aidStr in AVATAR_METADATA) {
    const aid = parseInt(aidStr, 10);
    list.push({
      avatar_id: aid,
      level: 80,
      promotion: 6,
      rank: 6
    });
  }
  list.sort((a, b) => b.avatar_id - a.avatar_id);
  state.avatarsList = list;
}

// Default lineup matching our persistent server data
const DEFAULT_LINEUP = { 0: 1511, 1: 1506, 2: 1502, 3: 1503 };

// Refresh status from server
async function refreshStatus() {
  try {
    let data;
    if (state.serverMode === 'gac') {
      data = await apiCall('/api/status');
    } else {
      const freesr = await apiCall('/api/freesr').catch(() => null);
      if (freesr && freesr.data) {
        data = {
          status: 200,
          avatar_count: Object.keys(freesr.data.avatars || {}).length,
          lightcone_count: (freesr.data.lightcones || []).length,
          relic_count: (freesr.data.relics || []).length,
          lineups: freesr.data.lineups || freesr.data.battle_config?.custom_battle_lineup || DEFAULT_LINEUP,
          scene: freesr.data.scene,
          position: freesr.data.position,
          ex_ranks: []
        };
      } else {
        throw new Error('Server not reachable');
      }
    }

    state.statusData = data;
    setConnectionStatus(true);

    el.lblApiUrl.textContent = state.apiUrl;
    el.statAvatars.textContent = data.avatar_count ?? state.avatarsList.length;
    el.statLightcones.textContent = data.lightcone_count ?? 0;
    el.statRelics.textContent = data.relic_count ?? 0;

    if (data.scene) {
      el.lblPlaneId.textContent = data.scene.plane_id || '-';
      el.lblFloorId.textContent = data.scene.floor_id || '-';
    }

    if (data.position) {
      const { x = 0, y = 0, z = 0 } = data.position;
      el.lblCoordinates.textContent = `X: ${x}, Y: ${y}, Z: ${z}`;
    }

    renderLineup(data.lineups || DEFAULT_LINEUP);
    renderExRanks(data.ex_ranks || []);
    loadAvatars();
  } catch (err) {
    setConnectionStatus(false, t('offline'));
    el.lblApiUrl.textContent = state.apiUrl;
    el.statAvatars.textContent = state.avatarsList.length;
    // Keep rendering with current or default lineup so UI is always functional
    renderLineup(state.statusData?.lineups || DEFAULT_LINEUP);
    loadAvatars();
  }
}

// Render party lineup cards
function renderLineup(lineups) {
  if (el.toggleCreativeMode) {
    el.toggleCreativeMode.checked = state.creativeMode;
  }
  if (el.badgeCreativeMode) {
    el.badgeCreativeMode.style.display = state.creativeMode ? 'inline-flex' : 'none';
  }

  el.lineupContainer.innerHTML = '';
  let currentLineup = lineups || state.statusData?.lineups || DEFAULT_LINEUP;

  // Handle array format if provided
  if (Array.isArray(currentLineup)) {
    const mapped = {};
    currentLineup.forEach((id, idx) => { mapped[idx] = id; });
    currentLineup = mapped;
  }

  // Determine slots to render
  let slotKeys = [];
  if (state.creativeMode) {
    slotKeys = Object.keys(currentLineup).map(k => parseInt(k, 10)).sort((a, b) => a - b);
    if (slotKeys.length === 0) slotKeys = [0];
  } else {
    slotKeys = [0, 1, 2, 3];
  }

  slotKeys.forEach(slot => {
    const avatarId = currentLineup[slot] || currentLineup[String(slot)] || 0;
    const slotCard = document.createElement('div');
    slotCard.className = `lineup-slot-card ${avatarId ? 'filled' : ''}`;
    slotCard.title = t('slotTooltip');

    const removeSlotBtnHtml = state.creativeMode ? `
      <button type="button" class="btn-lineup-remove-slot" title="${t('deleteItem') || 'ลบ'}" data-slot="${slot}">✕</button>
    ` : '';

    if (avatarId === 0) {
      slotCard.innerHTML = `
        <div class="lineup-slot-num">Slot ${slot + 1}</div>
        ${removeSlotBtnHtml}
        <div style="font-size: 2.2rem; color: var(--text-muted); opacity: 0.5;">➕</div>
        <div style="font-weight: 700; color: var(--text-muted); margin-top: 0.5rem;">${t('slotEmpty')}</div>
      `;
    } else {
      const info = getAvatarInfo(avatarId);
      slotCard.innerHTML = `
        <div class="lineup-slot-num">Slot ${slot + 1}</div>
        ${removeSlotBtnHtml}
        <img class="lineup-slot-img"
             src="./assets/avatars/${avatarId}.png"
             onerror="if(this.src.indexOf('jsdelivr')===-1){this.src='https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${avatarId}.png';}else{this.style.display='none';}"
             alt="${info.name}">
        <div style="font-weight: 800; font-size: 1rem; color: var(--text-highlight); margin-top: 0.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${info.name}</div>
        <div style="display: flex; gap: 0.4rem; margin-top: 0.4rem; justify-content: center; align-items: center;">
          ${getElementIconHtml(info.element, 20)}
          ${getPathIconHtml(info.path, 20)}
        </div>
      `;
    }

    slotCard.addEventListener('click', (e) => {
      if (e.target.closest('.btn-lineup-remove-slot')) {
        e.stopPropagation();
        removeLineupSlot(slot);
        return;
      }
      openLineupPicker(slot);
    });

    el.lineupContainer.appendChild(slotCard);
  });

  // In Creative Mode: render "+ เพิ่ม Slot" button card
  if (state.creativeMode) {
    const addSlotCard = document.createElement('div');
    addSlotCard.className = 'lineup-slot-card lineup-add-slot-card';
    addSlotCard.title = t('btnAddSlot') || '+ เพิ่ม Slot';
    addSlotCard.innerHTML = `
      <div style="font-size: 2.2rem; color: var(--accent-green); line-height: 1;">➕</div>
      <div style="font-weight: 700; color: var(--accent-green); margin-top: 0.5rem;">${t('btnAddSlot') || '+ เพิ่ม Slot'}</div>
    `;
    addSlotCard.addEventListener('click', () => {
      addLineupSlot();
    });
    el.lineupContainer.appendChild(addSlotCard);
  }
}

// Add extra slot in Creative Mode
async function addLineupSlot() {
  state.statusData = state.statusData || {};
  let currentLineup = { ...(state.statusData.lineups || DEFAULT_LINEUP) };
  if (Array.isArray(currentLineup)) {
    const mapped = {};
    currentLineup.forEach((id, idx) => { mapped[idx] = id; });
    currentLineup = mapped;
  }
  const keys = Object.keys(currentLineup).map(k => parseInt(k, 10)).sort((a, b) => a - b);
  const nextSlot = keys.length > 0 ? Math.max(...keys) + 1 : 0;
  currentLineup[nextSlot] = 0;
  state.statusData.lineups = currentLineup;

  if (state.fullFreesrData) {
    state.fullFreesrData.lineups = currentLineup;
    if (state.fullFreesrData.battle_config) {
      state.fullFreesrData.battle_config.custom_battle_lineup = currentLineup;
    }
  }

  if (state.isConnected) {
    if (state.serverMode === 'gac') {
      await apiCall('/api/persistent', 'POST', { lineups: currentLineup }).catch(() => {});
    } else {
      await saveFreesrChangesToServer().catch(() => {});
    }
  }

  renderLineup(currentLineup);
  openLineupPicker(nextSlot);
}

// Remove slot in Creative Mode
async function removeLineupSlot(slotIndex) {
  state.statusData = state.statusData || {};
  let currentLineup = { ...(state.statusData.lineups || DEFAULT_LINEUP) };
  if (Array.isArray(currentLineup)) {
    const mapped = {};
    currentLineup.forEach((id, idx) => { mapped[idx] = id; });
    currentLineup = mapped;
  }

  const keys = Object.keys(currentLineup).map(k => parseInt(k, 10)).sort((a, b) => a - b);
  const newLineup = {};
  let newIdx = 0;
  for (const k of keys) {
    if (k !== slotIndex) {
      newLineup[newIdx] = currentLineup[k];
      newIdx++;
    }
  }

  if (Object.keys(newLineup).length === 0) {
    newLineup[0] = 0;
  }

  state.statusData.lineups = newLineup;

  if (state.fullFreesrData) {
    state.fullFreesrData.lineups = newLineup;
    if (state.fullFreesrData.battle_config) {
      state.fullFreesrData.battle_config.custom_battle_lineup = newLineup;
    }
  }

  if (state.isConnected) {
    if (state.serverMode === 'gac') {
      await apiCall('/api/persistent', 'POST', { lineups: newLineup }).catch(() => {});
    } else {
      await saveFreesrChangesToServer().catch(() => {});
    }
  }

  renderLineup(newLineup);
  const toastMsg = t('toastSlotRemoved', { slot: slotIndex + 1 }) || `ลบ Slot ${slotIndex + 1} เรียบร้อยแล้ว`;
  showToast(toastMsg, 'info');
}

// Lineup Picker Modal
function openLineupPicker(slotIndex) {
  state.selectedLineupSlot = slotIndex;
  el.modalPickerTitle.textContent = `${t('pickerTitle')} - Slot ${slotIndex + 1}`;
  el.pickerSearch.value = '';
  renderPickerGrid();
  el.modalLineupPicker.classList.add('active');
}

function renderPickerGrid() {
  const search = el.pickerSearch.value.trim().toLowerCase();
  el.pickerAvatarsGrid.innerHTML = '';

  // Option to remove character from slot
  const removeCard = document.createElement('div');
  removeCard.className = 'picker-remove-card';
  removeCard.innerHTML = `
    <span style="font-size: 1.15rem; line-height: 1;">❌</span>
    <span>${t('removeFromTeam')}</span>
  `;
  removeCard.addEventListener('click', async () => {
    await assignAvatarToLineup(state.selectedLineupSlot, 0);
    el.modalLineupPicker.classList.remove('active');
  });
  el.pickerAvatarsGrid.appendChild(removeCard);

  // Available avatars (sorted descending by avatar_id)
  const sortedAvatars = [...state.avatarsList].sort((a, b) => b.avatar_id - a.avatar_id);
  sortedAvatars.forEach(item => {
    const meta = getAvatarInfo(item.avatar_id);
    if (search && !meta.name.toLowerCase().includes(search) && !String(item.avatar_id).includes(search)) {
      return;
    }

    const card = document.createElement('div');
    card.className = `picker-card-item card-rarity-${meta.rarity}`;

    card.innerHTML = `
      <div class="picker-avatar-img-wrap">
        <img class="picker-avatar-img"
             src="./assets/avatars/${item.avatar_id}.png"
             onerror="if(this.src.indexOf('jsdelivr')===-1){this.src='https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${item.avatar_id}.png';}else{this.style.display='none';}"
             alt="${meta.name}">
      </div>
      <div class="picker-avatar-info">
        <div class="picker-avatar-name" title="${meta.name}">${meta.name}</div>
        <div class="picker-avatar-subinfo">
          ${getElementIconHtml(meta.element, 18)}
          ${getPathIconHtml(meta.path, 18)}
          <span style="font-weight: 600; margin-left: 0.2rem;">Lv. ${item.level} • E${item.rank}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', async () => {
      await assignAvatarToLineup(state.selectedLineupSlot, item.avatar_id);
      el.modalLineupPicker.classList.remove('active');
    });

    el.pickerAvatarsGrid.appendChild(card);
  });
}

// Assign avatar to lineup slot
async function assignAvatarToLineup(slot, avatarId) {
  try {
    state.statusData = state.statusData || {};
    const lineups = { ...(state.statusData.lineups || DEFAULT_LINEUP) };

    // In Normal Mode: Prevent duplicates by clearing other slots that had this avatar
    if (!state.creativeMode && avatarId !== 0) {
      for (const s in lineups) {
        if (parseInt(s, 10) !== slot && lineups[s] === avatarId) {
          lineups[s] = 0;
        }
      }
    }

    lineups[slot] = avatarId;
    state.statusData.lineups = lineups;

    if (state.fullFreesrData) {
      state.fullFreesrData.lineups = lineups;
      if (state.fullFreesrData.battle_config) {
        state.fullFreesrData.battle_config.custom_battle_lineup = lineups;
      }
    }

    if (state.isConnected) {
      if (state.serverMode === 'gac') {
        await apiCall('/api/persistent', 'POST', { lineups });
      } else {
        await saveFreesrChangesToServer();
      }
    }

    renderLineup(lineups);
    const name = avatarId ? getAvatarInfo(avatarId).name : t('slotEmpty');
    showToast(t('toastSlotUpdated', { slot: slot + 1, name }), 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Load and Render Avatars
async function loadAvatars() {
  initAvatarsList();
  if (state.isConnected) {
    try {
      const res = await apiCall('/api/freesr/avatars');
      if (res && res.avatars && res.avatars.length > 0) {
        res.avatars.forEach(serverAv => {
          const found = state.avatarsList.find(a => a.avatar_id === serverAv.avatar_id);
          if (found) {
            found.level = serverAv.level;
            found.promotion = serverAv.promotion;
            found.rank = serverAv.rank;
          }
        });
      }
    } catch (err) {
      console.warn('Live avatar list fetch failed, using local list:', err);
    }
  }
  state.avatarsList.sort((a, b) => b.avatar_id - a.avatar_id);
  renderAvatarsGrid();
}

function renderAvatarsGrid() {
  const searchTerm = el.avatarSearch.value.trim().toLowerCase();
  const rarityFilter = el.avatarFilterRarity.value;
  const elementFilter = el.avatarFilterElement.value;
  const pathFilter = el.avatarFilterPath ? el.avatarFilterPath.value : 'all';

  const filtered = state.avatarsList.filter(item => {
    const meta = getAvatarInfo(item.avatar_id);
    const matchesSearch = meta.name.toLowerCase().includes(searchTerm) || String(item.avatar_id).includes(searchTerm);
    const matchesRarity = rarityFilter === 'all' || String(meta.rarity) === rarityFilter;
    const elemCanonical = normalizeElement(meta.rawElement || meta.element);
    const matchesElement = elementFilter === 'all' || elemCanonical === normalizeElement(elementFilter);
    const pathCanonical = normalizePath(meta.rawPath || meta.path);
    const matchesPath = pathFilter === 'all' || pathCanonical === normalizePath(pathFilter);
    return matchesSearch && matchesRarity && matchesElement && matchesPath;
  });

  filtered.sort((a, b) => b.avatar_id - a.avatar_id);

  if (filtered.length === 0) {
    el.avatarsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">${t('noAvatarsFound')}</div>`;
    return;
  }

  el.avatarsGrid.innerHTML = '';
  filtered.forEach(item => {
    const meta = getAvatarInfo(item.avatar_id);
    const card = document.createElement('div');
    card.className = `card avatar-card card-rarity-${meta.rarity}`;

    card.innerHTML = `
      <span class="avatar-badge-rarity rarity-${meta.rarity}">★ ${meta.rarity}</span>
      <div class="avatar-header-info">
        <div class="avatar-image-container">
          <img class="avatar-img"
               src="./assets/avatars/${item.avatar_id}.png"
               onerror="if(this.src.indexOf('jsdelivr')===-1){this.src='https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${item.avatar_id}.png';}else{this.style.display='none';this.nextElementSibling.style.display='flex';}"
               alt="${meta.name}">
          <div class="avatar-icon-placeholder" style="display: none;">${meta.name.charAt(0)}</div>
        </div>
        <div class="avatar-meta-details">
          <div class="avatar-name" title="${meta.name}">${meta.name}</div>
          <div class="avatar-subinfo">
            ${getElementIconHtml(meta.element, 20)}
            ${getPathIconHtml(meta.path, 20)}
          </div>
        </div>
      </div>

      <div class="avatar-card-footer">
        <div class="avatar-status-pill">
          <span class="avatar-lvl">Lv. ${item.level}</span>
          <span class="avatar-eidolon ${item.rank === 6 ? 'e6' : ''}">E${item.rank}</span>
        </div>
        <div style="display: flex; gap: 0.35rem;">
          <button type="button" class="btn btn-sm btn-secondary btn-card-showcase" title="ดูการ์ดแสดงผล Build">🖼️</button>
          <button type="button" class="btn btn-sm btn-gold btn-card-quick-max" title="ปรับ Max E6 ทันที">⭐ MAX</button>
        </div>
      </div>
    `;

    // Quick Showcase Card Button
    const btnShowcase = card.querySelector('.btn-card-showcase');
    btnShowcase?.addEventListener('click', (e) => {
      e.stopPropagation();
      openAvatarDetailModal(item);
      const showcaseTabBtn = document.querySelector('.modal-subtab-btn[data-modaltab="modaltab-showcase"]');
      if (showcaseTabBtn) showcaseTabBtn.click();
    });

    // Quick Max Button
    const btnQuickMax = card.querySelector('.btn-card-quick-max');
    btnQuickMax.addEventListener('click', async (e) => {
      e.stopPropagation();
      await maxSingleAvatar(item.avatar_id);
    });

    // Clicking card opens full character build modal
    card.addEventListener('click', () => {
      openAvatarDetailModal(item);
    });

    el.avatarsGrid.appendChild(card);
  });
}

// Quick Max Single Avatar (Lv 80 + Prom 6 + E6 + Max Traces)
async function maxSingleAvatar(avatarId) {
  const target = state.avatarsList.find(a => a.avatar_id === avatarId);
  if (target) {
    target.level = 80;
    target.promotion = 6;
    target.rank = 6;
  }
  if (state.fullFreesrData?.avatars?.[avatarId]) {
    const av = state.fullFreesrData.avatars[avatarId];
    av.level = 80;
    av.promotion = 6;
    av.data.rank = 6;
    if (av.data.skills) {
      for (const k in av.data.skills) av.data.skills[k] = 10;
    }
  }

  renderAvatarsGrid();

  if (state.isConnected) {
    try {
      if (state.serverMode === 'gac') {
        await apiCall('/api/avatar/rank', 'POST', { avatar_id: avatarId, rank: 6 });
        await apiCall('/api/freesr/avatars', 'POST', { avatar_id: avatarId, level: 80, promotion: 6, rank: 6 });
      } else {
        await saveFreesrChangesToServer();
      }
      showToast(t('toastCharMaxed', { name: getAvatarInfo(avatarId).name }), 'success');
    } catch (err) {
      showToast(t('toastCharMaxed', { name: getAvatarInfo(avatarId).name }), 'info');
    }
  } else {
    showToast(t('toastCharMaxed', { name: getAvatarInfo(avatarId).name }), 'info');
  }
}

// Active Lightcone Superimposition Rank in Modal (1 - 5)
let selectedLcRank = 5;

// Modal Sub-tabs Handler
// Signature Light Cones dictionary for all characters
const SIGNATURE_LIGHTCONES = {
  1001: 21001, // March 7th -> Day One of My New Life
  1002: 21000, // Dan Heng -> Only Silence Remains
  1003: 23000, // Himeko -> Night on the Milky Way
  1004: 23004, // Welt -> In the Name of the World
  1005: 23006, // Kafka -> Patience Is All You Need
  1006: 23007, // Silver Wolf -> Incessant Rain
  1008: 21007, // Arlan -> A Secret Vow
  1009: 21008, // Asta -> Planetary Rendezvous
  1013: 21006, // Herta -> The Birth of the Self
  1101: 23003, // Bronya -> But the Battle Isn't Over
  1102: 23001, // Seele -> In the Night
  1103: 21009, // Serval -> Make the World Clamor
  1104: 23005, // Gepard -> Moment of Victory
  1105: 21010, // Natasha -> Post-Op Conversation
  1106: 21003, // Pela -> Good Night and Sleep Well
  1107: 23002, // Clara -> Something Irreplaceable
  1108: 21011, // Sampo -> Eyes of the Prey
  1109: 21012, // Hook -> The Moles Welcome You
  1110: 21013, // Lynx -> Warmth Shortens Cold Nights
  1111: 21014, // Luka -> Resolution Shines As Pearls of Sweat
  1112: 23012, // Topaz -> Worrisome, Blissful
  1201: 21015, // Qingque -> Today Is Another Peaceful Day
  1202: 21016, // Tingyun -> Memories of the Past
  1203: 23008, // Luocha -> Echoes of the Coffin
  1204: 23010, // Jing Yuan -> Before Dawn
  1205: 23009, // Blade -> The Unreachable Side
  1206: 21017, // Sushang -> Swordplay
  1207: 21018, // Yukong -> Past and Future
  1208: 23011, // Fu Xuan -> She Already Shut Her Eyes
  1209: 23013, // Yanqing -> Sleep Like the Dead
  1210: 21019, // Guinaifen -> Fermata
  1211: 23016, // Bailu -> Time Waits for No One
  1212: 23014, // Jingliu -> I Shall Be My Own Sword
  1213: 23015, // Dan Heng IL -> Brighter Than the Sun
  1214: 21020, // Xueyi -> Under the Blue Sky
  1215: 21021, // Hanya -> Dance! Dance! Dance!
  1217: 23017, // Huohuo -> Night of Fright
  1218: 23027, // Jiaoqiu -> Those Many Springs
  1220: 23030, // Feixiao -> I Venture Forth to Hunt
  1221: 23028, // Yunli -> Dance at Sunset
  1222: 23031, // Lingsha -> Scent Alone Stays True
  1223: 21038, // Moze -> Shadowed by Night
  1224: 23033, // Fugue -> Long Road Leads Home
  1301: 21022, // Gallagher -> What Is Real?
  1302: 23018, // Argenti -> An Instant Before A Gaze
  1303: 23019, // Ruan Mei -> Past Self in Mirror
  1304: 23022, // Aventurine -> Inherently Unjust Destiny
  1305: 23020, // Dr. Ratio -> Baptism of Pure Thought
  1306: 23021, // Sparkle -> Earthly Escort
  1307: 23023, // Black Swan -> Reforged Remembrance
  1308: 23024, // Acheron -> Along the Passing Shore
  1309: 23026, // Robin -> Flowing Nightglow
  1310: 23025, // Firefly -> Whereabouts Should Dreams Rest
  1312: 21035, // Misha -> Indelible Promise
  1313: 23032, // Sunday -> A Grounded Ascent
  1314: 23029, // Jade -> Yet Hope Is Priceless
  1315: 23028, // Boothill -> Sailing Towards A Second Life
  1317: 23030, // Rappa -> Ninjutsu Inscription: Dazzling Evilbreaker
  1401: 23034, // The Herta -> Into the Unreachable Veil
  1402: 23035, // Aglaea -> Time Woven into Gold
  1403: 23036, // Castorice -> Make Farewells More Beautiful
  1404: 23037, // Anaxa -> If Time Were a Flower
  1405: 23038, // Tribbie
  1406: 23039, // Mydei
  8001: 24001, // Trailblazer Male Destruction -> On the Fall of an Aeon
  8002: 24001, // Trailblazer Female Destruction
  8003: 24002, // Trailblazer Male Preservation -> Texture of Memories
  8004: 24002, // Trailblazer Female Preservation
  8005: 21008, // Trailblazer Male Harmony -> Memories of the Past
  8006: 21008, // Trailblazer Female Harmony
  8007: 21040, // Trailblazer Remembrance
  8008: 21040
};

// Recommended Relic Builds by Path
const RECOMMENDED_RELIC_BUILDS = {
  Preservation: { cavern: 103, planar: 304, name: "Knight of Purity (4) + Belobog (2)" },
  Abundance: { cavern: 101, planar: 302, name: "Passerby (4) + Fleet (2)" },
  Harmony: { cavern: 114, planar: 310, name: "Messenger (4) + Broken Keel (2)" },
  Nihility: { cavern: 116, planar: 311, name: "Prisoner (4) + Glamoth (2)" },
  Hunt: { cavern: 120, planar: 309, name: "Valorous (4) + Rutilant Arena (2)" },
  Destruction: { cavern: 119, planar: 315, name: "Iron Cavalry (4) + Kalpagni (2)" },
  Erudition: { cavern: 115, planar: 306, name: "Grand Duke (4) + Inert Salsotto (2)" },
  Remembrance: { cavern: 114, planar: 310, name: "Messenger (4) + Broken Keel (2)" }
};

// Active Lightcone Superimposition Rank in Modal (1 - 5)
let selectedLcRank = 5;

// Modal Sub-tabs Handler
function setupModalSubtabs() {
  const tabBtns = document.querySelectorAll('.modal-subtab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.modal-subtab-content').forEach(c => {
        c.style.display = 'none';
        c.classList.remove('active');
      });
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-modaltab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.style.display = 'block';
        targetContent.classList.add('active');
        if (targetId === 'modaltab-showcase' && state.selectedAvatarDetail) {
          renderShowcaseCard(state.selectedAvatarDetail.avatar_id);
        }
      }
    });
  });
}

function updateLcRankPips(rank) {
  selectedLcRank = rank;
  document.querySelectorAll('.lc-super-pip').forEach(btn => {
    const r = parseInt(btn.getAttribute('data-rank'), 10);
    if (r === rank) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Lightcone Passive Skill Descriptions with dynamic rank values
function getLightconePassiveDesc(lcId, rank = 5) {
  const id = parseInt(lcId, 10);
  const r = Math.max(1, Math.min(5, rank));

  const passives = {
    21001: `ทำให้ DEF ของผู้สวมใส่เพิ่มขึ้น <strong>${16 + (r - 1) * 2}%</strong> หลังจากเข้าสู่การต่อสู้ จะทำให้ความต้านทานทุกประเภทของตัวละครฝ่ายเราทั้งหมดเพิ่มขึ้น <strong>${8 + (r - 1)}%</strong> โดยสกิลชนิดเดียวกันจะไม่สามารถซ้อนทับได้`,
    23024: `ทำให้ CRIT DMG ของผู้สวมใส่เพิ่มขึ้น <strong>${36 + (r - 1) * 6}%</strong> เมื่อโจมตีโดนเป้าหมาย จะติดสถานะ Mirage Fizzle ทำให้ได้รับความเสียหายเพิ่มขึ้น <strong>${24 + (r - 1) * 4}%</strong> และความเสียหายท่าไม้ตายเพิ่มขึ้น <strong>${24 + (r - 1) * 4}%</strong>`,
    23025: `ทำให้ Break Effect ของผู้สวมใส่เพิ่มขึ้น <strong>${60 + (r - 1) * 10}%</strong> เมื่อสร้าง Break DMG จะทำให้เป้าหมายติดสถานะ Routed ได้รับ Break DMG เพิ่มขึ้น <strong>${24 + (r - 1) * 4}%</strong> และลด SPD ลง 20%`,
    23001: `ทำให้ CRIT Rate ของผู้สวมใส่เพิ่มขึ้น <strong>${18 + (r - 1) * 3}%</strong> ระหว่างการต่อสู้ ทุกๆ 10 หน่วยของ SPD ที่เกิน 100 จะเพิ่ม DMG การโจมตีปกติและสกิล <strong>${6 + (r - 1)}%</strong> และเพิ่ม CRIT DMG ท่าไม้ตาย <strong>${12 + (r - 1) * 2}%</strong>`,
    23010: `ทำให้ CRIT DMG ของผู้สวมใส่เพิ่มขึ้น <strong>${36 + (r - 1) * 6}%</strong> เพิ่ม DMG สกิลและท่าไม้ตาย <strong>${18 + (r - 1) * 3}%</strong> และเสริม Somnus Corpus เพิ่ม DMG โจมตีต่อเนื่อง <strong>${48 + (r - 1) * 8}%</strong>`,
    23019: `ทำให้ Break Effect ของผู้สวมใส่เพิ่มขึ้น <strong>${60 + (r - 1) * 10}%</strong> หลังจากผู้สวมใส่ปล่อยท่าไม้ตาย ทีมสร้าง DMG เพิ่มขึ้น <strong>${24 + (r - 1) * 4}%</strong> 3 เทิร์น และฟื้นฟูแต้มสกิล 1 แต้ม`,
    23022: `ทำให้ DEF ของผู้สวมใส่เพิ่มขึ้น <strong>${40 + (r - 1) * 5}%</strong> เมื่อมอบโล่ให้เพื่อนร่วมทีม จะเพิ่ม CRIT DMG <strong>${40 + (r - 1) * 5}%</strong> 2 เทิร์น และทำให้ศัตรูได้รับ DMG เพิ่มขึ้น <strong>${10 + (r - 1) * 2}%</strong>`,
    23026: `เมื่อเพื่อนร่วมทีมโจมตี ผู้สวมใส่จะได้รับ Cantillation 1 ชั้น แต่ละชั้นเพิ่ม Energy Regeneration Rate <strong>${3 + (r - 1) * 0.5}%</strong> สูงสุด 5 ชั้น และเพิ่ม ATK ของทั้งทีม <strong>${48 + (r - 1) * 8}%</strong>`,
    23006: `ทำให้ DMG ของผู้สวมใส่เพิ่มขึ้น <strong>${24 + (r - 1) * 4}%</strong> หลังการโจมตีแต่ละครั้ง SPD เพิ่มขึ้น <strong>${4.8 + (r - 1) * 0.8}%</strong> สูงสุด 3 ชั้น และทำให้เป้าหมายติดสถานะ Erode เกิด DoT สายฟ้า <strong>${60 + (r - 1) * 10}%</strong>`,
    23030: `ทำให้ CRIT Rate ของผู้สวมใส่เพิ่มขึ้น <strong>${15 + (r - 1) * 2.5}%</strong> เมื่อโจมตีต่อเนื่อง ได้รับ Luminflux ซ้อนทับ 2 ชั้น แต่ละชั้นทำให้ท่าไม้ตายเมิน DEF ศัตรู <strong>${27 + (r - 1) * 4.5}%</strong>`,
    23014: `ทำให้ CRIT DMG ของผู้สวมใส่เพิ่มขึ้น <strong>${20 + (r - 1) * 3}%</strong> เมื่อเพื่อนร่วมทีมเสีย HP จะได้รับ Eclipse ซ้อนทับ 3 ชั้น ทำให้การโจมตีถัดไปสร้าง DMG เพิ่มขึ้น <strong>${14 + (r - 1) * 2.5}%</strong> และเมิน DEF <strong>${12 + (r - 1) * 2}%</strong>`,
    23015: `ทำให้ CRIT Rate ของผู้สวมใส่เพิ่มขึ้น <strong>${18 + (r - 1) * 3}%</strong> เมื่อปล่อย Basic ATK จะได้รับ Dragons Call เพิ่ม ATK <strong>${18 + (r - 1) * 3}%</strong> และ Energy Regeneration Rate <strong>${6 + (r - 1)}%</strong>`,
    23033: `ทำให้ Break Effect ของผู้สวมใส่เพิ่มขึ้น <strong>${60 + (r - 1) * 10}%</strong> เมื่อสร้าง Break DMG จะทำให้ศัตรูติดสถานะ Vulnerability ได้รับ DMG เพิ่มขึ้น <strong>${18 + (r - 1) * 3}%</strong>`,
    23032: `ทำให้ Energy Regeneration Rate ของผู้สวมใส่เพิ่มขึ้น <strong>${12 + (r - 1) * 2}%</strong> เมื่อปล่อยสกิลต่อสู้หรือท่าไม้ตาย จะเพิ่ม CRIT DMG ของพันธมิตร <strong>${48 + (r - 1) * 8}%</strong>`,
    23034: `ทำให้ CRIT Rate ของผู้สวมใส่เพิ่มขึ้น <strong>${12 + (r - 1) * 2}%</strong> เมื่อปล่อยท่าไม้ตาย จะสร้าง DMG น้ำแข็งเพิ่มเติม <strong>${60 + (r - 1) * 10}%</strong> ของ ATK แก่ศัตรูทั้งหมด`,
    23036: `ทำให้ HP สูงสุดของผู้สวมใส่เพิ่มขึ้น <strong>${30 + (r - 1) * 5}%</strong> และเมื่ออยู่ในสนามรบ สมาชิกทีมทุกคนสร้าง DMG เพิ่มขึ้น <strong>${24 + (r - 1) * 4}%</strong>`,
    24001: `เมื่อผู้สวมใส่โจมตี จะเพิ่ม ATK <strong>${8 + (r - 1) * 2}%</strong> สูงสุด 4 ชั้น และเมื่อทำลายจุดอ่อนศัตรู จะเพิ่ม DMG <strong>${12 + (r - 1) * 3}%</strong> เป็นเวลา 2 เทิร์น`
  };

  if (passives[id]) return passives[id];

  const meta = LIGHTCONE_METADATA[id];
  const pathName = meta ? translatePath(meta.path) : "สายต่อสู้";
  return `เพิ่มค่าสถานะพื้นฐานตามสาย <strong>${pathName}</strong> และเพิ่มประสิทธิภาพความเสียหายและการสนับสนุน <strong>${12 + (r - 1) * 3}%</strong> เมื่อเข้าสู่การต่อสู้`;
}

// Update Modal Lightcone Full Artwork and Details (Matching srtools / Firefly)
function updateModalLcFullView(lcId, rank = 5, level = 80) {
  const id = parseInt(lcId, 10);
  if (!id || !LIGHTCONE_METADATA[id]) {
    if (el.modalLcFullImg) el.modalLcFullImg.style.display = 'none';
    if (el.modalLcNoArt) el.modalLcNoArt.style.display = 'block';
    if (el.modalLcNameDisplay) el.modalLcNameDisplay.textContent = 'ยังไม่ได้สวมใส่ Light Cone';
    if (el.modalLcMetaDisplay) el.modalLcMetaDisplay.innerHTML = '';
    if (el.modalLcRankBadge) el.modalLcRankBadge.textContent = '-';
    if (el.modalLcPassiveDesc) el.modalLcPassiveDesc.innerHTML = 'กรุณาเลือก Light Cone ที่ต้องการสวมใส่';
    return;
  }

  const meta = LIGHTCONE_METADATA[id];
  const info = getLightconeInfo(id);

  if (el.modalLcId) el.modalLcId.value = id;
  if (el.modalLcLevel) el.modalLcLevel.value = level;
  if (el.rangeLcLevel) el.rangeLcLevel.value = level;
  if (el.modalLcLvlVal) el.modalLcLvlVal.textContent = `${level} / 80`;

  // Full artwork image
  if (el.modalLcFullImg) {
    el.modalLcFullImg.style.display = 'block';
    if (el.modalLcNoArt) el.modalLcNoArt.style.display = 'none';
    const primarySrc = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/light_cone_preview/${id}.png`;
    const fallbackSrc = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/light_cone_preview/${id}.png`;
    el.modalLcFullImg.src = primarySrc;
    el.modalLcFullImg.onerror = function() {
      if (this.src !== fallbackSrc) {
        this.src = fallbackSrc;
      }
    };
  }

  if (el.modalLcArtWrapper) {
    el.modalLcArtWrapper.className = `lc-art-wrapper rarity-${info.rarity}`;
  }

  if (el.modalLcNameDisplay) {
    el.modalLcNameDisplay.textContent = info.name;
  }

  if (el.modalLcMetaDisplay) {
    el.modalLcMetaDisplay.innerHTML = `
      ${getPathIconHtml(meta.path, 22)}
      <span class="path-badge" style="font-size: 0.75rem;">${info.path}</span>
      <span class="avatar-badge-rarity rarity-${info.rarity}" style="position: static; font-size: 0.75rem; padding: 0.15rem 0.5rem;">★ ${info.rarity}</span>
      <span style="font-size: 0.75rem; color: var(--text-muted);">(ID: ${id})</span>
    `;
  }

  if (el.modalLcRankBadge) {
    el.modalLcRankBadge.textContent = `S${rank} • Lv.${level}`;
  }

  updateLcRankPips(rank);

  if (el.modalLcPassiveDesc) {
    el.modalLcPassiveDesc.innerHTML = getLightconePassiveDesc(id, rank);
  }

  if (el.selectModalChangeLc) {
    el.selectModalChangeLc.value = id;
  }
}

// Populate Modal Change Lightcone Dropdown
function populateModalChangeLcDropdown(avatarPath) {
  if (!el.selectModalChangeLc) return;
  el.selectModalChangeLc.innerHTML = '';

  const allIds = Object.keys(LIGHTCONE_METADATA).sort((a, b) => {
    const metaA = LIGHTCONE_METADATA[a];
    const metaB = LIGHTCONE_METADATA[b];
    if (metaB.rarity !== metaA.rarity) return metaB.rarity - metaA.rarity;
    return parseInt(b, 10) - parseInt(a, 10);
  });

  const samePathGroup = document.createElement('optgroup');
  samePathGroup.label = `⭐ Light Cones สาย ${avatarPath}`;

  const otherPathGroup = document.createElement('optgroup');
  otherPathGroup.label = `🗡️ Light Cones สายอื่นๆ`;

  allIds.forEach(id => {
    const meta = LIGHTCONE_METADATA[id];
    const info = getLightconeInfo(id);
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = `★${info.rarity} [${info.path}] ${info.name} (ID: ${id})`;

    if (meta.path === avatarPath) {
      samePathGroup.appendChild(opt);
    } else {
      otherPathGroup.appendChild(opt);
    }
  });

  if (samePathGroup.children.length > 0) {
    el.selectModalChangeLc.appendChild(samePathGroup);
  }
  el.selectModalChangeLc.appendChild(otherPathGroup);
}

// Character Detail / Build Modal (srtools style)
function openAvatarDetailModal(avatarItem) {
  state.selectedAvatarDetail = avatarItem;
  const aid = avatarItem.avatar_id;
  const meta = getAvatarInfo(aid);

  el.modalCharTitle.textContent = `${t('modalTitleCharEdit')}: ${meta.name} (ID: ${aid})`;
  el.modalCharImg.src = `./assets/avatars/${aid}.png`;
  el.modalCharImg.onerror = function() {
    this.src = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${aid}.png`;
  };
  el.modalCharName.textContent = meta.name;
  el.modalCharMeta.innerHTML = `
    ${getElementIconHtml(meta.element, 24)}
    ${getPathIconHtml(meta.path, 24)}
    <span class="avatar-badge-rarity rarity-${meta.rarity}" style="position: static;">★ ${meta.rarity}</span>
  `;

  // Reset to first sub-tab (Skills & Traces)
  document.querySelectorAll('.modal-subtab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.modal-subtab-content').forEach(c => {
    c.style.display = 'none';
    c.classList.remove('active');
  });
  const firstTabBtn = document.querySelector('.modal-subtab-btn[data-modaltab="modaltab-skills"]');
  if (firstTabBtn) firstTabBtn.classList.add('active');
  const firstTabContent = document.getElementById('modaltab-skills');
  if (firstTabContent) {
    firstTabContent.style.display = 'block';
    firstTabContent.classList.add('active');
  }

  // Basic Status
  el.modalCharLevel.value = avatarItem.level || 80;
  el.modalCharPromotion.value = avatarItem.promotion || 6;
  renderModalEidolonPips(avatarItem.rank ?? 6);

  // Load avatar data from fullFreesrData if available
  const av = state.fullFreesrData?.avatars?.[aid];
  const skills = av?.data?.skills || {};
  const anchorSkills = av?.data?.skills_by_anchor_type || {};

  // 1. Basic Attack: anchor 1 or aid + '001' (1-6)
  const basicVal = anchorSkills['1'] ?? skills[`${aid}001`] ?? 6;
  if (el.rangeSkillBasic && el.valSkillBasic) {
    el.rangeSkillBasic.value = Math.min(6, Math.max(1, basicVal));
    el.valSkillBasic.textContent = el.rangeSkillBasic.value;
  }

  // 2. Skill: anchor 2 or aid + '002' (1-10)
  const skillVal = anchorSkills['2'] ?? skills[`${aid}002`] ?? 10;
  if (el.rangeSkillSkill && el.valSkillSkill) {
    el.rangeSkillSkill.value = Math.min(10, Math.max(1, skillVal));
    el.valSkillSkill.textContent = el.rangeSkillSkill.value;
  }

  // 3. Ultimate: anchor 3 or aid + '003' (1-10)
  const ultraVal = anchorSkills['3'] ?? skills[`${aid}003`] ?? 10;
  if (el.rangeSkillUltra && el.valSkillUltra) {
    el.rangeSkillUltra.value = Math.min(10, Math.max(1, ultraVal));
    el.valSkillUltra.textContent = el.rangeSkillUltra.value;
  }

  // 4. Talent: anchor 4 or aid + '004' (1-10)
  const talentVal = anchorSkills['4'] ?? skills[`${aid}004`] ?? 10;
  if (el.rangeSkillTalent && el.valSkillTalent) {
    el.rangeSkillTalent.value = Math.min(10, Math.max(1, talentVal));
    el.valSkillTalent.textContent = el.rangeSkillTalent.value;
  }

  // Traces & Technique
  if (el.checkTraceTechnique) {
    el.checkTraceTechnique.checked = (anchorSkills['5'] ?? skills[`${aid}007`] ?? 1) > 0;
  }
  if (el.checkTraceA2) {
    el.checkTraceA2.checked = (anchorSkills['6'] ?? skills[`${aid}101`] ?? 1) > 0;
  }
  if (el.checkTraceA4) {
    el.checkTraceA4.checked = (anchorSkills['7'] ?? skills[`${aid}102`] ?? 1) > 0;
  }
  if (el.checkTraceA6) {
    el.checkTraceA6.checked = (anchorSkills['8'] ?? skills[`${aid}103`] ?? 1) > 0;
  }
  if (el.checkTraceStats) {
    el.checkTraceStats.checked = (anchorSkills['9'] ?? skills[`${aid}201`] ?? 1) > 0;
  }

  // Ultimate Energy (Default 50% as standard in Star Rail)
  const maxSp = av?.sp_max ?? 140;
  const defaultStartingSp = Math.floor(maxSp * 0.5);
  const currentSp = (av?.sp_value !== undefined && av?.sp_value !== null) ? av.sp_value : defaultStartingSp;
  if (el.rangeCharEnergy && el.valCharEnergy) {
    el.rangeCharEnergy.max = maxSp;
    el.rangeCharEnergy.value = currentSp;
    el.valCharEnergy.textContent = `${currentSp}/${maxSp}`;
  }

  // Lightcone initialization & full preview
  populateModalChangeLcDropdown(meta.path);
  const equippedLc = (state.fullFreesrData?.lightcones || []).find(lc => lc.equip_avatar === aid);
  const activeLcId = equippedLc?.item_id || SIGNATURE_LIGHTCONES[aid] || 21001;
  const activeLcRank = equippedLc?.rank || 5;
  const activeLcLevel = equippedLc?.level || 80;

  selectedLcRank = activeLcRank;
  updateModalLcFullView(activeLcId, activeLcRank, activeLcLevel);

  // Pre-render showcase card
  renderShowcaseCard(aid);

  el.modalAvatarDetail.classList.add('active');
}

function renderModalEidolonPips(currentRank) {
  el.modalCharEidolonBtns.innerHTML = '';
  for (let r = 0; r <= 6; r++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `eidolon-pip modal-eidolon-pip ${currentRank >= r ? 'active' : ''}`;
    btn.textContent = `E${r}`;
    btn.title = `Eidolon ${r}`;
    btn.addEventListener('click', () => {
      if (state.selectedAvatarDetail) {
        state.selectedAvatarDetail.rank = r;
      }
      renderModalEidolonPips(r);
    });
    el.modalCharEidolonBtns.appendChild(btn);
  }
}

// Set avatar rank (Used by both card pips and modal)
async function setAvatarRank(avatarId, rank) {
  const target = state.avatarsList.find(a => a.avatar_id === avatarId);
  if (target) {
    target.rank = rank;
  }
  if (state.fullFreesrData?.avatars?.[avatarId]) {
    state.fullFreesrData.avatars[avatarId].data.rank = rank;
  }

  renderAvatarsGrid();

  if (state.selectedAvatarDetail && state.selectedAvatarDetail.avatar_id === avatarId) {
    state.selectedAvatarDetail.rank = rank;
    renderModalEidolonPips(rank);
  }

  if (state.isConnected) {
    try {
      if (state.serverMode === 'gac') {
        await apiCall('/api/avatar/rank', 'POST', { avatar_id: avatarId, rank });
      } else {
        await saveFreesrChangesToServer();
      }
      showToast(t('avatarRankSuccess', { id: avatarId, rank }), 'success');
    } catch (err) {
      console.warn('Rank sync to server failed:', err);
    }
  } else {
    showToast(`อัปเดต ${getAvatarInfo(avatarId).name} เป็น E${rank} (บันทึกในเครื่อง)`, 'info');
  }
}

// Max Skills & Traces for character
function maxSkillsForAvatar() {
  if (el.rangeSkillBasic && el.valSkillBasic) {
    el.rangeSkillBasic.value = 6;
    el.valSkillBasic.textContent = 6;
  }
  if (el.rangeSkillSkill && el.valSkillSkill) {
    el.rangeSkillSkill.value = 10;
    el.valSkillSkill.textContent = 10;
  }
  if (el.rangeSkillUltra && el.valSkillUltra) {
    el.rangeSkillUltra.value = 10;
    el.valSkillUltra.textContent = 10;
  }
  if (el.rangeSkillTalent && el.valSkillTalent) {
    el.rangeSkillTalent.value = 10;
    el.valSkillTalent.textContent = 10;
  }
  if (el.checkTraceTechnique) el.checkTraceTechnique.checked = true;
  if (el.checkTraceA2) el.checkTraceA2.checked = true;
  if (el.checkTraceA4) el.checkTraceA4.checked = true;
  if (el.checkTraceA6) el.checkTraceA6.checked = true;
  if (el.checkTraceStats) el.checkTraceStats.checked = true;

  showToast(t('toastAllSkillsMaxed'), 'info');
}

// Max All Build For Current Avatar (Lv.80, Prom 6, E6, Max Skills, Max Traces, 100% Energy, LC Lv.80 S5)
async function maxAllBuildForCurrentAvatar() {
  if (!state.selectedAvatarDetail) return;
  const aid = state.selectedAvatarDetail.avatar_id;

  // Level & Eidolon
  el.modalCharLevel.value = 80;
  el.modalCharPromotion.value = 6;
  state.selectedAvatarDetail.level = 80;
  state.selectedAvatarDetail.promotion = 6;
  state.selectedAvatarDetail.rank = 6;
  renderModalEidolonPips(6);

  // Skills & Traces
  maxSkillsForAvatar();

  // Energy (Default 50% standard starting energy)
  if (el.rangeCharEnergy && el.valCharEnergy) {
    const half = Math.floor(parseInt(el.rangeCharEnergy.max, 10) * 0.5);
    el.rangeCharEnergy.value = half;
    el.valCharEnergy.textContent = `${half}/${el.rangeCharEnergy.max}`;
  }

  // Lightcone
  if (el.modalLcLevel) el.modalLcLevel.value = 80;
  updateLcRankPips(5);

  // Save changes
  await saveAvatarDetails();
}

// Save avatar details from modal
async function saveAvatarDetails() {
  if (!state.selectedAvatarDetail) return;
  const aid = state.selectedAvatarDetail.avatar_id;
  const level = parseInt(el.modalCharLevel.value, 10) || 80;
  const promotion = parseInt(el.modalCharPromotion.value, 10) || 6;
  const rank = state.selectedAvatarDetail.rank ?? 6;

  state.selectedAvatarDetail.level = level;
  state.selectedAvatarDetail.promotion = promotion;
  state.selectedAvatarDetail.rank = rank;

  const target = state.avatarsList.find(a => a.avatar_id === aid);
  if (target) {
    target.level = level;
    target.promotion = promotion;
    target.rank = rank;
  }

  const maxSp = parseInt(el.rangeCharEnergy?.max, 10) || 140;
  const defaultSp = Math.floor(maxSp * 0.5);
  const currentSp = el.rangeCharEnergy ? parseInt(el.rangeCharEnergy.value, 10) : defaultSp;

  if (!state.fullFreesrData) {
    state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
  }
  if (!state.fullFreesrData.avatars) {
    state.fullFreesrData.avatars = {};
  }
  if (!state.fullFreesrData.avatars[aid]) {
    state.fullFreesrData.avatars[aid] = {
      owner_uid: 0,
      avatar_id: aid,
      level,
      promotion,
      techniques: [],
      sp_value: currentSp,
      sp_max: maxSp,
      data: {
        rank,
        skills: {},
        skills_by_anchor_type: {}
      }
    };
  }

  const av = state.fullFreesrData.avatars[aid];
  av.level = level;
  av.promotion = promotion;
  av.data = av.data || {};
  av.data.rank = rank;
  av.sp_max = maxSp;
  av.sp_value = currentSp;

  // Extract skills values
  const basicVal = parseInt(el.rangeSkillBasic?.value, 10) || 6;
  const skillVal = parseInt(el.rangeSkillSkill?.value, 10) || 10;
  const ultraVal = parseInt(el.rangeSkillUltra?.value, 10) || 10;
  const talentVal = parseInt(el.rangeSkillTalent?.value, 10) || 10;
  const techVal = el.checkTraceTechnique?.checked ? 1 : 0;
  const a2Val = el.checkTraceA2?.checked ? 1 : 0;
  const a4Val = el.checkTraceA4?.checked ? 1 : 0;
  const a6Val = el.checkTraceA6?.checked ? 1 : 0;
  const statVal = el.checkTraceStats?.checked ? 1 : 0;

  av.data.skills = av.data.skills || {};
  av.data.skills[`${aid}001`] = basicVal;
  av.data.skills[`${aid}002`] = skillVal;
  av.data.skills[`${aid}003`] = ultraVal;
  av.data.skills[`${aid}004`] = talentVal;
  av.data.skills[`${aid}007`] = techVal;
  av.data.skills[`${aid}101`] = a2Val;
  av.data.skills[`${aid}102`] = a4Val;
  av.data.skills[`${aid}103`] = a6Val;
  for (let i = 1; i <= 10; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    av.data.skills[`${aid}2${pad}`] = statVal;
  }

  av.data.skills_by_anchor_type = {
    "1": basicVal,
    "2": skillVal,
    "3": ultraVal,
    "4": talentVal,
    "5": techVal,
    "6": a2Val,
    "7": a4Val,
    "8": a6Val,
    "9": statVal,
    "10": statVal,
    "11": statVal,
    "12": statVal,
    "13": statVal,
    "14": statVal,
    "15": statVal,
    "16": statVal,
    "17": statVal,
    "18": statVal
  };

  // Lightcone update
  state.fullFreesrData.lightcones = state.fullFreesrData.lightcones || [];
  const lcId = parseInt(el.modalLcId?.value, 10);
  const lcLevel = parseInt(el.modalLcLevel?.value, 10) || 80;
  const lcRank = selectedLcRank || 5;
  const lcProm = lcLevel > 70 ? 6 : (lcLevel > 60 ? 5 : (lcLevel > 50 ? 4 : (lcLevel > 40 ? 3 : (lcLevel > 20 ? 1 : 0))));

  const existingLcIndex = state.fullFreesrData.lightcones.findIndex(lc => lc.equip_avatar === aid);
  if (lcId && lcId > 0) {
    if (existingLcIndex !== -1) {
      state.fullFreesrData.lightcones[existingLcIndex].item_id = lcId;
      state.fullFreesrData.lightcones[existingLcIndex].level = lcLevel;
      state.fullFreesrData.lightcones[existingLcIndex].rank = lcRank;
      state.fullFreesrData.lightcones[existingLcIndex].promotion = lcProm;
    } else {
      state.fullFreesrData.lightcones.push({
        internal_uid: state.fullFreesrData.lightcones.length,
        item_id: lcId,
        equip_avatar: aid,
        level: lcLevel,
        rank: lcRank,
        promotion: lcProm
      });
    }
  } else if (existingLcIndex !== -1) {
    state.fullFreesrData.lightcones[existingLcIndex].equip_avatar = null;
  }

  renderAvatarsGrid();
  loadEquipment();
  if (closeModal) {
    el.modalAvatarDetail.classList.remove('active');
  }

  if (state.isConnected) {
    try {
      if (state.serverMode === 'gac') {
        await apiCall('/api/freesr/avatars', 'POST', { avatar_id: aid, level, promotion, rank });
        await saveFreesrChangesToServer();
      } else {
        await saveFreesrChangesToServer();
      }
      showToast(t('toastCharSaved', { name: getAvatarInfo(aid).name }), 'success');
    } catch (err) {
      showToast(t('toastCharSaved', { name: getAvatarInfo(aid).name }), 'info');
    }
  } else {
    showToast(t('toastCharSaved', { name: getAvatarInfo(aid).name }), 'success');
  }
}

// Apply E6S5 Build (Lv.80, Prom 6, E6, Max Skills/Traces, 50% Energy, S5 Light Cone)
async function applyE6S5Build() {
  if (!state.selectedAvatarDetail) return;
  const aid = state.selectedAvatarDetail.avatar_id;

  // Level & Eidolon
  el.modalCharLevel.value = 80;
  el.modalCharPromotion.value = 6;
  state.selectedAvatarDetail.level = 80;
  state.selectedAvatarDetail.promotion = 6;
  state.selectedAvatarDetail.rank = 6;
  renderModalEidolonPips(6);

  // Skills & Traces
  maxSkillsForAvatar();

  // Energy: 50% standard
  if (el.rangeCharEnergy && el.valCharEnergy) {
    const half = Math.floor(parseInt(el.rangeCharEnergy.max, 10) * 0.5);
    el.rangeCharEnergy.value = half;
    el.valCharEnergy.textContent = `${half}/${el.rangeCharEnergy.max}`;
  }

  // Light Cone: Lv 80, S5
  let curLcId = parseInt(el.modalLcId?.value, 10);
  if (!curLcId || curLcId === 0) {
    curLcId = SIGNATURE_LIGHTCONES[aid] || 21001;
    if (el.modalLcId) el.modalLcId.value = curLcId;
  }
  selectedLcRank = 5;
  updateModalLcFullView(curLcId, 5, 80);

  // Auto equip recommended relics if none equipped
  const hasRelics = (state.fullFreesrData?.relics || []).some(r => r.equip_avatar === aid);
  if (!hasRelics) {
    await autoEquipRecommendedRelics(aid, false);
  }

  await saveAvatarDetails(false);
  renderShowcaseCard(aid);
  showToast(t('toastE6S5Applied'), 'success');
}

// Apply E0S1 Build (Lv.80, Prom 6, E0, Max Skills/Traces, 50% Energy, S1 Light Cone)
async function applyE0S1Build() {
  if (!state.selectedAvatarDetail) return;
  const aid = state.selectedAvatarDetail.avatar_id;

  // Level & Eidolon
  el.modalCharLevel.value = 80;
  el.modalCharPromotion.value = 6;
  state.selectedAvatarDetail.level = 80;
  state.selectedAvatarDetail.promotion = 6;
  state.selectedAvatarDetail.rank = 0;
  renderModalEidolonPips(0);

  // Skills & Traces
  maxSkillsForAvatar();

  // Energy: 50% standard
  if (el.rangeCharEnergy && el.valCharEnergy) {
    const half = Math.floor(parseInt(el.rangeCharEnergy.max, 10) * 0.5);
    el.rangeCharEnergy.value = half;
    el.valCharEnergy.textContent = `${half}/${el.rangeCharEnergy.max}`;
  }

  // Light Cone: Lv 80, S1
  let curLcId = parseInt(el.modalLcId?.value, 10);
  if (!curLcId || curLcId === 0) {
    curLcId = SIGNATURE_LIGHTCONES[aid] || 21001;
    if (el.modalLcId) el.modalLcId.value = curLcId;
  }
  selectedLcRank = 1;
  updateModalLcFullView(curLcId, 1, 80);

  // Auto equip recommended relics if none equipped
  const hasRelics = (state.fullFreesrData?.relics || []).some(r => r.equip_avatar === aid);
  if (!hasRelics) {
    await autoEquipRecommendedRelics(aid, false);
  }

  await saveAvatarDetails(false);
  renderShowcaseCard(aid);
  showToast(t('toastE0S1Applied'), 'info');
}

// Render Showcase Card (Matching srtools.punklorde.org/showcase-card)
function renderShowcaseCard(avatarId) {
  if (!el.showcaseCardContainer) return;
  const aid = parseInt(avatarId, 10);
  const meta = getAvatarInfo(aid);
  const av = state.fullFreesrData?.avatars?.[aid];
  const level = av?.level || state.selectedAvatarDetail?.level || 80;
  const rank = av?.data?.rank ?? state.selectedAvatarDetail?.rank ?? 6;

  // 1. Equipped Light Cone
  const equippedLc = (state.fullFreesrData?.lightcones || []).find(lc => lc.equip_avatar === aid);
  const lcId = equippedLc?.item_id || SIGNATURE_LIGHTCONES[aid] || 21001;
  const lcMeta = LIGHTCONE_METADATA[lcId] || {};
  const lcInfo = getLightconeInfo(lcId);
  const lcLevel = equippedLc?.level || 80;
  const lcRank = equippedLc?.rank || selectedLcRank || 5;

  const baseHp = meta.rarity === 5 ? 1200 : 1058;
  const baseAtk = meta.rarity === 5 ? 640 : 511;
  const baseDef = meta.rarity === 5 ? 600 : 573;
  const baseSpd = 100;

  const lcHp = lcMeta.rarity === 5 ? 1164 : (lcMeta.rarity === 4 ? 953 : 846);
  const lcAtk = lcMeta.rarity === 5 ? 582 : (lcMeta.rarity === 4 ? 423 : 317);
  const lcDef = lcMeta.rarity === 5 ? 529 : (lcMeta.rarity === 4 ? 396 : 264);

  // 2. Relics & Set Bonuses
  const avatarRelics = (state.fullFreesrData?.relics || []).filter(r => r.equip_avatar === aid);
  const setCounts = {};
  avatarRelics.forEach(r => {
    const setId = Math.floor((r.relic_id % 10000) / 10);
    setCounts[setId] = (setCounts[setId] || 0) + 1;
  });

  const activeSetBadges = [];
  for (const sId in setCounts) {
    const count = setCounts[sId];
    const sInfo = getRelicSetInfo(sId);
    if (count >= 4) {
      activeSetBadges.push({ name: sInfo.name, count: 4 });
    } else if (count >= 2) {
      activeSetBadges.push({ name: sInfo.name, count: 2 });
    }
  }

  if (activeSetBadges.length === 0) {
    const rec = RECOMMENDED_RELIC_BUILDS[meta.path] || RECOMMENDED_RELIC_BUILDS.Preservation;
    activeSetBadges.push({ name: getRelicSetInfo(rec.cavern).name, count: 4 });
    activeSetBadges.push({ name: getRelicSetInfo(rec.planar).name, count: 2 });
  }

  // Combat Stats
  const totalHp = Math.round((baseHp + lcHp) * 1.45 + 706);
  const totalAtk = Math.round((baseAtk + lcAtk) * 1.35 + 353);
  const totalDef = Math.round((baseDef + lcDef) * 1.85 + (meta.path === 'Preservation' ? 1200 : 0));
  const totalSpd = (baseSpd + 25 + 10.5).toFixed(1);
  const critRate = (5.0 + (meta.path === 'Hunt' || meta.path === 'Destruction' ? 65.4 : 18.8)).toFixed(1);
  const critDmg = (50.0 + (meta.path === 'Hunt' || meta.path === 'Destruction' ? 132.5 : 26.5)).toFixed(1);
  const breakEffect = (meta.path === 'Harmony' || meta.path === 'Nihility' ? 142.0 : 10.4).toFixed(1);
  const effectRes = (10.0).toFixed(1);
  const err = (19.4).toFixed(1);
  const ehr = (meta.path === 'Nihility' ? 67.2 : 19.4).toFixed(1);
  const healing = (meta.path === 'Abundance' ? 34.5 : 0.0).toFixed(1);
  const elemDmg = (38.8).toFixed(1);

  // Eidolon strip
  let eidolonStripHtml = '';
  for (let e = 1; e <= 6; e++) {
    const isAct = rank >= e;
    eidolonStripHtml += `<div class="showcase-eidolon-dot ${isAct ? 'active' : ''}">E${e}</div>`;
  }

  // Sets HTML
  let setsHtml = '';
  activeSetBadges.forEach(sb => {
    setsHtml += `
      <div class="showcase-set-item">
        <span style="color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">${sb.name}</span>
        <span class="showcase-set-badge">${sb.count}-PC</span>
      </div>
    `;
  });

  // Relic cards (Slots 1 to 6)
  const slotNames = {
    1: { name: "ส่วนหัว", stat: "HP 706" },
    2: { name: "ส่วนมือ", stat: "ATK 353" },
    3: { name: "ลำตัว", stat: meta.path === 'Preservation' ? "DEF 54.0%" : (meta.path === 'Hunt' ? "CRIT Rate 32.4%" : "HP 43.2%") },
    4: { name: "รองเท้า", stat: "SPD 25.0" },
    5: { name: "ลูกแก้ว", stat: `${meta.element} 38.8%` },
    6: { name: "สร้อย", stat: meta.path === 'Preservation' || meta.path === 'Harmony' ? "ERR 19.4%" : "ATK 43.2%" }
  };

  let relicsHtml = '';
  for (let slot = 1; slot <= 6; slot++) {
    const equipped = avatarRelics.find(r => (r.relic_id % 10 === slot));
    const rec = RECOMMENDED_RELIC_BUILDS[meta.path] || RECOMMENDED_RELIC_BUILDS.Preservation;
    const setId = equipped ? Math.floor((equipped.relic_id % 10000) / 10) : (slot <= 4 ? rec.cavern : rec.planar);
    const rInfo = getRelicSetInfo(setId);
    const slotInfo = slotNames[slot];

    relicsHtml += `
      <div class="showcase-relic-card">
        <div class="showcase-relic-icon-wrap">
          <img class="showcase-relic-img" src="https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/${setId}.png" onerror="this.src='./assets/logo.png'" alt="Relic">
          <span class="showcase-relic-lvl-tag">+15</span>
        </div>
        <div class="showcase-relic-info">
          <div class="showcase-relic-main-stat">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">${rInfo.name}</span>
            <span style="color: var(--accent-cyan); font-weight: 800;">${slotInfo.stat}</span>
          </div>
          <div class="showcase-relic-subs">
            <span>CRIT Rate +${(3.2 + slot * 1.5).toFixed(1)}%</span>
            <span>CRIT DMG +${(5.8 + slot * 2.1).toFixed(1)}%</span>
            <span>ATK +${(3.8 + slot * 0.8).toFixed(1)}%</span>
            <span>DEF +${(4.8 + slot * 1.2).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    `;
  }

  const primaryPortrait = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/character_portrait/${aid}.png`;
  const fallbackPortrait = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/character_portrait/${aid}.png`;
  const lcArtThumb = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/light_cone_preview/${lcId}.png`;
  const fallbackLcThumb = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/light_cone_preview/${lcId}.png`;

  el.showcaseCardContainer.innerHTML = `
    <!-- 1. Left Splash Art Column -->
    <div class="showcase-splash-col">
      <img class="showcase-splash-img" src="${primaryPortrait}" onerror="if(this.src!=='${fallbackPortrait}')this.src='${fallbackPortrait}';else this.src='./assets/avatars/${aid}.png';" alt="${meta.name}">
      <div class="showcase-splash-overlay">
        <div class="showcase-char-name">${meta.name}</div>
        <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
          ${getElementIconHtml(meta.element, 22)}
          ${getPathIconHtml(meta.path, 22)}
          <span style="font-weight: 800; font-family: monospace; color: var(--accent-cyan); font-size: 0.95rem;">Lv. ${level}/80</span>
        </div>
        <div class="showcase-eidolon-strip">
          ${eidolonStripHtml}
        </div>
      </div>
    </div>

    <!-- 2. Center Column: LC, Set Bonuses, Combat Stats -->
    <div class="showcase-center-col">
      <!-- Lightcone Box -->
      <div class="showcase-lc-box">
        <img class="showcase-lc-thumb" src="${lcArtThumb}" onerror="if(this.src!=='${fallbackLcThumb}')this.src='${fallbackLcThumb}';else this.src='./assets/logo.png';" alt="${lcInfo.name}">
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 800; font-size: 0.95rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${lcInfo.name}</div>
          <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.2rem;">
            <span style="color: var(--accent-gold); font-weight: 800;">S${lcRank}</span> • Lv. ${lcLevel}/80
          </div>
          <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 0.3rem; display: flex; gap: 0.6rem;">
            <span>❤️ ${lcHp}</span>
            <span>⚔️ ${lcAtk}</span>
            <span>🛡️ ${lcDef}</span>
          </div>
        </div>
      </div>

      <!-- Set Bonuses -->
      <div class="showcase-sets-box">
        <div style="font-size: 0.75rem; font-weight: 800; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 0.5px;">Active Set Bonuses</div>
        ${setsHtml}
      </div>

      <!-- Combat Stats List -->
      <div class="showcase-stats-list">
        <div class="showcase-stat-row"><span class="showcase-stat-label">❤️ HP</span><span class="showcase-stat-val">${totalHp}</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">⚔️ ATK</span><span class="showcase-stat-val">${totalAtk}</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">🛡️ DEF</span><span class="showcase-stat-val">${totalDef}</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">👟 SPD</span><span class="showcase-stat-val">${totalSpd}</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">🎯 CRIT Rate</span><span class="showcase-stat-val">${critRate}%</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">💥 CRIT DMG</span><span class="showcase-stat-val">${critDmg}%</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">⚡ Break Eff</span><span class="showcase-stat-val">${breakEffect}%</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">🛡️ Eff RES</span><span class="showcase-stat-val">${effectRes}%</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">🌀 ERR</span><span class="showcase-stat-val">${err}%</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">🎯 Eff Hit</span><span class="showcase-stat-val">${ehr}%</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">💚 Healing</span><span class="showcase-stat-val">${healing}%</span></div>
        <div class="showcase-stat-row"><span class="showcase-stat-label">✨ ${meta.element}</span><span class="showcase-stat-val">${elemDmg}%</span></div>
      </div>
    </div>

    <!-- 3. Right Column: 6 Equipped Relics -->
    <div class="showcase-relics-col">
      <div style="font-size: 0.75rem; font-weight: 800; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: -0.2rem;">Equipped Relics (+15)</div>
      ${relicsHtml}
    </div>
  `;
}

// Auto-equip recommended 6-piece relics for avatar
async function autoEquipRecommendedRelics(avatarId, notify = true) {
  if (!state.fullFreesrData) {
    state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
  }
  state.fullFreesrData.relics = state.fullFreesrData.relics || [];
  const aid = parseInt(avatarId, 10);
  const meta = getAvatarInfo(aid);
  const rec = RECOMMENDED_RELIC_BUILDS[meta.path] || RECOMMENDED_RELIC_BUILDS.Preservation;

  // Clear existing relics on this character
  state.fullFreesrData.relics = state.fullFreesrData.relics.filter(r => r.equip_avatar !== aid);

  let nextUid = (state.fullFreesrData.relics.reduce((m, r) => Math.max(m, r.internal_uid || 0), 0)) + 1;

  for (let slot = 1; slot <= 6; slot++) {
    const setId = slot <= 4 ? rec.cavern : rec.planar;
    const relicId = 60000 + (setId * 10) + slot;
    state.fullFreesrData.relics.push({
      internal_uid: nextUid++,
      relic_id: relicId,
      level: 15,
      equip_avatar: aid,
      main_affix_id: 1,
      sub_affixes: [
        { sub_affix_id: 1, cnt: 2, step: 2 },
        { sub_affix_id: 2, cnt: 3, step: 2 },
        { sub_affix_id: 3, cnt: 2, step: 2 },
        { sub_affix_id: 4, cnt: 2, step: 2 }
      ]
    });
  }

  if (state.isConnected) {
    await saveFreesrChangesToServer();
  }
  loadEquipment();
  renderShowcaseCard(aid);
  if (notify) {
    showToast(t('toastRelicsEquipped', { name: meta.name }), 'success');
  }
}

// Copy Showcase Card build text to clipboard
function copyShowcaseText(avatarId) {
  const meta = getAvatarInfo(avatarId);
  const av = state.fullFreesrData?.avatars?.[avatarId];
  const rank = av?.data?.rank ?? state.selectedAvatarDetail?.rank ?? 6;
  const lc = (state.fullFreesrData?.lightcones || []).find(l => l.equip_avatar === avatarId);
  const lcInfo = lc ? getLightconeInfo(lc.item_id) : { name: "None", rarity: 0 };
  const text = `✦ Honkai: Star Rail Character Build ✦
Name: ${meta.name} (ID: ${avatarId})
Path: ${meta.path} | Element: ${meta.element}
Level: 80 | Eidolon: E${rank}
Light Cone: ${lcInfo.name} (Lv. ${lc?.level || 80} / S${lc?.rank || 1})
Generated via GaC-Srtool`;

  navigator.clipboard.writeText(text).then(() => {
    showToast(t('toastShowcaseCopied'), 'success');
  }).catch(() => {
    showToast('Failed to copy to clipboard', 'warning');
  });
}

// Export Showcase Card as printable / image view
function exportShowcaseImage(avatarId) {
  const meta = getAvatarInfo(avatarId);
  const showcaseEl = document.getElementById('showcase-card-container');
  if (!showcaseEl) return;

  const win = window.open('', '_blank');
  if (!win) {
    showToast('กรุณาอนุญาต Pop-up เพื่อพิมพ์หรือบันทึกรูปภาพการ์ด', 'warning');
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${meta.name} - Star Rail Build Showcase</title>
      <link rel="stylesheet" href="css/styles.css">
      <style>
        body {
          background: #0b0f19;
          color: #f8fafc;
          padding: 2rem;
          font-family: 'Inter', -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .print-btn-bar {
          margin-bottom: 1.5rem;
          display: flex;
          gap: 1rem;
        }
        button {
          background: #38bdf8;
          color: #000;
          font-weight: 700;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar">
        <button onclick="window.print()">🖨️ พิมพ์ / บันทึกเป็น PDF หรือรูปภาพ</button>
        <button onclick="window.close()" style="background: #334155; color: #fff;">✕ ปิดหน้าต่าง</button>
      </div>
      <div style="max-width: 960px; width: 100%;">
        ${showcaseEl.outerHTML}
      </div>
    </body>
    </html>
  `);
  win.document.close();
  showToast(t('showcaseExport') || 'เปิดหน้าต่างสำหรับบันทึกการ์ดเรียบร้อย', 'info');
}

// ============================================================================
// Quick Action Functions
// ============================================================================

// 1. Quick Set Team Energy (50% or 100%)
async function quickSetTeamEnergy(ratio = 0.5) {
  try {
    state.statusData = state.statusData || {};
    const lineups = state.statusData.lineups || DEFAULT_LINEUP;
    if (!state.fullFreesrData) {
      state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
    }
    state.fullFreesrData.avatars = state.fullFreesrData.avatars || {};

    const lineupIds = Object.values(lineups).filter(id => id && id > 0);
    if (lineupIds.length === 0) {
      showToast(t('slotEmpty') || 'ไม่มีตัวละครในทีม', 'warning');
      return;
    }

    lineupIds.forEach(aid => {
      if (!state.fullFreesrData.avatars[aid]) {
        state.fullFreesrData.avatars[aid] = {
          owner_uid: 0,
          avatar_id: aid,
          level: 80,
          promotion: 6,
          techniques: [],
          sp_max: 140,
          sp_value: 70,
          data: { rank: 6, skills: {} }
        };
      }
      const av = state.fullFreesrData.avatars[aid];
      const maxSp = av.sp_max || 140;
      av.sp_max = maxSp;
      av.sp_value = Math.floor(maxSp * ratio);
    });

    if (state.isConnected) {
      await saveFreesrChangesToServer();
    }

    if (ratio === 0.5) {
      showToast(t('toastEnergy50') || 'ตั้งค่าพลังงานทีม 50% (มาตรฐานเกม) เรียบร้อยแล้ว', 'success');
    } else {
      showToast(t('toastEnergy100') || 'ตั้งค่าพลังงานทีม 100% (อัลติพร้อมใช้) เรียบร้อยแล้ว', 'success');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 2. Quick Unlock All 70+ Avatars
async function quickUnlockAllAvatars() {
  try {
    if (!state.fullFreesrData) {
      state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
    }
    state.fullFreesrData.avatars = state.fullFreesrData.avatars || {};

    const allIds = Object.keys(AVATAR_METADATA).map(id => parseInt(id, 10));
    allIds.forEach(aid => {
      if (!state.fullFreesrData.avatars[aid]) {
        state.fullFreesrData.avatars[aid] = {
          owner_uid: 0,
          avatar_id: aid,
          level: 80,
          promotion: 6,
          techniques: [],
          sp_max: 140,
          sp_value: 70, // 50% standard starting energy
          data: {
            rank: 6,
            skills: {
              [`${aid}001`]: 6,
              [`${aid}002`]: 10,
              [`${aid}003`]: 10,
              [`${aid}004`]: 10,
              [`${aid}007`]: 1,
              [`${aid}101`]: 1,
              [`${aid}102`]: 1,
              [`${aid}103`]: 1,
              [`${aid}201`]: 1
            },
            skills_by_anchor_type: {
              "1": 6, "2": 10, "3": 10, "4": 10, "5": 1, "6": 1, "7": 1, "8": 1, "9": 1
            }
          }
        };
      } else {
        const av = state.fullFreesrData.avatars[aid];
        av.level = 80;
        av.promotion = 6;
        av.data = av.data || {};
        av.data.rank = 6;
        if (!av.sp_value) av.sp_value = 70;
      }
    });

    initAvatarsList();
    state.avatarsList.forEach(a => {
      a.level = 80;
      a.promotion = 6;
      a.rank = 6;
    });

    if (state.isConnected) {
      if (state.serverMode === 'gac') {
        await apiCall('/api/avatar/max_all', 'POST', {}).catch(() => {});
        await saveFreesrChangesToServer().catch(() => {});
      } else {
        await saveFreesrChangesToServer();
      }
    }

    renderAvatarsGrid();
    if (el.statAvatars) el.statAvatars.textContent = Object.keys(state.fullFreesrData.avatars).length;
    showToast(t('toastUnlockedAll') || 'ปลดล็อกตัวละครครบทุกตัว (70+ ตัว E6) เรียบร้อยแล้ว', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 3. Quick Add All 5-Star Signature Light Cones
async function quickAddAll5StarLightcones() {
  try {
    if (!state.fullFreesrData) {
      state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
    }
    state.fullFreesrData.lightcones = state.fullFreesrData.lightcones || [];

    const existingLcIds = new Set(state.fullFreesrData.lightcones.map(lc => lc.item_id));
    let nextUniqueId = 1000;
    state.fullFreesrData.lightcones.forEach(lc => {
      if (lc.unique_id >= nextUniqueId) nextUniqueId = lc.unique_id + 1;
    });

    let addedCount = 0;
    for (const idStr in LIGHTCONE_METADATA) {
      const meta = LIGHTCONE_METADATA[idStr];
      const itemId = parseInt(idStr, 10);
      if (meta.rarity === 5 && !existingLcIds.has(itemId)) {
        state.fullFreesrData.lightcones.push({
          unique_id: nextUniqueId++,
          item_id: itemId,
          level: 80,
          promotion: 6,
          rank: 5,
          equip_avatar: 0
        });
        existingLcIds.add(itemId);
        addedCount++;
      }
    }

    if (state.isConnected) {
      await saveFreesrChangesToServer();
    }
    loadEquipment();
    showToast(t('toastAddedAllLcs') || `เพิ่มกรวยแสง 5 ดาวทั้งหมด (${addedCount} ชิ้น) เข้าคลังแล้ว`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 4. Quick Teleport to Astral Express Parlor Car
async function quickTeleportAstralExpress() {
  const trainLoc = {
    plane_id: 20001,
    floor_id: 20001001,
    entry_id: 2000101,
    x: 0,
    y: 0,
    z: 0,
    rot_y: 0
  };
  try {
    if (state.fullFreesrData) {
      state.fullFreesrData.scene = {
        plane_id: trainLoc.plane_id,
        floor_id: trainLoc.floor_id,
        entry_id: trainLoc.entry_id
      };
      state.fullFreesrData.position = {
        x: trainLoc.x,
        y: trainLoc.y,
        z: trainLoc.z,
        rot_y: trainLoc.rot_y
      };
    }

    if (state.isConnected) {
      if (state.serverMode === 'gac') {
        await apiCall('/api/teleport', 'POST', trainLoc).catch(async () => {
          await apiCall('/api/persistent', 'POST', {
            scene: { plane_id: trainLoc.plane_id, floor_id: trainLoc.floor_id, entry_id: trainLoc.entry_id },
            position: { x: trainLoc.x, y: trainLoc.y, z: trainLoc.z, rot_y: trainLoc.rot_y }
          });
        });
      } else {
        await saveFreesrChangesToServer();
      }
    }

    if (el.lblPlaneId) el.lblPlaneId.textContent = trainLoc.plane_id;
    if (el.lblFloorId) el.lblFloorId.textContent = trainLoc.floor_id;
    if (el.lblCoordinates) el.lblCoordinates.textContent = `X: ${trainLoc.x}, Y: ${trainLoc.y}, Z: ${trainLoc.z}`;
    showToast(t('toastTeleportedTrain') || 'วาร์ปกลับสู่ Astral Express Parlor Car เรียบร้อยแล้ว', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 5. Quick Clear Lineup Slots
async function quickClearLineup() {
  try {
    state.statusData = state.statusData || {};
    let currentLineup = state.statusData.lineups || DEFAULT_LINEUP;
    if (Array.isArray(currentLineup)) {
      const mapped = {};
      currentLineup.forEach((id, idx) => { mapped[idx] = id; });
      currentLineup = mapped;
    }

    const cleared = {};
    Object.keys(currentLineup).forEach(k => {
      cleared[k] = 0;
    });
    if (!state.creativeMode) {
      cleared[0] = 0; cleared[1] = 0; cleared[2] = 0; cleared[3] = 0;
    }

    state.statusData.lineups = cleared;
    if (state.fullFreesrData) {
      state.fullFreesrData.lineups = cleared;
      if (state.fullFreesrData.battle_config) {
        state.fullFreesrData.battle_config.custom_battle_lineup = cleared;
      }
    }

    if (state.isConnected) {
      if (state.serverMode === 'gac') {
        await apiCall('/api/persistent', 'POST', { lineups: cleared });
      } else {
        await saveFreesrChangesToServer();
      }
    }

    renderLineup(cleared);
    showToast(t('toastLineupCleared') || 'ล้างตัวละครในทีมเรียบร้อยแล้ว', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Max all avatars
async function maxAllAvatars() {
  if (!confirm(t('confirmMaxAll'))) return;
  state.avatarsList.forEach(a => {
    a.level = 80;
    a.promotion = 6;
    a.rank = 6;
  });

  if (state.fullFreesrData?.avatars) {
    for (const aid in state.fullFreesrData.avatars) {
      const av = state.fullFreesrData.avatars[aid];
      av.level = 80;
      av.promotion = 6;
      av.data.rank = 6;
      if (av.data.skills) {
        for (const k in av.data.skills) av.data.skills[k] = 10;
      }
    }
  }

  renderAvatarsGrid();

  if (state.isConnected) {
    try {
      if (state.serverMode === 'gac') {
        await apiCall('/api/avatar/max_all', 'POST', {});
      } else {
        await saveFreesrChangesToServer();
      }
      showToast(t('maxAllSuccess'), 'success');
      refreshStatus();
    } catch (err) {
      showToast(`ปรับในเครื่องสำเร็จ แต่ส่งเซิร์ฟเวอร์ไม่ได้: ${err.message}`, 'warning');
    }
  } else {
    showToast('ปรับ Max Lv.80, เลื่อนขั้น 6, E6 ตัวละครทั้งหมดเรียบร้อย (โหมดออฟไลน์)', 'success');
  }
}

// Push local freesr changes to server
async function saveFreesrChangesToServer() {
  if (!state.fullFreesrData) return;
  if (state.serverMode === 'firefly' || state.serverMode === 'robin') {
    try {
      await apiCall('/srtools', 'POST', { data: state.fullFreesrData });
    } catch (e) {
      await apiCall('/api/freesr', 'POST', state.fullFreesrData);
    }
  } else {
    await apiCall('/api/freesr', 'POST', state.fullFreesrData);
  }
}

// Load Equipment (Lightcones & Relics)
async function loadEquipment() {
  try {
    let lcs = [];
    let relics = [];

    if (state.fullFreesrData) {
      lcs = state.fullFreesrData.lightcones || [];
      relics = state.fullFreesrData.relics || [];
    } else if (state.isConnected) {
      const res = await apiCall('/api/freesr');
      if (res && res.data) {
        state.fullFreesrData = res.data;
        lcs = res.data.lightcones || [];
        relics = res.data.relics || [];
      }
    }

    el.badgeTotalLc.textContent = t('itemCount', { n: lcs.length });
    el.badgeTotalRelics.textContent = t('itemCount', { n: relics.length });

    // Render Lightcones
    el.lightconesList.innerHTML = '';
    if (lcs.length === 0) {
      el.lightconesList.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 1.5rem;">${t('noLcData')}</div>`;
    } else {
      lcs.slice(0, 100).forEach(lc => {
        const item = document.createElement('div');
        item.className = 'card';
        item.style.padding = '0.75rem';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        const lcInfo = getLightconeInfo(lc.item_id);
        const equipped = lc.equip_avatar ? getAvatarInfo(lc.equip_avatar).name : t('notEquipped');
        item.innerHTML = `
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span>${lcInfo.name}</span>
              <span class="avatar-badge-rarity rarity-${lcInfo.rarity}" style="position: static; font-size: 0.7rem; padding: 0.1rem 0.4rem;">★ ${lcInfo.rarity}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">(ID: ${lc.item_id})</span>
            </div>
            <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.2rem;">
              Lv. ${lc.level} • S${lc.rank} • ${t('equippedBy')}: <strong style="color: var(--accent-cyan);">${equipped}</strong>
            </div>
          </div>
          <div>
            <button type="button" class="btn btn-sm btn-danger btn-delete-lc" data-uid="${lc.internal_uid}" title="${t('deleteItem')}">🗑️</button>
          </div>
        `;
        el.lightconesList.appendChild(item);
      });

      // Bind delete LC buttons
      el.lightconesList.querySelectorAll('.btn-delete-lc').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const uid = parseInt(e.currentTarget.getAttribute('data-uid'), 10);
          if (state.fullFreesrData?.lightcones) {
            state.fullFreesrData.lightcones = state.fullFreesrData.lightcones.filter(l => l.internal_uid !== uid);
            await saveFreesrChangesToServer();
            loadEquipment();
            showToast(t('toastItemDeleted'), 'info');
          }
        });
      });
    }

    // Render Relics
    el.relicsList.innerHTML = '';
    if (relics.length === 0) {
      el.relicsList.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 1.5rem;">${t('noRelicData')}</div>`;
    } else {
      relics.slice(0, 100).forEach(r => {
        const item = document.createElement('div');
        item.className = 'card';
        item.style.padding = '0.75rem';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        const setId = r.relic_set_id || r.relic_id || r.item_id;
        const relicInfo = getRelicSetInfo(setId);
        const equipped = r.equip_avatar ? getAvatarInfo(r.equip_avatar).name : t('notEquipped');
        item.innerHTML = `
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span>${relicInfo.name}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">(ID: ${r.relic_id || setId})</span>
            </div>
            <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.2rem;">
              Lv. ${r.level} • ${t('equippedBy')}: <strong style="color: var(--accent-cyan);">${equipped}</strong>
            </div>
          </div>
          <div>
            <button type="button" class="btn btn-sm btn-danger btn-delete-relic" data-uid="${r.internal_uid}" title="${t('deleteItem')}">🗑️</button>
          </div>
        `;
        el.relicsList.appendChild(item);
      });

      // Bind delete Relic buttons
      el.relicsList.querySelectorAll('.btn-delete-relic').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const uid = parseInt(e.currentTarget.getAttribute('data-uid'), 10);
          if (state.fullFreesrData?.relics) {
            state.fullFreesrData.relics = state.fullFreesrData.relics.filter(r => r.internal_uid !== uid);
            await saveFreesrChangesToServer();
            loadEquipment();
            showToast(t('toastItemDeleted'), 'info');
          }
        });
      });
    }
  } catch (err) {
    console.warn('Equipment loading error:', err);
  }
}

// Open Add Light Cone Modal
function openAddLcModal() {
  if (!el.modalAddLc) return;
  el.addLcSelect.innerHTML = '';
  const lcIds = Object.keys(LIGHTCONE_METADATA).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  lcIds.forEach(id => {
    const meta = getLightconeInfo(id);
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = `★${meta.rarity} [${meta.path || 'LC'}] ${meta.name} (ID: ${id})`;
    el.addLcSelect.appendChild(opt);
  });

  el.addLcAvatar.innerHTML = `<option value="0">${t('unassigned')}</option>`;
  const sortedAvatars = [...state.avatarsList].sort((a, b) => b.avatar_id - a.avatar_id);
  sortedAvatars.forEach(av => {
    const info = getAvatarInfo(av.avatar_id);
    const opt = document.createElement('option');
    opt.value = av.avatar_id;
    opt.textContent = `${info.name} (ID: ${av.avatar_id})`;
    el.addLcAvatar.appendChild(opt);
  });

  el.addLcLevel.value = 80;
  el.addLcPromotion.value = 6;
  el.addLcRank.value = 5;

  el.modalAddLc.classList.add('active');
}

// Open Add Relic Modal
function openAddRelicModal() {
  if (!el.modalAddRelic) return;
  el.addRelicSet.innerHTML = '';
  const setIds = Object.keys(RELIC_SET_METADATA).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  setIds.forEach(setId => {
    const meta = getRelicSetInfo(setId);
    const opt = document.createElement('option');
    opt.value = setId;
    opt.textContent = `${meta.name} (Set ID: ${setId})`;
    el.addRelicSet.appendChild(opt);
  });

  el.addRelicAvatar.innerHTML = `<option value="0">${t('unassigned')}</option>`;
  const sortedAvatars = [...state.avatarsList].sort((a, b) => b.avatar_id - a.avatar_id);
  sortedAvatars.forEach(av => {
    const info = getAvatarInfo(av.avatar_id);
    const opt = document.createElement('option');
    opt.value = av.avatar_id;
    opt.textContent = `${info.name} (ID: ${av.avatar_id})`;
    el.addRelicAvatar.appendChild(opt);
  });

  el.addRelicSlot.value = "1";
  el.addRelicLevel.value = 15;
  updateRelicMainAffixes("1");

  el.modalAddRelic.classList.add('active');
}

function updateRelicMainAffixes(slot) {
  if (!el.addRelicMainAffix) return;
  el.addRelicMainAffix.innerHTML = '';

  const affixesBySlot = {
    "1": [{ id: 1, name: "HP (Flat)" }],
    "2": [{ id: 1, name: "ATK (Flat)" }],
    "3": [
      { id: 1, name: "HP%" }, { id: 2, name: "ATK%" }, { id: 3, name: "DEF%" },
      { id: 4, name: "CRIT Rate%" }, { id: 5, name: "CRIT DMG%" },
      { id: 6, name: "Outgoing Healing Boost%" }, { id: 7, name: "Effect Hit Rate%" }
    ],
    "4": [
      { id: 1, name: "HP%" }, { id: 2, name: "ATK%" }, { id: 3, name: "DEF%" },
      { id: 4, name: "SPD" }
    ],
    "5": [
      { id: 1, name: "HP%" }, { id: 2, name: "ATK%" }, { id: 3, name: "DEF%" },
      { id: 4, name: "Physical DMG Boost%" }, { id: 5, name: "Fire DMG Boost%" },
      { id: 6, name: "Ice DMG Boost%" }, { id: 7, name: "Lightning DMG Boost%" },
      { id: 8, name: "Wind DMG Boost%" }, { id: 9, name: "Quantum DMG Boost%" },
      { id: 10, name: "Imaginary DMG Boost%" }
    ],
    "6": [
      { id: 1, name: "Break Effect%" }, { id: 2, name: "Energy Regeneration Rate%" },
      { id: 3, name: "HP%" }, { id: 4, name: "ATK%" }, { id: 5, name: "DEF%" }
    ]
  };

  const list = affixesBySlot[slot] || [{ id: 1, name: "Main Stat" }];
  list.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = a.name;
    el.addRelicMainAffix.appendChild(opt);
  });
}

async function handleAddLcSubmit(e) {
  e.preventDefault();
  const itemId = parseInt(el.addLcSelect.value, 10);
  const level = parseInt(el.addLcLevel.value, 10) || 80;
  const promotion = parseInt(el.addLcPromotion.value, 10) || 6;
  const rank = parseInt(el.addLcRank.value, 10) || 5;
  const equipAvatar = parseInt(el.addLcAvatar.value, 10) || 0;

  if (!state.fullFreesrData) {
    state.fullFreesrData = { lightcones: [], relics: [], avatars: {} };
  }
  if (!state.fullFreesrData.lightcones) {
    state.fullFreesrData.lightcones = [];
  }

  if (equipAvatar !== 0) {
    state.fullFreesrData.lightcones.forEach(lc => {
      if (lc.equip_avatar === equipAvatar) lc.equip_avatar = 0;
    });
  }

  const maxUid = state.fullFreesrData.lightcones.reduce((m, lc) => Math.max(m, lc.internal_uid || 0), 0);
  const newLc = {
    level,
    item_id: itemId,
    equip_avatar: equipAvatar,
    rank,
    promotion,
    internal_uid: maxUid + 1
  };

  state.fullFreesrData.lightcones.unshift(newLc);
  await saveFreesrChangesToServer();
  loadEquipment();
  el.modalAddLc.classList.remove('active');
  showToast(t('toastLcAdded'), 'success');
}

async function handleAddRelicSubmit(e) {
  e.preventDefault();
  const setId = parseInt(el.addRelicSet.value, 10);
  const slot = parseInt(el.addRelicSlot.value, 10) || 1;
  const level = parseInt(el.addRelicLevel.value, 10) || 15;
  const mainAffixId = parseInt(el.addRelicMainAffix.value, 10) || 1;
  const equipAvatar = parseInt(el.addRelicAvatar.value, 10) || 0;

  const relicId = 60000 + (setId * 10) + slot;

  if (!state.fullFreesrData) {
    state.fullFreesrData = { lightcones: [], relics: [], avatars: {} };
  }
  if (!state.fullFreesrData.relics) {
    state.fullFreesrData.relics = [];
  }

  if (equipAvatar !== 0) {
    state.fullFreesrData.relics.forEach(r => {
      if (r.equip_avatar === equipAvatar && (r.relic_id % 10 === slot)) {
        r.equip_avatar = 0;
      }
    });
  }

  const maxUid = state.fullFreesrData.relics.reduce((m, r) => Math.max(m, r.internal_uid || 0), 0);
  const newRelic = {
    level,
    relic_id: relicId,
    main_affix_id: mainAffixId,
    sub_affixes: [
      { sub_affix_id: 1, cnt: 2, step: 1 },
      { sub_affix_id: 2, cnt: 2, step: 1 },
      { sub_affix_id: 3, cnt: 3, step: 2 },
      { sub_affix_id: 4, cnt: 4, step: 2 }
    ],
    internal_uid: maxUid + 1,
    equip_avatar: equipAvatar
  };

  state.fullFreesrData.relics.unshift(newRelic);
  await saveFreesrChangesToServer();
  loadEquipment();
  el.modalAddRelic.classList.remove('active');
  showToast(t('toastRelicAdded'), 'success');
}

// Load Persistent Save Settings (Exclusive to GaC-hkrpg-go)
async function loadPersistentSettings() {
  if (state.serverMode !== 'gac') return;
  try {
    const res = await apiCall('/api/persistent');
    if (!res || !res.data) return;
    state.persistentData = res.data;

    if (res.data.main_character) {
      el.persistentMcSelect.value = res.data.main_character;
    }
    if (res.data.march_type) {
      el.persistentMarchSelect.value = res.data.march_type;
    }

    el.toggleSwGlobal.checked = res.data.enable_sw_global !== false;
    el.toggleCastoriceGlobal.checked = res.data.enable_castorice_global !== false;
    if (el.toggleAhaGlobal) el.toggleAhaGlobal.checked = res.data.enable_aha_global !== false;
  } catch (err) {
    console.warn('Persistent settings loading error:', err);
  }
}

// Render Ex-Rank Cards
function renderExRanks(exList) {
  if (!el.exrankList) return;
  el.exrankList.innerHTML = '';
  if (!exList || exList.length === 0) {
    el.exrankList.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 2rem;">ไม่มีข้อมูล Ex-Rank</div>';
    return;
  }

  exList.forEach(ex => {
    const item = document.createElement('div');
    item.className = 'card exrank-item';
    item.style.padding = '1.25rem';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.flexWrap = 'wrap';
    item.style.gap = '1rem';

    const info = getAvatarInfo(ex.avatar_id);

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div class="avatar-image-container" style="width: 52px; height: 52px;">
          <img class="avatar-img"
               src="./assets/avatars/${ex.avatar_id}.png"
               onerror="if(this.src.indexOf('jsdelivr')===-1){this.src='https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${ex.avatar_id}.png';}else{this.style.display='none';}"
               alt="${info.name}">
        </div>
        <div>
          <div style="font-weight: 800; font-size: 1.05rem;">${info.name}</div>
          <div style="display: flex; gap: 0.4rem; margin-top: 0.35rem; align-items: center;">
            ${getElementIconHtml(info.element, 20)}
            ${getPathIconHtml(info.path, 20)}
            <span style="font-size: 0.775rem; color: var(--text-muted); margin-left: 0.25rem;">Ex-Rank ID: ${ex.ex_rank_id}</span>
          </div>
        </div>
      </div>
      <div>
        <button class="btn btn-sm ${ex.unlocked ? 'btn-success' : 'btn-secondary'} btn-toggle-ex"
                data-avatar="${ex.avatar_id}"
                data-unlocked="${ex.unlocked}">
          ${ex.unlocked ? '⚡ เปิดใช้งานแล้ว' : '🔒 ปิดการใช้งาน'}
        </button>
      </div>
    `;

    item.querySelector('.btn-toggle-ex').addEventListener('click', async (e) => {
      const aid = parseInt(e.target.getAttribute('data-avatar'), 10);
      const cur = e.target.getAttribute('data-unlocked') === 'true';
      await toggleSingleExRank(aid, !cur);
    });

    el.exrankList.appendChild(item);
  });
}

async function toggleSingleExRank(avatarId, unlock) {
  try {
    await apiCall('/api/exrank/toggle', 'POST', { avatar_id: avatarId, unlocked: unlock });
    showToast(unlock ? 'ปลดล็อค Ex-Rank สำเร็จ!' : 'ปิดใช้งาน Ex-Rank เรียบร้อย', 'success');
    refreshStatus();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Load and Switch JSON Tab Data
async function loadJsonData(mode) {
  state.currentJsonMode = mode;
  if (mode === 'freesr') {
    el.btnSelectFreesr.className = 'btn btn-sm btn-primary active';
    el.btnSelectPersistent.className = 'btn btn-sm btn-secondary';
    el.jsonStatusInfo.textContent = 'กำลังโหลด freesr-data.json...';
    try {
      if (state.fullFreesrData) {
        el.jsonEditor.value = JSON.stringify(state.fullFreesrData, null, 2);
        el.jsonStatusInfo.textContent = 'freesr-data.json (Loaded from memory)';
      } else {
        const res = await apiCall('/api/freesr');
        state.fullFreesrData = res.data;
        el.jsonEditor.value = JSON.stringify(res.data, null, 2);
        el.jsonStatusInfo.textContent = 'freesr-data.json (Loaded from server)';
      }
    } catch (err) {
      el.jsonStatusInfo.textContent = `Offline: สามารถพิมพ์หรือวาง JSON เองได้`;
      if (!el.jsonEditor.value) {
        el.jsonEditor.value = JSON.stringify({ avatars: {}, lightcones: [], relics: [], battle_config: {} }, null, 2);
      }
    }
  } else {
    el.btnSelectFreesr.className = 'btn btn-sm btn-secondary';
    el.btnSelectPersistent.className = 'btn btn-sm btn-primary active';
    el.jsonStatusInfo.textContent = 'กำลังโหลด persistent...';
    try {
      if (state.persistentData) {
        el.jsonEditor.value = JSON.stringify(state.persistentData, null, 2);
        el.jsonStatusInfo.textContent = 'persistent (Loaded from memory)';
      } else {
        const res = await apiCall('/api/persistent');
        state.persistentData = res.data;
        el.jsonEditor.value = JSON.stringify(res.data, null, 2);
        el.jsonStatusInfo.textContent = 'persistent (Loaded from server)';
      }
    } catch (err) {
      el.jsonStatusInfo.textContent = `Offline: สามารถพิมพ์หรือวาง JSON เองได้`;
      if (!el.jsonEditor.value) {
        el.jsonEditor.value = JSON.stringify({ lineups: DEFAULT_LINEUP, main_character: "FemaleHarmony", march_type: "MarchHunt" }, null, 2);
      }
    }
  }
}

// Save JSON Tab Data
async function saveJsonData() {
  try {
    const parsed = JSON.parse(el.jsonEditor.value);
    if (state.currentJsonMode === 'freesr') {
      state.fullFreesrData = parsed;
      if (state.isConnected) {
        await saveFreesrChangesToServer();
      }
      // Sync loaded characters to local list
      if (parsed.avatars) {
        for (const aid in parsed.avatars) {
          const av = parsed.avatars[aid];
          const found = state.avatarsList.find(a => a.avatar_id === parseInt(aid, 10));
          if (found) {
            found.level = av.level || 80;
            found.promotion = av.promotion || 6;
            found.rank = av.data?.rank ?? 6;
          }
        }
        renderAvatarsGrid();
      }
      showToast('บันทึก freesr-data.json เรียบร้อย', 'success');
    } else {
      state.persistentData = parsed;
      if (state.isConnected && state.serverMode === 'gac') {
        await apiCall('/api/persistent', 'POST', parsed);
      }
      if (parsed.lineups) {
        state.statusData = state.statusData || {};
        state.statusData.lineups = parsed.lineups;
        renderLineup(parsed.lineups);
      }
      showToast('บันทึกไฟล์ persistent เรียบร้อย', 'success');
    }
    refreshStatus();
  } catch (err) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
  }
}

// Tab Switching
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(tBtn => tBtn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
        state.activeTab = targetId;

        // On-demand tab refresh
        if (targetId === 'tab-avatars') {
          renderAvatarsGrid();
        } else if (targetId === 'tab-equipment') {
          loadEquipment();
        } else if (targetId === 'tab-persistent') {
          loadPersistentSettings();
        } else if (targetId === 'tab-json') {
          loadJsonData(state.currentJsonMode);
        }
      }
    });
  });
}

// Setup Event Listeners
function setupEvents() {
  // Quick Ping & Refresh
  el.btnQuickPing.addEventListener('click', () => {
    showToast(t('checking'), 'info');
    refreshStatus();
  });

  // Settings Modal
  el.btnOpenSettings.addEventListener('click', () => {
    el.modalApiUrl.value = state.apiUrl;
    el.modalSettings.classList.add('active');
  });

  el.btnCloseModal.addEventListener('click', () => el.modalSettings.classList.remove('active'));
  el.btnModalCancel.addEventListener('click', () => el.modalSettings.classList.remove('active'));
  
  el.btnModalSave.addEventListener('click', () => {
    const newUrl = el.modalApiUrl.value.trim();
    if (newUrl) {
      state.apiUrl = newUrl;
      localStorage.setItem('gac_srtool_api_url', newUrl);
      el.modalSettings.classList.remove('active');
      showToast(t('settingsSaved'), 'success');
      refreshStatus();
    }
  });

  // Character Detail Modal Controls
  el.btnCloseAvatarModal.addEventListener('click', () => el.modalAvatarDetail.classList.remove('active'));
  document.getElementById('btn-modal-cancel-avatar')?.addEventListener('click', () => el.modalAvatarDetail.classList.remove('active'));
  el.btnModalSaveAvatar.addEventListener('click', () => saveAvatarDetails(true));
  el.btnModalMaxSkills.addEventListener('click', maxSkillsForAvatar);

  // E6S5 and E0S1 Preset Buttons
  el.btnModalE6S5?.addEventListener('click', applyE6S5Build);
  el.btnModalE0S1?.addEventListener('click', applyE0S1Build);

  // Steppers for 4 Skills (Basic, Skill, Ultra, Talent)
  const setupSkillStepper = (rangeEl, valEl, decBtn, incBtn, maxBtn, maxVal) => {
    if (!rangeEl || !valEl) return;
    rangeEl.addEventListener('input', () => { valEl.textContent = rangeEl.value; });
    decBtn?.addEventListener('click', () => {
      let cur = parseInt(rangeEl.value, 10);
      if (cur > parseInt(rangeEl.min, 10)) {
        rangeEl.value = cur - 1;
        valEl.textContent = rangeEl.value;
      }
    });
    incBtn?.addEventListener('click', () => {
      let cur = parseInt(rangeEl.value, 10);
      if (cur < parseInt(rangeEl.max, 10)) {
        rangeEl.value = cur + 1;
        valEl.textContent = rangeEl.value;
      }
    });
    maxBtn?.addEventListener('click', () => {
      rangeEl.value = maxVal;
      valEl.textContent = maxVal;
    });
  };

  setupSkillStepper(el.rangeSkillBasic, el.valSkillBasic, el.btnStepDecBasic, el.btnStepIncBasic, el.btnSkillMaxBasic, 6);
  setupSkillStepper(el.rangeSkillSkill, el.valSkillSkill, el.btnStepDecSkill, el.btnStepIncSkill, el.btnSkillMaxSkill, 10);
  setupSkillStepper(el.rangeSkillUltra, el.valSkillUltra, el.btnStepDecUltra, el.btnStepIncUltra, el.btnSkillMaxUltra, 10);
  setupSkillStepper(el.rangeSkillTalent, el.valSkillTalent, el.btnStepDecTalent, el.btnStepIncTalent, el.btnSkillMaxTalent, 10);

  // Ultimate Energy Controls
  el.rangeCharEnergy?.addEventListener('input', () => {
    el.valCharEnergy.textContent = `${el.rangeCharEnergy.value}/${el.rangeCharEnergy.max}`;
  });
  el.btnModalEnergy50?.addEventListener('click', () => {
    const half = Math.floor(parseInt(el.rangeCharEnergy.max, 10) * 0.5);
    el.rangeCharEnergy.value = half;
    el.valCharEnergy.textContent = `${half}/${el.rangeCharEnergy.max}`;
  });
  el.btnModalEnergy100?.addEventListener('click', () => {
    el.rangeCharEnergy.value = el.rangeCharEnergy.max;
    el.valCharEnergy.textContent = `${el.rangeCharEnergy.max}/${el.rangeCharEnergy.max}`;
  });

  // Lightcone Controls in Modal
  document.querySelectorAll('.lc-super-pip').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = parseInt(btn.getAttribute('data-rank'), 10);
      updateLcRankPips(r);
      const curLcId = parseInt(el.modalLcId?.value, 10);
      const curLvl = parseInt(el.modalLcLevel?.value, 10) || 80;
      if (curLcId) updateModalLcFullView(curLcId, r, curLvl);
    });
  });

  // Lightcone Level Slider & Input sync
  el.rangeLcLevel?.addEventListener('input', () => {
    const lvl = parseInt(el.rangeLcLevel.value, 10);
    if (el.modalLcLevel) el.modalLcLevel.value = lvl;
    if (el.modalLcLvlVal) el.modalLcLvlVal.textContent = `${lvl} / 80`;
    if (el.modalLcRankBadge) el.modalLcRankBadge.textContent = `S${selectedLcRank} • Lv.${lvl}`;
  });

  el.modalLcLevel?.addEventListener('input', () => {
    const lvl = parseInt(el.modalLcLevel.value, 10) || 1;
    if (el.rangeLcLevel) el.rangeLcLevel.value = lvl;
    if (el.modalLcLvlVal) el.modalLcLvlVal.textContent = `${lvl} / 80`;
    if (el.modalLcRankBadge) el.modalLcRankBadge.textContent = `S${selectedLcRank} • Lv.${lvl}`;
  });

  // Apply change Light Cone button
  el.btnModalApplyChangeLc?.addEventListener('click', () => {
    if (!el.selectModalChangeLc || !state.selectedAvatarDetail) return;
    const newLcId = parseInt(el.selectModalChangeLc.value, 10);
    const aid = state.selectedAvatarDetail.avatar_id;
    const curLvl = parseInt(el.modalLcLevel?.value, 10) || 80;

    updateModalLcFullView(newLcId, selectedLcRank, curLvl);
    const lcInfo = getLightconeInfo(newLcId);
    showToast(`เปลี่ยน Light Cone เป็น: ${lcInfo.name} เรียบร้อยแล้ว`, 'info');
    renderShowcaseCard(aid);
  });

  // Showcase Toolbar Controls
  el.btnShowcaseCopyText?.addEventListener('click', () => {
    if (state.selectedAvatarDetail) copyShowcaseText(state.selectedAvatarDetail.avatar_id);
  });

  el.btnShowcaseExportImg?.addEventListener('click', () => {
    if (state.selectedAvatarDetail) exportShowcaseImage(state.selectedAvatarDetail.avatar_id);
  });

  el.btnShowcaseAutoRelics?.addEventListener('click', () => {
    if (state.selectedAvatarDetail) autoEquipRecommendedRelics(state.selectedAvatarDetail.avatar_id, true);
  });

  // Quick Preset Buttons for Character Modal
  document.querySelectorAll('.btn-lvl-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = parseInt(btn.getAttribute('data-lvl'), 10);
      el.modalCharLevel.value = lvl;
      if (lvl > 70) el.modalCharPromotion.value = 6;
      else if (lvl > 60) el.modalCharPromotion.value = 5;
      else if (lvl > 50) el.modalCharPromotion.value = 4;
      else if (lvl > 40) el.modalCharPromotion.value = 3;
      else if (lvl > 20) el.modalCharPromotion.value = 1;
      else el.modalCharPromotion.value = 0;
    });
  });

  document.querySelectorAll('.btn-prom-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      el.modalCharPromotion.value = btn.getAttribute('data-prom');
    });
  });

  el.btnModalQuickE0?.addEventListener('click', () => {
    if (state.selectedAvatarDetail) state.selectedAvatarDetail.rank = 0;
    renderModalEidolonPips(0);
  });

  el.btnModalQuickE6?.addEventListener('click', () => {
    if (state.selectedAvatarDetail) state.selectedAvatarDetail.rank = 6;
    renderModalEidolonPips(6);
  });

  // Lineup Picker Modal Controls
  el.btnClosePickerModal.addEventListener('click', () => el.modalLineupPicker.classList.remove('active'));
  el.pickerSearch.addEventListener('input', renderPickerGrid);

  // Creative Mode Toggle
  if (el.toggleCreativeMode) {
    el.toggleCreativeMode.checked = state.creativeMode;
    el.toggleCreativeMode.addEventListener('change', (e) => {
      state.creativeMode = e.target.checked;
      localStorage.setItem('gac_srtool_creative_mode', state.creativeMode);
      if (el.badgeCreativeMode) {
        el.badgeCreativeMode.style.display = state.creativeMode ? 'inline-flex' : 'none';
      }
      renderLineup(state.statusData?.lineups);
      const title = t('lblCreativeMode') || 'โหมดสร้างสรรค์';
      showToast(`${title}: ${state.creativeMode ? 'ON' : 'OFF'}`, 'info');
    });
  }

  // Quick Action Buttons on Dashboard
  el.btnQuickEnergy50?.addEventListener('click', () => quickSetTeamEnergy(0.5));
  el.btnQuickEnergy100?.addEventListener('click', () => quickSetTeamEnergy(1.0));
  el.btnQuickUnlockAllAvatars?.addEventListener('click', quickUnlockAllAvatars);
  el.btnQuickAddAllLcs?.addEventListener('click', quickAddAll5StarLightcones);
  el.btnQuickTeleportTrain?.addEventListener('click', quickTeleportAstralExpress);
  el.btnQuickClearLineup?.addEventListener('click', quickClearLineup);
  el.btnMaxAllAvatars?.addEventListener('click', maxAllAvatars);

  // Persistent Form Submit
  el.formPersistentChars.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mc = el.persistentMcSelect.value;
    const march = el.persistentMarchSelect.value;
    try {
      await apiCall('/api/persistent', 'POST', {
        main_character: mc,
        march_type: march
      });
      showToast('บันทึกการตั้งค่าตัวละครสำเร็จ!', 'success');
      refreshStatus();
    } catch (err) {
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
    }
  });

  // Persistent Toggles
  el.btnSavePersistentToggles.addEventListener('click', async () => {
    const sw = el.toggleSwGlobal.checked;
    const castorice = el.toggleCastoriceGlobal.checked;
    const aha = el.toggleAhaGlobal ? el.toggleAhaGlobal.checked : true;
    try {
      await apiCall('/api/persistent', 'POST', {
        enable_sw_global: sw,
        enable_castorice_global: castorice,
        enable_aha_global: aha
      });
      showToast(t('btnSaveGlobalSwitch') || 'บันทึกสวิตช์ Global เรียบร้อย!', 'success');
      refreshStatus();
    } catch (err) {
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
    }
  });

  // Equipment Add Modal Controls
  if (el.btnOpenAddLc) {
    el.btnOpenAddLc.addEventListener('click', openAddLcModal);
  }
  if (el.btnCloseAddLcModal) {
    el.btnCloseAddLcModal.addEventListener('click', () => el.modalAddLc.classList.remove('active'));
  }
  if (el.btnCancelAddLc) {
    el.btnCancelAddLc.addEventListener('click', () => el.modalAddLc.classList.remove('active'));
  }
  if (el.formAddLc) {
    el.formAddLc.addEventListener('submit', handleAddLcSubmit);
  }

  if (el.btnOpenAddRelic) {
    el.btnOpenAddRelic.addEventListener('click', openAddRelicModal);
  }
  if (el.btnCloseAddRelicModal) {
    el.btnCloseAddRelicModal.addEventListener('click', () => el.modalAddRelic.classList.remove('active'));
  }
  if (el.btnCancelAddRelic) {
    el.btnCancelAddRelic.addEventListener('click', () => el.modalAddRelic.classList.remove('active'));
  }
  if (el.addRelicSlot) {
    el.addRelicSlot.addEventListener('change', (e) => updateRelicMainAffixes(e.target.value));
  }
  if (el.formAddRelic) {
    el.formAddRelic.addEventListener('submit', handleAddRelicSubmit);
  }

  // Avatar Search & Filters
  el.avatarSearch.addEventListener('input', renderAvatarsGrid);
  el.avatarFilterRarity.addEventListener('change', renderAvatarsGrid);
  el.avatarFilterElement.addEventListener('change', renderAvatarsGrid);
  el.avatarFilterPath?.addEventListener('change', renderAvatarsGrid);
  el.btnReloadAvatars.addEventListener('click', loadAvatars);

  // Ex-Rank All Controls
  el.btnExrankEnableAll.addEventListener('click', async () => {
    try {
      await apiCall('/api/exrank/toggle', 'POST', { all: true, unlocked: true });
      showToast(t('exrankAllSuccess', { status: t('enabled') }), 'success');
      refreshStatus();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  el.btnExrankDisableAll.addEventListener('click', async () => {
    try {
      await apiCall('/api/exrank/toggle', 'POST', { all: true, unlocked: false });
      showToast(t('exrankAllSuccess', { status: t('disabled') }), 'success');
      refreshStatus();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  // JSON Tab Controls
  el.btnSelectFreesr.addEventListener('click', () => loadJsonData('freesr'));
  el.btnSelectPersistent.addEventListener('click', () => loadJsonData('persistent'));
  
  el.btnJsonBeautify.addEventListener('click', () => {
    try {
      const parsed = JSON.parse(el.jsonEditor.value);
      el.jsonEditor.value = JSON.stringify(parsed, null, 2);
      showToast('จัดรูปแบบ JSON สวยงามแล้ว', 'info');
    } catch (err) {
      showToast(t('jsonInvalid'), 'error');
    }
  });

  el.btnJsonSave.addEventListener('click', saveJsonData);

  el.btnJsonDownload.addEventListener('click', () => {
    const text = el.jsonEditor.value;
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${state.currentJsonMode}-${Date.now()}.json`;
    a.click();
    showToast(`ดาวน์โหลด ${a.download} เรียบร้อย`, 'success');
  });

  el.jsonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        el.jsonEditor.value = JSON.stringify(parsed, null, 2);
        
        // If freesr-data.json was uploaded
        if (parsed.avatars) {
          state.fullFreesrData = parsed;
          for (const aid in parsed.avatars) {
            const av = parsed.avatars[aid];
            const found = state.avatarsList.find(a => a.avatar_id === parseInt(aid, 10));
            if (found) {
              found.level = av.level || 80;
              found.promotion = av.promotion || 6;
              found.rank = av.data?.rank ?? 6;
            }
          }
          renderAvatarsGrid();
        }
        
        // If persistent or has lineups
        if (parsed.lineups) {
          state.statusData = state.statusData || {};
          state.statusData.lineups = parsed.lineups;
          renderLineup(parsed.lineups);
        }
        
        showToast(`โหลดไฟล์ ${file.name} สำเร็จและซิงค์ข้อมูลแล้ว`, 'success');
      } catch (err) {
        showToast(t('jsonInvalid'), 'error');
      }
    };
    reader.readAsText(file);
  });

  // Settings Form
  el.settingApiUrl.value = state.apiUrl;
  el.settingPingInterval.value = state.pingIntervalSec;

  el.formSettings.addEventListener('submit', (e) => {
    e.preventDefault();
    state.apiUrl = el.settingApiUrl.value.trim();
    state.pingIntervalSec = parseInt(el.settingPingInterval.value, 10) || 10;
    
    localStorage.setItem('gac_srtool_api_url', state.apiUrl);
    localStorage.setItem('gac_srtool_ping_interval', state.pingIntervalSec);

    showToast(t('settingsSaved'), 'success');
    refreshStatus();
  });

  el.btnResetSettings.addEventListener('click', () => {
    state.apiUrl = 'http://localhost:21000';
    state.pingIntervalSec = 10;
    el.settingApiUrl.value = state.apiUrl;
    el.settingPingInterval.value = state.pingIntervalSec;
    localStorage.removeItem('gac_srtool_api_url');
    localStorage.removeItem('gac_srtool_ping_interval');
    showToast(t('settingsReset'), 'info');
    refreshStatus();
  });

  // Modal Backdrop Click to close
  [el.modalAvatarDetail, el.modalLineupPicker, el.modalSettings].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  });

  // ESC Key to close any active modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
  });
}

// Background Ping Loop
function startPingLoop() {
  setInterval(() => {
    refreshStatus();
  }, state.pingIntervalSec * 1000);
}

// Initialize Application
function init() {
  initAvatarsList();
  setupServerModes();
  setupLanguageSelector();
  setupTabs();
  setupModalSubtabs();
  setupEvents();
  applyTranslations();
  refreshStatus();
  renderAvatarsGrid();
  startPingLoop();
}

// Run on DOM load
window.addEventListener('DOMContentLoaded', init);
