// Lazy load images for better performance
document.addEventListener('DOMContentLoaded', function() {
  // Check if browser supports Intersection Observer
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          
          observer.unobserve(img);
        }
      });
    });
    
    // Get all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    let lazyLoadThrottleTimeout;
    
    function lazyLoad() {
      if (lazyLoadThrottleTimeout) {
        clearTimeout(lazyLoadThrottleTimeout);
      }
      
      lazyLoadThrottleTimeout = setTimeout(function() {
        const scrollTop = window.pageYOffset;
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        lazyImages.forEach(function(img) {
          if (img.offsetTop < window.innerHeight + scrollTop) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
        });
        
        if (lazyImages.length == 0) {
          document.removeEventListener('scroll', lazyLoad);
          window.removeEventListener('resize', lazyLoad);
          window.removeEventListener('orientationChange', lazyLoad);
        }
      }, 20);
    }
    
    document.addEventListener('scroll', lazyLoad);
    window.addEventListener('resize', lazyLoad);
    window.addEventListener('orientationChange', lazyLoad);
  }
});
