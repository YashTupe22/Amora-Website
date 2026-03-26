/* =============================================
   AMORA CAFE — MAIN SCRIPT
   Loading, Navigation, Menu Rendering, Animations
   ============================================= */

(function() {
    'use strict';

    // ==========================================
    // LOADING SCREEN
    // ==========================================
    function initLoading() {
        const loader = document.getElementById('loading-screen');
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.remove('no-scroll');
                // Trigger initial reveal animations
                setTimeout(triggerRevealAnimations, 100);
            }, 2200);
        });

        // Fallback — hide loader after 4s even if load event is slow
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        }, 4000);

        // Prevent scrolling during loading
        document.body.classList.add('no-scroll');
    }

    // ==========================================
    // NAVBAR
    // ==========================================
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('nav-links');
        const allNavLinks = document.querySelectorAll('.nav-link');

        // Scroll effect — transparent to solid
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            lastScroll = scrollY;

            // Update active nav link based on scroll position
            updateActiveNavLink();
        }, { passive: true });

        // Hamburger toggle
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close mobile nav on link click
        allNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // Update active nav link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // ==========================================
    // SMOOTH SCROLL
    // ==========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offset = 70; // navbar height
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ==========================================
    // SCROLL REVEAL ANIMATIONS
    // ==========================================
    function initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    }

    function triggerRevealAnimations() {
        // Re-observe all reveal elements
        initScrollReveal();
    }

    // ==========================================
    // MENU RENDERING
    // ==========================================
    let menuData = null;
    let activeCategory = 'all';

    async function initMenu() {
        try {
            const menuPaths = ['data/menu.json', './data/menu.json', '/data/menu.json'];
            let response = null;

            for (const path of menuPaths) {
                const res = await fetch(path);
                if (res.ok) {
                    response = res;
                    break;
                }
            }

            if (!response) {
                throw new Error('Menu JSON could not be loaded from known paths');
            }

            menuData = await response.json();
            renderCategoryPills();
            renderMenuItems('all');
            renderSpecials();

            const menuSection = document.getElementById('menu');
            if (menuSection) {
                menuSection.classList.add('visible');
            }
        } catch (err) {
            console.error('Failed to load menu:', err);
            const container = document.getElementById('menu-grid');
            if (container) {
                container.innerHTML = `<div class="menu-empty"><p>Menu is loading. Please refresh once.</p></div>`;
            }
        }
    }

    function renderCategoryPills() {
        const container = document.getElementById('category-pills');
        if (!container || !menuData) return;

        // "All" pill
        let html = `<button class="category-pill active" data-category="all">
            <span class="category-pill-icon">🍴</span> All
        </button>`;

        menuData.categories.forEach(cat => {
            html += `<button class="category-pill" data-category="${cat.id}">
                <span class="category-pill-icon">${cat.icon}</span> ${cat.name}
            </button>`;
        });

        container.innerHTML = html;

        // Bind click events
        container.querySelectorAll('.category-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const cat = pill.dataset.category;
                activeCategory = cat;

                // Update active state
                container.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                renderMenuItems(cat);
            });
        });
    }

    function renderMenuItems(category) {
        const container = document.getElementById('menu-grid');
        if (!container || !menuData) return;

        const items = category === 'all' 
            ? menuData.items 
            : menuData.items.filter(item => item.category === category);

        if (items.length === 0) {
            container.innerHTML = `<div class="menu-empty"><p>No items in this category</p></div>`;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="menu-card" data-id="${item.id}">
                <div class="menu-card-image-wrap">
                    <img src="${item.image}" alt="${item.name}" class="menu-card-image" loading="lazy">
                    <div class="menu-card-veg">
                        <span class="veg-indicator ${item.isVeg ? '' : 'non-veg'}"></span>
                    </div>
                    <div class="menu-card-price-tag">₹${item.price}</div>
                </div>
                <div class="menu-card-body">
                    <h3 class="menu-card-name">${item.name}</h3>
                    <p class="menu-card-desc">${item.description}</p>
                    <div class="menu-card-footer">
                        <button class="menu-add-btn" onclick="addToCartFromMenu(${item.id})" id="menu-btn-${item.id}">
                            Add
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Global function for add to cart from menu cards
    window.addToCartFromMenu = function(itemId) {
        const item = menuData.items.find(i => i.id === itemId);
        if (!item) return;

        Cart.addItem(item);

        // Button feedback
        const btn = document.getElementById(`menu-btn-${itemId}`);
        if (btn) {
            btn.classList.add('added');
            btn.textContent = 'Added';
            setTimeout(() => {
                btn.classList.remove('added');
                btn.textContent = 'Add';
            }, 1500);
        }
    };

    // ==========================================
    // SPECIALS CAROUSEL
    // ==========================================
    function renderSpecials() {
        const container = document.getElementById('specials-carousel');
        if (!container || !menuData) return;

        const specials = menuData.items.filter(item => item.isSpecial);

        container.innerHTML = specials.map(item => `
            <div class="special-card">
                <div class="special-card-image-container">
                    <img src="${item.image}" alt="${item.name}" class="special-card-image" loading="lazy">
                    <span class="special-badge">Chef's Pick</span>
                </div>
                <div class="special-card-body">
                    <h3 class="special-card-name">${item.name}</h3>
                    <p class="special-card-desc">${item.description}</p>
                    <div class="special-card-footer">
                        <span class="special-card-price">₹${item.price}</span>
                        <button class="add-to-cart-btn" onclick="addToCartFromMenu(${item.id})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ==========================================
    // PARALLAX / SUBTLE EFFECTS
    // ==========================================
    function initParallax() {
        const heroBg = document.querySelector('.hero-bg-image');
        
        window.addEventListener('scroll', () => {
            if (!heroBg) return;
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroBg.style.transform = `scale(${1 + scrollY * 0.0002}) translate(-${scrollY * 0.01}%, -${scrollY * 0.01}%)`;
            }
        }, { passive: true });
    }

    // ==========================================
    // KEYBOARD SHORTCUTS
    // ==========================================
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC closes modals/drawers
            if (e.key === 'Escape') {
                Cart.toggleDrawer(false);
                Cart.closeModal();
                Cart.closeGeoModal();
                
                // Close mobile nav
                const hamburger = document.getElementById('hamburger');
                const navLinks = document.getElementById('nav-links');
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // ==========================================
    // INITIALIZE EVERYTHING
    // ==========================================
    function init() {
        initLoading();
        initNavbar();
        initSmoothScroll();
        initMenu();
        initParallax();
        initKeyboardShortcuts();
        
        // Slight delay for scroll reveal to kick in after loading
        setTimeout(initScrollReveal, 2500);
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
