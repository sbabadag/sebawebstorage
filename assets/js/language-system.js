// Unified Language System for SEBA Engineering Website
(function() {
    "use strict";
    
    // Initialize the language system
    function initLanguageSystem() {
        console.log("Initializing unified language system...");
        
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
                
                // Try to load translations-fixed.js first, fallback to translations.js
                loadScript(`${basePath}assets/js/translations-fixed.js`, function() {
                    if (typeof TRANSLATIONS !== 'undefined') {
                        window.TRANSLATIONS = TRANSLATIONS;
                        console.log("TRANSLATIONS loaded and assigned to window");
                        // Now apply the language
                        const currentLang = localStorage.getItem('language') || 'en';
                        applyLanguage(currentLang);
                    } else {
                        // Try the regular translations file
                        loadScript(`${basePath}assets/js/translations.js`, function() {
                            if (typeof TRANSLATIONS !== 'undefined') {
                                window.TRANSLATIONS = TRANSLATIONS;
                                console.log("TRANSLATIONS loaded from fallback and assigned to window");
                                // Now apply the language
                                const currentLang = localStorage.getItem('language') || 'en';
                                applyLanguage(currentLang);
                            } else {
                                console.error("Failed to load translations");
                            }
                        });
                    }
                });
            }
        }
    }
    
    // Helper function to load a script
    function loadScript(src, callback) {
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
            ensureTranslations();
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
    
    // Setup language buttons
    function setupLanguageButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            // Remove any existing click handlers by cloning the button
            const newBtn = btn.cloneNode(true);
            if (btn.parentNode) {
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Ensure data-lang attribute exists
                if (!newBtn.hasAttribute('data-lang')) {
                    const btnText = newBtn.textContent.toLowerCase().trim();
                    if (btnText === 'en' || btnText === 'tr') {
                        newBtn.setAttribute('data-lang', btnText);
                    }
                }
                
                // Add new click handler
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const lang = this.getAttribute('data-lang');
                    if (lang) {
                        applyLanguage(lang);
                        console.log("Language button clicked, changing to:", lang);
                    }
                    
                    return false;
                });
            }
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
    
    // Add a MutationObserver to detect if language buttons are added dynamically
    function setupMutationObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // Check if any of the added nodes are language buttons or contain language buttons
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('lang-btn')) {
                                setupLanguageButtons();
                            } else if (node.querySelectorAll) {
                                const buttons = node.querySelectorAll('.lang-btn');
                                if (buttons.length > 0) {
                                    setupLanguageButtons();
                                }
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initLanguageSystem();
            setupMutationObserver();
        });
    } else {
        initLanguageSystem();
        setupMutationObserver();
    }
})();
