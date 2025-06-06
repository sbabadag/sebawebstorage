
// Test script to verify language switching for hero section
function testHeroLanguageSwitching() {
  console.log("Testing Hero section language switching");
  console.log("Current language:", document.documentElement.lang);
  
  const heroTitle = document.querySelector("[data-lang-key=\"hero.title\"]");
  const heroDesc = document.querySelector("[data-lang-key=\"hero.description\"]");
  
  console.log("Current hero title:", heroTitle.textContent);
  console.log("Current hero description:", heroDesc.textContent);
  
  const currentLang = document.documentElement.lang;
  const newLang = currentLang === "en" ? "tr" : "en";
  
  console.log("Switching to:", newLang);
  window.setLanguage(newLang);
  
  console.log("New hero title:", heroTitle.textContent);
  console.log("New hero description:", heroDesc.textContent);
  
  // Switch back to original
  setTimeout(function() {
    console.log("Switching back to:", currentLang);
    window.setLanguage(currentLang);
    console.log("Final hero title:", heroTitle.textContent);
    console.log("Final hero description:", heroDesc.textContent);
  }, 2000);
}

// Add this script to test-hero-language.js

