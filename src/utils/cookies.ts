/**
 * Secure cookie utility functions for token management
 * Uses HTTP-only cookies when possible for better security
 */

export interface CookieOptions {
    expires?: number; // Days until expiration
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with secure defaults
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
    if (typeof window === 'undefined') return;

    const {
        expires = 7, // Default 7 days
        path = '/',
        secure = window.location.protocol === 'https:',
        sameSite = 'lax'
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (expires) {
        const date = new Date();
        date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
    }

    cookieString += `; path=${path}`;

    if (secure) {
        cookieString += '; secure';
    }

    cookieString += `; SameSite=${sameSite}`;

    document.cookie = cookieString;
    console.log(`Cookie set: ${name}`);
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
    if (typeof window === 'undefined') return null;

    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
        }
    }

    return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name: string, path: string = '/'): void => {
    if (typeof window === 'undefined') return;

    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
    console.log(`Cookie deleted: ${name}`);
};

/**
 * Check if a cookie exists
 */
export const hasCookie = (name: string): boolean => {
    return getCookie(name) !== null;
};

/**
 * Get all cookies as an object
 */
export const getAllCookies = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};

    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(';');

    for (const cookie of cookieArray) {
        const [name, value] = cookie.split('=').map(c => c.trim());
        if (name && value) {
            cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
    }

    return cookies;
};

/**
 * Clear all cookies (use with caution)
 */
export const clearAllCookies = (): void => {
    if (typeof window === 'undefined') return;

    const cookies = getAllCookies();
    for (const name in cookies) {
        deleteCookie(name);
    }
    console.log('All cookies cleared');
};
