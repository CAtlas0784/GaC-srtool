# Project Rules

## Localization (required)

Every change or addition must include an update to `js/i18n.js`: review and update the translations and localization behavior affected by the change.

Every user-facing string must go through `js/i18n.js`. Never hardcode Thai or English UI text in HTML or JS.

- Use `data-i18n`, `data-i18n-placeholder`, `data-i18n-title`, `data-i18n-alt` or `data-i18n-aria-label` in `index.html`.
- Use `t('key', { ...vars })` for strings rendered from JavaScript (including `innerHTML` templates).
- Add every new key to `MODAL_AND_TOOL_TRANSLATIONS` in `js/i18n.js` for both `th` and `en`. Other locales intentionally fall back to English through `t()`, so they do not need duplicate entries.
- When a language changes, dynamic content must refresh. Call the render function from `applyTranslations()` (for example `renderEquipTargetDisplay()` and `renderAvatarAssignGrid()`).
- Keep every import of `i18n.js` on the same `?v=` query string so the browser uses a single module instance. Bump it whenever `js/i18n.js` changes.

## Cache busting

When `css/styles.css` or `js/app.js` changes, bump its `?v=` query string in `index.html`.

## Scope

Do not modify `README.md` or the untracked `docs/` folder unless the task explicitly asks for it.
