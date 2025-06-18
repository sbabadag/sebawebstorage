// Make embedded content responsive
document.addEventListener('DOMContentLoaded', function() {
  // Find all iframes in the document
  const iframes = document.querySelectorAll('iframe');
  
  // Process each iframe to make it responsive if not already
  iframes.forEach(iframe => {
    // Skip iframes that are already in responsive containers
    if (iframe.parentElement.classList.contains('responsive-embed')) {
      return;
    }
    
    // Create responsive wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'responsive-embed';
    
    // Replace iframe with wrapper containing iframe
    iframe.parentNode.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);
  });
  
  // Add click listeners to any interactive elements to ensure they work well on touch
  const interactiveElements = document.querySelectorAll('a, button, [role="button"], .card, .project-card, .service-card');
  
  interactiveElements.forEach(element => {
    element.addEventListener('touchstart', function() {
      // This empty handler enables active states on touch
    }, {passive: true});
  });
  
  // Add scroll indicator for horizontally scrollable elements
  const scrollableElements = document.querySelectorAll('.scrollable');
  
  scrollableElements.forEach(element => {
    // Create indicator elements
    const leftIndicator = document.createElement('div');
    leftIndicator.className = 'scroll-indicator left';
    leftIndicator.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    const rightIndicator = document.createElement('div');
    rightIndicator.className = 'scroll-indicator right';
    rightIndicator.innerHTML = '<i class="fas fa-chevron-right"></i>';
    
    // Add indicators to parent
    element.parentNode.insertBefore(leftIndicator, element);
    element.parentNode.insertBefore(rightIndicator, element.nextSibling);
    
    // Initially hide left indicator
    leftIndicator.style.opacity = '0';
    
    // Update indicator visibility based on scroll position
    function updateIndicators() {
      leftIndicator.style.opacity = element.scrollLeft > 0 ? '1' : '0';
      rightIndicator.style.opacity = 
        (element.scrollWidth - element.clientWidth - element.scrollLeft > 1) ? '1' : '0';
    }
    
    // Initial check
    updateIndicators();
    
    // Add scroll event listener
    element.addEventListener('scroll', updateIndicators);
    
    // Add click handlers for indicators
    leftIndicator.addEventListener('click', function() {
      element.scrollBy({left: -200, behavior: 'smooth'});
    });
    
    rightIndicator.addEventListener('click', function() {
      element.scrollBy({left: 200, behavior: 'smooth'});
    });
  });
});
