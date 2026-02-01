/**
 * Smart Theme Engine
 * Generates race themes (colors + icons) dynamically based on text prompts.
 */
class ThemeEngine {
    static get KNOWLEDGE_BASE() {
        return {
            keywords: {
                // HOLIDAYS
                st_patrick: {
                    triggers: ['st patrick', 'shamrock', 'clover', 'lucky', 'green', 'irish', 'paddy'],
                    colors: { primary: '#2e7d32', secondary: '#228b22', accent: '#ffd700', dark: '#1a3d1a' },
                    icons: ['☘️', '🍀', '🌈', '🥇', '💚', '🍻', '🎩']
                },
                easter: {
                    triggers: ['easter', 'bunny', 'egg', 'spring', 'chocolate', 'hop'],
                    colors: { primary: '#9c27b0', secondary: '#ba68c8', accent: '#ffeb3b', dark: '#4a148c' },
                    icons: ['🥚', '🐰', '🌸', '🐣', '🍫', '🥕', '🌷']
                },
                usa: {
                    triggers: ['usa', 'america', 'flag', 'freedom', 'eagle', 'patriot', 'july', 'stars'],
                    colors: { primary: '#B22234', secondary: '#3C3B6E', accent: '#FFFFFF', dark: '#0a0a0a' }, // Red, Blue, White
                    icons: ['🇺🇸', '🦅', '🎆', '🗽', '❤️', '💙', '⭐']
                },
                christmas: {
                    triggers: ['christmas', 'santa', 'snow', 'winter', 'jolly', 'gift'],
                    colors: { primary: '#D42426', secondary: '#165B33', accent: '#F8B229', dark: '#1a1a1a' },
                    icons: ['🎅', '🎄', '❄️', '⛄', '🎁', '🦌', '🍪']
                },
                halloween: {
                    triggers: ['halloween', 'spooky', 'ghost', 'pumpkin', 'witch', 'zombie', 'scary'],
                    colors: { primary: '#ff9800', secondary: '#7c4dff', accent: '#00e676', dark: '#212121' },
                    icons: ['🎃', '👻', '🕸️', '🧛', '🧟', '🍬', '🦇']
                },
                thanksgiving: {
                    triggers: ['thanksgiving', 'turkey', 'fall', 'autumn', 'harvest', 'leaf'],
                    colors: { primary: '#d84315', secondary: '#ff6f00', accent: '#ffca28', dark: '#3e2723' },
                    icons: ['🦃', '🍂', '🍁', '🌽', '🥧', '🥘', '🧡']
                },
                valentine: {
                    triggers: ['love', 'valentine', 'heart', 'cupid', 'romance', 'kiss'],
                    colors: { primary: '#e91e63', secondary: '#f48fb1', accent: '#ffffff', dark: '#880e4f' },
                    icons: ['❤️', '💘', '💋', '💌', '🌹', '🥰', '🍫']
                },
                summer: {
                    triggers: ['summer', 'sun', 'beach', 'hot', 'swim', 'vacation'],
                    colors: { primary: '#0288d1', secondary: '#03a9f4', accent: '#ffeb3b', dark: '#01579b' },
                    icons: ['☀️', '🏖️', '🍦', '🕶️', '🌊', '🌴', '🐬']
                }
            },
            defaults: {
                colors: { primary: '#E31837', secondary: '#000000', accent: '#ffffff', dark: '#0a0a0a' }, // Brand Red/Black
                icons: ['🏃', '👟', '🏅', '🔥', '🏁', '🏆']
            }
        };
    }

    /**
     * Analyze the prompt and return the best matching theme configuration.
     * @param {string} prompt - User input string (e.g. "St. Patrick's Day")
     */
    static generate(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        let bestMatch = null;
        let maxScore = 0;

        for (const [key, theme] of Object.entries(this.KNOWLEDGE_BASE.keywords)) {
            let score = 0;
            theme.triggers.forEach(trigger => {
                if (lowerPrompt.includes(trigger)) score++;
            });

            if (score > maxScore) {
                maxScore = score;
                bestMatch = theme;
            }
        }

        // If no match found, use defaults but mix in generic icons
        if (!bestMatch) {
            console.warn(`ThemeEngine: No specific theme found for "${prompt}". Using defaults.`);
            return this.KNOWLEDGE_BASE.defaults;
        }

        return bestMatch;
    }

    /**
     * Apply the generated theme to the current document.
     * @param {string} prompt - The theme prompt.
     */
    static apply(prompt) {
        const theme = this.generate(prompt);
        const root = document.documentElement;

        // 1. Apply CSS Variables
        root.style.setProperty('--theme-primary', theme.colors.primary);
        root.style.setProperty('--theme-secondary', theme.colors.secondary);
        root.style.setProperty('--theme-accent', theme.colors.accent);
        root.style.setProperty('--theme-dark', theme.colors.dark);
        // Map 'gold' to accent for backward compatibility or specific use cases
        root.style.setProperty('--theme-gold', theme.colors.accent);

        console.log(`ThemeEngine: Applied theme for "${prompt}"`, theme);

        // 2. Inject Floating Icons
        this.injectFloatingIcons(theme.icons);

        // 3. Update Meta Theme Color (for mobile browsers)
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = "theme-color";
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = theme.colors.primary;
    }

    /**
     * Inject floating animation icons into the hero section.
     * @param {string[]} icons - Array of emoji/icon strings.
     */
    static injectFloatingIcons(icons) {
        const hero = document.querySelector('.event-hero');
        if (!hero) return;

        // Check if container exists, create if not
        let container = hero.querySelector('.floating-icons');
        if (!container) {
            container = document.createElement('div');
            container.className = 'floating-icons';
            hero.prepend(container); // Add as first child
        } else {
            container.innerHTML = ''; // Clear existing
        }

        // Create 6-8 floating particles
        const count = 8;
        for (let i = 0; i < count; i++) {
            const span = document.createElement('span');
            // Pick random icon from the set
            span.textContent = icons[Math.floor(Math.random() * icons.length)];

            // Random positioning and delay
            const left = Math.floor(Math.random() * 90) + 5; // 5% to 95%
            const top = Math.floor(Math.random() * 80) + 10; // 10% to 90%
            const delay = Math.random() * 5; // 0s to 5s delay
            const duration = 10 + Math.random() * 10; // 10s to 20s duration

            span.style.left = `${left}%`;
            span.style.top = `${top}%`;
            span.style.animationDelay = `-${delay}s`; // Negative delay to start immediately in random spot
            span.style.animationDuration = `${duration}s`;

            container.appendChild(span);
        }
    }
}

// Globally expose for non-module usage
if (typeof window !== 'undefined') {
    window.ThemeEngine = ThemeEngine;
}
