// Language System Test Script
(function() {
    "use strict";
    
    // Run test after a short delay to let the main scripts initialize
    setTimeout(function() {
        console.log("Running language system test...");
        
        // Check if core components are available
        const hasTranslations = window.TRANSLATIONS ? "Yes" : "No";
        const hasSetLanguage = window.setLanguage ? "Yes" : "No";
        const currentLang = localStorage.getItem('language') || 'en';
        
        console.log("=== Language System Test Results ===");
        console.log("TRANSLATIONS available:", hasTranslations);
        console.log("setLanguage function available:", hasSetLanguage);
        console.log("Current language:", currentLang);
        console.log("Document lang attribute:", document.documentElement.lang);
        console.log("Document data-lang attribute:", document.documentElement.getAttribute('data-lang'));
        
        // Check lang buttons
        const langButtons = document.querySelectorAll('.lang-btn');
        console.log("Language buttons found:", langButtons.length);
        
        // Test language switching
        if (window.setLanguage && window.TRANSLATIONS) {
            console.log("Testing language switching...");
            
            // Remember original language to restore later
            const originalLang = currentLang;
            
            // Count translatable elements
            const translatableElements = document.querySelectorAll('[data-lang-key]');
            console.log("Translatable elements found:", translatableElements.length);
            
            // Switch to the opposite language for testing
            const testLang = currentLang === 'en' ? 'tr' : 'en';
            console.log("Switching to test language:", testLang);
            
            // Test a specific translation key
            let sampleKeyBefore, sampleKeyAfter;
            const sampleElement = translatableElements[0];
            if (sampleElement) {
                const key = sampleElement.getAttribute('data-lang-key');
                sampleKeyBefore = sampleElement.textContent;
                
                // Switch language
                window.setLanguage(testLang);
                
                // Test if the content changed
                sampleKeyAfter = sampleElement.textContent;
                
                console.log("Test key:", key);
                console.log("Content before:", sampleKeyBefore);
                console.log("Content after:", sampleKeyAfter);
                console.log("Translation success:", sampleKeyBefore !== sampleKeyAfter);
                
                // Restore original language
                window.setLanguage(originalLang);
            }
            
            // Test lang button active states
            const enButton = Array.from(langButtons).find(btn => btn.getAttribute('data-lang') === 'en');
            const trButton = Array.from(langButtons).find(btn => btn.getAttribute('data-lang') === 'tr');
            
            if (enButton && trButton) {
                const enActive = enButton.classList.contains('active');
                const trActive = trButton.classList.contains('active');
                
                console.log("EN button active:", enActive);
                console.log("TR button active:", trActive);
                console.log("Button states correct:", 
                    (currentLang === 'en' && enActive && !trActive) || 
                    (currentLang === 'tr' && !enActive && trActive));
            }
        }
        
        console.log("=== Test Complete ===");
    }, 1000);
})();
