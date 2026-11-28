import { afterEach, describe, expect, it } from 'vitest';
import { hasSession, LOGIN_PATHS } from './session';

const clearAll = () => {
    window.localStorage.clear();
    document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
};

describe('hasSession', () => {
    afterEach(clearAll);

    it('is false with nothing stored', () => {
        expect(hasSession('user')).toBe(false);
        expect(hasSession('admin')).toBe(false);
        expect(hasSession('surveyor')).toBe(false);
    });

    it('reads tokens from localStorage', () => {
        window.localStorage.setItem('niaAdminToken', 'abc');
        expect(hasSession('nia-admin')).toBe(true);
        expect(hasSession('admin')).toBe(false);
    });

    it('reads tokens from cookies', () => {
        document.cookie = 'userToken=abc; path=/';
        expect(hasSession('user')).toBe(true);
    });

    it('lets a super-admin into every staff area but not the client area', () => {
        window.localStorage.setItem('superAdminToken', 'abc');
        expect(hasSession('admin')).toBe(true);
        expect(hasSession('nia-admin')).toBe(true);
        expect(hasSession('underwriter-admin')).toBe(true);
        expect(hasSession('surveyor')).toBe(true);
        expect(hasSession('user')).toBe(false);
    });

    it('accepts the AMMC staff token in the surveyor area', () => {
        window.localStorage.setItem('adminToken', 'abc');
        expect(hasSession('surveyor')).toBe(true);
    });

    it('does not let a client token open a staff area', () => {
        window.localStorage.setItem('userToken', 'abc');
        expect(hasSession('admin')).toBe(false);
        expect(hasSession('underwriter-admin')).toBe(false);
    });
});

describe('LOGIN_PATHS', () => {
    it('sends each area to its own sign-in page', () => {
        expect(LOGIN_PATHS.user).toBe('/login');
        expect(LOGIN_PATHS.surveyor).toBe('/surveyor');
        expect(LOGIN_PATHS['underwriter-admin']).toBe('/underwriter/login');
    });
});
