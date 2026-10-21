import { getCurrentLanguage, t, translatePath } from './i18n.js?v=2.8';

const CATALOG_URL = new URL('../assets/item-catalog.json?v=2', import.meta.url);
const PAGE_SIZE = 48;
let catalog = null;
let catalogLoading = null;
let page = 0;
let activeDetailId = null;

const elements = () => ({
  tab: document.querySelector('.tab-btn[data-tab="tab-inventory"]'),
  browseButton: document.getElementById('btn-inventory-catalog'),
  manageButton: document.getElementById('btn-inventory-manage'),
  catalogPanel: document.getElementById('item-catalog-panel'),
  managePanel: document.getElementById('inventory-manage-panel'),
  search: document.getElementById('item-catalog-search'),
  filter: document.getElementById('item-catalog-filter'),
  grid: document.getElementById('item-catalog-grid'),
  status: document.getElementById('item-catalog-status'),
  count: document.getElementById('item-catalog-count'),
  pageLabel: document.getElementById('item-catalog-page-label'),
  previous: document.getElementById('item-catalog-prev'),
  next: document.getElementById('item-catalog-next'),
  detail: document.getElementById('item-catalog-detail'),
  detailArt: document.getElementById('item-catalog-detail-art'),
  detailName: document.getElementById('item-catalog-detail-name'),
  detailId: document.getElementById('item-catalog-detail-id'),
  detailSource: document.getElementById('item-catalog-detail-source'),
  detailMeta: document.getElementById('item-catalog-detail-meta'),
  detailDescription: document.getElementById('item-catalog-detail-description'),
  detailLore: document.getElementById('item-catalog-detail-lore'),
  detailLoreSection: document.getElementById('item-catalog-detail-lore-section'),
  amount: document.getElementById('item-catalog-detail-amount'),
  amountLimit: document.getElementById('item-catalog-amount-limit')
});

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[char]);
}

function plainGameText(value) {
  return String(value ?? '').replace(/<[^>]*>/g, '').replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, ' ').trim();
}

function displayName(item) {
  const names = item.names || {};
  return plainGameText(names[getCurrentLanguage()] || names.en || t('itemCatalogUnknownName', { id: item.id }));
}

function assetUrl(path, base) {
  if (typeof path !== 'string' || !/^(icon|image)\/[A-Za-z0-9_./-]+\.png$/.test(path) || path.includes('..')) return '';
  try { return new URL(path, base).href; } catch { return ''; }
}

function itemCategoryLabel(category) {
  const key = {
    item: 'itemCatalogFilterItems',
    lightcone: 'itemCatalogFilterLightCones',
    relic: 'itemCatalogFilterRelics'
  }[category];
  return key ? t(key) : t('itemCatalogFilterItems');
}

function visibleItems() {
  if (!catalog) return [];
  const query = String(elements().search?.value || '').trim().toLocaleLowerCase();
  const category = elements().filter?.value || 'all';
  return catalog.items.filter(item => {
    if (category === 'supported' && !item.supported) return false;
    if (category !== 'all' && category !== 'supported' && item.category !== category) return false;
    if (!query) return true;
    if (String(item.id).includes(query)) return true;
    return Object.values(item.names || {}).some(name => plainGameText(name).toLocaleLowerCase().includes(query));
  });
}

function imageMarkup(item, source) {
  const src = assetUrl(item.icon, source.assetBaseUrl);
  if (!src) {
    return '<button type="button" class="item-catalog-art-button" data-item-catalog-id="' + item.id + '" aria-label="' + escapeHtml(t('itemCatalogOpenDetails', { name: displayName(item) })) + '"><span class="item-catalog-art item-catalog-art-missing" title="' + escapeHtml(t('itemCatalogNoImage')) + '"><span aria-hidden="true">✦</span><small>' + escapeHtml(t('itemCatalogNoImage')) + '</small></span></button>';
  }
  const fallback = assetUrl(item.icon, source.assetFallbackBaseUrl);
  return '<button type="button" class="item-catalog-art-button" data-item-catalog-id="' + item.id + '" aria-label="' + escapeHtml(t('itemCatalogOpenDetails', { name: displayName(item) })) + '"><span class="item-catalog-art"><img class="item-catalog-image" src="' + escapeHtml(src) + '" data-fallback="' + escapeHtml(fallback) + '" alt="" loading="lazy" decoding="async"></span></button>';
}

function localizedItemText(item, field) {
  const values = item[field] || {};
  return values[getCurrentLanguage()] || values.en || '';
}

function openItemDetails(itemId) {
  const el = elements();
  const item = catalog?.items.find(row => row.id === Number(itemId));
  if (!item || !el.detail) return;
  activeDetailId = item.id;
  const name = displayName(item);
  const src = assetUrl(item.icon, catalog.source.assetBaseUrl);
  const fallback = assetUrl(item.icon, catalog.source.assetFallbackBaseUrl);
  const description = localizedItemText(item, 'descriptions');
  const lore = localizedItemText(item, 'backgroundDescriptions');
  const rarity = Number(item.rarity);
  const rarityText = Number.isInteger(rarity) && rarity > 0 && rarity <= 5 ? '★'.repeat(rarity) : '';
  const category = itemCategoryLabel(item.category);
  const type = [item.type, item.subType].filter((value, index, values) => value && values.indexOf(value) === index).join(' · ');
  const path = item.path ? translatePath(item.path) : '';
  const slot = item.slot ? translatePath(item.slot) : '';
  const meta = [category, type, slot, path, rarityText].filter(Boolean).join(' · ');

  el.detailName.textContent = name;
  el.detailId.textContent = t('itemCatalogItemId', { id: item.id });
  el.detailSource.textContent = (item.sourceTables || []).map(path => path.split('/').pop()).join(', ') || t('itemCatalogNoDetails');
  el.detailMeta.textContent = meta || t('itemCatalogNoDetails');
  el.detailMeta.dataset.rarity = rarityText ? String(rarity) : '';
  el.detailDescription.textContent = plainGameText(description || lore || t('itemCatalogNoDescription'));
  el.detailLoreSection.hidden = !description || !lore || description === lore;
  el.detailLore.textContent = el.detailLoreSection.hidden ? '' : plainGameText(lore);
  if (src) {
    el.detailArt.innerHTML = '<img src="' + escapeHtml(src) + '" data-fallback="' + escapeHtml(fallback) + '" alt="' + escapeHtml(name) + '">';
    const image = el.detailArt.querySelector('img');
    image.addEventListener('error', () => {
      if (image.dataset.fallback && !image.dataset.fallbackTried) {
        image.dataset.fallbackTried = 'true';
        image.src = image.dataset.fallback;
      } else {
        el.detailArt.textContent = t('itemCatalogNoImage');
      }
    });
  } else {
    el.detailArt.textContent = t('itemCatalogNoImage');
  }
  const limit = Number(item.pileLimit);
  const hasLimit = Number.isSafeInteger(limit) && limit > 0;
  el.amount.min = '1';
  if (hasLimit) {
    el.amount.max = String(limit);
    el.amountLimit.textContent = t('itemCatalogMaxQuantity', { count: limit.toLocaleString() });
  } else {
    el.amount.removeAttribute('max');
    el.amountLimit.textContent = '';
  }
  el.amount.value = '1';
  if (!el.detail.open) el.detail.showModal();
}

function updateSelectedAmount(delta = 0) {
  const input = elements().amount;
  if (!input) return;
  const max = Number(input.max);
  const hasMax = Number.isSafeInteger(max) && max > 0;
  const current = Number.parseInt(input.value, 10);
  const next = Math.max(1, (Number.isFinite(current) ? current : 1) + delta);
  input.value = String(hasMax ? Math.min(max, next) : next);
}

function renderCatalog() {
  const el = elements();
  if (!el.grid || !catalog) return;
  el.filter.setAttribute('aria-label', t('itemCatalogFilterLabel'));
  const filtered = visibleItems();
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  page = Math.min(page, pages - 1);
  const start = page * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  el.count.textContent = t('inventoryItemTotal', { count: filtered.length });
  el.pageLabel.textContent = t('inventoryPage', { page: page + 1, pages, count: filtered.length });
  el.previous.disabled = page === 0;
  el.next.disabled = page >= pages - 1;

  if (!rows.length) {
    el.grid.innerHTML = '<div class="item-catalog-empty">' + escapeHtml(t('inventoryNoMatch')) + '</div>';
    return;
  }

  el.grid.innerHTML = rows.map(item => {
    const name = displayName(item);
    const category = itemCategoryLabel(item.category);
    const subtype = item.slot || item.subType || item.type || '';
    const path = item.path ? translatePath(item.path) : '';
    const rarity = Number(item.rarity);
    const rarityText = Number.isInteger(rarity) && rarity > 0 && rarity <= 5 ? '★'.repeat(rarity) : '';
    const details = [category, subtype, path, rarityText].filter(Boolean).join(' · ');
    const supportText = item.supported ? t('itemCatalogSupportedTag') : t('itemCatalogBrowseOnlyTag');
    return '<article class="item-catalog-card">' +
      imageMarkup(item, catalog.source) +
      '<div class="item-catalog-info">' +
        '<div class="item-catalog-name" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</div>' +
        '<div class="item-catalog-id">ID ' + item.id + '</div>' +
        '<div class="item-catalog-details" title="' + escapeHtml(details) + '">' + escapeHtml(details) + '</div>' +
        '<span class="item-catalog-support ' + (item.supported ? 'is-supported' : 'is-browse-only') + '">' + escapeHtml(supportText) + '</span>' +
      '</div>' +
    '</article>';
  }).join('');

  el.grid.querySelectorAll('.item-catalog-image').forEach(image => {
    image.addEventListener('error', () => {
      if (image.dataset.fallback && !image.dataset.fallbackTried) {
        image.dataset.fallbackTried = 'true';
        image.src = image.dataset.fallback;
        return;
      }
      const placeholder = document.createElement('div');
      placeholder.className = 'item-catalog-art item-catalog-art-missing';
      placeholder.title = t('itemCatalogNoImage');
      const mark = document.createElement('span');
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = '✦';
      const label = document.createElement('small');
      label.textContent = t('itemCatalogNoImage');
      placeholder.append(mark, label);
      image.parentElement.replaceWith(placeholder);
    });
  });
  el.grid.querySelectorAll('[data-item-catalog-id]').forEach(button => {
    button.addEventListener('click', () => openItemDetails(button.dataset.itemCatalogId));
  });
}

async function loadCatalog() {
  const el = elements();
  if (catalog) return catalog;
  if (catalogLoading) return catalogLoading;
  el.status.textContent = t('itemCatalogLoading');
  catalogLoading = fetch(CATALOG_URL).then(response => {
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  }).then(data => {
    if (!Array.isArray(data.items) || !data.source?.assetBaseUrl) throw new Error('Invalid catalog data');
    catalog = data;
    el.status.textContent = t('inventoryItemTotal', { count: data.counts.total });
    renderCatalog();
    return catalog;
  }).catch(error => {
    el.status.textContent = t('itemCatalogLoadFailed') + ': ' + error.message;
    el.grid.innerHTML = '<div class="item-catalog-empty">' + escapeHtml(t('itemCatalogLoadFailed')) + '</div>';
    catalogLoading = null;
    throw error;
  });
  return catalogLoading;
}

function setInventoryView(view) {
  const el = elements();
  const showCatalog = view === 'catalog';
  el.catalogPanel.hidden = !showCatalog;
  el.managePanel.hidden = showCatalog;
  el.browseButton.classList.toggle('active', showCatalog);
  el.manageButton.classList.toggle('active', !showCatalog);
  el.browseButton.setAttribute('aria-selected', String(showCatalog));
  el.manageButton.setAttribute('aria-selected', String(!showCatalog));
  if (showCatalog) loadCatalog().catch(() => {});
}

export function initializeItemCatalog() {
  const el = elements();
  el.search?.addEventListener('input', () => { page = 0; renderCatalog(); });
  el.filter?.addEventListener('change', () => { page = 0; renderCatalog(); });
  el.previous?.addEventListener('click', () => { page = Math.max(0, page - 1); renderCatalog(); });
  el.next?.addEventListener('click', () => { page += 1; renderCatalog(); });
  document.getElementById('item-catalog-detail-close')?.addEventListener('click', () => el.detail?.close());
  document.getElementById('item-catalog-detail-done')?.addEventListener('click', () => el.detail?.close());
  el.detail?.addEventListener('close', () => { activeDetailId = null; });
  document.getElementById('item-catalog-amount-minus')?.addEventListener('click', () => updateSelectedAmount(-1));
  document.getElementById('item-catalog-amount-plus')?.addEventListener('click', () => updateSelectedAmount(1));
  el.amount?.addEventListener('change', () => {
    const value = Number.parseInt(el.amount.value, 10);
    const max = Number(el.amount.max);
    el.amount.value = String(Math.max(1, Number.isFinite(value) ? (Number.isSafeInteger(max) && max > 0 ? Math.min(max, value) : value) : 1));
  });
  el.detail?.addEventListener('click', event => {
    if (event.target === el.detail) el.detail.close();
  });
  el.tab?.addEventListener('click', () => { if (!el.catalogPanel.hidden) loadCatalog().catch(() => {}); });
  el.browseButton?.addEventListener('click', () => setInventoryView('catalog'));
  el.manageButton?.addEventListener('click', () => setInventoryView('manage'));
  document.getElementById('lang-select')?.addEventListener('change', () => {
    if (catalog) renderCatalog();
    else if (el.status) el.status.textContent = t('itemCatalogLoading');
    if (catalog && el.detail?.open && activeDetailId !== null) openItemDetails(activeDetailId);
  });
}


