const TOKEN_KEY = 'ptt_admin_token';
const EMAIL_KEY = 'ptt_admin_email';
const NAME_KEY = 'ptt_admin_name';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getAdminEmail() {
  return localStorage.getItem(EMAIL_KEY) || '';
}

export function getAdminName() {
  return localStorage.getItem(NAME_KEY) || '';
}

export function setSession({ token, email, name } = {}) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    if (email) localStorage.setItem(EMAIL_KEY, email);
    if (name) localStorage.setItem(NAME_KEY, name);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(NAME_KEY);
  }
}

export function setToken(token) {
  setSession(token ? { token } : {});
}

export function isLoggedIn() {
  return Boolean(getToken());
}
