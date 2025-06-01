// Fix translations loading issue by replacing the current translations.js with a simplified version
document.addEventListener('DOMContentLoaded', function() {
  console.log("SEBA Translation Fix: Starting emergency fix for translations.js");
  
  // First, try to load our simplified translations file
  const script = document.createElement('script');
  const basePath = window.location.pathname.includes('/blog/') ? '../' : '';
  script.src = `${basePath}assets/js/translations-fixed.js`;
  
  script.onload = function() {
    console.log("SEBA Translation Fix: Successfully loaded simplified translations");
    
    if (window.TRANSLATIONS) {
      console.log("SEBA Translation Fix: TRANSLATIONS object is available");
      
      // If we have a setLanguage function, use it to update the page
      if (window.setLanguage) {
        const currentLang = localStorage.getItem('language') || 'en';
        console.log(`SEBA Translation Fix: Applying language ${currentLang}`);
        window.setLanguage(currentLang);
      }
    }
  };
  
  script.onerror = function() {
    console.error("SEBA Translation Fix: Failed to load simplified translations");
  };
  
  document.head.appendChild(script);
});
