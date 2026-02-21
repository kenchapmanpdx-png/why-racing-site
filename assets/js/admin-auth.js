// assets/js/admin-auth.js

/**
 * Check if the user is authenticated in this session.
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
 * Attempt to login by validating the password server-side.
 * On success, the server returns the bearer token which is stored in sessionStorage.
 * The password and token are never hardcoded in client source.
 * @param {string} password
 * @returns {Promise<boolean>} Success status
 */
async function login(password) {
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (!response.ok) return false;

        const { token } = await response.json();
        if (!token) return false;

        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('ADMIN_SECRET', token);
        return true;
    } catch (err) {
        console.error('Login error:', err);
        return false;
    }
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

export { checkAuth, login, logout };
