// ============================================
// MAIN JAVASCRIPT - TRUTHFULNESS CENTER
// ============================================
// Handles i18n, animations, navigation, and interactivity
// ============================================

(function () {
    "use strict";

    // ===================
    // STATE MANAGEMENT
    // ===================

    let currentLang = "en";
    let isScrolling = false;

    // ===================
    // UTILITY FUNCTIONS
    // ===================

    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const isElementInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    const isElementPartiallyInViewport = (el, threshold = 0.2) => {
        const rect = el.getBoundingClientRect();
        const windowHeight =
            window.innerHeight || document.documentElement.clientHeight;
        const elementHeight = rect.height;
        const visibleHeight =
            Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        return visibleHeight >= elementHeight * threshold;
    };

    // ===================
    // I18N FUNCTIONALITY
    // ===================

    const getNestedProperty = (obj, path) => {
        return path.split(".").reduce((current, key) => current?.[key], obj);
    };

    const updateContent = (lang) => {
        // If language doesn't exist, fallback to 'en'
        if (!content[lang]) lang = 'en';

        const elements = document.querySelectorAll("[data-i18n]");

        elements.forEach((el) => {
            const key = el.getAttribute("data-i18n");
            const translation = getNestedProperty(content[lang], key);

            if (translation) {
                if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                    el.placeholder = translation;
                } else if (el.tagName === "SELECT") {
                    // Handle select options separately
                } else {
                    el.innerHTML = translation;
                }
            }
        });

        // Update select options
        const selectOptions = document.querySelectorAll("option[data-i18n]");
        selectOptions.forEach((option) => {
            const key = option.getAttribute("data-i18n");
            const translation = getNestedProperty(content[lang], key);
            if (translation) {
                option.textContent = translation;
            }
        });

        // Update document lang attribute
        document.documentElement.setAttribute("lang", lang);

        // Update active lang button (for backward compatibility)
        document.querySelectorAll(".lang-switch").forEach((btn) => {
            btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
        });

        // Update language dropdown options
        document.querySelectorAll(".lang-option").forEach((option) => {
            option.classList.toggle(
                "active",
                option.getAttribute("data-lang") === lang
            );
        });

        // Update dropdown if it exists
        const langDropdown = document.getElementById("langSelect");
        if (langDropdown) {
            langDropdown.value = lang;
        }

        // Store preference
        localStorage.setItem("preferredLang", lang);
    };

    const initI18n = () => {
        // Get stored preference or default to 'en'
        const storedLang = localStorage.getItem("preferredLang") || "en";
        currentLang = storedLang;
        updateContent(currentLang);

        // Add event listeners to language switches (buttons - backward compatibility)
        document.querySelectorAll(".lang-switch").forEach((btn) => {
            btn.addEventListener("click", () => {
                const lang = btn.getAttribute("data-lang");
                if (lang && lang !== currentLang) {
                    currentLang = lang;
                    updateContent(lang);
                }
            });
        });

        // Handle new language dropdown toggle
        const langToggle = document.getElementById("langToggle");
        if (langToggle) {
            const langOptions = langToggle.querySelectorAll(".lang-option");

            langOptions.forEach((option) => {
                option.addEventListener("click", (e) => {
                    e.preventDefault();
                    const lang = option.getAttribute("data-lang");
                    if (lang && lang !== currentLang) {
                        currentLang = lang;
                        updateContent(lang);
                    }
                    langToggle.classList.remove("active");
                });
            });

            // Toggle dropdown visibility
            const toggleBtn = langToggle.querySelector(".lang-toggle-btn");
            if (toggleBtn) {
                toggleBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    langToggle.classList.toggle("active");
                });
            }

            // Close dropdown when clicking outside
            document.addEventListener("click", (e) => {
                if (!langToggle.contains(e.target)) {
                    langToggle.classList.remove("active");
                }
            });
        }

        // Add event listener to language dropdown (select element)
        const langDropdown = document.getElementById("langSelect");
        if (langDropdown) {
            langDropdown.addEventListener("change", (e) => {
                const lang = e.target.value;
                if (lang && lang !== currentLang) {
                    currentLang = lang;
                    updateContent(lang);
                }
            });
        }
    };

    // ===================
    // NAVIGATION
    // ===================

    const initNavigation = () => {
        const nav = document.querySelector(".nav");
        const navToggle = document.querySelector(".nav__toggle");
        const navMenu = document.querySelector(".nav__menu");
        const navLinks = document.querySelectorAll(".nav__link");

        // Sticky navigation on scroll
        let lastScroll = 0;

        const handleScroll = () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll <= 0) {
                nav.classList.remove("nav--scrolled");
                return;
            }

            if (currentScroll > lastScroll && !isScrolling) {
                // Scrolling down
                nav.style.transform = "translateY(-100%)";
            } else if (currentScroll < lastScroll) {
                // Scrolling up
                nav.style.transform = "translateY(0)";
                nav.classList.add("nav--scrolled");
            }

            lastScroll = currentScroll;
        };

        window.addEventListener("scroll", debounce(handleScroll, 10));

        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener("click", () => {
                const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
                navToggle.setAttribute("aria-expanded", !isExpanded);
                navMenu.classList.toggle("active");
            });
        }

        // Smooth scroll to sections
        navLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const targetId = link.getAttribute("href");
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    isScrolling = true;

                    // Close mobile menu
                    if (navMenu.classList.contains("active")) {
                        navMenu.classList.remove("active");
                        navToggle.setAttribute("aria-expanded", "false");
                    }

                    // Smooth scroll
                    targetSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });

                    setTimeout(() => {
                        isScrolling = false;
                    }, 1000);
                }
            });
        });

        // Update active nav link on scroll
        const updateActiveNavLink = () => {
            const sections = document.querySelectorAll(".section, .hero");
            let currentSection = "";

            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;

                if (window.pageYOffset >= sectionTop - 200) {
                    currentSection = section.getAttribute("id");
                }
            });

            navLinks.forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${currentSection}`) {
                    link.classList.add("active");
                }
            });
        };

        window.addEventListener("scroll", debounce(updateActiveNavLink, 50));
    };

    // ===================
    // SCROLL ANIMATIONS
    // ===================

    const initScrollAnimations = () => {
        const animatedElements = document.querySelectorAll(
            ".pillar, .feature, .ecosystem-card, .impact-card, .service-card, .timeline-item"
        );

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = "1";
                            entry.target.style.transform = "translateY(0)";
                        }, index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            }
        );

        animatedElements.forEach((el) => {
            el.style.opacity = "0";
            el.style.transform = "translateY(30px)";
            el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            observer.observe(el);
        });
    };

    // ===================
    // HERO NETWORK ANIMATION
    // ===================

    const initHeroNetwork = () => {
        const heroNetwork = document.querySelector(".hero__network");

        if (!heroNetwork) return;

        // Create canvas for network animation
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        heroNetwork.appendChild(canvas);

        let particles = [];
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = heroNetwork.offsetWidth;
            canvas.height = heroNetwork.offsetHeight;
        };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(65, 105, 225, 0.5)"; // Modified to ensure blue matches theme
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000);

            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const connectParticles = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(65, 105, 225, ${0.2 * (1 - distance / 120)
                            })`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            connectParticles();

            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        initParticles();
        animate();

        window.addEventListener(
            "resize",
            debounce(() => {
                resizeCanvas();
                initParticles();
            }, 250)
        );

        // Cleanup on page unload
        window.addEventListener("beforeunload", () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        });
    };

    // ===================
    // MODAL FUNCTIONALITY
    // ===================

    const initModal = () => {
        const modal = document.getElementById("contactModal");
        const openBtn = document.getElementById("requestSessionBtn");
        const closeBtn = modal?.querySelector(".modal__close");
        const overlay = modal?.querySelector(".modal__overlay");
        const form = document.getElementById("contactForm");

        const openModal = () => {
            modal.classList.add("active");
            document.body.style.overflow = "hidden";
            modal.querySelector("input")?.focus();
        };

        const closeModal = () => {
            modal.classList.remove("active");
            document.body.style.overflow = "";
        };

        openBtn?.addEventListener("click", openModal);
        closeBtn?.addEventListener("click", closeModal);
        overlay?.addEventListener("click", closeModal);

        // Close on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("active")) {
                closeModal();
            }
        });

        // Form submission
        form?.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            console.log("Form submitted:", data);

            alert(
                "Thank you for your message! We will encourage you to join our network!"
            );

            form.reset();
            closeModal();
        });
    };

    const renderReviews = () => {
        const reviewsGrid = document.getElementById("reviewsGrid");
        if (!reviewsGrid || !content[currentLang].reviews) return;

        // Note: Reviews data is currently only in content.en.reviews for actual data
        // but we use the current language's title/subtitle via data-i18n in HTML
        const reviewsData = content.en.reviews; // Use English data as source of truth for raw reviews

        reviewsGrid.innerHTML = reviewsData.map(review => `
            <div class="review-card">
                <div class="review-card__stars">
                    ${'★'.repeat(review.stars)}${'☆'.repeat(5 - review.stars)}
                </div>
                <p class="review-card__text">"${review.text}"</p>
                <p class="review-card__author">- ${review.author}</p>
            </div>
        `).join('');
    };

    // ===================
    // UTILITY FUNCTIONS
    // ===================

    const updateCurrentYear = () => {
        const yearElement = document.getElementById("currentYear");
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    };

    // ===================
    // PERFORMANCE OPTIMIZATION
    // ===================

    const optimizePerformance = () => {
        // Lazy load images
        if ("loading" in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach((img) => {
                img.src = img.dataset.src || img.src;
            });
        } else {
            // Fallback for browsers that don't support lazy loading
            const script = document.createElement("script");
            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js";
            document.body.appendChild(script);
        }
    };

    // ===================
    // ACCESSIBILITY ENHANCEMENTS
    // ===================

    const enhanceAccessibility = () => {
        // Skip to main content link
        const skipLink = document.createElement("a");
        skipLink.href = "#hero";
        skipLink.className = "sr-only";
        skipLink.textContent = "Skip to main content";
        skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: #4169E1;
      color: white;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    `;

        skipLink.addEventListener("focus", () => {
            skipLink.style.top = "0";
        });

        skipLink.addEventListener("blur", () => {
            skipLink.style.top = "-40px";
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Announce page changes for screen readers
        const announcer = document.createElement("div");
        announcer.setAttribute("role", "status");
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.className = "sr-only";
        document.body.appendChild(announcer);

        window.announceForScreenReader = (message) => {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = "";
            }, 1000);
        };
    };

    // ===================
    // INITIALIZATION
    // ===================

    const init = () => {
        // Wait for DOM to be fully loaded
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
            return;
        }

        // Initialize all features
        initI18n();
        initNavigation();
        initScrollAnimations();
        initHeroNetwork();
        initModal();
        renderReviews();
        updateCurrentYear();
        optimizePerformance();
        enhanceAccessibility();

        // Update reviews when language changes
        const originalUpdateContent = updateContent;
        window.updateContent = (lang) => {
            originalUpdateContent(lang);
            renderReviews();
        };

        // Remove no-js class if present
        document.documentElement.classList.remove("no-js");

        // Add loaded class for CSS animations
        setTimeout(() => {
            document.body.classList.add("loaded");
        }, 100);

        console.log("Truthfulness Center website initialized successfully");
    };

    // Start initialization
    init();
})();
