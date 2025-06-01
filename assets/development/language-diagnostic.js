// Language system check and fix utility
document.addEventListener('DOMContentLoaded', function() {
  console.log("Language System Diagnostic Tool running...");
  
  // Deep validation of the TRANSLATIONS object
  function validateTranslations() {
    console.group("Validating translations.js structure");
    try {
      if (!window.TRANSLATIONS) {
        throw new Error("TRANSLATIONS not found on window object");
      }
      
      // Check language objects
      const languages = Object.keys(window.TRANSLATIONS);
      console.log("Available languages:", languages.join(", "));
      
      // Validate each language has entries
      languages.forEach(lang => {
        const entryCount = Object.keys(window.TRANSLATIONS[lang]).length;
        console.log(`${lang}: ${entryCount} translation entries`);
        if (entryCount === 0) {
          console.warn(`⚠️ Language ${lang} has no entries!`);
        }
      });
      
      console.log("✓ Basic structure validation passed");
    } catch (e) {
      console.error("✗ Validation failed:", e.message);
    }
    console.groupEnd();
  }
  
  // Run validation
  validateTranslations();
  
  // Check if TRANSLATIONS is available
  if (!window.TRANSLATIONS) {
    console.warn("TRANSLATIONS not found on window object");
    
    // Try to fix it
    if (typeof TRANSLATIONS !== 'undefined') {
      window.TRANSLATIONS = TRANSLATIONS;
      console.log("✓ Fixed: TRANSLATIONS assigned to window object");
    } else {
      console.error("✗ Unable to fix: TRANSLATIONS object not found in any scope");
    }
  } else {
    console.log("✓ TRANSLATIONS available on window object");
  }
  
  // Check if setLanguage function exists
  if (!window.setLanguage) {
    console.warn("setLanguage function not found on window object");
    
    // Create emergency implementation
    window.setLanguage = function(lang) {
      console.log("Emergency setLanguage implementation for " + lang);
      
      if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) {
        console.error("No translations available for", lang);
        return;
      }
      
      // Basic implementation to update content
      document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        const parts = key.split('.');
        let translation = window.TRANSLATIONS[lang];
        
        for (let part of parts) {
          if (!translation) break;
          translation = translation[part];
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
      
      // Update HTML lang attribute and store preference
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-lang', lang);
      localStorage.setItem('language', lang);
      
      console.log("Language set to:", lang);
    };
    console.log("✓ Fixed: Created emergency setLanguage function");
  } else {
    console.log("✓ setLanguage function available");
  }
  
  // Fix language buttons if they still have onclick attributes
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.hasAttribute('onclick')) {
      console.warn("Found language button with inline onclick attribute");
      
      // Extract the language from the onclick attribute
      const onclickAttr = btn.getAttribute('onclick');
      let lang = btn.textContent.toLowerCase();
      
      if (onclickAttr.includes("'en'") || onclickAttr.includes('"en"')) {
        lang = 'en';
      } else if (onclickAttr.includes("'tr'") || onclickAttr.includes('"tr"')) {
        lang = 'tr';
      }
      
      // Remove the inline onclick
      btn.removeAttribute('onclick');
      
      // Add data-lang attribute
      btn.setAttribute('data-lang', lang);
      
      // Add event listener
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("Fixed language button clicked:", lang);
        if (window.setLanguage) {
          window.setLanguage(lang);
        }
        return false;
      });
      
      console.log("✓ Fixed: Replaced onclick with proper event listener for " + lang + " button");
    }
  });
  
  // Ensure active button state is correct
  const currentLang = localStorage.getItem('language') || 'en';
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const btnLang = btn.getAttribute('data-lang') || btn.textContent.toLowerCase();
    
    if (btnLang.toLowerCase() === currentLang) {
      if (!btn.classList.contains('active')) {
        btn.classList.add('active');
        console.log("✓ Fixed: Added active class to current language button");
      }
    } else {
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        console.log("✓ Fixed: Removed active class from non-current language button");
      }
    }
  });
  
  console.log("Language System Diagnostic Tool completed");
});
