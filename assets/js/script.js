// Get the user's preferred language from localStorage or default to English
let currentLang = localStorage.getItem('language') || 'en';

// Function to update button states
function updateButtonStates(selectedLang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const btnLang = btn.textContent.toLowerCase();
        btn.classList.remove('active');
        if (btnLang === selectedLang) {
            btn.classList.add('active');
        }
    });
}

// Initialize content when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language
    setLanguage(currentLang);
    // Set initial button states
    updateButtonStates(currentLang);
});

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
    if (!translations[lang]) {
        console.error(`Language ${lang} not supported`);
        return;
    }
    
    currentLang = lang;
    localStorage.setItem('language', lang);
    updateContent();
    updateButtonStates(lang);
}

function updateContent() {
    // Update navigation and content
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        const keys = key.split('.');
        let translation = translations[currentLang];
        
        try {            for (const k of keys) {
                if (typeof translation === 'object' && translation !== null) {
                    translation = translation[k];
                }
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

// Remove duplicate initialization - we already have it above