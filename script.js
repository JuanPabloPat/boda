// ============ PANTALLA DE CARGA ============
(function () {
  const loader = document.getElementById('loader');
  const barra = document.getElementById('loader-progreso');
  if (!loader) return;

  // Mientras carga, la página no se puede mover
  document.documentElement.style.overflow = 'hidden';

  // 👉 Tiempo máximo de espera (ms). Si algo tarda más (por ejemplo una foto rota),
  //    la pantalla de carga se quita igual para que nadie se quede atascado.
  const TIEMPO_MAXIMO = 15000;

  const imagenes = Array.from(document.images).filter(function (img) {
    return img.loading !== 'lazy';          // las "lazy" no se esperan
  });
  const total = imagenes.length;
  let cargadas = 0;
  let terminado = false;

  function progreso(p) {
    if (barra) barra.style.width = Math.min(100, Math.round(p)) + '%';
  }

  function terminar() {
    if (terminado) return;
    terminado = true;
    progreso(100);
    setTimeout(function () {
      loader.classList.add('listo');
      document.documentElement.style.overflow = '';
      setTimeout(function () { loader.remove(); }, 900);
    }, 400);
  }

  function marcar() {
    cargadas++;
    progreso((cargadas / Math.max(total, 1)) * 90);   // deja el último 10% para el final
    if (cargadas >= total) terminar();
  }

  if (!total) {
    window.addEventListener('load', terminar);
  } else {
    imagenes.forEach(function (img) {
      if (img.complete) {
        marcar();
      } else {
        img.addEventListener('load', marcar, { once: true });
        img.addEventListener('error', marcar, { once: true });   // una foto rota no bloquea
      }
    });
  }

  // Seguro: también espera a las fuentes y al evento load de la ventana
  window.addEventListener('load', function () {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { if (cargadas >= total) terminar(); });
    }
  });

  setTimeout(terminar, TIEMPO_MAXIMO);
})();

document.addEventListener('DOMContentLoaded', function () {
  const body = document.body;
  const cover = document.getElementById('cover');
  const sobre = document.getElementById('sobre');
  const invitacion = document.getElementById('invitacion');
  const musicaBtn = document.getElementById('musica-btn');
  const musica = document.getElementById('musica-fondo');

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  // ============ NOMBRE DEL INVITADO (viene del link) ============
  // Ejemplo: index.html?nombre=Juan%20Perez&personas=2
  const params = new URLSearchParams(window.location.search);
  const nombreInvitado = (params.get('nombre') || '').trim().slice(0, 60);
  const personas = Math.min(parseInt(params.get('personas'), 10) || 0, 20);

  const textoInvitado = document.querySelector('.texto-invitado');
  if (textoInvitado) {
    if (nombreInvitado) {
      textoInvitado.querySelector('.nombre-invitado').textContent = nombreInvitado;

      const num = textoInvitado.querySelector('.num-invitados');
      if (personas > 0) {
        num.textContent = personas === 1 ? '1 persona' : personas + ' personas';
      } else {
        num.remove();
      }
    } else {
      // Si abren el link sin nombre, se oculta el bloque para que no salga el texto de ejemplo
      textoInvitado.style.display = 'none';
    }
  }

  // También rellena el nombre en el formulario de confirmación
  const inputNombres = document.querySelector('#rsvp-form input[name="nombres"]');
  if (inputNombres && nombreInvitado) inputNombres.value = nombreInvitado;

  // ============ MÚSICA ============
  // El botón pausa / reanuda, y su icono siempre refleja el estado real del audio.
  function reproducir() {
    musica.play().catch(function () { musicaBtn.classList.add('silenciado'); });
  }

  musicaBtn.addEventListener('click', function () {
    if (musica.paused) {
      reproducir();
    } else {
      musica.pause();
    }
  });
  musica.addEventListener('play', function () { musicaBtn.classList.remove('silenciado'); });
  musica.addEventListener('pause', function () { musicaBtn.classList.add('silenciado'); });

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
  // 👉 Pega aquí la URL de Google Apps Script (la que termina en /exec)
  const URL_HOJA = 'https://script.google.com/macros/s/AKfycbx-kvAVwjCv5XtLh9kU8P-j55_4vMLSFcrzxPz7OMvlLTwxQImdFLSTFWcRsXUL_fQ2Eg/exec';

  // (Opcional) WhatsApp de los novios para recibir también el aviso. Déjalo vacío si no lo quieres.
  const WHATSAPP_NOVIOS = '';

  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpGracias = document.getElementById('rsvp-gracias');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const boton = rsvpForm.querySelector('button[type="submit"]');
      const textoOriginal = boton.textContent;
      const datos = new FormData(rsvpForm);
      const asiste = datos.get('asistencia') === 'si';
      const mensaje = (datos.get('mensaje') || '').toString().trim();

      boton.disabled = true;
      boton.textContent = 'Enviando...';

      fetch(URL_HOJA, {
        method: 'POST',
        mode: 'no-cors',                      // Apps Script no permite leer la respuesta desde otro dominio
        body: new URLSearchParams(datos)
      })
        .then(function () {
          if (WHATSAPP_NOVIOS) {
            const texto =
              'Hola! Soy ' + datos.get('nombres') + '. ' +
              (asiste ? 'Confirmo mi asistencia a la boda 💛' : 'Lamentablemente no podré asistir.') +
              (mensaje ? '\n\n' + mensaje : '');
            window.open('https://wa.me/' + WHATSAPP_NOVIOS + '?text=' + encodeURIComponent(texto), '_blank');
          }

          rsvpGracias.textContent = asiste
            ? '¡Gracias por confirmar! Los esperamos con mucho cariño 💛'
            : 'Gracias por avisarnos, te llevaremos en el corazón 💛';

          rsvpForm.style.display = 'none';
          rsvpGracias.classList.add('visible');
        })
        .catch(function () {
          boton.disabled = false;
          boton.textContent = textoOriginal;
          alert('No pudimos enviar tu confirmación. Revisa tu conexión e inténtalo de nuevo.');
        });
    });
  }
  // ============ SOBRE: apertura ============
  function abrirSobre() {
    if (sobre.classList.contains('abriendo')) return;

    const v = reducirMovimiento ? 0.15 : 1;

    sobre.classList.add('abriendo');
    sobre.removeAttribute('tabindex');
    musica.currentTime = 5;
    reproducir();

    // 👇 NUEVO: la invitación se muestra detrás desde el inicio
    invitacion.classList.add('visible');

    setTimeout(function () {
      body.classList.remove('bloqueado');
      cover.classList.add('saliendo');   // (quitamos invitacion.classList.add('visible') de aquí)
    }, 1150 * v);

    // 👇 antes 1400: ahora los textos/fotos aparecen mientras se abre
    setTimeout(iniciarEfectos, 700 * v);

    setTimeout(function () {
      cover.classList.add('oculto');
    }, 2700 * v);
  }

  sobre.addEventListener('click', abrirSobre);
  sobre.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrirSobre();
    }
  });

  // ============ EFECTOS AL HACER SCROLL ============
  // Fuerza del movimiento suave de las flores al bajar (0 = desactivado)
  const FUERZA_PARALAJE = 0.09;

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

    registrar('.rsvp-limite', 'up', { base: 0.3 });
    // --- Foto cuadrada final ---
    registrar('.foto-cuadrada', 'foto');

    // --- Formulario (campo por campo) ---
    registrar('.rsvp-form > *', 'up', {
      escalonar: true, paso: 0.08, base: 0.15, grupo: '.rsvp-form'
    });

    registrar('.eyebrow', 'up', { base: 0.2 });
    registrar('.frase-inicio', 'up', { base: 0.4 });   // NUEVO
    registrar('.card-blanca', 'zoom');
    registrar('.card-icono', 'pop', { base: 0.2 });
    registrar('.titulo-script', 'up', { base: 0.15 });
    registrar('.regalo-texto', 'up', { base: 0.3 });
    registrar('.vest-col', 'pop', {
      escalonar: true, paso: 0.15, base: 0.3, grupo: '.vest-cols'
    });
    registrar('.vest-color', 'pop', {
      escalonar: true, paso: 0.1, base: 0.3, grupo: '.vest-colores'
    });
    registrar('.vest-nota', 'up', { base: 0.4 });
    registrar('.recom-item', 'up', {
      escalonar: true, paso: 0.15, base: 0.3, grupo: '.recom-lista'
    });

    // --- Final ---
    registrar('.monograma-circulo', 'pop');

    // --- Divisores ❀ ---
    registrar('.divisor', 'div');

    // --- Flores decorativas ---
    registrar('.flor-decor, .flor7, .flor10', 'flor');
  }

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

    const flores = Array.from(document.querySelectorAll('.flor7, .flor10'));
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