// Mobile layout adjustments
document.addEventListener('DOMContentLoaded', function() {
  // Function to check and fix overflow issues
  function fixLayoutIssues() {
    // Check if we're on a mobile device
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
      // Find elements that might cause horizontal overflow
      const fullWidthElements = document.querySelectorAll('div, section, header, footer, main');
      
      fullWidthElements.forEach(element => {
        // Skip elements with specific classes that should maintain their width
        if (element.classList.contains('scrollable') || 
            element.classList.contains('responsive-embed')) {
          return;
        }
        
        // Check for horizontal overflow
        const rect = element.getBoundingClientRect();
        if (rect.width > window.innerWidth) {
          // Fix the overflow by setting max-width
          element.style.maxWidth = '100vw';
          element.style.overflowX = 'hidden';
        }
      });
      
      // Ensure proper spacing between elements
      const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
      contentElements.forEach(element => {
        // Add margin bottom for better spacing on mobile
        const currentStyle = window.getComputedStyle(element);
        if (parseInt(currentStyle.marginBottom) < 15) {
          element.style.marginBottom = '15px';
        }
      });
      
      // Increase tap target sizes for better accessibility
      const smallClickables = document.querySelectorAll('a, button, input[type="button"], input[type="submit"]');
      smallClickables.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.height < 44 || rect.width < 44) {
          // Add padding to small elements to make them more tappable
          // But skip if they're just icons
          if (!element.querySelector('.fas, .fab, .fa, .far') && !element.classList.contains('icon-only')) {
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
            element.style.display = 'inline-flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
          }
        }
      });
    }
  }
  
  // Run on load
  fixLayoutIssues();
  
  // Run on resize
  window.addEventListener('resize', fixLayoutIssues);
  
  // After page is fully loaded (images and all)
  window.addEventListener('load', fixLayoutIssues);
});
