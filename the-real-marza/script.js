document.addEventListener('DOMContentLoaded', () => {
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
        });
    }

    // 1. Smooth Scrolling for anchors
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            
            if(targetSection) {
                e.preventDefault();
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. Scroll Animations (Intersection Observer)
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // If the element contains counters, animate them
                const counters = entry.target.querySelectorAll('.counter');
                if (counters.length > 0) {
                    counters.forEach(counter => animateCounter(counter));
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // 3. Navbar style change on scroll
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 15, 19, 0.95)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            header.style.background = 'rgba(15, 15, 19, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    // 4. Counter Animation logic
    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current).toLocaleString('it-IT');
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target.toLocaleString('it-IT') + (target > 1000 ? '+' : '');
            }
        };
        updateCounter();
    }

    // 5. Twitch Chat Toggle Logic
    const toggleChatBtn = document.getElementById('toggle-chat-btn');
    const twitchChat = document.querySelector('.twitch-chat');
    
    if(toggleChatBtn && twitchChat) {
        toggleChatBtn.addEventListener('click', () => {
            if (twitchChat.style.display === 'none') {
                twitchChat.style.display = 'block';
                toggleChatBtn.innerHTML = '<i class="fa-solid fa-comment-slash"></i> Nascondi Chat';
            } else {
                twitchChat.style.display = 'none';
                toggleChatBtn.innerHTML = '<i class="fa-solid fa-comment"></i> Mostra Chat';
            }
        });
    }
});
