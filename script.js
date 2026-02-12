/* ============================================================
   LUISLTATTOO — Script
   Hero GSAP animation, scroll reveals, FAQ accordion, nav
   ============================================================ */

(function () {
  'use strict';

  // ── Respect prefers-reduced-motion ──
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Wait for DOM ──
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initNav();
    initMobileMenu();
    initHeroAnimation();
    initScrollReveal();
    initFaqAccordion();
    initSmoothScroll();
    initFormHandler();
  }

  /* ============================================================
     NAV — scroll state
     ============================================================ */
  function initNav() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    const onScroll = () => {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  function initMobileMenu() {
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const links = mobileMenu?.querySelectorAll('a');

    if (!hamburger || !mobileMenu) return;

    function toggle() {
      const isOpen = mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    }

    function close() {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggle);
    links?.forEach(link => link.addEventListener('click', close));

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        close();
      }
    });
  }

  /* ============================================================
     HERO ANIMATION (GSAP with CSS fallback)
     ============================================================ */
  function initHeroAnimation() {
    const collageImages = document.querySelectorAll('.hero-collage-img');
    const heroText = document.querySelector('.hero-text');
    const heroButtons = document.querySelector('.hero-buttons');

    if (prefersReducedMotion) {
      // Immediately show everything
      collageImages.forEach(img => {
        img.style.opacity = '1';
        img.classList.remove('skeleton');
      });
      document.body.classList.add('loaded');
      return;
    }

    // Try GSAP first
    if (typeof gsap !== 'undefined') {
      animateHeroGSAP(collageImages, heroText, heroButtons);
    } else {
      // CSS fallback
      animateHeroCSS(collageImages);
    }
  }

  function animateHeroGSAP(images, heroText, heroButtons) {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => document.body.classList.add('loaded')
    });

    // Separate images by side
    const leftImages = [];
    const rightImages = [];
    let centerImage = null;

    images.forEach(img => {
      const side = img.dataset.side;
      if (side === 'left') leftImages.push(img);
      else if (side === 'right') rightImages.push(img);
      else if (side === 'center') centerImage = img;
    });

    // Initial states
    gsap.set(images, { opacity: 0 });
    gsap.set(heroText, { opacity: 0, y: 30 });
    gsap.set(heroButtons, { opacity: 0, y: 20 });

    // Animate hero text first
    tl.to(heroText, {
      opacity: 1,
      y: 0,
      duration: 0.8,
    });

    // Left images slide in from left
    leftImages.forEach((img, i) => {
      const computedStyle = window.getComputedStyle(img);
      const finalTransform = computedStyle.transform;

      tl.fromTo(img, {
        opacity: 0,
        x: -300 - (i * 80),
        rotate: -20 - (i * 5),
        scale: 0.85
      }, {
        opacity: 1,
        x: 0,
        rotate: 0,
        scale: 1,
        duration: 1.0,
        ease: 'power3.out',
        clearProps: 'transform',
        onStart: () => img.classList.remove('skeleton')
      }, 0.35 + i * 0.1);
    });

    // Right images slide in from right
    rightImages.forEach((img, i) => {
      tl.fromTo(img, {
        opacity: 0,
        x: 300 + (i * 80),
        rotate: 20 + (i * 5),
        scale: 0.85
      }, {
        opacity: 1,
        x: 0,
        rotate: 0,
        scale: 1,
        duration: 1.0,
        ease: 'power3.out',
        clearProps: 'transform',
        onStart: () => img.classList.remove('skeleton')
      }, 0.35 + i * 0.1);
    });

    // Center image — scale up with slight settle
    if (centerImage) {
      tl.fromTo(centerImage, {
        opacity: 0,
        scale: 0.88,
        y: 30
      }, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: 'back.out(1.4)',
        clearProps: 'transform',
        onStart: () => centerImage.classList.remove('skeleton')
      }, 0.25);
    }

    // Buttons fade in
    tl.to(heroButtons, {
      opacity: 1,
      y: 0,
      duration: 0.6,
    }, '-=0.4');
  }

  function animateHeroCSS(images) {
    // CSS fallback: add loaded class after short delay
    images.forEach((img, i) => {
      img.style.transition = `opacity 0.8s ease ${0.1 + i * 0.12}s, transform 0.8s ease ${0.1 + i * 0.12}s`;
    });

    requestAnimationFrame(() => {
      images.forEach(img => {
        img.style.opacity = '1';
        img.classList.remove('skeleton');
      });
      document.body.classList.add('loaded');
    });
  }

  /* ============================================================
     SCROLL REVEAL (IntersectionObserver)
     ============================================================ */
  function initScrollReveal() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  /* ============================================================
     FAQ ACCORDION
     ============================================================ */
  function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');

    items.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const panel = item.querySelector('.faq-panel');
      const panelInner = item.querySelector('.faq-panel-inner');

      if (!trigger || !panel) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.dataset.open === 'true';

        // Close all others (optional — remove for independent)
        items.forEach(other => {
          if (other !== item && other.dataset.open === 'true') {
            other.dataset.open = 'false';
            other.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-panel').style.maxHeight = '0';
          }
        });

        // Toggle current
        if (isOpen) {
          item.dataset.open = 'false';
          trigger.setAttribute('aria-expanded', 'false');
          panel.style.maxHeight = '0';
        } else {
          item.dataset.open = 'true';
          trigger.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panelInner.scrollHeight + 20 + 'px';
        }
      });

      // Keyboard support
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });
    });
  }

  /* ============================================================
     SMOOTH SCROLL for anchor links
     ============================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        const navHeight = document.querySelector('.site-nav')?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      });
    });
  }

  /* ============================================================
     FORM HANDLER (basic client-side)
     ============================================================ */
  function initFormHandler() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      // Simple validation
      const name = form.querySelector('#fname');
      const email = form.querySelector('#femail');

      if (!name.value.trim() || !email.value.trim()) {
        // Shake the button
        btn.style.animation = 'shake 0.4s ease';
        setTimeout(() => btn.style.animation = '', 400);
        return;
      }

      // Simulate send
      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(() => {
        btn.innerHTML = '✓ Message Sent!';
        btn.style.opacity = '1';
        form.reset();

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }, 2500);
      }, 1200);
    });
  }

})();
