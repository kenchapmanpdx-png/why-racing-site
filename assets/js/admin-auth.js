// assets/js/admin-auth.js
const ADMIN_SECRET = 'why2026';

/**
 * Hash password using Web Crypto API
 */
async function hashPassword(password) {
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if the user is authenticated in this session
 * @param {boolean} redirectIfNotAuth Automatically redirect to login page
 */
function checkAuth(redirectIfNotAuth = true) {
    const isAuth = sessionStorage.getItem('adminAuth') === 'true' || sessionStorage.getItem('raceAdminAuth') === 'true';
    if (!isAuth && redirectIfNotAuth) {
        window.location.href = 'races.html'; // Default gate
    }
    return isAuth;
}

/**
 * Attempt to login with password
 * @param {string} password 
 * @returns {Promise<boolean>} Success status
 */
async function login(password) {
    const hash = await hashPassword(password);
    if (hash === 'e154f8961d7b8f85ee4403ce17bf1459ce360f7082af54cd09676f40c40759c0') {
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('ADMIN_SECRET', ADMIN_SECRET);
        return true;
    }
    return false;
}

/**
 * Log out user
 */
function logout() {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('ADMIN_SECRET');
    sessionStorage.removeItem('raceAdminAuth');
    window.location.reload();
}

export { checkAuth, login, logout, ADMIN_SECRET };
