// Manage website language switching functionality
(function() {
    // Initialize language state
    let currentLanguage = localStorage.getItem('language') || 'en';

    // Function to get nested translations
    function getTranslation(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    // Update page content with selected language
    function updateContent(lang) {
        if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) {
            console.error('Translations not available for language:', lang);
            return;
        }

        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            const translation = getTranslation(window.TRANSLATIONS[lang], key);

            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update meta content
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
    }

    // Main language switching function
    window.setLanguage = function(lang) {
        if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) {
            console.error('Language not supported:', lang);
            return;
        }

        currentLanguage = lang;
        localStorage.setItem('language', lang);
        updateContent(lang);
        updateButtonStates(lang);
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

    // Initialize when DOM content is loaded
    document.addEventListener('DOMContentLoaded', function() {
        if (window.TRANSLATIONS) {
            setLanguage(currentLanguage);
        } else {
            console.error('Translations not loaded');
        }
    });
})();
