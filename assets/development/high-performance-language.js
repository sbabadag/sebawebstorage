// High-Performance Language System for SEBA Engineering Website
(function() {
    "use strict";
    
    // Configuration
    const config = {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'tr'],
        storageKey: 'language',
        translationFileUrl: 'assets/js/translations-fixed.js',
        translationUrlBlog: '../assets/js/translations-fixed.js',
        debugging: false
    };
    
    // Avoid blocking the main thread
    requestAnimationFrame(function() {
        // Check if loaded from cache or if we need to initialize
        if (document.documentElement.getAttribute('data-lang-initialized') === 'true') {
            log('Language system already initialized, skipping');
            return;
        }
        
        initLanguageSystem();
    });
    
    // Simple logging function
    function log(message) {
        if (config.debugging) {
            console.log(`[Language] ${message}`);
        }
    }
    
    // Initialize the language system
    function initLanguageSystem() {
        try {
            log('Initializing language system');
            
            // Mark as initialized to prevent duplicate initialization
            document.documentElement.setAttribute('data-lang-initialized', 'true');
            
            // Set up language before translations are loaded
            setupLanguageButtons();
            
            // Get current language with fallback
            const currentLang = localStorage.getItem(config.storageKey) || config.defaultLanguage;
            
            // Set initial language attributes
            document.documentElement.lang = currentLang;
            document.documentElement.setAttribute('data-lang', currentLang);
            
            // Load translations and then apply language
            ensureTranslations(function() {
                applyLanguage(currentLang);
            });
        } catch (e) {
            console.error('Error initializing language system:', e);
        }
    }
    
    // Make sure translations are available
    function ensureTranslations(callback) {
        // If translations already exist, use them
        if (window.TRANSLATIONS) {
            log('Translations already loaded');
            if (callback) callback();
            return;
        }
        
        // If global TRANSLATIONS exist, assign to window
        if (typeof TRANSLATIONS !== 'undefined') {
            window.TRANSLATIONS = TRANSLATIONS;
            log('Assigned existing TRANSLATIONS to window');
            if (callback) callback();
            return;
        }
        
        // Otherwise load the translations file
        log('Loading translations dynamically');
        
        // Determine the correct path based on URL
        const isInBlog = window.location.pathname.includes('/blog/');
        const translationPath = isInBlog ? config.translationUrlBlog : config.translationFileUrl;
        
        // Load the script
        const script = document.createElement('script');
        script.src = translationPath;
        
        script.onload = function() {
            if (typeof TRANSLATIONS !== 'undefined') {
                window.TRANSLATIONS = TRANSLATIONS;
                log('Translations loaded successfully');
                if (callback) callback();
            } else {
                console.error('Translations file loaded but TRANSLATIONS object not found');
            }
        };
        
        script.onerror = function() {
            console.error('Failed to load translations file');
        };
        
        document.head.appendChild(script);
    }
    
    // Set up language switching buttons
    function setupLanguageButtons() {
        // Find all language buttons
        const buttons = document.querySelectorAll('.lang-btn');
        
        if (buttons.length === 0) {
            log('No language buttons found');
            return;
        }
        
        log(`Found ${buttons.length} language buttons`);
        
        // Set up each button
        buttons.forEach(function(btn) {
            // Skip if already set up
            if (btn.getAttribute('data-lang-initialized') === 'true') {
                return;
            }
            
            // Get language from attribute or text
            let lang = btn.getAttribute('data-lang');
            if (!lang) {
                // Try to get from text content
                const text = btn.textContent.trim().toLowerCase();
                if (config.supportedLanguages.includes(text)) {
                    lang = text;
                    btn.setAttribute('data-lang', lang);
                }
            }
            
            // Add click handler
            if (lang) {
                // Remove any existing click handlers to avoid duplicates
                const newBtn = btn.cloneNode(true);
                if (btn.parentNode) {
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    // Add new click handler
                    newBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // Use a setTimeout to ensure we don't block the UI
                        setTimeout(function() {
                            switchLanguage(lang);
                        }, 0);
                        
                        return false;
                    });
                    
                    // Mark as initialized
                    newBtn.setAttribute('data-lang-initialized', 'true');
                }
            }
        });
        
        // Update initial button states
        updateButtonStates();
    }
    
    // Update the active state on language buttons
    function updateButtonStates() {
        const currentLang = document.documentElement.getAttribute('data-lang') || 
                           localStorage.getItem(config.storageKey) || 
                           config.defaultLanguage;
        
        document.querySelectorAll('.lang-btn').forEach(function(btn) {
            const btnLang = btn.getAttribute('data-lang');
            
            // Remove active class
            btn.classList.remove('active');
            
            // Add active class if this is the current language
            if (btnLang && btnLang.toLowerCase() === currentLang.toLowerCase()) {
                btn.classList.add('active');
            }
        });
    }
    
    // Switch the language
    function switchLanguage(lang) {
        if (!config.supportedLanguages.includes(lang)) {
            console.error('Unsupported language:', lang);
            return;
        }
        
        log(`Switching to language: ${lang}`);
        
        // Save to localStorage
        localStorage.setItem(config.storageKey, lang);
        
        // Apply translations if they're loaded
        if (window.TRANSLATIONS) {
            applyLanguage(lang);
        } else {
            // Load translations first
            ensureTranslations(function() {
                applyLanguage(lang);
            });
        }
    }
    
    // Apply the language translations to the page
    function applyLanguage(lang) {
        // Make sure we have translations
        if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) {
            console.error('Cannot apply language, translations not available');
            return;
        }
        
        // Set the HTML attributes
        document.documentElement.lang = lang;
        document.documentElement.setAttribute('data-lang', lang);
        
        // Process in small chunks to avoid blocking the UI
        const elements = document.querySelectorAll('[data-lang-key]');
        const chunkSize = 20;
        const totalChunks = Math.ceil(elements.length / chunkSize);
        
        log(`Applying translations to ${elements.length} elements in ${totalChunks} chunks`);
        
        // Process elements in chunks
        function processChunk(chunkIndex) {
            const start = chunkIndex * chunkSize;
            const end = Math.min(start + chunkSize, elements.length);
            
            for (let i = start; i < end; i++) {
                const element = elements[i];
                const key = element.getAttribute('data-lang-key');
                
                try {
                    // Get the translation using path notation (e.g., "meta.title")
                    const translation = key.split('.').reduce(
                        (obj, part) => obj && obj[part], 
                        window.TRANSLATIONS[lang]
                    );
                    
                    // Apply the translation if it exists and isn't an object
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
                    console.error(`Error applying translation for key: ${key}`, e);
                }
            }
            
            // Process next chunk if needed
            if (end < elements.length) {
                setTimeout(function() {
                    processChunk(chunkIndex + 1);
                }, 0);
            } else {
                // All chunks processed, update button states
                updateButtonStates();
                
                // Notify that language change is complete
                document.dispatchEvent(new CustomEvent('languageChanged', { 
                    detail: { language: lang } 
                }));
                
                log('Language application complete');
            }
        }
        
        // Start processing the first chunk
        requestAnimationFrame(function() {
            processChunk(0);
        });
    }
    
    // Make setLanguage available globally
    window.setLanguage = switchLanguage;
    
    // For debugging
    window.debugLanguageSystem = function(enable) {
        config.debugging = enable !== false;
        log('Debugging ' + (config.debugging ? 'enabled' : 'disabled'));
    };
})();
