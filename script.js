// Vipin Gupta — Portfolio scripts

document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            const open = navLinks.classList.toggle('active');
            menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 2. Navbar Scroll Shadow & Bottom Contact Highlight
    const navbar = document.getElementById('navbar');
    const navItems = document.querySelectorAll('.nav-links a.nav-link');
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (progressBar && height > 0) {
            progressBar.style.width = Math.min(100, (winScroll / height) * 100) + '%';
        }
        if (height > 0 && winScroll >= height - 100) {
            navItems.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#contact') {
                    link.classList.add('active');
                }
            });
        }
    }, { passive: true });

    // 3. Active Navbar Link on Scroll
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;

                if (height > 0 && winScroll >= height - 100) return;

                navItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-30% 0px -70% 0px'
    });

    sections.forEach(sec => sectionObserver.observe(sec));

    // 4. Contact Form Submission (Web3Forms API)
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const feedbackSpinner = document.getElementById('feedback-spinner');
    const successIcon = document.getElementById('success-icon');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackMessage = document.getElementById('feedback-message');
    const btnBackForm = document.getElementById('btn-back-form');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Honeypot spam check
            const botcheck = contactForm.querySelector('input[name="botcheck"]');
            if (botcheck && botcheck.checked) {
                feedbackSpinner.style.display = 'none';
                successIcon.style.display = 'block';
                feedbackTitle.textContent = 'Message Received!';
                feedbackMessage.textContent = 'Thank you for reaching out. I will get back to you shortly.';
                btnBackForm.style.display = 'inline-block';
                formFeedback.classList.add('show');
                contactForm.reset();
                return;
            }

            // Client-side rate limiting (60s cooldown)
            const COOLDOWN_MS = 60 * 1000;
            const lastSentTime = localStorage.getItem('vipin_portfolio_contact_last_sent');
            if (lastSentTime && (Date.now() - parseInt(lastSentTime, 10)) < COOLDOWN_MS) {
                const waitSecs = Math.ceil((COOLDOWN_MS - (Date.now() - parseInt(lastSentTime, 10))) / 1000);
                feedbackSpinner.style.display = 'none';
                successIcon.style.display = 'none';
                btnBackForm.style.display = 'inline-block';
                feedbackTitle.textContent = 'Submission Cooldown';
                feedbackMessage.textContent = `You recently submitted a message. Please wait ${waitSecs} seconds before sending another.`;
                formFeedback.classList.add('show');
                return;
            }

            // Input validation
            const nameInput = contactForm.querySelector('#name');
            const emailInput = contactForm.querySelector('#email');
            const messageInput = contactForm.querySelector('#message');

            const nameVal = nameInput ? nameInput.value.trim() : '';
            const emailVal = emailInput ? emailInput.value.trim() : '';
            const messageVal = messageInput ? messageInput.value.trim() : '';

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

            if (nameVal.length < 2 || nameVal.length > 80) {
                if (nameInput) nameInput.focus();
                return;
            }
            if (!emailRegex.test(emailVal) || emailVal.length > 120) {
                if (emailInput) emailInput.focus();
                return;
            }
            if (messageVal.length < 10 || messageVal.length > 2000) {
                if (messageInput) messageInput.focus();
                return;
            }

            function sanitizeText(str) {
                if (!str) return '';
                return str
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;')
                    .trim();
            }

            const cleanPayload = {
                access_key: contactForm.querySelector('input[name="access_key"]')?.value || '',
                name: sanitizeText(nameVal),
                email: emailVal,
                message: sanitizeText(messageVal)
            };

            feedbackSpinner.style.display = 'block';
            successIcon.style.display = 'none';
            feedbackTitle.textContent = 'Sending Message...';
            feedbackMessage.textContent = 'Please wait a moment while your message is delivered.';
            btnBackForm.style.display = 'none';
            formFeedback.classList.add('show');

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(cleanPayload)
            })
            .then(async (response) => {
                feedbackSpinner.style.display = 'none';
                if (response.status === 200) {
                    localStorage.setItem('vipin_portfolio_contact_last_sent', Date.now().toString());
                    successIcon.style.display = 'block';
                    feedbackTitle.textContent = 'Message Received!';
                    feedbackMessage.textContent = 'Thank you for reaching out. I will get back to you shortly.';
                    btnBackForm.style.display = 'inline-block';
                    contactForm.reset();
                } else {
                    feedbackTitle.textContent = 'Unable to Send';
                    feedbackMessage.textContent = 'Something went wrong while submitting. Please email directly at dev.vipingupta@gmail.com.';
                    btnBackForm.style.display = 'inline-block';
                }
            })
            .catch(() => {
                feedbackSpinner.style.display = 'none';
                feedbackTitle.textContent = 'Connection Error';
                feedbackMessage.textContent = 'Unable to send message. Please email me directly at dev.vipingupta@gmail.com.';
                btnBackForm.style.display = 'inline-block';
            });
        });

        if (btnBackForm) {
            btnBackForm.addEventListener('click', () => {
                formFeedback.classList.remove('show');
            });
        }
    }

    // 5. Scroll-triggered Entrance Animations
    const animatableSelectors = [
        '.section-header',
        '.stat-item',
        '.reveal',
        '.project-card',
        '.sub-heading',
        '.skill-group',
        '.timeline-item',
        '.contact-info-panel',
        '.contact-form'
    ];

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animTargets = Array.from(document.querySelectorAll(animatableSelectors.join(','))).filter(el => {
        const rail = el.closest('.concepts-grid');
        return !(rail && rail.scrollWidth > rail.clientWidth + 1);
    });
    document.querySelectorAll('.concepts-grid').forEach(rail => {
        if (rail.scrollWidth > rail.clientWidth + 1) animTargets.push(rail);
    });

    if ('IntersectionObserver' in window && !reduceMotion) {
        animTargets.forEach(el => {
            el.classList.add('anim-ready');
            const siblings = Array.from(el.parentElement.children).filter(c => c.matches(animatableSelectors.join(',')));
            const index = siblings.indexOf(el);
            if (index > 0) el.style.setProperty('--d', Math.min(index, 4) * 0.08 + 's');
        });

        const entranceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('anim-visible');
                    entranceObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.08
        });

        animTargets.forEach(el => entranceObserver.observe(el));
    }

    // 6. Typing effect for the hero role
    const typedEl = document.getElementById('typed');
    if (typedEl) {
        const roles = ['Full-Stack Developer', 'MERN & Python', 'Founder, GigOra'];
        if (!reduceMotion) {
            let roleIndex = 0;
            let charIndex = roles[0].length;
            let deleting = true;
            const tick = () => {
                const word = roles[roleIndex];
                if (deleting) {
                    charIndex--;
                    typedEl.textContent = word.slice(0, charIndex);
                    if (charIndex === 0) {
                        deleting = false;
                        roleIndex = (roleIndex + 1) % roles.length;
                        setTimeout(tick, 350);
                        return;
                    }
                    setTimeout(tick, 40);
                } else {
                    const next = roles[roleIndex];
                    charIndex++;
                    typedEl.textContent = next.slice(0, charIndex);
                    if (charIndex === next.length) {
                        deleting = true;
                        setTimeout(tick, 2200);
                        return;
                    }
                    setTimeout(tick, 75);
                }
            };
            setTimeout(tick, 2600);
        }
    }

});
