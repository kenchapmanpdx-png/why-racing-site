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

/* --- DYNAMIC SPONSOR TICKER --- */
async function initSponsorTicker() {
    const tracks = document.querySelectorAll('.sponsor-track');
    if (!tracks.length) return;

    try {
        const res = await fetch('/api/global-sponsors');
        if (!res.ok) throw new Error('Failed to load global sponsors for ticker');
        const sponsors = await res.json();

        const activeSponsors = sponsors
            .filter(s => s.is_active)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        if (activeSponsors.length === 0) return;

        const sponsorHtml = activeSponsors.map(sp => {
            let logoSrc = sp.logo_url;
            if (logoSrc) {
                // If the path is relative (e.g., 'images/...'), make it absolute to the root
                // This ensures it works from both '/' and '/pages/...'
                if (!logoSrc.startsWith('http') && !logoSrc.startsWith('/')) {
                    logoSrc = '/' + logoSrc;
                }
            } else {
                return ''; // skip if no logo
            }

            const sanitizedUrl = window.formatExternalUrl(sp.website_url);

            if (sanitizedUrl) {
                return `<a href="${sanitizedUrl}" target="_blank" rel="noopener" title="${sp.name}"><img src="${logoSrc}" alt="${sp.name}"></a>`;
            } else {
                return `<img src="${logoSrc}" alt="${sp.name}" title="${sp.name}">`;
            }
        }).join('');

        // Duplicate the html to ensure seamless scrolling animation loop
        const fullTrackHtml = sponsorHtml + sponsorHtml;

        tracks.forEach(track => {
            track.innerHTML = fullTrackHtml;
        });
    } catch (err) {
        console.warn('Could not load dynamic sponsor ticker, falling back to static HTML:', err);
    }
}

document.addEventListener('DOMContentLoaded', initSponsorTicker);
