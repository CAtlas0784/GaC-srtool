import { AVATAR_METADATA, getAvatarInfo } from './avatars-data.js';
import { SUPPORTED_LANGUAGES, getCurrentLanguage, setLanguage, t, translateElement, translatePath } from './i18n.js';

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
  selectedAvatarDetail: null
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
  btnQuickMaxAll: document.getElementById('btn-quick-max-all'),
  btnQuickSyncPersistent: document.getElementById('btn-quick-sync-persistent'),

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

  // Persistent Tab
  tabBtnPersistent: document.getElementById('tab-btn-persistent'),
  formPersistentChars: document.getElementById('form-persistent-chars'),
  persistentMcSelect: document.getElementById('persistent-mc-select'),
  persistentMarchSelect: document.getElementById('persistent-march-select'),
  toggleSwGlobal: document.getElementById('toggle-sw-global'),
  toggleCastoriceGlobal: document.getElementById('toggle-castorice-global'),
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

  modalLcId: document.getElementById('modal-lc-id'),
  modalLcLevel: document.getElementById('modal-lc-level'),
  btnModalMaxLc: document.getElementById('btn-modal-max-lc'),
  modalLcRankBtns: document.getElementById('modal-lc-rank-btns'),

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
function getElementClass(elem) {
  const map = {
    Fire: 'elem-fire',
    Ice: 'elem-ice',
    Lightning: 'elem-lightning',
    Wind: 'elem-wind',
    Physical: 'elem-physical',
    Quantum: 'elem-quantum',
    Imaginary: 'elem-imaginary'
  };
  return map[elem] || 'elem-physical';
}

// Render Element Icon HTML (Official Star Rail Game Icon)
function getElementIconHtml(element, size = 20) {
  if (!element) return '';
  const elemClass = getElementClass(element);
  return `<span class="icon-badge element-icon-badge ${elemClass}" title="${element}">
    <img src="assets/elements/${element}.png"
         alt="${element}"
         style="width: ${size}px; height: ${size}px;"
         onerror="if(this.src.indexOf('StarRailRes')===-1){this.src='https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/element/${element === 'Lightning' ? 'Thunder' : element}.png';}">
  </span>`;
}

// Render Path Icon HTML (Official Star Rail Game Icon)
function getPathIconHtml(path, size = 20) {
  if (!path) return '';
  const safePath = path === 'The Hunt' ? 'Hunt' : path;
  return `<span class="icon-badge path-icon-badge" title="${path}">
    <img src="assets/paths/${path}.png"
         alt="${path}"
         style="width: ${size}px; height: ${size}px;"
         onerror="if(this.src.indexOf('StarRailRes')===-1){this.src='https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/path/${safePath}.png';}">
  </span>`;
}

// Apply multi-language translations across UI
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    elem.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-placeholder');
    elem.placeholder = t(key);
  });

  renderLineup(state.statusData?.lineups);
  if (state.statusData?.ex_ranks) {
    renderExRanks(state.statusData.ex_ranks);
  }
  if (state.avatarsList.length > 0) {
    renderAvatarsGrid();
  }
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
      showToast(`สลับโหมดเซิร์ฟเวอร์เป็น: ${el.lblActiveMode ? el.lblActiveMode.textContent : e.target.value}`, 'info');
      refreshStatus();
    });
  }

  if (el.settingServerMode) {
    el.settingServerMode.addEventListener('change', (e) => {
      updateModeDisplay(e.target.value);
      showToast(`สลับโหมดเซิร์ฟเวอร์เป็น: ${el.lblActiveMode ? el.lblActiveMode.textContent : e.target.value}`, 'info');
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
  el.lineupContainer.innerHTML = '';
  let currentLineup = lineups || state.statusData?.lineups || DEFAULT_LINEUP;

  // Handle array format if provided
  if (Array.isArray(currentLineup)) {
    const mapped = {};
    currentLineup.forEach((id, idx) => { mapped[idx] = id; });
    currentLineup = mapped;
  }

  for (let slot = 0; slot < 4; slot++) {
    const avatarId = currentLineup[slot] || currentLineup[String(slot)] || 0;
    const slotCard = document.createElement('div');
    slotCard.className = `lineup-slot-card ${avatarId ? 'filled' : ''}`;
    slotCard.title = 'คลิกเพื่อเลือกตัวละครลงตำแหน่งนี้';

    if (avatarId === 0) {
      slotCard.innerHTML = `
        <div class="lineup-slot-num">Slot ${slot + 1}</div>
        <div style="font-size: 2.2rem; color: var(--text-muted); opacity: 0.5;">➕</div>
        <div style="font-weight: 700; color: var(--text-muted); margin-top: 0.5rem;">ว่าง (คลิกเพื่อเพิ่ม)</div>
      `;
    } else {
      const info = getAvatarInfo(avatarId);
      slotCard.innerHTML = `
        <div class="lineup-slot-num">Slot ${slot + 1}</div>
        <img class="lineup-slot-img"
             src="./assets/avatars/${avatarId}.png"
             onerror="if(this.src.indexOf('jsdelivr')===-1){this.src='https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${avatarId}.png';}else{this.style.display='none';}"
             alt="${info.name}">
        <div style="font-weight: 800; font-size: 1rem; color: var(--text-highlight); margin-top: 0.35rem;">${info.name}</div>
        <div style="display: flex; gap: 0.4rem; margin-top: 0.4rem; justify-content: center; align-items: center;">
          ${getElementIconHtml(info.element, 20)}
          ${getPathIconHtml(info.path, 20)}
        </div>
      `;
    }

    slotCard.addEventListener('click', () => {
      openLineupPicker(slot);
    });

    el.lineupContainer.appendChild(slotCard);
  }
}

// Lineup Picker Modal
function openLineupPicker(slotIndex) {
  state.selectedLineupSlot = slotIndex;
  el.modalPickerTitle.textContent = `เลือกตัวละครเข้าสู่ Slot ${slotIndex + 1}`;
  el.pickerSearch.value = '';
  renderPickerGrid();
  el.modalLineupPicker.classList.add('active');
}

function renderPickerGrid() {
  const search = el.pickerSearch.value.trim().toLowerCase();
  el.pickerAvatarsGrid.innerHTML = '';

  // Option to remove character from slot
  const removeCard = document.createElement('div');
  removeCard.className = 'card';
  removeCard.style.padding = '0.75rem';
  removeCard.style.textAlign = 'center';
  removeCard.style.cursor = 'pointer';
  removeCard.innerHTML = `
    <div style="font-size: 1.5rem; color: var(--accent-red);">❌</div>
    <div style="font-size: 0.85rem; font-weight: bold; margin-top: 0.35rem; color: var(--accent-red);">นำออกจากทีม</div>
  `;
  removeCard.addEventListener('click', async () => {
    await assignAvatarToLineup(state.selectedLineupSlot, 0);
    el.modalLineupPicker.classList.remove('active');
  });
  el.pickerAvatarsGrid.appendChild(removeCard);

  // Available avatars
  state.avatarsList.forEach(item => {
    const meta = getAvatarInfo(item.avatar_id);
    if (search && !meta.name.toLowerCase().includes(search) && !String(item.avatar_id).includes(search)) {
      return;
    }

    const card = document.createElement('div');
    card.className = `card avatar-card card-rarity-${meta.rarity}`;
    card.style.minHeight = 'auto';
    card.style.padding = '0.85rem';
    card.style.cursor = 'pointer';

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        <div class="avatar-image-container" style="width: 44px; height: 44px;">
          <img class="avatar-img"
               src="./assets/avatars/${item.avatar_id}.png"
               onerror="if(this.src.indexOf('jsdelivr')===-1){this.src='https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${item.avatar_id}.png';}else{this.style.display='none';}"
               alt="${meta.name}">
        </div>
        <div>
          <div style="font-weight: 700; font-size: 0.9rem;">${meta.name}</div>
          <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 0.25rem; display: flex; align-items: center; gap: 0.35rem;">
            ${getElementIconHtml(meta.element, 16)}
            ${getPathIconHtml(meta.path, 16)}
            <span style="margin-left: 0.25rem;">Lv. ${item.level} • E${item.rank}</span>
          </div>
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
    lineups[slot] = avatarId;
    state.statusData.lineups = lineups;

    if (state.isConnected) {
      if (state.serverMode === 'gac') {
        await apiCall('/api/persistent', 'POST', { lineups });
      } else {
        await saveFreesrChangesToServer();
      }
    }

    renderLineup(lineups);
    const name = avatarId ? getAvatarInfo(avatarId).name : 'ว่าง';
    showToast(`อัปเดตทีม Slot ${slot + 1} เป็น: ${name}`, 'success');
  } catch (err) {
    showToast(`เกิดข้อผิดพลาดในการเปลี่ยนทีม: ${err.message}`, 'error');
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
    const matchesElement = elementFilter === 'all' || meta.element === elementFilter;
    const matchesPath = pathFilter === 'all' || meta.path === pathFilter || (pathFilter === 'Hunt' && (meta.path === 'Hunt' || meta.path === 'The Hunt'));
    return matchesSearch && matchesRarity && matchesElement && matchesPath;
  });

  if (filtered.length === 0) {
    el.avatarsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">ไม่พบตัวละครที่ตรงกับเงื่อนไข</div>';
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
        <button type="button" class="btn btn-sm btn-gold btn-card-quick-max" title="ปรับ Max E6 ทันที">⭐ MAX</button>
      </div>
    `;

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
      showToast(`⭐ ปรับ ${getAvatarInfo(avatarId).name} เป็น Lv. 80 E6 เรียบร้อย`, 'success');
    } catch (err) {
      showToast(`⭐ ปรับ ${getAvatarInfo(avatarId).name} เป็น Lv. 80 E6 (บันทึกในเครื่อง)`, 'info');
    }
  } else {
    showToast(`⭐ ปรับ ${getAvatarInfo(avatarId).name} เป็น Lv. 80 E6 (บันทึกในเครื่อง)`, 'info');
  }
}

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

// Character Detail / Build Modal (Inspired by srtools.punklorde.org/skills-info)
function openAvatarDetailModal(avatarItem) {
  state.selectedAvatarDetail = avatarItem;
  const aid = avatarItem.avatar_id;
  const meta = getAvatarInfo(aid);

  el.modalCharTitle.textContent = `ปรับแต่งตัวละคร: ${meta.name} (ID: ${aid})`;
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

  // Ultimate Energy
  const maxSp = av?.sp_max ?? 140;
  const currentSp = av?.sp_value ?? maxSp;
  if (el.rangeCharEnergy && el.valCharEnergy) {
    el.rangeCharEnergy.max = maxSp;
    el.rangeCharEnergy.value = currentSp;
    el.valCharEnergy.textContent = `${currentSp}/${maxSp}`;
  }

  // Lightcone
  const equippedLc = (state.fullFreesrData?.lightcones || []).find(lc => lc.equip_avatar === aid);
  if (equippedLc) {
    if (el.modalLcId) el.modalLcId.value = equippedLc.item_id || '';
    if (el.modalLcLevel) el.modalLcLevel.value = equippedLc.level || 80;
    selectedLcRank = equippedLc.rank || 5;
  } else {
    if (el.modalLcId) el.modalLcId.value = '';
    if (el.modalLcLevel) el.modalLcLevel.value = 80;
    selectedLcRank = 5;
  }
  updateLcRankPips(selectedLcRank);

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

  showToast('⭐ ปรับสกิลและร่องรอยเต็มทั้งหมดแล้ว', 'info');
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

  // Energy 100%
  if (el.rangeCharEnergy && el.valCharEnergy) {
    el.rangeCharEnergy.value = el.rangeCharEnergy.max;
    el.valCharEnergy.textContent = `${el.rangeCharEnergy.max}/${el.rangeCharEnergy.max}`;
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
      sp_value: parseInt(el.rangeCharEnergy?.value, 10) || 140,
      sp_max: parseInt(el.rangeCharEnergy?.max, 10) || 140,
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
  if (el.rangeCharEnergy) {
    av.sp_value = parseInt(el.rangeCharEnergy.value, 10) || av.sp_max || 140;
  }

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
  el.modalAvatarDetail.classList.remove('active');

  if (state.isConnected) {
    try {
      if (state.serverMode === 'gac') {
        await apiCall('/api/freesr/avatars', 'POST', { avatar_id: aid, level, promotion, rank });
        await saveFreesrChangesToServer();
      } else {
        await saveFreesrChangesToServer();
      }
      showToast(`บันทึกตัวละคร ${getAvatarInfo(aid).name} เรียบร้อย`, 'success');
    } catch (err) {
      showToast(`บันทึกในเครื่องแล้ว (ส่งเซิร์ฟเวอร์ไม่ได้: ${err.message})`, 'warning');
    }
  } else {
    showToast(`บันทึกตัวละคร ${getAvatarInfo(aid).name} เรียบร้อย`, 'success');
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

    el.badgeTotalLc.textContent = `${lcs.length} ชิ้น`;
    el.badgeTotalRelics.textContent = `${relics.length} ชิ้น`;

    // Render Lightcones
    el.lightconesList.innerHTML = '';
    if (lcs.length === 0) {
      el.lightconesList.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1.5rem;">ยังไม่มีข้อมูลกรวยแสง (สามารถอัปโหลด freesr-data.json ในแท็บ JSON เพื่อดูได้)</div>';
    } else {
      lcs.slice(0, 100).forEach(lc => {
        const item = document.createElement('div');
        item.className = 'card';
        item.style.padding = '0.75rem';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        const equipped = lc.equip_avatar ? getAvatarInfo(lc.equip_avatar).name : 'ไม่ได้สวมใส่';
        item.innerHTML = `
          <div>
            <div style="font-weight: 700; font-size: 0.95rem;">Lightcone ID: ${lc.item_id} (UID: ${lc.internal_uid})</div>
            <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.2rem;">
              Lv. ${lc.level} • ขัดเกลา S${lc.rank} • สวมใส่โดย: <strong style="color: var(--accent-cyan);">${equipped}</strong>
            </div>
          </div>
        `;
        el.lightconesList.appendChild(item);
      });
    }

    // Render Relics
    el.relicsList.innerHTML = '';
    if (relics.length === 0) {
      el.relicsList.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1.5rem;">ยังไม่มีข้อมูลรีลิกส์ (สามารถอัปโหลด freesr-data.json ในแท็บ JSON เพื่อดูได้)</div>';
    } else {
      relics.slice(0, 100).forEach(r => {
        const item = document.createElement('div');
        item.className = 'card';
        item.style.padding = '0.75rem';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        const equipped = r.equip_avatar ? getAvatarInfo(r.equip_avatar).name : 'ไม่ได้สวมใส่';
        item.innerHTML = `
          <div>
            <div style="font-weight: 700; font-size: 0.95rem;">Relic ID: ${r.item_id} (UID: ${r.internal_uid})</div>
            <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.2rem;">
              Lv. ${r.level} • สวมใส่โดย: <strong style="color: var(--accent-cyan);">${equipped}</strong>
            </div>
          </div>
        `;
        el.relicsList.appendChild(item);
      });
    }
  } catch (err) {
    console.warn('Equipment loading error:', err);
  }
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
  el.btnModalSaveAvatar.addEventListener('click', saveAvatarDetails);
  el.btnModalMaxSkills.addEventListener('click', maxSkillsForAvatar);
  document.getElementById('btn-modal-max-all-char')?.addEventListener('click', maxAllBuildForCurrentAvatar);

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
    });
  });
  el.btnModalMaxLc?.addEventListener('click', () => {
    if (el.modalLcLevel) el.modalLcLevel.value = 80;
    updateLcRankPips(5);
    showToast('ปรับกรวยแสงเป็นเลเวล 80 ขัดเกลา 5 เรียบร้อย', 'info');
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

  // Quick Action Buttons on Dashboard
  el.btnQuickMaxAll.addEventListener('click', maxAllAvatars);
  el.btnMaxAllAvatars.addEventListener('click', maxAllAvatars);

  el.btnQuickSyncPersistent.addEventListener('click', async () => {
    try {
      await apiCall('/api/persistent');
      showToast('ซิงค์ข้อมูล Persistent เรียบร้อย', 'success');
      refreshStatus();
    } catch (err) {
      showToast(`Sync failed: ${err.message}`, 'error');
    }
  });

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
    try {
      await apiCall('/api/persistent', 'POST', {
        enable_sw_global: sw,
        enable_castorice_global: castorice
      });
      showToast('บันทึกสวิตช์ Global เรียบร้อย!', 'success');
      refreshStatus();
    } catch (err) {
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
    }
  });

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
