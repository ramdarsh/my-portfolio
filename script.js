// ==================== CONFIGURATION ====================
const CONFIG = {
    emailjs: {
        publicKey: "8FtLVENYYi4MIvD5y",
        serviceId: "service_ekumi2q",
        templateId: "template_o82djb8"
    },
    popup: {
        autoCloseDelay: 3000,
        fadeOutDuration: 300
    },
    menu: {
        closeOnScroll: true
    },
    carousel: {
        transitionDuration: 500,
        resizeDebounce: 250
    }
};

// ==================== UTILITY FUNCTIONS ====================
const utils = {
    /**
     * Throttle function to limit how often a function can be called
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /**
     * Debounce function to delay execution until after wait time
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Check if element exists and is in viewport
     */
    isInViewport(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// ==================== MOBILE MENU TOGGLE ====================
(function initMobileMenu() {
    const menu = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');
    const navLinks = navbar?.querySelectorAll('a');

    if (!menu || !navbar) return;

    const toggleMenu = () => {
        const isOpen = menu.classList.toggle('bx-x');
        navbar.classList.toggle('active');
        menu.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    menu.addEventListener('click', toggleMenu);

    // Close menu when clicking nav links
    navLinks?.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && navbar.classList.contains('active')) {
                menu.classList.remove('bx-x');
                navbar.classList.remove('active');
                menu.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navbar.classList.contains('active')) {
            menu.classList.remove('bx-x');
            navbar.classList.remove('active');
            menu.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
})();

// ==================== ACTIVE NAVIGATION ON SCROLL ====================
(function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar a[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const updateActiveNav = () => {
        const scrollY = window.pageYOffset || window.scrollY;
        let current = '';

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Close mobile menu on scroll if enabled
        if (CONFIG.menu.closeOnScroll) {
            const menu = document.querySelector('#menu-icon');
            const navbar = document.querySelector('.navbar');
            if (menu && navbar && navbar.classList.contains('active')) {
                menu.classList.remove('bx-x');
                navbar.classList.remove('active');
                menu.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }
    };

    // Use requestAnimationFrame for smooth scrolling performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial call
    updateActiveNav();
})();

// ==================== TYPED TEXT ANIMATION ====================
(function initTypedText() {
    if (typeof Typed === 'undefined') {
        console.warn('Typed.js library not loaded');
        return;
    }

    const typedElement = document.querySelector('.multiple-text');
    if (!typedElement) return;

    try {
        new Typed('.multiple-text', {
            strings: ['MCA Aspirant', 'Data scientist', 'AI Enthusiast', 'Data Annotator', 'Data analyst'],
            typeSpeed: 80,
            backSpeed: 80,
            backDelay: 1200,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    } catch (error) {
        console.warn('Typed.js initialization error:', error);
    }
})();

// ==================== GENERIC CAROUSEL CLASS ====================
class Carousel {
    constructor(options) {
        this.container = document.querySelector(options.containerSelector);
        this.content = document.querySelector(options.contentSelector);
        this.prevBtn = document.querySelector(options.prevBtnSelector);
        this.nextBtn = document.querySelector(options.nextBtnSelector);
        this.pagination = document.querySelector(options.paginationSelector);
        this.items = this.content?.querySelectorAll(options.itemSelector) || [];
        this.config = {
            itemsPerView: options.itemsPerView || { mobile: 1, tablet: 2, desktop: 3 },
            gap: options.gap || 30,
            transitionDuration: options.transitionDuration || CONFIG.carousel.transitionDuration,
            paginationClass: options.paginationClass || 'pagination-dot'
        };

        if (!this.container || !this.content || !this.prevBtn || !this.nextBtn || this.items.length === 0) {
            console.warn(`Carousel initialization failed: ${options.containerSelector}`);
            return;
        }

        this.currentIndex = 0;
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.itemsPerView = this.getItemsPerView();

        this.init();
    }

    getItemsPerView() {
        const width = window.innerWidth;
        if (width <= 426) return this.config.itemsPerView.mobile;
        if (width <= 768) return this.config.itemsPerView.tablet;
        return this.config.itemsPerView.desktop;
    }

    init() {
        this.createPagination();
        this.updateSlider();
        this.attachEventListeners();
        this.handleResize();
    }

    createPagination() {
        if (!this.pagination) return;
        const totalSlides = Math.ceil(this.items.length / this.itemsPerView);
        this.pagination.innerHTML = '';

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = this.config.paginationClass;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.pagination.appendChild(dot);
        }
    }

    updatePaginationDots() {
        if (!this.pagination) return;
        const dots = this.pagination.querySelectorAll(`.${this.config.paginationClass}`);
        dots.forEach((dot, index) => {
            const isActive = index === this.currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    }

    updateSlider() {
        if (this.isTransitioning || !this.items[0]) return;
        this.isTransitioning = true;

        const boxWidth = this.items[0].offsetWidth;
        const translateX = -(this.currentIndex * (boxWidth + this.config.gap) * this.itemsPerView);

        this.content.style.transition = `transform ${this.config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        this.content.style.transform = `translateX(${translateX}px)`;

        this.updatePaginationDots();
        this.updateButtons();

        setTimeout(() => {
            this.isTransitioning = false;
        }, this.config.transitionDuration);
    }

    updateButtons() {
        const maxIndex = Math.ceil(this.items.length / this.itemsPerView) - 1;
        const prevDisabled = this.currentIndex === 0;
        const nextDisabled = this.currentIndex >= maxIndex;

        this.prevBtn.disabled = prevDisabled;
        this.nextBtn.disabled = nextDisabled;
        this.prevBtn.setAttribute('aria-disabled', prevDisabled ? 'true' : 'false');
        this.nextBtn.setAttribute('aria-disabled', nextDisabled ? 'true' : 'false');

        // Update visual state
        [this.prevBtn, this.nextBtn].forEach(btn => {
            if (btn.disabled) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
    }

    goToSlide(index) {
        const maxIndex = Math.ceil(this.items.length / this.itemsPerView) - 1;
        if (index < 0 || index > maxIndex) return;
        this.currentIndex = index;
        this.updateSlider();
    }

    nextSlide() {
        const maxIndex = Math.ceil(this.items.length / this.itemsPerView) - 1;
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.updateSlider();
        }
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateSlider();
        }
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    attachEventListeners() {
        // Button events
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.prevBtn.addEventListener('click', () => this.prevSlide());

        // Touch events
        this.content.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });

        this.content.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        }, { passive: true });

        // Keyboard navigation
        this.content.setAttribute('tabindex', '0');
        this.content.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            }
        });
    }

    handleResize() {
        const resizeHandler = utils.debounce(() => {
            const newItemsPerView = this.getItemsPerView();
            if (newItemsPerView !== this.itemsPerView) {
                this.itemsPerView = newItemsPerView;
                this.createPagination();
                this.currentIndex = 0;
                this.updateSlider();
            }
        }, CONFIG.carousel.resizeDebounce);

        window.addEventListener('resize', resizeHandler, { passive: true });
    }
}

// ==================== PORTFOLIO CAROUSEL ====================
let portfolioCarousel;
document.addEventListener('DOMContentLoaded', () => {
    portfolioCarousel = new Carousel({
        containerSelector: '.portfolio-container',
        contentSelector: '.portfolio-content',
        prevBtnSelector: '.portfolio-prev',
        nextBtnSelector: '.portfolio-next',
        paginationSelector: '.portfolio-pagination',
        itemSelector: '.portfolio-box',
        itemsPerView: { mobile: 1, tablet: 2, desktop: 3 },
        gap: 30,
        paginationClass: 'pagination-dot'
    });
});

// ==================== CERTIFICATIONS CAROUSEL ====================
let certificationsCarousel;
document.addEventListener('DOMContentLoaded', () => {
    certificationsCarousel = new Carousel({
        containerSelector: '.cert-container-slider',
        contentSelector: '.cert-container',
        prevBtnSelector: '.cert-prev',
        nextBtnSelector: '.cert-next',
        paginationSelector: '.cert-pagination',
        itemSelector: '.cert-box',
        itemsPerView: { mobile: 1, tablet: 2, desktop: 3 },
        gap: 25,
        paginationClass: 'cert-pagination-dot'
    });
});

// ==================== READ MORE BUTTON ====================
(function initReadMore() {
    const readMoreBtn = document.getElementById('readMoreBtn');
    const extraContent = document.getElementById('extraContent');

    if (!readMoreBtn || !extraContent) return;

    readMoreBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const isExpanded = extraContent.classList.toggle('show');
        readMoreBtn.textContent = isExpanded ? 'Read Less' : 'Read More';
        readMoreBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

        // Smooth scroll to button if content is expanded
        if (isExpanded) {
            setTimeout(() => {
                readMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    });
})();

// ==================== EMAILJS FORM HANDLING ====================
(function initContactForm() {
    // Wait for DOM and EmailJS to be ready
    const initForm = () => {
        if (typeof emailjs === 'undefined') {
            console.warn('EmailJS is not loaded. Contact form will not work.');
            return;
        }

        const form = document.getElementById('contact-form');
        const popup = document.getElementById('thank-you-popup');
        const closeBtn = document.getElementById('close-popup');

        if (!form || !popup || !closeBtn) {
            console.warn('Contact form elements not found.');
            return;
        }

        // Initialize EmailJS
        try {
            emailjs.init(CONFIG.emailjs.publicKey);
        } catch (error) {
            console.error('EmailJS initialization error:', error);
            return;
        }

        // Helper function to close popup
        const closePopup = () => {
            popup.classList.add('fade-out');
            popup.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
                popup.style.display = 'none';
                popup.classList.remove('fade-out');
            }, CONFIG.popup.fadeOutDuration);
        };

        // Form validation
        const validateForm = () => {
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.setAttribute('aria-invalid', 'true');
                } else {
                    input.setAttribute('aria-invalid', 'false');
                }
            });

            return isValid;
        };

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateForm()) {
                alert('Please fill in all required fields.');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                await emailjs.sendForm(
                    CONFIG.emailjs.serviceId,
                    CONFIG.emailjs.templateId,
                    form
                );

                form.reset();
                popup.style.display = 'flex';
                popup.setAttribute('aria-hidden', 'false');
                closeBtn.focus();

                // Auto-close popup
                setTimeout(() => {
                    closePopup();
                }, CONFIG.popup.autoCloseDelay);
            } catch (error) {
                console.error('EmailJS error:', error);
                alert('❌ Failed to send message. Please try again or contact me directly via email.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });

        // Manual close button
        closeBtn.addEventListener('click', closePopup);

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.style.display === 'flex') {
                closePopup();
            }
        });

        // Close on backdrop click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closePopup();
            }
        });
    };

    // Wait for both DOM and EmailJS
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof emailjs !== 'undefined') {
                initForm();
            } else {
                // Wait for EmailJS to load
                const checkEmailJS = setInterval(() => {
                    if (typeof emailjs !== 'undefined') {
                        clearInterval(checkEmailJS);
                        initForm();
                    }
                }, 100);
                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkEmailJS);
                    if (typeof emailjs === 'undefined') {
                        console.warn('EmailJS failed to load');
                    }
                }, 5000);
            }
        });
    } else {
        if (typeof emailjs !== 'undefined') {
            initForm();
        }
    }
})();

// ==================== SCROLL ANIMATIONS ====================
(function initScrollAnimations() {
    // Check for IntersectionObserver support
    if (!window.IntersectionObserver) {
        // Fallback: show all elements immediately
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.classList.add('aos-animate');
        });
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
})();

// ==================== ANIMATED COUNTER FOR STATS ====================
(function initStatsCounter() {
    if (!window.IntersectionObserver) return;

    const animateCounter = (element, target, duration = 2000) => {
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
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const target = parseInt(entry.target.getAttribute('data-target'), 10);
                if (!isNaN(target)) {
                    animateCounter(entry.target, target);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(stat => {
        statsObserver.observe(stat);
    });
})();

// ==================== ANIMATED SKILL BARS ====================
(function initSkillBars() {
    if (!window.IntersectionObserver) return;

    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const width = entry.target.getAttribute('data-width');
                const widthNum = parseInt(width, 10);
                if (!isNaN(widthNum)) {
                    setTimeout(() => {
                        entry.target.style.width = widthNum + '%';
                        // Update aria-valuenow for accessibility
                        const progressBar = entry.target.closest('.skill-bar');
                        if (progressBar) {
                            progressBar.setAttribute('aria-valuenow', widthNum);
                        }
                    }, 100);
                }
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-progress').forEach(bar => {
        skillsObserver.observe(bar);
    });
})();
