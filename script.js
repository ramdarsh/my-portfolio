// ==================== CONFIGURATION ====================
const CONFIG = {
    emailjs: {
        publicKey: "8FtLVENYYi4MIvD5y",
        serviceId: "service_ekumi2q",
        templateId: "template_o82djb8"
    },
    popup: {
        autoCloseDelay: 3000, // 3 seconds
        fadeOutDuration: 300   // milliseconds
    },
    menu: {
        closeOnScroll: true  // Automatically close mobile menu when user scrolls
    }
};

// ==================== MOBILE MENU TOGGLE ====================
const menu = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

if (menu && navbar) {
    menu.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('bx-x');
        navbar.classList.toggle('active');
        // Update ARIA attributes for accessibility
        menu.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    
    // Update aria-expanded on menu close
    const navLinks = navbar.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                menu.classList.remove('bx-x');
                navbar.classList.remove('active');
                menu.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

// ==================== ACTIVE NAVIGATION ON SCROLL ====================
function updateActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar a');
    let current = '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 60;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });

    // Close mobile menu on scroll (if enabled in config)
    // This improves UX on mobile devices by automatically closing the menu when user navigates
    if (CONFIG.menu.closeOnScroll && menu && navbar) {
        menu.classList.remove('bx-x');
        navbar.classList.remove('active');
        menu.setAttribute('aria-expanded', 'false');
    }
}

// Throttle scroll event for better performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = requestAnimationFrame(updateActiveNav);
});

// ==================== TYPED TEXT ANIMATION ====================
if (typeof Typed !== 'undefined') {
    try {
        const typedElement = document.querySelector('.multiple-text');
        if (typedElement) {
            const typed = new Typed('.multiple-text', {
                strings: ['MCA Aspirant', 'Data scientist', 'AI Enthusiast', 'Data Annotator', 'Data analyst'],
                typeSpeed: 80,
                backSpeed: 80,
                backDelay: 1200,
                loop: true,
            });
        }
    } catch (error) {
        console.warn('Typed.js initialization error:', error);
    }
}

// ==================== READ MORE BUTTON & EMAILJS FORM HANDLING ====================
document.addEventListener('DOMContentLoaded', () => {
    // Read More Button
    const readMoreBtn = document.getElementById('readMoreBtn');
    const extraContent = document.getElementById('extraContent');

    if (readMoreBtn && extraContent) {
        readMoreBtn.addEventListener('click', (event) => {
            event.preventDefault();
            const isExpanded = extraContent.classList.toggle('show');
            readMoreBtn.textContent = isExpanded ? 'Read Less' : 'Read More';
            // Update ARIA attribute for accessibility
            readMoreBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        });
    }

    // ===== EMAILJS FORM HANDLING =====
    // Check if EmailJS is loaded
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS is not loaded. Contact form will not work.');
        return;
    }

    // Initialize EmailJS
    emailjs.init(CONFIG.emailjs.publicKey);

    const form = document.getElementById('contact-form');
    const popup = document.getElementById('thank-you-popup');
    const closeBtn = document.getElementById('close-popup');

    if (!form || !popup || !closeBtn) {
        console.warn('Contact form elements not found.');
        return;
    }

    // Helper function to close popup
    function closePopup() {
        popup.classList.add('fade-out');
        setTimeout(() => {
            popup.style.display = 'none';
            popup.classList.remove('fade-out');
        }, CONFIG.popup.fadeOutDuration);
    }

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        emailjs.sendForm(
            CONFIG.emailjs.serviceId,
            CONFIG.emailjs.templateId,
            form
        )
        .then(() => {
            form.reset();
            popup.style.display = 'flex';
            
            // Auto-close popup
            setTimeout(() => {
                closePopup();
            }, CONFIG.popup.autoCloseDelay);
        })
        .catch((error) => {
            alert('❌ Failed to send message. Please try again.');
            console.error('EmailJS error:', error);
        });
    });

    // Manual close button
    closeBtn.addEventListener('click', closePopup);
});

// ==================== PORTFOLIO CAROUSEL ====================
document.addEventListener('DOMContentLoaded', () => {
    const portfolioContent = document.querySelector('.portfolio-content');
    const prevBtn = document.querySelector('.portfolio-prev');
    const nextBtn = document.querySelector('.portfolio-next');
    const pagination = document.querySelector('.portfolio-pagination');
    
    if (!portfolioContent || !prevBtn || !nextBtn) return;

    const portfolioBoxes = portfolioContent.querySelectorAll('.portfolio-box');
    if (portfolioBoxes.length === 0) return;

    let currentIndex = 0;
    let isTransitioning = false;
    let touchStartX = 0;
    let touchEndX = 0;
    let projectsPerView = 3; // Desktop: 3 projects
    
    // Update projects per view based on screen size
    function updateProjectsPerView() {
        if (window.innerWidth <= 426) {
            projectsPerView = 1; // Mobile: 1 project
        } else if (window.innerWidth <= 768) {
            projectsPerView = 2; // Tablet: 2 projects
        } else {
            projectsPerView = 3; // Desktop: 3 projects
        }
    }

    // Create pagination dots
    function createPaginationDots() {
        if (!pagination) return;
        const totalSlides = Math.ceil(portfolioBoxes.length / projectsPerView);
        pagination.innerHTML = '';
        
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.className = 'pagination-dot';
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            pagination.appendChild(dot);
        }
    }

    // Update pagination dots
    function updatePaginationDots() {
        if (!pagination) return;
        const dots = pagination.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Update slider position
    function updateSlider() {
        if (isTransitioning) return;
        isTransitioning = true;
        
        const boxWidth = portfolioBoxes[0].offsetWidth;
        const gap = 30; // 3rem gap
        const translateX = -(currentIndex * (boxWidth + gap) * projectsPerView);
        
        portfolioContent.style.transform = `translateX(${translateX}px)`;
        
        updatePaginationDots();
        
        // Disable buttons at edges
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= Math.ceil(portfolioBoxes.length / projectsPerView) - 1;
        
        if (prevBtn.disabled) {
            prevBtn.style.opacity = '0.5';
            prevBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }
        
        if (nextBtn.disabled) {
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
        
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }

    // Go to specific slide
    function goToSlide(index) {
        const maxIndex = Math.ceil(portfolioBoxes.length / projectsPerView) - 1;
        if (index < 0 || index > maxIndex) return;
        currentIndex = index;
        updateSlider();
    }

    // Next slide
    function nextSlide() {
        const maxIndex = Math.ceil(portfolioBoxes.length / projectsPerView) - 1;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlider();
        }
    }

    // Previous slide
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    }

    // Touch/swipe handlers
    portfolioContent.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    portfolioContent.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                nextSlide();
            } else {
                // Swipe right - previous
                prevSlide();
            }
        }
    }

    // Keyboard navigation
    portfolioContent.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });

    // Button event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateProjectsPerView();
            createPaginationDots();
            currentIndex = 0;
            updateSlider();
        }, 250);
    });

    // Initialize
    updateProjectsPerView();
    createPaginationDots();
    updateSlider();
    
    // Set tabindex for keyboard navigation
    portfolioContent.setAttribute('tabindex', '0');
});

// ==================== CERTIFICATIONS CAROUSEL ====================
document.addEventListener('DOMContentLoaded', () => {
    const certContent = document.querySelector('.cert-container');
    const prevBtn = document.querySelector('.cert-prev');
    const nextBtn = document.querySelector('.cert-next');
    const pagination = document.querySelector('.cert-pagination');
    
    if (!certContent || !prevBtn || !nextBtn) return;

    const certBoxes = certContent.querySelectorAll('.cert-box');
    if (certBoxes.length === 0) return;

    let currentIndex = 0;
    let isTransitioning = false;
    let touchStartX = 0;
    let touchEndX = 0;
    let certsPerView = 3; // Desktop: 3 certifications
    
    // Update certifications per view based on screen size
    function updateCertsPerView() {
        if (window.innerWidth <= 426) {
            certsPerView = 1; // Mobile: 1 certification
        } else if (window.innerWidth <= 768) {
            certsPerView = 2; // Tablet: 2 certifications
        } else {
            certsPerView = 3; // Desktop: 3 certifications
        }
    }

    // Create pagination dots
    function createPaginationDots() {
        if (!pagination) return;
        const totalSlides = Math.ceil(certBoxes.length / certsPerView);
        pagination.innerHTML = '';
        
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.className = 'cert-pagination-dot';
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            pagination.appendChild(dot);
        }
    }

    // Update pagination dots
    function updatePaginationDots() {
        if (!pagination) return;
        const dots = pagination.querySelectorAll('.cert-pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Update slider position
    function updateSlider() {
        if (isTransitioning) return;
        isTransitioning = true;
        
        const boxWidth = certBoxes[0].offsetWidth;
        const gap = 25; // 2.5rem gap
        const translateX = -(currentIndex * (boxWidth + gap) * certsPerView);
        
        certContent.style.transform = `translateX(${translateX}px)`;
        
        updatePaginationDots();
        
        // Disable buttons at edges
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= Math.ceil(certBoxes.length / certsPerView) - 1;
        
        if (prevBtn.disabled) {
            prevBtn.style.opacity = '0.5';
            prevBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }
        
        if (nextBtn.disabled) {
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
        
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }

    // Go to specific slide
    function goToSlide(index) {
        const maxIndex = Math.ceil(certBoxes.length / certsPerView) - 1;
        if (index < 0 || index > maxIndex) return;
        currentIndex = index;
        updateSlider();
    }

    // Next slide
    function nextSlide() {
        const maxIndex = Math.ceil(certBoxes.length / certsPerView) - 1;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlider();
        }
    }

    // Previous slide
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    }

    // Touch/swipe handlers
    certContent.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    certContent.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                nextSlide();
            } else {
                // Swipe right - previous
                prevSlide();
            }
        }
    }

    // Keyboard navigation
    certContent.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });

    // Button event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCertsPerView();
            createPaginationDots();
            currentIndex = 0;
            updateSlider();
        }, 250);
    });

    // Initialize
    updateCertsPerView();
    createPaginationDots();
    updateSlider();
    
    // Set tabindex for keyboard navigation
    certContent.setAttribute('tabindex', '0');
});

// ==================== ABOUT SECTION INTERACTIVE FEATURES ====================
document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);

    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });

    // Animated Counter for Stats
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        const updateCounter = () => {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    }

    // Stats Counter Observer
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(stat => {
        statsObserver.observe(stat);
    });

    // Animated Skill Bars
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const width = entry.target.getAttribute('data-width');
                setTimeout(() => {
                    entry.target.style.width = width + '%';
                }, 100);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-progress').forEach(bar => {
        skillsObserver.observe(bar);
    });
});
