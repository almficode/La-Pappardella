/* ═══════════════════════════════════════════════════════════
   LA PAPPARDELLA — app.js
   ═══════════════════════════════════════════════════════════ */

const WINDOW_SIZE = 0.08;
const STATS_ENTER = 0.32;
const STATS_LEAVE = 0.56;

const scrollContainer = document.getElementById('scroll-container');

/* ─── Lenis Smooth Scroll ─── */
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ─── Hero parallax image ─── */
function initParallax() {
  const img = document.getElementById('hero-bg');
  if (!img) return;

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: self => {
      img.style.transform = `translateY(${self.progress * -14}%)`;
    }
  });
}

/* ─── Hero Fade ─── */
function initHeroFade() {
  const hero = document.getElementById('hero-overlay');
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: self => {
      const opacity = Math.max(0, 1 - self.progress / 0.14);
      hero.style.opacity = opacity;
      hero.style.pointerEvents = opacity > 0 ? '' : 'none';
    }
  });
}

/* ─── Dark Overlay (stats section) ─── */
function initDarkOverlay() {
  const overlay = document.getElementById('dark-overlay');
  const fadeRange = 0.04;
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.8,
    onUpdate: self => {
      const p = self.progress;
      let opacity = 0;
      if (p >= STATS_ENTER - fadeRange && p <= STATS_ENTER) {
        opacity = (p - (STATS_ENTER - fadeRange)) / fadeRange;
      } else if (p > STATS_ENTER && p < STATS_LEAVE) {
        opacity = 0.9;
      } else if (p >= STATS_LEAVE && p <= STATS_LEAVE + fadeRange) {
        opacity = 0.9 * (1 - (p - STATS_LEAVE) / fadeRange);
      }
      overlay.style.opacity = opacity;
    }
  });
}

/* ─── Scroll Sections ─── */
function setupSectionAnimation(section) {
  const type = section.dataset.animation;
  const persist = section.dataset.persist === 'true';
  const enter = parseFloat(section.dataset.enter) / 100;
  const leave = parseFloat(section.dataset.leave) / 100;
  const mid = (enter + leave) / 2;

  section.style.top = (mid * 360) + 'vh';
  section.style.transform = 'translateY(-50%)';

  const children = section.querySelectorAll(
    '.section-label, .section-heading, .section-body, .section-note, .section-cta, .cta-button, .stat, .cta-buttons, .quote-mark, .quote-text, .quote-author'
  );

  const tl = gsap.timeline({ paused: true });

  switch (type) {
    case 'fade-up':
      tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' });
      break;
    case 'scale-up':
      tl.from(children, { y: 40, scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: 'power2.out' });
      break;
    case 'rotate-in':
      tl.from(children, { y: 40, rotation: 3, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' });
      break;
    case 'stagger-up':
      tl.from(children, { y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' });
      break;
    case 'clip-reveal':
      tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.15, duration: 1.2, ease: 'power4.inOut' });
      break;
    case 'blur-up':
      tl.from(children, { y: 50, opacity: 0, filter: 'blur(8px)', stagger: 0.12, duration: 1.0, ease: 'power3.out' });
      break;
  }

  let animated = false;
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: false,
    onUpdate: self => {
      const p = self.progress;
      const inRange = p >= enter - WINDOW_SIZE && p <= leave + WINDOW_SIZE;
      if (inRange) {
        section.style.opacity = '1';
        section.style.pointerEvents = 'auto';
        if (!animated) { tl.play(); animated = true; }
      } else if (!persist) {
        section.style.opacity = '0';
        section.style.pointerEvents = 'none';
        if (animated) { tl.reverse(); animated = false; }
      }
    }
  });
}

/* ─── Counter Animations ─── */
function initCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || '0');
    const proxy = { val: 0 };
    gsap.fromTo(proxy, { val: 0 }, {
      val: target, duration: 2, ease: 'power2.out',
      onUpdate() { el.textContent = decimals > 0 ? proxy.val.toFixed(decimals) : Math.round(proxy.val); },
      onComplete() { el.textContent = decimals > 0 ? target.toFixed(decimals) : target; },
      scrollTrigger: { trigger: el.closest('.scroll-section'), start: 'top 80%', toggleActions: 'play none none reset' }
    });
  });
}

/* ─── Header scroll state ─── */
function initHeader() {
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ─── Burger menu ─── */
function initBurger() {
  const burger = document.getElementById('nav-burger');
  const mobile = document.getElementById('nav-mobile');
  const closeBtn = document.getElementById('nav-mobile-close');
  const closeMobile = () => mobile?.classList.remove('is-open');
  burger?.addEventListener('click', () => mobile?.classList.toggle('is-open'));
  closeBtn?.addEventListener('click', closeMobile);
  mobile?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
}

/* ─── IntersectionObserver Reveals ─── */
function initRevealObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal-up, .reveal-from-left').forEach(el => observer.observe(el));
}

/* ─── Historia: GSAP word animations + collage + story modals ─── */
function initHistoria() {
  const section = document.getElementById('historia-section');
  if (!section) return;

  const words = section.querySelectorAll('.hist-w');
  const label = section.querySelector('.hist-label');
  const body  = section.querySelector('.hist-body');
  const stats = section.querySelector('.hist-stats');
  const cta   = section.querySelector('.hist-cta');
  const hint  = section.querySelector('.hist-photos-hint');
  const photo1 = section.querySelector('.hist-photo-1');
  const photo2 = section.querySelector('.hist-photo-2');
  const photo3 = section.querySelector('.hist-photo-3');
  const badge  = section.querySelector('.hist-year-badge');

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top 75%', once: true }
  });

  tl.to(label, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);

  const dirs = { up: { y: 70, x: 0 }, down: { y: -50, x: 0 }, left: { x: -80, y: 20 }, right: { x: 80, y: 20 } };
  words.forEach((w, i) => {
    const dir = w.dataset.dir || 'up';
    const from = dirs[dir];
    tl.fromTo(w,
      { opacity: 0, x: from.x, y: from.y, rotation: (i % 2 === 0 ? 4 : -3) },
      { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.75, ease: 'power3.out' },
      0.15 + i * 0.09
    );
  });

  tl.to(body,  { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.55);
  tl.to(stats, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.7);
  tl.to(cta,   { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.85);

  if (photo1) tl.fromTo(photo1, { opacity: 0, x: 140, y: -60, rotation: 5 },  { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.1, ease: 'power3.out' }, 0.3);
  if (photo2) tl.fromTo(photo2, { opacity: 0, x: 80,  y: 120, rotation: -4 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.0, ease: 'power3.out' }, 0.5);
  if (photo3) tl.fromTo(photo3, { opacity: 0, x: -100, y: 80, rotation: 6 },  { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.05, ease: 'power3.out' }, 0.65);
  if (badge)  tl.to(badge, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)' }, 1.0);
  tl.call(() => hint?.classList.add('visible'), [], 1.5);

  // Story data
  const stories = {
    fachada: {
      num: 'Capítulo 01', img: 'Portada 2.jpg',
      content: `<h3>El lugar donde<br><em>todo comenzó</em></h3>
        <p>Puerto Calero, Lanzarote. Cuando abrimos las puertas de La Pappardella por primera vez, sabíamos que habíamos encontrado algo único: un rincón del Atlántico con la misma luz dorada que baña las calles de Nápoles al atardecer.</p>
        <p>La fachada se ha convertido en un punto de encuentro del puerto. Las noches de verano, cuando las luces se reflejan en el agua y los veleros mecen suavemente, es imposible no detenerse y respirar profundo.</p>
        <p>Más de 25 años de historia comienzan aquí, en esta puerta que siempre está abierta.</p>`
    },
    terraza: {
      num: 'Capítulo 02', img: 'Captura de pantalla 2026-06-24 a las 11.18.13.png',
      content: `<h3>La terraza<br><em>frente al mar</em></h3>
        <p>Cenar en nuestra terraza es una de esas experiencias que se recuerdan para siempre. El Puerto Calero se despliega ante tus ojos: veleros blancos, palmeras inclinadas por la brisa, y el rumor constante del Atlántico.</p>
        <p>Al atardecer, cuando el sol se hunde en el océano y el cielo se tiñe de naranja y dorado, la terraza de La Pappardella se convierte en el mejor palco del mundo.</p>
        <p>Reserva con antelación — siempre se llena primero.</p>`
    },
    cocina: {
      num: 'Capítulo 03', img: 'Captura de pantalla 2026-06-24 a las 11.19.09.png',
      content: `<h3>La cocina que<br><em>inspira cada plato</em></h3>
        <p>En La Pappardella, cada plato es el resultado de años de dedicación a la cocina italiana. Seleccionamos los mejores ingredientes de temporada, los mariscos más frescos del Atlántico y recetas que hablan de auténtica tradición.</p>
        <p>El nombre del restaurante lo dice todo: las pappardelle son el símbolo de una cocina que se toma en serio, que no tiene prisa, que pone el sabor por encima de todo. Eso es lo que encontrarás en cada mesa.</p>`
    }
  };

  const backdrop = document.getElementById('story-backdrop');
  const modal    = document.getElementById('story-modal');
  const closeBtn = document.getElementById('story-close');
  const chapterNum     = document.getElementById('story-chapter-num');
  const chapterContent = document.getElementById('story-chapter');
  const modalImg       = document.getElementById('story-modal-img');

  function openStory(key) {
    const s = stories[key]; if (!s) return;
    chapterNum.textContent = s.num;
    chapterContent.innerHTML = s.content;
    modalImg.innerHTML = `<img src="${s.img}" alt="" />`;
    backdrop.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeStory() {
    backdrop.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  section.querySelectorAll('.hist-photo').forEach(photo => {
    photo.addEventListener('click', () => openStory(photo.dataset.story));
    photo.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openStory(photo.dataset.story); });
  });
  closeBtn?.addEventListener('click', closeStory);
  backdrop?.addEventListener('click', closeStory);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) closeStory();
  });
}

/* ─── Carta: slide panel from right + dishes appear ─── */
function initCarta() {
  const cartaSection = document.getElementById('menu-section');
  const cartaPanel   = document.getElementById('carta-panel');
  if (!cartaSection || !cartaPanel) return;

  if (window.innerWidth <= 768) {
    cartaPanel.style.transform = 'none';
    // Build infinite marquee with all 8 cards
    const grid = document.getElementById('carta-focus-grid');
    if (grid) {
      const cards = Array.from(grid.querySelectorAll('.carta-focus-card'));
      const track = document.createElement('div');
      track.className = 'carta-marquee-track';
      cards.forEach(c => track.appendChild(c));
      cards.forEach(c => { const cl = c.cloneNode(true); track.appendChild(cl); });
      grid.appendChild(track);
    }
    return;
  }

  // Scroll-driven slide: starts when section enters from bottom, completes at top of viewport
  gsap.fromTo(cartaPanel,
    { x: '100%' },
    {
      x: '0%',
      ease: 'none',
      scrollTrigger: {
        trigger: cartaSection,
        start: 'top 85%',
        end:   'top 5%',
        scrub: 1.2,
      }
    }
  );

  // FocusCards: blur siblings on hover
  const grid  = document.getElementById('carta-focus-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.carta-focus-card');

  grid.addEventListener('mouseleave', () => {
    cards.forEach(c => c.classList.remove('cf-focused'));
  });
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      cards.forEach(c => c.classList.toggle('cf-focused', c === card));
    });
  });
}

// ─────────────────────────────────────────────────────

function initCartaShowcase() {
  const DISHES = [
    { cat: 'Pasta · Mar',          name: 'Spaghetti alle Vongole', desc: 'Almejas del Atlántico, vino blanco, ajo, guindilla',    tag: 'Clásico de la casa', img: 'Captura de pantalla 2026-06-24 a las 11.14.26.png' },
    { cat: 'Pasta · Tierra',       name: 'Pappardelle al Ragù',    desc: 'Ragù de ternera 48 horas, Parmigiano Reggiano',          tag: 'Especialidad',       img: 'Captura de pantalla 2026-06-24 a las 11.19.09.png' },
    { cat: 'Pasta · Cremosa',      name: 'Tagliatelle alla Crema', desc: 'Crema de trufa, setas silvestres, Parmigiano',           tag: 'Temporada',          img: 'Captura de pantalla 2026-06-24 a las 11.18.56.png' },
    { cat: 'Pizza · Horno leña',   name: 'Pizza della Casa',       desc: 'Masa madre 72h, tomate San Marzano, bufala',             tag: 'Horno de leña',      img: 'Captura de pantalla 2026-06-24 a las 11.17.53.png' },
    { cat: 'Mar · Cazuela',        name: 'Gambas al Ajillo',       desc: 'Gambas frescas del Atlántico, AOVE, guindilla',          tag: 'Del mercado',        img: 'Captura de pantalla 2026-06-24 a las 11.18.46.png' },
    { cat: 'Arroces · Especialidad', name: 'Paella de Marisco',    desc: 'Langostinos, mejillones, calamar, azafrán',              tag: 'Para compartir',     img: 'Captura de pantalla 2026-06-24 a las 11.18.27.png' },
    { cat: 'Mar · Brasa',          name: 'Pulpo a la Brasa',       desc: 'Pulpo atlántico, patatas confitadas, pimentón',          tag: 'Tierra y mar',       img: 'Captura de pantalla 2026-06-24 a las 11.14.55.png' },
    { cat: 'Postres · Tradición',  name: 'Tiramisú della Casa',    desc: 'Mascarpone artesanal, espresso napolitano',              tag: 'Imprescindible',     img: 'Captura de pantalla 2026-06-24 a las 11.22.38.png' },
  ];
  const N = DISHES.length;

  const cartaSection = document.getElementById('menu-section');
  const cartaPanel   = document.getElementById('carta-panel');
  const stack        = document.getElementById('carta-img-stack');
  if (!cartaSection || !cartaPanel || !stack) return;

  if (window.innerWidth <= 768) {
    cartaPanel.style.transform = 'none';
    return;
  }

  // Stack visual config per depth slot
  const CFG = [
    { yPct: -50, rot: 0,  scale: 1,    z: 50, alpha: 1    }, // front
    { yPct: -44, rot: -5, scale: 0.96, z: 40, alpha: 0.88 },
    { yPct: -38, rot:  5, scale: 0.92, z: 30, alpha: 0.76 },
    { yPct: -32, rot: -3, scale: 0.88, z: 20, alpha: 0    },
    { yPct: -26, rot:  3, scale: 0.84, z: 10, alpha: 0    },
  ];

  // Build image cards (all hidden initially)
  const cards = DISHES.map(d => {
    const el = document.createElement('div');
    el.className = 'carta-stack-card';
    el.innerHTML = `<img src="${d.img}" alt="${d.name}" loading="lazy" />`;
    stack.appendChild(el);
    return el;
  });

  let active = 0;
  let busy   = false;

  function getSlot(i) {
    return ((i - active) % N + N) % N;
  }

  function placeCard(card, i, animate) {
    const s = getSlot(i);
    if (s >= CFG.length) {
      gsap.set(card, { autoAlpha: 0, zIndex: 0 });
      return;
    }
    const c = CFG[s];
    const props = { xPercent: -50, yPercent: c.yPct, rotation: c.rot, scale: c.scale, zIndex: c.z, autoAlpha: c.alpha };
    if (animate) gsap.to(card, { ...props, duration: 0.45, ease: 'power2.out' });
    else         gsap.set(card, props);
  }

  function updateInfo(animate) {
    const d = DISHES[active];
    const map = {
      'cd-cat': d.cat, 'cd-name': d.name,
      'cd-desc': d.desc, 'cd-tag': d.tag,
      'carta-curr': String(active + 1).padStart(2, '0'),
    };
    const entries = Object.entries(map);
    const els = entries.map(([id]) => document.getElementById(id));
    if (!animate) {
      entries.forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
      return;
    }
    gsap.to(els.filter(Boolean), {
      y: -10, opacity: 0, duration: 0.18, ease: 'power2.in',
      onComplete() {
        entries.forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
        gsap.fromTo(els.filter(Boolean), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.045, ease: 'power2.out' });
      }
    });
  }

  function go(dir) {
    if (busy) return;
    busy = true;
    const prev  = active;
    const front = cards[prev];

    gsap.to(front, {
      xPercent: dir > 0 ? -140 : 40,
      yPercent: -80,
      rotation: dir > 0 ? -20 : 20,
      autoAlpha: 0,
      duration: 0.32,
      ease: 'power2.in',
      onComplete() {
        active = (prev + dir + N) % N;

        // Reset exited card to its new position in the stack (instantly)
        const newSlot = getSlot(prev);
        if (newSlot < CFG.length) {
          const c = CFG[newSlot];
          gsap.set(front, { xPercent: -50, yPercent: c.yPct, rotation: c.rot, scale: c.scale, zIndex: c.z, autoAlpha: c.alpha });
        } else {
          gsap.set(front, { autoAlpha: 0, zIndex: 0 });
        }

        // Animate remaining cards to new positions
        cards.forEach((card, i) => { if (i !== prev) placeCard(card, i, true); });
        updateInfo(true);
        setTimeout(() => { busy = false; }, 460);
      }
    });
  }

  document.getElementById('carta-next')?.addEventListener('click', () => go(1));
  document.getElementById('carta-prev')?.addEventListener('click', () => go(-1));

  // Touch swipe
  let tx = 0;
  stack.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  stack.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  }, { passive: true });

  // Panel entrance (slower, waits until 20% visible)
  let entered = false;
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !entered) {
      entered = true;
      // Place cards inside the off-screen panel before it slides in
      cards.forEach((c, i) => placeCard(c, i, false));
      updateInfo(false);
      // Slide panel in — slower (1.8s) with 0.2s delay
      gsap.to(cartaPanel, { x: '0%', duration: 1.8, ease: 'power3.out', delay: 0.2 });
    }
  }, { threshold: 0.2 }).observe(cartaSection);

  // Auto-advance every 5s, pause on hover
  let auto = setInterval(() => go(1), 5000);
  const showcase = document.querySelector('.carta-showcase');
  showcase?.addEventListener('mouseenter', () => clearInterval(auto));
  showcase?.addEventListener('mouseleave', () => { auto = setInterval(() => go(1), 5000); });
}

/* ─── FAQ Accordion ─── */
/* ─── Reviews: arbitrary floating cards ─── */
function initReviews() {
  const wrap  = document.getElementById('reviews-float');
  if (!wrap) return;
  // On mobile: infinite marquee — duplicate cards into a track, CSS animates
  if (window.innerWidth <= 768) {
    const cards = Array.from(wrap.querySelectorAll('.review-card'));
    const track = document.createElement('div');
    track.className = 'reviews-marquee-track';
    cards.forEach(c => { c.style.opacity = '1'; track.appendChild(c); });
    cards.forEach(c => { const clone = c.cloneNode(true); track.appendChild(clone); });
    wrap.appendChild(track);
    return;
  }
  // Desktop: 2-row marquee (row1 left, row2 right)
  const cards = Array.from(wrap.querySelectorAll('.review-card'));
  if (!cards.length) return;

  const half = Math.ceil(cards.length / 2);
  const row1cards = cards.slice(0, half);
  const row2cards = cards.slice(half);

  function makeRow(items, reverse) {
    const row = document.createElement('div');
    row.className = 'reviews-row' + (reverse ? ' reviews-row--reverse' : '');
    const track = document.createElement('div');
    track.className = 'reviews-row-track';
    items.forEach(c => { c.style.opacity = '1'; track.appendChild(c); });
    items.forEach(c => { track.appendChild(c.cloneNode(true)); });
    row.appendChild(track);
    return row;
  }

  wrap.appendChild(makeRow(row1cards, false));
  wrap.appendChild(makeRow(row2cards, true));
}

function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

/* ─── Galería Modal ─── */
function initGaleria() {
  const modal    = document.getElementById('galeria-modal');
  const backdrop = document.getElementById('galeria-backdrop');
  const closeBtn = document.getElementById('galeria-close');

  // Duplicate each track so the marquee loops seamlessly
  ['gal-track-1', 'gal-track-2'].forEach(id => {
    const track = document.getElementById(id);
    if (!track) return;
    const items = Array.from(track.children);
    items.forEach(item => track.appendChild(item.cloneNode(true)));
  });

  function openGaleria(e) { e.preventDefault(); modal.classList.add('active'); backdrop.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeGaleria() { modal.classList.remove('active'); backdrop.classList.remove('active'); document.body.style.overflow = ''; }

  document.getElementById('experiencia-nav-btn')?.addEventListener('click', openGaleria);
  document.getElementById('experiencia-mobile-btn')?.addEventListener('click', openGaleria);
  closeBtn?.addEventListener('click', closeGaleria);
  backdrop?.addEventListener('click', closeGaleria);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal?.classList.contains('active')) closeGaleria(); });
}

/* ─── AI Assistant ─── */
const RESTAURANT_CONTEXT = `Eres el asistente virtual de La Pappardella, restaurante italiano en Puerto Calero, Lanzarote. Teléfono: +34 928 513 614. Horarios: todos los días 12:30-15:30h y 18:30-23:00h. Especialidades: Pappardelle al Ragù (48h), Spaghetti alle Vongole, mariscos frescos del Atlántico. Vinos: DO Lanzarote (Malvasía volcánica) e italianos (Barolo, Brunello, Chianti). Más de 25 años en Lanzarote. Responde en el idioma del usuario. Sé cálido y conciso (máx 3 párrafos).`;

const LOCAL_REPLIES = {
  reserva:      'Para reservar mesa en La Pappardella, llama directamente al **+34 928 513 614**. Recomendamos reservar con antelación, especialmente la terraza con vistas al puerto. ¡Te esperamos!',
  horario:      'Estamos abiertos **todos los días**: Almuerzo 12:30–15:30h · Cena 18:30–23:00h. En temporada alta podemos ampliar horarios.',
  especialidad: 'Nuestra joya son las **Pappardelle al Ragù** — ragù de ternera cocinado 48 horas. También destacan los Spaghetti alle Vongole con almejas del Atlántico y la Pizza della Casa del horno de leña.',
  vegetariano:  'Sí, disponemos de opciones vegetarianas y pasta sin gluten bajo petición previa. Consúltenos al reservar.',
  donde:        'Estamos en el **Puerto Calero, Lanzarote**, en el pintoresco puerto deportivo. Fácil acceso en coche o taxi desde toda la isla.',
  vino:         'Nuestra carta incluye los únicos **vinos volcánicos de Lanzarote** (Malvasía DO Lanzarote) y una selección italiana: Barolo, Brunello, Chianti Classico y espumosos Franciacorta.',
  precio:       'Platos principales desde 14€. Carta de vinos con opciones para todos los presupuestos. Consúltanos para menús de grupo.',
  pasta:        'Nuestra pasta es **100% artesanal**, elaborada cada mañana por nuestro chef con harina italiana tipo "00" y huevos frescos. Ven y nota la diferencia.',
  historia:     'La Pappardella lleva más de **25 años** en Puerto Calero. Nacimos de la pasión por traer la autenticidad italiana al rincón más fascinante del Atlántico, Lanzarote.'
};

function getLocalReply(text) {
  const t = text.toLowerCase();
  if (t.match(/reserv|mesa|booking/))           return LOCAL_REPLIES.reserva;
  if (t.match(/horario|hora|abierto|cuando/))   return LOCAL_REPLIES.horario;
  if (t.match(/especialidad|mejor|recomend/))   return LOCAL_REPLIES.especialidad;
  if (t.match(/vegetar|celiac|gluten|alergi/))  return LOCAL_REPLIES.vegetariano;
  if (t.match(/donde|ubicac|direcc|llegar/))    return LOCAL_REPLIES.donde;
  if (t.match(/vino|bebida|maridaje/))          return LOCAL_REPLIES.vino;
  if (t.match(/precio|cost|caro|cuanto/))       return LOCAL_REPLIES.precio;
  if (t.match(/pasta|pappardelle|artesanal/))   return LOCAL_REPLIES.pasta;
  if (t.match(/historia|origen|años|fundac/))   return LOCAL_REPLIES.historia;
  return null;
}

async function sendToAI(message, apiKey) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 400, system: RESTAURANT_CONTEXT, messages: [{ role: 'user', content: message }] })
  });
  if (!resp.ok) throw new Error('API error');
  return (await resp.json()).content[0].text;
}

function formatMarkdown(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

function initAI() {
  const orb      = document.getElementById('ai-orb');
  const modal    = document.getElementById('ai-modal');
  const backdrop = document.getElementById('ai-backdrop');
  const closeBtn = document.getElementById('ai-modal-close');
  const input    = document.getElementById('ai-input');
  const sendBtn  = document.getElementById('ai-send');
  const messages = document.getElementById('ai-messages');
  const chips    = document.getElementById('ai-chips');
  const apiKeyInput = document.getElementById('ai-api-key');

  const openModal  = () => { modal.classList.add('active'); backdrop.classList.add('active'); input?.focus(); };
  const closeModal = () => { modal.classList.remove('active'); backdrop.classList.remove('active'); };

  orb?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal(); });

  async function sendMessage(text) {
    if (!text?.trim()) return;
    if (chips) chips.style.display = 'none';

    const userRow = document.createElement('div');
    userRow.className = 'ai-msg-row user-row';
    userRow.innerHTML = `<div class="ai-msg ai-msg-user">${text}</div>`;
    messages.appendChild(userRow);

    const typingRow = document.createElement('div');
    typingRow.className = 'ai-msg-row bot-row';
    typingRow.innerHTML = `<div class="ai-avatar-sm">🍝</div><div class="ai-typing"><span></span><span></span><span></span></div>`;
    messages.appendChild(typingRow);
    messages.scrollTop = messages.scrollHeight;
    if (input) input.value = '';

    const local = getLocalReply(text);
    const key   = apiKeyInput?.value?.trim();
    let reply;

    if (key) {
      try { reply = await sendToAI(text, key); }
      catch { reply = local || 'Lo siento, hubo un error. Llama al **+34 928 513 614**.'; }
    } else {
      await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
      reply = local || 'Para una respuesta más personalizada introduce tu API key, o llama al **+34 928 513 614**. ¡Estaremos encantados!';
    }

    typingRow.remove();
    const botRow = document.createElement('div');
    botRow.className = 'ai-msg-row bot-row';
    botRow.innerHTML = `<div class="ai-avatar-sm">🍝</div><div class="ai-msg ai-msg-bot">${formatMarkdown(reply)}</div>`;
    messages.appendChild(botRow);
    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn?.addEventListener('click', () => sendMessage(input?.value));
  input?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); } });
  document.querySelectorAll('.ai-chip').forEach(chip => chip.addEventListener('click', () => sendMessage(chip.dataset.msg)));
}

/* ─── Custom Cursor ─── */
function initCursor() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  let rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  }, { passive: true });

  (function animateRing() {
    rx += (parseFloat(dot.style.left || 0) - rx) * 0.12;
    ry += (parseFloat(dot.style.top  || 0) - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width = '56px'; ring.style.height = '56px'; ring.style.borderColor = 'rgba(201,169,110,0.8)'; });
    el.addEventListener('mouseleave', () => { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.borderColor = 'rgba(201,169,110,0.5)'; });
  });
}

/* ─── Smooth anchor scroll ─── */
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    link.addEventListener('click', e => {
      const target = document.querySelector(id);
      if (target) { e.preventDefault(); lenis?.scrollTo(target, { offset: -80, duration: 1.4 }); }
    });
  });
}

/* ─── INIT ─── */
async function init() {
  gsap.registerPlugin(ScrollTrigger);

  // Brief branded loader, no frame loading needed
  const loader = document.getElementById('loader');
  setTimeout(() => {
    if (loader) { loader.style.opacity = '0'; setTimeout(() => { loader.style.display = 'none'; }, 500); }
  }, 900);

  initLenis();
  initParallax();
  initHeroFade();
  initDarkOverlay();
  initCounters();

  document.querySelectorAll('.scroll-section').forEach(setupSectionAnimation);

  initHeader();
  initBurger();
  initRevealObserver();
  initHistoria();
  initCarta();
  initReviews();
  initFAQ();
  initGaleria();
  initAI();
  initCursor();
  initI18n();
  setTimeout(initAnchorScroll, 100);
}

/* ═══ I18N — LANGUAGE SWITCHER ═══ */
const TRANSLATIONS = {
  es: {
    'nav.historia':'Historia','nav.carta':'Carta','nav.vinos':'Vinos','nav.experiencia':'Experiencia','nav.reservas':'Reservas','nav.cta':'Reservar Mesa',
    'hero.tagline':'Cocina italiana auténtica con vistas al océano Atlántico','hero.cta1':'Descubrir','hero.cta2':'Ver Carta','hero.scroll':'Scroll',
    's1.label':'001 / Origen','s1.heading':'La dolce vita<br><em>frente al</em><br>Atlántico','s1.body':'Veleros al atardecer, la brisa salada del Atlántico y el rumor eterno de un puerto en calma. Un rincón de Italia en el corazón de Lanzarote, a pocos pasos del mar.','s1.cta':'Reservar terraza →',
    'quote.text':'Cada plato que sale de nuestra cocina lleva el alma de Italia y el sabor del Atlántico.','quote.author':'— 25 años cocinando con pasión en Puerto Calero',
    's3.heading':'Comienza<br><em>la experiencia</em>','s3.body':'Descubre nuestra historia, carta y los sabores únicos de Lanzarote.','s3.btn1':'Nuestra historia','s3.btn2':'Ver la carta',
    'hist.label':'001 — Nuestra Historia',
    'hist.headline':'<span class="hist-w" data-dir="up">Una</span> <span class="hist-w" data-dir="left">historia</span> <span class="hist-w" data-dir="up">nacida</span><br><span class="hist-w" data-dir="right">entre</span> <span class="hist-w hist-italic" data-dir="down">volcanes</span><br><span class="hist-w" data-dir="left">y</span> <span class="hist-w" data-dir="up">olas</span>',
    'hist.body1':'Imagina aparcar, caminar hacia el puerto y sentarte en una terraza con los veleros a pocos metros. El aire huele a sal, la luz de Lanzarote lo baña todo de dorado y, de repente, el ritmo del día se detiene. Así empieza una cena en La Pappardella — antes de que llegue el primer plato, ya ha valido la pena el viaje.',
    'hist.body2':'Más de 25 años después, seguimos fieles a ese escenario: mariscos frescos del Atlántico, ingredientes de primera calidad y los mejores vinos — todo ello en el rincón más especial de Lanzarote.',
    'hist.cta1':'Explorar la carta','hist.cta2':'Reservar ya','hist.hint':'Pulsa las fotos para descubrir nuestra historia →',
    'hist.photo1':'La Fachada','hist.photo1.hint':'Ver historia →','hist.photo2':'La Terraza','hist.photo2.hint':'Ver historia →','hist.photo3':'La Cocina','hist.photo3.hint':'Ver historia →',
    'hist.badge.txt':'años',
    'pillar1.strong':'Del Atlántico','pillar1.p':'Mariscos traídos cada mañana del océano',
    'pillar2.strong':'Sabores Volcánicos','pillar2.p':'Vinos de Malvasía en picón negro',
    'pillar3.strong':'Tradición Italiana','pillar3.p':'Recetas italianas auténticas, elaboradas con dedicación',
    'pillar4.strong':'Luz Única','pillar4.p':'Reserva de la Biosfera UNESCO',
    'carta.eyebrow':'002 / Nuestra carta','carta.title':'Sabores<br>que<br><em>cuentan<br>historias</em>','carta.desc':'Ingredientes frescos del Atlántico, recetas italianas de temporada y lo mejor de la tierra y el mar.','carta.cta':'Menú Completo','carta.hint':'Descubre los platos →',
    'bridge.text':'El vino perfecto para cada plato',
    'vinos.eyebrow':'Bodega','vinos.heading':'Vinos nacidos<br><em>del volcán</em>','vinos.body':'Lanzarote produce uno de los vinos más singulares del mundo: la Malvasía volcánica, cultivada en hoyos excavados en picón negro para retener la humedad de la niebla atlántica. En La Pappardella, celebramos este tesoro local junto a una cuidada selección de los mejores vinos italianos.','vinos.btn':'Consultar carta de vinos',
    'reviews.eyebrow':'Lo que dicen','reviews.heading':'Experiencias<br><em>que perduran</em>','ta.badge':'Ver reseñas en TripAdvisor',
    'reserva.eyebrow':'Tu mesa te espera','reserva.heading':'Una noche en<br><em>La Pappardella</em>','reserva.body':'Reserva ahora y disfruta de la mejor cocina italiana con el Atlántico como telón de fondo. Cada visita, una historia que contar.','reserva.cta':'Llamar ahora','reserva.location':'📍 Puerto Calero, Lanzarote','reserva.hours':'🕐 Todos los días · 12:30–23:00h','reserva.social':'Síguenos',
    'faq.eyebrow':'FAQ','faq.heading':'Preguntas<br><em>frecuentes</em>',
    'faq.q1':'¿Es necesario reservar mesa?','faq.a1':'Recomendamos reservar, especialmente en temporada alta y fines de semana. Puedes llamarnos directamente al +34 928 513 614. Nuestra terraza con vistas al puerto tiene capacidad limitada.',
    'faq.q2':'¿Tienen opciones para celíacos o vegetarianos?','faq.a2':'Sí. Disponemos de pasta sin gluten bajo petición previa y una selección de platos vegetarianos. Consúltenos al reservar para preparar la mejor experiencia.',
    'faq.q3':'¿Cuáles son los horarios?','faq.a3':'Abrimos todos los días. Almuerzo: 12:30–15:30h. Cena: 18:30–23:00h. En temporada alta ampliamos horarios. Consulta disponibilidad llamando al restaurante.',
    'faq.q4':'¿Aceptan grupos y celebraciones?','faq.a4':'Por supuesto. Somos el lugar ideal para celebraciones privadas, cenas de empresa o grupos familiares. Podemos preparar menús especiales. Contacta con antelación.',
    'faq.q5':'¿Se puede comer con vistas al mar?','faq.a5':'Sí. Nuestra terraza está situada frente al puerto deportivo de Puerto Calero, con vistas directas a los veleros y al Atlántico. Es uno de los rincones más especiales de Lanzarote para disfrutar de una cena al aire libre.',
    'footer.nav':'Navegación','footer.contact':'Contacto','footer.legal':'Legal',
    'footer.tagline':'Auténtica cocina italiana en el corazón del Puerto Calero, Lanzarote.',
    'footer.aviso':'Aviso Legal','footer.privacidad':'Política de Privacidad','footer.cookies':'Política de Cookies',
    'footer.copyright':'© 2025 La Pappardella · Todos los derechos reservados','footer.location':'Puerto Calero, Lanzarote · Canarias',
  },
  en: {
    'nav.historia':'Our Story','nav.carta':'Menu','nav.vinos':'Wines','nav.experiencia':'Experience','nav.reservas':'Reservations','nav.cta':'Book a Table',
    'hero.tagline':'Authentic Italian cuisine overlooking the Atlantic Ocean','hero.cta1':'Discover','hero.cta2':'View Menu','hero.scroll':'Scroll',
    's1.label':'001 / Origins','s1.heading':'La dolce vita<br><em>by the</em><br>Atlantic','s1.body':'Sailboats at sunset, the salty Atlantic breeze and the gentle sound of a calm marina. A corner of Italy in the heart of Lanzarote, right by the sea.','s1.cta':'Book the terrace →',
    'quote.text':'Every dish that leaves our kitchen carries the soul of Italy and the flavour of the Atlantic.','quote.author':'— 25 years cooking with passion in Puerto Calero',
    's3.heading':'Begin<br><em>the experience</em>','s3.body':'Discover our story, menu and the unique flavours of Lanzarote.','s3.btn1':'Our story','s3.btn2':'View menu',
    'hist.label':'001 — Our Story',
    'hist.headline':'<span class="hist-w" data-dir="up">A</span> <span class="hist-w" data-dir="left">story</span> <span class="hist-w" data-dir="up">born</span><br><span class="hist-w" data-dir="right">between</span> <span class="hist-w hist-italic" data-dir="down">volcanoes</span><br><span class="hist-w" data-dir="left">and</span> <span class="hist-w" data-dir="up">waves</span>',
    'hist.body1':'Imagine parking the car, walking to the marina and sitting on a terrace with sailboats just metres away. The air smells of salt, Lanzarote\'s light turns everything golden and, suddenly, the pace of the day slows to a halt. That is how dinner at La Pappardella begins — before the first dish arrives, the journey has already been worth it.',
    'hist.body2':'Over 25 years later, we remain true to that setting: fresh seafood from the Atlantic, first-class ingredients and the finest wines — all in the most special corner of Lanzarote.',
    'hist.cta1':'Explore the menu','hist.cta2':'Book now','hist.hint':'Click the photos to discover our story →',
    'hist.photo1':'The Frontage','hist.photo1.hint':'See story →','hist.photo2':'The Terrace','hist.photo2.hint':'See story →','hist.photo3':'The Kitchen','hist.photo3.hint':'See story →',
    'hist.badge.txt':'years',
    'pillar1.strong':'From the Atlantic','pillar1.p':'Fresh seafood from the ocean every morning',
    'pillar2.strong':'Volcanic Flavours','pillar2.p':'Malvasia wines from black volcanic soil',
    'pillar3.strong':'Italian Tradition','pillar3.p':'Authentic Italian recipes, crafted with dedication',
    'pillar4.strong':'Unique Light','pillar4.p':'UNESCO Biosphere Reserve',
    'carta.eyebrow':'002 / Our Menu','carta.title':'Flavours<br>that<br><em>tell<br>stories</em>','carta.desc':'Fresh Atlantic seafood, seasonal Italian recipes and the finest ingredients from land and sea.','carta.cta':'Full Menu','carta.hint':'Discover the dishes →',
    'bridge.text':'The perfect wine for every dish',
    'vinos.eyebrow':'Wine Cellar','vinos.heading':'Wines born<br><em>from the volcano</em>','vinos.body':'Lanzarote produces one of the most singular wines in the world: the volcanic Malvasia, grown in pits dug into black cinder to retain the moisture of Atlantic mist. At La Pappardella, we celebrate this local treasure alongside a carefully curated selection of the finest Italian wines.','vinos.btn':'View wine list',
    'reviews.eyebrow':'What they say','reviews.heading':'Experiences<br><em>that last</em>','ta.badge':'Read reviews on TripAdvisor',
    'reserva.eyebrow':'Your table awaits','reserva.heading':'An evening at<br><em>La Pappardella</em>','reserva.body':'Book now and enjoy the finest Italian cuisine with the Atlantic as your backdrop. Every visit, a story to tell.','reserva.cta':'Call now','reserva.location':'📍 Puerto Calero, Lanzarote','reserva.hours':'🕐 Every day · 12:30–11:00pm','reserva.social':'Follow us',
    'faq.eyebrow':'FAQ','faq.heading':'Frequently<br><em>asked questions</em>',
    'faq.q1':'Do I need to book a table?','faq.a1':'We recommend booking, especially during high season and weekends. Call us directly on +34 928 513 614. Our terrace overlooking the marina has limited capacity.',
    'faq.q2':'Do you have options for coeliacs or vegetarians?','faq.a2':'Yes. We offer gluten-free pasta on request and a selection of vegetarian dishes. Let us know when booking so we can prepare the best experience.',
    'faq.q3':'What are your opening hours?','faq.a3':'We are open every day. Lunch: 12:30–3:30pm. Dinner: 6:30–11:00pm. During high season we may extend hours. Check availability by calling the restaurant.',
    'faq.q4':'Do you accept groups and celebrations?','faq.a4':'Absolutely. We are the ideal venue for private celebrations, corporate dinners or family groups. We can prepare special menus. Contact us in advance.',
    'faq.q5':'Can you dine with a sea view?','faq.a5':'Yes. Our terrace overlooks Puerto Calero marina, with direct views of the sailboats and the Atlantic. It is one of the most special spots in Lanzarote for an outdoor dinner.',
    'footer.nav':'Navigation','footer.contact':'Contact','footer.legal':'Legal',
    'footer.tagline':'Authentic Italian cuisine in the heart of Puerto Calero, Lanzarote.',
    'footer.aviso':'Legal Notice','footer.privacidad':'Privacy Policy','footer.cookies':'Cookie Policy',
    'footer.copyright':'© 2025 La Pappardella · All rights reserved','footer.location':'Puerto Calero, Lanzarote · Canary Islands',
  },
  fr: {
    'nav.historia':'Notre Histoire','nav.carta':'Menu','nav.vinos':'Vins','nav.experiencia':'Expérience','nav.reservas':'Réservations','nav.cta':'Réserver',
    'hero.tagline':'Cuisine italienne authentique avec vue sur l\'océan Atlantique','hero.cta1':'Découvrir','hero.cta2':'Voir le Menu','hero.scroll':'Scroll',
    's1.label':'001 / Origines','s1.heading':'La dolce vita<br><em>face à</em><br>l\'Atlantique','s1.body':'Voiliers au coucher du soleil, la brise salée de l\'Atlantique et le doux murmure d\'un port tranquille. Un coin d\'Italie au cœur de Lanzarote, face à la mer.','s1.cta':'Réserver la terrasse →',
    'quote.text':'Chaque plat qui sort de notre cuisine porte l\'âme de l\'Italie et la saveur de l\'Atlantique.','quote.author':'— 25 ans à cuisiner avec passion à Puerto Calero',
    's3.heading':'Commencez<br><em>l\'expérience</em>','s3.body':'Découvrez notre histoire, notre menu et les saveurs uniques de Lanzarote.','s3.btn1':'Notre histoire','s3.btn2':'Voir le menu',
    'hist.label':'001 — Notre Histoire',
    'hist.headline':'<span class="hist-w" data-dir="up">Une</span> <span class="hist-w" data-dir="left">histoire</span> <span class="hist-w" data-dir="up">née</span><br><span class="hist-w" data-dir="right">entre</span> <span class="hist-w hist-italic" data-dir="down">volcans</span><br><span class="hist-w" data-dir="left">et</span> <span class="hist-w" data-dir="up">vagues</span>',
    'hist.body1':'Imaginez vous garer, marcher vers le port et vous asseoir en terrasse avec des voiliers à quelques mètres. L\'air sent le sel, la lumière de Lanzarote dore tout et, soudain, le rythme de la journée s\'arrête. C\'est ainsi que commence un dîner à La Pappardella — avant même le premier plat, le voyage en valait déjà la peine.',
    'hist.body2':'Plus de 25 ans après, nous restons fidèles à ce cadre : fruits de mer frais de l\'Atlantique, ingrédients de première qualité et les meilleurs vins — tout cela dans le coin le plus spécial de Lanzarote.',
    'hist.cta1':'Explorer le menu','hist.cta2':'Réserver maintenant','hist.hint':'Cliquez sur les photos pour découvrir notre histoire →',
    'hist.photo1':'La Façade','hist.photo1.hint':'Voir l\'histoire →','hist.photo2':'La Terrasse','hist.photo2.hint':'Voir l\'histoire →','hist.photo3':'La Cuisine','hist.photo3.hint':'Voir l\'histoire →',
    'hist.badge.txt':'ans',
    'pillar1.strong':'De l\'Atlantique','pillar1.p':'Fruits de mer frais de l\'océan chaque matin',
    'pillar2.strong':'Saveurs Volcaniques','pillar2.p':'Vins de Malvoisie sur cendres noires',
    'pillar3.strong':'Tradition Italienne','pillar3.p':'Recettes italiennes authentiques, préparées avec passion',
    'pillar4.strong':'Lumière Unique','pillar4.p':'Réserve de Biosphère UNESCO',
    'carta.eyebrow':'002 / Notre Menu','carta.title':'Saveurs<br>qui<br><em>racontent<br>des histoires</em>','carta.desc':'Fruits de mer frais de l\'Atlantique, recettes italiennes de saison et le meilleur de la terre et de la mer.','carta.cta':'Menu Complet','carta.hint':'Découvrez les plats →',
    'bridge.text':'Le vin parfait pour chaque plat',
    'vinos.eyebrow':'Cave à Vins','vinos.heading':'Vins nés<br><em>du volcan</em>','vinos.body':'Lanzarote produit l\'un des vins les plus singuliers au monde : la Malvoisie volcanique, cultivée dans des fosses creusées dans la cendre noire pour retenir l\'humidité de la brume atlantique. À La Pappardella, nous célébrons ce trésor local avec une sélection soignée des meilleurs vins italiens.','vinos.btn':'Voir la carte des vins',
    'reviews.eyebrow':'Ce qu\'ils disent','reviews.heading':'Expériences<br><em>qui perdurent</em>','ta.badge':'Voir les avis sur TripAdvisor',
    'reserva.eyebrow':'Votre table vous attend','reserva.heading':'Une soirée à<br><em>La Pappardella</em>','reserva.body':'Réservez maintenant et profitez de la meilleure cuisine italienne avec l\'Atlantique en toile de fond. Chaque visite, une histoire à raconter.','reserva.cta':'Appeler maintenant','reserva.location':'📍 Puerto Calero, Lanzarote','reserva.hours':'🕐 Tous les jours · 12h30–23h00','reserva.social':'Suivez-nous',
    'faq.eyebrow':'FAQ','faq.heading':'Questions<br><em>fréquentes</em>',
    'faq.q1':'Faut-il réserver une table ?','faq.a1':'Nous recommandons de réserver, surtout en haute saison et le week-end. Appelez-nous directement au +34 928 513 614. Notre terrasse avec vue sur le port a une capacité limitée.',
    'faq.q2':'Avez-vous des options pour les cœliaques ou les végétariens ?','faq.a2':'Oui. Nous proposons des pâtes sans gluten sur demande et une sélection de plats végétariens. Consultez-nous lors de la réservation.',
    'faq.q3':'Quels sont vos horaires ?','faq.a3':'Nous sommes ouverts tous les jours. Déjeuner : 12h30–15h30. Dîner : 18h30–23h00. En haute saison, nous pouvons prolonger les horaires.',
    'faq.q4':'Acceptez-vous les groupes et les événements ?','faq.a4':'Absolument. Nous sommes le lieu idéal pour des célébrations privées, des dîners d\'entreprise ou des groupes familiaux. Contactez-nous à l\'avance.',
    'faq.q5':'Peut-on dîner avec vue sur la mer ?','faq.a5':'Oui. Notre terrasse donne sur le port de plaisance de Puerto Calero, avec des vues directes sur les voiliers et l\'Atlantique. C\'est l\'un des endroits les plus spéciaux de Lanzarote pour dîner en plein air.',
    'footer.nav':'Navigation','footer.contact':'Contact','footer.legal':'Légal',
    'footer.tagline':'Cuisine italienne authentique au cœur du Puerto Calero, Lanzarote.',
    'footer.aviso':'Mentions Légales','footer.privacidad':'Politique de Confidentialité','footer.cookies':'Politique de Cookies',
    'footer.copyright':'© 2025 La Pappardella · Tous droits réservés','footer.location':'Puerto Calero, Lanzarote · Îles Canaries',
  },
  de: {
    'nav.historia':'Geschichte','nav.carta':'Speisekarte','nav.vinos':'Weine','nav.experiencia':'Erlebnis','nav.reservas':'Reservierungen','nav.cta':'Tisch reservieren',
    'hero.tagline':'Authentische italienische Küche mit Blick auf den Atlantischen Ozean','hero.cta1':'Entdecken','hero.cta2':'Speisekarte','hero.scroll':'Scroll',
    's1.label':'001 / Ursprung','s1.heading':'La dolce vita<br><em>am</em><br>Atlantik','s1.body':'Segelboote beim Sonnenuntergang, die salzige Atlantikbrise und das sanfte Rauschen eines ruhigen Hafens. Ein Stück Italien im Herzen von Lanzarote, direkt am Meer.','s1.cta':'Terrasse reservieren →',
    'quote.text':'Jedes Gericht, das unsere Küche verlässt, trägt die Seele Italiens und den Geschmack des Atlantiks.','quote.author':'— 25 Jahre leidenschaftliches Kochen in Puerto Calero',
    's3.heading':'Beginnen Sie<br><em>das Erlebnis</em>','s3.body':'Entdecken Sie unsere Geschichte, Speisekarte und die einzigartigen Aromen von Lanzarote.','s3.btn1':'Unsere Geschichte','s3.btn2':'Speisekarte',
    'hist.label':'001 — Unsere Geschichte',
    'hist.headline':'<span class="hist-w" data-dir="up">Eine</span> <span class="hist-w" data-dir="left">Geschichte</span><br><span class="hist-w" data-dir="right">zwischen</span> <span class="hist-w hist-italic" data-dir="down">Vulkanen</span><br><span class="hist-w" data-dir="left">und</span> <span class="hist-w" data-dir="up">Wellen</span>',
    'hist.body1':'Stellen Sie sich vor: Sie parken, schlendern zum Hafen und setzen sich auf eine Terrasse, nur wenige Meter von Segelbooten entfernt. Die Luft riecht nach Salz, Lanzarotes Licht taucht alles in Gold und plötzlich verlangsamt sich das Tempo des Tages. So beginnt ein Abendessen bei La Pappardella — noch bevor der erste Gang kommt, hat sich der Weg bereits gelohnt.',
    'hist.body2':'Mehr als 25 Jahre später bleiben wir dieser Kulisse treu: frische Meeresfrüchte aus dem Atlantik, erstklassige Zutaten und die besten Weine — alles an dem besonderen Ort Lanzarotes.',
    'hist.cta1':'Speisekarte erkunden','hist.cta2':'Jetzt reservieren','hist.hint':'Klicken Sie auf die Fotos, um unsere Geschichte zu entdecken →',
    'hist.photo1':'Die Fassade','hist.photo1.hint':'Geschichte →','hist.photo2':'Die Terrasse','hist.photo2.hint':'Geschichte →','hist.photo3':'Die Küche','hist.photo3.hint':'Geschichte →',
    'hist.badge.txt':'Jahre',
    'pillar1.strong':'Aus dem Atlantik','pillar1.p':'Täglich frische Meeresfrüchte aus dem Ozean',
    'pillar2.strong':'Vulkanische Aromen','pillar2.p':'Malvasia-Weine aus schwarzem Vulkanboden',
    'pillar3.strong':'Italienische Tradition','pillar3.p':'Authentische italienische Rezepte, mit Leidenschaft zubereitet',
    'pillar4.strong':'Einzigartiges Licht','pillar4.p':'UNESCO-Biosphärenreservat',
    'carta.eyebrow':'002 / Unsere Speisekarte','carta.title':'Aromen,<br>die<br><em>Geschichten<br>erzählen</em>','carta.desc':'Frische Meeresfrüchte aus dem Atlantik, saisonale italienische Rezepte und das Beste von Land und Meer.','carta.cta':'Vollständige Speisekarte','carta.hint':'Gerichte entdecken →',
    'bridge.text':'Der perfekte Wein zu jedem Gericht',
    'vinos.eyebrow':'Weinkeller','vinos.heading':'Weine vom<br><em>Vulkan</em>','vinos.body':'Lanzarote produziert einen der einzigartigsten Weine der Welt: den vulkanischen Malvasia, der in schwarzem Ascheboden angebaut wird. Bei La Pappardella feiern wir diesen lokalen Schatz zusammen mit einer sorgfältig kuratierten Auswahl der besten italienischen Weine.','vinos.btn':'Weinkarte ansehen',
    'reviews.eyebrow':'Was Gäste sagen','reviews.heading':'Erlebnisse,<br><em>die bleiben</em>','ta.badge':'Bewertungen auf TripAdvisor lesen',
    'reserva.eyebrow':'Ihr Tisch wartet','reserva.heading':'Ein Abend bei<br><em>La Pappardella</em>','reserva.body':'Reservieren Sie jetzt und genießen Sie die beste italienische Küche mit dem Atlantik als Kulisse. Jeder Besuch, eine Geschichte.','reserva.cta':'Jetzt anrufen','reserva.location':'📍 Puerto Calero, Lanzarote','reserva.hours':'🕐 Täglich · 12:30–23:00 Uhr','reserva.social':'Folgen Sie uns',
    'faq.eyebrow':'FAQ','faq.heading':'Häufig gestellte<br><em>Fragen</em>',
    'faq.q1':'Muss ich einen Tisch reservieren?','faq.a1':'Wir empfehlen eine Reservierung, besonders in der Hochsaison und am Wochenende. Rufen Sie uns direkt unter +34 928 513 614 an. Unsere Terrasse hat begrenzte Kapazität.',
    'faq.q2':'Haben Sie Optionen für Zöliakiekranke oder Vegetarier?','faq.a2':'Ja. Wir bieten glutenfreie Pasta auf Anfrage und eine Auswahl an vegetarischen Gerichten. Informieren Sie uns bei der Reservierung.',
    'faq.q3':'Welche Öffnungszeiten haben Sie?','faq.a3':'Wir sind täglich geöffnet. Mittagessen: 12:30–15:30 Uhr. Abendessen: 18:30–23:00 Uhr. In der Hochsaison können die Zeiten verlängert werden.',
    'faq.q4':'Nehmen Sie Gruppen und Feiern an?','faq.a4':'Absolut. Wir sind der ideale Ort für private Feiern, Firmenessen oder Familiengruppen. Bitte im Voraus kontaktieren.',
    'faq.q5':'Kann man mit Meerblick speisen?','faq.a5':'Ja. Unsere Terrasse bietet einen direkten Blick auf den Jachthafen Puerto Calero, die Segelboote und den Atlantik. Es ist einer der schönsten Orte auf Lanzarote für ein Abendessen im Freien.',
    'footer.nav':'Navigation','footer.contact':'Kontakt','footer.legal':'Rechtliches',
    'footer.tagline':'Authentische italienische Küche im Herzen von Puerto Calero, Lanzarote.',
    'footer.aviso':'Impressum','footer.privacidad':'Datenschutzrichtlinie','footer.cookies':'Cookie-Richtlinie',
    'footer.copyright':'© 2025 La Pappardella · Alle Rechte vorbehalten','footer.location':'Puerto Calero, Lanzarote · Kanarische Inseln',
  },
  it: {
    'nav.historia':'La Nostra Storia','nav.carta':'Menu','nav.vinos':'Vini','nav.experiencia':'Esperienza','nav.reservas':'Prenotazioni','nav.cta':'Prenota un Tavolo',
    'hero.tagline':'Cucina italiana autentica con vista sull\'oceano Atlantico','hero.cta1':'Scoprire','hero.cta2':'Vedi il Menu','hero.scroll':'Scroll',
    's1.label':'001 / Origini','s1.heading':'La dolce vita<br><em>sull\'</em><br>Atlantico','s1.body':'Barche a vela al tramonto, la brezza salata dell\'Atlantico e il dolce sussurro di un porto tranquillo. Un angolo d\'Italia nel cuore di Lanzarote, a pochi passi dal mare.','s1.cta':'Prenota la terrazza →',
    'quote.text':'Ogni piatto che esce dalla nostra cucina porta l\'anima dell\'Italia e il sapore dell\'Atlantico.','quote.author':'— 25 anni di cucina appassionata a Puerto Calero',
    's3.heading':'Inizia<br><em>l\'esperienza</em>','s3.body':'Scopri la nostra storia, il menu e i sapori unici di Lanzarote.','s3.btn1':'La nostra storia','s3.btn2':'Vedi il menu',
    'hist.label':'001 — La Nostra Storia',
    'hist.headline':'<span class="hist-w" data-dir="up">Una</span> <span class="hist-w" data-dir="left">storia</span> <span class="hist-w" data-dir="up">nata</span><br><span class="hist-w" data-dir="right">tra</span> <span class="hist-w hist-italic" data-dir="down">vulcani</span><br><span class="hist-w" data-dir="left">e</span> <span class="hist-w" data-dir="up">onde</span>',
    'hist.body1':'Immagina di parcheggiare, camminare verso il porto e sederti in una terrazza con le barche a vela a pochi metri. L\'aria profuma di sale, la luce di Lanzarote dora tutto e, all\'improvviso, il ritmo della giornata si ferma. È così che inizia una cena a La Pappardella — prima ancora del primo piatto, il viaggio è già valso la pena.',
    'hist.body2':'Oltre 25 anni dopo, restiamo fedeli a quel scenario: frutti di mare freschi dell\'Atlantico, ingredienti di prima qualità e i migliori vini — tutto nel posto più speciale di Lanzarote.',
    'hist.cta1':'Esplora il menu','hist.cta2':'Prenota ora','hist.hint':'Clicca le foto per scoprire la nostra storia →',
    'hist.photo1':'La Facciata','hist.photo1.hint':'Vedi la storia →','hist.photo2':'La Terrazza','hist.photo2.hint':'Vedi la storia →','hist.photo3':'La Cucina','hist.photo3.hint':'Vedi la storia →',
    'hist.badge.txt':'anni',
    'pillar1.strong':'Dall\'Atlantico','pillar1.p':'Frutti di mare freschi dall\'oceano ogni mattina',
    'pillar2.strong':'Sapori Vulcanici','pillar2.p':'Vini di Malvasia su lapillo nero',
    'pillar3.strong':'Tradizione Italiana','pillar3.p':'Ricette italiane autentiche, preparate con dedizione',
    'pillar4.strong':'Luce Unica','pillar4.p':'Riserva della Biosfera UNESCO',
    'carta.eyebrow':'002 / Il Nostro Menu','carta.title':'Sapori<br>che<br><em>raccontano<br>storie</em>','carta.desc':'Frutti di mare freschi dell\'Atlantico, ricette italiane di stagione e il meglio della terra e del mare.','carta.cta':'Menu Completo','carta.hint':'Scopri i piatti →',
    'bridge.text':'Il vino perfetto per ogni piatto',
    'vinos.eyebrow':'Cantina','vinos.heading':'Vini nati<br><em>dal vulcano</em>','vinos.body':'Lanzarote produce uno dei vini più singolari al mondo: la Malvasia vulcanica, coltivata in buche scavate nel lapillo nero. A La Pappardella, celebriamo questo tesoro locale insieme a una selezione curata dei migliori vini italiani.','vinos.btn':'Vedi la carta dei vini',
    'reviews.eyebrow':'Cosa dicono','reviews.heading':'Esperienze<br><em>che restano</em>','ta.badge':'Leggi le recensioni su TripAdvisor',
    'reserva.eyebrow':'Il tuo tavolo ti aspetta','reserva.heading':'Una serata a<br><em>La Pappardella</em>','reserva.body':'Prenota ora e goditi la migliore cucina italiana con l\'Atlantico come sfondo. Ogni visita, una storia da raccontare.','reserva.cta':'Chiama ora','reserva.location':'📍 Puerto Calero, Lanzarote','reserva.hours':'🕐 Tutti i giorni · 12:30–23:00','reserva.social':'Seguici',
    'faq.eyebrow':'FAQ','faq.heading':'Domande<br><em>frequenti</em>',
    'faq.q1':'È necessario prenotare un tavolo?','faq.a1':'Consigliamo di prenotare, soprattutto in alta stagione e nei fine settimana. Chiamaci al +34 928 513 614. La nostra terrazza con vista sul porto ha capacità limitata.',
    'faq.q2':'Avete opzioni per celiaci o vegetariani?','faq.a2':'Sì. Offriamo pasta senza glutine su richiesta e una selezione di piatti vegetariani. Informaci al momento della prenotazione.',
    'faq.q3':'Quali sono i vostri orari?','faq.a3':'Siamo aperti tutti i giorni. Pranzo: 12:30–15:30. Cena: 18:30–23:00. In alta stagione possiamo estendere gli orari.',
    'faq.q4':'Accettate gruppi e celebrazioni?','faq.a4':'Assolutamente. Siamo il luogo ideale per celebrazioni private, cene aziendali o gruppi familiari. Contattaci in anticipo.',
    'faq.q5':'Si può mangiare con vista sul mare?','faq.a5':'Sì. La nostra terrazza si affaccia sul porto turistico di Puerto Calero, con viste dirette sulle barche a vela e sull\'Atlantico. È uno degli angoli più speciali di Lanzarote per cenare all\'aperto.',
    'footer.nav':'Navigazione','footer.contact':'Contatto','footer.legal':'Legale',
    'footer.tagline':'Cucina italiana autentica nel cuore di Puerto Calero, Lanzarote.',
    'footer.aviso':'Note Legali','footer.privacidad':'Informativa sulla Privacy','footer.cookies':'Informativa sui Cookie',
    'footer.copyright':'© 2025 La Pappardella · Tutti i diritti riservati','footer.location':'Puerto Calero, Lanzarote · Isole Canarie',
  },
};

function applyTranslations(lang) {
  const T = TRANSLATIONS[lang];
  if (!T) return;

  function t(sel, key, html = false) {
    const val = T[key]; if (!val) return;
    document.querySelectorAll(sel).forEach(el => { if (html) el.innerHTML = val; else el.textContent = val; });
  }

  // Nav
  t('.nav-links a[href="#historia-section"]', 'nav.historia');
  t('.nav-links a[href="#menu-section"]', 'nav.carta');
  t('.nav-links a[href="#vinos-section"]', 'nav.vinos');
  t('#experiencia-nav-btn', 'nav.experiencia');
  t('.nav-links a[href="#reserva-section"]', 'nav.reservas');
  t('.nav-cta', 'nav.cta');
  t('.nav-mobile a[href="#historia-section"]', 'nav.historia');
  t('.nav-mobile a[href="#menu-section"]', 'nav.carta');
  t('.nav-mobile a[href="#vinos-section"]', 'nav.vinos');
  t('#experiencia-mobile-btn', 'nav.experiencia');
  t('.nav-mobile a[href="#reserva-section"]', 'nav.reservas');
  t('.mobile-cta', 'nav.cta');

  // Hero
  t('.hero-tagline', 'hero.tagline');
  t('.hero-ctas .btn-primary', 'hero.cta1');
  t('.hero-ctas .btn-ghost', 'hero.cta2');
  t('.scroll-indicator span', 'hero.scroll');

  // Scroll S1
  t('#scroll-container .scroll-section:first-child .section-label', 's1.label');
  t('#scroll-container .scroll-section:first-child .section-heading', 's1.heading', true);
  t('#scroll-container .scroll-section:first-child .section-body', 's1.body');
  t('#scroll-container .scroll-section:first-child .section-cta', 's1.cta');

  // Scroll S2 quote
  t('.quote-text', 'quote.text');
  t('.quote-author', 'quote.author');

  // Scroll S3 CTA
  t('.section-cta-scroll .section-heading', 's3.heading', true);
  t('.section-cta-scroll .section-body', 's3.body');
  t('.section-cta-scroll .cta-buttons .btn-primary', 's3.btn1');
  t('.section-cta-scroll .cta-buttons .btn-ghost', 's3.btn2');

  // Historia label (has eyebrow-line span inside)
  const histLabel = document.getElementById('hist-label');
  if (histLabel && T['hist.label']) {
    const line = histLabel.querySelector('.eyebrow-line');
    histLabel.textContent = T['hist.label'];
    if (line) histLabel.prepend(line);
  }

  // Historia headline (animated words — just replace innerHTML, set visible)
  if (T['hist.headline']) {
    const hl = document.getElementById('hist-headline');
    if (hl) {
      hl.innerHTML = T['hist.headline'];
      hl.querySelectorAll('.hist-w').forEach(w => gsap.set(w, { opacity: 1, x: 0, y: 0, rotation: 0 }));
    }
  }

  // Historia body
  const histPs = document.querySelectorAll('#hist-body p');
  if (histPs[0] && T['hist.body1']) histPs[0].textContent = T['hist.body1'];
  if (histPs[1] && T['hist.body2']) histPs[1].textContent = T['hist.body2'];

  t('#hist-cta .btn-primary', 'hist.cta1');
  t('#hist-cta .btn-outline-dark', 'hist.cta2');
  t('.hist-photos-hint', 'hist.hint');
  t('.hist-photo-1 .hist-photo-label', 'hist.photo1');
  t('.hist-photo-1 .hist-photo-hint', 'hist.photo1.hint');
  t('.hist-photo-2 .hist-photo-label', 'hist.photo2');
  t('.hist-photo-2 .hist-photo-hint', 'hist.photo2.hint');
  t('.hist-photo-3 .hist-photo-label', 'hist.photo3');
  t('.hist-photo-3 .hist-photo-hint', 'hist.photo3.hint');

  // Historia badge txt
  const badgeTxt = document.querySelector('.hist-year-badge .hist-year-txt');
  if (badgeTxt && T['hist.badge.txt']) badgeTxt.textContent = T['hist.badge.txt'];

  // Historia pillars
  const pillars = document.querySelectorAll('.historia-pillar');
  pillars.forEach((pillar, i) => {
    const n = i + 1;
    const strong = pillar.querySelector('strong');
    const p = pillar.querySelector('p');
    if (strong && T[`pillar${n}.strong`]) strong.textContent = T[`pillar${n}.strong`];
    if (p && T[`pillar${n}.p`]) p.textContent = T[`pillar${n}.p`];
  });

  // Carta
  t('.carta-eyebrow', 'carta.eyebrow');
  t('.carta-title', 'carta.title', true);
  t('.carta-desc', 'carta.desc');
  t('.carta-cta-btn', 'carta.cta');
  const cartaHint = document.querySelector('.carta-scroll-hint span');
  if (cartaHint && T['carta.hint']) cartaHint.textContent = T['carta.hint'];

  // Bridge
  t('.bridge-text', 'bridge.text');

  // Vinos
  t('.vinos-eyebrow .eyebrow', 'vinos.eyebrow');
  t('.section-vinos .vinos-text h2', 'vinos.heading', true);
  t('.section-vinos .vinos-text > p', 'vinos.body');
  t('.section-vinos .btn-outline-dark', 'vinos.btn');

  // Reviews
  t('.section-reviews .eyebrow', 'reviews.eyebrow');
  t('.section-reviews h2', 'reviews.heading', true);
  const taText = document.getElementById('ta-badge-text');
  if (taText && T['ta.badge']) taText.textContent = T['ta.badge'];

  // CTA final
  t('.cta-final-content .eyebrow', 'reserva.eyebrow');
  t('.cta-final-content h2', 'reserva.heading', true);
  t('.cta-final-content > p', 'reserva.body');
  const callBtn = document.querySelector('.cta-final-actions .btn-primary.btn-lg');
  if (callBtn && T['reserva.cta']) {
    const svg = callBtn.querySelector('svg');
    callBtn.innerHTML = '';
    if (svg) callBtn.appendChild(svg);
    callBtn.appendChild(document.createTextNode(' ' + T['reserva.cta']));
  }
  const infoSpans = document.querySelectorAll('.cta-final-info span');
  if (infoSpans[0] && T['reserva.location']) infoSpans[0].textContent = T['reserva.location'];
  if (infoSpans[1] && T['reserva.hours']) infoSpans[1].textContent = T['reserva.hours'];
  t('.cta-social-label', 'reserva.social');

  // FAQ
  t('.section-faq .eyebrow', 'faq.eyebrow');
  t('.section-faq h2', 'faq.heading', true);
  document.querySelectorAll('.faq-item').forEach((item, i) => {
    const n = i + 1;
    const qBtn = item.querySelector('.faq-q');
    const aP = item.querySelector('.faq-a p');
    if (qBtn && T[`faq.q${n}`]) qBtn.innerHTML = T[`faq.q${n}`] + ' <span class="faq-icon">+</span>';
    if (aP && T[`faq.a${n}`]) aP.textContent = T[`faq.a${n}`];
  });

  // Footer
  const footNavH = document.querySelector('.footer-nav h4');
  if (footNavH && T['footer.nav']) footNavH.textContent = T['footer.nav'];
  const footConH = document.querySelector('.footer-contact h4');
  if (footConH && T['footer.contact']) footConH.textContent = T['footer.contact'];
  const footLegH = document.querySelector('.footer-legal h4');
  if (footLegH && T['footer.legal']) footLegH.textContent = T['footer.legal'];
  t('.footer-brand > p', 'footer.tagline');

  // Footer nav links
  const footNavLinks = document.querySelectorAll('.footer-nav ul li a');
  const navKeys = ['nav.historia', 'nav.carta', 'nav.vinos', 'nav.reservas'];
  footNavLinks.forEach((a, i) => { if (T[navKeys[i]]) a.textContent = T[navKeys[i]]; });

  // Footer legal links
  const legalLinks = document.querySelectorAll('.footer-legal ul li a');
  if (legalLinks[0] && T['footer.aviso']) legalLinks[0].textContent = T['footer.aviso'];
  if (legalLinks[1] && T['footer.privacidad']) legalLinks[1].textContent = T['footer.privacidad'];
  if (legalLinks[2] && T['footer.cookies']) legalLinks[2].textContent = T['footer.cookies'];

  // Footer bottom
  const footBtm = document.querySelectorAll('.footer-bottom p');
  if (footBtm[0] && T['footer.copyright']) footBtm[0].textContent = T['footer.copyright'];
  if (footBtm[1] && T['footer.location']) footBtm[1].textContent = T['footer.location'];
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  document.documentElement.lang = lang;
  localStorage.setItem('pappardella-lang', lang);
  const curr = document.getElementById('lang-current');
  if (curr) curr.textContent = lang.toUpperCase();
  document.querySelectorAll('.lang-option, .lang-m-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  applyTranslations(lang);
}

function initI18n() {
  const switcher = document.getElementById('lang-switcher');
  const btn = document.getElementById('lang-btn');
  const dropdown = document.getElementById('lang-dropdown');
  if (!switcher || !btn || !dropdown) return;

  btn.addEventListener('click', e => { e.stopPropagation(); switcher.classList.toggle('open'); });
  document.addEventListener('click', () => switcher.classList.remove('open'));
  dropdown.addEventListener('click', e => e.stopPropagation());

  dropdown.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
      setLanguage(opt.dataset.lang);
      switcher.classList.remove('open');
    });
  });

  // Mobile lang options (inside mobile menu)
  document.querySelectorAll('.lang-m-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      setLanguage(opt.dataset.lang);
    });
  });

  // Auto-detect or restore saved language
  const saved = localStorage.getItem('pappardella-lang');
  const browser = (navigator.language || 'es').slice(0, 2).toLowerCase();
  const supported = ['es', 'en', 'fr', 'de', 'it'];
  const lang = supported.includes(saved) ? saved : (supported.includes(browser) ? browser : 'es');
  setLanguage(lang);
}

init();
