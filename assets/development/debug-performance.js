// Debug script to diagnose webpage performance issues
(function() {
    "use strict";
    
    // Record performance metrics
    const metrics = {
        loadStart: Date.now(),
        translationsLoaded: null,
        languageSystemInitialized: null,
        documentReady: null,
        documentLoaded: null,
        languageApplied: null
    };
    
    // Create a debugging log
    const debugLogs = [];
    
    function debugLog(message, important = false) {
        const timestamp = Date.now() - metrics.loadStart;
        const logEntry = `[${timestamp}ms] ${message}`;
        debugLogs.push(logEntry);
        
        if (important) {
            console.log("%c" + logEntry, "color: #2196F3; font-weight: bold;");
        } else {
            console.log(logEntry);
        }
    }
    
    // Monitor document state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            metrics.documentReady = Date.now();
            debugLog(`Document ready in ${metrics.documentReady - metrics.loadStart}ms`, true);
        });
    } else {
        metrics.documentReady = Date.now();
        debugLog(`Document already ready in ${metrics.documentReady - metrics.loadStart}ms`, true);
    }
    
    window.addEventListener('load', function() {
        metrics.documentLoaded = Date.now();
        debugLog(`Window load complete in ${metrics.documentLoaded - metrics.loadStart}ms`, true);
        
        // Additional checks after load
        setTimeout(performHealthCheck, 500);
    });
    
    // Check for potential issues
    function performHealthCheck() {
        debugLog("Performing health check...", true);
        
        // Check for translations object
        if (!window.TRANSLATIONS) {
            debugLog("ERROR: TRANSLATIONS object not found!", true);
        } else {
            debugLog(`TRANSLATIONS object available with ${Object.keys(window.TRANSLATIONS).length} languages`);
        }
        
        // Check for language function
        if (!window.setLanguage) {
            debugLog("ERROR: setLanguage function not found!", true);
        } else {
            debugLog("setLanguage function is available");
        }
        
        // Check language buttons
        const langButtons = document.querySelectorAll('.lang-btn');
        debugLog(`Found ${langButtons.length} language buttons`);
        
        if (langButtons.length > 0) {
            langButtons.forEach(btn => {
                const hasDataLang = btn.hasAttribute('data-lang');
                const hasClickHandler = btn.onclick || getEventListeners(btn).click?.length > 0;
                
                if (!hasDataLang) {
                    debugLog(`WARNING: Button "${btn.textContent}" missing data-lang attribute`, true);
                }
                
                if (!hasClickHandler) {
                    debugLog(`WARNING: Button "${btn.textContent}" has no click handler`, true);
                }
            });
        } else {
            debugLog("No language buttons found on page", true);
        }
        
        // Check for translatable elements
        const translatableElements = document.querySelectorAll('[data-lang-key]');
        debugLog(`Found ${translatableElements.length} translatable elements`);
        
        // Check current language status
        const currentLang = localStorage.getItem('language') || 'en';
        const documentLang = document.documentElement.lang;
        const dataLang = document.documentElement.getAttribute('data-lang');
        
        debugLog(`Current language: localStorage=${currentLang}, html.lang=${documentLang}, html.data-lang=${dataLang}`);
        
        if (currentLang !== documentLang || currentLang !== dataLang) {
            debugLog("WARNING: Language state inconsistency detected", true);
        }
        
        // Check for slow scripts
        const scripts = Array.from(document.scripts);
        debugLog(`Loaded ${scripts.length} scripts`);
        
        // Monitor network performance
        if (window.performance && window.performance.getEntries) {
            const resources = window.performance.getEntries();
            const slowResources = resources
                .filter(r => r.duration > 200)
                .sort((a, b) => b.duration - a.duration);
            
            if (slowResources.length > 0) {
                debugLog("Slow loading resources:", true);
                slowResources.slice(0, 5).forEach(res => {
                    debugLog(`  - ${res.name}: ${Math.round(res.duration)}ms`);
                });
            }
        }
        
        // Check for console errors
        if (console.error.toString().indexOf('native code') >= 0) {
            // Only override if it's the native implementation
            const originalConsoleError = console.error;
            console.error = function() {
                debugLog(`ERROR: ${Array.from(arguments).join(' ')}`, true);
                originalConsoleError.apply(console, arguments);
            };
        }
        
        debugLog("Health check complete. Check logs for any issues.", true);
    }
    
    // Helper function to try to get event listeners (won't work in all browsers)
    function getEventListeners(element) {
        if (typeof window.getEventListeners === 'function') {
            return window.getEventListeners(element);
        }
        return { click: [] }; // Default empty return for browsers that don't support this
    }
    
    // Monitor language system initialization
    const originalSetLanguage = window.setLanguage;
    if (originalSetLanguage) {
        window.setLanguage = function(lang) {
            const start = Date.now();
            debugLog(`Setting language to ${lang}`);
            
            const result = originalSetLanguage.apply(this, arguments);
            
            metrics.languageApplied = Date.now();
            debugLog(`Language ${lang} applied in ${metrics.languageApplied - start}ms`);
            
            return result;
        };
    }
    
    debugLog("Debug monitoring initialized", true);
})();
