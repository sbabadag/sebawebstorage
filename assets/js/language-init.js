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
        
        // Create a proper setLanguage function if it doesn't exist yet
        // This ensures translations are applied even if script.js hasn't loaded yet
        if (!window.setLanguage) {
            console.log("Creating permanent setLanguage function");
            window.setLanguage = function(lang) {
                if (!window.TRANSLATIONS) {
                    if (typeof TRANSLATIONS !== 'undefined') {
                        window.TRANSLATIONS = TRANSLATIONS;
                    } else {
                        console.error("No TRANSLATIONS object available");
                        return;
                    }
                }
                
                if (!window.TRANSLATIONS[lang]) {
                    console.error("No translations available for language:", lang);
                    return;
                }
                
                // Apply translations to elements with data-lang-key
                document.querySelectorAll('[data-lang-key]').forEach(element => {
                    const key = element.getAttribute('data-lang-key');
                    // Handle nested keys like "meta.title"
                    let translation = null;
                    
                    try {
                        // Navigate through nested objects using key path
                        translation = key.split('.').reduce((obj, part) => 
                            obj && obj[part], window.TRANSLATIONS[lang]);
                    } catch (e) {
                        console.error("Error accessing translation for key:", key, e);
                    }
                    
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
                });
                
                // Update the HTML lang attribute
                document.documentElement.lang = lang;
                document.documentElement.setAttribute('data-lang', lang);
                
                // Update button states
                document.querySelectorAll('.lang-btn').forEach(btn => {
                    btn.classList.remove('active');
                    const btnLang = btn.getAttribute('data-lang');
                    if (btnLang && btnLang.toLowerCase() === lang.toLowerCase()) {
                        btn.classList.add('active');
                    }
                });
                
                // Save to localStorage
                localStorage.setItem('language', lang);
                
                // Dispatch event for other components
                document.dispatchEvent(new CustomEvent('languageChanged', { 
                    detail: { language: lang } 
                }));
            };
            
            // Apply the current language
            window.setLanguage(savedLang);
        } else {
            // If main setLanguage function exists, use it
            window.setLanguage(savedLang);
        }    }

    // Initialize language button click handlers
    function setupLanguageButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            // Remove any existing click handlers by cloning the button
            const newBtn = btn.cloneNode(true);
            if (btn.parentNode) {
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Add new click handler
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const lang = this.getAttribute('data-lang');
                    if (lang && window.setLanguage) {
                        window.setLanguage(lang);
                        console.log("Language button clicked, changing to:", lang);
                    }
                });
                
                // Set initial active state
                const currentLang = localStorage.getItem('language') || 'en';
                const btnLang = newBtn.getAttribute('data-lang');
                if (btnLang && btnLang.toLowerCase() === currentLang.toLowerCase()) {
                    newBtn.classList.add('active');
                }
            }
        });
    }

    // Run initialization on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initLanguage();
            setupLanguageButtons();
        });
    } else {
        initLanguage();
        setupLanguageButtons();
    }
    
    // Add a MutationObserver to detect if language buttons are added dynamically
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
})();
