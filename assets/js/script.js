// Wait for translations to be available and initialize language handling
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.translations === 'undefined') {
        console.error('Translations not loaded');
        return;
    }

    // Get the user's preferred language from localStorage or default to English
    const currentLang = localStorage.getItem('language') || 'en';
    
    // Initialize the page
    setLanguage(currentLang);
});

// Function to update button states
function updateButtonStates(selectedLang) {
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === selectedLang) {
            btn.classList.add('active');
        }
    });
}

const metaTranslations = {
    en: {
        title: "SEBA Engineering & Consultancy | Structural Steel & Concrete Design Experts",
        description: "Expert structural engineering solutions for steel and concrete structures. SEBA Engineering delivers precision in structural design, manufacturing, and site erection.",
        ogTitle: "SEBA Engineering & Consultancy | Structural Engineering Experts",
        ogDescription: "Expert structural engineering solutions for steel and concrete structures. Precision in structural design, manufacturing, and site erection."
    },
    tr: {
        title: "SEBA Mühendislik & Danışmanlık | Çelik ve Betonarme Yapı Uzmanları",
        description: "Yapısal çelik ve betonarme yapılarda uzman mühendislik çözümleri. SEBA Mühendislik tasarım, imalat ve montajda hassasiyet sunar.",
        ogTitle: "SEBA Mühendislik & Danışmanlık | Yapı Mühendisliği Uzmanları",
        ogDescription: "Yapısal çelik ve betonarme yapılarda uzman mühendislik çözümleri. Tasarım, imalat ve montajda hassasiyet."
    }
};

function setLanguage(lang) {
    // Check if translations are available
    if (typeof window.translations === 'undefined' || !window.translations[lang]) {
        console.error(`Language ${lang} not supported or translations not loaded`);
        return;
    }
    
    localStorage.setItem('language', lang);
    
    // Update the content
    const elements = document.querySelectorAll('[data-lang-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (!key) return;

        const keys = key.split('.');
        let translation = window.translations[lang];
        
        try {
            for (const k of keys) {
                translation = translation?.[k];
                if (translation === undefined) break;
            }
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        } catch (error) {
            console.error(`Error updating translation for key: ${key}`, error);
        }
    });

    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === lang.toLowerCase()) {
            btn.classList.add('active');
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);
}

function updateContent(lang) {
    if (!translations || !translations[lang]) {
        console.error('Translations not available');
        return;
    }

    // Update navigation and content
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (!key) return;

        const keys = key.split('.');
        let translation = translations[lang];
        
        try {
            for (const k of keys) {
                translation = translation?.[k];
                if (translation === undefined) {
                    console.error(`Translation key not found: ${key}`);
                    return;
                }
            }
            
            // Update element content
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        } catch (error) {
            console.error(`Error updating translation for key: ${key}`, error);
        }
    });

    // Update meta tags
    if (metaTranslations[currentLang]) {
        document.title = metaTranslations[currentLang].title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', metaTranslations[currentLang].description);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', metaTranslations[currentLang].ogTitle);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', metaTranslations[currentLang].ogDescription);
    }

    // Update HTML lang attribute
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute('data-lang', currentLang);
}

// Handle header background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

function filterProjects(category) {
  const items = document.querySelectorAll('.project-item');
  items.forEach(item => {
    item.style.display = (category === 'all' || item.classList.contains(category)) ? 'block' : 'none';
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'en';
    updateContent(savedLang);
    updateButtonStates(savedLang);
});