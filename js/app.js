import { AVATAR_METADATA, getAvatarInfo } from './avatars-data.js';
import { LIGHTCONE_METADATA, RELIC_SET_METADATA, getLightconeInfo, getRelicSetInfo } from './equipment-data.js';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, getCurrentLanguage, setLanguage, t, translateElement, translatePath } from './i18n.js';
import {
  getAvatarIconUrl,
  getLightconeArtUrl,
  getLightconeThumbUrl,
  handleAvatarImgError,
  handleAvatarPortraitError,
  handleLcImgError,
  GACHABASE_IMAGE_CACHE,
  KNOWN_GACHABASE_ASSETS
} from './gachabase.js';

// Expose image resolvers & error handlers to window for inline onclick/onerror attributes
window.handleAvatarImgError = handleAvatarImgError;
window.handleAvatarPortraitError = handleAvatarPortraitError;
window.handleLcImgError = handleLcImgError;
window.getAvatarIconUrl = getAvatarIconUrl;
window.getLightconeArtUrl = getLightconeArtUrl;
window.getLightconeThumbUrl = getLightconeThumbUrl;
window.GACHABASE_IMAGE_CACHE = GACHABASE_IMAGE_CACHE;
window.KNOWN_GACHABASE_ASSETS = KNOWN_GACHABASE_ASSETS;

// Application State
const state = {
  serverMode: localStorage.getItem('gac_srtool_mode') || 'gac', // 'gac' | 'firefly' | 'robin'
  apiUrl: localStorage.getItem('gac_srtool_api_url') || 'http://localhost:21000',
  pingIntervalSec: 10,
  isConnected: false,
  statusData: null,
  avatarsList: [],
  fullFreesrData: null,
  persistentData: null,
  dataGameData: null,
  currentJsonMode: 'freesr',
  activeTab: 'tab-dashboard',
  selectedLineupSlot: null,
  selectedAvatarDetail: null,
  creativeMode: localStorage.getItem('gac_srtool_creative_mode') === 'true' || localStorage.getItem('gac_srtool_default_creative') === 'true',
  defaultEnergy: parseInt(localStorage.getItem('gac_srtool_default_energy') || '50', 10),
  autoSync: localStorage.getItem('gac_srtool_auto_sync') !== 'false',
  defaultCreative: localStorage.getItem('gac_srtool_default_creative') === 'true',
  showcaseRolls: localStorage.getItem('gac_srtool_showcase_rolls') !== 'false',
  showcaseAura: localStorage.getItem('gac_srtool_showcase_aura') !== 'false',
  eqActiveSubtab: 'lc',
  inventoryItems: [],
  inventorySaved: {},
  inventoryDraft: {},
  inventoryPage: 0
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
  // Mini Battle Summary & Team Stats
  cardBattleSummary: document.getElementById('card-battle-summary'),
  badgeMiniBattleStatus: document.getElementById('badge-mini-battle-status'),
  miniTotalDmg: document.getElementById('mini-total-dmg'),
  miniTeamDps: document.getElementById('mini-team-dps'),
  miniBreakDmg: document.getElementById('mini-break-dmg'),
  miniBattleTurns: document.getElementById('mini-battle-turns'),
  miniBattleAvatarsList: document.getElementById('mini-battle-avatars-list'),
  btnMiniViewFullAnalyst: document.getElementById('btn-mini-view-full-analyst'),
  synergyAvgLevel: document.getElementById('synergy-avg-level'),
  synergyAvgEidolon: document.getElementById('synergy-avg-eidolon'),
  synergyLcReady: document.getElementById('synergy-lc-ready'),
  synergyRelicReady: document.getElementById('synergy-relic-ready'),

  // Damage Analyst
  tabDamageAnalyst: document.getElementById('tab-damage-analyst'),
  tabBtnDamageAnalyst: document.getElementById('tab-btn-damage-analyst'),
  badgeAnalystStatus: document.getElementById('badge-analyst-status'),
  chkAnalystAutosync: document.getElementById('chk-analyst-autosync'),
  btnAnalystFetch: document.getElementById('btn-analyst-fetch'),
  inputAnalystFile: document.getElementById('input-analyst-file'),
  btnAnalystImport: document.getElementById('btn-analyst-import'),
  btnAnalystExport: document.getElementById('btn-analyst-export'),
  btnAnalystClear: document.getElementById('btn-analyst-clear'),
  analystTeamDamage: document.getElementById('analyst-team-damage'),
  analystDamageAv: document.getElementById('analyst-damage-av'),
  analystCycles: document.getElementById('analyst-cycles'),
  analystCyclesNote: document.getElementById('analyst-cycles-note'),
  analystTotalTurns: document.getElementById('analyst-total-turns'),
  analystAutoTurns: document.getElementById('analyst-auto-turns'),
  analystDuration: document.getElementById('analyst-duration'),
  analystBattleMeta: document.getElementById('analyst-battle-meta'),
  analystShareBarContainer: document.getElementById('analyst-share-bar-container'),
  analystShareLegend: document.getElementById('analyst-share-legend'),
  analystCharactersContainer: document.getElementById('analyst-characters-container'),
  analystEnemiesContainer: document.getElementById('analyst-enemies-container'),
  analystEnemiesCard: document.getElementById('analyst-enemies-card'),

  // GM Command Dispatcher & Live Log Console
  cardGmConsole: document.getElementById('card-gm-console'),
  btnConsoleCopyLog: document.getElementById('btn-console-copy-log'),
  btnConsoleClearLog: document.getElementById('btn-console-clear-log'),
  consoleTerminalLog: document.getElementById('console-terminal-log'),
  formConsoleCmd: document.getElementById('form-console-cmd'),
  consoleCmdInput: document.getElementById('console-cmd-input'),
  btnConsoleCmdSend: document.getElementById('btn-console-cmd-send'),
  lblConsoleConnStatus: document.getElementById('lbl-console-conn-status'),

  // Avatars
  avatarsGrid: document.getElementById('avatars-grid'),
  avatarSearch: document.getElementById('avatar-search'),
  avatarFilterRarity: document.getElementById('avatar-filter-rarity'),
  avatarFilterElement: document.getElementById('avatar-filter-element'),
  avatarFilterPath: document.getElementById('avatar-filter-path'),
  btnMaxAllAvatars: document.getElementById('btn-max-all-avatars'),
  btnReloadAvatars: document.getElementById('btn-reload-avatars'),

  // Equipment
  lightconesGrid: document.getElementById('lightcones-grid'),
  relicsGrid: document.getElementById('relics-grid'),
  badgeTotalLc: document.getElementById('badge-total-lc'),
  badgeTotalRelics: document.getElementById('badge-total-relics'),
  eqSearch: document.getElementById('eq-search'),
  eqFilterRarity: document.getElementById('eq-filter-rarity'),
  eqFilterEquipped: document.getElementById('eq-filter-equipped'),
  eqFilterExtra: document.getElementById('eq-filter-extra'),
  btnEqSubtabLc: document.getElementById('btn-eq-subtab-lc'),
  btnEqSubtabRelic: document.getElementById('btn-eq-subtab-relic'),
  eqInspectorCard: document.getElementById('eq-inspector-card'),
  btnOpenAddLc: document.getElementById('btn-open-add-lc'),
  modalAddLc: document.getElementById('modal-add-lc'),
  btnCloseAddLcModal: document.getElementById('btn-close-add-lc-modal'),
  btnCancelAddLc: document.getElementById('btn-cancel-add-lc'),
  formAddLc: document.getElementById('form-add-lc'),
  addLcSelect: document.getElementById('add-lc-select'),
  addLcSearch: document.getElementById('add-lc-search'),
  addLcFilterPath: document.getElementById('add-lc-filter-path'),
  addLcFilterRarity: document.getElementById('add-lc-filter-rarity'),
  addLcVisualGrid: document.getElementById('add-lc-visual-grid'),
  addLcSelectedId: document.getElementById('add-lc-selected-id'),
  addLcPreviewThumb: document.getElementById('add-lc-preview-thumb'),
  addLcPreviewName: document.getElementById('add-lc-preview-name'),
  addLcPreviewMeta: document.getElementById('add-lc-preview-meta'),
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
  cardPersistentChars: document.getElementById('card-persistent-chars'),
  cardPersistentGlobal: document.getElementById('card-persistent-global'),
  formPersistentChars: document.getElementById('form-persistent-chars'),
  persistentMcSelect: document.getElementById('persistent-mc-select'),
  persistentMarchSelect: document.getElementById('persistent-march-select'),
  toggleSwGlobal: document.getElementById('toggle-sw-global'),
  toggleCastoriceGlobal: document.getElementById('toggle-castorice-global'),
  toggleAhaGlobal: document.getElementById('toggle-aha-global'),
  btnSavePersistentToggles: document.getElementById('btn-save-persistent-toggles'),

  // Material Inventory
  inventorySearch: document.getElementById('inventory-search'),
  inventoryBody: document.getElementById('inventory-materials-body'),
  inventoryCount: document.getElementById('inventory-count'),
  inventoryDirtyCount: document.getElementById('inventory-dirty-count'),
  inventoryStatus: document.getElementById('inventory-status'),
  inventoryPageLabel: document.getElementById('inventory-page-label'),
  btnInventorySave: document.getElementById('btn-inventory-save'),
  btnInventoryDiscard: document.getElementById('btn-inventory-discard'),
  btnInventoryPrev: document.getElementById('btn-inventory-prev'),
  btnInventoryNext: document.getElementById('btn-inventory-next'),

  // Ex-Rank
  tabBtnExrank: document.getElementById('tab-btn-exrank'),
  exrankList: document.getElementById('exrank-list'),
  btnExrankEnableAll: document.getElementById('btn-exrank-enable-all'),
  btnExrankDisableAll: document.getElementById('btn-exrank-disable-all'),

  // JSON Tab
  btnSelectFreesr: document.getElementById('btn-select-freesr'),
  btnSelectPersistent: document.getElementById('btn-select-persistent'),
  btnSelectDatagame: document.getElementById('btn-select-datagame'),
  btnJsonBeautify: document.getElementById('btn-json-beautify'),
  btnJsonDownload: document.getElementById('btn-json-download'),
  btnJsonSave: document.getElementById('btn-json-save'),
  jsonFileInput: document.getElementById('json-file-input'),
  jsonEditor: document.getElementById('json-editor'),
  jsonStatusInfo: document.getElementById('json-status-info'),

  // Settings
  formSettings: document.getElementById('form-settings'),
  settingApiUrl: document.getElementById('setting-api-url'),
  btnTestConnection: document.getElementById('btn-test-connection'),
  pingLatencyBadge: document.getElementById('ping-latency-badge'),
  settingAutoSync: document.getElementById('setting-auto-sync'),
  settingDefaultCreative: document.getElementById('setting-default-creative'),
  settingShowcaseRolls: document.getElementById('setting-showcase-rolls'),
  settingShowcaseAura: document.getElementById('setting-showcase-aura'),
  lblCacheUsage: document.getElementById('lbl-cache-usage'),
  btnClearBrowserCache: document.getElementById('btn-clear-browser-cache'),
  btnResetSettings: document.getElementById('btn-reset-settings'),

  // Character Detail Modal
  modalAvatarDetail: document.getElementById('modal-avatar-detail'),
  btnCloseAvatarModal: document.getElementById('btn-close-avatar-modal'),
  modalCharTitle: document.getElementById('modal-char-title'),
  modalCharSwitcher: document.getElementById('modal-char-switcher'),
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
  btnModalE6S5: document.getElementById('btn-modal-e6s5'),
  btnModalE0S1: document.getElementById('btn-modal-e0s1'),

  // Overview Tab in Modal (Neonteam style)
  overviewPortraitImg: document.getElementById('overview-portrait-img'),
  overviewCharName: document.getElementById('overview-char-name'),
  overviewCharMeta: document.getElementById('overview-char-meta'),
  overviewBadgeLvl: document.getElementById('overview-badge-lvl'),
  overviewBadgeEidolon: document.getElementById('overview-badge-eidolon'),
  overviewStatsGrid: document.getElementById('overview-stats-grid'),
  overviewLcCard: document.getElementById('overview-lc-card'),
  overviewLcThumb: document.getElementById('overview-lc-thumb'),
  overviewLcName: document.getElementById('overview-lc-name'),
  overviewLcRank: document.getElementById('overview-lc-rank'),
  overviewRelicsCard: document.getElementById('overview-relics-card'),
  overviewRelicsSummary: document.getElementById('overview-relics-summary'),

  // Relics Tab in Modal
  modalRelicsSlotsGrid: document.getElementById('modal-relics-slots-grid'),
  modalRelicsActiveSets: document.getElementById('modal-relics-active-sets'),
  btnModalRelicsAuto: document.getElementById('btn-modal-relics-auto'),
  btnModalRelicsClear: document.getElementById('btn-modal-relics-clear'),
  modalSelectRelicSlot: document.getElementById('modal-select-relic-slot'),
  modalSlotPickerTitle: document.getElementById('modal-slot-picker-title'),
  btnCloseSlotPicker: document.getElementById('btn-close-slot-picker'),
  btnSlotPickerQuickGen: document.getElementById('btn-slot-picker-quick-gen'),
  slotPickerInventoryList: document.getElementById('slot-picker-inventory-list'),

  // Skills Info Steppers & Rich Descs (Inspired by srtools.punklorde.org/skills-info)
  valSkillBasic: document.getElementById('val-skill-basic'),
  rangeSkillBasic: document.getElementById('range-skill-basic'),
  btnStepDecBasic: document.getElementById('btn-step-dec-basic'),
  btnStepIncBasic: document.getElementById('btn-step-inc-basic'),
  btnSkillMaxBasic: document.getElementById('btn-skill-max-basic'),
  skillIconBasic: document.getElementById('skill-icon-basic'),
  skillRealNameBasic: document.getElementById('skill-real-name-basic'),
  skillDescBasic: document.getElementById('skill-desc-basic'),

  valSkillSkill: document.getElementById('val-skill-skill'),
  rangeSkillSkill: document.getElementById('range-skill-skill'),
  btnStepDecSkill: document.getElementById('btn-step-dec-skill'),
  btnStepIncSkill: document.getElementById('btn-step-inc-skill'),
  btnSkillMaxSkill: document.getElementById('btn-skill-max-skill'),
  skillIconSkill: document.getElementById('skill-icon-skill'),
  skillRealNameSkill: document.getElementById('skill-real-name-skill'),
  skillDescSkill: document.getElementById('skill-desc-skill'),

  valSkillUltra: document.getElementById('val-skill-ultra'),
  rangeSkillUltra: document.getElementById('range-skill-ultra'),
  btnStepDecUltra: document.getElementById('btn-step-dec-ultra'),
  btnStepIncUltra: document.getElementById('btn-step-inc-ultra'),
  btnSkillMaxUltra: document.getElementById('btn-skill-max-ultra'),
  skillIconUltra: document.getElementById('skill-icon-ultra'),
  skillRealNameUltra: document.getElementById('skill-real-name-ultra'),
  skillDescUltra: document.getElementById('skill-desc-ultra'),

  valSkillTalent: document.getElementById('val-skill-talent'),
  rangeSkillTalent: document.getElementById('range-skill-talent'),
  btnStepDecTalent: document.getElementById('btn-step-dec-talent'),
  btnStepIncTalent: document.getElementById('btn-step-inc-talent'),
  btnSkillMaxTalent: document.getElementById('btn-skill-max-talent'),
  skillIconTalent: document.getElementById('skill-icon-talent'),
  skillRealNameTalent: document.getElementById('skill-real-name-talent'),
  skillDescTalent: document.getElementById('skill-desc-talent'),

  checkTraceTechnique: document.getElementById('check-trace-technique'),
  skillIconTechnique: document.getElementById('skill-icon-technique'),
  skillRealNameTechnique: document.getElementById('skill-real-name-technique'),
  skillDescTechnique: document.getElementById('skill-desc-technique'),

  checkTraceA2: document.getElementById('check-trace-a2'),
  traceIconA2: document.getElementById('trace-icon-a2'),
  traceNameA2: document.getElementById('trace-name-a2'),
  traceDescA2: document.getElementById('trace-desc-a2'),

  checkTraceA4: document.getElementById('check-trace-a4'),
  traceIconA4: document.getElementById('trace-icon-a4'),
  traceNameA4: document.getElementById('trace-name-a4'),
  traceDescA4: document.getElementById('trace-desc-a4'),

  checkTraceA6: document.getElementById('check-trace-a6'),
  traceIconA6: document.getElementById('trace-icon-a6'),
  traceNameA6: document.getElementById('trace-name-a6'),
  traceDescA6: document.getElementById('trace-desc-a6'),

  checkTraceStats: document.getElementById('check-trace-stats'),

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
      'Content-Type': 'application/json',
      'X-GaC-Srtool': '1'
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

// Explicit, expiring custom-battle connection. The backend returns its TTL.
let toolSessionTimer = null;
let toolSessionConnected = false;
let toolSessionGeneration = 0;
async function syncToolSession(connected) {
  const generation = ++toolSessionGeneration;
  if (toolSessionTimer) { clearTimeout(toolSessionTimer); toolSessionTimer = null; }
  toolSessionConnected = connected;
  try {
    const result = await apiCall('/api/tool-session', 'POST', { connected, client: 'GaC-Srtool' });
    if (generation === toolSessionGeneration && connected && toolSessionConnected && Number(result.lease_seconds) > 0) {
      toolSessionTimer = setTimeout(() => syncToolSession(true), Number(result.lease_seconds) * 1000 / 3);
    }
  } catch (error) {
    if (generation === toolSessionGeneration) toolSessionConnected = false;
    // Older backends remain usable, but cannot enable the custom encounter lease.
    console.warn('Tool session unavailable:', error.message);
  }
}
window.addEventListener('pagehide', () => {
  if (!toolSessionConnected) return;
  const base = state.apiUrl.replace(/\/+$/, '');
  navigator.sendBeacon(`${base}/api/tool-session`, JSON.stringify({ connected: false, client: 'GaC-Srtool' }));
});

// Update connection status UI
function setConnectionStatus(connected, extraText = '') {
  if (connected !== toolSessionConnected) syncToolSession(connected);
  state.isConnected = connected;
  if (connected) {
    el.statusDot.classList.add('connected');
    el.connectionStatusText.textContent = extraText || t('online');
    el.connectionStatusText.style.color = 'var(--accent-green)';
    if (el.lblConsoleConnStatus) {
      el.lblConsoleConnStatus.textContent = t('consoleOnline');
      el.lblConsoleConnStatus.style.color = 'var(--accent-green)';
    }
  } else {
    el.statusDot.classList.remove('connected');
    el.connectionStatusText.textContent = extraText || t('offline');
    el.connectionStatusText.style.color = 'var(--accent-red)';
    if (el.lblConsoleConnStatus) {
      el.lblConsoleConnStatus.textContent = t('consoleOffline');
      el.lblConsoleConnStatus.style.color = 'var(--text-muted)';
    }
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

  const addLcFilter = document.getElementById('add-lc-filter-path');
  if (addLcFilter) {
    const selected = addLcFilter.value;
    const paths = ['Destruction', 'Hunt', 'Erudition', 'Harmony', 'Nihility', 'Preservation', 'Abundance', 'Remembrance', 'Elation'];
    if (addLcFilter.options[0]) addLcFilter.options[0].textContent = `${t('filterAllPaths') || 'ทุกสาย'} (All)`;
    paths.forEach((p, idx) => {
      if (addLcFilter.options[idx + 1]) addLcFilter.options[idx + 1].textContent = translatePath(p);
    });
    addLcFilter.value = selected;
  }

  const lcPickerFilter = document.getElementById('lc-picker-filter-path');
  if (lcPickerFilter) {
    const selected = lcPickerFilter.value;
    const paths = ['Destruction', 'Hunt', 'Erudition', 'Harmony', 'Nihility', 'Preservation', 'Abundance', 'Remembrance'];
    if (lcPickerFilter.options[0]) lcPickerFilter.options[0].textContent = t('filterAllPaths') || 'ทุกสาย';
    if (lcPickerFilter.options[1]) lcPickerFilter.options[1].textContent = t('filterSamePath') || 'สายเดียวกัน';
    paths.forEach((p, idx) => {
      if (lcPickerFilter.options[idx + 2]) lcPickerFilter.options[idx + 2].textContent = translatePath(p);
    });
    lcPickerFilter.value = selected;
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

// Robust Dual Storage (IndexedDB + localStorage fallback)
const DB_NAME = 'GaCSrtoolDB';
const DB_STORE = 'cache_store';

function openIDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = () => resolve(null);
  });
}

async function idbSet(key, value) {
  try {
    const db = await openIDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(value, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    }
  } catch (e) {}
  return false;
}

async function idbGet(key) {
  try {
    const db = await openIDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const req = tx.objectStore(DB_STORE).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
    }
  } catch (e) {}
  return null;
}

async function idbDelete(key) {
  try {
    const db = await openIDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    }
  } catch (e) {}
  return false;
}

async function idbClear() {
  try {
    const db = await openIDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    }
  } catch (e) {}
  return false;
}

// Storage Cache Handlers for Offline & Upload Persistence
async function saveFreesrCache(data) {
  if (!data) return;
  try {
    // 1. Primary: IndexedDB (handles large multi-MB FreeSR files easily)
    await idbSet('gac_srtool_freesr_cache', data);
  } catch (e) {
    console.warn('Failed to save freesr cache to IndexedDB:', e);
  }

  // 2. Secondary: localStorage
  try {
    localStorage.setItem('gac_srtool_freesr_cache', JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage quota exceeded for freesr cache, safely persisted in IndexedDB:', e);
  }
  updateCacheUsageDisplay();
}

async function savePersistentCache(data) {
  if (!data) return;
  try {
    await idbSet('gac_srtool_persistent_cache', data);
  } catch (e) {
    console.warn('Failed to save persistent cache to IndexedDB:', e);
  }

  try {
    localStorage.setItem('gac_srtool_persistent_cache', JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage quota exceeded for persistent cache, safely persisted in IndexedDB:', e);
  }
  updateCacheUsageDisplay();
}

// FireflyGo data-in-game.json structure and path mappings (from FFGO dumps)
const DEFAULT_DATA_GAME = {
  leader: 0,
  lineups: {
    "0": 1506,
    "1": 1502,
    "2": 1511,
    "3": 1503
  },
  position: {
    x: 8000,
    z: 1550,
    y: 715,
    rot_y: 131000
  },
  scene: {
    plane_id: 80112,
    floor_id: 80112001,
    entry_id: 801120102,
    map_rotation_group_id: 0
  },
  player_outfit: [ 1003 ],
  char_path: {
    main: 8010,
    march_7: 1224
  },
  char_enhanced: {
    "1004": 1,
    "1005": 0,
    "1006": 1,
    "1102": 1,
    "1205": 1,
    "1212": 1,
    "1217": 1,
    "1306": 1,
    "1307": 1,
    "1310": 1
  }
};

const FIREFLY_MC_MAP = {
  'MalePhysical': 8001,
  'FemalePhysical': 8002,
  'MalePreservation': 8003,
  'FemalePreservation': 8004,
  'MaleHarmony': 8005,
  'FemaleHarmony': 8010,
  'MaleRemembrance': 8011,
  'FemaleRemembrance': 8012
};
const FIREFLY_MC_REVERSE_MAP = {
  8001: 'MalePhysical',
  8002: 'FemalePhysical',
  8003: 'MalePreservation',
  8004: 'FemalePreservation',
  8005: 'MaleHarmony',
  8006: 'FemaleHarmony',
  8010: 'FemaleHarmony',
  8011: 'MaleRemembrance',
  8012: 'FemaleRemembrance'
};
const FIREFLY_MARCH_MAP = {
  'MarchPreservation': 1001,
  'MarchHunt': 1224
};
const FIREFLY_MARCH_REVERSE_MAP = {
  1001: 'MarchPreservation',
  1224: 'MarchHunt'
};

async function saveDataGameCache(data) {
  if (!data) return;
  try {
    await idbSet('gac_srtool_datagame_cache', data);
  } catch (e) {
    console.warn('Failed to save data-in-game cache to IndexedDB:', e);
  }
  try {
    localStorage.setItem('gac_srtool_datagame_cache', JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage quota exceeded for data-in-game cache:', e);
  }
  updateCacheUsageDisplay();
}

async function loadCachedStorageData() {
  try {
    let cachedFreesr = await idbGet('gac_srtool_freesr_cache');
    if (!cachedFreesr) {
      const raw = localStorage.getItem('gac_srtool_freesr_cache');
      if (raw) cachedFreesr = JSON.parse(raw);
    }
    if (cachedFreesr) {
      state.fullFreesrData = cachedFreesr;
      if (cachedFreesr.avatars) {
        for (const aid in cachedFreesr.avatars) {
          const av = cachedFreesr.avatars[aid];
          const found = state.avatarsList.find(a => a.avatar_id === parseInt(aid, 10));
          if (found) {
            found.level = av.level || 80;
            found.promotion = av.promotion || 6;
            found.rank = av.data?.rank ?? 6;
          }
        }
      }
      if (cachedFreesr.lineups && (!state.statusData || !state.statusData.lineups)) {
        state.statusData = state.statusData || {};
        state.statusData.lineups = cachedFreesr.lineups;
      }
    }
  } catch (e) {
    console.warn('Failed to load cached freesr data:', e);
  }

  try {
    let cachedPersistent = await idbGet('gac_srtool_persistent_cache');
    if (!cachedPersistent) {
      const raw = localStorage.getItem('gac_srtool_persistent_cache');
      if (raw) cachedPersistent = JSON.parse(raw);
    }
    if (cachedPersistent) {
      state.persistentData = cachedPersistent;
      if (cachedPersistent.lineups && (!state.statusData || !state.statusData.lineups)) {
        state.statusData = state.statusData || {};
        state.statusData.lineups = cachedPersistent.lineups;
      }
    }
  } catch (e) {
    console.warn('Failed to load cached persistent data:', e);
  }

  try {
    let cachedDataGame = await idbGet('gac_srtool_datagame_cache');
    if (!cachedDataGame) {
      const raw = localStorage.getItem('gac_srtool_datagame_cache');
      if (raw) cachedDataGame = JSON.parse(raw);
    }
    if (cachedDataGame) {
      state.dataGameData = cachedDataGame;
      if (state.serverMode === 'firefly' && cachedDataGame.lineups && (!state.statusData || !state.statusData.lineups)) {
        state.statusData = state.statusData || {};
        state.statusData.lineups = cachedDataGame.lineups;
      }
    }
  } catch (e) {
    console.warn('Failed to load cached data-in-game data:', e);
  }
}

// Apply multi-language translations across UI
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    const val = t(key);
    if (val && val !== key) elem.textContent = val;
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

  // Update server mode badges & labels for current language
  setupServerModes();

  // Re-render team synergy in new language
  renderTeamSynergy(state.statusData?.lineups);

  renderLineup(state.statusData?.lineups);
  if (state.statusData?.ex_ranks) {
    renderExRanks(state.statusData.ex_ranks);
  }
  if (state.avatarsList.length > 0) {
    renderAvatarsGrid();
  }
  loadEquipment();
  updateDocumentTitle();
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
      if (el.tabBtnPersistent) {
        el.tabBtnPersistent.style.display = '';
        el.tabBtnPersistent.textContent = t('tabPersistentGaC');
      }
      if (el.cardPersistentChars) el.cardPersistentChars.style.display = '';
      if (el.cardPersistentGlobal) el.cardPersistentGlobal.style.display = '';
      if (el.tabBtnExrank) el.tabBtnExrank.style.display = '';
      if (el.btnQuickSyncPersistent) el.btnQuickSyncPersistent.style.display = '';
      if (el.btnSelectPersistent) el.btnSelectPersistent.style.display = '';
      if (el.btnSelectDatagame) el.btnSelectDatagame.style.display = 'none';
      if (el.badgePersistenceMode) el.badgePersistenceMode.textContent = t('badgePersistenceGaC');
    } else if (mode === 'firefly') {
      if (el.lblActiveMode) el.lblActiveMode.textContent = 'FireflyGo';
      if (el.tabBtnPersistent) {
        el.tabBtnPersistent.style.display = '';
        el.tabBtnPersistent.textContent = t('tabPersistentFirefly');
      }
      if (el.cardPersistentChars) el.cardPersistentChars.style.display = '';
      if (el.cardPersistentGlobal) el.cardPersistentGlobal.style.display = 'none'; // Hide unsupported GaC switches
      if (el.tabBtnExrank) el.tabBtnExrank.style.display = 'none'; // Hide unsupported Ex-ranks
      if (el.btnQuickSyncPersistent) el.btnQuickSyncPersistent.style.display = 'none';
      if (el.btnSelectPersistent) el.btnSelectPersistent.style.display = 'none';
      if (el.btnSelectDatagame) el.btnSelectDatagame.style.display = ''; // Show data-in-game for Firefly
      if (el.badgePersistenceMode) el.badgePersistenceMode.textContent = t('badgePersistenceFirefly');

      if (state.activeTab === 'tab-exrank') {
        const dashboardBtn = document.querySelector('.tab-btn[data-tab="tab-dashboard"]');
        if (dashboardBtn) dashboardBtn.click();
      }

      if (state.currentJsonMode === 'persistent') {
        loadJsonData('datagame');
      }
    } else { // robin
      if (el.lblActiveMode) el.lblActiveMode.textContent = 'RobinSR';
      if (el.tabBtnPersistent) el.tabBtnPersistent.style.display = 'none';
      if (el.cardPersistentGlobal) el.cardPersistentGlobal.style.display = 'none';
      if (el.tabBtnExrank) el.tabBtnExrank.style.display = 'none';
      if (el.btnQuickSyncPersistent) el.btnQuickSyncPersistent.style.display = 'none';
      if (el.btnSelectPersistent) el.btnSelectPersistent.style.display = 'none';
      if (el.btnSelectDatagame) el.btnSelectDatagame.style.display = 'none';
      if (el.badgePersistenceMode) el.badgePersistenceMode.textContent = t('badgePersistenceRobin');

      if (state.activeTab === 'tab-persistent' || state.activeTab === 'tab-exrank') {
        const dashboardBtn = document.querySelector('.tab-btn[data-tab="tab-dashboard"]');
        if (dashboardBtn) dashboardBtn.click();
      }

      if (state.currentJsonMode === 'persistent' || state.currentJsonMode === 'datagame') {
        loadJsonData('freesr');
      }
    }

    // Creative Mode is OPEN for all server modes!
    if (el.toggleCreativeMode) {
      el.toggleCreativeMode.disabled = false;
      el.toggleCreativeMode.checked = state.creativeMode;
    }
    if (el.badgeCreativeMode) {
      el.badgeCreativeMode.style.display = state.creativeMode ? 'inline-flex' : 'none';
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
function initAvatarsList(force = false) {
  if (state.avatarsList.length > 0 && !force) {
    let missing = false;
    for (const aidStr in AVATAR_METADATA) {
      const aid = parseInt(aidStr, 10);
      if (!state.avatarsList.some(a => a.avatar_id === aid)) {
        state.avatarsList.push({
          avatar_id: aid,
          level: 80,
          promotion: 6,
          rank: 6
        });
        missing = true;
      }
    }
    if (missing) {
      state.avatarsList.sort((a, b) => b.avatar_id - a.avatar_id);
    }
    return;
  }
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
      const [status, freesr] = await Promise.all([
        apiCall('/api/status'),
        apiCall('/api/freesr').catch(() => null)
      ]);
      data = status;
      // GAC status contains persistent settings and lineup only. Refresh the
      // FreeSR snapshot separately so the avatar editor shows the server's
      // latest skills/Trace values instead of a stale browser cache.
      if (freesr?.data) {
        state.fullFreesrData = freesr.data;
        await saveFreesrCache(freesr.data);
      }
    } else if (state.serverMode === 'firefly') {
      // FireflyGo uses data-in-game.json for live state and freesr-data.json for inventory
      const datagame = await apiCall('/api/data-in-game').catch(() => null);
      if (datagame && (datagame.data || datagame.lineups)) {
        state.dataGameData = datagame.data || datagame;
        await saveDataGameCache(state.dataGameData);
      }
      const freesr = await apiCall('/api/freesr').catch(() => null);
      if (freesr && freesr.data) {
        state.fullFreesrData = freesr.data;
        data = {
          status: 200,
          avatar_count: Object.keys(freesr.data.avatars || {}).length,
          lightcone_count: (freesr.data.lightcones || []).length,
          relic_count: (freesr.data.relics || []).length,
          lineups: state.dataGameData?.lineups || freesr.data.lineups || freesr.data.battle_config?.custom_battle_lineup || DEFAULT_LINEUP,
          scene: state.dataGameData?.scene || freesr.data.scene,
          position: state.dataGameData?.position || freesr.data.position,
          ex_ranks: []
        };
      } else if (state.dataGameData) {
        data = {
          status: 200,
          avatar_count: state.avatarsList.length,
          lightcone_count: 0,
          relic_count: 0,
          lineups: state.dataGameData.lineups || DEFAULT_LINEUP,
          scene: state.dataGameData.scene,
          position: state.dataGameData.position,
          ex_ranks: []
        };
      } else {
        throw new Error('Firefly server not reachable');
      }
    } else { // robin
      const freesr = await apiCall('/api/freesr').catch(() => null);
      if (freesr && freesr.data) {
        state.fullFreesrData = freesr.data;
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

    if (el.badgePersistenceMode) {
      if (state.serverMode === 'gac') {
        el.badgePersistenceMode.textContent = 'GaC: persistent.json (/api/persistent)';
        el.badgePersistenceMode.className = 'badge-creative';
      } else if (state.serverMode === 'firefly') {
        el.badgePersistenceMode.textContent = 'FireflyGo: data-in-game.json & freesr-data.json';
        el.badgePersistenceMode.className = 'badge-super-tag';
      } else {
        el.badgePersistenceMode.textContent = 'RobinSR: freesr-data.json (/api/freesr)';
        el.badgePersistenceMode.className = 'badge-super-tag';
      }
    }

    // Creative Mode is OPEN for all servers
    if (el.toggleCreativeMode) {
      el.toggleCreativeMode.disabled = false;
      el.toggleCreativeMode.checked = state.creativeMode;
      if (el.badgeCreativeMode) {
        el.badgeCreativeMode.style.display = state.creativeMode ? 'inline-flex' : 'none';
      }
    }

    renderLineup(data.lineups || DEFAULT_LINEUP);
    renderExRanks(data.ex_ranks || []);
    loadAvatars();
  } catch (err) {
    setConnectionStatus(false, t('offline'));
    el.lblApiUrl.textContent = state.apiUrl;

    if (state.fullFreesrData) {
      const avCount = Object.keys(state.fullFreesrData.avatars || {}).length;
      const lcCount = (state.fullFreesrData.lightcones || []).length;
      const relicCount = (state.fullFreesrData.relics || []).length;
      el.statAvatars.textContent = avCount || state.avatarsList.length;
      el.statLightcones.textContent = lcCount;
      el.statRelics.textContent = relicCount;
    } else {
      el.statAvatars.textContent = state.avatarsList.length;
    }

    if (el.badgePersistenceMode) {
      if (state.serverMode === 'gac') {
        el.badgePersistenceMode.textContent = 'GaC: persistent.json (/api/persistent)';
        el.badgePersistenceMode.className = 'badge-creative';
      } else if (state.serverMode === 'firefly') {
        el.badgePersistenceMode.textContent = 'FireflyGo: data-in-game.json & freesr-data.json';
        el.badgePersistenceMode.className = 'badge-super-tag';
      } else {
        el.badgePersistenceMode.textContent = 'RobinSR: freesr-data.json (/api/freesr)';
        el.badgePersistenceMode.className = 'badge-super-tag';
      }
    }

    // Keep rendering with current or default lineup so UI is always functional
    renderLineup(state.statusData?.lineups || DEFAULT_LINEUP);
    loadAvatars();
  }
}

// Render party lineup cards
function renderLineup(lineups) {
  if (el.toggleCreativeMode) {
    el.toggleCreativeMode.checked = state.creativeMode;
    el.toggleCreativeMode.disabled = false;
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
             src="${getAvatarIconSrc(avatarId)}"
             onerror="handleAvatarImgError(this, ${avatarId})"
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

  // Update Team Combat Synergy Analysis
  renderTeamSynergy(currentLineup);
}

// ==========================================
// Mini Battle Summary & Team Stats
// ==========================================
const ELEMENT_COLORS = {
  Physical: '#cbd5e1',
  Fire: '#ef4444',
  Ice: '#38bdf8',
  Lightning: '#c084fc',
  Thunder: '#c084fc',
  Wind: '#34d399',
  Quantum: '#818cf8',
  Imaginary: '#fbbf24'
};

function renderMiniBattleSummary() {
  if (!el.miniBattleAvatarsList) return;
  const report = analystState.currentReport;

  if (!report || !report.team_total_damage || !report.avatars || report.avatars.length === 0) {
    if (el.badgeMiniBattleStatus) {
      el.badgeMiniBattleStatus.textContent = t('miniNoBattleTitle');
      el.badgeMiniBattleStatus.style.background = 'rgba(156, 163, 175, 0.12)';
      el.badgeMiniBattleStatus.style.color = 'var(--text-muted)';
      el.badgeMiniBattleStatus.style.borderColor = 'rgba(156, 163, 175, 0.25)';
    }
    if (el.miniTotalDmg) el.miniTotalDmg.textContent = '-';
    if (el.miniTeamDps) el.miniTeamDps.textContent = '-';
    if (el.miniBreakDmg) el.miniBreakDmg.textContent = '-';
    if (el.miniBattleTurns) el.miniBattleTurns.textContent = '-';

    el.miniBattleAvatarsList.innerHTML = `
      <div style="background: rgba(0,0,0,0.25); border: 1px dashed rgba(255,255,255,0.1); border-radius: var(--radius-sm); padding: 0.85rem 1rem; text-align: center;">
        <div style="font-size: 1.35rem; margin-bottom: 0.25rem;">⚔️</div>
        <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">${t('miniNoBattleTitle')}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
          ${t('miniNoBattleDesc')}
        </div>
        <div style="margin-top: 0.6rem; display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-sm btn-secondary" onclick="window.fetchLatestBattleReport(false)" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;">
            ${t('miniBtnFetch')}
          </button>
          <button type="button" class="btn btn-sm btn-primary" onclick="window.loadDemoBattleReport()" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border-color: #38bdf8;">
            ${t('miniBtnDemo')}
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Active Report
  const isWin = (report.end_status || 'WIN').toUpperCase() === 'WIN';
  if (el.badgeMiniBattleStatus) {
    el.badgeMiniBattleStatus.textContent = isWin ? '✅ ชนะการต่อสู้' : `⚠️ สิ้นสุด (${report.end_status})`;
    el.badgeMiniBattleStatus.style.background = isWin ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    el.badgeMiniBattleStatus.style.color = isWin ? 'var(--accent-green)' : '#f87171';
    el.badgeMiniBattleStatus.style.borderColor = isWin ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)';
  }

  const durationSec = report.cost_time || 0;
  const teamDps = durationSec > 0 ? (report.team_total_damage / durationSec) : 0;
  let totalBreakDmg = 0;
  (report.avatars || []).forEach(a => {
    totalBreakDmg += (a.total_break_damage || 0);
  });

  if (el.miniTotalDmg) el.miniTotalDmg.textContent = formatNumber(report.team_total_damage);
  if (el.miniTeamDps) el.miniTeamDps.textContent = `${formatNumber(Math.round(teamDps))}/s`;
  if (el.miniBreakDmg) el.miniBreakDmg.textContent = formatNumber(totalBreakDmg);
  if (el.miniBattleTurns) el.miniBattleTurns.textContent = `${report.total_battle_turns || 0} เทิร์น (${formatDuration(durationSec)})`;

  // Sort avatars by total damage descending
  const sortedAvatars = [...report.avatars].sort((a, b) => (b.total_damage || 0) - (a.total_damage || 0));

  el.miniBattleAvatarsList.innerHTML = sortedAvatars.map(av => {
    const meta = getAvatarInfo(av.avatar_id);
    const elemColor = ELEMENT_COLORS[meta.element] || '#38bdf8';
    const pct = Math.max(0, Math.min(100, av.damage_percent || 0));
    const iconUrl = getAvatarIconUrl(av.avatar_id);
    const rankStr = av.rank !== undefined ? `E${av.rank}` : '';
    const lvlStr = av.level ? `Lv.${av.level}` : '';
    const metaSub = [lvlStr, rankStr, translatePath(meta.path)].filter(Boolean).join(' • ');

    return `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: var(--radius-sm); padding: 0.45rem 0.65rem; transition: background 0.2s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0;">
            <img src="${iconUrl}" onerror="window.handleAvatarImgError(this, ${av.avatar_id})" style="width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid ${elemColor}; object-fit: cover; flex-shrink: 0;" alt="${meta.name}">
            <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <div style="font-size: 0.825rem; font-weight: 700; color: #fff; line-height: 1.1;">${meta.name}</div>
              <div style="font-size: 0.675rem; color: var(--text-muted);">${metaSub}</div>
            </div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <span style="font-size: 0.875rem; font-weight: 800; color: ${elemColor}; font-family: monospace;">${formatNumber(av.total_damage)}</span>
            <span style="font-size: 0.725rem; font-weight: 700; color: #fff; background: rgba(255,255,255,0.08); padding: 0.1rem 0.35rem; border-radius: 4px; margin-left: 0.35rem;">${pct.toFixed(1)}%</span>
          </div>
        </div>
        <div style="height: 5px; width: 100%; background: rgba(0,0,0,0.4); border-radius: 3px; overflow: hidden;">
          <div style="height: 100%; width: ${pct}%; background: ${elemColor}; border-radius: 3px; transition: width 0.4s ease;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTeamSynergy(lineups) {
  const currentLineup = lineups || state.statusData?.lineups || DEFAULT_LINEUP;

  // Extract active character IDs
  const activeIds = [];
  for (const slot in currentLineup) {
    const aid = parseInt(currentLineup[slot], 10);
    if (aid && aid > 0 && !activeIds.includes(aid)) {
      activeIds.push(aid);
    }
  }

  let totalLevel = 0;
  let totalEidolon = 0;
  let lcCount = 0;
  let fullRelicCount = 0;

  activeIds.forEach(aid => {
    const av = state.fullFreesrData?.avatars?.[aid];
    const lvl = av?.level || 80;
    const rank = av?.data?.rank ?? (state.avatarsList.find(a => a.avatar_id === aid)?.rank ?? 0);

    totalLevel += lvl;
    totalEidolon += rank;

    // LC check
    const hasLc = (state.fullFreesrData?.lightcones || []).some(l => l.equip_avatar === aid);
    if (hasLc) lcCount++;

    // Relics check (count how many relics equipped)
    const relCount = (state.fullFreesrData?.relics || []).filter(r => r.equip_avatar === aid).length;
    if (relCount >= 6) fullRelicCount++;
  });

  const count = activeIds.length || 1;
  const avgLevel = activeIds.length ? (totalLevel / count).toFixed(1) : '-';
  const avgEidolon = activeIds.length ? `E${(totalEidolon / count).toFixed(1)}` : '-';

  // Metrics
  if (el.synergyAvgLevel) el.synergyAvgLevel.textContent = activeIds.length ? `Lv.${avgLevel}` : '-';
  if (el.synergyAvgEidolon) el.synergyAvgEidolon.textContent = avgEidolon;
  if (el.synergyLcReady) el.synergyLcReady.textContent = activeIds.length ? `${lcCount}/${activeIds.length}` : '-';
  if (el.synergyRelicReady) el.synergyRelicReady.textContent = activeIds.length ? `${fullRelicCount}/${activeIds.length}` : '-';

  renderMiniBattleSummary();
}

// ==========================================
// GM Command Dispatcher & Live Log Console
// ==========================================
const consoleState = {
  history: [],
  historyIndex: -1,
  maxLogs: 200
};

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function logToConsole(message, tag = 'SYS') {
  if (!el.consoleTerminalLog) return;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  let tagClass = 'tag-sys';
  const upperTag = String(tag).toUpperCase();
  if (upperTag === 'CMD' || upperTag === 'GM') tagClass = 'tag-cmd';
  else if (upperTag === 'OK' || upperTag === 'SUCCESS') tagClass = 'tag-ok';
  else if (upperTag === 'ERR' || upperTag === 'ERROR') tagClass = 'tag-err';
  else if (upperTag === 'NET') tagClass = 'tag-net';

  const lineEl = document.createElement('div');
  lineEl.className = 'log-line';
  lineEl.innerHTML = `
    <span class="log-time">${timeStr}</span>
    <span class="log-tag ${tagClass}">[${escapeHtml(upperTag)}]</span>
    <span class="log-msg">${escapeHtml(message)}</span>
  `;

  el.consoleTerminalLog.appendChild(lineEl);

  // Trim excess logs if above maxLogs
  while (el.consoleTerminalLog.children.length > consoleState.maxLogs) {
    el.consoleTerminalLog.removeChild(el.consoleTerminalLog.firstChild);
  }

  // Auto scroll to bottom
  el.consoleTerminalLog.scrollTop = el.consoleTerminalLog.scrollHeight;
}

async function dispatchGMCommand(rawCmd) {
  const cmd = (rawCmd || '').trim();
  if (!cmd) return;

  // Save to history
  if (consoleState.history[consoleState.history.length - 1] !== cmd) {
    consoleState.history.push(cmd);
  }
  consoleState.historyIndex = -1;

  // Log user command
  logToConsole(cmd, 'CMD');

  // Handle local /help command immediately
  if (cmd.toLowerCase() === '/help') {
    logToConsole('คำสั่ง GM ที่พร้อมใช้งาน (Available Commands):', 'SYS');
    logToConsole('  /heal                     - ฟื้นฟู HP/Energy เต็มตัวละครในทีมทั้งหมด', 'SYS');
    logToConsole('  /max                      - อัปตัวละครทั้งหมดเป็น Lv.80, E6, Traces 10', 'SYS');
    logToConsole('  /teleport <plane> [floor] - วาร์ปไปยังฉาก/Plane ID (เช่น 20001 รถไฟ Express)', 'SYS');
    logToConsole('  /scene <plane> [floor]    - คำสั่งย่อของ /teleport', 'SYS');
    logToConsole('  /clear lineup             - ล้างตัวละครในทีมปัจจุบันทั้งหมด', 'SYS');
    logToConsole('  /avatar <id> [lvl] [rank] - ปลดล็อกหรือตั้งค่าตัวละคร (เช่น /avatar 1308 80 6)', 'SYS');
    logToConsole('  /give <id> [count]        - เพิ่มไอเทมหรือเงิน (เช่น 102 Jades, 2 Credits)', 'SYS');
    logToConsole('  /help                     - แสดงคู่มือรายการคำสั่งนี้', 'SYS');
    return;
  }

  // If server is online, try dispatching to backend
  if (state.isConnected) {
    try {
      const res = await apiCall('/api/command', 'POST', { command: cmd });
      if (res) {
        const msg = res.message || res.msg || 'คำสั่งประมวลผลสำเร็จ';
        logToConsole(msg, 'OK');

        // Command specific post-processing
        const lowerCmd = cmd.toLowerCase();
        if (lowerCmd.startsWith('/heal')) {
          showToast('ฟื้นฟู HP และ Energy เรียบร้อย', 'success');
          refreshStatus();
        } else if (lowerCmd.startsWith('/teleport') || lowerCmd.startsWith('/scene')) {
          showToast('ส่งคำสั่งเปลี่ยนฉากเรียบร้อย', 'success');
          refreshStatus();
        } else if (lowerCmd.startsWith('/clear lineup')) {
          showToast('ล้างตัวละครในทีมเรียบร้อย', 'info');
          refreshStatus();
        } else if (lowerCmd.startsWith('/max')) {
          showToast('ปรับ Max เลเวลและ Traces เรียบร้อย', 'success');
          refreshStatus();
        } else if (lowerCmd.startsWith('/give')) {
          showToast('เพิ่มไอเทม/เงินเรียบร้อย', 'success');
        } else if (lowerCmd.startsWith('/avatar')) {
          showToast('อัปเดตตัวละครเรียบร้อย', 'success');
          loadAvatars();
        }
        return;
      }
    } catch (err) {
      logToConsole(`Server Dispatcher: ${err.message} (เข้าสู่โหมด Local Fallback)`, 'NET');
    }
  }

  // Fallback to client-side local executions if server is offline or doesn't support the command
  const lowerCmd = cmd.toLowerCase();
  if (lowerCmd.startsWith('/heal')) {
    logToConsole('Local Fallback: ฟื้นฟู Energy ของตัวละครในทีมเป็น 100%', 'OK');
    if (state.fullFreesrData?.avatars) {
      for (const aid in state.fullFreesrData.avatars) {
        state.fullFreesrData.avatars[aid].sp_value = 140;
      }
      saveFreesrChangesToServer();
    }
    showToast('ฟื้นฟูพลังงานทีมเรียบร้อย', 'success');
  } else if (lowerCmd.startsWith('/max')) {
    logToConsole('Local Fallback: กำลังรัน maxAllAvatars()...', 'SYS');
    await maxAllAvatars();
    logToConsole('Local: อัปเลเวล 80 และ E6 ตัวละครทั้งหมดเรียบร้อย', 'OK');
  } else if (lowerCmd.startsWith('/clear lineup')) {
    logToConsole('Local Fallback: กำลังล้างทีม...', 'SYS');
    await quickClearLineup();
    logToConsole('Local: ล้างทีมเรียบร้อยแล้ว', 'OK');
  } else if (lowerCmd.startsWith('/teleport') || lowerCmd.startsWith('/scene')) {
    const parts = cmd.split(/\s+/);
    const planeId = parseInt(parts[1], 10) || 20001;
    const floorId = parseInt(parts[2], 10) || 1;
    logToConsole(`Local Fallback: ตั้งค่าฉากเป็น Plane ID ${planeId}, Floor ${floorId}`, 'OK');
    if (state.fullFreesrData) {
      state.fullFreesrData.scene = state.fullFreesrData.scene || {};
      state.fullFreesrData.scene.plane_id = planeId;
      state.fullFreesrData.scene.floor_id = floorId;
      saveFreesrChangesToServer();
      refreshStatus();
    }
    showToast(`เปลี่ยนฉากเป็น Plane ${planeId} เรียบร้อย`, 'success');
  } else if (lowerCmd.startsWith('/avatar')) {
    const parts = cmd.split(/\s+/);
    const aid = parseInt(parts[1], 10);
    const lvl = parseInt(parts[2], 10) || 80;
    const rank = parseInt(parts[3], 10) || 6;
    if (aid) {
      if (!state.fullFreesrData) state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
      state.fullFreesrData.avatars = state.fullFreesrData.avatars || {};
      state.fullFreesrData.avatars[aid] = {
        owner_uid: 0,
        avatar_id: aid,
        level: lvl,
        promotion: lvl > 70 ? 6 : (lvl > 60 ? 5 : 4),
        data: { rank, skills: { 1: 10, 2: 10, 3: 10, 4: 10 } }
      };
      saveFreesrChangesToServer();
      loadAvatars();
      logToConsole(`Local: ปลดล็อก/อัปเดต Avatar ID ${aid} (Lv.${lvl}, E${rank}) เรียบร้อย`, 'OK');
      showToast(`อัปเดตตัวละคร ${aid} สำเร็จ`, 'success');
    } else {
      logToConsole('รูปแบบคำสั่งไม่ถูกต้อง: /avatar <id> [level] [rank]', 'ERR');
    }
  } else if (lowerCmd.startsWith('/give')) {
    const parts = cmd.split(/\s+/);
    const itemId = parseInt(parts[1], 10);
    const count = parseInt(parts[2], 10) || 1;
    if (itemId) {
      logToConsole(`Local: ได้รับ Item ID ${itemId} จำนวน ${count.toLocaleString()}`, 'OK');
      showToast(`เพิ่มไอเทม ${itemId} x${count}`, 'success');
    } else {
      logToConsole('รูปแบบคำสั่งไม่ถูกต้อง: /give <id> [count]', 'ERR');
    }
  } else {
    logToConsole(`คำสั่งที่ไม่รู้จักหรือไม่รองรับในโหมดออฟไลน์: "${cmd}" (พิมพ์ /help เพื่อดูคำสั่ง)`, 'ERR');
  }
}

function setupGMConsoleEvents() {
  if (el.formConsoleCmd) {
    el.formConsoleCmd.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!el.consoleCmdInput) return;
      const cmd = el.consoleCmdInput.value.trim();
      if (!cmd) return;
      el.consoleCmdInput.value = '';
      dispatchGMCommand(cmd);
    });
  }

  // Key navigation in console input
  if (el.consoleCmdInput) {
    el.consoleCmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (consoleState.history.length === 0) return;
        if (consoleState.historyIndex === -1) {
          consoleState.historyIndex = consoleState.history.length - 1;
        } else if (consoleState.historyIndex > 0) {
          consoleState.historyIndex--;
        }
        el.consoleCmdInput.value = consoleState.history[consoleState.historyIndex] || '';
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (consoleState.history.length === 0 || consoleState.historyIndex === -1) return;
        if (consoleState.historyIndex < consoleState.history.length - 1) {
          consoleState.historyIndex++;
          el.consoleCmdInput.value = consoleState.history[consoleState.historyIndex];
        } else {
          consoleState.historyIndex = -1;
          el.consoleCmdInput.value = '';
        }
      }
    });
  }

  // Quick pill buttons
  document.querySelectorAll('.console-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) {
        if (el.consoleCmdInput) el.consoleCmdInput.value = cmd;
        dispatchGMCommand(cmd);
      }
    });
  });

  // Copy Log button
  if (el.btnConsoleCopyLog) {
    el.btnConsoleCopyLog.addEventListener('click', () => {
      if (!el.consoleTerminalLog) return;
      const text = el.consoleTerminalLog.innerText || el.consoleTerminalLog.textContent;
      navigator.clipboard?.writeText(text).then(() => {
        showToast(t('consoleLogCopied'), 'success');
      }).catch(() => {
        showToast(t('consoleLogCopyFailed'), 'error');
      });
    });
  }

  // Clear Log button
  if (el.btnConsoleClearLog) {
    el.btnConsoleClearLog.addEventListener('click', () => {
      if (el.consoleTerminalLog) {
        el.consoleTerminalLog.innerHTML = '';
        logToConsole(t('consoleLogCleared'), 'SYS');
      }
    });
  }

  // Initial greeting
  logToConsole(t('consoleReady') || 'GaC Server Console is ready (type /help for available commands)', 'SYS');
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
             src="${getAvatarIconSrc(item.avatar_id)}"
             onerror="handleAvatarImgError(this, ${item.avatar_id})"
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

    await saveLineupToServer(lineups);

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

  // Sync from cached / in-memory freesr data first
  if (state.fullFreesrData?.avatars) {
    for (const aid in state.fullFreesrData.avatars) {
      const serverAv = state.fullFreesrData.avatars[aid];
      const found = state.avatarsList.find(a => a.avatar_id === parseInt(aid, 10));
      if (found) {
        found.level = serverAv.level || 80;
        found.promotion = serverAv.promotion || 6;
        found.rank = serverAv.data?.rank ?? 6;
      }
    }
  }

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
               src="${getAvatarIconSrc(item.avatar_id)}"
               onerror="handleAvatarImgError(this, ${item.avatar_id})"
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
      </div>
    `;

    // Clicking card opens full character build modal
    card.addEventListener('click', () => {
      openAvatarDetailModal(item);
    });

    el.avatarsGrid.appendChild(card);
  });
}

// Quick Set Single Avatar to E0S1 (Lv 80 + Prom 6 + E0 + Max Skills + S1 Signature Light Cone)
async function setAvatarE0S1(avatarId) {
  const aid = parseInt(avatarId, 10);
  const meta = getAvatarInfo(aid);
  const target = state.avatarsList.find(a => a.avatar_id === aid);
  if (target) {
    target.level = 80;
    target.promotion = 6;
    target.rank = 0;
  }
  if (!state.fullFreesrData) {
    state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
  }
  state.fullFreesrData.avatars = state.fullFreesrData.avatars || {};
  state.fullFreesrData.lightcones = state.fullFreesrData.lightcones || [];

  if (!state.fullFreesrData.avatars[aid]) {
    state.fullFreesrData.avatars[aid] = {
      owner_uid: 0,
      avatar_id: aid,
      level: 80,
      promotion: 6,
      techniques: [],
      sp_max: 140,
      sp_value: 70,
      data: { rank: 0, skills: {}, skills_by_anchor_type: {} }
    };
  }
  const av = state.fullFreesrData.avatars[aid];
  av.level = 80;
  av.promotion = 6;
  av.data = av.data || {};
  av.data.rank = 0;
  av.data.skills = {
    [`${aid}001`]: 6,
    [`${aid}002`]: 10,
    [`${aid}003`]: 10,
    [`${aid}004`]: 10,
    [`${aid}007`]: 1,
    [`${aid}101`]: 1,
    [`${aid}102`]: 1,
    [`${aid}103`]: 1
  };
  av.data.skills_by_anchor_type = {
    "1": 6, "2": 10, "3": 10, "4": 10, "5": 1, "6": 1, "7": 1, "8": 1, "9": 1
  };

  const lcId = SIGNATURE_LIGHTCONES[aid] || 21001;

  let existingLc = state.fullFreesrData.lightcones.find(lc => lc.equip_avatar === aid);
  if (existingLc) {
    existingLc.item_id = lcId;
    existingLc.level = 80;
    existingLc.promotion = 6;
    existingLc.rank = 1;
  } else {
    const maxUid = state.fullFreesrData.lightcones.reduce((m, lc) => Math.max(m, lc.internal_uid || 0), 0);
    state.fullFreesrData.lightcones.push({
      internal_uid: maxUid + 1,
      item_id: lcId,
      level: 80,
      promotion: 6,
      rank: 1,
      equip_avatar: aid
    });
  }

  // Equip optimal relics
  await autoEquipRecommendedRelics(aid, false);

  renderAvatarsGrid();
  loadEquipment();

  if (state.isConnected) {
    try {
      if (state.serverMode === 'gac') {
        await apiCall('/api/avatar/rank', 'POST', { avatar_id: aid, rank: 0 });
        await apiCall('/api/freesr/avatars', 'POST', { avatar_id: aid, level: 80, promotion: 6, rank: 0 });
      } else {
        await saveFreesrChangesToServer();
      }
    } catch (e) {
      console.warn('Sync E0S1 failed:', e);
    }
  }

  if (state.selectedAvatarDetail?.avatar_id === aid) {
    openAvatarDetailModal(target || { avatar_id: aid, level: 80, promotion: 6, rank: 0 });
  }
  showToast(`ตั้งค่า ${meta.name} เป็น E0S1 เรียบร้อยแล้ว!`, 'success');
}

// Quick Set Single Avatar to E6S5 (Lv 80 + Prom 6 + E6 + Max Skills + S5 Signature Light Cone)
async function setAvatarE6S5(avatarId) {
  const aid = parseInt(avatarId, 10);
  const meta = getAvatarInfo(aid);
  const target = state.avatarsList.find(a => a.avatar_id === aid);
  if (target) {
    target.level = 80;
    target.promotion = 6;
    target.rank = 6;
  }
  if (!state.fullFreesrData) {
    state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
  }
  state.fullFreesrData.avatars = state.fullFreesrData.avatars || {};
  state.fullFreesrData.lightcones = state.fullFreesrData.lightcones || [];

  if (!state.fullFreesrData.avatars[aid]) {
    state.fullFreesrData.avatars[aid] = {
      owner_uid: 0,
      avatar_id: aid,
      level: 80,
      promotion: 6,
      techniques: [],
      sp_max: 140,
      sp_value: 70,
      data: { rank: 6, skills: {}, skills_by_anchor_type: {} }
    };
  }
  const av = state.fullFreesrData.avatars[aid];
  av.level = 80;
  av.promotion = 6;
  av.data = av.data || {};
  av.data.rank = 6;
  av.data.skills = {
    [`${aid}001`]: 6,
    [`${aid}002`]: 10,
    [`${aid}003`]: 10,
    [`${aid}004`]: 10,
    [`${aid}007`]: 1,
    [`${aid}101`]: 1,
    [`${aid}102`]: 1,
    [`${aid}103`]: 1
  };
  av.data.skills_by_anchor_type = {
    "1": 6, "2": 10, "3": 10, "4": 10, "5": 1, "6": 1, "7": 1, "8": 1, "9": 1
  };

  const lcId = SIGNATURE_LIGHTCONES[aid] || 21001;

  let existingLc = state.fullFreesrData.lightcones.find(lc => lc.equip_avatar === aid);
  if (existingLc) {
    existingLc.item_id = lcId;
    existingLc.level = 80;
    existingLc.promotion = 6;
    existingLc.rank = 5;
  } else {
    const maxUid = state.fullFreesrData.lightcones.reduce((m, lc) => Math.max(m, lc.internal_uid || 0), 0);
    state.fullFreesrData.lightcones.push({
      internal_uid: maxUid + 1,
      item_id: lcId,
      level: 80,
      promotion: 6,
      rank: 5,
      equip_avatar: aid
    });
  }

  // Equip optimal relics
  await autoEquipRecommendedRelics(aid, false);

  renderAvatarsGrid();
  loadEquipment();

  if (state.isConnected) {
    try {
      if (state.serverMode === 'gac') {
        await apiCall('/api/avatar/rank', 'POST', { avatar_id: aid, rank: 6 });
        await apiCall('/api/freesr/avatars', 'POST', { avatar_id: aid, level: 80, promotion: 6, rank: 6 });
      } else {
        await saveFreesrChangesToServer();
      }
    } catch (e) {
      console.warn('Sync E6S5 failed:', e);
    }
  }

  if (state.selectedAvatarDetail?.avatar_id === aid) {
    openAvatarDetailModal(target || { avatar_id: aid, level: 80, promotion: 6, rank: 6 });
  }
  showToast(`ตั้งค่า ${meta.name} เป็น E6S5 เต็มพลังเรียบร้อยแล้ว!`, 'success');
}

// Quick Max Single Avatar (Lv 80 + Prom 6 + E6 + Max Traces)
async function maxSingleAvatar(avatarId) {
  await setAvatarE6S5(avatarId);
}

// Active Lightcone Superimposition Rank in Modal (1 - 5)
let selectedLcRank = 5;

// Modal Sub-tabs Handler
// Authoritative Signature / Best-in-Slot Light Cones dictionary for all characters
const SIGNATURE_LIGHTCONES = {
  1001: 21001, // March 7th -> Day One of My New Life
  1002: 21000, // Dan Heng -> Only Silence Remains
  1003: 23000, // Himeko -> Night on the Milky Way
  1004: 23004, // Welt -> In the Name of the World
  1005: 23006, // Kafka -> Patience Is All You Need
  1006: 23007, // Silver Wolf -> Incessant Rain
  1008: 21007, // Arlan -> A Secret Vow
  1009: 21021, // Asta -> Dance! Dance! Dance!
  1013: 24004, // Herta -> Eternal Calculus
  1014: 24000, // Saber -> On the Fall of an Aeon
  1015: 24001, // Archer -> Cruising in the Stellar Sea
  1101: 23003, // Bronya -> But the Battle Isn't Over
  1102: 23001, // Seele -> In the Night
  1103: 21009, // Serval -> Make the World Clamor
  1104: 23005, // Gepard -> Moment of Victory
  1105: 21010, // Natasha -> Post-Op Conversation
  1106: 22000, // Pela -> Before the Tutorial Mission Starts (BiS standard)
  1107: 23002, // Clara -> Something Irreplaceable
  1108: 21011, // Sampo -> Eyes of the Prey
  1109: 21012, // Hook -> The Moles Welcome You
  1110: 21010, // Lynx -> Post-Op Conversation
  1111: 21014, // Luka -> Resolution Shines As Pearls of Sweat
  1112: 23016, // Topaz -> Worrisome, Blissful
  1201: 21015, // Qingque -> Today Is Another Peaceful Day
  1202: 21021, // Tingyun -> Dance! Dance! Dance!
  1203: 23008, // Luocha -> Echoes of the Coffin
  1204: 23010, // Jing Yuan -> Before Dawn
  1205: 23009, // Blade -> The Unreachable Side
  1206: 21017, // Sushang -> Swordplay
  1207: 21018, // Yukong -> Past and Future
  1208: 23011, // Fu Xuan -> She Already Shut Her Eyes
  1209: 23012, // Yanqing -> Sleep Like the Dead
  1210: 21011, // Guinaifen -> Eyes of the Prey
  1211: 23013, // Bailu -> Time Waits for No One
  1212: 23014, // Jingliu -> I Shall Be My Own Sword
  1213: 23015, // Dan Heng IL -> Brighter Than the Sun
  1214: 21035, // Xueyi -> Indelible Promise
  1215: 21021, // Hanya -> Dance! Dance! Dance!
  1217: 23017, // Huohuo -> Night of Fright
  1218: 23029, // Jiaoqiu -> Those Many Springs
  1220: 23031, // Feixiao -> I Venture Forth to Hunt
  1221: 23030, // Yunli -> Dance at Sunset
  1222: 23032, // Lingsha -> Scent Alone Stays True
  1223: 21017, // Moze -> Swordplay
  1224: 21017, // March 7th (Hunt) -> Swordplay
  1225: 23035, // Fugue -> Long Road Leads Home
  1301: 21022, // Gallagher -> What Is Real?
  1302: 23018, // Argenti -> An Instant Before A Gaze
  1303: 23019, // Ruan Mei -> Past Self in Mirror
  1304: 23023, // Aventurine -> Inherently Unjust Destiny
  1305: 23020, // Dr. Ratio -> Baptism of Pure Thought
  1306: 23021, // Sparkle -> Earthly Escapade
  1307: 23022, // Black Swan -> Reforged Remembrance
  1308: 23024, // Acheron -> Along the Passing Shore
  1309: 23026, // Robin -> Flowing Nightglow
  1310: 23025, // Firefly -> Whereabouts Should Dreams Rest
  1312: 21035, // Misha -> Indelible Promise
  1313: 23034, // Sunday -> A Grounded Ascent
  1314: 23028, // Jade -> Yet Hope Is Priceless
  1315: 23027, // Boothill -> Sailing Towards a Second Life
  1317: 23033, // Rappa -> Ninjutsu Inscription: Dazzling Evilbreaker
  1321: 23022, // The Dahlia -> Reforged Remembrance
  1401: 23037, // The Herta -> Into the Unreachable Veil
  1402: 23036, // Aglaea -> Time Woven into Gold
  1403: 23038, // Tribbie -> If Time Were a Flower
  1404: 23039, // Mydei -> Flame of Blood, Blaze My Path
  1405: 23041, // Anaxa -> Life Should Be Cast to Flames
  1406: 23022, // Cipher
  1407: 23040, // Castorice -> Make Farewells More Beautiful
  1408: 23042, // Phainon
  1511: 23065, // Aeon ★ Aha -> Upon the First Echo of "Aha"
  8001: 24000, // Trailblazer Male Destruction -> On the Fall of an Aeon
  8002: 24000, // Trailblazer Female Destruction
  8003: 24002, // Trailblazer Male Preservation -> Texture of Memories
  8004: 24002, // Trailblazer Female Preservation
  8005: 21016, // Trailblazer Male Harmony -> Memories of the Past
  8006: 21016, // Trailblazer Female Harmony
  8007: 21040, // Trailblazer Remembrance
  8008: 21040
};

// Comprehensive Meta Optimal Relic Builds (Cavern, Planar, Main Affixes & Top Substats)
// Substats ID reference:
// 1: Flat HP, 2: Flat ATK, 3: Flat DEF, 4: HP%, 5: ATK%, 6: DEF%
// 7: SPD, 8: CRIT Rate%, 9: CRIT DMG%, 10: EHR%, 11: Effect RES%, 12: Break Effect%
const CHARACTER_OPTIMAL_BUILDS = {
  1308: { cavern: 117, planar: 313, body: 4, feet: 2, sphere: 7, rope: 4, substats: [8, 9, 7, 5] }, // Acheron
  1310: { cavern: 119, planar: 315, body: 2, feet: 4, sphere: 2, rope: 1, substats: [12, 7, 5, 11] }, // Firefly
  1220: { cavern: 120, planar: 314, body: 4, feet: 4, sphere: 8, rope: 4, substats: [8, 9, 7, 5] }, // Feixiao
  1315: { cavern: 119, planar: 305, body: 4, feet: 4, sphere: 4, rope: 1, substats: [12, 7, 8, 9] }, // Boothill
  1221: { cavern: 120, planar: 314, body: 4, feet: 2, sphere: 4, rope: 4, substats: [8, 9, 5, 1] }, // Yunli
  1313: { cavern: 121, planar: 316, body: 5, feet: 4, sphere: 1, rope: 2, substats: [9, 7, 11, 4] }, // Sunday
  1401: { cavern: 122, planar: 317, body: 4, feet: 2, sphere: 6, rope: 4, substats: [8, 9, 5, 7] }, // The Herta
  1106: { cavern: 110, planar: 312, body: 7, feet: 4, sphere: 1, rope: 2, substats: [7, 10, 11, 4] }, // Pela
  1006: { cavern: 117, planar: 312, body: 7, feet: 4, sphere: 9, rope: 2, substats: [7, 10, 8, 9] }, // Silver Wolf
  1303: { cavern: 118, planar: 307, body: 1, feet: 4, sphere: 1, rope: 2, substats: [12, 7, 11, 4] }, // Ruan Mei
  1309: { cavern: 114, planar: 316, body: 2, feet: 2, sphere: 4, rope: 2, substats: [5, 7, 11, 4] }, // Robin
  1306: { cavern: 114, planar: 310, body: 5, feet: 4, sphere: 1, rope: 2, substats: [9, 7, 11, 4] }, // Sparkle
  1101: { cavern: 114, planar: 310, body: 5, feet: 4, sphere: 8, rope: 2, substats: [9, 7, 11, 6] }, // Bronya
  1202: { cavern: 114, planar: 307, body: 2, feet: 4, sphere: 2, rope: 2, substats: [7, 5, 11, 4] }, // Tingyun
  1304: { cavern: 103, planar: 314, body: 5, feet: 4, sphere: 10, rope: 5, substats: [6, 9, 8, 7] }, // Aventurine
  1208: { cavern: 113, planar: 302, body: 1, feet: 4, sphere: 1, rope: 2, substats: [7, 4, 6, 11] }, // Fu Xuan
  1217: { cavern: 101, planar: 302, body: 6, feet: 4, sphere: 1, rope: 2, substats: [7, 4, 11, 6] }, // Huohuo
  1222: { cavern: 119, planar: 315, body: 6, feet: 4, sphere: 2, rope: 2, substats: [12, 7, 5, 11] }, // Lingsha
  1301: { cavern: 119, planar: 315, body: 6, feet: 4, sphere: 1, rope: 2, substats: [12, 7, 11, 4] }, // Gallagher
  1203: { cavern: 101, planar: 302, body: 6, feet: 4, sphere: 2, rope: 2, substats: [7, 5, 11, 4] }, // Luocha
  1005: { cavern: 116, planar: 311, body: 2, feet: 4, sphere: 7, rope: 4, substats: [7, 5, 10, 12] }, // Kafka
  1307: { cavern: 116, planar: 308, body: 7, feet: 4, sphere: 8, rope: 4, substats: [10, 7, 5, 12] }, // Black Swan
  1218: { cavern: 116, planar: 308, body: 7, feet: 4, sphere: 5, rope: 2, substats: [10, 7, 11, 5] }, // Jiaoqiu
  1212: { cavern: 104, planar: 309, body: 5, feet: 4, sphere: 6, rope: 4, substats: [9, 8, 7, 5] }, // Jingliu
  1213: { cavern: 102, planar: 309, body: 4, feet: 2, sphere: 10, rope: 4, substats: [8, 9, 5, 7] }, // Dan Heng IL
  1305: { cavern: 117, planar: 314, body: 4, feet: 4, sphere: 10, rope: 4, substats: [8, 9, 7, 5] }, // Dr. Ratio
  1112: { cavern: 115, planar: 314, body: 4, feet: 4, sphere: 5, rope: 4, substats: [8, 9, 7, 5] }, // Topaz
  1314: { cavern: 115, planar: 314, body: 4, feet: 2, sphere: 9, rope: 4, substats: [8, 9, 5, 7] }, // Jade
  1317: { cavern: 119, planar: 315, body: 2, feet: 4, sphere: 10, rope: 1, substats: [12, 7, 5, 11] }, // Rappa
  1225: { cavern: 119, planar: 315, body: 7, feet: 4, sphere: 5, rope: 1, substats: [12, 7, 10, 11] }, // Fugue
  1402: { cavern: 120, planar: 314, body: 4, feet: 4, sphere: 7, rope: 4, substats: [8, 9, 7, 5] }, // Aglaea
  1407: { cavern: 122, planar: 317, body: 4, feet: 4, sphere: 9, rope: 4, substats: [8, 9, 7, 5] }, // Castorice
  1405: { cavern: 122, planar: 317, body: 4, feet: 4, sphere: 8, rope: 4, substats: [8, 9, 7, 5] }, // Anaxa
  1403: { cavern: 122, planar: 317, body: 4, feet: 4, sphere: 9, rope: 2, substats: [8, 9, 7, 4] }, // Tribbie
  1404: { cavern: 120, planar: 314, body: 4, feet: 4, sphere: 10, rope: 4, substats: [8, 9, 7, 5] }, // Mydei
  1102: { cavern: 108, planar: 309, body: 4, feet: 2, sphere: 9, rope: 4, substats: [8, 9, 5, 7] }, // Seele
  1204: { cavern: 115, planar: 306, body: 4, feet: 2, sphere: 7, rope: 4, substats: [8, 9, 5, 7] }, // Jing Yuan
  1205: { cavern: 113, planar: 306, body: 4, feet: 1, sphere: 8, rope: 3, substats: [8, 9, 4, 7] }, // Blade
  1302: { cavern: 106, planar: 306, body: 5, feet: 4, sphere: 4, rope: 2, substats: [8, 9, 7, 5] }, // Argenti
  1107: { cavern: 106, planar: 314, body: 4, feet: 2, sphere: 4, rope: 4, substats: [8, 9, 5, 1] }, // Clara
  1003: { cavern: 115, planar: 306, body: 4, feet: 2, sphere: 5, rope: 4, substats: [8, 9, 5, 7] }, // Himeko
  1004: { cavern: 117, planar: 308, body: 4, feet: 4, sphere: 10, rope: 4, substats: [8, 9, 7, 10] }, // Welt
  1104: { cavern: 103, planar: 304, body: 3, feet: 4, sphere: 3, rope: 2, substats: [6, 7, 11, 10] }, // Gepard
  1211: { cavern: 101, planar: 302, body: 6, feet: 4, sphere: 1, rope: 2, substats: [7, 4, 11, 6] }, // Bailu
  1209: { cavern: 104, planar: 306, body: 5, feet: 4, sphere: 6, rope: 4, substats: [9, 8, 7, 5] }, // Yanqing
  1013: { cavern: 115, planar: 306, body: 4, feet: 2, sphere: 6, rope: 4, substats: [8, 9, 5, 7] }, // Herta
  1224: { cavern: 102, planar: 314, body: 4, feet: 4, sphere: 10, rope: 4, substats: [8, 9, 7, 5] }, // March 7th (Hunt)
  8005: { cavern: 118, planar: 305, body: 1, feet: 4, sphere: 1, rope: 2, substats: [12, 7, 11, 4] }, // TB Harmony (M)
  8006: { cavern: 118, planar: 305, body: 1, feet: 4, sphere: 1, rope: 2, substats: [12, 7, 11, 4] }, // TB Harmony (F)
  8007: { cavern: 121, planar: 316, body: 5, feet: 4, sphere: 1, rope: 2, substats: [9, 7, 11, 4] }, // TB Remembrance
  8008: { cavern: 121, planar: 316, body: 5, feet: 4, sphere: 1, rope: 2, substats: [9, 7, 11, 4] },
  1223: { cavern: 117, planar: 314, body: 4, feet: 2, sphere: 7, rope: 4, substats: [8, 9, 5, 7] }, // Moze
  1201: { cavern: 108, planar: 309, body: 4, feet: 4, sphere: 9, rope: 4, substats: [8, 9, 5, 7] }, // Qingque
  1214: { cavern: 119, planar: 305, body: 4, feet: 4, sphere: 9, rope: 1, substats: [12, 8, 9, 7] }, // Xueyi
  1210: { cavern: 116, planar: 311, body: 2, feet: 4, sphere: 5, rope: 4, substats: [10, 7, 5, 12] }, // Guinaifen
  1111: { cavern: 106, planar: 311, body: 2, feet: 4, sphere: 4, rope: 4, substats: [7, 5, 10, 12] }, // Luka
  1108: { cavern: 116, planar: 308, body: 2, feet: 4, sphere: 8, rope: 4, substats: [10, 7, 5, 12] }, // Sampo
  1103: { cavern: 112, planar: 306, body: 4, feet: 4, sphere: 7, rope: 4, substats: [8, 9, 7, 5] }, // Serval
  1002: { cavern: 110, planar: 309, body: 4, feet: 4, sphere: 8, rope: 4, substats: [8, 9, 7, 5] }, // Dan Heng
  1206: { cavern: 106, planar: 309, body: 4, feet: 4, sphere: 4, rope: 4, substats: [8, 9, 7, 12] }, // Sushang
  1109: { cavern: 109, planar: 306, body: 4, feet: 2, sphere: 5, rope: 4, substats: [8, 9, 5, 7] }, // Hook
  1008: { cavern: 113, planar: 306, body: 4, feet: 4, sphere: 7, rope: 4, substats: [8, 9, 5, 7] }, // Arlan
  1110: { cavern: 101, planar: 302, body: 6, feet: 4, sphere: 1, rope: 2, substats: [7, 4, 11, 6] }, // Lynx
  1105: { cavern: 101, planar: 302, body: 6, feet: 4, sphere: 1, rope: 2, substats: [7, 4, 11, 6] }, // Natasha
  1215: { cavern: 114, planar: 310, body: 1, feet: 4, sphere: 1, rope: 2, substats: [7, 4, 11, 6] }, // Hanya
  1207: { cavern: 114, planar: 310, body: 4, feet: 4, sphere: 10, rope: 2, substats: [7, 8, 9, 11] }, // Yukong
  1009: { cavern: 114, planar: 302, body: 1, feet: 4, sphere: 1, rope: 2, substats: [7, 4, 11, 6] }, // Asta
  1312: { cavern: 104, planar: 306, body: 4, feet: 4, sphere: 6, rope: 4, substats: [8, 9, 7, 5] } // Misha
};

function getOptimalBuildForAvatar(avatarId) {
  const aid = parseInt(avatarId, 10);
  if (CHARACTER_OPTIMAL_BUILDS[aid]) {
    return CHARACTER_OPTIMAL_BUILDS[aid];
  }
  const meta = getAvatarInfo(aid);
  const elem = normalizeElement(meta.rawElement || meta.element);
  const path = normalizePath(meta.rawPath || meta.path);

  const elemAffixMap = {
    Physical: 4, Fire: 5, Ice: 6, Lightning: 7, Thunder: 7, Wind: 8, Quantum: 9, Imaginary: 10
  };
  const sphereAffix = elemAffixMap[elem] || 2;

  if (path === 'Destruction') {
    return { cavern: 119, planar: 314, body: 4, feet: 4, sphere: sphereAffix, rope: 4, substats: [8, 9, 7, 5] };
  } else if (path === 'Hunt') {
    return { cavern: 120, planar: 314, body: 4, feet: 4, sphere: sphereAffix, rope: 4, substats: [8, 9, 7, 5] };
  } else if (path === 'Erudition') {
    return { cavern: 115, planar: 306, body: 4, feet: 2, sphere: sphereAffix, rope: 4, substats: [8, 9, 5, 7] };
  } else if (path === 'Harmony') {
    return { cavern: 114, planar: 310, body: 1, feet: 4, sphere: 1, rope: 2, substats: [7, 11, 4, 6] };
  } else if (path === 'Nihility') {
    if (['Fire', 'Wind'].includes(elem)) {
      return { cavern: 116, planar: 311, body: 2, feet: 4, sphere: sphereAffix, rope: 4, substats: [7, 5, 10, 12] };
    }
    return { cavern: 110, planar: 312, body: 7, feet: 4, sphere: sphereAffix, rope: 2, substats: [7, 10, 11, 4] };
  } else if (path === 'Preservation') {
    return { cavern: 103, planar: 304, body: 3, feet: 4, sphere: 3, rope: 5, substats: [6, 7, 11, 4] };
  } else if (path === 'Abundance') {
    return { cavern: 101, planar: 302, body: 6, feet: 4, sphere: 1, rope: 2, substats: [7, 4, 11, 6] };
  } else if (path === 'Remembrance') {
    return { cavern: 121, planar: 316, body: 4, feet: 4, sphere: sphereAffix, rope: 2, substats: [8, 9, 7, 11] };
  }
  return { cavern: 120, planar: 314, body: 4, feet: 4, sphere: sphereAffix, rope: 4, substats: [8, 9, 7, 5] };
}

// Recommended Relic Builds by Path (Fallback summary)
const RECOMMENDED_RELIC_BUILDS = {
  Preservation: { cavern: 103, planar: 304, name: "Knight of Purity (4) + Belobog (2)" },
  Abundance: { cavern: 101, planar: 302, name: "Passerby (4) + Fleet (2)" },
  Harmony: { cavern: 114, planar: 310, name: "Messenger (4) + Broken Keel (2)" },
  Nihility: { cavern: 110, planar: 312, name: "Eagle (4) + Penacony (2)" },
  Hunt: { cavern: 120, planar: 314, name: "Valorous (4) + Duran (2)" },
  Destruction: { cavern: 119, planar: 315, name: "Iron Cavalry (4) + Kalpagni (2)" },
  Erudition: { cavern: 115, planar: 306, name: "Grand Duke (4) + Inert Salsotto (2)" },
  Remembrance: { cavern: 121, planar: 316, name: "Sacerdos (4) + Lushaka (2)" },
  Elation: { cavern: 115, planar: 306, name: "Grand Duke (4) + Inert Salsotto (2)" }
};

// Lightcone Art URL Resolvers (Metadata -> Gachabase CDN -> Local asset -> StarRailRes)
function getLightconeArtSrc(lcId) {
  const id = parseInt(lcId, 10);
  const meta = LIGHTCONE_METADATA[id];
  if (meta?.images?.fullArt) return meta.images.fullArt;
  if (meta?.images?.thumbnail) return meta.images.thumbnail;
  if (GACHABASE_IMAGE_CACHE.lightcones[id]) return GACHABASE_IMAGE_CACHE.lightcones[id];
  if (KNOWN_GACHABASE_ASSETS.lightcones[id]) return KNOWN_GACHABASE_ASSETS.lightcones[id];
  if (id === 23065) {
    return './assets/lightcones/23065.png';
  }
  return `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/light_cone_preview/${id}.png`;
}

function getLightconeArtFallback(lcId) {
  const id = parseInt(lcId, 10);
  const meta = LIGHTCONE_METADATA[id];
  if (meta?.images?.thumbnail) return meta.images.thumbnail;
  if (meta?.images?.fullArt) return meta.images.fullArt;
  if (GACHABASE_IMAGE_CACHE.lightconeThumbs[id]) return GACHABASE_IMAGE_CACHE.lightconeThumbs[id];
  if (KNOWN_GACHABASE_ASSETS.lightconeThumbs[id]) return KNOWN_GACHABASE_ASSETS.lightconeThumbs[id];
  if (GACHABASE_IMAGE_CACHE.lightcones[id]) return GACHABASE_IMAGE_CACHE.lightcones[id];
  if (KNOWN_GACHABASE_ASSETS.lightcones[id]) return KNOWN_GACHABASE_ASSETS.lightcones[id];
  if (id === 23065) {
    return 'https://cdn.gachabase.net/hsr/assets/500cfc18698932759756f6b3ba4db417.png';
  }
  return `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/light_cone_preview/${id}.png`;
}

function getAvatarIconSrc(aid) {
  const id = parseInt(aid, 10);
  const meta = AVATAR_METADATA[id];
  if (meta?.images?.icon) return meta.images.icon;
  if (meta?.images?.square) return meta.images.square;
  if (GACHABASE_IMAGE_CACHE.avatars[id]) return GACHABASE_IMAGE_CACHE.avatars[id];
  if (KNOWN_GACHABASE_ASSETS.avatars[id]) return KNOWN_GACHABASE_ASSETS.avatars[id];
  return `./assets/avatars/${id}.png`;
}

function getAvatarSplashSrc(aid) {
  const id = parseInt(aid, 10);
  const meta = AVATAR_METADATA[id];
  if (meta?.images?.splash) return meta.images.splash;
  if (meta?.images?.fullArt) return meta.images.fullArt;
  if (GACHABASE_IMAGE_CACHE.avatarSplash[id]) return GACHABASE_IMAGE_CACHE.avatarSplash[id];
  if (KNOWN_GACHABASE_ASSETS.avatarSplash[id]) return KNOWN_GACHABASE_ASSETS.avatarSplash[id];
  return `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/character_portrait/${id}.png`;
}


// Modal Sub-tabs Handler
function switchModalSubtab(targetId) {
  const tabBtns = document.querySelectorAll('.modal-subtab-btn');
  tabBtns.forEach(b => {
    if (b.getAttribute('data-modaltab') === targetId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  document.querySelectorAll('.modal-subtab-content').forEach(c => {
    if (c.id === targetId) {
      c.style.display = 'block';
      c.classList.add('active');
    } else {
      c.style.display = 'none';
      c.classList.remove('active');
    }
  });
  if (state.selectedAvatarDetail) {
    const aid = state.selectedAvatarDetail.avatar_id;
    if (targetId === 'modaltab-showcase') {
      renderShowcaseCard(aid);
    } else if (targetId === 'modaltab-overview') {
      renderModalOverviewTab(aid);
    } else if (targetId === 'modaltab-relics') {
      renderModalRelicsTab(aid);
    } else if (targetId === 'modaltab-skills') {
      renderModalSkillsTab(aid);
    }
  }
}

function setupModalSubtabs() {
  const tabBtns = document.querySelectorAll('.modal-subtab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-modaltab');
      switchModalSubtab(targetId);
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
    23065: `ทำให้ความเร็วพื้นฐานของผู้สวมใส่เพิ่มขึ้น <strong>${12 + (r - 1) * 3}</strong> เมื่อใช้สกิลการต่อสู้กับเพื่อนร่วมทีม 1 ตัว จะได้รับ "Punchline" 10 แต้ม (เกิดได้สูงสุด 1 ครั้งทุกๆ 1 เทิร์น) และทำให้เพื่อนร่วมทีมทั้งหมดเมิน DEF ศัตรู <strong>${16 + (r - 1) * 4}%</strong> เมื่อสร้าง DMG ในการต่อสู้นี้ (ไม่ซ้อนทับ)`,
    24001: `เมื่อผู้สวมใส่โจมตี จะเพิ่ม ATK <strong>${8 + (r - 1) * 2}%</strong> สูงสุด 4 ชั้น และเมื่อทำลายจุดอ่อนศัตรู จะเพิ่ม DMG <strong>${12 + (r - 1) * 3}%</strong> เป็นเวลา 2 เทิร์น`
  };

  if (passives[id]) return passives[id];

  const meta = LIGHTCONE_METADATA[id];
  if (meta?.desc) return meta.desc;
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
    const primarySrc = getLightconeArtSrc(id);
    const fallbackSrc = getLightconeArtFallback(id);
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

    if (normalizePath(meta.path) === normalizePath(avatarPath)) {
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

// Slot full definitions for relics
const SLOT_NAMES_FULL = {
  1: { name: "ส่วนหัว (Head)", icon: "🧢", defaultStat: "HP (Flat)" },
  2: { name: "ส่วนมือ (Hands)", icon: "🧤", defaultStat: "ATK (Flat)" },
  3: { name: "ส่วนลำตัว (Body)", icon: "🦺", defaultStat: "CRIT Rate / DMG" },
  4: { name: "ส่วนเท้า (Feet)", icon: "👢", defaultStat: "SPD / ATK%" },
  5: { name: "ลูกแก้ว (Planar Sphere)", icon: "🔮", defaultStat: "Elemental DMG%" },
  6: { name: "สร้อยเชื่อม (Link Rope)", icon: "🔗", defaultStat: "ERR / Break / ATK%" }
};

function getRelicMainAffixName(slot, affixId) {
  const affixesBySlot = {
    1: { 1: "HP (Flat)" },
    2: { 1: "ATK (Flat)" },
    3: { 1: "HP%", 2: "ATK%", 3: "DEF%", 4: "CRIT Rate%", 5: "CRIT DMG%", 6: "Healing Boost%", 7: "Effect Hit Rate%" },
    4: { 1: "HP%", 2: "ATK%", 3: "DEF%", 4: "SPD" },
    5: { 1: "HP%", 2: "ATK%", 3: "DEF%", 4: "Physical DMG%", 5: "Fire DMG%", 6: "Ice DMG%", 7: "Lightning DMG%", 8: "Wind DMG%", 9: "Quantum DMG%", 10: "Imaginary DMG%" },
    6: { 1: "Break Effect%", 2: "Energy Regen Rate%", 3: "HP%", 4: "ATK%", 5: "DEF%" }
  };
  return affixesBySlot[slot]?.[affixId] || `Main Affix ${affixId}`;
}

function getRelicSubAffixName(affixId) {
  const map = {
    1: "HP (Flat)",
    2: "ATK (Flat)",
    3: "DEF (Flat)",
    4: "HP%",
    5: "ATK%",
    6: "DEF%",
    7: "SPD",
    8: "CRIT Rate%",
    9: "CRIT DMG%",
    10: "Effect Hit Rate%",
    11: "Effect RES%",
    12: "Break Effect%"
  };
  return map[affixId] || `Sub Affix ${affixId}`;
}

export const RELIC_SUBSTATS_CONFIG = [
  { id: 8, name: "CRIT Rate%", short: "CRIT Rate", icon: "🎯" },
  { id: 9, name: "CRIT DMG%", short: "CRIT DMG", icon: "💥" },
  { id: 7, name: "SPD", short: "SPD", icon: "⚡" },
  { id: 5, name: "ATK%", short: "ATK%", icon: "⚔️" },
  { id: 4, name: "HP%", short: "HP%", icon: "❤️" },
  { id: 6, name: "DEF%", short: "DEF%", icon: "🛡️" },
  { id: 12, name: "Break Effect%", short: "Break", icon: "🔨" },
  { id: 10, name: "Effect Hit Rate%", short: "EHR", icon: "🎯" },
  { id: 11, name: "Effect RES%", short: "RES", icon: "🔰" },
  { id: 2, name: "ATK (Flat)", short: "ATK", icon: "🗡️" },
  { id: 1, name: "HP (Flat)", short: "HP", icon: "🩸" },
  { id: 3, name: "DEF (Flat)", short: "DEF", icon: "🧱" }
];

export function formatRelicSubstatValue(affixId, rolls = 1) {
  const r = parseInt(rolls, 10) || 1;
  switch (parseInt(affixId, 10)) {
    case 1: return `${Math.round(42 * r)}`;
    case 2: return `${Math.round(21 * r)}`;
    case 3: return `${Math.round(21 * r)}`;
    case 4: return `${(4.3 * r).toFixed(1)}%`;
    case 5: return `${(4.3 * r).toFixed(1)}%`;
    case 6: return `${(5.4 * r).toFixed(1)}%`;
    case 7: return `${(2.6 * r).toFixed(1)}`;
    case 8: return `${(3.2 * r).toFixed(1)}%`;
    case 9: return `${(6.4 * r).toFixed(1)}%`;
    case 10: return `${(4.3 * r).toFixed(1)}%`;
    case 11: return `${(4.3 * r).toFixed(1)}%`;
    case 12: return `${(6.4 * r).toFixed(1)}%`;
    default: return `${r}`;
  }
}

export function getConflictingSubstat(slot, mainAffixId) {
  const map = {
    1: { 1: 1 },
    2: { 1: 2 },
    3: { 1: 4, 2: 5, 3: 6, 4: 8, 5: 9, 7: 10 },
    4: { 1: 4, 2: 5, 3: 6, 4: 7 },
    5: { 1: 4, 2: 5, 3: 6 },
    6: { 1: 12, 3: 4, 4: 5, 5: 6 }
  };
  return map[slot]?.[mainAffixId] || null;
}

const STAR_RAIL_RES_LANGS = {
  th: 'th', en: 'en', es: 'es', pt: 'pt', ru: 'ru', vi: 'vi',
  de: 'de', fr: 'fr', id: 'id', ja: 'jp', ko: 'kr', zh: 'cn', zh_tw: 'cht'
};

async function loadCharacterSkillsData(lang = null) {
  const currentLang = lang || getCurrentLanguage() || 'th';
  const resLang = STAR_RAIL_RES_LANGS[currentLang] || 'th';

  if (state.skillsData && state.skillsData[resLang] && state.skillTreesData && state.skillTreesData[resLang]) {
    return { skills: state.skillsData[resLang], trees: state.skillTreesData[resLang] };
  }

  state.skillsData = state.skillsData || {};
  state.skillTreesData = state.skillTreesData || {};

  try {
    const [skillsRes, treesRes] = await Promise.all([
      fetch(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_min/${resLang}/character_skills.json`).then(r => r.json()),
      fetch(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_min/${resLang}/character_skill_trees.json`).then(r => r.json())
    ]);
    state.skillsData[resLang] = skillsRes;
    state.skillTreesData[resLang] = treesRes;
    return { skills: skillsRes, trees: treesRes };
  } catch (err) {
    console.warn('Failed to fetch StarRailRes skills metadata:', err);
    return { skills: state.skillsData[resLang] || {}, trees: state.skillTreesData[resLang] || {} };
  }
}

function formatSkillDesc(descTemplate, paramsArray, level) {
  if (!descTemplate) return '';
  const lvlIndex = Math.max(0, Math.min(level - 1, (paramsArray?.length || 1) - 1));
  const lvlParams = paramsArray?.[lvlIndex] || [];
  let formatted = descTemplate;
  lvlParams.forEach((param, idx) => {
    const pNum = idx + 1;
    const isPercent = formatted.includes(`#${pNum}[i]%`) || formatted.includes(`#${pNum}[f1]%`) || formatted.includes(`#${pNum}[f2]%`);
    const valStr = isPercent ? `${Math.round(param * 1000) / 10}%` : `${param}`;
    const regex = new RegExp(`(#${pNum}\\[[a-z0-9]+\\]%?)`, 'g');
    formatted = formatted.replace(regex, `<strong class="param-val">${valStr}</strong>`);
  });
  return formatted.replace(/\n/g, '<br>');
}

// Render Character Switcher Bar at the top of modal
function renderModalSwitcher(currentAvatarId) {
  if (!el.modalCharSwitcher) return;
  el.modalCharSwitcher.innerHTML = '';

  const sorted = [...state.avatarsList].sort((a, b) => b.avatar_id - a.avatar_id);
  sorted.forEach(av => {
    const meta = getAvatarInfo(av.avatar_id);
    const item = document.createElement('div');
    item.className = `modal-char-switcher-item ${av.avatar_id === currentAvatarId ? 'active' : ''}`;
    item.title = `${meta.name} (ID: ${av.avatar_id})`;
    item.innerHTML = `
      <img src="${getAvatarIconSrc(av.avatar_id)}"
           onerror="handleAvatarImgError(this, ${av.avatar_id})"
           alt="${meta.name}">
    `;
    item.addEventListener('click', () => {
      openAvatarDetailModal(av);
    });
    el.modalCharSwitcher.appendChild(item);
  });
}

// Render Overview & Combat Stats (Neonteam style)
function renderModalOverviewTab(avatarId) {
  const aid = parseInt(avatarId, 10);
  const meta = getAvatarInfo(aid);
  const av = state.fullFreesrData?.avatars?.[aid];
  const rank = av?.data?.rank ?? state.selectedAvatarDetail?.rank ?? 6;
  const level = av?.level ?? state.selectedAvatarDetail?.level ?? 80;

  // Portrait Art
  if (el.overviewPortraitImg) {
    el.overviewPortraitImg.removeAttribute('data-err-step');
    el.overviewPortraitImg.style.display = 'block';
    el.overviewPortraitImg.style.objectFit = 'cover';
    el.overviewPortraitImg.src = getAvatarSplashSrc(aid);
    el.overviewPortraitImg.onerror = function() {
      handleAvatarPortraitError(this, aid);
    };
  }

  if (el.overviewCharName) el.overviewCharName.textContent = meta.name;
  if (el.overviewCharMeta) {
    el.overviewCharMeta.innerHTML = `
      ${getElementIconHtml(meta.element, 20)}
      ${getPathIconHtml(meta.path, 20)}
      <span class="avatar-badge-rarity rarity-${meta.rarity}" style="position: static;">★ ${meta.rarity}</span>
    `;
  }
  if (el.overviewBadgeLvl) el.overviewBadgeLvl.textContent = `Lv. ${level} / 80`;
  if (el.overviewBadgeEidolon) el.overviewBadgeEidolon.textContent = `E${rank}`;

  // Light Cone calculation
  const lc = (state.fullFreesrData?.lightcones || []).find(l => l.equip_avatar === aid);
  const lcId = lc?.item_id || SIGNATURE_LIGHTCONES[aid] || 21001;
  const lcInfo = getLightconeInfo(lcId);
  const lcRank = lc?.rank || 5;
  const lcLevel = lc?.level || 80;

  // Equipped LC Card Glance
  if (el.overviewLcThumb) {
    el.overviewLcThumb.src = getLightconeArtSrc(lcId);
    el.overviewLcThumb.onerror = function() {
      handleLcImgError(this, lcId);
    };
  }
  if (el.overviewLcName) el.overviewLcName.textContent = lcInfo.name || `Light Cone ${lcId}`;
  if (el.overviewLcRank) el.overviewLcRank.textContent = `S${lcRank} • Lv.${lcLevel}`;

  // Relics calculation & sets
  const relics = (state.fullFreesrData?.relics || []).filter(r => r.equip_avatar === aid);
  const setCountMap = {};
  relics.forEach(r => {
    const sId = Math.floor((r.relic_id % 10000) / 10);
    setCountMap[sId] = (setCountMap[sId] || 0) + 1;
  });

  const activeSetBadges = [];
  Object.keys(setCountMap).forEach(sId => {
    const cnt = setCountMap[sId];
    const sInfo = getRelicSetInfo(sId);
    if (cnt >= 4) {
      activeSetBadges.push({ name: sInfo.name, count: 4 });
    } else if (cnt >= 2) {
      activeSetBadges.push({ name: sInfo.name, count: 2 });
    }
  });

  if (el.overviewRelicsSummary) {
    if (activeSetBadges.length === 0) {
      el.overviewRelicsSummary.innerHTML = `<span style="color: var(--text-muted);">${relics.length}/6 ชิ้นสวมใส่ (ยังไม่มีโบนัสเซ็ต)</span>`;
    } else {
      el.overviewRelicsSummary.innerHTML = activeSetBadges.map(b => 
        `<div style="display: flex; justify-content: space-between; align-items: center; color: var(--accent-cyan); font-weight: 700;">
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">${b.name}</span>
          <span class="badge-super-tag" style="padding: 0.1rem 0.4rem; font-size: 0.65rem;">(${b.count}-Pc)</span>
        </div>`
      ).join('');
    }
  }

  // Combat Stats (Authentic Honkai: Star Rail Character Attributes)
  const baseHp = meta.rarity === 5 ? 1241 : 1058;
  const baseAtk = meta.rarity === 5 ? 620 : 529;
  const baseDef = meta.rarity === 5 ? 530 : 441;
  const baseSpd = meta.speed || (meta.rawPath === 'Hunt' ? 110 : 100);

  const lcHp = lcInfo.rarity === 5 ? 1058 : 846;
  const lcAtk = lcInfo.rarity === 5 ? 582 : 476;
  const lcDef = lcInfo.rarity === 5 ? 463 : 396;

  let hpPercentBonus = 0;
  let flatHpBonus = 0;
  let atkPercentBonus = 0;
  let flatAtkBonus = 0;
  let defPercentBonus = 0;
  let flatDefBonus = 0;
  let spdFlatBonus = 0;
  let spdPercentBonus = 0;
  let critRateBonus = 0;
  let critDmgBonus = 0;
  let breakEffectBonus = 0;
  let healBoostBonus = 0;
  let errBonus = 0;
  let ehrBonus = 0;
  let effectResBonus = 0;
  let elemDmgBonus = 0;

  relics.forEach(r => {
    const slot = r.relic_id % 10;
    const lvl = r.level || 15;
    const ratio = lvl / 15;

    // Main Affixes
    if (slot === 1) {
      flatHpBonus += Math.round(705.6 * ratio);
    } else if (slot === 2) {
      flatAtkBonus += Math.round(352.8 * ratio);
    } else if (slot === 3) {
      if (r.main_affix_id === 1) hpPercentBonus += 43.2 * ratio;
      else if (r.main_affix_id === 2) atkPercentBonus += 43.2 * ratio;
      else if (r.main_affix_id === 3) defPercentBonus += 54.0 * ratio;
      else if (r.main_affix_id === 4) critRateBonus += 32.4 * ratio;
      else if (r.main_affix_id === 5) critDmgBonus += 64.8 * ratio;
      else if (r.main_affix_id === 6) healBoostBonus += 34.5 * ratio;
      else if (r.main_affix_id === 7) ehrBonus += 43.2 * ratio;
    } else if (slot === 4) {
      if (r.main_affix_id === 1) hpPercentBonus += 43.2 * ratio;
      else if (r.main_affix_id === 2) atkPercentBonus += 43.2 * ratio;
      else if (r.main_affix_id === 3) defPercentBonus += 54.0 * ratio;
      else if (r.main_affix_id === 4) spdFlatBonus += 25 * ratio;
    } else if (slot === 5) {
      if (r.main_affix_id === 1) hpPercentBonus += 43.2 * ratio;
      else if (r.main_affix_id === 2) atkPercentBonus += 43.2 * ratio;
      else if (r.main_affix_id === 3) defPercentBonus += 54.0 * ratio;
      else if (r.main_affix_id >= 4) elemDmgBonus += 38.8 * ratio;
    } else if (slot === 6) {
      if (r.main_affix_id === 1) breakEffectBonus += 64.8 * ratio;
      else if (r.main_affix_id === 2) errBonus += 19.4 * ratio;
      else if (r.main_affix_id === 3) hpPercentBonus += 43.2 * ratio;
      else if (r.main_affix_id === 4) atkPercentBonus += 43.2 * ratio;
      else if (r.main_affix_id === 5) defPercentBonus += 54.0 * ratio;
    }

    // Sub Affixes
    (r.sub_affixes || []).forEach(sub => {
      const rolls = sub.count || sub.cnt || 1;
      const sId = sub.sub_affix_id;
      if (sId === 1) flatHpBonus += Math.round(42 * rolls);
      else if (sId === 2) flatAtkBonus += Math.round(21 * rolls);
      else if (sId === 3) flatDefBonus += Math.round(21 * rolls);
      else if (sId === 4) hpPercentBonus += 4.3 * rolls;
      else if (sId === 5) atkPercentBonus += 4.3 * rolls;
      else if (sId === 6) defPercentBonus += 5.4 * rolls;
      else if (sId === 7) spdFlatBonus += 2.6 * rolls;
      else if (sId === 8) critRateBonus += 3.2 * rolls;
      else if (sId === 9) critDmgBonus += 6.4 * rolls;
      else if (sId === 10) ehrBonus += 4.3 * rolls;
      else if (sId === 11) effectResBonus += 4.3 * rolls;
      else if (sId === 12) breakEffectBonus += 6.4 * rolls;
    });
  });

  const finalBaseHp = baseHp + lcHp;
  const extraHp = Math.round(finalBaseHp * (hpPercentBonus / 100) + flatHpBonus);
  const totalHp = finalBaseHp + extraHp;

  const finalBaseAtk = baseAtk + lcAtk;
  const extraAtk = Math.round(finalBaseAtk * (atkPercentBonus / 100) + flatAtkBonus);
  const totalAtk = finalBaseAtk + extraAtk;

  const finalBaseDef = baseDef + lcDef;
  const extraDef = Math.round(finalBaseDef * (defPercentBonus / 100) + flatDefBonus);
  const totalDef = finalBaseDef + extraDef;

  const finalBaseSpd = baseSpd;
  const extraSpd = Math.round((spdFlatBonus + finalBaseSpd * (spdPercentBonus / 100)) * 10) / 10;
  const totalSpd = (finalBaseSpd + extraSpd).toFixed(1);

  const totalCritRate = (5.0 + critRateBonus).toFixed(1);
  const totalCritDmg = (50.0 + critDmgBonus).toFixed(1);
  const totalBreakEffect = breakEffectBonus.toFixed(1);
  const totalHealBoost = healBoostBonus.toFixed(1);
  const maxEnergy = 120;
  const totalErr = (100.0 + errBonus).toFixed(1);
  const totalEhr = ehrBonus.toFixed(1);
  const totalRes = (10.0 + effectResBonus).toFixed(1);
  const totalElemDmg = elemDmgBonus.toFixed(1);

  const elemIconMap = {
    Physical: 'PhysicalAddedRatio',
    Fire: 'FireAddedRatio',
    Ice: 'IceAddedRatio',
    Lightning: 'ThunderAddedRatio',
    Thunder: 'ThunderAddedRatio',
    Wind: 'WindAddedRatio',
    Quantum: 'QuantumAddedRatio',
    Imaginary: 'ImaginaryAddedRatio'
  };
  const elemKey = normalizeElement(meta.rawElement || meta.element);
  const elemIcon = elemIconMap[elemKey] || 'PhysicalAddedRatio';
  const elemName = translateElement(elemKey);
  const elemDmgLabel = t('statDmgBoost').replace('{element}', elemName);
  const cdn = 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property';

  if (el.overviewStatsGrid) {
    el.overviewStatsGrid.innerHTML = `
      <div class="hsr-attributes-panel">
        <!-- Section 1: Basic Attributes -->
        <div class="hsr-attr-section">
          <div class="hsr-attr-header">${t('attrBasic')}</div>
          <div class="hsr-attr-list">
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconMaxHP.png" alt="HP">
                <span class="hsr-attr-name">${t('statMaxHp')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalHp.toLocaleString()}</span>
                ${extraHp > 0 ? `<span class="hsr-attr-breakdown"><span class="hsr-attr-base">${finalBaseHp.toLocaleString()}</span><span class="hsr-attr-extra">+${extraHp.toLocaleString()}</span></span>` : ''}
              </div>
            </div>
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconAttack.png" alt="ATK">
                <span class="hsr-attr-name">${t('statAtk')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalAtk.toLocaleString()}</span>
                ${extraAtk > 0 ? `<span class="hsr-attr-breakdown"><span class="hsr-attr-base">${finalBaseAtk.toLocaleString()}</span><span class="hsr-attr-extra">+${extraAtk.toLocaleString()}</span></span>` : ''}
              </div>
            </div>
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconDefence.png" alt="DEF">
                <span class="hsr-attr-name">${t('statDef')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalDef.toLocaleString()}</span>
                ${extraDef > 0 ? `<span class="hsr-attr-breakdown"><span class="hsr-attr-base">${finalBaseDef.toLocaleString()}</span><span class="hsr-attr-extra">+${extraDef.toLocaleString()}</span></span>` : ''}
              </div>
            </div>
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconSpeed.png" alt="SPD">
                <span class="hsr-attr-name">${t('statSpd')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalSpd}</span>
                ${extraSpd > 0 ? `<span class="hsr-attr-breakdown"><span class="hsr-attr-base">${finalBaseSpd}</span><span class="hsr-attr-extra">+${extraSpd}</span></span>` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Advanced Attributes -->
        <div class="hsr-attr-section">
          <div class="hsr-attr-header">${t('attrAdvanced')}</div>
          <div class="hsr-attr-list">
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconCriticalChance.png" alt="CRIT Rate">
                <span class="hsr-attr-name">${t('statCritRate')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalCritRate}%</span>
              </div>
            </div>
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconCriticalDamage.png" alt="CRIT DMG">
                <span class="hsr-attr-name">${t('statCritDmg')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalCritDmg}%</span>
              </div>
            </div>
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconBreakUp.png" alt="Break">
                <span class="hsr-attr-name">${t('statBreakEffect')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalBreakEffect}%</span>
              </div>
            </div>
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconHealRatio.png" alt="Heal">
                <span class="hsr-attr-name">${t('statHealBoost')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalHealBoost}%</span>
              </div>
            </div>
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconEnergyRecovery.png" alt="Max Energy">
                <span class="hsr-attr-name">${t('statMaxEnergy')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${maxEnergy}</span>
              </div>
            </div>
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconEnergyRecovery.png" alt="ERR">
                <span class="hsr-attr-name">${t('statEnergyRegen')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalErr}%</span>
              </div>
            </div>
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconStatusProbability.png" alt="EHR">
                <span class="hsr-attr-name">${t('statEhr')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalEhr}%</span>
              </div>
            </div>
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/IconStatusResistance.png" alt="RES">
                <span class="hsr-attr-name">${t('statRes')}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalRes}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Elemental DMG -->
        <div class="hsr-attr-section">
          <div class="hsr-attr-header">${t('attrElemental')}</div>
          <div class="hsr-attr-list">
            <div class="hsr-attr-row">
              <div class="hsr-attr-left">
                <img class="hsr-attr-icon" src="${cdn}/Icon${elemIcon}.png" alt="${elemName}">
                <span class="hsr-attr-name">${elemDmgLabel}</span>
              </div>
              <div class="hsr-attr-right">
                <span class="hsr-attr-total">${totalElemDmg}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Render Relics & Gear Tab (6 Slots + Equipped Lightcone)
function renderModalRelicsTab(avatarId) {
  const aid = parseInt(avatarId, 10);
  const meta = getAvatarInfo(aid);
  if (!el.modalRelicsSlotsGrid) return;
  el.modalRelicsSlotsGrid.innerHTML = '';

  // 1. Equipped Lightcone in Relics Tab
  const lc = (state.fullFreesrData?.lightcones || []).find(l => l.equip_avatar === aid);
  const lcId = lc?.item_id || SIGNATURE_LIGHTCONES[aid] || 21001;
  const lcInfo = getLightconeInfo(lcId);
  const lcRank = lc?.rank || 5;
  const lcLevel = lc?.level || 80;
  const lcMeta = LIGHTCONE_METADATA[lcId] || {};

  const lcThumbEl = document.getElementById('relics-tab-lc-thumb');
  const lcNameEl = document.getElementById('relics-tab-lc-name');
  const lcStarsEl = document.getElementById('relics-tab-lc-stars');
  const lcRankEl = document.getElementById('relics-tab-lc-rank');
  const lcLvlEl = document.getElementById('relics-tab-lc-level');
  const lcStatsEl = document.getElementById('relics-tab-lc-stats');
  const lcBox = document.getElementById('relics-equipped-lc-box');

  if (lcThumbEl) {
    lcThumbEl.src = getLightconeArtSrc(lcId);
    lcThumbEl.onerror = function() {
      handleLcImgError(this, lcId);
    };
  }
  if (lcNameEl) lcNameEl.textContent = lcInfo.name || `Light Cone ${lcId}`;
  if (lcStarsEl) lcStarsEl.textContent = '★'.repeat(lcInfo.rarity || 5);
  if (lcRankEl) lcRankEl.textContent = `S${lcRank}`;
  if (lcLvlEl) lcLvlEl.textContent = `Lv. ${lcLevel} / 80`;
  if (lcStatsEl) {
    const hp = lcMeta.hp || (lcMeta.rarity === 5 ? 1164 : (lcMeta.rarity === 4 ? 953 : 846));
    const atk = lcMeta.atk || (lcMeta.rarity === 5 ? 582 : (lcMeta.rarity === 4 ? 423 : 317));
    const def = lcMeta.def || (lcMeta.rarity === 5 ? 529 : (lcMeta.rarity === 4 ? 396 : 264));
    lcStatsEl.textContent = `HP ${hp} / ATK ${atk} / DEF ${def}`;
  }
  if (lcBox) {
    lcBox.onclick = () => openLightconePicker(aid);
  }

  // 2. Relic Slots
  const allRelics = state.fullFreesrData?.relics || [];
  const equippedRelics = allRelics.filter(r => r.equip_avatar === aid);

  const setCountMap = {};
  equippedRelics.forEach(r => {
    const sId = Math.floor((r.relic_id % 10000) / 10);
    setCountMap[sId] = (setCountMap[sId] || 0) + 1;
  });

  for (let slot = 1; slot <= 6; slot++) {
    const slotInfo = SLOT_NAMES_FULL[slot];
    const equipped = equippedRelics.find(r => (r.relic_id % 10) === slot);

    const box = document.createElement('div');

    if (equipped) {
      const setId = Math.floor((equipped.relic_id % 10000) / 10);
      const rInfo = getRelicSetInfo(setId);
      const mainAffixName = getRelicMainAffixName(slot, equipped.main_affix_id);

      const subsSnippetHtml = (equipped.sub_affixes && equipped.sub_affixes.length > 0)
        ? equipped.sub_affixes.slice(0, 4).map(s => {
            const sName = getRelicSubAffixName(s.sub_affix_id);
            const rolls = s.count || s.cnt || 1;
            return `${sName} (+${rolls})`;
          }).join(' • ')
        : '4 ออปชั่นรอง (คลิกเพื่อปรับแต่ง)';

      box.className = 'relic-slot-box equipped';
      box.innerHTML = `
        <div class="relic-slot-icon-wrap">
          <img src="https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/relic/${setId}.png"
               onerror="this.src='./assets/logo.png'" alt="Relic" style="width: 100%; height: 100%; object-fit: contain;">
          <span class="relic-slot-badge">${slotInfo.icon} ${slotInfo.name.split(' ')[0]}</span>
        </div>
        <div class="relic-slot-content">
          <div style="display: flex; justify-content: space-between; align-items: center; padding-right: 1.5rem;">
            <span class="relic-slot-title" title="${rInfo.name}">${rInfo.name}</span>
            <span class="relic-slot-lvl">+15</span>
          </div>
          <div class="relic-slot-main">✦ ${mainAffixName}</div>
          <div class="relic-slot-subs" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.72rem; color: var(--accent-cyan);" title="${subsSnippetHtml}">
            ${subsSnippetHtml}
          </div>
        </div>
        <button type="button" class="btn-slot-unequip-corner" title="ถอดชิ้นนี้">✕</button>
      `;

      box.addEventListener('click', () => {
        openSlotPicker(aid, slot);
      });

      box.querySelector('.btn-slot-unequip-corner')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        equipped.equip_avatar = 0;
        if (state.isConnected) await saveFreesrChangesToServer();
        renderModalRelicsTab(aid);
        renderModalOverviewTab(aid);
        renderShowcaseCard(aid);
        showToast(`ถอดรีลิกส์ ${slotInfo.name} เรียบร้อย`, 'info');
      });
    } else {
      box.className = 'relic-slot-box empty';
      box.innerHTML = `
        <div class="relic-slot-icon-wrap" style="opacity: 0.4;">
          <span style="font-size: 1.5rem;">${slotInfo.icon}</span>
          <span class="relic-slot-badge">${slotInfo.name.split(' ')[0]}</span>
        </div>
        <div class="relic-slot-content">
          <div class="relic-slot-title" style="color: var(--text-muted);">${slotInfo.name}</div>
          <div class="relic-slot-main" style="color: var(--text-muted); font-size: 0.775rem;">ยังไม่ได้สวมใส่</div>
          <div class="relic-slot-subs" style="color: var(--accent-cyan); font-size: 0.725rem;">+ คลิกเพื่อเลือกหรือสร้าง (แนะนำ: ${slotInfo.defaultStat})</div>
        </div>
      `;

      box.addEventListener('click', () => {
        openSlotPicker(aid, slot);
      });
    }

    el.modalRelicsSlotsGrid.appendChild(box);
  }

  // Active Set Bonuses display
  if (el.modalRelicsActiveSets) {
    const activeSets = [];
    Object.keys(setCountMap).forEach(sId => {
      const cnt = setCountMap[sId];
      const sInfo = getRelicSetInfo(sId);
      if (cnt >= 4) {
        activeSets.push(`🌟 <strong>${sInfo.name} (4-Piece Set)</strong>: ${sInfo.desc4 || 'เปิดใช้งานเอฟเฟกต์ครบ 4 ชิ้น'}`);
      } else if (cnt >= 2) {
        activeSets.push(`✨ <strong>${sInfo.name} (2-Piece Set)</strong>: ${sInfo.desc2 || 'เปิดใช้งานเอฟเฟกต์ 2 ชิ้น'}`);
      }
    });

    if (activeSets.length === 0) {
      el.modalRelicsActiveSets.innerHTML = `<span style="color: var(--text-muted);">ยังไม่มีเอฟเฟกต์เซ็ตทำงาน (ต้องใส่เซ็ตเดียวกันอย่างน้อย 2 หรือ 4 ชิ้น)</span>`;
    } else {
      el.modalRelicsActiveSets.innerHTML = activeSets.map(s => `<div>${s}</div>`).join('');
    }
  }
}

// Open Relic Slot Picker Modal (Spacious, Tabbed, Custom Set & Main Stat Builder + Substats Customizer + Inventory)
let slotPickerSelectedSetId = 101;
let slotPickerSelectedMainAffix = 1;
let slotPickerTargetRelic = null; // When non-null, editing an existing relic
let slotPickerSubstats = [
  { sub_affix_id: 8, count: 4, step: 2 },
  { sub_affix_id: 9, count: 3, step: 2 },
  { sub_affix_id: 7, count: 1, step: 2 },
  { sub_affix_id: 5, count: 1, step: 2 }
];
let slotPickerInitialSubstats = [];

export function openSlotPickerForRelic(relic) {
  if (!relic) return;
  const slotNum = (relic.relic_id % 10) || 1;
  const aid = relic.equip_avatar || state.selectedAvatarDetail?.avatar_id || 1001;
  openSlotPicker(aid, slotNum, relic);
}
window.openSlotPickerForRelic = openSlotPickerForRelic;

function openSlotPicker(avatarId, slotNum, targetRelicToEdit = null) {
  state.slotPickerAvatarId = parseInt(avatarId, 10);
  state.slotPickerSlot = parseInt(slotNum, 10);
  slotPickerTargetRelic = targetRelicToEdit || null;

  const aid = state.slotPickerAvatarId;
  const slot = state.slotPickerSlot;
  const meta = getAvatarInfo(aid);
  const rec = getOptimalBuildForAvatar(aid);
  const slotInfo = SLOT_NAMES_FULL[slot] || { name: `Slot ${slot}` };

  const modal = document.getElementById('modal-select-relic-slot');
  if (!modal) return;

  // Title & Subtitle
  const titleEl = document.getElementById('modal-slot-picker-title');
  const subtitleEl = document.getElementById('modal-slot-picker-subtitle');
  const editModeIndicator = document.getElementById('slot-picker-edit-mode-indicator');
  const btnConfirmCustom = document.getElementById('btn-slot-picker-confirm-custom');

  if (slotPickerTargetRelic) {
    const curSetId = Math.floor((slotPickerTargetRelic.relic_id % 10000) / 10);
    const curSetInfo = getRelicSetInfo(curSetId);
    if (titleEl) titleEl.textContent = `🔧 แก้ไขรีลิกส์: ${curSetInfo.name} (${slotInfo.name}) - ${meta.name}`;
    if (subtitleEl) subtitleEl.textContent = `ปรับแต่งเซ็ต สเตตัสหลัก และออฟรองของรีลิกส์ชิ้นนี้ (#${slotPickerTargetRelic.internal_uid})`;
    if (editModeIndicator) editModeIndicator.innerHTML = `✏️ กำลังแก้ไขรีลิกส์ <strong>#${slotPickerTargetRelic.internal_uid}</strong>`;
    if (btnConfirmCustom) btnConfirmCustom.textContent = `💾 บันทึกการแก้ไขออฟรองชิ้นนี้`;
  } else {
    if (titleEl) titleEl.textContent = `${t('relicPickerTitle').replace('{slot}', slotInfo.name)} - ${meta.name}`;
    if (subtitleEl) subtitleEl.textContent = t('quickGenRecDesc');
    if (editModeIndicator) editModeIndicator.textContent = '';
    if (btnConfirmCustom) btnConfirmCustom.textContent = `⚡ สวมใส่ชิ้นนี้ทันที (+15 5★ ออฟที่เลือก)`;
  }

  // Current Equipped Relic Banner
  const currentBox = document.getElementById('slot-picker-current-box');
  const allRelics = state.fullFreesrData?.relics || [];
  const currentRelic = slotPickerTargetRelic || allRelics.find(r => r.equip_avatar === aid && (r.relic_id % 10) === slot);

  if (currentBox) {
    if (currentRelic) {
      const curSetId = Math.floor((currentRelic.relic_id % 10000) / 10);
      const curSetInfo = getRelicSetInfo(curSetId);
      const curMainAffixName = getRelicMainAffixName(slot, currentRelic.main_affix_id);

      const subsSnippet = (currentRelic.sub_affixes || []).map(s => {
        const sName = getRelicSubAffixName(s.sub_affix_id);
        const rolls = s.count || s.cnt || 1;
        const val = formatRelicSubstatValue(s.sub_affix_id, rolls);
        return `<span style="display: inline-block; background: rgba(0,0,0,0.35); border: 1px solid var(--border-color); border-radius: 4px; padding: 2px 6px; font-size: 0.725rem; color: #fff;">${sName} +${val} <strong style="color:var(--accent-gold);">(+${rolls})</strong></span>`;
      }).join(' ');

      currentBox.className = 'slot-picker-current-banner';
      currentBox.innerHTML = `
        <div style="display: flex; gap: 0.85rem; align-items: center; min-width: 0; flex: 1;">
          <img src="https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/relic/${curSetId}.png"
               onerror="this.src='./assets/logo.png'" alt="Relic"
               style="width: 48px; height: 48px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
          <div style="min-width: 0;">
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 700;">
                ${currentRelic.equip_avatar ? t('currentEquipped') : 'ชิ้นในคลัง'} (+${currentRelic.level || 15})
              </span>
              <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 800;">
                ✦ ${curMainAffixName}
              </span>
            </div>
            <div style="font-size: 0.95rem; font-weight: 800; color: #fff; margin: 2px 0;">
              ${curSetInfo.name}
            </div>
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 3px;">
              ${subsSnippet}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 0.4rem; align-items: center;">
          ${!slotPickerTargetRelic ? `
            <button type="button" class="btn btn-sm btn-warning" id="btn-slot-picker-edit-curr" style="padding: 0.45rem 0.85rem; font-weight: 700;" title="โหลดข้อมูลชิ้นนี้ลงมาแก้ไขออฟรอง">
              ✏️ แก้ไขออฟรองชิ้นนี้
            </button>
          ` : ''}
          ${currentRelic.equip_avatar ? `
            <button type="button" class="btn btn-sm btn-danger" id="btn-slot-picker-unequip" style="padding: 0.45rem 0.85rem; font-weight: 700;">
              ${t('btnUnequip')}
            </button>
          ` : ''}
        </div>
      `;

      document.getElementById('btn-slot-picker-edit-curr')?.addEventListener('click', () => {
        openSlotPicker(aid, slot, currentRelic);
      });

      document.getElementById('btn-slot-picker-unequip')?.addEventListener('click', async () => {
        currentRelic.equip_avatar = 0;
        if (state.isConnected) await saveFreesrChangesToServer();
        renderModalRelicsTab(aid);
        renderModalOverviewTab(aid);
        renderShowcaseCard(aid);
        loadEquipment();
        openSlotPicker(aid, slot);
        showToast('ถอดรีลิกส์เรียบร้อยแล้ว', 'info');
      });
    } else {
      currentBox.className = 'slot-picker-current-banner empty';
      currentBox.innerHTML = `<span>${t('noRelicEquipped')}</span>`;
    }
  }

  // Set & Main Stat defaults
  const recSetId = slot <= 4 ? rec.cavern : rec.planar;
  let recMainStat = 1;
  if (slot === 1 || slot === 2) recMainStat = 1;
  else if (slot === 3) recMainStat = rec.body;
  else if (slot === 4) recMainStat = rec.feet;
  else if (slot === 5) recMainStat = rec.sphere;
  else if (slot === 6) recMainStat = rec.rope;

  if (slotPickerTargetRelic) {
    slotPickerSelectedSetId = Math.floor((slotPickerTargetRelic.relic_id % 10000) / 10);
    slotPickerSelectedMainAffix = slotPickerTargetRelic.main_affix_id;
    if (slotPickerTargetRelic.sub_affixes && slotPickerTargetRelic.sub_affixes.length > 0) {
      slotPickerSubstats = slotPickerTargetRelic.sub_affixes.map(s => ({
        sub_affix_id: s.sub_affix_id,
        count: s.count || s.cnt || 1,
        step: s.step ?? 2
      }));
    } else {
      applySubstatPreset('god', slot, slotPickerSelectedMainAffix, aid);
    }
  } else {
    slotPickerSelectedSetId = recSetId;
    slotPickerSelectedMainAffix = recMainStat;
    applySubstatPreset('god', slot, slotPickerSelectedMainAffix, aid);
  }

  // Clone initial substats for reset button
  slotPickerInitialSubstats = JSON.parse(JSON.stringify(slotPickerSubstats));

  // Render Recommended Highlight Banner
  const recHighlight = document.getElementById('slot-picker-rec-highlight');
  if (recHighlight) {
    const recSetInfo = getRelicSetInfo(recSetId);
    const recMainName = getRelicMainAffixName(slot, recMainStat);

    recHighlight.innerHTML = `
      <div style="display: flex; gap: 0.85rem; align-items: center;">
        <img src="https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/relic/${recSetId}.png"
             onerror="this.src='./assets/logo.png'" alt="Relic"
             style="width: 52px; height: 52px; object-fit: contain;">
        <div>
          <div style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 800; text-transform: uppercase;">
            ⭐ ${t('recommendedBadge')}: ${recSetInfo.name} (+15 5★)
          </div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #fff; margin-top: 2px;">
            ✦ ${recMainName}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            ออฟรองแนะนำ 4 แถวเทพ ปรับแต่งได้ตามต้องการด้านล่าง
          </div>
        </div>
      </div>
      <button type="button" class="btn btn-primary" id="btn-slot-picker-quick-rec" style="font-weight: 800; padding: 0.55rem 1.15rem; font-size: 0.875rem;">
        ⚡ ${t('btnEquipInstant')}
      </button>
    `;

    document.getElementById('btn-slot-picker-quick-rec')?.addEventListener('click', async () => {
      await equipCustomSlotRelic(aid, slot, recSetId, recMainStat, slotPickerSubstats);
    });
  }

  // Populate Set Grid
  renderSlotPickerSetGrid(slot, recSetId);

  // Populate Main Stat Pills
  renderSlotPickerMainStatPills(slot, recMainStat);

  // Populate Substats Customizer
  renderSlotPickerSubstats(slot, slotPickerSelectedMainAffix);

  // Preset buttons
  document.querySelectorAll('.btn-substat-preset').forEach(btn => {
    btn.onclick = () => {
      const presetKey = btn.getAttribute('data-preset');
      applySubstatPreset(presetKey, slot, slotPickerSelectedMainAffix, aid);
    };
  });

  // Reset Substats button
  const btnResetSubs = document.getElementById('btn-reset-substats');
  if (btnResetSubs) {
    btnResetSubs.onclick = () => {
      slotPickerSubstats = JSON.parse(JSON.stringify(slotPickerInitialSubstats));
      renderSlotPickerSubstats(slot, slotPickerSelectedMainAffix);
    };
  }

  // Tab 2: Inventory Grid
  renderSlotPickerInventoryGrid(aid, slot);

  // Mode Tabs Switching
  const tabQuickBtn = document.getElementById('tab-btn-relic-quick');
  const tabInvBtn = document.getElementById('tab-btn-relic-inventory');
  const paneQuick = document.getElementById('slot-picker-quick-tab');
  const paneInv = document.getElementById('slot-picker-inventory-tab');

  if (tabQuickBtn && tabInvBtn && paneQuick && paneInv) {
    tabQuickBtn.classList.add('active');
    tabInvBtn.classList.remove('active');
    paneQuick.style.display = 'flex';
    paneInv.style.display = 'none';

    tabQuickBtn.onclick = () => {
      tabQuickBtn.classList.add('active');
      tabInvBtn.classList.remove('active');
      paneQuick.style.display = 'flex';
      paneInv.style.display = 'none';
    };

    tabInvBtn.onclick = () => {
      tabInvBtn.classList.add('active');
      tabQuickBtn.classList.remove('active');
      paneQuick.style.display = 'none';
      paneInv.style.display = 'flex';
    };
  }

  // Close Button
  const btnCloseSlot = document.getElementById('btn-close-slot-picker');
  if (btnCloseSlot) {
    btnCloseSlot.onclick = () => {
      modal.classList.remove('active');
      slotPickerTargetRelic = null;
    };
  }

  // Confirm Custom Button
  if (btnConfirmCustom) {
    btnConfirmCustom.onclick = async () => {
      if (slotPickerTargetRelic) {
        await saveEditedRelicSubstats(slotPickerTargetRelic, slotPickerSelectedSetId, slotPickerSelectedMainAffix, slotPickerSubstats);
      } else {
        await equipCustomSlotRelic(aid, slot, slotPickerSelectedSetId, slotPickerSelectedMainAffix, slotPickerSubstats);
      }
    };
  }

  modal.classList.add('active');
}

// Render Substats Customizer Grid
function renderSlotPickerSubstats(slot, mainAffixId) {
  const grid = document.getElementById('slot-picker-substats-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const conflictSub = getConflictingSubstat(slot, mainAffixId);

  // If any selected substat conflicts with main affix, swap it to a valid unused substat
  slotPickerSubstats.forEach((sub, idx) => {
    if (sub.sub_affix_id === conflictSub) {
      const unused = RELIC_SUBSTATS_CONFIG.find(c =>
        c.id !== conflictSub && !slotPickerSubstats.some((s, i) => i !== idx && s.sub_affix_id === c.id)
      );
      if (unused) sub.sub_affix_id = unused.id;
    }
  });

  slotPickerSubstats.forEach((sub, idx) => {
    const card = document.createElement('div');
    card.className = 'substat-row-card';

    const sVal = formatRelicSubstatValue(sub.sub_affix_id, sub.count);

    let optsHtml = '';
    RELIC_SUBSTATS_CONFIG.forEach(stat => {
      const isConflict = stat.id === conflictSub;
      const isChosenElsewhere = slotPickerSubstats.some((s, i) => i !== idx && s.sub_affix_id === stat.id);
      const isSelected = stat.id === sub.sub_affix_id;
      const disabledAttr = (isConflict || (isChosenElsewhere && !isSelected)) ? 'disabled' : '';
      const conflictTag = isConflict ? ' (ตรงกับ Main Stat)' : (isChosenElsewhere && !isSelected ? ' (เลือกแล้ว)' : '');
      optsHtml += `<option value="${stat.id}" ${isSelected ? 'selected' : ''} ${disabledAttr}>${stat.icon} ${stat.name}${conflictTag}</option>`;
    });

    card.innerHTML = `
      <div class="substat-row-header">
        <span class="substat-slot-label">ออฟรอง ${idx + 1}</span>
        <span class="substat-preview-badge" id="substat-preview-${idx}">+${sVal} (${sub.count} โรล)</span>
      </div>
      <div class="substat-row-controls">
        <select class="form-select substat-select" data-idx="${idx}">
          ${optsHtml}
        </select>
        <div class="substat-stepper">
          <button type="button" class="btn-substat-step minus" data-idx="${idx}" title="ลดโรล">−</button>
          <input type="number" class="substat-count-input" data-idx="${idx}" min="1" max="25" value="${sub.count}">
          <button type="button" class="btn-substat-step plus" data-idx="${idx}" title="เพิ่มโรล">+</button>
        </div>
      </div>
    `;

    // Dropdown change
    card.querySelector('.substat-select')?.addEventListener('change', (e) => {
      const newId = parseInt(e.target.value, 10);
      slotPickerSubstats[idx].sub_affix_id = newId;
      renderSlotPickerSubstats(slot, slotPickerSelectedMainAffix);
    });

    // Stepper buttons
    card.querySelector('.btn-substat-step.minus')?.addEventListener('click', () => {
      if (slotPickerSubstats[idx].count > 1) {
        slotPickerSubstats[idx].count--;
        updateSubstatCardPreview(idx);
        updateTotalRollsCount();
      }
    });

    card.querySelector('.btn-substat-step.plus')?.addEventListener('click', () => {
      if (slotPickerSubstats[idx].count < 25) {
        slotPickerSubstats[idx].count++;
        updateSubstatCardPreview(idx);
        updateTotalRollsCount();
      }
    });

    card.querySelector('.substat-count-input')?.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 30) val = 30;
      slotPickerSubstats[idx].count = val;
      updateSubstatCardPreview(idx);
      updateTotalRollsCount();
    });

    grid.appendChild(card);
  });

  updateTotalRollsCount();
}

function updateSubstatCardPreview(idx) {
  const sub = slotPickerSubstats[idx];
  if (!sub) return;
  const badge = document.getElementById(`substat-preview-${idx}`);
  const input = document.querySelector(`.substat-count-input[data-idx="${idx}"]`);
  if (badge) {
    const sVal = formatRelicSubstatValue(sub.sub_affix_id, sub.count);
    badge.textContent = `+${sVal} (${sub.count} โรล)`;
  }
  if (input) {
    input.value = sub.count;
  }
}

function updateTotalRollsCount() {
  const lbl = document.getElementById('slot-picker-total-rolls');
  if (!lbl) return;
  const total = slotPickerSubstats.reduce((sum, s) => sum + (parseInt(s.count, 10) || 1), 0);
  lbl.textContent = total;
  if (total === 9) {
    lbl.style.color = '#fbbf24';
  } else if (total > 9) {
    lbl.style.color = 'var(--accent-cyan)';
  } else {
    lbl.style.color = 'var(--text-muted)';
  }
}

function applySubstatPreset(presetKey, slot, mainAffixId, avatarId) {
  const conflict = getConflictingSubstat(slot, mainAffixId);
  const aid = parseInt(avatarId, 10);
  const rec = getOptimalBuildForAvatar(aid);

  let targetIds = [];
  let rolls = [4, 3, 1, 1];

  if (presetKey === 'god') {
    const pool = [...rec.substats, 7, 8, 9, 5, 12, 11, 4, 6];
    for (const sid of pool) {
      if (targetIds.length >= 4) break;
      if (sid !== conflict && !targetIds.includes(sid)) targetIds.push(sid);
    }
    rolls = [4, 3, 1, 1];
  } else if (presetKey === 'crit') {
    const pool = [8, 9, 7, 5, 4, 12, 2];
    for (const sid of pool) {
      if (targetIds.length >= 4) break;
      if (sid !== conflict && !targetIds.includes(sid)) targetIds.push(sid);
    }
    rolls = [4, 3, 1, 1];
  } else if (presetKey === 'spd') {
    const pool = [7, 8, 9, 5, 12, 4, 2];
    for (const sid of pool) {
      if (targetIds.length >= 4) break;
      if (sid !== conflict && !targetIds.includes(sid)) targetIds.push(sid);
    }
    rolls = [5, 2, 1, 1];
  } else if (presetKey === 'break') {
    const pool = [12, 7, 5, 4, 11, 6, 2];
    for (const sid of pool) {
      if (targetIds.length >= 4) break;
      if (sid !== conflict && !targetIds.includes(sid)) targetIds.push(sid);
    }
    rolls = [5, 2, 1, 1];
  } else if (presetKey === 'tank') {
    const pool = [4, 6, 11, 7, 1, 3, 5];
    for (const sid of pool) {
      if (targetIds.length >= 4) break;
      if (sid !== conflict && !targetIds.includes(sid)) targetIds.push(sid);
    }
    rolls = [4, 3, 1, 1];
  }

  // Ensure 4 distinct items
  while (targetIds.length < 4) {
    const fallback = RELIC_SUBSTATS_CONFIG.find(c => c.id !== conflict && !targetIds.includes(c.id));
    if (fallback) targetIds.push(fallback.id);
    else break;
  }

  slotPickerSubstats = targetIds.slice(0, 4).map((sid, i) => ({
    sub_affix_id: sid,
    count: rolls[i] || 1,
    step: 2
  }));

  renderSlotPickerSubstats(slot, mainAffixId);
}

// Render Set Grid for Slot
function renderSlotPickerSetGrid(slot, recSetId) {
  const grid = document.getElementById('slot-picker-set-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const isCavern = slot <= 4;
  const eligibleSetIds = [];
  for (const sIdStr in RELIC_SET_METADATA) {
    const sId = parseInt(sIdStr, 10);
    if (isCavern && sId < 300) eligibleSetIds.push(sId);
    else if (!isCavern && sId >= 300) eligibleSetIds.push(sId);
  }
  eligibleSetIds.sort((a, b) => {
    if (a === recSetId) return -1;
    if (b === recSetId) return 1;
    return b - a;
  });

  eligibleSetIds.forEach(sId => {
    const sInfo = getRelicSetInfo(sId);
    const card = document.createElement('div');
    const isSelected = sId === slotPickerSelectedSetId;
    card.className = `slot-picker-set-card ${isSelected ? 'selected' : ''}`;
    card.innerHTML = `
      <img src="https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/relic/${sId}.png"
           onerror="this.src='./assets/logo.png'" alt="${sInfo.name}">
      <span title="${sInfo.name}">${sInfo.name}</span>
      ${sId === recSetId ? `<span style="font-size: 0.65rem; color: var(--accent-gold); font-weight: 800;">⭐ ${t('recommendedBadge')}</span>` : ''}
    `;

    card.addEventListener('click', () => {
      slotPickerSelectedSetId = sId;
      grid.querySelectorAll('.slot-picker-set-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });

    grid.appendChild(card);
  });
}

// Render Main Stat Pills for Slot
function renderSlotPickerMainStatPills(slot, recMainStat) {
  const container = document.getElementById('slot-picker-mainstat-pills');
  if (!container) return;
  container.innerHTML = '';

  const affixesBySlot = {
    1: [{ id: 1, name: "HP (Flat)" }],
    2: [{ id: 1, name: "ATK (Flat)" }],
    3: [
      { id: 4, name: "CRIT Rate%" },
      { id: 5, name: "CRIT DMG%" },
      { id: 2, name: "ATK%" },
      { id: 1, name: "HP%" },
      { id: 3, name: "DEF%" },
      { id: 6, name: "Healing Boost%" },
      { id: 7, name: "Effect Hit Rate%" }
    ],
    4: [
      { id: 4, name: "SPD" },
      { id: 2, name: "ATK%" },
      { id: 1, name: "HP%" },
      { id: 3, name: "DEF%" }
    ],
    5: [
      { id: 4, name: "Physical DMG%" },
      { id: 5, name: "Fire DMG%" },
      { id: 6, name: "Ice DMG%" },
      { id: 7, name: "Lightning DMG%" },
      { id: 8, name: "Wind DMG%" },
      { id: 9, name: "Quantum DMG%" },
      { id: 10, name: "Imaginary DMG%" },
      { id: 2, name: "ATK%" },
      { id: 1, name: "HP%" },
      { id: 3, name: "DEF%" }
    ],
    6: [
      { id: 2, name: "Energy Regen Rate%" },
      { id: 1, name: "Break Effect%" },
      { id: 4, name: "ATK%" },
      { id: 3, name: "HP%" },
      { id: 5, name: "DEF%" }
    ]
  };

  const list = affixesBySlot[slot] || [{ id: 1, name: "HP (Flat)" }];

  list.forEach(item => {
    const isSelected = item.id === slotPickerSelectedMainAffix;
    const isRec = item.id === recMainStat;

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = `slot-picker-pill ${isSelected ? 'selected' : ''} ${isRec ? 'recommended' : ''}`;
    pill.innerHTML = `
      ${isRec ? '⭐ ' : ''}<span>${item.name}</span>
    `;

    pill.addEventListener('click', () => {
      slotPickerSelectedMainAffix = item.id;
      container.querySelectorAll('.slot-picker-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      renderSlotPickerSubstats(slot, slotPickerSelectedMainAffix);
    });

    container.appendChild(pill);
  });
}

// Render Tab 2: Inventory Grid
function renderSlotPickerInventoryGrid(aid, slot) {
  const container = document.getElementById('slot-picker-inventory-list');
  const countBadge = document.getElementById('slot-picker-inv-count');
  if (!container) return;
  container.innerHTML = '';

  const allRelics = state.fullFreesrData?.relics || [];
  const matchingRelics = allRelics.filter(r => (r.relic_id % 10) === slot);
  if (countBadge) countBadge.textContent = matchingRelics.length;

  if (matchingRelics.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2.5rem 1rem;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📦</div>
        <div style="font-size: 1rem; font-weight: 700; color: #fff;">ไม่มีรีลิกส์สำหรับช่องนี้ในคลัง</div>
        <div style="font-size: 0.8rem; margin-top: 0.25rem;">
          สามารถสลับไปที่แท็บ <strong>"⚡ สวมใส่ / สร้างชิ้นแนะนำ"</strong> เพื่อสร้างชิ้นใหม่ได้ทันที!
        </div>
      </div>
    `;
    return;
  }

  matchingRelics.forEach(r => {
    const setId = Math.floor((r.relic_id % 10000) / 10);
    const rInfo = getRelicSetInfo(setId);
    const mainAffixName = getRelicMainAffixName(slot, r.main_affix_id);
    const isCurrent = r.equip_avatar === aid;
    const wearerMeta = r.equip_avatar && r.equip_avatar !== aid ? getAvatarInfo(r.equip_avatar) : null;

    const card = document.createElement('div');
    card.className = `slot-picker-inv-card ${isCurrent ? 'active-wearer' : ''}`;
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
        <div style="display: flex; gap: 0.65rem; align-items: center; min-width: 0;">
          <img src="https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/relic/${setId}.png"
               onerror="this.src='./assets/logo.png'" alt="${rInfo.name}"
               style="width: 40px; height: 40px; object-fit: contain;">
          <div style="min-width: 0;">
            <div style="font-weight: 800; font-size: 0.85rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${rInfo.name}
            </div>
            <div style="font-size: 0.725rem; color: var(--accent-gold); font-weight: 700;">
              5★ • Lv.${r.level}
            </div>
          </div>
        </div>
        <span class="badge-super-tag" style="background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); border-color: rgba(56, 189, 248, 0.4);">
          ✦ ${mainAffixName}
        </span>
      </div>

      <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.2rem; padding: 0.35rem 0.5rem; background: rgba(0,0,0,0.25); border-radius: 4px;">
        ${(r.sub_affixes || []).map(s => {
          const sName = getRelicSubAffixName(s.sub_affix_id);
          const rolls = s.count || s.cnt || 1;
          const val = formatRelicSubstatValue(s.sub_affix_id, rolls);
          return `<div>• ${sName} +${val} (+${rolls})</div>`;
        }).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
        <div style="font-size: 0.75rem;">
          ${isCurrent ? '<span style="color: var(--accent-gold); font-weight: 800;">(กำลังสวมใส่อยู่)</span>' :
            wearerMeta ? `<span style="color: var(--accent-cyan); font-weight: 700;">(สวมใส่โดย: ${wearerMeta.name})</span>` :
            '<span style="color: #4ade80; font-weight: 700;">(ว่างในคลัง)</span>'}
        </div>
        <button type="button" class="btn btn-sm ${isCurrent ? 'btn-gold' : 'btn-primary'}" style="font-size: 0.75rem; padding: 0.35rem 0.85rem;">
          ${isCurrent ? 'ใช้งานอยู่' : 'เลือกชิ้นนี้'}
        </button>
      </div>
    `;

    card.addEventListener('click', async () => {
      if (!isCurrent) {
        allRelics.forEach(other => {
          if (other.equip_avatar === aid && (other.relic_id % 10) === slot) {
            other.equip_avatar = 0;
          }
        });
        r.equip_avatar = aid;
        if (state.isConnected) await saveFreesrChangesToServer();
        renderModalRelicsTab(aid);
        renderModalOverviewTab(aid);
        renderShowcaseCard(aid);
        loadEquipment();
        showToast(`สวมใส่ ${rInfo.name} สำเร็จ!`, 'success');
        document.getElementById('modal-select-relic-slot')?.classList.remove('active');
      }
    });

    container.appendChild(card);
  });
}

// Equip custom created relic for avatar slot
async function equipCustomSlotRelic(avatarId, slotNum, setId, mainAffixId, customSubAffixes = null) {
  const aid = parseInt(avatarId, 10);
  const rec = getOptimalBuildForAvatar(aid);
  const relicId = 60000 + (setId * 10) + slotNum;

  if (!state.fullFreesrData) state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
  state.fullFreesrData.relics = state.fullFreesrData.relics || [];

  state.fullFreesrData.relics.forEach(r => {
    if (r.equip_avatar === aid && (r.relic_id % 10) === slotNum) {
      r.equip_avatar = 0;
    }
  });

  let subAffixes = [];
  if (customSubAffixes && customSubAffixes.length > 0) {
    subAffixes = customSubAffixes.map(s => ({
      sub_affix_id: parseInt(s.sub_affix_id, 10),
      cnt: parseInt(s.count || s.cnt || 1, 10),
      count: parseInt(s.count || s.cnt || 1, 10),
      step: 2
    }));
  } else {
    const conflictingSub = getConflictingSubstat(slotNum, mainAffixId);
    const pool = [...rec.substats, 7, 8, 9, 5, 12, 11, 4, 6];
    const chosenSubs = [];
    for (const sId of pool) {
      if (chosenSubs.length >= 4) break;
      if (sId !== conflictingSub && !chosenSubs.includes(sId)) {
        chosenSubs.push(sId);
      }
    }
    const rolls = [4, 3, 1, 1];
    subAffixes = chosenSubs.map((sid, idx) => ({
      sub_affix_id: sid,
      cnt: rolls[idx] || 1,
      count: rolls[idx] || 1,
      step: 2
    }));
  }

  const nextUid = (state.fullFreesrData.relics.reduce((m, r) => Math.max(m, r.internal_uid || 0), 0)) + 1;
  const newRelic = {
    internal_uid: nextUid,
    relic_id: relicId,
    level: 15,
    equip_avatar: aid,
    main_affix_id: mainAffixId,
    sub_affixes: subAffixes
  };
  state.fullFreesrData.relics.push(newRelic);

  if (state.isConnected) await saveFreesrChangesToServer();
  renderModalRelicsTab(aid);
  renderModalOverviewTab(aid);
  renderShowcaseCard(aid);
  loadEquipment();
  document.getElementById('modal-select-relic-slot')?.classList.remove('active');
  const setInfo = getRelicSetInfo(setId);
  showToast(`⚡ สวมใส่ ${setInfo.name} (+15 5★ ออฟที่เลือก) เรียบร้อยแล้ว!`, 'success');
}

// Save edits to existing relic (main stat & substats)
async function saveEditedRelicSubstats(relic, newSetId, newMainAffixId, newSubAffixes) {
  if (!relic) return;
  const slotNum = (relic.relic_id % 10) || 1;
  if (newSetId) {
    relic.relic_id = 60000 + (newSetId * 10) + slotNum;
  }
  relic.main_affix_id = newMainAffixId;
  relic.sub_affixes = newSubAffixes.map(s => ({
    sub_affix_id: parseInt(s.sub_affix_id, 10),
    cnt: parseInt(s.count || s.cnt || 1, 10),
    count: parseInt(s.count || s.cnt || 1, 10),
    step: 2
  }));

  if (state.isConnected) await saveFreesrChangesToServer();
  if (relic.equip_avatar) {
    renderModalRelicsTab(relic.equip_avatar);
    renderModalOverviewTab(relic.equip_avatar);
    renderShowcaseCard(relic.equip_avatar);
  }
  loadEquipment();
  showRelicInspector(relic);
  document.getElementById('modal-select-relic-slot')?.classList.remove('active');
  slotPickerTargetRelic = null;
  const rInfo = getRelicSetInfo(newSetId || Math.floor((relic.relic_id % 10000) / 10));
  showToast(`💾 บันทึกการแก้ไขออฟรอง ${rInfo.name} เรียบร้อย!`, 'success');
}

async function quickGenSlotRelic(avatarId, slotNum) {
  const aid = parseInt(avatarId, 10);
  const rec = getOptimalBuildForAvatar(aid);
  const setId = slotNum <= 4 ? rec.cavern : rec.planar;
  let mainAffix = 1;
  if (slotNum === 1 || slotNum === 2) mainAffix = 1;
  else if (slotNum === 3) mainAffix = rec.body;
  else if (slotNum === 4) mainAffix = rec.feet;
  else if (slotNum === 5) mainAffix = rec.sphere;
  else if (slotNum === 6) mainAffix = rec.rope;
}

// Open Lightcone Picker Modal
function openLightconePicker(avatarId) {
  state.lcPickerAvatarId = parseInt(avatarId, 10);
  const aid = state.lcPickerAvatarId;
  const meta = getAvatarInfo(aid);
  const modal = document.getElementById('modal-select-lightcone');
  if (!modal) return;

  const titleEl = document.getElementById('modal-lc-picker-title');
  if (titleEl) {
    titleEl.textContent = `🗡️ เลือกสวมใส่กรวยแสง: ${meta.name}`;
  }

  const sigLcId = SIGNATURE_LIGHTCONES[aid];
  const sigBox = document.getElementById('lc-picker-signature-box');
  const sigThumb = document.getElementById('lc-picker-sig-thumb');
  const sigName = document.getElementById('lc-picker-sig-name');
  const btnQuickSig = document.getElementById('btn-lc-picker-quick-sig');

  if (sigLcId && LIGHTCONE_METADATA[sigLcId]) {
    const sInfo = getLightconeInfo(sigLcId);
    if (sigBox) sigBox.style.display = 'flex';
    if (sigThumb) {
      sigThumb.src = getLightconeArtSrc(sigLcId);
      sigThumb.onerror = function() { this.src = getLightconeArtFallback(sigLcId); };
    }
    if (sigName) sigName.textContent = `${sInfo.name} (★${sInfo.rarity} ${sInfo.path})`;
    if (btnQuickSig) {
      btnQuickSig.onclick = async () => {
        const rank = parseInt(document.getElementById('lc-picker-rank')?.value || '5', 10);
        await equipLightconeToAvatar(aid, sigLcId, rank, 80);
        modal.classList.remove('active');
      };
    }
  } else if (sigBox) {
    sigBox.style.display = 'none';
  }

  const pathSelect = document.getElementById('lc-picker-filter-path');
  if (pathSelect) pathSelect.value = 'same';

  const searchInput = document.getElementById('lc-picker-search');
  if (searchInput) searchInput.value = '';

  renderLightconePickerGrid();
  modal.classList.add('active');
}

// Render Lightcone Picker Grid
function renderLightconePickerGrid() {
  const listEl = document.getElementById('lc-picker-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  const aid = state.lcPickerAvatarId;
  const avatarMeta = getAvatarInfo(aid);
  const search = document.getElementById('lc-picker-search')?.value.trim().toLowerCase() || '';
  const pathFilter = document.getElementById('lc-picker-filter-path')?.value || 'same';
  const rank = parseInt(document.getElementById('lc-picker-rank')?.value || '5', 10);

  const currentLc = (state.fullFreesrData?.lightcones || []).find(l => l.equip_avatar === aid);

  const allIds = Object.keys(LIGHTCONE_METADATA).map(id => parseInt(id, 10)).sort((a, b) => {
    const metaA = LIGHTCONE_METADATA[a];
    const metaB = LIGHTCONE_METADATA[b];
    if (metaB.rarity !== metaA.rarity) return metaB.rarity - metaA.rarity;
    return b - a;
  });

  const filtered = allIds.filter(id => {
    const meta = LIGHTCONE_METADATA[id];
    const info = getLightconeInfo(id);

    // Path match
    if (pathFilter === 'same' && normalizePath(meta.path) !== normalizePath(avatarMeta.path)) return false;
    if (pathFilter !== 'all' && pathFilter !== 'same' && normalizePath(meta.path) !== normalizePath(pathFilter)) return false;

    // Search match
    if (search) {
      const matchName = info.name.toLowerCase().includes(search);
      const matchId = String(id).includes(search);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">ไม่พบกรวยแสงตามเงื่อนไขที่ค้นหา</div>`;
    return;
  }

  filtered.forEach(id => {
    const meta = LIGHTCONE_METADATA[id];
    const info = getLightconeInfo(id);
    const isCurrent = currentLc?.item_id === id;
    const isSig = SIGNATURE_LIGHTCONES[aid] === id;

    const card = document.createElement('div');
    card.className = `lc-picker-card rarity-${info.rarity} ${isCurrent ? 'active-equipped' : ''}`;

    let badgeHtml = '';
    if (isCurrent) {
      badgeHtml = `<span style="font-size: 0.65rem; background: var(--accent-gold); color: #000; font-weight: 800; padding: 0.1rem 0.4rem; border-radius: 4px;">สวมใส่อยู่</span>`;
    } else if (isSig) {
      badgeHtml = `<span style="font-size: 0.65rem; background: rgba(251, 191, 36, 0.2); border: 1px solid var(--accent-gold); color: var(--accent-gold); font-weight: 800; padding: 0.1rem 0.4rem; border-radius: 4px;">ประจำตัว</span>`;
    }

    card.innerHTML = `
      <img class="lc-picker-thumb" src="${getLightconeArtSrc(id)}" onerror="this.src='${getLightconeArtFallback(id)}'" alt="${info.name}">
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.35rem;">
          <span style="font-weight: 800; font-size: 0.85rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${info.name}">${info.name}</span>
          ${badgeHtml}
        </div>
        <div style="font-size: 0.725rem; color: var(--accent-gold); margin-top: 0.2rem;">${'★'.repeat(info.rarity || 5)}</div>
        <div style="font-size: 0.7rem; color: var(--accent-cyan); margin-top: 0.15rem;">
          ${getPathIconHtml(meta.path, 14)} ${info.path}
        </div>
      </div>
    `;

    card.addEventListener('click', async () => {
      await equipLightconeToAvatar(aid, id, rank, 80);
      document.getElementById('modal-select-lightcone')?.classList.remove('active');
    });

    listEl.appendChild(card);
  });
}

// Equip Lightcone directly to Avatar
async function equipLightconeToAvatar(avatarId, lcId, rank = 5, level = 80) {
  const aid = parseInt(avatarId, 10);
  const id = parseInt(lcId, 10);
  const meta = getAvatarInfo(aid);
  const lcInfo = getLightconeInfo(id);

  if (!state.fullFreesrData) state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
  state.fullFreesrData.lightcones = state.fullFreesrData.lightcones || [];

  // 1. Unassign other lightcones from this avatar
  state.fullFreesrData.lightcones.forEach(lc => {
    if (lc.equip_avatar === aid) lc.equip_avatar = 0;
  });

  // 2. Find or create lightcone entry
  let targetLc = state.fullFreesrData.lightcones.find(lc => lc.item_id === id && (!lc.equip_avatar || lc.equip_avatar === 0));
  if (!targetLc) {
    targetLc = state.fullFreesrData.lightcones.find(lc => lc.item_id === id);
    if (targetLc) {
      targetLc.equip_avatar = aid;
      targetLc.rank = rank;
      targetLc.level = level;
      targetLc.promotion = 6;
    } else {
      let maxUid = 1000;
      state.fullFreesrData.lightcones.forEach(l => {
        if (l.unique_id >= maxUid) maxUid = l.unique_id + 1;
      });
      targetLc = {
        unique_id: maxUid,
        internal_uid: state.fullFreesrData.lightcones.length,
        item_id: id,
        level: level,
        rank: rank,
        promotion: 6,
        equip_avatar: aid
      };
      state.fullFreesrData.lightcones.push(targetLc);
    }
  } else {
    targetLc.equip_avatar = aid;
    targetLc.rank = rank;
    targetLc.level = level;
    targetLc.promotion = 6;
  }

  if (state.isConnected) {
    await saveFreesrChangesToServer().catch(() => {});
  }

  renderModalOverviewTab(aid);
  renderModalRelicsTab(aid);
  renderShowcaseCard(aid);
  renderLightconesGrid();

  showToast(`🗡️ สวมใส่ ${lcInfo.name} (S${rank}) ให้กับ ${meta.name} เรียบร้อย!`, 'success');
}

// Unequip Lightcone from Avatar
async function unequipLightconeFromAvatar(avatarId) {
  const aid = parseInt(avatarId, 10);
  const meta = getAvatarInfo(aid);
  if (state.fullFreesrData?.lightcones) {
    state.fullFreesrData.lightcones.forEach(lc => {
      if (lc.equip_avatar === aid) lc.equip_avatar = 0;
    });
    if (state.isConnected) await saveFreesrChangesToServer().catch(() => {});
    renderModalOverviewTab(aid);
    renderModalRelicsTab(aid);
    renderShowcaseCard(aid);
    renderLightconesGrid();
    showToast(`ถอดกรวยแสงออกจาก ${meta.name} เรียบร้อย`, 'info');
  }
}

// Quick Set All Avatars to E0S1 Standard (Lv.80, Prom 6, E0, S1 Signature LC)
async function quickSetAllAvatarsE0S1() {
  try {
    if (!state.fullFreesrData) {
      state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
    }
    state.fullFreesrData.avatars = state.fullFreesrData.avatars || {};
    state.fullFreesrData.lightcones = state.fullFreesrData.lightcones || [];

    const allAvatarIds = Object.keys(AVATARS_DATA).map(id => parseInt(id, 10));

    let nextUniqueId = 1000;
    state.fullFreesrData.lightcones.forEach(lc => {
      if (lc.unique_id >= nextUniqueId) nextUniqueId = lc.unique_id + 1;
    });

    for (const aid of allAvatarIds) {
      if (!state.fullFreesrData.avatars[aid]) {
        state.fullFreesrData.avatars[aid] = {
          owner_uid: 0,
          avatar_id: aid,
          level: 80,
          promotion: 6,
          techniques: [],
          sp_max: 140,
          sp_value: 70,
          data: {
            rank: 0,
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
        av.data.rank = 0;
        if (!av.sp_value) av.sp_value = 70;
      }

      // Equip S1 Signature Lightcone
      const sigLcId = SIGNATURE_LIGHTCONES[aid] || 21001;
      let existingLc = state.fullFreesrData.lightcones.find(l => l.equip_avatar === aid);
      if (existingLc) {
        existingLc.item_id = sigLcId;
        existingLc.rank = 1;
        existingLc.level = 80;
        existingLc.promotion = 6;
      } else {
        state.fullFreesrData.lightcones.push({
          unique_id: nextUniqueId++,
          internal_uid: state.fullFreesrData.lightcones.length,
          item_id: sigLcId,
          level: 80,
          promotion: 6,
          rank: 1,
          equip_avatar: aid
        });
      }
    }

    initAvatarsList();
    state.avatarsList.forEach(a => {
      a.level = 80;
      a.promotion = 6;
      a.rank = 0;
    });

    if (state.isConnected) {
      await saveFreesrChangesToServer().catch(() => {});
    }

    renderAvatarsGrid();
    if (el.statAvatars) el.statAvatars.textContent = Object.keys(state.fullFreesrData.avatars).length;
    showToast('⚡ ปรับตัวละครทุกตัวเป็น E0S1 พร้อมกรวยแสงประจำตัวเรียบร้อยแล้ว!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Render Skills Tab with real StarRailRes descriptions & icons
async function renderModalSkillsTab(avatarId) {
  const aid = String(avatarId);
  const currentLang = getCurrentLanguage() || 'th';

  const { skills, trees } = await loadCharacterSkillsData(currentLang);

  const avatarSkills = Object.values(skills || {}).filter(s => String(s.id).startsWith(aid));
  const basicSkill = avatarSkills.find(s => s.type === 'Normal') || avatarSkills[0];
  const combatSkill = avatarSkills.find(s => s.type === 'BPSkill') || avatarSkills[1];
  const ultraSkill = avatarSkills.find(s => s.type === 'Ultra') || avatarSkills[2];
  const talentSkill = avatarSkills.find(s => s.type === 'Talent') || avatarSkills[3];
  const techSkill = avatarSkills.find(s => s.type === 'Maze' || s.type === 'MazeNormal');

  const a2Node = trees?.[`${aid}101`] || Object.values(trees || {}).find(t => String(t.id).startsWith(aid) && t.anchor === 'Point06');
  const a4Node = trees?.[`${aid}102`] || Object.values(trees || {}).find(t => String(t.id).startsWith(aid) && t.anchor === 'Point07');
  const a6Node = trees?.[`${aid}103`] || Object.values(trees || {}).find(t => String(t.id).startsWith(aid) && t.anchor === 'Point08');

  // 1. Basic Attack
  if (basicSkill) {
    if (el.skillIconBasic) el.skillIconBasic.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${basicSkill.icon}`;
    if (el.skillRealNameBasic) el.skillRealNameBasic.textContent = basicSkill.name;
    const curLvl = parseInt(el.rangeSkillBasic?.value || 6, 10);
    if (el.skillDescBasic) el.skillDescBasic.innerHTML = formatSkillDesc(basicSkill.desc, basicSkill.params, curLvl);
  }

  // 2. Skill
  if (combatSkill) {
    if (el.skillIconSkill) el.skillIconSkill.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${combatSkill.icon}`;
    if (el.skillRealNameSkill) el.skillRealNameSkill.textContent = combatSkill.name;
    const curLvl = parseInt(el.rangeSkillSkill?.value || 10, 10);
    if (el.skillDescSkill) el.skillDescSkill.innerHTML = formatSkillDesc(combatSkill.desc, combatSkill.params, curLvl);
  }

  // 3. Ultimate
  if (ultraSkill) {
    if (el.skillIconUltra) el.skillIconUltra.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${ultraSkill.icon}`;
    if (el.skillRealNameUltra) el.skillRealNameUltra.textContent = ultraSkill.name;
    const curLvl = parseInt(el.rangeSkillUltra?.value || 10, 10);
    if (el.skillDescUltra) el.skillDescUltra.innerHTML = formatSkillDesc(ultraSkill.desc, ultraSkill.params, curLvl);
  }

  // 4. Talent
  if (talentSkill) {
    if (el.skillIconTalent) el.skillIconTalent.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${talentSkill.icon}`;
    if (el.skillRealNameTalent) el.skillRealNameTalent.textContent = talentSkill.name;
    const curLvl = parseInt(el.rangeSkillTalent?.value || 10, 10);
    if (el.skillDescTalent) el.skillDescTalent.innerHTML = formatSkillDesc(talentSkill.desc, talentSkill.params, curLvl);
  }

  // Technique
  if (techSkill) {
    if (el.skillIconTechnique) el.skillIconTechnique.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${techSkill.icon}`;
    if (el.skillRealNameTechnique) el.skillRealNameTechnique.textContent = techSkill.name;
    if (el.skillDescTechnique) el.skillDescTechnique.innerHTML = formatSkillDesc(techSkill.desc, techSkill.params, 1);
  }

  // Traces
  if (a2Node) {
    if (el.traceIconA2) el.traceIconA2.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${a2Node.icon}`;
    if (el.traceNameA2) el.traceNameA2.textContent = `🌟 ${a2Node.name || 'ร่องรอย A2'}`;
    if (el.traceDescA2) el.traceDescA2.innerHTML = formatSkillDesc(a2Node.desc, a2Node.params, 1);
  }
  if (a4Node) {
    if (el.traceIconA4) el.traceIconA4.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${a4Node.icon}`;
    if (el.traceNameA4) el.traceNameA4.textContent = `🌟 ${a4Node.name || 'ร่องรอย A4'}`;
    if (el.traceDescA4) el.traceDescA4.innerHTML = formatSkillDesc(a4Node.desc, a4Node.params, 1);
  }
  if (a6Node) {
    if (el.traceIconA6) el.traceIconA6.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${a6Node.icon}`;
    if (el.traceNameA6) el.traceNameA6.textContent = `🌟 ${a6Node.name || 'ร่องรอย A6'}`;
    if (el.traceDescA6) el.traceDescA6.innerHTML = formatSkillDesc(a6Node.desc, a6Node.params, 1);
  }
}

// Character Detail / Build Modal (srtools & neonteam style)
function openAvatarDetailModal(avatarItem) {
  state.selectedAvatarDetail = avatarItem;
  const aid = avatarItem.avatar_id;
  const meta = getAvatarInfo(aid);

  el.modalCharTitle.textContent = `${t('modalTitleCharEdit')}: ${meta.name} (ID: ${aid})`;
  el.modalCharImg.src = getAvatarIconSrc(aid);
  el.modalCharImg.onerror = function() {
    handleAvatarImgError(this, aid);
  };
  el.modalCharName.textContent = meta.name;
  el.modalCharMeta.innerHTML = `
    ${getElementIconHtml(meta.element, 24)}
    ${getPathIconHtml(meta.path, 24)}
    <span class="avatar-badge-rarity rarity-${meta.rarity}" style="position: static;">★ ${meta.rarity}</span>
  `;

  // Render character switcher strip (Neonteam style)
  renderModalSwitcher(aid);

  // Default to Overview sub-tab
  switchModalSubtab('modaltab-overview');

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

  // Lightcone initialization & full preview
  populateModalChangeLcDropdown(meta.path);
  const equippedLc = (state.fullFreesrData?.lightcones || []).find(lc => lc.equip_avatar === aid);
  const activeLcId = equippedLc?.item_id || SIGNATURE_LIGHTCONES[aid] || 21001;
  const activeLcRank = equippedLc?.rank || 5;
  const activeLcLevel = equippedLc?.level || 80;

  selectedLcRank = activeLcRank;
  updateModalLcFullView(activeLcId, activeLcRank, activeLcLevel);

  // Render Subtabs
  renderModalOverviewTab(aid);
  renderModalRelicsTab(aid);
  renderModalSkillsTab(aid);
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
async function saveAvatarDetails(closeModal = true) {
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
      // Save the complete avatar record once. The full payload includes skills
      // and Trace values; a preceding rank-only request can trigger live sync
      // with an incomplete intermediate state.
      await saveFreesrChangesToServer();
      showToast(t('toastCharSaved', { name: getAvatarInfo(aid).name }), 'success');
    } catch (err) {
      showToast(`บันทึกไม่สำเร็จ: ${err.message}`, 'error');
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

  // Light Cone: Equip true Signature LC Lv 80, S5
  const sigLcId = SIGNATURE_LIGHTCONES[aid] || 21001;
  if (el.modalLcId) el.modalLcId.value = sigLcId;
  selectedLcRank = 5;
  updateModalLcFullView(sigLcId, 5, 80);

  // Equip optimal relics
  await autoEquipRecommendedRelics(aid, false);

  await saveAvatarDetails(false);
  renderShowcaseCard(aid);
  showToast(t('toastE6S5Applied'), 'success');
}

// Apply E0S1 Build (Lv.80, Prom 6, E0, Max Skills/Traces, 50% Energy, S1 Signature Light Cone)
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

  // Light Cone: Equip true Signature LC Lv 80, S1
  const sigLcId = SIGNATURE_LIGHTCONES[aid] || 21001;
  if (el.modalLcId) el.modalLcId.value = sigLcId;
  selectedLcRank = 1;
  updateModalLcFullView(sigLcId, 1, 80);

  // Equip optimal relics
  await autoEquipRecommendedRelics(aid, false);

  await saveAvatarDetails(false);
  renderShowcaseCard(aid);
  showToast(t('toastE0S1Applied'), 'info');
}

// Render Showcase Card (Matching srtools.punklorde.org/showcase-card)
function renderShowcaseCard(avatarId) {
  if (!el.showcaseCardContainer) return;
  const aid = parseInt(avatarId, 10);
  const meta = getAvatarInfo(aid);
  const canonPath = normalizePath(meta.rawPath || meta.path);
  const canonElem = normalizeElement(meta.rawElement || meta.element);
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

  const lcHp = lcMeta.hp || (lcMeta.rarity === 5 ? 1164 : (lcMeta.rarity === 4 ? 953 : 846));
  const lcAtk = lcMeta.atk || (lcMeta.rarity === 5 ? 582 : (lcMeta.rarity === 4 ? 423 : 317));
  const lcDef = lcMeta.def || (lcMeta.rarity === 5 ? 529 : (lcMeta.rarity === 4 ? 396 : 264));

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
    const rec = RECOMMENDED_RELIC_BUILDS[canonPath] || RECOMMENDED_RELIC_BUILDS.Preservation;
    activeSetBadges.push({ name: getRelicSetInfo(rec.cavern).name, count: 4 });
    activeSetBadges.push({ name: getRelicSetInfo(rec.planar).name, count: 2 });
  }

  // Combat Stats
  const totalHp = Math.round((baseHp + lcHp) * 1.45 + 706);
  const totalAtk = Math.round((baseAtk + lcAtk) * 1.35 + 353);
  const totalDef = Math.round((baseDef + lcDef) * 1.85 + (canonPath === 'Preservation' ? 1200 : 0));
  const totalSpd = (baseSpd + 25 + 10.5).toFixed(1);
  const critRate = (5.0 + (canonPath === 'Hunt' || canonPath === 'Destruction' ? 65.4 : 18.8)).toFixed(1);
  const critDmg = (50.0 + (canonPath === 'Hunt' || canonPath === 'Destruction' ? 132.5 : 26.5)).toFixed(1);
  const breakEffect = (canonPath === 'Harmony' || canonPath === 'Nihility' ? 142.0 : 10.4).toFixed(1);
  const effectRes = (10.0).toFixed(1);
  const err = (19.4).toFixed(1);
  const ehr = (canonPath === 'Nihility' ? 67.2 : 19.4).toFixed(1);
  const healing = (canonPath === 'Abundance' ? 34.5 : 0.0).toFixed(1);
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
        <span style="color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; margin-right: 0.5rem;" title="${sb.name}">${sb.name}</span>
        <span class="showcase-set-badge">${sb.count}-PC</span>
      </div>
    `;
  });

  // Relic cards (Slots 1 to 6)
  const slotNames = {
    1: { name: "ส่วนหัว", stat: "HP 706" },
    2: { name: "ส่วนมือ", stat: "ATK 353" },
    3: { name: "ลำตัว", stat: canonPath === 'Preservation' ? "DEF 54.0%" : (canonPath === 'Hunt' ? "CRIT Rate 32.4%" : "HP 43.2%") },
    4: { name: "รองเท้า", stat: "SPD 25.0" },
    5: { name: "ลูกแก้ว", stat: `${translateElement(canonElem)} 38.8%` },
    6: { name: "สร้อย", stat: canonPath === 'Preservation' || canonPath === 'Harmony' ? "ERR 19.4%" : "ATK 43.2%" }
  };

  const showRolls = localStorage.getItem('gac_srtool_showcase_rolls') !== 'false';
  const showAura = localStorage.getItem('gac_srtool_showcase_aura') !== 'false';
  const rollBadge = (rolls) => showRolls ? `<span style="display:inline-block; font-size:0.65rem; color:var(--accent-gold); font-weight:800; background:rgba(234,179,8,0.18); border-radius:3px; padding:0 3px; margin-left:3px;">+${rolls}</span>` : '';

  let relicsHtml = '';
  for (let slot = 1; slot <= 6; slot++) {
    const equipped = avatarRelics.find(r => (r.relic_id % 10 === slot));
    const rec = RECOMMENDED_RELIC_BUILDS[canonPath] || RECOMMENDED_RELIC_BUILDS.Preservation;
    const setId = equipped ? Math.floor((equipped.relic_id % 10000) / 10) : (slot <= 4 ? rec.cavern : rec.planar);
    const rInfo = getRelicSetInfo(setId);
    const slotInfo = slotNames[slot];

    let mainStatDisplay = slotInfo.stat;
    if (equipped && equipped.main_affix_id) {
      mainStatDisplay = getRelicMainAffixName(slot, equipped.main_affix_id);
    }

    let subsDisplayHtml = '';
    if (equipped && equipped.sub_affixes && equipped.sub_affixes.length > 0) {
      subsDisplayHtml = equipped.sub_affixes.map(sub => {
        const sName = getRelicSubAffixName(sub.sub_affix_id);
        const rolls = sub.count || sub.cnt || 1;
        const val = formatRelicSubstatValue(sub.sub_affix_id, rolls);
        return `<span>${sName} +${val}${rollBadge(rolls)}</span>`;
      }).join('');
    } else {
      subsDisplayHtml = `
        <span>CRIT Rate +${(3.2 + slot * 1.5).toFixed(1)}%${rollBadge(slot % 2 === 0 ? 3 : 2)}</span>
        <span>CRIT DMG +${(5.8 + slot * 2.1).toFixed(1)}%${rollBadge(slot % 3 === 0 ? 4 : 2)}</span>
        <span>ATK +${(3.8 + slot * 0.8).toFixed(1)}%${rollBadge(1)}</span>
        <span>DEF +${(4.8 + slot * 1.2).toFixed(1)}%${rollBadge(1)}</span>
      `;
    }

    relicsHtml += `
      <div class="showcase-relic-card">
        <div class="showcase-relic-icon-wrap">
          <img class="showcase-relic-img" src="https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/relic/${setId}.png" onerror="this.src='./assets/logo.png'" alt="Relic">
          <span class="showcase-relic-lvl-tag">+15</span>
        </div>
        <div class="showcase-relic-info">
          <div class="showcase-relic-main-stat">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; margin-right: 0.5rem;" title="${rInfo.name}">${rInfo.name}</span>
            <span style="color: var(--accent-cyan); font-weight: 800; flex-shrink: 0;">✦ ${mainStatDisplay}</span>
          </div>
          <div class="showcase-relic-subs">
            ${subsDisplayHtml}
          </div>
        </div>
      </div>
    `;
  }

  const primaryPortrait = getAvatarSplashSrc(aid);
  const fallbackPortrait = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/character_portrait/${aid}.png`;
  const lcArtThumb = getLightconeArtSrc(lcId);

  el.showcaseCardContainer.innerHTML = `
    <!-- 1. Left Splash Art Column -->
    <div class="showcase-splash-col">
      <img class="showcase-splash-img" src="${primaryPortrait}" onerror="handleAvatarPortraitError(this, ${aid})" alt="${meta.name}">
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
        <img class="showcase-lc-thumb" src="${lcArtThumb}" onerror="handleLcImgError(this, ${lcId})" alt="${lcInfo.name}">
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

  // Apply Element Aura Glow
  const auraGlows = {
    Physical: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
    Fire: 'linear-gradient(135deg, rgba(79, 15, 15, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
    Ice: 'linear-gradient(135deg, rgba(12, 74, 96, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
    Lightning: 'linear-gradient(135deg, rgba(68, 15, 110, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
    Wind: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
    Quantum: 'linear-gradient(135deg, rgba(49, 46, 129, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
    Imaginary: 'linear-gradient(135deg, rgba(88, 40, 5, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)'
  };
  const auraBorders = {
    Physical: 'rgba(203, 213, 225, 0.35)',
    Fire: 'rgba(239, 68, 68, 0.45)',
    Ice: 'rgba(56, 189, 248, 0.45)',
    Lightning: 'rgba(168, 85, 247, 0.45)',
    Wind: 'rgba(52, 211, 153, 0.45)',
    Quantum: 'rgba(129, 140, 248, 0.45)',
    Imaginary: 'rgba(251, 191, 36, 0.45)'
  };

  if (showAura && auraGlows[canonElem]) {
    el.showcaseCardContainer.style.background = auraGlows[canonElem];
    el.showcaseCardContainer.style.borderColor = auraBorders[canonElem] || 'var(--border-color)';
    el.showcaseCardContainer.style.boxShadow = `0 10px 40px -10px ${auraBorders[canonElem] || 'rgba(0,0,0,0.5)'}`;
  } else {
    el.showcaseCardContainer.style.background = 'linear-gradient(135deg, #0d121f 0%, #171f30 100%)';
    el.showcaseCardContainer.style.borderColor = 'var(--border-color)';
    el.showcaseCardContainer.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
  }
}

// Auto-equip recommended 6-piece relics for avatar
async function autoEquipRecommendedRelics(avatarId, notify = true) {
  if (!state.fullFreesrData) {
    state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
  }
  state.fullFreesrData.relics = state.fullFreesrData.relics || [];
  const aid = parseInt(avatarId, 10);
  const meta = getAvatarInfo(aid);
  const rec = getOptimalBuildForAvatar(aid);

  // Clear existing relics on this character
  state.fullFreesrData.relics = state.fullFreesrData.relics.filter(r => r.equip_avatar !== aid);

  let nextUid = (state.fullFreesrData.relics.reduce((m, r) => Math.max(m, r.internal_uid || 0), 0)) + 1;

  const mainToSubConflict = {
    3: { 1: 4, 2: 5, 3: 6, 4: 8, 5: 9, 7: 10 },
    4: { 1: 4, 2: 5, 3: 6, 4: 7 },
    5: { 1: 4, 2: 5, 3: 6 },
    6: { 1: 12, 3: 4, 4: 5, 5: 6 }
  };

  for (let slot = 1; slot <= 6; slot++) {
    const setId = slot <= 4 ? rec.cavern : rec.planar;
    const relicId = 60000 + (setId * 10) + slot;

    let mainAffixId = 1;
    if (slot === 1 || slot === 2) {
      mainAffixId = 1;
    } else if (slot === 3) {
      mainAffixId = rec.body;
    } else if (slot === 4) {
      mainAffixId = rec.feet;
    } else if (slot === 5) {
      mainAffixId = rec.sphere;
    } else if (slot === 6) {
      mainAffixId = rec.rope;
    }

    // Select 4 non-conflicting god-tier substats
    const conflictingSub = mainToSubConflict[slot]?.[mainAffixId];
    const pool = [...rec.substats, 7, 8, 9, 5, 12, 11, 4, 6];
    const chosenSubs = [];
    for (const sId of pool) {
      if (chosenSubs.length >= 4) break;
      if (sId !== conflictingSub && !chosenSubs.includes(sId)) {
        chosenSubs.push(sId);
      }
    }

    const rolls = [4, 3, 1, 1];
    const subAffixes = chosenSubs.map((sid, idx) => ({
      sub_affix_id: sid,
      cnt: rolls[idx] || 1,
      count: rolls[idx] || 1,
      step: 2
    }));

    state.fullFreesrData.relics.push({
      internal_uid: nextUid++,
      relic_id: relicId,
      level: 15,
      equip_avatar: aid,
      main_affix_id: mainAffixId,
      sub_affixes: subAffixes
    });
  }

  if (state.isConnected) {
    await saveFreesrChangesToServer();
  }
  loadEquipment();
  renderShowcaseCard(aid);
  if (state.selectedAvatarDetail?.avatar_id === aid) {
    renderModalRelicsTab(aid);
    renderModalOverviewTab(aid);
  }
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

// Export Showcase Card as high-res PNG image using html2canvas
async function exportShowcaseImage(avatarId) {
  const meta = getAvatarInfo(avatarId);
  const showcaseEl = document.getElementById('showcase-card-container');
  if (!showcaseEl) return;

  showToast('กำลังประมวลผลและสร้างรูปภาพการ์ด PNG...', 'info');

  if (typeof html2canvas !== 'undefined') {
    try {
      const origWidth = showcaseEl.style.width;
      const origMinWidth = showcaseEl.style.minWidth;
      showcaseEl.style.width = '1050px';
      showcaseEl.style.minWidth = '1050px';

      const canvas = await html2canvas(showcaseEl, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: '#0c1222',
        windowWidth: 1280
      });

      showcaseEl.style.width = origWidth;
      showcaseEl.style.minWidth = origMinWidth;

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      const cleanName = meta.name.replace(/[^a-zA-Z0-9ก-๙_-]/g, '_');
      a.download = `${cleanName}_Build_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('ดาวน์โหลดรูปภาพการ์ด PNG เรียบร้อยแล้ว!', 'success');
      return;
    } catch (err) {
      console.warn('html2canvas failed, falling back to print view:', err);
    }
  }

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

// Server Lineup Persistence Manager (GaC Persistent vs FireflyGo data-in-game vs FreeSR)
async function saveLineupToServer(lineupData) {
  if (!lineupData) return;

  // 1. GaC server handles lineups in persistent
  if (state.serverMode === 'gac') {
    if (state.persistentData) {
      state.persistentData.lineups = lineupData;
      savePersistentCache(state.persistentData);
    }
    if (state.isConnected) {
      await apiCall('/api/persistent', 'POST', { lineups: lineupData }).catch(() => {});
    }
  }

  // 2. FireflyGo / FreeSR servers handle lineups in freesr-data.json
  if (!state.fullFreesrData) {
    state.fullFreesrData = { avatars: {}, lightcones: [], relics: [] };
  }
  state.fullFreesrData.lineups = { ...lineupData };
  if (!state.fullFreesrData.battle_config) {
    state.fullFreesrData.battle_config = {};
  }

  // Dynamically map all active slots in order - never truncate slots in Creative Mode!
  const slotKeys = Object.keys(lineupData).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const fullArr = slotKeys.map(k => lineupData[k] || 0);
  state.fullFreesrData.battle_config.custom_battle_lineup = fullArr;
  state.fullFreesrData.custom_battle_lineup = fullArr;
  await saveFreesrCache(state.fullFreesrData);

  // 3. Firefly live state in data-in-game.json
  if (state.dataGameData || state.serverMode === 'firefly') {
    state.dataGameData = state.dataGameData || { ...DEFAULT_DATA_GAME };
    state.dataGameData.lineups = { ...lineupData };
    await saveDataGameCache(state.dataGameData);
    if (state.isConnected) {
      await apiCall('/api/data-in-game', 'POST', state.dataGameData).catch(() => {});
    }
  }

  if (state.isConnected && state.serverMode !== 'gac') {
    await saveFreesrChangesToServer().catch(() => {});
  }
}

// ============================================================================
// Quick Action Functions
// ============================================================================

// 1. Quick Set Entire Lineup to E0S1 Standard
async function quickSetLineupE0S1() {
  try {
    state.statusData = state.statusData || {};
    const lineups = state.statusData.lineups || DEFAULT_LINEUP;
    const lineupIds = Object.values(lineups).filter(id => id && id > 0);
    if (lineupIds.length === 0) {
      showToast(t('slotEmpty') || 'ไม่มีตัวละครในทีม', 'warning');
      return;
    }

    for (const aid of lineupIds) {
      await setAvatarE0S1(aid);
    }
    showToast('ปรับตัวละครทุกคนในทีมเป็น E0S1 พร้อมรบเรียบร้อยแล้ว!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 2. Quick Equip Recommended Relics for Entire Lineup
async function quickEquipLineupRelics() {
  try {
    state.statusData = state.statusData || {};
    const lineups = state.statusData.lineups || DEFAULT_LINEUP;
    const lineupIds = Object.values(lineups).filter(id => id && id > 0);
    if (lineupIds.length === 0) {
      showToast(t('slotEmpty') || 'ไม่มีตัวละครในทีม', 'warning');
      return;
    }

    for (const aid of lineupIds) {
      await autoEquipRecommendedRelics(aid, false);
    }
    showToast('ติดตั้งรีลิกส์และเครื่องประดับแนะนำให้ทั้งทีมเรียบร้อยแล้ว!', 'success');
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

    await saveLineupToServer(cleared);

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

// Push local freesr changes to server and save to local browser cache
async function saveFreesrChangesToServer() {
  if (!state.fullFreesrData) return;
  await saveFreesrCache(state.fullFreesrData);

  // Attempt to push to server
  let lastErr = null;
  const payloadWrapped = { data: state.fullFreesrData };
  const payloadDirect = state.fullFreesrData;

  if (state.serverMode === 'firefly' || state.serverMode === 'robin') {
    try {
      await apiCall('/srtools', 'POST', payloadWrapped);
      state.isConnected = true;
      return;
    } catch (e1) {
      lastErr = e1;
      try {
        await apiCall('/api/freesr', 'POST', payloadDirect);
        state.isConnected = true;
        return;
      } catch (e2) {
        lastErr = e2;
      }
    }
  } else {
    // gac or default
    try {
      await apiCall('/api/freesr', 'POST', payloadDirect);
      state.isConnected = true;
      return;
    } catch (e1) {
      lastErr = e1;
      try {
        await apiCall('/srtools', 'POST', payloadWrapped);
        state.isConnected = true;
        return;
      } catch (e2) {
        lastErr = e2;
      }
    }
  }

  if (lastErr) throw lastErr;
}

// Equipment Sub-tab & Filter Helpers (Matching srtools neonteam)
const ROMAN_RANKS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
const RELIC_SLOT_NAMES = {
  1: "ส่วนหัว",
  2: "ส่วนมือ",
  3: "ลำตัว",
  4: "รองเท้า",
  5: "ลูกแก้ว",
  6: "สร้อย"
};

// Load Equipment (Lightcones & Relics)
async function loadEquipment() {
  try {
    let lcs = [];
    let relics = [];

    if (state.fullFreesrData) {
      lcs = state.fullFreesrData.lightcones || [];
      relics = state.fullFreesrData.relics || [];
    } else if (state.isConnected) {
      const res = await apiCall('/api/freesr').catch(async () => {
        return await apiCall('/srtools');
      }).catch(() => null);
      if (res && res.data) {
        state.fullFreesrData = res.data;
        await saveFreesrCache(res.data);
        lcs = res.data.lightcones || [];
        relics = res.data.relics || [];
      }
    } else {
      let cached = await idbGet('gac_srtool_freesr_cache');
      if (!cached) {
        const raw = localStorage.getItem('gac_srtool_freesr_cache');
        if (raw) {
          try { cached = JSON.parse(raw); } catch (e) {}
        }
      }
      if (cached) {
        state.fullFreesrData = cached;
        lcs = cached.lightcones || [];
        relics = cached.relics || [];
      }
    }

    if (el.badgeTotalLc) el.badgeTotalLc.textContent = lcs.length;
    if (el.badgeTotalRelics) el.badgeTotalRelics.textContent = relics.length;

    renderEquipment();
  } catch (err) {
    console.warn('Equipment loading error:', err);
  }
}

// Render active equipment subtab
function renderEquipment() {
  if (state.eqActiveSubtab === 'relic') {
    renderRelicsGrid();
  } else {
    renderLightconesGrid();
  }
}

// Render Light Cones Grid
function renderLightconesGrid() {
  if (!el.lightconesGrid) return;
  const lcs = state.fullFreesrData?.lightcones || [];
  const search = el.eqSearch?.value.trim().toLowerCase() || '';
  const rarity = el.eqFilterRarity?.value || 'all';
  const equipped = el.eqFilterEquipped?.value || 'all';
  const pathFilter = el.eqFilterExtra?.value || 'all';

  const filtered = lcs.filter(lc => {
    const meta = getLightconeInfo(lc.item_id);
    const matchesSearch = !search || meta.name.toLowerCase().includes(search) || String(lc.item_id).includes(search);
    const matchesRarity = rarity === 'all' || String(meta.rarity) === rarity;
    const matchesEquipped = equipped === 'all' || 
      (equipped === 'equipped' && lc.equip_avatar) || 
      (equipped === 'unequipped' && !lc.equip_avatar);
    const matchesPath = pathFilter === 'all' || normalizePath(meta.path) === normalizePath(pathFilter);
    return matchesSearch && matchesRarity && matchesEquipped && matchesPath;
  });

  el.lightconesGrid.innerHTML = '';
  if (filtered.length === 0) {
    el.lightconesGrid.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 2.5rem; grid-column: 1/-1;">${t('noLcData')}</div>`;
    return;
  }

  filtered.forEach(lc => {
    const meta = getLightconeInfo(lc.item_id);
    const roman = ROMAN_RANKS[lc.rank] || `S${lc.rank || 1}`;
    const card = document.createElement('div');
    card.className = `eq-tile-card rarity-${meta.rarity || 4}`;
    card.setAttribute('data-uid', lc.internal_uid);
    card.title = `${meta.name} (★${meta.rarity} ${meta.path || ''})`;

    const wearerBadgeHtml = lc.equip_avatar ? `
      <div class="eq-tile-wearer-badge" title="สวมใส่โดย: ${getAvatarInfo(lc.equip_avatar).name}">
        <img class="eq-tile-wearer-img" src="${getAvatarIconSrc(lc.equip_avatar)}" onerror="handleAvatarImgError(this, ${lc.equip_avatar})" alt="Wearer">
      </div>
    ` : '';

    const primaryImg = getLightconeArtSrc(lc.item_id);

    card.innerHTML = `
      <img class="eq-tile-img" src="${primaryImg}" onerror="handleLcImgError(this, ${lc.item_id})" alt="${meta.name}">
      <div class="eq-tile-top-tag">${roman}</div>
      ${wearerBadgeHtml}
      <div class="eq-tile-bottom-bar">
        <span class="eq-tile-level">Lv.${lc.level || 80}</span>
        <span class="eq-tile-name-snippet">${meta.name}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('#lightcones-grid .eq-tile-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      showLcInspector(lc);
    });

    el.lightconesGrid.appendChild(card);
  });
}

// Render Relics Grid
function renderRelicsGrid() {
  if (!el.relicsGrid) return;
  const relics = state.fullFreesrData?.relics || [];
  const search = el.eqSearch?.value.trim().toLowerCase() || '';
  const rarity = el.eqFilterRarity?.value || 'all';
  const equipped = el.eqFilterEquipped?.value || 'all';
  const slotFilter = el.eqFilterExtra?.value || 'all';

  const filtered = relics.filter(r => {
    const slotNum = (r.relic_id % 10) || 1;
    const setId = Math.floor((r.relic_id % 10000) / 10);
    const rInfo = getRelicSetInfo(setId);
    const matchesSearch = !search || rInfo.name.toLowerCase().includes(search) || String(r.relic_id).includes(search);
    const matchesRarity = rarity === 'all' || (rarity === '5');
    const matchesEquipped = equipped === 'all' || 
      (equipped === 'equipped' && r.equip_avatar) || 
      (equipped === 'unequipped' && !r.equip_avatar);
    const matchesSlot = slotFilter === 'all' || String(slotNum) === slotFilter;
    return matchesSearch && matchesRarity && matchesEquipped && matchesSlot;
  });

  el.relicsGrid.innerHTML = '';
  if (filtered.length === 0) {
    el.relicsGrid.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 2.5rem; grid-column: 1/-1;">${t('noRelicData')}</div>`;
    return;
  }

  filtered.forEach(r => {
    const slotNum = (r.relic_id % 10) || 1;
    const setId = Math.floor((r.relic_id % 10000) / 10);
    const rInfo = getRelicSetInfo(setId);
    const slotName = RELIC_SLOT_NAMES[slotNum] || `Slot ${slotNum}`;

    const card = document.createElement('div');
    card.className = 'eq-tile-card rarity-5';
    card.setAttribute('data-uid', r.internal_uid);
    card.title = `${rInfo.name} (${slotName})`;

    const wearerBadgeHtml = r.equip_avatar ? `
      <div class="eq-tile-wearer-badge" title="สวมใส่โดย: ${getAvatarInfo(r.equip_avatar).name}">
        <img class="eq-tile-wearer-img" src="${getAvatarIconSrc(r.equip_avatar)}" onerror="handleAvatarImgError(this, ${r.equip_avatar})" alt="Wearer">
      </div>
    ` : '';

    const primaryImg = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/${setId}.png`;
    const fallbackImg = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/relic/${setId}.png`;

    card.innerHTML = `
      <img class="eq-tile-img" src="${primaryImg}" onerror="if(this.src!=='${fallbackImg}')this.src='${fallbackImg}';else this.src='./assets/logo.png';" alt="${rInfo.name}">
      <div class="eq-tile-top-tag">${slotName}</div>
      ${wearerBadgeHtml}
      <div class="eq-tile-bottom-bar">
        <span class="eq-tile-level">+${r.level || 15}</span>
        <span class="eq-tile-name-snippet">${rInfo.name}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('#relics-grid .eq-tile-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      showRelicInspector(r);
    });

    el.relicsGrid.appendChild(card);
  });
}

// Show Light Cone Details Inspector
function showLcInspector(lc) {
  if (!el.eqInspectorCard) return;
  const lcInfo = getLightconeInfo(lc.item_id);
  const lcMeta = LIGHTCONE_METADATA[lc.item_id] || {};
  const roman = ROMAN_RANKS[lc.rank] || `S${lc.rank || 1}`;

  let avatarOpts = `<option value="0">${t('unassigned')}</option>`;
  const sortedAvatars = [...state.avatarsList].sort((a, b) => b.avatar_id - a.avatar_id);
  sortedAvatars.forEach(av => {
    const info = getAvatarInfo(av.avatar_id);
    const sel = (lc.equip_avatar === av.avatar_id) ? 'selected' : '';
    avatarOpts += `<option value="${av.avatar_id}" ${sel}>${info.name} (ID: ${av.avatar_id})</option>`;
  });

  const hp = lcMeta.hp || (lcMeta.rarity === 5 ? 1164 : (lcMeta.rarity === 4 ? 953 : 846));
  const atk = lcMeta.atk || (lcMeta.rarity === 5 ? 582 : (lcMeta.rarity === 4 ? 423 : 317));
  const def = lcMeta.def || (lcMeta.rarity === 5 ? 529 : (lcMeta.rarity === 4 ? 396 : 264));

  const primaryThumb = getLightconeArtSrc(lc.item_id);

  el.eqInspectorCard.style.display = 'flex';
  el.eqInspectorCard.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div class="eq-inspector-hero">
        <img class="eq-inspector-thumb" src="${primaryThumb}" onerror="handleLcImgError(this, ${lc.item_id})" alt="${lcInfo.name}">
        <div class="eq-inspector-info">
          <div class="eq-inspector-title">${lcInfo.name}</div>
          <div class="eq-inspector-stars">${'★'.repeat(lcInfo.rarity || 5)}</div>
          <div style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 700; margin-top: 0.25rem;">
            ${getPathIconHtml(lcInfo.path, 16)} ${lcInfo.path || 'All'} • Lv. ${lc.level || 80}/80
          </div>
          <div style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 800; margin-top: 0.2rem;">
            Superimposition ${roman}
          </div>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-secondary" id="btn-close-eq-inspector" style="padding: 0.2rem 0.5rem; border-radius: 6px;">✕</button>
    </div>

    <!-- Stats Box -->
    <div class="eq-inspector-stats">
      <div class="eq-inspector-stat-row">
        <span style="color: var(--text-muted);">❤️ HP</span>
        <strong style="color: #fff; font-family: monospace;">+${hp}</strong>
      </div>
      <div class="eq-inspector-stat-row">
        <span style="color: var(--text-muted);">⚔️ ATK</span>
        <strong style="color: #fff; font-family: monospace;">+${atk}</strong>
      </div>
      <div class="eq-inspector-stat-row">
        <span style="color: var(--text-muted);">🛡️ DEF</span>
        <strong style="color: #fff; font-family: monospace;">+${def}</strong>
      </div>
    </div>

    <!-- Passive Skill -->
    <div class="eq-inspector-ability">
      <div style="font-weight: 800; color: var(--accent-cyan); margin-bottom: 0.25rem;">${lcMeta.skill_name || 'สกิลพิเศษประจำกรวยแสง'}</div>
      <div>${lcMeta.desc || 'เพิ่มพลังต่อสู้และเสริมกลไกเฉพาะสายของตัวละครเมื่อติดตั้ง'}</div>
    </div>

    <!-- Wearer Form & Actions -->
    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.25rem;">
      <label class="form-label" style="margin-bottom: 0.2rem; font-size: 0.8rem;">ผู้สวมใส่ (Equipped By):</label>
      <select id="sel-inspector-wearer" class="form-select">
        ${avatarOpts}
      </select>

      <div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
        <button type="button" class="btn btn-primary" id="btn-inspector-save-wearer" style="flex: 1;">💾 บันทึกสวมใส่</button>
        <button type="button" class="btn btn-danger" id="btn-inspector-delete" title="ลบออกจากคลัง">🗑️ ลบ</button>
      </div>
    </div>
  `;

  document.getElementById('btn-close-eq-inspector')?.addEventListener('click', () => {
    el.eqInspectorCard.style.display = 'none';
    document.querySelectorAll('.eq-tile-card.active').forEach(c => c.classList.remove('active'));
  });

  document.getElementById('btn-inspector-save-wearer')?.addEventListener('click', async () => {
    const newAvatarId = parseInt(document.getElementById('sel-inspector-wearer').value, 10);
    if (newAvatarId !== 0 && state.fullFreesrData?.lightcones) {
      state.fullFreesrData.lightcones.forEach(otherLc => {
        if (otherLc.equip_avatar === newAvatarId && otherLc.internal_uid !== lc.internal_uid) {
          otherLc.equip_avatar = 0;
        }
      });
    }
    lc.equip_avatar = newAvatarId;
    if (state.isConnected) {
      await saveFreesrChangesToServer();
    }
    showToast(`อัปเดตผู้สวมใส่ ${lcInfo.name} เรียบร้อย`, 'success');
    renderEquipment();
    showLcInspector(lc);
  });

  document.getElementById('btn-inspector-delete')?.addEventListener('click', async () => {
    if (!confirm(`ยืนยันการลบ ${lcInfo.name} ออกจากคลัง FreeSR หรือไม่?`)) return;
    if (state.fullFreesrData?.lightcones) {
      state.fullFreesrData.lightcones = state.fullFreesrData.lightcones.filter(l => l.internal_uid !== lc.internal_uid);
      if (state.isConnected) {
        await saveFreesrChangesToServer();
      }
      el.eqInspectorCard.style.display = 'none';
      showToast(t('toastItemDeleted'), 'info');
      renderEquipment();
    }
  });
}

// Show Relic Details Inspector
function showRelicInspector(relic) {
  if (!el.eqInspectorCard) return;
  const slotNum = (relic.relic_id % 10) || 1;
  const setId = Math.floor((relic.relic_id % 10000) / 10);
  const rInfo = getRelicSetInfo(setId);
  const slotName = RELIC_SLOT_NAMES[slotNum] || `ชิ้นที่ ${slotNum}`;

  let avatarOpts = `<option value="0">${t('unassigned')}</option>`;
  const sortedAvatars = [...state.avatarsList].sort((a, b) => b.avatar_id - a.avatar_id);
  sortedAvatars.forEach(av => {
    const info = getAvatarInfo(av.avatar_id);
    const sel = (relic.equip_avatar === av.avatar_id) ? 'selected' : '';
    avatarOpts += `<option value="${av.avatar_id}" ${sel}>${info.name} (ID: ${av.avatar_id})</option>`;
  });

  const mainAffixName = getRelicMainAffixName(slotNum, relic.main_affix_id);

  el.eqInspectorCard.style.display = 'flex';
  el.eqInspectorCard.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div class="eq-inspector-hero">
        <img class="eq-inspector-thumb" src="https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/relic/${setId}.png" onerror="this.src='./assets/logo.png'" alt="${rInfo.name}">
        <div class="eq-inspector-info">
          <div class="eq-inspector-title">${rInfo.name}</div>
          <div class="eq-inspector-stars">★★★★★</div>
          <div style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 700; margin-top: 0.25rem;">
            ${slotName} • +${relic.level || 15}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
            ID: ${relic.relic_id || setId}
          </div>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-secondary" id="btn-close-eq-inspector" style="padding: 0.2rem 0.5rem; border-radius: 6px;">✕</button>
    </div>

    <!-- Real Stats Box -->
    <div class="eq-inspector-stats">
      <div class="eq-inspector-stat-row" style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.35rem; margin-bottom: 0.35rem;">
        <span style="color: var(--text-highlight); font-weight: 700;">สเตตัสหลัก (Main Stat)</span>
        <strong style="color: var(--accent-cyan); font-family: monospace;">✦ ${mainAffixName}</strong>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">
        ออฟรอง (Substats):
      </div>
      ${(relic.sub_affixes && relic.sub_affixes.length > 0) ? relic.sub_affixes.map(s => {
        const sName = getRelicSubAffixName(s.sub_affix_id);
        const rolls = s.count || s.cnt || 1;
        const val = formatRelicSubstatValue(s.sub_affix_id, rolls);
        return `
          <div class="eq-inspector-stat-row">
            <span>• ${sName}</span>
            <strong style="color: var(--accent-gold); font-family: monospace;">
              +${val} <span style="font-size: 0.65rem; background: rgba(234,179,8,0.2); color: #fbbf24; border-radius: 3px; padding: 1px 4px; font-weight: 800;">+${rolls}</span>
            </strong>
          </div>
        `;
      }).join('') : '<div style="color: var(--text-muted); font-size: 0.75rem;">ไม่มีข้อมูลออฟรอง</div>'}
    </div>

    <!-- Edit Substats Action Button -->
    <button type="button" class="btn btn-warning" id="btn-inspector-edit-subs" style="margin-top: 0.35rem; font-weight: 800; font-size: 0.825rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
      🔧 ปรับแต่งออฟรอง / สเตตัส (Edit Substats)
    </button>

    <!-- Set Description -->
    <div class="eq-inspector-ability" style="margin-top: 0.4rem;">
      <div style="font-weight: 800; color: var(--accent-cyan); margin-bottom: 0.25rem;">Set Bonus (${rInfo.name})</div>
      <div>2-Piece: ${rInfo.desc2 || 'เพิ่มประสิทธิภาพตามเซ็ตที่กำหนด'}<br>4-Piece: ${rInfo.desc4 || 'ปลดล็อกเอฟเฟกต์ต่อสู้ขั้นสูง'}</div>
    </div>

    <!-- Wearer Form & Actions -->
    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.25rem;">
      <label class="form-label" style="margin-bottom: 0.2rem; font-size: 0.8rem;">ผู้สวมใส่ (Equipped By):</label>
      <select id="sel-inspector-wearer" class="form-select">
        ${avatarOpts}
      </select>

      <div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
        <button type="button" class="btn btn-primary" id="btn-inspector-save-wearer" style="flex: 1;">💾 บันทึกสวมใส่</button>
        <button type="button" class="btn btn-danger" id="btn-inspector-delete" title="ลบออกจากคลัง">🗑️ ลบ</button>
      </div>
    </div>
  `;

  document.getElementById('btn-inspector-edit-subs')?.addEventListener('click', () => {
    openSlotPickerForRelic(relic);
  });

  document.getElementById('btn-close-eq-inspector')?.addEventListener('click', () => {
    el.eqInspectorCard.style.display = 'none';
    document.querySelectorAll('.eq-tile-card.active').forEach(c => c.classList.remove('active'));
  });

  document.getElementById('btn-inspector-save-wearer')?.addEventListener('click', async () => {
    const newAvatarId = parseInt(document.getElementById('sel-inspector-wearer').value, 10);
    if (newAvatarId !== 0 && state.fullFreesrData?.relics) {
      state.fullFreesrData.relics.forEach(otherR => {
        const otherSlot = (otherR.relic_id % 10) || 1;
        if (otherR.equip_avatar === newAvatarId && otherSlot === slotNum && otherR.internal_uid !== relic.internal_uid) {
          otherR.equip_avatar = 0;
        }
      });
    }
    relic.equip_avatar = newAvatarId;
    if (state.isConnected) {
      await saveFreesrChangesToServer();
    }
    showToast(`อัปเดตผู้สวมใส่ ${rInfo.name} (${slotName}) เรียบร้อย`, 'success');
    renderEquipment();
    showRelicInspector(relic);
  });

  document.getElementById('btn-inspector-delete')?.addEventListener('click', async () => {
    if (!confirm(`ยืนยันการลบ ${rInfo.name} ออกจากคลัง FreeSR หรือไม่?`)) return;
    if (state.fullFreesrData?.relics) {
      state.fullFreesrData.relics = state.fullFreesrData.relics.filter(r => r.internal_uid !== relic.internal_uid);
      if (state.isConnected) {
        await saveFreesrChangesToServer();
      }
      el.eqInspectorCard.style.display = 'none';
      showToast(t('toastItemDeleted'), 'info');
      renderEquipment();
    }
  });
}

// Open Add Light Cone Modal
function openAddLcModal() {
  if (!el.modalAddLc) return;

  // Reset filters
  const searchInput = document.getElementById('add-lc-search');
  if (searchInput) searchInput.value = '';
  const filterPath = document.getElementById('add-lc-filter-path');
  if (filterPath) filterPath.value = 'all';
  const filterRarity = document.getElementById('add-lc-filter-rarity');
  if (filterRarity) filterRarity.value = 'all';

  // Avatars dropdown
  if (el.addLcAvatar) {
    el.addLcAvatar.innerHTML = `<option value="0">${t('unassigned') || '-- ยังไม่สวมใส่ (เก็บในคลัง) --'}</option>`;
    const sortedAvatars = [...state.avatarsList].sort((a, b) => b.avatar_id - a.avatar_id);
    sortedAvatars.forEach(av => {
      const info = getAvatarInfo(av.avatar_id);
      const opt = document.createElement('option');
      opt.value = av.avatar_id;
      opt.textContent = `${info.name} (ID: ${av.avatar_id})`;
      el.addLcAvatar.appendChild(opt);
    });
  }

  if (el.addLcLevel) el.addLcLevel.value = 80;
  if (el.addLcPromotion) el.addLcPromotion.value = 6;
  if (el.addLcRank) el.addLcRank.value = 5;

  const defaultId = LIGHTCONE_METADATA[23065] ? 23065 : 23001;
  updateAddLcPreview(defaultId);
  renderAddLcVisualGrid();

  el.modalAddLc.classList.add('active');
}

// Update Add LC Selected Preview Banner
function updateAddLcPreview(lcId) {
  const id = parseInt(lcId, 10);
  const info = getLightconeInfo(id);
  const meta = LIGHTCONE_METADATA[id] || { path: 'Unknown', rarity: 5 };

  const hiddenId = document.getElementById('add-lc-selected-id');
  if (hiddenId) hiddenId.value = id;

  const legacySelect = document.getElementById('add-lc-select');
  if (legacySelect) legacySelect.value = id;

  const previewThumb = document.getElementById('add-lc-preview-thumb');
  if (previewThumb) {
    previewThumb.src = getLightconeArtSrc(id);
    previewThumb.onerror = function() { handleLcImgError(this, id); };
  }

  const previewName = document.getElementById('add-lc-preview-name');
  if (previewName) {
    previewName.textContent = info.name || `Light Cone ${id}`;
  }

  const previewMeta = document.getElementById('add-lc-preview-meta');
  if (previewMeta) {
    previewMeta.innerHTML = `
      <span style="color: var(--accent-gold); font-weight: 800;">${'★'.repeat(info.rarity || 5)}</span>
      <span style="color: var(--accent-cyan); display: inline-flex; align-items: center; gap: 0.25rem;">
        ${getPathIconHtml(meta.path, 13)} ${info.path}
      </span>
      <span style="font-family: monospace; opacity: 0.8;">ID: ${id}</span>
    `;
  }
}

// Render Add LC Visual Grid with Live Search & Filtering
function renderAddLcVisualGrid() {
  const grid = document.getElementById('add-lc-visual-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const search = (document.getElementById('add-lc-search')?.value || '').trim().toLowerCase();
  const pathFilter = document.getElementById('add-lc-filter-path')?.value || 'all';
  const rarityFilter = document.getElementById('add-lc-filter-rarity')?.value || 'all';

  const selectedIdInput = document.getElementById('add-lc-selected-id');
  const selectedId = parseInt(selectedIdInput?.value || '23001', 10);

  const allIds = Object.keys(LIGHTCONE_METADATA)
    .map(id => parseInt(id, 10))
    .sort((a, b) => {
      const metaA = LIGHTCONE_METADATA[a];
      const metaB = LIGHTCONE_METADATA[b];
      if (metaB.rarity !== metaA.rarity) return metaB.rarity - metaA.rarity;
      return b - a;
    });

  const filtered = allIds.filter(id => {
    const meta = LIGHTCONE_METADATA[id];
    const info = getLightconeInfo(id);

    // Path filter
    if (pathFilter !== 'all' && meta.path !== pathFilter) return false;

    // Rarity filter
    if (rarityFilter !== 'all' && String(meta.rarity) !== String(rarityFilter)) return false;

    // Search filter
    if (search) {
      const matchName = (info.name || '').toLowerCase().includes(search);
      const matchId = String(id).includes(search);
      const matchPath = (info.path || '').toLowerCase().includes(search);
      if (!matchName && !matchId && !matchPath) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">ไม่พบกรวยแสงตามเงื่อนไขที่ค้นหา</div>`;
    return;
  }

  filtered.forEach(id => {
    const meta = LIGHTCONE_METADATA[id];
    const info = getLightconeInfo(id);
    const isSelected = id === selectedId;

    const card = document.createElement('div');
    card.className = `add-lc-card rarity-${info.rarity || 5} ${isSelected ? 'selected' : ''}`;
    card.dataset.lcId = id;

    card.innerHTML = `
      <img class="add-lc-card-thumb" src="${getLightconeArtSrc(id)}" onerror="handleLcImgError(this, ${id})" alt="${info.name}" loading="lazy">
      <div class="add-lc-card-body">
        <div class="add-lc-card-name" title="${info.name}">${info.name}</div>
        <div class="add-lc-card-stars">${'★'.repeat(info.rarity || 5)}</div>
        <div class="add-lc-card-sub">
          <span class="add-lc-card-path">${getPathIconHtml(meta.path, 13)} ${info.path}</span>
          <span class="add-lc-card-id">#${id}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      grid.querySelectorAll('.add-lc-card.selected').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      updateAddLcPreview(id);
    });

    grid.appendChild(card);
  });
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
  const selectedIdInput = document.getElementById('add-lc-selected-id');
  const itemId = parseInt(selectedIdInput?.value || el.addLcSelect?.value || '23001', 10);
  const level = parseInt(el.addLcLevel?.value || '80', 10) || 80;
  const promotion = parseInt(el.addLcPromotion?.value || '6', 10) || 6;
  const rank = parseInt(el.addLcRank?.value || '5', 10) || 5;
  const equipAvatar = parseInt(el.addLcAvatar?.value || '0', 10) || 0;

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

  let maxUniqueId = 1000;
  state.fullFreesrData.lightcones.forEach(l => {
    if ((l.unique_id || 0) >= maxUniqueId) maxUniqueId = (l.unique_id || 0) + 1;
  });
  const maxInternalUid = state.fullFreesrData.lightcones.reduce((m, lc) => Math.max(m, lc.internal_uid || 0), 0);
  const newLc = {
    unique_id: maxUniqueId,
    internal_uid: maxInternalUid + 1,
    item_id: itemId,
    level,
    promotion,
    rank,
    equip_avatar: equipAvatar
  };

  state.fullFreesrData.lightcones.unshift(newLc);
  await saveFreesrChangesToServer();
  loadEquipment();
  el.modalAddLc.classList.remove('active');
  showToast(t('toastLcAdded') || 'เพิ่มกรวยแสงลง FreeSR เรียบร้อยแล้ว', 'success');
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
      { sub_affix_id: 1, cnt: 2, count: 2, step: 1 },
      { sub_affix_id: 2, cnt: 2, count: 2, step: 1 },
      { sub_affix_id: 3, cnt: 3, count: 3, step: 2 },
      { sub_affix_id: 4, cnt: 4, count: 4, step: 2 }
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

// Load Persistent / Character Path Settings (GaC persistent vs Firefly data-in-game)
async function loadPersistentSettings() {
  if (state.serverMode === 'robin') return;

  if (state.serverMode === 'firefly') {
    // Firefly uses data-in-game.json char_path { main, march_7 }
    let dg = state.dataGameData;
    if (!dg) {
      dg = await idbGet('gac_srtool_datagame_cache') || JSON.parse(localStorage.getItem('gac_srtool_datagame_cache') || 'null');
      if (dg) state.dataGameData = dg;
    }
    if (dg?.char_path) {
      const mcKey = FIREFLY_MC_REVERSE_MAP[dg.char_path.main];
      if (mcKey && el.persistentMcSelect) el.persistentMcSelect.value = mcKey;
      const marchKey = FIREFLY_MARCH_REVERSE_MAP[dg.char_path.march_7];
      if (marchKey && el.persistentMarchSelect) el.persistentMarchSelect.value = marchKey;
    }
    return;
  }

  // GaC mode
  try {
    let data = state.persistentData;
    if (state.isConnected) {
      const res = await apiCall('/api/persistent');
      if (res && res.data) {
        data = res.data;
        state.persistentData = data;
        savePersistentCache(data);
      }
    } else if (!data) {
      const cached = localStorage.getItem('gac_srtool_persistent_cache');
      if (cached) {
        try {
          data = JSON.parse(cached);
          state.persistentData = data;
        } catch (e) {}
      }
    }
    if (!data) return;

    if (data.main_character && el.persistentMcSelect) {
      el.persistentMcSelect.value = data.main_character;
    }
    if (data.march_type && el.persistentMarchSelect) {
      el.persistentMarchSelect.value = data.march_type;
    }

    if (el.toggleSwGlobal) el.toggleSwGlobal.checked = data.enable_sw_global !== false;
    if (el.toggleCastoriceGlobal) el.toggleCastoriceGlobal.checked = data.enable_castorice_global !== false;
    if (el.toggleAhaGlobal) el.toggleAhaGlobal.checked = data.enable_aha_global !== false;
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
               src="${getAvatarIconSrc(ex.avatar_id)}"
               onerror="handleAvatarImgError(this, ${ex.avatar_id})"
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
    if (el.btnSelectPersistent) el.btnSelectPersistent.className = 'btn btn-sm btn-secondary';
    if (el.btnSelectDatagame) el.btnSelectDatagame.className = 'btn btn-sm btn-secondary';
    el.jsonStatusInfo.textContent = 'กำลังโหลด freesr-data.json...';
    try {
      if (state.fullFreesrData) {
        el.jsonEditor.value = JSON.stringify(state.fullFreesrData, null, 2);
        el.jsonStatusInfo.textContent = 'freesr-data.json (โหลดจากหน่วยความจำ/แคช)';
      } else if (state.isConnected) {
        const res = await apiCall('/api/freesr');
        state.fullFreesrData = res.data;
        saveFreesrCache(res.data);
        el.jsonEditor.value = JSON.stringify(res.data, null, 2);
        el.jsonStatusInfo.textContent = 'freesr-data.json (โหลดจากเซิร์ฟเวอร์)';
      } else {
        const cached = localStorage.getItem('gac_srtool_freesr_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          state.fullFreesrData = parsed;
          el.jsonEditor.value = JSON.stringify(parsed, null, 2);
          el.jsonStatusInfo.textContent = 'freesr-data.json (โหลดจากแคชของเบราว์เซอร์)';
        } else {
          el.jsonStatusInfo.textContent = 'Offline: ไม่มีแคช สามารถอัปโหลดหรือพิมพ์ JSON เองได้';
          if (!el.jsonEditor.value) {
            el.jsonEditor.value = JSON.stringify({ avatars: {}, lightcones: [], relics: [], battle_config: {} }, null, 2);
          }
        }
      }
    } catch (err) {
      const cached = localStorage.getItem('gac_srtool_freesr_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          state.fullFreesrData = parsed;
          el.jsonEditor.value = JSON.stringify(parsed, null, 2);
          el.jsonStatusInfo.textContent = 'freesr-data.json (โหลดจากแคชของเบราว์เซอร์)';
        } catch (e) {}
      } else {
        el.jsonStatusInfo.textContent = `Offline: สามารถพิมพ์หรือวาง JSON เองได้`;
        if (!el.jsonEditor.value) {
          el.jsonEditor.value = JSON.stringify({ avatars: {}, lightcones: [], relics: [], battle_config: {} }, null, 2);
        }
      }
    }
  } else if (mode === 'datagame') {
    el.btnSelectFreesr.className = 'btn btn-sm btn-secondary';
    if (el.btnSelectPersistent) el.btnSelectPersistent.className = 'btn btn-sm btn-secondary';
    if (el.btnSelectDatagame) el.btnSelectDatagame.className = 'btn btn-sm btn-primary active';
    el.jsonStatusInfo.textContent = 'กำลังโหลด data-in-game.json...';
    try {
      if (state.dataGameData) {
        el.jsonEditor.value = JSON.stringify(state.dataGameData, null, 2);
        el.jsonStatusInfo.textContent = 'data-in-game.json (โหลดจากหน่วยความจำ/แคช)';
      } else if (state.isConnected) {
        const res = await apiCall('/api/data-in-game').catch(() => null);
        if (res && (res.data || res.lineups)) {
          const val = res.data || res;
          state.dataGameData = val;
          saveDataGameCache(val);
          el.jsonEditor.value = JSON.stringify(val, null, 2);
          el.jsonStatusInfo.textContent = 'data-in-game.json (โหลดจากเซิร์ฟเวอร์)';
        } else {
          throw new Error('Not available');
        }
      } else {
        const cached = localStorage.getItem('gac_srtool_datagame_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          state.dataGameData = parsed;
          el.jsonEditor.value = JSON.stringify(parsed, null, 2);
          el.jsonStatusInfo.textContent = 'data-in-game.json (โหลดจากแคช)';
        } else {
          state.dataGameData = { ...DEFAULT_DATA_GAME };
          el.jsonEditor.value = JSON.stringify(DEFAULT_DATA_GAME, null, 2);
          el.jsonStatusInfo.textContent = 'data-in-game.json (โครงสร้าง Firefly dump)';
        }
      }
    } catch (err) {
      const cached = localStorage.getItem('gac_srtool_datagame_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          state.dataGameData = parsed;
          el.jsonEditor.value = JSON.stringify(parsed, null, 2);
          el.jsonStatusInfo.textContent = 'data-in-game.json (โหลดจากแคช)';
        } catch (e) {}
      } else {
        state.dataGameData = { ...DEFAULT_DATA_GAME };
        el.jsonEditor.value = JSON.stringify(DEFAULT_DATA_GAME, null, 2);
        el.jsonStatusInfo.textContent = 'data-in-game.json (โครงสร้าง Firefly dump)';
      }
    }
  } else {
    el.btnSelectFreesr.className = 'btn btn-sm btn-secondary';
    if (el.btnSelectPersistent) el.btnSelectPersistent.className = 'btn btn-sm btn-primary active';
    if (el.btnSelectDatagame) el.btnSelectDatagame.className = 'btn btn-sm btn-secondary';
    el.jsonStatusInfo.textContent = 'กำลังโหลด persistent...';
    try {
      if (state.persistentData) {
        el.jsonEditor.value = JSON.stringify(state.persistentData, null, 2);
        el.jsonStatusInfo.textContent = 'persistent (โหลดจากหน่วยความจำ/แคช)';
      } else if (state.isConnected) {
        const res = await apiCall('/api/persistent');
        state.persistentData = res.data;
        savePersistentCache(res.data);
        el.jsonEditor.value = JSON.stringify(res.data, null, 2);
        el.jsonStatusInfo.textContent = 'persistent (โหลดจากเซิร์ฟเวอร์)';
      } else {
        const cached = localStorage.getItem('gac_srtool_persistent_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          state.persistentData = parsed;
          el.jsonEditor.value = JSON.stringify(parsed, null, 2);
          el.jsonStatusInfo.textContent = 'persistent (โหลดจากแคชของเบราว์เซอร์)';
        } else {
          el.jsonStatusInfo.textContent = 'Offline: ไม่มีแคช สามารถอัปโหลดหรือพิมพ์ JSON เองได้';
          if (!el.jsonEditor.value) {
            el.jsonEditor.value = JSON.stringify({ lineups: DEFAULT_LINEUP, main_character: "FemaleHarmony", march_type: "MarchHunt" }, null, 2);
          }
        }
      }
    } catch (err) {
      const cached = localStorage.getItem('gac_srtool_persistent_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          state.persistentData = parsed;
          el.jsonEditor.value = JSON.stringify(parsed, null, 2);
          el.jsonStatusInfo.textContent = 'persistent (โหลดจากแคชของเบราว์เซอร์)';
        } catch (e) {}
      } else {
        el.jsonStatusInfo.textContent = `Offline: สามารถพิมพ์หรือวาง JSON เองได้`;
        if (!el.jsonEditor.value) {
          el.jsonEditor.value = JSON.stringify({ lineups: DEFAULT_LINEUP, main_character: "FemaleHarmony", march_type: "MarchHunt" }, null, 2);
        }
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
      await saveFreesrCache(parsed);
      loadEquipment();

      let serverSaved = false;
      let serverError = null;
      try {
        await saveFreesrChangesToServer();
        serverSaved = true;
      } catch (err) {
        serverError = err.message;
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

      if (serverSaved) {
        showToast('✅ บันทึก freesr-data.json ลงในเซิร์ฟเวอร์และแคชเรียบร้อย', 'success');
      } else if (serverError) {
        showToast(`⚠️ บันทึกลงแคชแล้ว แต่ส่งไปยังเซิร์ฟเวอร์ไม่สำเร็จ: ${serverError}`, 'warning');
      } else {
        showToast('💾 บันทึก freesr-data.json ลงในแคชแล้ว (โหมดออฟไลน์)', 'info');
      }
    } else if (state.currentJsonMode === 'datagame') {
      state.dataGameData = parsed;
      await saveDataGameCache(parsed);
      if (parsed.lineups) {
        state.statusData = state.statusData || {};
        state.statusData.lineups = parsed.lineups;
        renderLineup(parsed.lineups);
      }
      let serverSaved = false;
      let serverError = null;
      if (state.isConnected) {
        try {
          await apiCall('/api/data-in-game', 'POST', parsed);
          serverSaved = true;
        } catch (err) {
          serverError = err.message;
        }
      }
      if (serverSaved) {
        showToast('✅ บันทึก data-in-game.json ลงในเซิร์ฟเวอร์และแคชเรียบร้อย', 'success');
      } else if (serverError) {
        showToast(`⚠️ บันทึกลงแคชแล้ว แต่ส่งไปยังเซิร์ฟเวอร์ไม่สำเร็จ: ${serverError}`, 'warning');
      } else {
        showToast('💾 บันทึก data-in-game.json ลงในแคชแล้ว (โหมดออฟไลน์)', 'info');
      }
    } else {
      state.persistentData = parsed;
      await savePersistentCache(parsed);
      let serverSaved = false;
      let serverError = null;
      try {
        if (state.serverMode === 'gac') {
          await apiCall('/api/persistent', 'POST', parsed);
        } else {
          await saveFreesrChangesToServer();
        }
        serverSaved = true;
      } catch (err) {
        serverError = err.message;
      }
      if (parsed.lineups) {
        state.statusData = state.statusData || {};
        state.statusData.lineups = parsed.lineups;
        renderLineup(parsed.lineups);
      }
      if (serverSaved) {
        showToast('✅ บันทึกไฟล์ persistent ลงในเซิร์ฟเวอร์และแคชเรียบร้อย', 'success');
      } else if (serverError) {
        showToast(`⚠️ บันทึกลงแคชแล้ว แต่ส่งไปยังเซิร์ฟเวอร์ไม่สำเร็จ: ${serverError}`, 'warning');
      } else {
        showToast('💾 บันทึกไฟล์ persistent ลงในแคชแล้ว (โหมดออฟไลน์)', 'info');
      }
    }
    updateCacheUsageDisplay();
    refreshStatus();
  } catch (err) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
  }
}

// Cache Usage Status for Diagnostics
function updateCacheUsageDisplay() {
  if (!el.lblCacheUsage) return;
  try {
    let totalBytes = 0;
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }
    let freesrBytes = 0;
    if (state.fullFreesrData) {
      try {
        freesrBytes = JSON.stringify(state.fullFreesrData).length;
      } catch (e) {}
    }
    const displayBytes = Math.max(totalBytes, freesrBytes);
    const kb = (displayBytes / 1024).toFixed(1);
    el.lblCacheUsage.textContent = `${kb} KB (IndexedDB + Storage)`;
  } catch (err) {
    el.lblCacheUsage.textContent = 'ไม่สามารถตรวจสอบได้';
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
        updateDocumentTitle(targetId);

        // On-demand tab refresh
        if (targetId === 'tab-avatars') {
          renderAvatarsGrid();
        } else if (targetId === 'tab-equipment') {
          loadEquipment();
        } else if (targetId === 'tab-inventory') {
          loadMaterialsInventory();
        } else if (targetId === 'tab-persistent') {
          loadPersistentSettings();
        } else if (targetId === 'tab-json') {
          loadJsonData(state.currentJsonMode);
        } else if (targetId === 'tab-settings') {
          updateCacheUsageDisplay();
        }
      }
    });
  });
}

const INVENTORY_PAGE_SIZE = 100;

function inventoryFilteredIds() {
  const query = (el.inventorySearch?.value || '').trim();
  if (!query) return state.inventoryItems;
  return state.inventoryItems.filter(id => String(id).includes(query));
}

function inventoryDirtyIds() {
  return state.inventoryItems.filter(id => {
    const key = String(id);
    if (!Object.prototype.hasOwnProperty.call(state.inventoryDraft, key)) return false;
    const hasSaved = Object.prototype.hasOwnProperty.call(state.inventorySaved, key);
    const draft = state.inventoryDraft[key];
    return draft === null ? hasSaved : (!hasSaved || draft !== state.inventorySaved[key]);
  });
}

function renderMaterialsInventory() {
  if (!el.inventoryBody) return;
  const ids = inventoryFilteredIds();
  const dirty = inventoryDirtyIds();
  const pageCount = Math.max(1, Math.ceil(ids.length / INVENTORY_PAGE_SIZE));
  state.inventoryPage = Math.min(state.inventoryPage, pageCount - 1);
  const start = state.inventoryPage * INVENTORY_PAGE_SIZE;
  const pageIds = ids.slice(start, start + INVENTORY_PAGE_SIZE);

  el.inventoryCount.textContent = t('inventoryItemTotal', { count: state.inventoryItems.length });
  el.inventoryDirtyCount.textContent = t('inventoryPending', { count: dirty.length });
  el.inventoryDirtyCount.style.display = dirty.length ? '' : 'none';
  el.btnInventorySave.disabled = dirty.length === 0;
  el.btnInventoryDiscard.disabled = dirty.length === 0;
  el.btnInventoryPrev.disabled = state.inventoryPage === 0;
  el.btnInventoryNext.disabled = state.inventoryPage >= pageCount - 1;
  el.inventoryPageLabel.textContent = t('inventoryPage', { page: state.inventoryPage + 1, pages: pageCount, count: ids.length });

  if (!pageIds.length) {
    el.inventoryBody.innerHTML = `<tr><td colspan="2" style="padding:1.5rem;text-align:center;color:var(--text-muted);">${t('inventoryNoMatch')}</td></tr>`;
    return;
  }
  el.inventoryBody.innerHTML = pageIds.map(id => {
    const key = String(id);
    const hasSaved = Object.prototype.hasOwnProperty.call(state.inventorySaved, key);
    const value = Object.prototype.hasOwnProperty.call(state.inventoryDraft, key)
      ? state.inventoryDraft[key]
      : (hasSaved ? state.inventorySaved[key] : '');
    const changed = Object.prototype.hasOwnProperty.call(state.inventoryDraft, key)
      && (value === null ? hasSaved : (!hasSaved || value !== state.inventorySaved[key]));
    const displayValue = value === null ? '' : value;
    return `<tr style="border-top:1px solid var(--border-color);${changed ? 'background:rgba(245,158,11,.08);' : ''}">
      <td style="padding:.55rem 1rem;font-family:monospace;">${id}</td>
      <td style="padding:.4rem 1rem;"><input type="number" class="form-input inventory-count-input" data-item-id="${id}" min="0" max="4294967295" step="1" value="${displayValue}" placeholder="${t('inventoryDefaultPlaceholder')}" aria-label="${t('inventoryCountFor', { id })}" style="max-width:220px;"></td>
    </tr>`;
  }).join('');
}

async function loadMaterialsInventory() {
  if (!el.inventoryStatus) return;
  if (state.serverMode !== 'gac') {
    el.inventoryStatus.textContent = t('inventoryGaCOnly');
    return;
  }
  el.inventoryStatus.textContent = t('inventoryLoadHint');
  try {
    const result = await apiCall('/api/inventory/materials');
    if (!Array.isArray(result.item_ids)) throw new Error('Server returned an invalid item catalog');
    state.inventoryItems = [...new Set([...result.item_ids, 1, 2])].filter(Number.isInteger).sort((a, b) => a - b);
    state.inventorySaved = result.materials && typeof result.materials === 'object' ? result.materials : {};
    state.inventoryDraft = {};
    state.inventoryPage = 0;
    el.inventoryStatus.textContent = t('inventoryLoadSuccess', { count: state.inventoryItems.length });
    renderMaterialsInventory();
  } catch (error) {
    el.inventoryStatus.textContent = `${t('inventoryLoadFailed')}: ${error.message}`;
    el.inventoryBody.innerHTML = `<tr><td colspan="2" style="padding:1.5rem;text-align:center;color:var(--text-muted);">${t('inventoryLoadFailed')}</td></tr>`;
  }
}

async function saveMaterialsInventory() {
  const updates = inventoryDirtyIds().map(id => {
    const count = state.inventoryDraft[String(id)];
    return count === null ? { item_id: id, reset: true } : { item_id: id, count };
  });
  if (!updates.length) return;
  el.btnInventorySave.disabled = true;
  el.inventoryStatus.textContent = t('inventorySaving', { count: updates.length });
  try {
    const result = await apiCall('/api/inventory/materials', 'POST', { updates });
    state.inventorySaved = result.materials || state.inventorySaved;
    state.inventoryDraft = {};
    if (state.fullFreesrData) {
      state.fullFreesrData.materials = { ...state.inventorySaved };
      await saveFreesrCache(state.fullFreesrData);
    }
    el.inventoryStatus.textContent = t('inventorySaveSuccess', { count: updates.length });
    renderMaterialsInventory();
  } catch (error) {
    el.inventoryStatus.textContent = `${t('inventorySaveFailed')}: ${error.message}`;
    renderMaterialsInventory();
  }
}

function setupInventoryEvents() {
  el.inventorySearch?.addEventListener('input', () => { state.inventoryPage = 0; renderMaterialsInventory(); });
  el.inventoryBody?.addEventListener('change', event => {
    const input = event.target.closest('.inventory-count-input');
    if (!input) return;
    const raw = input.value.trim();
    if (raw === '') {
      state.inventoryDraft[input.dataset.itemId] = null;
    } else {
      const value = Number(raw);
      if (!Number.isSafeInteger(value) || value < 0 || value > 4294967295) return;
      state.inventoryDraft[input.dataset.itemId] = value;
    }
    renderMaterialsInventory();
  });
  el.btnInventorySave?.addEventListener('click', saveMaterialsInventory);
  el.btnInventoryDiscard?.addEventListener('click', () => { state.inventoryDraft = {}; renderMaterialsInventory(); });
  el.btnInventoryPrev?.addEventListener('click', () => { state.inventoryPage = Math.max(0, state.inventoryPage - 1); renderMaterialsInventory(); });
  el.btnInventoryNext?.addEventListener('click', () => { state.inventoryPage++; renderMaterialsInventory(); });
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

  // Overview Tab Quick Navigation Cards
  el.overviewLcCard?.addEventListener('click', () => {
    if (state.selectedAvatarDetail) openLightconePicker(state.selectedAvatarDetail.avatar_id);
  });
  el.overviewRelicsCard?.addEventListener('click', () => switchModalSubtab('modaltab-relics'));

  // Lightcone Picker Modal Controls
  document.getElementById('btn-close-lc-picker')?.addEventListener('click', () => {
    document.getElementById('modal-select-lightcone')?.classList.remove('active');
  });
  document.getElementById('btn-lc-picker-close')?.addEventListener('click', () => {
    document.getElementById('modal-select-lightcone')?.classList.remove('active');
  });
  document.getElementById('lc-picker-search')?.addEventListener('input', () => {
    renderLightconePickerGrid();
  });
  document.getElementById('lc-picker-filter-path')?.addEventListener('change', () => {
    renderLightconePickerGrid();
  });
  document.getElementById('lc-picker-rank')?.addEventListener('change', () => {
    renderLightconePickerGrid();
  });
  document.getElementById('btn-lc-picker-unequip')?.addEventListener('click', async () => {
    if (state.lcPickerAvatarId) {
      await unequipLightconeFromAvatar(state.lcPickerAvatarId);
    }
    document.getElementById('modal-select-lightcone')?.classList.remove('active');
  });

  // Top Bar Characters Tab Quick Actions
  document.getElementById('btn-all-avatars-e0s1')?.addEventListener('click', quickSetAllAvatarsE0S1);

  // Relic Tab Controls in Modal
  el.btnModalRelicsAuto?.addEventListener('click', async () => {
    if (!state.selectedAvatarDetail) return;
    const aid = state.selectedAvatarDetail.avatar_id;
    await autoEquipRecommendedRelics(aid, true);
    renderModalRelicsTab(aid);
    renderModalOverviewTab(aid);
    renderShowcaseCard(aid);
  });

  el.btnModalRelicsClear?.addEventListener('click', async () => {
    if (!state.selectedAvatarDetail) return;
    const aid = state.selectedAvatarDetail.avatar_id;
    const msg = t('confirmClearRelics') || 'คุณแน่ใจหรือไม่ว่าต้องการถอดรีลิกส์ทั้งหมดของตัวละครนี้?';
    if (!confirm(msg)) return;
    const relics = state.fullFreesrData?.relics || [];
    let unequippedCount = 0;
    relics.forEach(r => {
      if (r.equip_avatar === aid) {
        r.equip_avatar = 0;
        unequippedCount++;
      }
    });
    if (unequippedCount > 0) {
      if (state.isConnected) await saveFreesrChangesToServer();
      showToast(t('toastRelicsCleared') || `ถอดรีลิกส์เรียบร้อย (${unequippedCount} ชิ้น)`, 'info');
      renderModalRelicsTab(aid);
      renderModalOverviewTab(aid);
      renderShowcaseCard(aid);
      loadEquipment();
    } else {
      showToast('ไม่มีรีลิกส์ที่ติดตั้งอยู่', 'warning');
    }
  });

  // Relic Slot Picker Modal Controls
  el.btnCloseSlotPicker?.addEventListener('click', () => {
    el.modalSelectRelicSlot?.classList.remove('active');
  });

  el.btnSlotPickerQuickGen?.addEventListener('click', async () => {
    if (state.slotPickerAvatarId && state.slotPickerSlot) {
      await quickGenSlotRelic(state.slotPickerAvatarId, state.slotPickerSlot);
    }
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
    el.toggleCreativeMode.disabled = false;
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
  el.btnQuickLineupE0S1?.addEventListener('click', quickSetLineupE0S1);
  el.btnQuickLineupRelics?.addEventListener('click', quickEquipLineupRelics);
  el.btnQuickUnlockAllAvatars?.addEventListener('click', quickUnlockAllAvatars);
  el.btnQuickAddAllLcs?.addEventListener('click', quickAddAll5StarLightcones);
  el.btnQuickTeleportTrain?.addEventListener('click', quickTeleportAstralExpress);
  el.btnQuickClearLineup?.addEventListener('click', quickClearLineup);
  el.btnMaxAllAvatars?.addEventListener('click', maxAllAvatars);

  // Persistent / Character Path Form Submit
  el.formPersistentChars.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mc = el.persistentMcSelect.value;
    const march = el.persistentMarchSelect.value;

    if (state.serverMode === 'firefly') {
      state.dataGameData = state.dataGameData || { ...DEFAULT_DATA_GAME };
      state.dataGameData.char_path = state.dataGameData.char_path || {};
      state.dataGameData.char_path.main = FIREFLY_MC_MAP[mc] || 8010;
      state.dataGameData.char_path.march_7 = FIREFLY_MARCH_MAP[march] || 1224;
      await saveDataGameCache(state.dataGameData);

      let serverUpdated = false;
      if (state.isConnected) {
        try {
          await apiCall('/api/data-in-game', 'POST', state.dataGameData);
          serverUpdated = true;
        } catch (e) {
          await saveFreesrChangesToServer().catch(() => {});
        }
      }
      showToast(serverUpdated ? 'บันทึกสายของตัวละคร (Firefly data-in-game) สำเร็จ!' : 'บันทึกสายตัวละครลงในแคชแล้ว (Firefly data-in-game)', 'success');
      refreshStatus();
      return;
    }

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
  document.getElementById('add-lc-search')?.addEventListener('input', () => renderAddLcVisualGrid());
  document.getElementById('add-lc-filter-path')?.addEventListener('change', () => renderAddLcVisualGrid());
  document.getElementById('add-lc-filter-rarity')?.addEventListener('change', () => renderAddLcVisualGrid());

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

  // Equipment Subtab Switching & Filters (Tiles View)
  const updateEqFiltersExtra = () => {
    if (!el.eqFilterExtra) return;
    el.eqFilterExtra.innerHTML = '';
    if (state.eqActiveSubtab === 'relic') {
      el.eqFilterExtra.innerHTML = `
        <option value="all">ทุกชิ้นส่วน</option>
        <option value="1">1 - ส่วนหัว</option>
        <option value="2">2 - ส่วนมือ</option>
        <option value="3">3 - ลำตัว</option>
        <option value="4">4 - รองเท้า</option>
        <option value="5">5 - ลูกแก้ว</option>
        <option value="6">6 - สร้อย</option>
      `;
    } else {
      el.eqFilterExtra.innerHTML = `
        <option value="all">ทุกประเภท</option>
        <option value="Destruction">ทำลายล้าง</option>
        <option value="Hunt">ล่าสังหาร</option>
        <option value="Erudition">ปัญญา</option>
        <option value="Harmony">ประสาน</option>
        <option value="Nihility">ลบล้าง</option>
        <option value="Preservation">อนุรักษ์</option>
        <option value="Abundance">เฟื่องฟู</option>
        <option value="Remembrance">ความทรงจำ</option>
      `;
    }
  };

  if (el.btnEqSubtabLc) {
    el.btnEqSubtabLc.addEventListener('click', () => {
      state.eqActiveSubtab = 'lc';
      el.btnEqSubtabLc.classList.add('active', 'btn-primary');
      el.btnEqSubtabLc.classList.remove('btn-secondary');
      el.btnEqSubtabRelic.classList.remove('active', 'btn-primary');
      el.btnEqSubtabRelic.classList.add('btn-secondary');
      if (el.lightconesGrid) el.lightconesGrid.style.display = 'grid';
      if (el.relicsGrid) el.relicsGrid.style.display = 'none';
      if (el.btnOpenAddLc) el.btnOpenAddLc.style.display = '';
      if (el.btnOpenAddRelic) el.btnOpenAddRelic.style.display = 'none';
      if (el.eqInspectorCard) el.eqInspectorCard.style.display = 'none';
      updateEqFiltersExtra();
      renderEquipment();
    });
  }

  if (el.btnEqSubtabRelic) {
    el.btnEqSubtabRelic.addEventListener('click', () => {
      state.eqActiveSubtab = 'relic';
      el.btnEqSubtabRelic.classList.add('active', 'btn-primary');
      el.btnEqSubtabRelic.classList.remove('btn-secondary');
      el.btnEqSubtabLc.classList.remove('active', 'btn-primary');
      el.btnEqSubtabLc.classList.add('btn-secondary');
      if (el.relicsGrid) el.relicsGrid.style.display = 'grid';
      if (el.lightconesGrid) el.lightconesGrid.style.display = 'none';
      if (el.btnOpenAddRelic) el.btnOpenAddRelic.style.display = '';
      if (el.btnOpenAddLc) el.btnOpenAddLc.style.display = 'none';
      if (el.eqInspectorCard) el.eqInspectorCard.style.display = 'none';
      updateEqFiltersExtra();
      renderEquipment();
    });
  }

  if (el.eqSearch) el.eqSearch.addEventListener('input', renderEquipment);
  if (el.eqFilterRarity) el.eqFilterRarity.addEventListener('change', renderEquipment);
  if (el.eqFilterEquipped) el.eqFilterEquipped.addEventListener('change', renderEquipment);
  if (el.eqFilterExtra) el.eqFilterExtra.addEventListener('change', renderEquipment);

  updateEqFiltersExtra();

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
  el.btnSelectFreesr?.addEventListener('click', () => loadJsonData('freesr'));
  el.btnSelectPersistent?.addEventListener('click', () => loadJsonData('persistent'));
  el.btnSelectDatagame?.addEventListener('click', () => loadJsonData('datagame'));
  
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
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        el.jsonEditor.value = JSON.stringify(parsed, null, 2);

        let recognized = false;
        let isFreesr = false;
        let isPersistent = false;

        // If freesr-data.json was uploaded (has avatars, lightcones, or relics)
        if (parsed.avatars || parsed.lightcones || parsed.relics) {
          recognized = true;
          isFreesr = true;
          state.fullFreesrData = parsed;
          await saveFreesrCache(parsed);

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

          loadEquipment();

          if (parsed.battle_config?.custom_battle_lineup || parsed.lineups) {
            const lineups = parsed.lineups || parsed.battle_config?.custom_battle_lineup;
            state.statusData = state.statusData || {};
            state.statusData.lineups = lineups;
            renderLineup(lineups);
          }
        }

        // If persistent or has lineups
        if (parsed.main_character || parsed.march_type || (parsed.lineups && !parsed.avatars)) {
          recognized = true;
          isPersistent = true;
          state.persistentData = parsed;
          await savePersistentCache(parsed);

          if (parsed.lineups) {
            state.statusData = state.statusData || {};
            state.statusData.lineups = parsed.lineups;
            renderLineup(parsed.lineups);
          }
          if (parsed.main_character && el.persistentMcSelect) {
            el.persistentMcSelect.value = parsed.main_character;
          }
          if (parsed.march_type && el.persistentMarchSelect) {
            el.persistentMarchSelect.value = parsed.march_type;
          }
          if (el.toggleSwGlobal && parsed.enable_sw_global !== undefined) {
            el.toggleSwGlobal.checked = parsed.enable_sw_global !== false;
          }
          if (el.toggleCastoriceGlobal && parsed.enable_castorice_global !== undefined) {
            el.toggleCastoriceGlobal.checked = parsed.enable_castorice_global !== false;
          }
          if (el.toggleAhaGlobal && parsed.enable_aha_global !== undefined) {
            el.toggleAhaGlobal.checked = parsed.enable_aha_global !== false;
          }
        }

        if (!recognized) {
          if (state.currentJsonMode === 'freesr') {
            isFreesr = true;
            state.fullFreesrData = parsed;
            await saveFreesrCache(parsed);
            loadEquipment();
          } else {
            isPersistent = true;
            state.persistentData = parsed;
            await savePersistentCache(parsed);
          }
        }

        // Automatically push to server upon file upload
        let serverSaved = false;
        let serverError = null;
        try {
          if (isFreesr) {
            await saveFreesrChangesToServer();
            serverSaved = true;
          } else if (isPersistent) {
            if (state.serverMode === 'gac') {
              await apiCall('/api/persistent', 'POST', parsed);
            } else {
              await saveFreesrChangesToServer();
            }
            serverSaved = true;
          }
        } catch (sErr) {
          serverError = sErr.message;
        }

        updateCacheUsageDisplay();
        refreshStatus();

        if (serverSaved) {
          showToast(`✅ อัปโหลดและบันทึก ${file.name} ลงเซิร์ฟเวอร์ + แคชสำเร็จ!`, 'success');
        } else if (serverError) {
          showToast(`💾 บันทึก ${file.name} ลงแคชแล้ว (แต่ส่งเซิร์ฟเวอร์ไม่สำเร็จ: ${serverError})`, 'warning');
        } else {
          showToast(`💾 บันทึก ${file.name} ลงแคชสำเร็จ (โหมดออฟไลน์)`, 'info');
        }
      } catch (err) {
        showToast(t('jsonInvalid') || 'ไฟล์ JSON ไม่ถูกต้อง', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // -------------------------------------------------------------
  // Settings Tab Controls & Diagnostics
  // -------------------------------------------------------------
  if (el.settingApiUrl) {
    el.settingApiUrl.value = state.apiUrl;
  }

  // Quick URL Preset Chips
  document.querySelectorAll('.btn-quick-url').forEach(btn => {
    btn.addEventListener('click', () => {
      if (el.settingApiUrl) {
        el.settingApiUrl.value = btn.dataset.url;
        showToast(`เลือก Endpoint: ${btn.dataset.url}`, 'info');
      }
    });
  });

  // Ping Latency Test
  if (el.btnTestConnection) {
    el.btnTestConnection.addEventListener('click', async () => {
      const targetUrl = (el.settingApiUrl?.value || state.apiUrl).trim().replace(/\/+$/, '');
      if (el.pingLatencyBadge) {
        el.pingLatencyBadge.style.display = 'inline-block';
        el.pingLatencyBadge.textContent = '⏳ ...';
        el.pingLatencyBadge.style.backgroundColor = 'var(--bg-card)';
        el.pingLatencyBadge.style.color = 'var(--text-muted)';
      }
      const t0 = performance.now();
      try {
        const res = await fetch(`${targetUrl}/api/status`, { signal: AbortSignal.timeout(3500) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const latency = Math.round(performance.now() - t0);
        if (el.pingLatencyBadge) {
          el.pingLatencyBadge.textContent = `${latency} ms`;
          el.pingLatencyBadge.style.backgroundColor = latency < 80 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)';
          el.pingLatencyBadge.style.color = latency < 80 ? 'var(--accent-green)' : 'var(--accent-gold)';
        }
        showToast(t('toastPingSuccess', { ms: latency }), 'success');
        setConnectionStatus(true);
      } catch (err) {
        if (el.pingLatencyBadge) {
          el.pingLatencyBadge.textContent = 'ERR';
          el.pingLatencyBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          el.pingLatencyBadge.style.color = '#ef4444';
        }
        showToast(t('toastPingFailed'), 'error');
        setConnectionStatus(false);
      }
    });
  }

  // Save Connection Settings
  if (el.formSettings) {
    el.formSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      state.apiUrl = el.settingApiUrl.value.trim().replace(/\/+$/, '') || 'http://localhost:21000';
      localStorage.setItem('gac_srtool_api_url', state.apiUrl);
      showToast(t('settingsSaved'), 'success');
      refreshStatus();
    });
  }

  // Battle Starting Energy Presets
  const curEnergy = localStorage.getItem('gac_srtool_default_energy') || '50';
  document.querySelectorAll('.btn-setting-energy').forEach(btn => {
    if (btn.dataset.energy === curEnergy) {
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-secondary');
    } else {
      btn.classList.remove('active', 'btn-primary');
      btn.classList.add('btn-secondary');
    }
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-setting-energy').forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-secondary');
      localStorage.setItem('gac_srtool_default_energy', btn.dataset.energy);
      state.defaultEnergy = parseInt(btn.dataset.energy, 10);
      showToast(`ตั้งค่าพลังงานเริ่มต้น: ${btn.dataset.energy}%`, 'info');
    });
  });

  // Auto-Sync Toggle
  if (el.settingAutoSync) {
    el.settingAutoSync.checked = localStorage.getItem('gac_srtool_auto_sync') !== 'false';
    el.settingAutoSync.addEventListener('change', (e) => {
      localStorage.setItem('gac_srtool_auto_sync', e.target.checked);
      state.autoSync = e.target.checked;
    });
  }

  // Creative Mode by Default Toggle
  if (el.settingDefaultCreative) {
    el.settingDefaultCreative.checked = localStorage.getItem('gac_srtool_default_creative') === 'true';
    el.settingDefaultCreative.addEventListener('change', (e) => {
      const val = e.target.checked;
      localStorage.setItem('gac_srtool_default_creative', val);
      state.defaultCreative = val;
      if (val && !state.creativeMode) {
        state.creativeMode = true;
        localStorage.setItem('gac_srtool_creative_mode', 'true');
        if (el.toggleCreativeMode) el.toggleCreativeMode.checked = true;
        if (el.badgeCreativeMode) el.badgeCreativeMode.style.display = 'inline-flex';
        renderLineup(state.statusData?.lineups);
      }
    });
  }

  // Showcase Sub-stat Rolls Toggle
  if (el.settingShowcaseRolls) {
    el.settingShowcaseRolls.checked = localStorage.getItem('gac_srtool_showcase_rolls') !== 'false';
    el.settingShowcaseRolls.addEventListener('change', (e) => {
      localStorage.setItem('gac_srtool_showcase_rolls', e.target.checked);
      state.showcaseRolls = e.target.checked;
      if (state.selectedAvatarDetail?.avatar_id) {
        renderShowcaseCard(state.selectedAvatarDetail.avatar_id);
      }
    });
  }

  // Showcase Element Aura Glow Toggle
  if (el.settingShowcaseAura) {
    el.settingShowcaseAura.checked = localStorage.getItem('gac_srtool_showcase_aura') !== 'false';
    el.settingShowcaseAura.addEventListener('change', (e) => {
      localStorage.setItem('gac_srtool_showcase_aura', e.target.checked);
      state.showcaseAura = e.target.checked;
      if (state.selectedAvatarDetail?.avatar_id) {
        renderShowcaseCard(state.selectedAvatarDetail.avatar_id);
      }
    });
  }

  // Clear Browser Cache Button
  if (el.btnClearBrowserCache) {
    el.btnClearBrowserCache.addEventListener('click', async () => {
      const keepUrl = localStorage.getItem('gac_srtool_api_url');
      const keepMode = localStorage.getItem('gac_srtool_mode');
      const keepLang = localStorage.getItem('gac_srtool_lang');
      localStorage.clear();
      await idbClear();
      if (keepUrl) localStorage.setItem('gac_srtool_api_url', keepUrl);
      if (keepMode) localStorage.setItem('gac_srtool_mode', keepMode);
      if (keepLang) localStorage.setItem('gac_srtool_lang', keepLang);
      state.fullFreesrData = null;
      state.persistentData = null;
      loadAvatars();
      loadEquipment();
      updateCacheUsageDisplay();
      showToast(t('toastCacheCleared') || 'ล้างแคชในเบราว์เซอร์เรียบร้อยแล้ว', 'success');
      refreshStatus();
    });
  }

  // Factory Reset Button
  if (el.btnResetSettings) {
    el.btnResetSettings.addEventListener('click', async () => {
      localStorage.clear();
      await idbClear();
      state.fullFreesrData = null;
      state.persistentData = null;
      state.apiUrl = 'http://localhost:21000';
      state.serverMode = 'gac';
      state.creativeMode = false;
      state.defaultEnergy = 50;
      state.autoSync = true;
      state.showcaseRolls = true;
      state.showcaseAura = true;
      if (el.settingApiUrl) el.settingApiUrl.value = state.apiUrl;
      if (el.settingServerMode) el.settingServerMode.value = 'gac';
      if (el.settingAutoSync) el.settingAutoSync.checked = true;
      if (el.settingDefaultCreative) el.settingDefaultCreative.checked = false;
      if (el.settingShowcaseRolls) el.settingShowcaseRolls.checked = true;
      if (el.settingShowcaseAura) el.settingShowcaseAura.checked = true;
      if (el.toggleCreativeMode) el.toggleCreativeMode.checked = false;
      if (el.badgeCreativeMode) el.badgeCreativeMode.style.display = 'none';
      loadAvatars();
      loadEquipment();
      updateCacheUsageDisplay();
      showToast(t('settingsReset') || 'รีเซ็ตเป็นค่าเริ่มต้นเรียบร้อย', 'info');
      refreshStatus();
    });
  }

  updateCacheUsageDisplay();

  // Modal Backdrop Click to close
  [el.modalAvatarDetail, el.modalLineupPicker, el.modalSettings, el.modalSelectRelicSlot].forEach(modal => {
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

// ==========================================
// Git Branch Detection & Browser Tab Title
// ==========================================
let currentGitBranch = 'test-gay';

function updateDocumentTitle(tabId = state.activeTab || 'tab-dashboard') {
  const branchPrefix = currentGitBranch ? `[${currentGitBranch}] ` : '';
  const tabNames = {
    'tab-dashboard': 'GaC-Srtool — Ultimate Star Rail Server & Build Manager',
    'tab-avatars': `👥 ${t('tabAvatars') || 'ตัวละคร'} | GaC-Srtool`,
    'tab-equipment': `🗡️ ${t('tabEquipment') || 'กรวยแสง & รีลิกส์'} | GaC-Srtool`,
    'tab-persistent': `💾 ${t('tabPersistent') || 'จัดการเซฟ GaC'} | GaC-Srtool`,
    'tab-exrank': `⚡ ${t('tabExrank') || 'สกิลพิเศษ Ex-Rank'} | GaC-Srtool`,
    'tab-json': `📝 ${t('tabJson') || 'จัดการไฟล์ JSON'} | GaC-Srtool`,
    'tab-settings': `⚙️ ${t('tabSettings') || 'ตั้งค่า'} | GaC-Srtool`
  };
  const titleBody = tabNames[tabId] || 'GaC-Srtool — Ultimate Star Rail Server & Build Manager';
  document.title = `${branchPrefix}${titleBody}`;
}

function applyBranchToUI(branch) {
  state.currentBranch = branch;
  currentGitBranch = branch;

  // 1. Browser Tab Title (<title> & document.title)
  updateDocumentTitle();

  // 2. Header Brand Badge
  const headerBadge = document.getElementById('header-branch-badge');
  if (headerBadge) {
    headerBadge.textContent = branch;
    headerBadge.style.display = 'inline-flex';
  }

  // 3. Nav Tabs Branch Indicator
  const navBadge = document.getElementById('nav-branch-name');
  if (navBadge) {
    navBadge.textContent = branch;
  }
}

async function initGitBranchDisplay() {
  // 1. URL Query Param ?branch=...
  const urlParams = new URLSearchParams(window.location.search);
  const branchFromUrl = urlParams.get('branch');
  if (branchFromUrl) {
    applyBranchToUI(branchFromUrl.trim());
    return;
  }

  // 2. version.json (Generated by sync-branch or git commit)
  try {
    const res = await fetch('version.json?t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data && data.branch) {
        applyBranchToUI(data.branch.trim());
        return;
      }
    }
  } catch (_) {}

  // 3. .git/HEAD (if served locally by dev server)
  try {
    const headRes = await fetch('.git/HEAD?t=' + Date.now());
    if (headRes.ok) {
      const headText = await headRes.text();
      const match = headText.match(/ref:\s*refs\/heads\/([^\r\n]+)/);
      if (match && match[1]) {
        applyBranchToUI(match[1].trim());
        return;
      }
    }
  } catch (_) {}

  // 4. Fallback
  applyBranchToUI(currentGitBranch);
}

// ==========================================
// In-Game Battle Telemetry & Damage Analyst
// ==========================================

const analystState = {
  currentReport: null,
  isFetching: false,
  lastBattleTimestamp: 0,
  autoSyncInterval: null
};

function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Math.round(num).toLocaleString('en-US');
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function parseFireflySranalysisJson(json) {
  if (!json || (!json.lineup && !json.skillHistory && !json.turnHistory)) return null;

  const avatarsMap = {};
  const teamLineup = json.lineup || [];
  teamLineup.forEach(item => {
    const aid = item.avatarId;
    if (aid && aid > 0) {
      avatarsMap[aid] = {
        avatar_id: aid,
        level: 80,
        rank: 6,
        total_damage: 0,
        damage_percent: 0,
        total_damage_taken: 0,
        total_heal: 0,
        total_shield: 0,
        total_break_damage: 0,
        total_turns: 0,
        extra_turns: 0,
        attack_type_damage: {},
        attack_type_max_damage: {},
        skill_times: []
      };
    }
  });

  let maxCycles = 0;
  if (Array.isArray(json.turnHistory)) {
    json.turnHistory.forEach(turn => {
      if (turn.cycleIndex > maxCycles) maxCycles = turn.cycleIndex;
      const aid = turn.avatarId;
      if (aid && avatarsMap[aid]) {
        avatarsMap[aid].total_turns++;
      }
    });
  }

  let teamTotalDmg = 0;
  if (Array.isArray(json.skillHistory)) {
    json.skillHistory.forEach(sk => {
      const aid = sk.avatarId;
      if (!aid || aid <= 0) return;
      if (!avatarsMap[aid]) {
        avatarsMap[aid] = {
          avatar_id: aid,
          level: 80,
          rank: 6,
          total_damage: 0,
          damage_percent: 0,
          total_damage_taken: 0,
          total_heal: 0,
          total_shield: 0,
          total_break_damage: 0,
          total_turns: 1,
          extra_turns: 0,
          attack_type_damage: {},
          attack_type_max_damage: {},
          skill_times: []
        };
      }
      const av = avatarsMap[aid];
      const dmg = sk.totalDamage || 0;
      av.total_damage += dmg;
      teamTotalDmg += dmg;

      const skType = sk.skillType || 'Other';
      av.attack_type_damage[skType] = (av.attack_type_damage[skType] || 0) + dmg;

      if (Array.isArray(sk.damageDetail)) {
        sk.damageDetail.forEach(d => {
          const detailDmg = d.damage || 0;
          const dType = d.type || skType;
          if (detailDmg > (av.attack_type_max_damage[dType] || 0)) {
            av.attack_type_max_damage[dType] = detailDmg;
          }
        });
      }
    });
  }

  const avatarsList = Object.values(avatarsMap);
  avatarsList.forEach(a => {
    if (teamTotalDmg > 0) {
      a.damage_percent = (a.total_damage / teamTotalDmg) * 100;
    }
  });

  return {
    timestamp: Date.now(),
    battle_id: Math.floor(Math.random() * 90000) + 10000,
    stage_id: 1001,
    end_status: 'WIN',
    total_battle_turns: json.turnHistory?.length || 15,
    total_auto_turns: 0,
    round_cnt: maxCycles,
    cost_time: 48,
    challenge_score: 0,
    team_total_damage: teamTotalDmg,
    team_total_heal: 0,
    team_total_shield: 0,
    avatars: avatarsList,
    monsters: []
  };
}

async function fetchLatestBattleReport(silent = false) {
  if (analystState.isFetching) return;
  analystState.isFetching = true;
  try {
    const data = await apiCall('/api/battle_report', 'GET');
    if (data && data.has_report && data.report) {
      const isNew = data.report.timestamp !== analystState.lastBattleTimestamp;
      analystState.currentReport = data.report;
      analystState.lastBattleTimestamp = data.report.timestamp;
      renderDamageAnalyst();
      updateDashboardBattleBanner();
      if (!silent) {
        showToast(t('analystToastFetched'), 'success');
      } else if (isNew) {
        showToast(t('analystToastFetched'), 'info');
      }
    } else {
      if (!silent) {
        showToast(data?.message || t('analystNoBattle'), 'info');
      }
      if (!analystState.currentReport) {
        renderEmptyDamageAnalyst();
      }
    }
  } catch (err) {
    if (!silent) {
      showToast(`Error: ${err.message}`, 'error');
    }
  } finally {
    analystState.isFetching = false;
  }
}

function renderEmptyDamageAnalyst() {
  if (el.analystTeamDamage) el.analystTeamDamage.textContent = '0';
  if (el.analystCycles) el.analystCycles.textContent = `0 ${t('analystCycles')}`;
  if (el.analystTotalTurns) el.analystTotalTurns.textContent = `0 ${t('analystTurns')}`;
  if (el.analystDuration) el.analystDuration.textContent = '00:00';
  if (el.analystDamageAv) el.analystDamageAv.textContent = 'เฉลี่ย: -';
  if (el.analystBattleMeta) el.analystBattleMeta.textContent = 'Stage: - | Battle: -';

  if (el.badgeAnalystStatus) {
    el.badgeAnalystStatus.textContent = 'พร้อมรับข้อมูลจากเกม';
    el.badgeAnalystStatus.style.background = 'rgba(34, 197, 94, 0.15)';
    el.badgeAnalystStatus.style.color = '#4ade80';
  }

  if (el.analystShareBarContainer) {
    el.analystShareBarContainer.innerHTML = '<div style="width: 100%; background: rgba(255,255,255,0.05); height: 100%;"></div>';
  }
  if (el.analystShareLegend) {
    el.analystShareLegend.innerHTML = '';
  }
  if (el.analystCharactersContainer) {
    el.analystCharactersContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 0.75rem;">⚔️</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">${t('analystNoBattle')}</div>
        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary" id="btn-empty-analyst-fetch" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">${t('analystFetchBtn')}</button>
          <button type="button" class="btn btn-secondary" id="btn-empty-analyst-demo">✨ โหลดตัวอย่างการต่อสู้ (Demo)</button>
        </div>
      </div>
    `;
    const btnF = document.getElementById('btn-empty-analyst-fetch');
    if (btnF) btnF.addEventListener('click', () => fetchLatestBattleReport(false));
    const btnD = document.getElementById('btn-empty-analyst-demo');
    if (btnD) btnD.addEventListener('click', () => loadDemoBattleReport());
  }

  if (el.analystEnemiesCard) {
    el.analystEnemiesCard.style.display = 'none';
  }
}

function renderDamageAnalyst() {
  const report = analystState.currentReport;
  if (!report) {
    renderEmptyDamageAnalyst();
    return;
  }

  const teamDmg = report.team_total_damage || 0;
  if (el.analystTeamDamage) el.analystTeamDamage.textContent = formatNumber(teamDmg);
  if (el.analystCycles) {
    el.analystCycles.textContent = (report.round_cnt !== undefined) ? `${report.round_cnt} รอบ (${report.round_cnt}-Cycle)` : '0 รอบ';
  }
  if (el.analystTotalTurns) el.analystTotalTurns.textContent = `${report.total_battle_turns || 0} เทิร์น`;
  if (el.analystDuration) el.analystDuration.textContent = formatDuration(report.cost_time);
  if (el.analystDamageAv) {
    el.analystDamageAv.textContent = (report.round_cnt > 0)
      ? `เฉลี่ย: ${(teamDmg / report.round_cnt).toFixed(0).toLocaleString()} / รอบ`
      : `เฉลี่ย: ${(teamDmg / Math.max(1, report.total_battle_turns || 1)).toFixed(0).toLocaleString()} / เทิร์น`;
  }
  if (el.analystBattleMeta) {
    el.analystBattleMeta.textContent = `Stage: ${report.stage_id || '-'} | Battle: #${report.battle_id || '-'}`;
  }

  if (el.badgeAnalystStatus) {
    if (report.end_status === 'WIN') {
      el.badgeAnalystStatus.textContent = t('analystStatusWin');
      el.badgeAnalystStatus.style.background = 'rgba(34, 197, 94, 0.15)';
      el.badgeAnalystStatus.style.color = '#4ade80';
    } else if (report.end_status === 'QUIT') {
      el.badgeAnalystStatus.textContent = t('analystStatusQuit');
      el.badgeAnalystStatus.style.background = 'rgba(245, 158, 11, 0.15)';
      el.badgeAnalystStatus.style.color = '#fbbf24';
    } else {
      el.badgeAnalystStatus.textContent = t('analystStatusLose');
      el.badgeAnalystStatus.style.background = 'rgba(239, 68, 68, 0.15)';
      el.badgeAnalystStatus.style.color = '#f87171';
    }
  }

  const colors = ['#ef4444', '#38bdf8', '#34d399', '#fbbf24', '#c084fc', '#ec4899'];

  // Team Share Bar
  if (el.analystShareBarContainer) {
    if (report.avatars && report.avatars.length > 0) {
      el.analystShareBarContainer.innerHTML = report.avatars.map((a, idx) => {
        const color = colors[idx % colors.length];
        const pct = a.damage_percent || (teamDmg > 0 ? (a.total_damage / teamDmg) * 100 : 0);
        const info = getAvatarInfo(a.avatar_id);
        return `<div style="width: ${pct}%; background: ${color}; height: 100%; transition: width 0.4s ease;" title="${info.name}: ${pct.toFixed(1)}% (${formatNumber(a.total_damage)})"></div>`;
      }).join('');
    } else {
      el.analystShareBarContainer.innerHTML = '<div style="width: 100%; background: rgba(255,255,255,0.05); height: 100%;"></div>';
    }
  }

  // Legend
  if (el.analystShareLegend) {
    if (report.avatars && report.avatars.length > 0) {
      el.analystShareLegend.innerHTML = report.avatars.map((a, idx) => {
        const color = colors[idx % colors.length];
        const info = getAvatarInfo(a.avatar_id);
        const pct = a.damage_percent || (teamDmg > 0 ? (a.total_damage / teamDmg) * 100 : 0);
        return `
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.825rem;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; box-shadow: 0 0 6px ${color}88;"></div>
            <img src="${getAvatarIconSrc(a.avatar_id)}" onerror="handleAvatarImgError(this, ${a.avatar_id})" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover; border: 1px solid ${color};">
            <span style="font-weight: 700; color: var(--text-highlight);">${info.name}</span>
            <span style="font-weight: 800; color: ${color};">${pct.toFixed(1)}%</span>
            <span style="color: var(--text-muted); font-size: 0.75rem;">(${formatNumber(a.total_damage)})</span>
          </div>
        `;
      }).join('');
    } else {
      el.analystShareLegend.innerHTML = '';
    }
  }

  // Characters Detailed Cards Grid
  if (el.analystCharactersContainer) {
    if (!report.avatars || report.avatars.length === 0) {
      el.analystCharactersContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
          ${t('analystNoBattle')}
        </div>
      `;
    } else {
      el.analystCharactersContainer.innerHTML = report.avatars.map((a, idx) => {
        const color = colors[idx % colors.length];
        const info = getAvatarInfo(a.avatar_id);
        const pct = a.damage_percent || (teamDmg > 0 ? (a.total_damage / teamDmg) * 100 : 0);

        let maxHit = 0;
        if (a.attack_type_max_damage) {
          for (const key in a.attack_type_max_damage) {
            if (a.attack_type_max_damage[key] > maxHit) maxHit = a.attack_type_max_damage[key];
          }
        }

        const dNormal = a.attack_type_damage?.Normal || 0;
        const dSkill = a.attack_type_damage?.BPSkill || a.attack_type_damage?.Skill || 0;
        const dUlt = a.attack_type_damage?.Ultra || a.attack_type_damage?.Ultimate || 0;
        const dBreak = a.total_break_damage || a.attack_type_damage?.BreakDamage || 0;
        const dFollowup = (a.attack_type_damage?.Insert || 0) + (a.attack_type_damage?.Pursued || 0);
        const dDot = a.attack_type_damage?.DOT || 0;

        return `
          <div class="card" style="padding: 1.25rem; border: 1px solid rgba(255,255,255,0.08); background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(20,20,30,0.8) 100%); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: ${color};"></div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="position: relative; width: 48px; height: 48px; flex-shrink: 0;">
                  <img src="${getAvatarIconSrc(a.avatar_id)}"
                       onerror="handleAvatarImgError(this, ${a.avatar_id})"
                       style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid ${color};">
                  ${info.element ? `
                    <div style="position: absolute; bottom: -2px; right: -2px; width: 18px; height: 18px; border-radius: 50%; background: #0f172a; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2);">
                      ${getElementIconHtml(info.element, 14)}
                    </div>
                  ` : ''}
                </div>
                <div>
                  <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.45rem;">
                    <span>${info.name}</span>
                    <span style="font-size: 0.75rem; padding: 0.1rem 0.4rem; border-radius: 4px; background: rgba(255,255,255,0.08); color: var(--text-muted); font-weight: 700;">Lv.${a.level || 80} E${a.rank !== undefined ? a.rank : 0}</span>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">
                    ${translatePath(info.path)} • ${translateElement(info.element)}
                  </div>
                </div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 1.4rem; font-weight: 900; color: ${color}; letter-spacing: -0.5px;">${pct.toFixed(1)}%</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">DPS SHARE</div>
              </div>
            </div>

            <div style="padding: 0.75rem 1rem; border-radius: 8px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); margin-bottom: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.725rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${t('analystTotalDamage')}</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #fff;">${formatNumber(a.total_damage)}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.725rem; color: var(--text-muted);">${t('analystMaxHit')}</div>
                <div style="font-size: 0.95rem; font-weight: 800; color: #f87171;">${formatNumber(maxHit)}</div>
              </div>
            </div>

            <div style="height: 6px; border-radius: 3px; background: rgba(255,255,255,0.06); overflow: hidden; margin-bottom: 1rem;">
              <div style="height: 100%; width: ${pct}%; background: ${color}; border-radius: 3px;"></div>
            </div>

            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem;">
              ${t('analystBreakdownTitle')}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-bottom: 1rem;">
              <div style="padding: 0.4rem 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; font-size: 0.775rem;">
                <span style="color: var(--text-muted);">${t('analystDmgNormal')}</span>
                <span style="font-weight: 700; color: var(--text-main);">${formatNumber(dNormal)}</span>
              </div>
              <div style="padding: 0.4rem 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; font-size: 0.775rem;">
                <span style="color: var(--text-muted);">${t('analystDmgSkill')}</span>
                <span style="font-weight: 700; color: #38bdf8;">${formatNumber(dSkill)}</span>
              </div>
              <div style="padding: 0.4rem 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; font-size: 0.775rem;">
                <span style="color: var(--text-muted);">${t('analystDmgUlt')}</span>
                <span style="font-weight: 700; color: #c084fc;">${formatNumber(dUlt)}</span>
              </div>
              <div style="padding: 0.4rem 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; font-size: 0.775rem;">
                <span style="color: var(--text-muted);">${t('analystDmgBreak')}</span>
                <span style="font-weight: 700; color: #fbbf24;">${formatNumber(dBreak)}</span>
              </div>
              ${dFollowup > 0 ? `
                <div style="padding: 0.4rem 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; font-size: 0.775rem;">
                  <span style="color: var(--text-muted);">${t('analystDmgFollowup')}</span>
                  <span style="font-weight: 700; color: #f472b6;">${formatNumber(dFollowup)}</span>
                </div>
              ` : ''}
              ${dDot > 0 ? `
                <div style="padding: 0.4rem 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; font-size: 0.775rem;">
                  <span style="color: var(--text-muted);">${t('analystDmgDot')}</span>
                  <span style="font-weight: 700; color: #a78bfa;">${formatNumber(dDot)}</span>
                </div>
              ` : ''}
            </div>

            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding-top: 0.65rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; color: var(--text-muted);">
              <div>⏱️ เทิร์น: <strong style="color: #fff;">${a.total_turns || 0}</strong> ${a.extra_turns ? `(+${a.extra_turns})` : ''}</div>
              <div>🛡️ โล่: <strong style="color: #38bdf8;">${formatNumber(a.total_shield)}</strong></div>
              <div>💚 ฮีล: <strong style="color: #34d399;">${formatNumber(a.total_heal)}</strong></div>
              <div>💔 โดนตี: <strong style="color: #f87171;">${formatNumber(a.total_damage_taken)}</strong></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Enemies Section
  if (el.analystEnemiesContainer && el.analystEnemiesCard) {
    if (report.monsters && report.monsters.length > 0) {
      el.analystEnemiesCard.style.display = 'block';
      el.analystEnemiesContainer.innerHTML = report.monsters.map(m => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.85rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); font-size: 0.825rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.2rem;">👾</span>
            <div>
              <div style="font-weight: 700; color: var(--text-highlight);">Monster #${m.monster_id || m.entity_id}</div>
              <div style="font-size: 0.725rem; color: var(--text-muted);">Wave: ${m.wave || 1} • Entity: ${m.entity_id}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; color: #f87171;">${formatNumber(m.total_damage_taken)} DMG Taken</div>
            <div style="font-size: 0.725rem; color: var(--text-muted);">${m.total_turns || 0} Turns (${formatNumber(m.total_damage)} Dealt)</div>
          </div>
        </div>
      `).join('');
    } else {
      el.analystEnemiesCard.style.display = 'none';
    }
  }
}

function updateDashboardBattleBanner() {
  renderMiniBattleSummary();
}

function exportBattleReportJson() {
  if (!analystState.currentReport) {
    showToast('ไม่มีข้อมูลการต่อสู้ที่จะส่งออก', 'error');
    return;
  }
  const text = JSON.stringify(analystState.currentReport, null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `battle-report-${analystState.currentReport.battle_id || Date.now()}.json`;
  a.click();
  showToast(`ส่งออก ${a.download} เรียบร้อย`, 'success');
}

async function clearBattleReport() {
  analystState.currentReport = null;
  analystState.lastBattleTimestamp = 0;
  try {
    await apiCall('/api/battle_report/reset', 'POST');
  } catch (_) {}
  renderEmptyDamageAnalyst();
  updateDashboardBattleBanner();
  showToast(t('analystToastCleared'), 'info');
}

function loadDemoBattleReport() {
  const demoReport = {
    timestamp: Date.now(),
    battle_id: 88421,
    stage_id: 3001,
    end_status: "WIN",
    total_battle_turns: 11,
    total_auto_turns: 0,
    round_cnt: 0,
    cost_time: 46.8,
    challenge_score: 4000,
    team_total_damage: 2840000,
    team_total_heal: 8400,
    team_total_shield: 0,
    avatars: [
      {
        avatar_id: 1310,
        level: 80,
        rank: 2,
        total_damage: 2150000,
        damage_percent: 75.7,
        total_damage_taken: 3200,
        total_heal: 0,
        total_shield: 0,
        total_break_damage: 1890000,
        total_turns: 5,
        extra_turns: 2,
        attack_type_damage: {
          Normal: 45000,
          BPSkill: 215000,
          BreakDamage: 1890000
        },
        attack_type_max_damage: {
          BreakDamage: 620000
        },
        skill_times: [
          { skill_id: 131001, skill_type: "Normal", skill_use_count: 1 },
          { skill_id: 131002, skill_type: "BPSkill", skill_use_count: 4 }
        ]
      },
      {
        avatar_id: 8005,
        level: 80,
        rank: 6,
        total_damage: 410000,
        damage_percent: 14.4,
        total_damage_taken: 1800,
        total_heal: 0,
        total_shield: 0,
        total_break_damage: 380000,
        total_turns: 3,
        extra_turns: 0,
        attack_type_damage: {
          BPSkill: 120000,
          BreakDamage: 290000
        },
        attack_type_max_damage: {
          BreakDamage: 195000
        }
      },
      {
        avatar_id: 1303,
        level: 80,
        rank: 1,
        total_damage: 160000,
        damage_percent: 5.6,
        total_damage_taken: 1400,
        total_heal: 0,
        total_shield: 0,
        total_break_damage: 160000,
        total_turns: 2,
        extra_turns: 0,
        attack_type_damage: {
          Normal: 20000,
          BreakDamage: 140000
        },
        attack_type_max_damage: {
          BreakDamage: 95000
        }
      },
      {
        avatar_id: 1301,
        level: 80,
        rank: 6,
        total_damage: 120000,
        damage_percent: 4.3,
        total_damage_taken: 2100,
        total_heal: 8400,
        total_shield: 0,
        total_break_damage: 95000,
        total_turns: 3,
        extra_turns: 1,
        attack_type_damage: {
          Normal: 25000,
          Ultra: 35000,
          BreakDamage: 60000
        },
        attack_type_max_damage: {
          BreakDamage: 60000
        }
      }
    ],
    monsters: [
      {
        entity_id: 101,
        monster_id: 3024010,
        total_turns: 4,
        total_damage: 8500,
        total_damage_taken: 2840000,
        wave: 1
      }
    ]
  };

  analystState.currentReport = demoReport;
  analystState.lastBattleTimestamp = demoReport.timestamp;
  renderDamageAnalyst();
  updateDashboardBattleBanner();
  showToast("✨ โหลดตัวอย่างการต่อสู้ 0-Cycle เรียบร้อยแล้ว", "success");
}

function setupDamageAnalystEvents() {
  if (el.btnAnalystFetch) {
    el.btnAnalystFetch.addEventListener('click', () => fetchLatestBattleReport(false));
  }

  if (el.btnAnalystClear) {
    el.btnAnalystClear.addEventListener('click', clearBattleReport);
  }

  if (el.btnAnalystExport) {
    el.btnAnalystExport.addEventListener('click', exportBattleReportJson);
  }

  if (el.btnAnalystImport && el.inputAnalystFile) {
    el.btnAnalystImport.addEventListener('click', () => {
      el.inputAnalystFile.click();
    });

    el.inputAnalystFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          let report = null;
          if (parsed.avatars || parsed.team_total_damage !== undefined) {
            report = parsed;
          } else {
            report = parseFireflySranalysisJson(parsed);
          }

          if (report && (report.avatars || report.team_total_damage !== undefined)) {
            analystState.currentReport = report;
            analystState.lastBattleTimestamp = report.timestamp || Date.now();
            renderDamageAnalyst();
            updateDashboardBattleBanner();
            showToast(t('analystToastImported'), 'success');

            try {
              await apiCall('/api/battle_report', 'POST', report);
            } catch (_) {}
          } else {
            showToast('รูปแบบไฟล์ JSON ไม่ถูกต้อง (ต้องการ GaC Battle Report หรือ Firefly-Sranalysis JSON)', 'error');
          }
        } catch (err) {
          showToast(`ไฟล์ JSON ผิดพลาด: ${err.message}`, 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  if (el.btnMiniViewFullAnalyst) {
    el.btnMiniViewFullAnalyst.addEventListener('click', () => {
      const btn = document.querySelector('.tab-btn[data-tab="tab-damage-analyst"]');
      if (btn) btn.click();
    });
  }

  if (!analystState.autoSyncInterval) {
    analystState.autoSyncInterval = setInterval(() => {
      if (el.chkAnalystAutosync && el.chkAnalystAutosync.checked && state.isConnected) {
        fetchLatestBattleReport(true);
      }
    }, 3000);
  }
}

window.renderMiniBattleSummary = renderMiniBattleSummary;
window.fetchLatestBattleReport = fetchLatestBattleReport;
window.loadDemoBattleReport = loadDemoBattleReport;
window.exportBattleReportJson = exportBattleReportJson;
window.clearBattleReport = clearBattleReport;

// Background Ping Loop
function startPingLoop() {
  setInterval(() => {
    refreshStatus();
  }, state.pingIntervalSec * 1000);
}

// Initialize Application
async function init() {
  await initGitBranchDisplay();
  initAvatarsList();
  await loadCachedStorageData();
  setupServerModes();
  setupLanguageSelector();
  setupTabs();
  setupModalSubtabs();
  setupEvents();
  setupInventoryEvents();
  setupDamageAnalystEvents();
  setupGMConsoleEvents();
  applyTranslations();
  renderLineup(state.statusData?.lineups || DEFAULT_LINEUP);
  renderAvatarsGrid();
  loadEquipment();
  renderEmptyDamageAnalyst();
  refreshStatus();
  fetchLatestBattleReport(true);
  startPingLoop();
  updateCacheUsageDisplay();
}

// Run on DOM load
window.addEventListener('DOMContentLoaded', init);
