// Enhanced language switching functionality
(function() {
    // Function to ensure language buttons work properly
    function enhanceLanguageSwitching() {
        console.log("Enhancing language switching...");
        
        // Ensure translations object is properly loaded
        if (!window.TRANSLATIONS) {
            console.error("TRANSLATIONS object not found, attempting to load it");
            
            // Try to load translations dynamically if not already loaded
            const script = document.createElement('script');
            script.src = window.location.pathname.includes('/blog/') ? '../assets/js/translations.js' : 'assets/js/translations.js';
            script.onload = function() {
                console.log("Translations loaded dynamically");
                enhanceLanguageSwitching(); // Run again after loading translations
            };
            document.head.appendChild(script);
            return; // Exit and wait for the script to load
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
        }
        
        // Fix language button behavior by replacing onclick with proper event listeners
        document.querySelectorAll('.lang-btn').forEach(btn => {
            // Store the language from the button text
            const lang = btn.textContent.toLowerCase();
            
            // Remove the inline onclick attribute to avoid double calls
            btn.removeAttribute('onclick');
            
            // Create a new button to replace the old one (cleanest way to remove all event listeners)
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add new click listener
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Language button clicked:", lang);
                window.setLanguage(lang);
                return false;
            });
        });
        
        // Set active status on the correct button based on current language
        const currentLang = localStorage.getItem('language') || 'en';
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === currentLang) {
                btn.classList.add('active');
            }
        });
    }
    
    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceLanguageSwitching);
    } else {
        enhanceLanguageSwitching();
    }
    
    // Also run when translations are loaded or window.TRANSLATIONS changes
    const checkTranslations = setInterval(function() {
        if (window.TRANSLATIONS) {
            enhanceLanguageSwitching();
            clearInterval(checkTranslations);
        }
    }, 100);
})();
