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
    }
};

// ==================== MOBILE MENU TOGGLE ====================
const menu = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

if (menu && navbar) {
    menu.addEventListener('click', () => {
        menu.classList.toggle('bx-x');
        navbar.classList.toggle('active');
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

    // Close mobile menu on scroll
    if (menu && navbar) {
        menu.classList.remove('bx-x');
        navbar.classList.remove('active');
    }
}

window.addEventListener('scroll', updateActiveNav);

// ==================== TYPED TEXT ANIMATION ====================
if (typeof Typed !== 'undefined') {
    const typed = new Typed('.multiple-text', {
        strings: ['MCA Aspirant', 'Data scientist', 'AI Enthusiast', 'Data Annotator', 'Data analyst'],
        typeSpeed: 80,
        backSpeed: 80,
        backDelay: 1200,
        loop: true,
    });
}

// ==================== READ MORE BUTTON ====================
document.addEventListener('DOMContentLoaded', () => {
    const readMoreBtn = document.getElementById('readMoreBtn');
    const extraContent = document.getElementById('extraContent');

    if (readMoreBtn && extraContent) {
        readMoreBtn.addEventListener('click', (event) => {
            event.preventDefault();
            extraContent.classList.toggle('show');
            readMoreBtn.textContent = extraContent.classList.contains('show') 
                ? 'Read Less' 
                : 'Read More';
        });
    }
});

// ==================== EMAILJS FORM HANDLING ====================
document.addEventListener('DOMContentLoaded', () => {
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
