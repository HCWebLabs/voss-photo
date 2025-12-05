/* =========================================
   PHOTOGRAPHER PORTFOLIO — MAIN JS
   Vanilla ES6+ | Mobile-First
   ========================================= */

'use strict';

/* -----------------------------------------
   INTERSECTION OBSERVER — SCROLL REVEALS
   ----------------------------------------- */

/**
 * Initialize scroll-triggered reveal animations
 * Elements with .reveal class will fade in when entering viewport
 */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal');
  
  if (!revealElements.length) return;
  
  const observerOptions = {
    root: null,              // Use viewport as root
    rootMargin: '0px 0px -80px 0px',  // Trigger slightly before fully in view
    threshold: 0.1           // Trigger when 10% visible
  };
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);
  
  revealElements.forEach(el => revealObserver.observe(el));
}

/* -----------------------------------------
   NAVIGATION OVERLAY
   ----------------------------------------- */

/**
 * Initialize mobile navigation overlay
 * Handles hamburger toggle and overlay visibility
 */
function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navOverlay = document.querySelector('.nav-overlay');
  const navLinks = document.querySelectorAll('.nav-overlay__link');
  const logo = document.querySelector('.logo');
  
  if (!hamburger || !navOverlay) return;
  
  // Toggle navigation
  function toggleNav() {
    const isActive = hamburger.classList.contains('is-active');
    
    hamburger.classList.toggle('is-active');
    navOverlay.classList.toggle('is-active');
    
    // Toggle logo color
    if (logo) {
      logo.classList.toggle('is-light');
    }
    
    // Toggle body scroll
    document.body.style.overflow = isActive ? '' : 'hidden';
    
    // Update ARIA attributes
    hamburger.setAttribute('aria-expanded', !isActive);
    navOverlay.setAttribute('aria-hidden', isActive);
  }
  
  // Close navigation
  function closeNav() {
    hamburger.classList.remove('is-active');
    navOverlay.classList.remove('is-active');
    
    // Reset logo color
    if (logo) {
      logo.classList.remove('is-light');
    }
    
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
    navOverlay.setAttribute('aria-hidden', 'true');
  }
  
  // Event listeners
  hamburger.addEventListener('click', toggleNav);
  
  // Close on link click
  navLinks.forEach(link => {
    link.addEventListener('click', closeNav);
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navOverlay.classList.contains('is-active')) {
      closeNav();
    }
  });
  
  // Close on overlay background click
  navOverlay.addEventListener('click', (e) => {
    if (e.target === navOverlay) {
      closeNav();
    }
  });
}

/* -----------------------------------------
   LIGHTBOX GALLERY
   ----------------------------------------- */

/**
 * Initialize lightbox functionality for gallery images
 * Supports keyboard navigation and swipe gestures
 */
function initLightbox() {
  const galleryItems = document.querySelectorAll('[data-lightbox]');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = document.querySelector('.lightbox__image');
  const lightboxClose = document.querySelector('.lightbox__close');
  const lightboxPrev = document.querySelector('.lightbox__nav--prev');
  const lightboxNext = document.querySelector('.lightbox__nav--next');
  
  if (!galleryItems.length || !lightbox) return;
  
  let currentIndex = 0;
  const images = Array.from(galleryItems);
  
  // Open lightbox
  function openLightbox(index) {
    currentIndex = index;
    const imgSrc = images[currentIndex].dataset.lightbox;
    const imgAlt = images[currentIndex].querySelector('img')?.alt || 'Gallery image';
    
    lightboxImage.src = imgSrc;
    lightboxImage.alt = imgAlt;
    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    
    // Focus management for accessibility
    lightboxClose.focus();
  }
  
  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
    
    // Return focus to the gallery item
    images[currentIndex].focus();
  }
  
  // Navigate to next image
  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxImage();
  }
  
  // Navigate to previous image
  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightboxImage();
  }
  
  // Update displayed image
  function updateLightboxImage() {
    const imgSrc = images[currentIndex].dataset.lightbox;
    const imgAlt = images[currentIndex].querySelector('img')?.alt || 'Gallery image';
    
    // Fade out, swap, fade in
    lightboxImage.style.opacity = '0';
    
    setTimeout(() => {
      lightboxImage.src = imgSrc;
      lightboxImage.alt = imgAlt;
      lightboxImage.style.opacity = '1';
    }, 200);
  }
  
  // Event listeners — Gallery items
  images.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    
    // Keyboard accessibility
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });
  
  // Event listeners — Lightbox controls
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', prevImage);
  }
  
  if (lightboxNext) {
    lightboxNext.addEventListener('click', nextImage);
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-active')) return;
    
    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
    }
  });
  
  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) < swipeThreshold) return;
    
    if (diff > 0) {
      nextImage();  // Swipe left = next
    } else {
      prevImage();  // Swipe right = prev
    }
  }
}

/* -----------------------------------------
   GALLERY FILTERS
   ----------------------------------------- */

/**
 * Initialize gallery category filtering
 * Filters gallery items by data-category attribute
 */
function initGalleryFilters() {
  const filterButtons = document.querySelectorAll('.gallery__filter-btn');
  const galleryItems = document.querySelectorAll('.gallery__item');
  
  if (!filterButtons.length || !galleryItems.length) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('is-active'));
      button.classList.add('is-active');
      
      // Filter items
      galleryItems.forEach(item => {
        const category = item.dataset.category;
        
        if (filter === 'all' || category === filter) {
          item.style.display = '';
          // Re-trigger reveal animation
          setTimeout(() => {
            item.classList.add('is-visible');
          }, 50);
        } else {
          item.style.display = 'none';
          item.classList.remove('is-visible');
        }
      });
    });
  });
}

/* -----------------------------------------
   SMOOTH SCROLL FOR ANCHOR LINKS
   ----------------------------------------- */

/**
 * Initialize smooth scrolling for internal anchor links
 * Respects reduced motion preferences via CSS
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL without triggering scroll
        history.pushState(null, '', targetId);
      }
    });
  });
}

/* -----------------------------------------
   HEADER SCROLL BEHAVIOR
   ----------------------------------------- */

/**
 * Add/remove class to header based on scroll position
 * Useful for transparent → solid header transition
 */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  
  if (!header) return;
  
  const scrollThreshold = 50;
  
  function updateHeader() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  
  // Throttle scroll events for performance
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  
  // Run on load
  updateHeader();
}

/* -----------------------------------------
   INITIALIZE ALL MODULES
   ----------------------------------------- */

function init() {
  initScrollReveals();
  initNavigation();
  initLightbox();
  initGalleryFilters();
  initSmoothScroll();
  initHeaderScroll();
  initImageLoading();
}

/* -----------------------------------------
   IMAGE LOADING ENHANCEMENT
   ----------------------------------------- */

/**
 * Smooth fade-in for lazy loaded images
 * Adds .is-loaded class when image completes loading
 */
function initImageLoading() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if (!lazyImages.length) return;
  
  lazyImages.forEach(img => {
    // If already loaded (cached)
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add('is-loaded');
      return;
    }
    
    // When image loads
    img.addEventListener('load', () => {
      img.classList.add('is-loaded');
    });
    
    // Handle errors gracefully
    img.addEventListener('error', () => {
      img.classList.add('is-loaded'); // Still remove loading state
      console.warn(`Failed to load image: ${img.src}`);
    });
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
