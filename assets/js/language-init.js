// Initialize language support consistently across all pages
(function() {
    // Make sure TRANSLATIONS is available on the window object
    if (typeof TRANSLATIONS !== 'undefined' && !window.TRANSLATIONS) {
        window.TRANSLATIONS = TRANSLATIONS;
        console.log("TRANSLATIONS initialized on window object");
    }

    // Initialize language from localStorage or set default
    function initLanguage() {
        const savedLang = localStorage.getItem('language') || 'en';
        document.documentElement.lang = savedLang;
        document.documentElement.setAttribute('data-lang', savedLang);
        console.log("Language initialized to:", savedLang);
    }

    // Run initialization on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguage);
    } else {
        initLanguage();
    }
    
    // If this script is loaded after translations.js but before language-enhancer.js,
    // it will ensure translations are properly initialized
})();
