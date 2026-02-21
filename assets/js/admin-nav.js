// assets/js/admin-nav.js
import { logout } from './admin-auth.js';

export function renderAdminNav(activePageId) {
    const navHTML = `
        <div class="admin-header">
            <h1>WHY RACING ADMIN</h1>
            <div class="admin-nav-tabs">
                <a href="races.html" class="tab-btn ${activePageId === 'races' ? 'active' : ''}">Races</a>
                <a href="training.html" class="tab-btn ${activePageId === 'training' ? 'active' : ''}">Training</a>
                <a href="giveback.html" class="tab-btn ${activePageId === 'giveback' ? 'active' : ''}">Giveback</a>
                <a href="about.html" class="tab-btn ${activePageId === 'about' ? 'active' : ''}">About Team</a>
                <button id="navLogoutBtn" class="logout-btn">Logout</button>
            </div>
        </div>
    `;

    const navContainer = document.getElementById('adminNavContainer');
    if (navContainer) {
        navContainer.innerHTML = navHTML;
        
        document.getElementById('navLogoutBtn').addEventListener('click', () => {
            logout();
        });
    }
}
