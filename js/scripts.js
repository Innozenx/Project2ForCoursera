// Toggle the navigation menu visibility (button-based hamburger)
function toggleMenu() {
  const btn = document.getElementById('nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (!btn || !mainNav) return;
  const primaryNav = document.getElementById('primary-navigation');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const open = mainNav.classList.toggle('nav-open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (primaryNav && isMobile) {
    // enforce inline hiding/showing on mobile to ensure menu hides
    primaryNav.style.display = open ? 'flex' : 'none';
    primaryNav.setAttribute('aria-hidden', open ? 'false' : 'true');
  } else if (primaryNav) {
    // remove inline style on larger screens so CSS controls it
    primaryNav.style.display = '';
    primaryNav.setAttribute('aria-hidden', 'false');
  }
}

// Expose toggleMenu globally for manual calls if needed
window.toggleMenu = toggleMenu;

// Filter projects by category. category='all' shows all.
function filterProjects(category) {
  const projects = document.querySelectorAll('.project-list .project');
  projects.forEach(p => {
    const cat = p.getAttribute('data-category') || 'all';
    if (category === 'all' || category === cat) {
      p.style.display = '';
      p.setAttribute('aria-hidden', 'false');
    } else {
      p.style.display = 'none';
      p.setAttribute('aria-hidden', 'true');
    }
  });
}

// Lightbox: open image in modal
function openLightbox(src, alt, caption) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  const closeBtn = lb.querySelector('.lightbox-close');

  img.src = src;
  img.alt = alt || '';
  cap.textContent = caption || alt || '';
  lb.setAttribute('aria-hidden', 'false');
  lb.style.display = 'flex';
  closeBtn.focus();

  // trap focus minimally by listening for Tab/Escape
  function onKey(e) {
    if (e.key === 'Escape') closeLightbox();
  }

  document.addEventListener('keydown', onKey);

  // store for removal
  lb._onKey = onKey;
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lb) return;
  lb.setAttribute('aria-hidden', 'true');
  lb.style.display = 'none';
  img.src = '';
  if (lb._onKey) {
    document.removeEventListener('keydown', lb._onKey);
    delete lb._onKey;
  }
}

// Attach lightbox handlers after DOM ready
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.project-image').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function (e) {
      const full = img.getAttribute('data-fullsrc') || img.src;
      const alt = img.getAttribute('alt') || '';
      const caption = img.closest('figure')?.querySelector('figcaption')?.textContent || '';
      openLightbox(full, alt, caption);
    });
  });

  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });
  }

  // Navigation toggle and behavior
  const navToggleBtn = document.getElementById('nav-toggle');
  const mainNav = document.querySelector('.main-nav');
    const primaryNav = document.getElementById('primary-navigation');
    const navButton = document.getElementById('navigation-buttons');
  if (navToggleBtn && mainNav) {
      navToggleBtn.addEventListener('click', function () {
          if (navButton.style.display == 'none') {
              navButton.style.display = 'block';
          }
          else {
              navButton.style.display = 'none';
          }
      /*toggleMenu();*/
    });

    // Close nav when a navigation link is clicked
    if (primaryNav) {
        primaryNav.addEventListener('click', function (e) {
        const a = e.target.closest('a');
        if (a) {
            // close the menu
          mainNav.classList.remove('nav-open');
          navToggleBtn.setAttribute('aria-expanded', 'false');
          if (window.matchMedia('(max-width: 768px)').matches) {
            primaryNav.style.display = 'none';
            primaryNav.setAttribute('aria-hidden', 'true');
          }
        }
      });
    }

    // ensure initial state: if mobile, hide nav
    if (primaryNav && window.matchMedia('(max-width: 768px)').matches) {
      primaryNav.style.display = 'none';
      primaryNav.setAttribute('aria-hidden', 'true');
    }

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('nav-open')) {
        mainNav.classList.remove('nav-open');
        navToggleBtn.setAttribute('aria-expanded', 'false');
        navToggleBtn.focus();
      }
    });
  }

  // Smooth scrolling for in-page anchor links
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Only handle same-page hash links
    if (href.startsWith('#')) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL hash without jumping
        history.replaceState(null, '', '#' + id);
        // move focus for accessibility
        el.setAttribute('tabindex', '-1');
        el.focus();
        el.removeAttribute('tabindex');
      }
    }
  });

  // Contact form validation
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    const name = document.getElementById('contact-name');
    const email = document.getElementById('contact-email');
    const subject = document.getElementById('contact-subject');
    const message = document.getElementById('contact-message');
    const status = document.getElementById('contact-status');

    function validateEmail(value) {
      // simple RFC-like pattern
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function showError(el, msg) {
      const id = el.getAttribute('id') + '-error';
      const span = document.getElementById(id);
      if (span) span.textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }

    name.addEventListener('input', function () {
      showError(name, name.value.trim() ? '' : 'Please enter your name.');
    });

    email.addEventListener('input', function () {
      const v = email.value.trim();
      if (!v) showError(email, 'Please enter your email.');
      else if (!validateEmail(v)) showError(email, 'Please enter a valid email address.');
      else showError(email, '');
    });

    message.addEventListener('input', function () {
      showError(message, message.value.trim() ? '' : 'Please enter a message.');
    });

    contactForm.addEventListener('submit', function (e) {
      let valid = true;
      if (!name.value.trim()) { showError(name, 'Please enter your name.'); valid = false; }
      if (!email.value.trim()) { showError(email, 'Please enter your email.'); valid = false; }
      else if (!validateEmail(email.value.trim())) { showError(email, 'Please enter a valid email address.'); valid = false; }
      if (!message.value.trim()) { showError(message, 'Please enter a message.'); valid = false; }

      if (!valid) {
        e.preventDefault();
        if (status) {
          status.textContent = 'Please fix the errors in the form and try again.';
        }
        // focus the first invalid field
        const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
      } else {
        if (status) status.textContent = 'Sending message...';
      }
    });
  }
});

