/* WHY RACING EVENTS - Unified Navigation Script */

function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }
}

// Close mobile menu on link click
document.addEventListener('DOMContentLoaded', () => {
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            const hamburger = document.querySelector('.hamburger');
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
});

/**
 * Ensures an external URL has a protocol (https://) if it's missing.
 * Skips mailto, tel, relative links, and anchor links.
 * @param {string} url - The URL to format.
 * @returns {string} The formatted URL.
 */
window.formatExternalUrl = function (url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed || trimmed === '#') return trimmed;

    // Skip if it already has a protocol or is a special link type
    const lower = trimmed.toLowerCase();
    if (
        lower.startsWith('http://') ||
        lower.startsWith('https://') ||
        lower.startsWith('mailto:') ||
        lower.startsWith('tel:') ||
        lower.startsWith('/') ||
        lower.startsWith('../') ||
        lower.startsWith('#')
    ) {
        return trimmed;
    }

    // Default to https if it's a raw domain like www.example.com
    return `https://${trimmed}`;
};
