const toggle = document.querySelector('.nav_toggle');
const menu = document.querySelector('.nav_menu');
const header = document.querySelector('.header');

function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
}

toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});
menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
    }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
    if (event.matches) closeMenu();
});
function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const links = document.querySelectorAll('.nav_link');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
            const active = link.hash === `#${entry.target.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    });
}, { rootMargin: '-30% 0px -45% 0px' });
document.querySelectorAll('main section').forEach((section) => observer.observe(section));

const logo = document.querySelector('.nav_logo');
const logoSuffix = logo.querySelector('.logo_suffix');
const logoNames = ['Smiles', 'Soluction', 'Ideias', 'App'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let logoIndex = 0;
let logoTimer;
let logoRunning = false;

function changeLogo(nextIndex) {
    logo.classList.add('is-closing');
    logoTimer = window.setTimeout(() => {
        logoIndex = nextIndex;
        logoSuffix.textContent = logoNames[logoIndex];
        logo.classList.remove('is-closing');
        scheduleLogo();
    }, 320);
}

function scheduleLogo() {
    logoTimer = window.setTimeout(() => {
        changeLogo((logoIndex + 1) % logoNames.length);
    }, 4000);
}

function updateLogoLoop() {
    const shouldRun = !reducedMotion.matches && !document.hidden;
    if (shouldRun === logoRunning) return;
    logoRunning = shouldRun;
    window.clearTimeout(logoTimer);
    if (shouldRun) {
        logo.classList.remove('is-closing');
        scheduleLogo();
    } else {
        logoIndex = 0;
        logoSuffix.textContent = logoNames[0];
        logo.classList.remove('is-closing');
    }
}

reducedMotion.addEventListener('change', updateLogoLoop);
document.addEventListener('visibilitychange', updateLogoLoop);
updateLogoLoop();
