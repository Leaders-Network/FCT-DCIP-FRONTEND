import { getCookie } from './cookies';

/**
 * Which signed-in area a page belongs to. Used by the dashboard layouts to
 * decide whether there is a session at all before rendering their shell.
 *
 * This is a UX check only: the API still authorises every request.
 */
export type SessionArea = 'user' | 'admin' | 'nia-admin' | 'underwriter-admin' | 'surveyor';

/**
 * Token keys that count as a session for each area. A super-admin can open
 * every staff dashboard. Surveyors who sign in through the AMMC staff login
 * are stored under `adminToken`, so that key also opens the surveyor area.
 */
export const SESSION_TOKEN_KEYS: Record<SessionArea, readonly string[]> = {
    user: ['userToken'],
    admin: ['adminToken', 'superAdminToken'],
    'nia-admin': ['niaAdminToken', 'superAdminToken'],
    'underwriter-admin': ['underwriterAdminToken', 'superAdminToken'],
    surveyor: ['surveyorToken', 'adminToken', 'superAdminToken'],
};

export const LOGIN_PATHS: Record<SessionArea, string> = {
    user: '/login',
    admin: '/admin/login',
    'nia-admin': '/nia-admin/login',
    'underwriter-admin': '/underwriter/login',
    surveyor: '/surveyor',
};

const readStored = (key: string): string | null => {
    const fromCookie = getCookie(key);
    if (fromCookie) return fromCookie;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};

/** True when a token for the given area is stored in a cookie or localStorage. */
export const hasSession = (area: SessionArea): boolean => {
    if (typeof window === 'undefined') return false;
    return SESSION_TOKEN_KEYS[area].some((key) => Boolean(readStored(key)));
};
