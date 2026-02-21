const fs = require('fs');
const path = require('path');

const racesFile = path.join(__dirname, 'pages', 'admin', 'races.html');
const cssFile = path.join(__dirname, 'assets', 'css', 'admin-global.css');
const jsFile = path.join(__dirname, 'assets', 'js', 'admin-auth.js');

let content = fs.readFileSync(racesFile, 'utf8');

// 1. Extract CSS
const styleRegex = /<style>([\s\S]*?)<\/style>/;
const styleMatch = content.match(styleRegex);
if (styleMatch) {
    fs.writeFileSync(cssFile, styleMatch[1].trim());
    content = content.replace(styleMatch[0], '<link href="../../assets/css/admin-global.css" rel="stylesheet">');
}

// 2. Create Auth JS
const authJsContent = `// === Configuration ===
const ADMIN_PASSWORD = 'why26';
const ADMIN_SECRET = 'why2026';

// === Password Protection ===
function checkPassword() {
    const input = document.getElementById('passwordInput');
    if (!input) return;
    
    if (input.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('ADMIN_SECRET', ADMIN_SECRET);
        document.getElementById('passwordGate').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        document.dispatchEvent(new Event('adminAuthenticated'));
    } else {
        document.getElementById('passwordError').style.display = 'block';
        input.value = '';
    }
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('ADMIN_SECRET');
    const gate = document.getElementById('passwordGate');
    const dash = document.getElementById('adminDashboard');
    const error = document.getElementById('passwordError');
    const input = document.getElementById('passwordInput');
    
    if (gate) gate.style.display = 'flex';
    if (dash) dash.style.display = 'none';
    if (input) input.value = '';
    if (error) error.style.display = 'none';
}

// Check if already authenticated on page load
document.addEventListener('DOMContentLoaded', () => {
    // If we're authenticated, show dashboard
    if (sessionStorage.getItem('adminAuth') === 'true' || sessionStorage.getItem('raceAdminAuth') === 'true') {
        const gate = document.getElementById('passwordGate');
        const dash = document.getElementById('adminDashboard');
        if (gate) gate.style.display = 'none';
        if (dash) dash.style.display = 'block';
        
        // Ensure legacy session key handles migration smoothly
        if (sessionStorage.getItem('raceAdminAuth') === 'true') {
            sessionStorage.setItem('adminAuth', 'true');
        }
        
        // Dispatch event for local controllers
        document.dispatchEvent(new Event('adminAuthenticated'));
    }
});
`;

fs.writeFileSync(jsFile, authJsContent);

// 3. Remove old JS sections from races.html
const oldAuthRegex = /\/\/ === Configuration ===[\s\S]*?(?=\/\/ === Tab Navigation ===)/;
content = content.replace(oldAuthRegex, `// Specific API endpoints for this page
        const AI_ENDPOINT = '/api/generate-theme';
        const RACES_ENDPOINT = '/api/races';

        // Listen for global auth event
        document.addEventListener('adminAuthenticated', () => {
             loadRaces();
        });

        `);

// Add script tag right after <script> opening
content = content.replace('<script>', '<script src="../../assets/js/admin-auth.js"></script>\n    <script>');

fs.writeFileSync(racesFile, content);
console.log('Successfully extracted CSS and JS.');
