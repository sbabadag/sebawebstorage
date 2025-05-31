// Force language update and fix any remaining issues
(function() {
  function forceLanguageUpdate() {
    console.log("Forcing language update...");
    
    // Ensure TRANSLATIONS is available
    if (!window.TRANSLATIONS && typeof TRANSLATIONS !== 'undefined') {
      window.TRANSLATIONS = TRANSLATIONS;
      console.log("Fixed: TRANSLATIONS assigned to window object");
    }
    
    // Get current language preference
    const currentLang = localStorage.getItem('language') || 'en';
    console.log("Current language preference:", currentLang);
    
    // Update all translatable elements manually
    document.querySelectorAll('[data-lang-key]').forEach(element => {
      const key = element.getAttribute('data-lang-key');
      console.log("Processing element with key:", key);
      
      if (!window.TRANSLATIONS || !window.TRANSLATIONS[currentLang]) {
        console.error("Error: Translations not available for", currentLang);
        return;
      }
      
      // Parse nested keys like "meta.title"
      const keys = key.split('.');
      let translation = window.TRANSLATIONS[currentLang];
      
      // Navigate through nested objects
      for (let k of keys) {
        if (!translation || typeof translation !== 'object') break;
        translation = translation[k];
      }
      
      if (translation && typeof translation !== 'object') {
        console.log(`Updating element ${element.tagName} with key ${key} to "${translation}"`);
        
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
      } else {
        console.warn(`No translation found for key: ${key}`);
      }
    });
    
    // Make sure language indicator is correct
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute('data-lang', currentLang);
    
    // Update active status on language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang') || btn.textContent.toLowerCase();
      if (btnLang.toLowerCase() === currentLang.toLowerCase()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    console.log("Language update completed");
  }
  
  // Run on page load after a short delay to ensure other scripts are loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(forceLanguageUpdate, 1000);
    });
  } else {
    setTimeout(forceLanguageUpdate, 1000);
  }
})();
