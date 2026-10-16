import { AVATAR_METADATA, getAvatarInfo } from './avatars-data.js';
import { PRESET_TELEPORTS, getTeleportName } from './teleports-data.js';
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

// UI Elements
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
  btnQuickWarpExpress: document.getElementById('btn-quick-warp-express'),
  btnQuickSyncPersistent: document.getElementById('btn-quick-sync-persistent'),

  // Avatars
  avatarsGrid: document.getElementById('avatars-grid'),
  avatarSearch: document.getElementById('avatar-search'),
  avatarFilterRarity: document.getElementById('avatar-filter-rarity'),
  avatarFilterElement: document.getElementById('avatar-filter-element'),
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
  exrankList: document.getElementById('exrank-list'),
  btnExrankEnableAll: document.getElementById('btn-exrank-enable-all'),
  btnExrankDisableAll: document.getElementById('btn-exrank-disable-all'),

  // Teleport
  teleportPresetsList: document.getElementById('teleport-presets-list'),
  formCustomTeleport: document.getElementById('form-custom-teleport'),
  tpPlane: document.getElementById('tp-plane'),
  tpFloor: document.getElementById('tp-floor'),
  tpEntry: document.getElementById('tp-entry'),
  tpX: document.getElementById('tp-x'),
  tpY: document.getElementById('tp-y'),
  tpZ: document.getElementById('tp-z'),

  // JSON
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
  btnModalMaxSkills: document.getElementById('btn-modal-max-skills'),
  btnModalSaveAvatar: document.getElementById('btn-modal-save-avatar'),

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
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';

  toast.innerHTML = `<span>${icon}</span><span style="flex: 1;">${message}</span>`;
  el.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// API Fetch Helper
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
    const timeoutId = setTimeout(() => controller.abort(), 8000);
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

  if (state.statusData) {
    renderLineup(state.statusData.lineups);
    renderExRanks(state.statusData.ex_ranks || []);
  }
  renderTeleportPresets();
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

// Setup Server Mode Selector
function setupServerModes() {
  const updateModeDisplay = (mode) => {
    state.serverMode = mode;
    localStorage.setItem('gac_srtool_mode', mode);
    el.serverModeSelect.value = mode;
    el.settingServerMode.value = mode;

    if (mode === 'gac') {
      el.lblActiveMode.textContent = 'GaC-hkrpg-go (เซิร์ฟเวอร์หลัก / Full Control)';
      el.lblActiveMode.style.color = 'var(--accent-cyan)';
      el.tabBtnPersistent.style.display = 'inline-flex';
    } else if (mode === 'firefly') {
      el.lblActiveMode.textContent = 'FireflyGo (FreeSR Compatible)';
      el.lblActiveMode.style.color = '#f87171';
      el.tabBtnPersistent.style.display = 'none';
    } else if (mode === 'robin') {
      el.lblActiveMode.textContent = 'RobinSR (FreeSR Compatible)';
      el.lblActiveMode.style.color = '#c084fc';
      el.tabBtnPersistent.style.display = 'none';
    }
  };

  el.serverModeSelect.addEventListener('change', (e) => {
    updateModeDisplay(e.target.value);
    showToast(`สลับโหมดเซิร์ฟเวอร์เป็น: ${el.lblActiveMode.textContent}`, 'info');
    refreshStatus();
  });

  el.settingServerMode.addEventListener('change', (e) => {
    updateModeDisplay(e.target.value);
    showToast(`สลับโหมดเซิร์ฟเวอร์เป็น: ${el.lblActiveMode.textContent}`, 'info');
    refreshStatus();
  });

  updateModeDisplay(state.serverMode);
}

// Refresh status from server
async function refreshStatus() {
  try {
    let data;
    if (state.serverMode === 'gac') {
      data = await apiCall('/api/status');
    } else {
      // FireflyGo / RobinSR fallback check
      const freesr = await apiCall('/api/freesr').catch(() => null);
      if (freesr && freesr.data) {
        data = {
          status: 200,
          avatar_count: Object.keys(freesr.data.avatars || {}).length,
          lightcone_count: (freesr.data.lightcones || []).length,
          relic_count: (freesr.data.relics || []).length,
          lineups: freesr.data.lineups || { 0: 8001 },
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
    el.statAvatars.textContent = data.avatar_count ?? 0;
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

    renderLineup(data.lineups);
    renderExRanks(data.ex_ranks || []);
  } catch (err) {
    setConnectionStatus(false, t('connectFailed'));
  }
}

// Render party lineup cards
function renderLineup(lineups) {
  el.lineupContainer.innerHTML = '';
  for (let slot = 0; slot < 4; slot++) {
    const avatarId = lineups ? (lineups[slot] || 0) : 0;
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
      const elemClass = getElementClass(info.element);
      slotCard.innerHTML = `
        <div class="lineup-slot-num">Slot ${slot + 1}</div>
        <img class="lineup-slot-img"
             src="./assets/avatars/${avatarId}.png"
             onerror="if(this.src.indexOf('jsdelivr')===-1){this.src='https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${avatarId}.png';}else{this.style.display='none';}"
             alt="${info.name}">
        <div style="font-weight: 800; font-size: 1rem; color: var(--text-highlight);">${info.name}</div>
        <div style="display: flex; gap: 0.35rem; margin-top: 0.35rem;">
          <span class="element-badge ${elemClass}">${info.element}</span>
          <span class="path-badge">${info.path}</span>
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

  // Add Remove button
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

    const elemClass = getElementClass(meta.element);
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
          <div style="font-size: 0.725rem; color: var(--text-muted);">Lv. ${item.level} • E${item.rank}</div>
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
    if (!state.statusData || !state.statusData.lineups) return;
    const lineups = { ...state.statusData.lineups };
    lineups[slot] = avatarId;
    state.statusData.lineups = lineups;

    if (state.serverMode === 'gac') {
      await apiCall('/api/persistent', 'POST', { lineups });
    } else {
      // In FreeSR standard mode
      const freesr = await apiCall('/api/freesr');
      if (freesr && freesr.data) {
        freesr.data.lineups = lineups;
        await apiCall('/api/freesr', 'POST', freesr.data);
      }
    }
    showToast(`อัปเดตทีม Slot ${slot + 1} เรียบร้อย`, 'success');
    renderLineup(lineups);
  } catch (err) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
  }
}

// Load and Render Avatars
async function loadAvatars() {
  try {
    el.avatarsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">${t('checking')}</div>`;
    const res = await apiCall('/api/freesr/avatars');
    state.avatarsList = res.avatars || [];
    renderAvatarsGrid();
  } catch (err) {
    el.avatarsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--accent-red);">${err.message}</div>`;
  }
}

function renderAvatarsGrid() {
  const searchTerm = el.avatarSearch.value.trim().toLowerCase();
  const rarityFilter = el.avatarFilterRarity.value;
  const elementFilter = el.avatarFilterElement.value;

  const filtered = state.avatarsList.filter(item => {
    const meta = getAvatarInfo(item.avatar_id);
    const matchesSearch = meta.name.toLowerCase().includes(searchTerm) || String(item.avatar_id).includes(searchTerm);
    const matchesRarity = rarityFilter === 'all' || String(meta.rarity) === rarityFilter;
    const matchesElement = elementFilter === 'all' || meta.element === elementFilter;
    return matchesSearch && matchesRarity && matchesElement;
  });

  if (filtered.length === 0) {
    el.avatarsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">ไม่พบตัวละครที่ตรงกับเงื่อนไข</div>';
    return;
  }

  el.avatarsGrid.innerHTML = '';
  filtered.forEach(item => {
    const meta = getAvatarInfo(item.avatar_id);
    const elemClass = getElementClass(meta.element);
    const card = document.createElement('div');
    card.className = `card avatar-card card-rarity-${meta.rarity}`;

    const pipsHtml = [0, 1, 2, 3, 4, 5, 6].map(rank => `
      <button class="eidolon-pip ${item.rank >= rank ? 'active' : ''}" data-avatar="${item.avatar_id}" data-rank="${rank}" title="Eidolon ${rank}">
        ${rank}
      </button>
    `).join('');

    card.innerHTML = `
      <span class="avatar-badge-rarity rarity-${meta.rarity}">★ ${meta.rarity}</span>
      <div>
        <div class="avatar-header-info">
          <div class="avatar-image-container">
            <img class="avatar-img"
                 src="./assets/avatars/${item.avatar_id}.png"
                 onerror="if(this.src.indexOf('jsdelivr')===-1){this.src='https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${item.avatar_id}.png';}else{this.style.display='none';this.nextElementSibling.style.display='flex';}"
                 alt="${meta.name}">
            <div class="avatar-icon-placeholder" style="display: none;">${meta.name.charAt(0)}</div>
          </div>
          <div>
            <div class="avatar-name">${meta.name}</div>
            <div class="avatar-subinfo">
              <span class="element-badge ${elemClass}">${meta.element}</span>
              <span class="path-badge">${meta.path}</span>
              <span style="font-weight: 700; color: var(--accent-cyan);">Lv. ${item.level}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="eidolon-selector">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">${t('eidolonLabel')}</span>
        <div class="eidolon-buttons">
          ${pipsHtml}
        </div>
      </div>
    `;

    // Eidolon button clicks
    card.querySelectorAll('.eidolon-pip').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const avatarId = parseInt(btn.getAttribute('data-avatar'), 10);
        const rank = parseInt(btn.getAttribute('data-rank'), 10);
        await setAvatarRank(avatarId, rank);
      });
    });

    // Clicking card opens full character build modal!
    card.addEventListener('click', () => {
      openAvatarDetailModal(item);
    });

    el.avatarsGrid.appendChild(card);
  });
}

// Character Detail / Build Modal
function openAvatarDetailModal(avatarItem) {
  state.selectedAvatarDetail = avatarItem;
  const meta = getAvatarInfo(avatarItem.avatar_id);
  const elemClass = getElementClass(meta.element);

  el.modalCharTitle.textContent = `ปรับแต่งตัวละคร: ${meta.name} (ID: ${avatarItem.avatar_id})`;
  el.modalCharImg.src = `./assets/avatars/${avatarItem.avatar_id}.png`;
  el.modalCharImg.onerror = function() {
    this.src = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${avatarItem.avatar_id}.png`;
  };
  el.modalCharName.textContent = meta.name;
  el.modalCharMeta.innerHTML = `
    <span class="element-badge ${elemClass}">${meta.element}</span>
    <span class="path-badge">${meta.path}</span>
    <span class="avatar-badge-rarity rarity-${meta.rarity}">★ ${meta.rarity}</span>
  `;

  el.modalCharLevel.value = avatarItem.level || 80;
  el.modalCharPromotion.value = avatarItem.promotion || 6;

  // Render modal eidolon pips
  el.modalCharEidolonBtns.innerHTML = '';
  for (let r = 0; r <= 6; r++) {
    const btn = document.createElement('button');
    btn.className = `eidolon-pip ${avatarItem.rank >= r ? 'active' : ''}`;
    btn.textContent = r;
    btn.style.width = '32px';
    btn.style.height = '32px';
    btn.style.fontSize = '0.9rem';
    btn.addEventListener('click', () => {
      avatarItem.rank = r;
      el.modalCharEidolonBtns.querySelectorAll('.eidolon-pip').forEach((b, idx) => {
        if (idx <= r) b.classList.add('active');
        else b.classList.remove('active');
      });
    });
    el.modalCharEidolonBtns.appendChild(btn);
  }

  el.modalAvatarDetail.classList.add('active');
}

// Save avatar details from modal
async function saveAvatarDetails() {
  if (!state.selectedAvatarDetail) return;
  const aid = state.selectedAvatarDetail.avatar_id;
  const level = parseInt(el.modalCharLevel.value, 10) || 80;
  const promotion = parseInt(el.modalCharPromotion.value, 10) || 6;
  const rank = state.selectedAvatarDetail.rank ?? 6;

  try {
    await apiCall('/api/freesr/avatars', 'POST', {
      avatar_id: aid,
      level,
      promotion,
      rank
    });
    showToast(`บันทึกตัวละคร ${aid} สำเร็จ (Lv. ${level}, Prom. ${promotion}, E${rank})`, 'success');
    el.modalAvatarDetail.classList.remove('active');

    // Update local state and re-render
    const target = state.avatarsList.find(a => a.avatar_id === aid);
    if (target) {
      target.level = level;
      target.promotion = promotion;
      target.rank = rank;
      renderAvatarsGrid();
    }
  } catch (err) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
  }
}

// Max Skills & Traces for character
async function maxSkillsForAvatar() {
  if (!state.selectedAvatarDetail) return;
  const aid = state.selectedAvatarDetail.avatar_id;
  try {
    // Read freesr data, max skill levels for this avatar, and push back
    const freesr = await apiCall('/api/freesr');
    if (freesr && freesr.data && freesr.data.avatars && freesr.data.avatars[aid]) {
      const av = freesr.data.avatars[aid];
      if (av.data && av.data.skills) {
        for (const k in av.data.skills) {
          av.data.skills[k] = 10;
        }
      }
      av.level = 80;
      av.promotion = 6;
      av.data.rank = 6;
      await apiCall('/api/freesr', 'POST', freesr.data);
      showToast(`อัพสกิลและ Traces ทั้งหมดของตัวละคร ${aid} เป็น 10/10 สำเร็จ!`, 'success');
      loadAvatars();
    }
  } catch (err) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
  }
}

// Set avatar rank API
async function setAvatarRank(avatarId, rank) {
  try {
    await apiCall('/api/avatar/rank', 'POST', { avatar_id: avatarId, rank });
    showToast(t('avatarRankSuccess', { id: avatarId, rank }), 'success');
    
    const target = state.avatarsList.find(a => a.avatar_id === avatarId);
    if (target) {
      target.rank = rank;
      renderAvatarsGrid();
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Max all avatars API
async function maxAllAvatars() {
  if (!confirm(t('confirmMaxAll'))) return;
  try {
    await apiCall('/api/avatar/max_all', 'POST', {});
    showToast(t('maxAllSuccess'), 'success');
    loadAvatars();
    refreshStatus();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Load Equipment (Lightcones & Relics)
async function loadEquipment() {
  try {
    const res = await apiCall('/api/freesr');
    if (!res || !res.data) return;
    state.fullFreesrData = res.data;

    const lcs = res.data.lightcones || [];
    const relics = res.data.relics || [];

    el.badgeTotalLc.textContent = `${lcs.length} ชิ้น`;
    el.badgeTotalRelics.textContent = `${relics.length} ชิ้น`;

    // Render Lightcones
    el.lightconesList.innerHTML = '';
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

    // Render Relics
    el.relicsList.innerHTML = '';
    relics.slice(0, 100).forEach(r => {
      const item = document.createElement('div');
      item.className = 'card';
      item.style.padding = '0.75rem';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';

      const equipped = r.equip_avatar ? getAvatarInfo(r.equip_avatar).name : 'ไม่ได้สวมใส่';
      const slotNum = r.relic_id % 10;
      item.innerHTML = `
        <div>
          <div style="font-weight: 700; font-size: 0.95rem;">Relic ID: ${r.relic_id} (Slot: ${slotNum})</div>
          <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.2rem;">
            Lv. ${r.level} • สเตตัสหลัก: ${r.main_affix_id} • สวมใส่โดย: <strong style="color: var(--accent-gold);">${equipped}</strong>
          </div>
        </div>
      `;
      el.relicsList.appendChild(item);
    });

  } catch (err) {
    showToast(`โหลดคลังอุปกรณ์ไม่สำเร็จ: ${err.message}`, 'error');
  }
}

// Load Persistent Save Settings
async function loadPersistentSettings() {
  try {
    const res = await apiCall('/api/persistent');
    if (!res || !res.persistent) return;
    const p = res.persistent;
    state.persistentData = p;

    if (p.main_character) {
      el.persistentMcSelect.value = p.main_character;
    }
    if (p.march_type) {
      el.persistentMarchSelect.value = p.march_type;
    }
    el.toggleSwGlobal.checked = !!p.enable_sw_global;
    el.toggleCastoriceGlobal.checked = !!p.enable_castorice_global;
  } catch (err) {
    console.warn('Persistent settings not available in current mode:', err.message);
  }
}

// Render Ex-Ranks
function renderExRanks(exList) {
  if (!exList || exList.length === 0) {
    el.exrankList.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1rem;">ไม่มีข้อมูลตัวละคร Ex-Rank</div>';
    return;
  }

  el.exrankList.innerHTML = '';
  exList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'ex-switch-card';
    const localizedMeta = getAvatarInfo(item.avatar_id);

    card.innerHTML = `
      <div style="display: flex; gap: 0.85rem; align-items: center;">
        <div class="avatar-image-container" style="width: 52px; height: 52px;">
          <img class="avatar-img"
               src="./assets/avatars/${item.avatar_id}.png"
               onerror="if(this.src.indexOf('jsdelivr')===-1){this.src='https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${item.avatar_id}.png';}else{this.style.display='none';this.nextElementSibling.style.display='flex';}"
               alt="${localizedMeta.name}">
          <div class="avatar-icon-placeholder" style="display: none;">${localizedMeta.name.charAt(0)}</div>
        </div>
        <div>
          <div style="font-weight: 800; font-size: 1.05rem;">${localizedMeta.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            Avatar ID: ${item.avatar_id} • Ex-Rank Skill ID: ${item.ex_rank_id}
          </div>
        </div>
      </div>
      <label class="switch">
        <input type="checkbox" ${item.unlocked ? 'checked' : ''} data-avatar="${item.avatar_id}">
        <span class="slider"></span>
      </label>
    `;

    card.querySelector('input[type="checkbox"]').addEventListener('change', async (e) => {
      const unlocked = e.target.checked;
      const avatarId = item.avatar_id;
      try {
        await apiCall('/api/exrank/toggle', 'POST', { avatar_id: avatarId, unlocked });
        const statusText = unlocked ? t('enabled') : t('disabled');
        showToast(t('exrankToggleSuccess', { name: localizedMeta.name, status: statusText }), 'success');
      } catch (err) {
        e.target.checked = !unlocked;
        showToast(`Error: ${err.message}`, 'error');
      }
    });

    el.exrankList.appendChild(card);
  });
}

// Render Teleport Presets
function renderTeleportPresets() {
  el.teleportPresetsList.innerHTML = '';
  PRESET_TELEPORTS.forEach(preset => {
    const item = document.createElement('div');
    item.className = 'card';
    item.style.padding = '0.85rem';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';

    const displayName = getTeleportName(preset);

    item.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 0.95rem;">${displayName}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
          Plane: ${preset.plane_id} • Floor: ${preset.floor_id} • Entry: ${preset.entry_id}
        </div>
      </div>
      <button class="btn btn-sm btn-primary btn-warp" style="white-space: nowrap;">
        ${t('warpBtn')}
      </button>
    `;

    item.querySelector('.btn-warp').addEventListener('click', async () => {
      await executeTeleport({
        plane_id: preset.plane_id,
        floor_id: preset.floor_id,
        entry_id: preset.entry_id,
        x: preset.x,
        y: preset.y,
        z: preset.z
      }, displayName);
    });

    el.teleportPresetsList.appendChild(item);
  });
}

// Execute Teleport API
async function executeTeleport(payload, label = '') {
  try {
    await apiCall('/api/teleport', 'POST', payload);
    showToast(t('warpSuccess', { label: label || `Plane ${payload.plane_id}` }), 'success');
    refreshStatus();
  } catch (err) {
    showToast(t('warpFailed', { err: err.message }), 'error');
  }
}

// Load and Switch JSON
async function loadJsonData(mode) {
  state.currentJsonMode = mode;
  if (mode === 'freesr') {
    el.btnSelectFreesr.className = 'btn btn-sm btn-primary active';
    el.btnSelectPersistent.className = 'btn btn-sm btn-secondary';
    el.jsonStatusInfo.textContent = t('jsonStatusOpening', { name: 'freesr-data.json' });
    try {
      const res = await apiCall('/api/freesr');
      el.jsonEditor.value = JSON.stringify(res.data, null, 2);
    } catch (err) {
      showToast(`Load failed: ${err.message}`, 'error');
    }
  } else {
    el.btnSelectPersistent.className = 'btn btn-sm btn-primary active';
    el.btnSelectFreesr.className = 'btn btn-sm btn-secondary';
    el.jsonStatusInfo.textContent = t('jsonStatusOpening', { name: 'persistent' });
    try {
      const res = await apiCall('/api/persistent');
      el.jsonEditor.value = JSON.stringify(res.persistent, null, 2);
    } catch (err) {
      showToast(`Load failed: ${err.message}`, 'error');
    }
  }
}

// Save JSON to Server
async function saveJsonData() {
  const text = el.jsonEditor.value.trim();
  if (!text) {
    showToast('ไม่มีข้อมูล JSON ให้บันทึก', 'error');
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    showToast(`${t('jsonInvalid')}: ${err.message}`, 'error');
    return;
  }

  const endpoint = state.currentJsonMode === 'freesr' ? '/api/freesr' : '/api/persistent';
  try {
    await apiCall(endpoint, 'POST', parsed);
    showToast(t('jsonSaveSuccess', { name: state.currentJsonMode }), 'success');
    refreshStatus();
  } catch (err) {
    showToast(`Save failed: ${err.message}`, 'error');
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
        if (targetId === 'tab-avatars' && state.avatarsList.length === 0) {
          loadAvatars();
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

// Event Listeners setup
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
      showToast(t('settingsSaved'), 'info');
      refreshStatus();
    }
  });

  // Character Detail Modal Controls
  el.btnCloseAvatarModal.addEventListener('click', () => el.modalAvatarDetail.classList.remove('active'));
  el.btnModalSaveAvatar.addEventListener('click', saveAvatarDetails);
  el.btnModalMaxSkills.addEventListener('click', maxSkillsForAvatar);

  // Lineup Picker Modal Controls
  el.btnClosePickerModal.addEventListener('click', () => el.modalLineupPicker.classList.remove('active'));
  el.pickerSearch.addEventListener('input', renderPickerGrid);

  // Quick Action Buttons
  el.btnQuickMaxAll.addEventListener('click', maxAllAvatars);
  el.btnMaxAllAvatars.addEventListener('click', maxAllAvatars);
  
  el.btnQuickWarpExpress.addEventListener('click', () => {
    const express = PRESET_TELEPORTS[0];
    executeTeleport(express, getTeleportName(express));
  });

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

  // Custom Teleport Form
  el.formCustomTeleport.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      plane_id: parseInt(el.tpPlane.value, 10),
      floor_id: parseInt(el.tpFloor.value, 10),
      entry_id: parseInt(el.tpEntry.value, 10),
      x: el.tpX.value ? parseInt(el.tpX.value, 10) : 0,
      y: el.tpY.value ? parseInt(el.tpY.value, 10) : 0,
      z: el.tpZ.value ? parseInt(el.tpZ.value, 10) : 0
    };
    executeTeleport(payload, `Plane ${payload.plane_id}`);
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
        showToast(`โหลดเนื้อหาไฟล์ ${file.name} เรียบร้อย`, 'success');
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
}

// Background ping loop
function startPingLoop() {
  setInterval(() => {
    refreshStatus();
  }, state.pingIntervalSec * 1000);
}

// Initialize Application
function init() {
  setupServerModes();
  setupLanguageSelector();
  setupTabs();
  setupEvents();
  applyTranslations();
  refreshStatus();
  loadAvatars();
  startPingLoop();
}

// Run on DOM load
window.addEventListener('DOMContentLoaded', init);
