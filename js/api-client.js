/**
 * api-client.js
 * Central HTTP client for the Quantity Measurement backend.
 * Base URL: http://localhost:8080/api/v1
 *
 * Auth endpoints:
 *   POST  /auth/register
 *   POST  /auth/login
 *   GET   /auth/me
 *   PUT   /auth/forgotPassword/{email}     body: { password }
 *   PUT   /auth/resetPassword/{email}?currentPassword=&newPassword=
 *
 * Quantity endpoints:
 *   POST  /quantities/compare | convert | add | subtract | divide
 *   GET   /quantities/history/operation/{op}
 *   GET   /quantities/history/type/{type}
 *   GET   /quantities/history/errored
 *   GET   /quantities/count/{op}
 */
class ApiClient {
  constructor() {
    this.baseUrl = 'http://localhost:8080/api/v1';
    this._token  = localStorage.getItem('qm_token');
  }

  // ── Token management ──────────────────────────────────────────
  get token() { return this._token; }

  setToken(t) {
    this._token = t;
    if (t) localStorage.setItem('qm_token', t);
    else   localStorage.removeItem('qm_token');
  }

  clearToken() { this.setToken(null); }

  // ── Headers ──────────────────────────────────────────────────
  _headers(auth = false) {
    const h = { 'Content-Type': 'application/json' };
    if (auth && this._token) h['Authorization'] = `Bearer ${this._token}`;
    return h;
  }

  // ── Response handler ─────────────────────────────────────────
  async _handle(res) {
    if (!res.ok) {
      let msg = `Request failed (${res.status})`;
      try {
        const body = await res.json();
        msg = body.message || body.error || msg;
      } catch (_) {
        msg = res.statusText || msg;
      }
      throw new Error(msg);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }

  async _get(path, auth = true) {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this._headers(auth) });
    return this._handle(res);
  }

  async _post(path, body, auth = false) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this._headers(auth),
      body: JSON.stringify(body)
    });
    return this._handle(res);
  }

  async _put(path, body = null, auth = false, params = null) {
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const q = new URLSearchParams(params);
      url += '?' + q.toString();
    }
    const res = await fetch(url, {
      method: 'PUT',
      headers: this._headers(auth),
      body: body != null ? JSON.stringify(body) : undefined
    });
    return this._handle(res);
  }

  // ── AUTH ─────────────────────────────────────────────────────

  async register(name, email, password) {
    const data = await this._post('/auth/register', { name, email, password });
    // Backend returns accessToken (not token)
    if (data?.accessToken) this.setToken(data.accessToken);
    return data;
  }

  async login(email, password) {
    const data = await this._post('/auth/login', { email, password });
    if (data?.accessToken) this.setToken(data.accessToken);
    return data;
  }

  async getProfile() {
    return this._get('/auth/me', true);
  }

  /**
   * Forgot password — no auth required.
   * PUT /auth/forgotPassword/{email}  body: { password }
   */
  async forgotPassword(email, newPassword) {
    return this._put(`/auth/forgotPassword/${encodeURIComponent(email)}`, { password: newPassword }, false);
  }

  /**
   * Reset password — JWT required.
   * PUT /auth/resetPassword/{email}?currentPassword=&newPassword=
   */
  async resetPassword(email, currentPassword, newPassword) {
    return this._put(
      `/auth/resetPassword/${encodeURIComponent(email)}`,
      null,
      true,
      { currentPassword, newPassword }
    );
  }

  // ── QUANTITY OPERATIONS ──────────────────────────────────────

  /**
   * @param {'compare'|'convert'|'add'|'subtract'|'divide'} operation
   * @param {{ thisQuantityDTO, thatQuantityDTO, targetUnitDTO? }} dto
   */
  async measure(operation, dto) {
    return this._post(`/quantities/${operation}`, dto, true);
  }

  // ── HISTORY ──────────────────────────────────────────────────

  async historyByOperation(operation) {
    return this._get(`/quantities/history/operation/${operation}`, true);
  }

  async historyByType(measurementType) {
    return this._get(`/quantities/history/type/${measurementType}`, true);
  }

  async historyErrored() {
    return this._get('/quantities/history/errored', true);
  }

  async operationCount(operation) {
    return this._get(`/quantities/count/${operation}`, true);
  }
}

const api = new ApiClient();
