// AOS init
AOS.init({ duration: 900, once: true, offset: 60 });

// Mobile nav
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('hidden');
  });
}
document.querySelectorAll('.nav-link, .mobile-link').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
    mobileNav?.classList.add('hidden');
  });
});

// Vanta Waves background
let vantaEffect = null;
window.addEventListener('DOMContentLoaded', () => {
  const target = document.getElementById('vanta-bg');
  if (target && window.VANTA) {
    vantaEffect = window.VANTA.WAVES({
      el: target,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x0ea5e9,
      shininess: 35.0,
      waveHeight: 18.0,
      waveSpeed: 0.55,
      zoom: 0.95
    });
  }
});
window.addEventListener('beforeunload', () => { if (vantaEffect) vantaEffect.destroy(); });
