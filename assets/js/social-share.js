// Social sharing functionality
document.addEventListener("DOMContentLoaded", function() {
  // Get the current page URL
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);
  
  // Update share links with dynamic URLs
  const facebookBtn = document.querySelector('.social-share .facebook');
  if (facebookBtn) {
    facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
  }
  
  const twitterBtn = document.querySelector('.social-share .twitter');
  if (twitterBtn) {
    twitterBtn.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
  }
  
  const linkedinBtn = document.querySelector('.social-share .linkedin');
  if (linkedinBtn) {
    linkedinBtn.href = `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${pageTitle}`;
  }
  
  const whatsappBtn = document.querySelector('.social-share .whatsapp');
  if (whatsappBtn) {
    whatsappBtn.href = `https://api.whatsapp.com/send?text=${pageTitle} ${pageUrl}`;
  }
  
  const telegramBtn = document.querySelector('.social-share .telegram');
  if (telegramBtn) {
    telegramBtn.href = `https://t.me/share/url?url=${pageUrl}&text=${pageTitle}`;
  }
  
  const emailBtn = document.querySelector('.social-share .email');
  if (emailBtn) {
    emailBtn.href = `mailto:?subject=${pageTitle}&body=I thought you might be interested in this: ${pageUrl}`;
  }
});
