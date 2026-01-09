// Client-side logout helper to unify logout behavior across the app
// - Clears client cookies (access_token, user_data) with multiple domain/path permutations
// - Clears localStorage/sessionStorage keys
// - Calls server API to clear HttpOnly refresh_token cookie
// - Logs before/after cookie state for debugging

export async function logoutClient(redirectTo: string = '/') {
  try {
    // Log current cookies for debug
    // Note: document.cookie is not available on server; this is a client-only helper
    // eslint-disable-next-line no-console
    console.log('[logout] before cookies:', typeof document !== 'undefined' ? document.cookie : '(server)');

    // Best-effort cookie deletion function
    const expireCookie = (name: string) => {
      const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
      const paths = ['/', '/outils', '/assistant', '/classement', '/login', '/register'];
      const domains = [
        undefined,
        window.location.hostname,
        `.${window.location.hostname}`,
      ];

      for (const p of paths) {
        // No domain
        document.cookie = `${name}=; expires=${expires}; path=${p}; SameSite=Lax`;
        // With explicit domain variants
        for (const d of domains) {
          if (!d) continue;
          document.cookie = `${name}=; expires=${expires}; path=${p}; domain=${d}; SameSite=Lax`;
        }
      }
    };

    // Explicitly clear known cookies used by middleware
    expireCookie('access_token');
    expireCookie('user_data');

    // Clear storages
    try { localStorage.removeItem('access_token'); } catch {}
    try { localStorage.removeItem('user_data'); } catch {}
    try { localStorage.removeItem('user'); } catch {}
    try { sessionStorage.clear(); } catch {}

    // Ask server to clear HttpOnly refresh cookie (if present)
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[logout] /api/auth/logout call failed (non-blocking):', (e as Error)?.message);
    }

    // Log after
    // eslint-disable-next-line no-console
    console.log('[logout] after cookies:', typeof document !== 'undefined' ? document.cookie : '(server)');

    // Force hard navigation to ensure middleware re-evaluates without stale client state
    window.location.href = redirectTo;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[logout] unexpected error:', (e as Error)?.message);
    window.location.href = redirectTo;
  }
}
