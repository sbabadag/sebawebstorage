// Manage website language switching functionality
(function() {
    // Initialize language state
    let currentLanguage = localStorage.getItem('language') || 'en';

    // Function to get nested translations
    function getTranslation(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }    // Update page content with selected language
    function updateContent(lang) {
        if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) {
            console.error('Translations not available for language:', lang);
            return;
        }

        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            const translation = getTranslation(window.TRANSLATIONS[lang], key);

            if (translation) {
                // Skip if translation is an object (nested translations)
                if (typeof translation === 'object') {
                    return;
                }
                
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.tagName === 'META') {
                    if (element.getAttribute('name') === 'description' ||
                        element.getAttribute('property')?.endsWith('description')) {
                        element.content = translation;
                    } else if (element.getAttribute('property')?.endsWith('title')) {
                        element.content = translation;
                    }
                } else {
                    element.textContent = translation;
                    // Update document title if this is a title element
                    if (element.tagName === 'TITLE') {
                        document.title = translation;
                    }
                }
            }
        });

        // Update HTML lang and data-lang attributes
        document.documentElement.lang = lang;
        document.documentElement.setAttribute('data-lang', lang);
    }

    // Update button states
    function updateButtonStates(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === lang.toLowerCase()) {
                btn.classList.add('active');
            }
        });
    }    // Main language switching function
    window.setLanguage = function(lang) {
        console.log("Setting language to:", lang);
        if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) {
            console.error('Language not supported:', lang);
            return;
        }

        currentLanguage = lang;
        localStorage.setItem('language', lang);
        updateContent(lang);
        updateButtonStates(lang);
        
        // Dispatch a custom event that the language has changed
        const event = new CustomEvent('languageChanged', { detail: { language: lang } });
        document.dispatchEvent(event);
        
        console.log("Language set to:", lang);
    };

    // Handle header background on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Project filtering functionality
    window.filterProjects = function(category) {
        const items = document.querySelectorAll('.project-item');
        items.forEach(item => {
            item.style.display = (category === 'all' || item.classList.contains(category)) ? 'block' : 'none';
        });
    };

    // Function to detect user's preferred language
    function getPreferredLanguage() {
        // First check localStorage
        const savedLang = localStorage.getItem('language');
        if (savedLang && window.TRANSLATIONS[savedLang]) {
            return savedLang;
        }
        
        // Then check browser language
        const browserLang = navigator.language.split('-')[0];
        if (window.TRANSLATIONS[browserLang]) {
            return browserLang;
        }
        
        // Default to English
        return 'en';
    }    // Initialize when DOM content is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM loaded, initializing language");
        
        // Add click listeners to language buttons to ensure they work
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.textContent.toLowerCase();
                console.log("Lang button clicked:", lang);
                window.setLanguage(lang);
            });
        });
        
        // Set initial language
        if (window.TRANSLATIONS) {
            console.log("Translations available:", Object.keys(window.TRANSLATIONS));
            const preferredLang = getPreferredLanguage();
            console.log("Preferred language:", preferredLang);
            setLanguage(preferredLang);
        } else {
            console.error('Translations not loaded');
            // Load translations dynamically if needed
            const script = document.createElement('script');
            script.src = '/assets/js/translations.js';
            script.onload = () => {
                console.log("Translations loaded dynamically");
                setLanguage(getPreferredLanguage());
            };
            document.head.appendChild(script);
        }
    });
})();
