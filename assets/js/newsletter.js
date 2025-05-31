// Newsletter subscription functionality
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('newsletter-form');
  
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const emailInput = document.getElementById('newsletter-email');
      const statusDiv = document.getElementById('newsletter-status');
      
      if (!emailInput.value) {
        statusDiv.textContent = 'Please enter a valid email address';
        statusDiv.className = 'error';
        return;
      }
      
      // In a real implementation, you would send this to your server or newsletter service
      // For now, we'll just simulate a successful subscription
      
      // Show loading state
      statusDiv.textContent = 'Subscribing...';
      statusDiv.className = 'loading';
      
      // Simulate API call with timeout
      setTimeout(function() {
        emailInput.value = '';
        statusDiv.textContent = 'Thank you for subscribing!';
        statusDiv.className = 'success';
        
        // Reset message after 5 seconds
        setTimeout(function() {
          statusDiv.textContent = '';
          statusDiv.className = '';
        }, 5000);
      }, 1500);
      
      // Analytics tracking
      if (typeof gtag === 'function') {
        gtag('event', 'newsletter_signup', {
          'event_category': 'engagement',
          'event_label': 'Engineering Newsletter'
        });
      }
    });
  }
});
