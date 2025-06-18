// Mobile touch interactions enhancement
document.addEventListener('DOMContentLoaded', function() {
  // Fix for :hover on touch devices
  document.addEventListener('touchstart', function() {}, true);
  
  // Add touch support for dropdown menus if they exist
  const dropdownItems = document.querySelectorAll('.dropdown');
  if (dropdownItems.length > 0) {
    dropdownItems.forEach(item => {
      const trigger = item.querySelector('.dropdown-trigger');
      const menu = item.querySelector('.dropdown-menu');
      
      if (trigger && menu) {
        trigger.addEventListener('touchstart', function(e) {
          e.preventDefault();
          const isOpen = menu.classList.contains('active');
          
          // Close all other open menus
          document.querySelectorAll('.dropdown-menu.active').forEach(openMenu => {
            if (openMenu !== menu) {
              openMenu.classList.remove('active');
            }
          });
          
          // Toggle current menu
          menu.classList.toggle('active');
        });
      }
    });
    
    // Close dropdowns when tapping outside
    document.addEventListener('touchstart', function(e) {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
          menu.classList.remove('active');
        });
      }
    });
  }
  
  // Fix for sticky hover effects on mobile
  // Add hover class only on non-touch devices
  if (!('ontouchstart' in document.documentElement)) {
    document.body.classList.add('no-touch');
  }
});
