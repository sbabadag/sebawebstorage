// Optimized Unified Language System for SEBA Engineering Website
(function() {
    "use strict";
    
    // Flag to prevent multiple initializations
    let initialized = false;
    
    // Initialize the language system
    function initLanguageSystem() {
        // Prevent multiple initializations
        if (initialized) {
            return;
        }
        initialized = true;
        
        console.log("Initializing optimized language system...");
        
        // Step 1: Ensure translations are available
        ensureTranslations();
        
        // Step 2: Create a reliable setLanguage function
        createSetLanguageFunction();
        
        // Step 3: Setup the language buttons
        setupLanguageButtons();
        
        // Step 4: Apply current language
        const currentLang = localStorage.getItem('language') || 'en';
        applyLanguage(currentLang);
    }
    
    // Ensure translations are available on window object
    function ensureTranslations() {
        if (!window.TRANSLATIONS) {
            if (typeof TRANSLATIONS !== 'undefined') {
                window.TRANSLATIONS = TRANSLATIONS;
                console.log("TRANSLATIONS assigned to window object");
            } else {
                console.warn("TRANSLATIONS object not found, attempting to load dynamically");
                // Try to determine the path to translations file
                let basePath = '';
                if (window.location.pathname.includes('/blog/')) {
                    basePath = '../';
                }
                
                // Try to load translations-fixed.js
                loadScript(`${basePath}assets/js/translations-fixed.js`, function() {
                    if (typeof TRANSLATIONS !== 'undefined') {
                        window.TRANSLATIONS = TRANSLATIONS;
                        console.log("TRANSLATIONS loaded and assigned to window");
                        // Now apply the language
                        const currentLang = localStorage.getItem('language') || 'en';
                        applyLanguage(currentLang);
                    } else {
                        console.error("Failed to load translations");
                    }
                });
            }
        }
    }
    
    // Helper function to load a script
    function loadScript(src, callback) {
        // Check if script already exists to prevent duplicate loading
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            callback();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = function() {
            console.error("Failed to load script:", src);
        };
        document.head.appendChild(script);
    }
    
    // Create a reliable setLanguage function
    function createSetLanguageFunction() {
        // Only create if it doesn't already exist
        if (!window.setLanguage) {
            window.setLanguage = function(lang) {
                applyLanguage(lang);
            };
        }
    }
    
    // The core function to apply translations
    function applyLanguage(lang) {
        console.log("Applying language:", lang);
        
        if (!window.TRANSLATIONS) {
            console.error("No translations available, cannot apply language");
            return;
        }
        
        if (!window.TRANSLATIONS[lang]) {
            console.error("No translations available for language:", lang);
            return;
        }
        
        // Apply translations to elements with data-lang-key
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            
            try {
                // Navigate through nested objects using key path
                const translation = key.split('.').reduce((obj, part) => 
                    obj && obj[part], window.TRANSLATIONS[lang]);
                
                if (translation && typeof translation !== 'object') {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.placeholder = translation;
                    } else if (element.tagName === 'META') {
                        element.content = translation;
                    } else {
                        element.textContent = translation;
                        if (element.tagName === 'TITLE') {
                            document.title = translation;
                        }
                    }
                }
            } catch (e) {
                console.error("Error applying translation for key:", key, e);
            }
        });
        
        // Update the HTML lang attribute
        document.documentElement.lang = lang;
        document.documentElement.setAttribute('data-lang', lang);
        
        // Update button states
        updateButtonStates(lang);
        
        // Save to localStorage
        localStorage.setItem('language', lang);
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }
    
    // Track which buttons we've already processed
    const processedButtons = new Set();
    
    // Setup language buttons
    function setupLanguageButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            // Skip already processed buttons
            if (processedButtons.has(btn)) {
                return;
            }
            
            // Mark as processed
            processedButtons.add(btn);
            
            // Ensure data-lang attribute exists
            if (!btn.hasAttribute('data-lang')) {
                const btnText = btn.textContent.toLowerCase().trim();
                if (btnText === 'en' || btnText === 'tr') {
                    btn.setAttribute('data-lang', btnText);
                }
            }
            
            // Add click handler directly (no cloning needed)
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const lang = this.getAttribute('data-lang');
                if (lang) {
                    applyLanguage(lang);
                    console.log("Language button clicked, changing to:", lang);
                }
                
                return false;
            });
        });
        
        // Set initial active state
        const currentLang = localStorage.getItem('language') || 'en';
        updateButtonStates(currentLang);
    }
    
    // Update button active states
    function updateButtonStates(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang && btnLang.toLowerCase() === lang.toLowerCase()) {
                btn.classList.add('active');
            }
        });
    }
    
    // Run on page load with a timeout to ensure DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Add a short timeout to ensure all other scripts have had a chance to run
            setTimeout(initLanguageSystem, 10);
        });
    } else {
        // Add a short timeout to ensure all other scripts have had a chance to run
        setTimeout(initLanguageSystem, 10);
    }
    
    // Also run the initialization after a delay to catch any dynamically added elements
    setTimeout(function() {
        setupLanguageButtons();
    }, 100);
})();
