function animation() {
  !(function () {
    window;
    const e = document.documentElement;
    if (
      (e.classList.remove("no-js"),
      e.classList.add("js"),
      document.getElementById("dashboard").classList.contains("has-animations"))
    ) {
      (window.sr = ScrollReveal()).reveal(".feature, .pricing-table-inner", {
        duration: 600,
        distance: "20px",
        easing: "cubic-bezier(0.5, -0.01, 0, 1.005)",
        origin: "bottom",
        interval: 100,
      }),
        e.classList.add("anime-ready"),
        anime
          .timeline({ targets: ".hero-figure-box-05" })
          .add({
            duration: 400,
            easing: "easeInOutExpo",
            scaleX: [0.05, 0.05],
            scaleY: [0, 1],
            perspective: "500px",
            delay: anime.random(0, 400),
          })
          .add({
            duration: 400,
            easing: "easeInOutExpo",
            scaleX: 1,
          })
          .add({
            duration: 800,
            rotateY: "-15deg",
            rotateX: "8deg",
            rotateZ: "-1deg",
          }),
        anime
          .timeline({
            targets: ".hero-figure-box-06, .hero-figure-box-07",
          })
          .add({
            duration: 400,
            easing: "easeInOutExpo",
            scaleX: [0.05, 0.05],
            scaleY: [0, 1],
            perspective: "500px",
            delay: anime.random(0, 400),
          })
          .add({
            duration: 400,
            easing: "easeInOutExpo",
            scaleX: 1,
          })
          .add({ duration: 800, rotateZ: "20deg" }),
        anime({
          targets:
            ".hero-figure-box-01, .hero-figure-box-02, .hero-figure-box-03, .hero-figure-box-04, .hero-figure-box-08, .hero-figure-box-09, .hero-figure-box-10",
          duration: anime.random(600, 800),
          delay: anime.random(600, 800),
          rotate: [
            anime.random(-360, 360),
            function (e) {
              return e.getAttribute("data-rotation");
            },
          ],
          scale: [0.7, 1],
          opacity: [0, 1],
          easing: "easeInOutExpo",
        });
    }
  })();

  init3DCanvasBackground();
}

function init3DCanvasBackground() {
  const canvas = document.getElementById("bg3d");
  if (!canvas || canvas.dataset.initialized) return;
  canvas.dataset.initialized = "true";

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const numPoints = 38;
  const points = [];
  const fov = 380;

  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: (Math.random() - 0.5) * 1100,
      y: (Math.random() - 0.5) * 1100,
      z: Math.random() * 800 + 40,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      vz: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.8 + 1.2
    });
  }

  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let rotX = 0;
  let rotY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX - width / 2) * 0.00025;
    mouseY = (e.clientY - height / 2) * 0.00025;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    targetRotX += mouseX * 0.4;
    targetRotY += mouseY * 0.4;
    rotX += (targetRotX - rotX) * 0.04;
    rotY += (targetRotY - rotY) * 0.04;

    const projected = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      if (p.x < -650) p.x = 650;
      if (p.x > 650) p.x = -650;
      if (p.y < -650) p.y = 650;
      if (p.y > 650) p.y = -650;
      if (p.z < 20) p.z = 750;
      if (p.z > 750) p.z = 20;

      const cosY = Math.cos(rotX * 0.15 + 0.001);
      const sinY = Math.sin(rotX * 0.15 + 0.001);
      const rx = p.x * cosY - p.z * sinY;
      const rz = p.z * cosY + p.x * sinY;

      const scale = fov / (fov + rz);
      const px = rx * scale + width / 2;
      const py = p.y * scale + height / 2;

      projected.push({ x: px, y: py, z: rz, scale, radius: p.radius * scale });
    }

    // Disegna linee 3D di connessione
    ctx.lineWidth = 0.75;
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = projected[i].x - projected[j].x;
        const dy = projected[i].y - projected[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 135) {
          const alpha = (1 - dist / 135) * 0.35;
          ctx.strokeStyle = `rgba(26, 115, 232, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
          ctx.stroke();
        }
      }
    }

    // Disegna nodi particellari
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      const alpha = Math.max(0.18, Math.min(0.9, p.scale));
      ctx.fillStyle = `rgba(138, 180, 248, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.7, p.radius), 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}

// Avvio automatico al caricamento della pagina
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    init3DCanvasBackground();
    if (typeof animation === "function") animation();
  });
} else {
  init3DCanvasBackground();
  if (typeof animation === "function") animation();
}
