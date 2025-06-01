// Enhanced language switching functionality
(function() {
    // Function to ensure language buttons work properly
    function enhanceLanguageSwitching() {
        console.log("Enhancing language switching...");
        // Ensure translations object is properly loaded
        if (!window.TRANSLATIONS) {
            console.log("TRANSLATIONS object not found initially, attempting to fix");
            
            try {
                // Check if TRANSLATIONS exists in the global scope
                if (typeof TRANSLATIONS !== 'undefined') {
                    console.log("Found TRANSLATIONS in global scope, assigning to window");
                    window.TRANSLATIONS = TRANSLATIONS;
                } else {
                    // Try to load translations dynamically if not already loaded
                    const script = document.createElement('script');
                    const basePath = window.location.pathname.includes('/blog/') ? '../' : '';
                    script.src = `${basePath}assets/js/translations.js`;
                    console.log("Loading translations from:", script.src);
                    
                    script.onload = function() {
                        console.log("Translations loaded dynamically");
                        // Wait a brief moment to ensure script executes
                        setTimeout(function() {
                            if (typeof TRANSLATIONS !== 'undefined') {
                                window.TRANSLATIONS = TRANSLATIONS;
                                console.log("Successfully assigned TRANSLATIONS to window");
                            }
                            enhanceLanguageSwitching(); // Run again after loading translations
                        }, 50);
                    };
                    
                    document.head.appendChild(script);
                    return; // Exit and wait for the script to load
                }
            } catch (e) {
                console.error("Error while trying to access TRANSLATIONS:", e);
            }
        }
        
        // Ensure setLanguage function exists
        if (!window.setLanguage) {
            console.error("setLanguage function not found, creating emergency implementation");
            window.setLanguage = function(lang) {
                console.log("Emergency setLanguage called with:", lang);
                
                if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) {
                    console.error("No translations available for", lang);
                    return;
                }
                
                // Update content with translations
                document.querySelectorAll('[data-lang-key]').forEach(element => {
                    const key = element.getAttribute('data-lang-key');
                    const translation = key.split('.').reduce((obj, part) => obj && obj[part], window.TRANSLATIONS[lang]);
                    
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
                
                // Update HTML lang attribute
                document.documentElement.lang = lang;
                document.documentElement.setAttribute('data-lang', lang);
                localStorage.setItem('language', lang);
            };
        }        // Fix language button behavior by replacing onclick with proper event listeners
        document.querySelectorAll('.lang-btn').forEach(btn => {
            // Get the language from the data-lang attribute or button text
            const lang = btn.getAttribute('data-lang') || btn.textContent.toLowerCase();
            
            // Remove the inline onclick attribute to avoid double calls
            btn.removeAttribute('onclick');
            
            // Clone the button to remove all existing event listeners
            const newBtn = btn.cloneNode(true);
            if (btn.parentNode) {
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Store the language in a data attribute for clarity
                if (!newBtn.hasAttribute('data-lang')) {
                    newBtn.setAttribute('data-lang', lang);
                }
                
                // Add new click listener with proper event handling
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const clickedLang = this.getAttribute('data-lang') || this.textContent.toLowerCase();
                    console.log("Language button clicked:", clickedLang);
                    
                    if (window.setLanguage) {
                        window.setLanguage(clickedLang);
                    } else {
                        console.error("setLanguage function not available");
                    }
                    
                    return false;
                });
            }
        });
          // Set active status on the correct button based on current language
        const currentLang = localStorage.getItem('language') || 'en';
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang && btnLang.toLowerCase() === currentLang.toLowerCase()) {
                btn.classList.add('active');
            }
        });
    }
    
    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceLanguageSwitching);
    } else {
        enhanceLanguageSwitching();
    }    // Also run when translations are loaded or window.TRANSLATIONS changes
    const checkTranslations = setInterval(function() {
        if (window.TRANSLATIONS) {
            enhanceLanguageSwitching();
            clearInterval(checkTranslations);
        }
    }, 100);

    // Make sure we don't keep checking indefinitely
    setTimeout(function() {
        clearInterval(checkTranslations);
    }, 5000);
})();
