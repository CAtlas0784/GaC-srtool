// March7thHoney transport helpers.
//
// March7thHoney is a push-only server: it exposes one endpoint,
// POST <base>/sr-tools, that takes { username, password, data? }. A request
// without `data` is the connect probe (it only checks the account); a request
// with `data` carries the FreeSR snapshot, in the same shape the FireflyGo
// reference client produces. There is no extra_data block and no read endpoint.
// Spec: docs/MARCH7TH_HONEY_API.md

import { buildSyncPayload } from './firefly.js?v=4';

export const MARCH7TH_PATH = '/sr-tools';
export const MARCH7TH_DEFAULT_BASE_URL = 'http://localhost:21000';

/**
 * The endpoint for whatever the user typed: adds http:// when no scheme is
 * given, drops trailing slashes and appends /sr-tools unless it is already
 * there (case-insensitive).
 */
export function march7thUrl(apiUrl) {
  let base = String(apiUrl ?? '').trim();
  if (!base) base = MARCH7TH_DEFAULT_BASE_URL;
  if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
  base = base.replace(/\/+$/, '');
  if (/\/sr-tools$/i.test(base)) return base;
  return `${base}${MARCH7TH_PATH}`;
}

/**
 * The request body. The probe leaves `data` out entirely, which is how the
 * server tells a connection check from a sync.
 */
export function buildMarch7thBody({ username = '', password = '' } = {}, freesr) {
  const body = { username: String(username ?? ''), password: String(password ?? '') };
  if (freesr && typeof freesr === 'object') body.data = buildSyncPayload(freesr);
  return body;
}

/**
 * Decides what a reply means.
 *
 * Returns { kind, message } where kind is:
 *   'ok'      - accepted: HTTP 2xx, JSON or text, and no error field
 *   'error'   - the server reports a failure, even inside an HTTP 200
 *   'html'    - an HTML page (wrong server, Nginx or Cloudflare error page)
 *   'unknown' - a JSON value that is not an object
 */
export function inspectMarch7thReply(parsed, text = '') {
  if (String(text ?? '').trim().startsWith('<')) return { kind: 'html', message: '' };
  // A plain-text reply is accepted as long as the HTTP status was fine.
  if (parsed === null || parsed === undefined) return { kind: 'ok', message: '' };
  if (typeof parsed !== 'object' || Array.isArray(parsed)) return { kind: 'unknown', message: '' };

  const message = typeof parsed.message === 'string' ? parsed.message : '';
  if (typeof parsed.error === 'string' && parsed.error) return { kind: 'error', message: parsed.error };
  if (typeof parsed.status === 'number' && (parsed.status < 200 || parsed.status > 299)) {
    return { kind: 'error', message: message || `status ${parsed.status}` };
  }
  return { kind: 'ok', message };
}
