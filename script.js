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

    musica.play().catch(function () {});

    setTimeout(function () {
      cover.classList.add('oculto');
    }, 900);
  });

  musicaBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    musica.muted = !musica.muted;
    musicaBtn.textContent = musica.muted ? '✕' : '♪';
    if (!musica.muted) {
      musica.play().catch(function () {});
    }
  });

  // ============ CUENTA REGRESIVA ============
  // 👉 Cambia esta fecha por la fecha y hora reales de la boda:
  const FECHA_BODA = new Date('2027-06-20T16:00:00');

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

  function pad(n){ return String(n).padStart(2, '0'); }

  function actualizarContador(){
    const ahora = new Date();
    let diff = FECHA_BODA - ahora;
    if (diff < 0) diff = 0;

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);
    const segundos = Math.floor((diff / 1000) % 60);

    if (elDias) elDias.textContent = pad(dias);
    if (elHoras) elHoras.textContent = pad(horas);
    if (elMin) elMin.textContent = pad(minutos);
    if (elSeg) elSeg.textContent = pad(segundos);
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
});