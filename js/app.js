import { AVATAR_METADATA, getAvatarInfo } from './avatars-data.js';
import { PRESET_TELEPORTS, getTeleportName } from './teleports-data.js';
import { SUPPORTED_LANGUAGES, getCurrentLanguage, setLanguage, t } from './i18n.js';

// Application State
const state = {
  apiUrl: localStorage.getItem('gac_srtool_api_url') || 'http://localhost:21000',
  pingIntervalSec: parseInt(localStorage.getItem('gac_srtool_ping_interval') || '10', 10),
  isConnected: false,
  statusData: null,
  avatarsList: [],
  currentJsonMode: 'freesr', // 'freesr' or 'persistent'
  activeTab: 'tab-dashboard'
};

// UI Elements
const el = {
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
  btnMaxAllAvatars: document.getElementById('btn-max-all-avatars'),
  btnReloadAvatars: document.getElementById('btn-reload-avatars'),

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

// Apply multi-language translations across whole UI
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    elem.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-placeholder');
    elem.placeholder = t(key);
  });

  // Re-render localized UI parts
  if (state.statusData) {
    renderLineup(state.statusData.lineups);
    renderExRanks(state.statusData.ex_ranks || []);
  }
  renderTeleportPresets();
  if (state.avatarsList.length > 0) {
    renderAvatarsGrid();
  }
}

// Language selector initialization
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
    showToast(`Language switched to ${SUPPORTED_LANGUAGES.find(l => l.code === newLang)?.name || newLang}`, 'info');
  });
}

// Refresh status from /api/status
async function refreshStatus() {
  try {
    const data = await apiCall('/api/status');
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

// Render current lineup cards
function renderLineup(lineups) {
  if (!lineups || Object.keys(lineups).length === 0) {
    el.lineupContainer.innerHTML = `<div style="color: var(--text-muted); grid-column: 1/-1;">${t('slotEmpty')}</div>`;
    return;
  }

  el.lineupContainer.innerHTML = '';
  for (let slot = 0; slot < 4; slot++) {
    const avatarId = lineups[slot] || 0;
    const card = document.createElement('div');
    card.className = 'card';
    card.style.padding = '0.85rem';

    if (avatarId === 0) {
      card.innerHTML = `
        <div style="font-size: 0.75rem; color: var(--text-muted);">${t('slot')} ${slot + 1}</div>
        <div style="font-weight: 600; color: var(--text-muted); margin-top: 0.25rem;">${t('slotEmpty')}</div>
      `;
    } else {
      const info = getAvatarInfo(avatarId);
      card.innerHTML = `
        <div style="font-size: 0.75rem; color: var(--accent-cyan);">${t('slot')} ${slot + 1}</div>
        <div style="font-weight: 700; margin-top: 0.25rem;">${info.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${info.element} • ${info.path}</div>
      `;
    }
    el.lineupContainer.appendChild(card);
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

  const filtered = state.avatarsList.filter(item => {
    const meta = getAvatarInfo(item.avatar_id);
    const matchesSearch = meta.name.toLowerCase().includes(searchTerm) || String(item.avatar_id).includes(searchTerm);
    const matchesRarity = rarityFilter === 'all' || String(meta.rarity) === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  if (filtered.length === 0) {
    el.avatarsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No matching avatars</div>';
    return;
  }

  el.avatarsGrid.innerHTML = '';
  filtered.forEach(item => {
    const meta = getAvatarInfo(item.avatar_id);
    const card = document.createElement('div');
    card.className = 'card avatar-card';

    const pipsHtml = [0, 1, 2, 3, 4, 5, 6].map(rank => `
      <button class="eidolon-pip ${item.rank >= rank ? 'active' : ''}" data-avatar="${item.avatar_id}" data-rank="${rank}" title="Eidolon ${rank}">
        ${rank}
      </button>
    `).join('');

    card.innerHTML = `
      <span class="avatar-badge-rarity rarity-${meta.rarity}">★ ${meta.rarity}</span>
      <div>
        <div class="avatar-header-info">
          <div class="avatar-icon-placeholder">${meta.name.charAt(0)}</div>
          <div>
            <div class="avatar-name">${meta.name}</div>
            <div class="avatar-subinfo">
              <span>Lv. ${item.level}</span>
              <span>•</span>
              <span>${meta.element}</span>
              <span>•</span>
              <span>${meta.path}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="eidolon-selector">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${t('eidolonLabel')}</span>
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

    el.avatarsGrid.appendChild(card);
  });
}

// Set avatar rank API
async function setAvatarRank(avatarId, rank) {
  try {
    await apiCall('/api/avatar/rank', 'POST', { avatar_id: avatarId, rank });
    showToast(t('avatarRankSuccess', { id: avatarId, rank }), 'success');
    
    // Update local state and re-render
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

// Render Ex-Ranks
function renderExRanks(exList) {
  if (!exList || exList.length === 0) {
    el.exrankList.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1rem;">No Ex-Rank Avatars</div>';
    return;
  }

  el.exrankList.innerHTML = '';
  exList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'ex-switch-card';
    const localizedMeta = getAvatarInfo(item.avatar_id);

    card.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 1rem;">${localizedMeta.name}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          Avatar ID: ${item.avatar_id} • Ex-Rank Skill ID: ${item.ex_rank_id}
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
    showToast('No JSON data to save', 'error');
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
      showToast('Persistent data synced', 'success');
      refreshStatus();
    } catch (err) {
      showToast(`Sync failed: ${err.message}`, 'error');
    }
  });

  // Avatar Search & Filter
  el.avatarSearch.addEventListener('input', renderAvatarsGrid);
  el.avatarFilterRarity.addEventListener('change', renderAvatarsGrid);
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
      showToast('JSON beautified', 'info');
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
    showToast(`Downloaded ${a.download}`, 'success');
  });

  el.jsonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        el.jsonEditor.value = JSON.stringify(parsed, null, 2);
        showToast(`Loaded ${file.name}`, 'success');
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
  setupLanguageSelector();
  setupTabs();
  setupEvents();
  applyTranslations();
  refreshStatus();
  startPingLoop();
}

// Run on DOM load
window.addEventListener('DOMContentLoaded', init);
