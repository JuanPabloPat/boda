document.addEventListener('DOMContentLoaded', function () {
  const body = document.body;
  const cover = document.getElementById('cover');
  const sobre = document.getElementById('sobre');
  const invitacion = document.getElementById('invitacion');
  const musicaBtn = document.getElementById('musica-btn');
  const musica = document.getElementById('musica-fondo');

  sobre.addEventListener('click', function (e) {
    if (e.target === musicaBtn) return;

    sobre.classList.add('abriendo');
    cover.classList.add('abriendo');
    body.classList.remove('bloqueado');
    invitacion.classList.add('visible');

    musica.play().catch(function () { });

    setTimeout(function () {
      cover.classList.add('oculto');
    }, 900);

    // los efectos de scroll empiezan cuando el sobre ya se está abriendo
    setTimeout(iniciarEfectos, 350);
  });

  musicaBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    musica.muted = !musica.muted;
    musicaBtn.textContent = musica.muted ? '✕' : '♪';
    if (!musica.muted) {
      musica.play().catch(function () { });
    }
  });

  // ============ CUENTA REGRESIVA ============
  // 👉 Cambia esta fecha por la fecha y hora reales de la boda:
  const FECHA_BODA = new Date('2026-11-28T16:00:00');

  const elFecha = document.querySelector('.countdown-fecha');
  const elDias = document.getElementById('cd-dias');
  const elHoras = document.getElementById('cd-horas');
  const elMin = document.getElementById('cd-min');
  const elSeg = document.getElementById('cd-seg');

  if (elFecha) {
    elFecha.classList.remove('placeholder');
    elFecha.textContent = FECHA_BODA.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    }) + ' · ' + FECHA_BODA.toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  let contando = false; // true mientras los números "suben" al aparecer

  function calcularPartes() {
    let diff = FECHA_BODA - new Date();
    if (diff < 0) diff = 0;
    return [
      Math.floor(diff / (1000 * 60 * 60 * 24)),
      Math.floor((diff / (1000 * 60 * 60)) % 24),
      Math.floor((diff / (1000 * 60)) % 60),
      Math.floor((diff / 1000) % 60)
    ];
  }

  function pintarContador(v) {
    if (elDias) elDias.textContent = pad(v[0]);
    if (elHoras) elHoras.textContent = pad(v[1]);
    if (elMin) elMin.textContent = pad(v[2]);
    if (elSeg) elSeg.textContent = pad(v[3]);
  }

  function actualizarContador() {
    if (contando) return;
    pintarContador(calcularPartes());
  }

  // Los números suben desde 00 hasta el valor real (~1.1 s)
  function animarContador() {
    const meta = calcularPartes();
    const inicio = performance.now();
    const duracion = 1100;
    contando = true;

    function paso(ahora) {
      const p = Math.min(1, (ahora - inicio) / duracion);
      const suave = 1 - Math.pow(1 - p, 3);
      pintarContador(meta.map(function (v) { return Math.round(v * suave); }));
      if (p < 1) {
        requestAnimationFrame(paso);
      } else {
        contando = false;
        actualizarContador();
      }
    }
    requestAnimationFrame(paso);
  }

  actualizarContador();
  setInterval(actualizarContador, 1000);

  // ============ FORMULARIO RSVP ============
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpGracias = document.getElementById('rsvp-gracias');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Aquí solo se muestra un mensaje de agradecimiento.
      // Para RECIBIR de verdad las confirmaciones (por email o una hoja de cálculo),
      // conecta este formulario a un servicio como Formspree, Google Forms o similar.
      rsvpForm.style.display = 'none';
      rsvpGracias.classList.add('visible');
    });
  }

  // ============ EFECTOS AL HACER SCROLL ============
  // Fuerza del movimiento suave de las flores al bajar (0 = desactivado)
  const FUERZA_PARALAJE = 0.09;

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elementos = [];
  const acciones = new Map();
  let efectosIniciados = false;

  // Marca los elementos que coinciden con "selector" para que aparezcan con "efecto".
  // opts.base       -> retraso inicial en segundos
  // opts.escalonar  -> cada elemento del grupo entra un poco después del anterior
  // opts.paso       -> segundos entre un elemento y el siguiente
  // opts.grupo      -> selector del contenedor que agrupa a los elementos
  // opts.alEntrar   -> función que se ejecuta cuando el elemento aparece
  function registrar(selector, efecto, opts) {
    opts = opts || {};
    const grupos = new Map();

    document.querySelectorAll(selector).forEach(function (el) {
      if (el.dataset.rv) return; // ya registrado con otro efecto
      el.dataset.rv = efecto;
      el.classList.add('rv-' + efecto);
      if (efecto !== 'div' && efecto !== 'linea') el.classList.add('rv');

      let retraso = opts.base || 0;
      if (opts.escalonar) {
        const clave = opts.grupo ? el.closest(opts.grupo) : el.parentElement;
        const n = grupos.get(clave) || 0;
        retraso += n * (opts.paso || 0.1);
        grupos.set(clave, n + 1);
      }
      if (retraso) el.style.setProperty('--d', retraso.toFixed(2) + 's');
      if (opts.alEntrar) acciones.set(el, opts.alEntrar);

      elementos.push(el);
    });
  }

  if (!reducirMovimiento && 'IntersectionObserver' in window) {
    // --- Portada ---
    registrar('.nombres-overlap', 'up', { base: 0.55 });
    registrar('.eyebrow', 'up', { base: 0.2 });

    // --- Acompáñanos (cae línea por línea) ---
    registrar('.acompanos-eyebrow, .acompanos-line', 'up', { escalonar: true, paso: 0.1 });

    // --- Cuenta regresiva ---
    registrar('.countdown-card', 'zoom', {
      alEntrar: function () { setTimeout(animarContador, 250); }
    });
    registrar('.countdown-item', 'pop', {
      escalonar: true, paso: 0.08, base: 0.25, grupo: '.countdown-grid'
    });

    // --- Fotos en arco + frases ---
    registrar('.arco', 'foto', { escalonar: true, paso: 0.18, grupo: '.duo-fotos' });
    registrar('.duo-frase', 'up', { escalonar: true, paso: 0.18, base: 0.6, grupo: '.duo-fotos' });

    // --- Padrinos ---
    registrar('.titulo-padrinos h2', 'up');
    registrar('.padrinos-lista p', 'up', { escalonar: true, paso: 0.12, grupo: '.padrinos-lista' });

    // --- Frases sueltas ---
    registrar('.frase-boda', 'up');

    // --- Collage (cada foto entra desde un lado distinto) ---
    registrar('.collage-foto', 'foto', { escalonar: true, paso: 0.14, grupo: '.collage' });

    // --- Ceremonia y recepción ---
    registrar('.ceremonia-section', 'zoom');
    registrar('.ceremonia-icono', 'pop', { base: 0.2 });
    registrar(
      '.ceremonia-hora, .ceremonia-label, .ceremonia-nombre, .ceremonia-direccion, .ceremonia-section .btn-mapa',
      'up',
      { escalonar: true, paso: 0.07, base: 0.3, grupo: '.ceremonia-section' }
    );

    // --- Itinerario ---
    registrar('.foto-frase-section > h2', 'up');
    registrar('.itinerario-timeline', 'linea');
    registrar('.timeline-icon', 'icono');
    registrar('.timeline-text.right', 'der', { base: 0.12 });
    registrar('.timeline-text.left', 'izq', { base: 0.12 });

    // --- Tarjetas (regalo, vestimenta, RSVP) ---
    registrar('.card-blanca', 'zoom');
    registrar('.card-icono', 'pop', { base: 0.2 });
    registrar('.vestimenta-item', 'pop', {
      escalonar: true, paso: 0.12, base: 0.25, grupo: '.vestimenta-iconos'
    });

    // --- Foto cuadrada final ---
    registrar('.foto-cuadrada', 'foto');

    // --- Formulario (campo por campo) ---
    registrar('.rsvp-form > *', 'up', {
      escalonar: true, paso: 0.08, base: 0.15, grupo: '.rsvp-form'
    });

    // --- Final ---
    registrar('.monograma-circulo', 'pop');

    // --- Divisores ❀ ---
    registrar('.divisor', 'div');

    // --- Flores decorativas ---
    registrar('.flor-decor, .flor7, .flor10', 'flor');
  }

  (function crearBrillos() {
    const cont = document.querySelector('.brillos');
    if (!cont || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    for (let i = 0; i < 18; i++) {
      const b = document.createElement('i');
      b.style.setProperty('--x', (Math.random() * 100).toFixed(1) + '%');
      b.style.setProperty('--s', (2 + Math.random() * 3).toFixed(1) + 'px');
      b.style.setProperty('--t', (9 + Math.random() * 9).toFixed(1) + 's');
      b.style.setProperty('--d', '-' + (Math.random() * 14).toFixed(1) + 's');
      b.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
      cont.appendChild(b);
    }
  })();

  // ============ SOBRE: apertura por etapas ============
  sobre.addEventListener('click', function (e) {
    if (e.target === musicaBtn || sobre.classList.contains('abriendo')) return;

    // con "reducir movimiento" todo pasa mucho más rápido
    const v = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.25 : 1;

    // 0 s: el sello se rompe, la solapa se abre y la carta sube (todo en el CSS)
    sobre.classList.add('abriendo');
    musica.play().catch(function () { });

    // 1.35 s: se desbloquea la página y la invitación queda lista detrás
    setTimeout(function () {
      body.classList.remove('bloqueado');
      invitacion.classList.add('visible');
    }, 1350 * v);

    // 1.5 s: la cámara se acerca a la carta y la portada se desvanece
    setTimeout(function () {
      cover.classList.add('saliendo');
    }, 1500 * v);

    // 1.6 s: arrancan los efectos de scroll de la invitación
    setTimeout(iniciarEfectos, 1600 * v);

    // 2.35 s: se quita la portada
    setTimeout(function () {
      cover.classList.add('oculto');
    }, 2350 * v);
  });

  function iniciarEfectos() {
    if (efectosIniciados || !elementos.length) return;
    efectosIniciados = true;

    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        const el = entrada.target;
        el.classList.add('rv-in');
        observador.unobserve(el);

        const accion = acciones.get(el);
        if (accion) accion(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    elementos.forEach(function (el) { observador.observe(el); });

    iniciarParalaje();
  }

  // Las flores se mueven un poco más lento que el resto al hacer scroll
  function iniciarParalaje() {
    if (!FUERZA_PARALAJE) return;

    const flores = Array.from(document.querySelectorAll('.flor7, .flor10, .flor-decor'));
    if (!flores.length) return;

    const desplazamiento = new Map();
    flores.forEach(function (f) { desplazamiento.set(f, 0); });
    let pendiente = false;

    function actualizar() {
      pendiente = false;
      const alto = window.innerHeight;

      flores.forEach(function (f) {
        const r = f.getBoundingClientRect();
        if (r.bottom < -300 || r.top > alto + 300) return; // fuera de pantalla

        const actual = desplazamiento.get(f);
        const centro = r.top + r.height / 2 - actual;
        let y = (centro - alto / 2) * FUERZA_PARALAJE;
        y = Math.max(-45, Math.min(45, y));

        desplazamiento.set(f, y);
        f.style.translate = '0 ' + y.toFixed(1) + 'px';
      });
    }

    function pedir() {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(actualizar);
      }
    }

    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    actualizar();
  }
});