const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

// Navbar scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Menu mobile toggle
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}