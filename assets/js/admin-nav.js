// assets/js/admin-nav.js
import { logout } from './admin-auth.js';

export function renderAdminNav(activePageId) {
    const navHTML = `
        <header class="admin-header">
            <div class="flex-center-gap-15">
                <img src="../../images/logos/new-why-racing-logo.png" alt="WHY RACING EVENTS Logo" class="admin-logo-small">
                <h1>WHY RACING ADMIN</h1>
            </div>
            <div class="admin-nav-tabs">
                <a href="races.html" class="tab-btn ${activePageId === 'races' ? 'active' : ''}">Races</a>
                <a href="training.html" class="tab-btn ${activePageId === 'training' ? 'active' : ''}">Training</a>
                <a href="giveback.html" class="tab-btn ${activePageId === 'giveback' ? 'active' : ''}">Giveback</a>
                <a href="about.html" class="tab-btn ${activePageId === 'about' ? 'active' : ''}">About Team</a>
            </div>
            <div class="flex-gap-15-center">
                <a href="../../index.html" class="view-site-link">← View Live Site</a>
                <button id="navLogoutBtn" class="logout-btn">Logout</button>
            </div>
        </header>
    `;

    const navContainer = document.getElementById('adminNavContainer');
    if (navContainer) {
        navContainer.innerHTML = navHTML;
        
        document.getElementById('navLogoutBtn').addEventListener('click', () => {
            logout();
        });
    }
}
