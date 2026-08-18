/**
 * Signup / login calls for the website-preview auth screens.
 *
 * These deliberately use plain `fetch` rather than `apiClient`. The shared
 * client has a response interceptor that treats ANY 401 as "the admin's session
 * expired" and kicks off a token refresh, falling back to a logout redirect —
 * so a visitor mistyping a password in the preview would tear down the admin's
 * own session. A website client login is a different identity entirely and must
 * not touch the admin's auth state.
 *
 * The path still goes through the Next proxy (`/api/proxy/v1`), matching how
 * the rest of this app reaches the backend, so there is no second origin and no
 * CORS surface. The endpoints themselves are public and need no credentials.
 */

const API_BASE = '/api/proxy/v1';

export interface RegisterPayload {
    name: string;
    email: string;
    dial_code?: string;
    mobile?: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
    /**
     * Optional, and verified server-side when present: it must match the number
     * stored on the account. Left out entirely when the field is blank, which
     * means "not offered" rather than "must be empty".
     */
    dial_code?: string;
    mobile?: string;
}

export interface AuthResult {
    ok: boolean;
    /** Server-supplied message — written for end users, safe to display. */
    message: string;
}

async function post(path: string, payload: unknown, fallbackError: string): Promise<AuthResult> {
    try {
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        // The API answers JSON for success and handled errors alike; a proxy or
        // a dead backend can still answer HTML, so parsing is guarded.
        let body: { success?: boolean; message?: string } | null = null;
        try {
            body = await response.json();
        } catch {
            body = null;
        }

        if (!response.ok || !body?.success) {
            return { ok: false, message: body?.message || fallbackError };
        }

        return { ok: true, message: body.message || 'Success' };
    } catch {
        // Network-level failure — never surface the raw error to a visitor.
        return { ok: false, message: 'Could not reach the server. Please try again.' };
    }
}

/** Creates a `website_clients` row. The server decides the tenant. */
export const registerWebsiteClient = (payload: RegisterPayload) =>
    post('/public/website-clients/register', payload, 'Something went wrong. Please try again.');

/**
 * Verifies a website client's credentials. Returns no token and stores nothing:
 * these accounts have no portal to land in, so a success only means the
 * credentials were right.
 */
export const loginWebsiteClient = (payload: LoginPayload) =>
    post('/public/website-clients/login', payload, 'Invalid email or password.');
