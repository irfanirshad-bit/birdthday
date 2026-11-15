// ==========================================
// PERSONAL BIRTHDAY MESSAGE
// ==========================================
const PERSONAL_MESSAGE = `You're not just my favourite cousin; you're one of the most special people in my life.

I don't have a huge circle of people around me, and honestly, I don't need one. I have a few people who genuinely matter to me, and you're definitely one of them.

You have a special place in my life that words can't fully explain. I'm genuinely grateful to have you around, and I hope this birthday brings you all the happiness you deserve.

No matter how busy life gets or how far we go, you'll always be someone special to me.

Happy 22nd Birthday! ❤️`;

// Populate message in the letter card
const personalMessageElem = document.getElementById("personalMessage");
if (personalMessageElem) {
  personalMessageElem.textContent = PERSONAL_MESSAGE;
}

// Screen Navigation Logic
const screens = [...document.querySelectorAll(".screen")];

function showScreen(id) {
  screens.forEach(screen => {
    const isActive = screen.id === id;
    screen.classList.toggle("active", isActive);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  // Screen-specific animations & triggers
  if (id === "reveal") {
    stopContinuousFireworks();
    launchFireworks(6);
    burstConfetti(80);
  } else if (id === "letter") {
    stopContinuousFireworks();
    const wrapper = document.getElementById("envelopeWrapper");
    if (wrapper) {
      setTimeout(() => {
        wrapper.classList.add("opened");
      }, 500);
    }
  } else if (id === "gallery") {
    stopContinuousFireworks();
    const polaroids = document.querySelectorAll(".polaroid");
    polaroids.forEach(p => {
      p.classList.remove("animate-in");
      void p.offsetWidth; // Force reflow
      p.classList.add("animate-in");
    });
    launchFireworks(6);
  } else if (id === "finale") {
    launchFireworks(12);
    burstConfetti(120);
    startContinuousFireworks();
  } else {
    stopContinuousFireworks();
  }
}

document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => showScreen(button.dataset.next));
});

document.getElementById("replayBtn")?.addEventListener("click", () => {
  stopFireworks();
  stopContinuousFireworks();
  const wrapper = document.getElementById("envelopeWrapper");
  if (wrapper) wrapper.classList.remove("opened");
  showScreen("intro");
  resetArrow();
});

// Envelope Click Handler (Open and Close Toggle)
const envelopeWrapper = document.getElementById("envelopeWrapper");
const openEnvelopeBtn = document.getElementById("openEnvelopeBtn");

if (envelopeWrapper) {
  if (openEnvelopeBtn) {
    openEnvelopeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      envelopeWrapper.classList.add("opened");
    });
  }
  envelopeWrapper.addEventListener("click", () => {
    envelopeWrapper.classList.toggle("opened");
  });
}

// Slingshot & Arrow Mechanics
const game = document.getElementById("gameArea");
const arrow = document.getElementById("arrow");
const heart = document.getElementById("heartTarget");
const hint = document.getElementById("dragHint");
const bandLeft = document.getElementById("bandLeft");
const bandRight = document.getElementById("bandRight");

let dragging = false;
let startX = 0, startY = 0;
let dx = 0, dy = 0;
let launched = false;

function updateBands(currentDx = 0, currentDy = 0) {
  if (!game || !bandLeft || !bandRight) return;
  const gameRect = game.getBoundingClientRect();
  const width = gameRect.width || 460;
  const height = gameRect.height || 370;

  // Fork tips relative to gameArea
  const forkLeftX = width * 0.5 - 34;
  const forkRightX = width * 0.5 + 34;
  const forkY = height - 95;

  // Arrow nock position
  const nockX = width * 0.5 + currentDx;
  const nockY = height - 60 + currentDy;

  bandLeft.setAttribute("x1", forkLeftX);
  bandLeft.setAttribute("y1", forkY);
  bandLeft.setAttribute("x2", nockX);
  bandLeft.setAttribute("y2", nockY);

  bandRight.setAttribute("x1", forkRightX);
  bandRight.setAttribute("y1", forkY);
  bandRight.setAttribute("x2", nockX);
  bandRight.setAttribute("y2", nockY);
}

function resetArrow() {
  launched = false;
  dragging = false;
  dx = 0;
  dy = 0;
  if (!arrow || !heart || !hint) return;
  arrow.style.transition = "none";
  arrow.style.transform = "translate(0, 0) rotate(0deg)";
  arrow.style.opacity = "1";
  hint.style.opacity = "1";
  heart.classList.remove("pop-burst");
  heart.style.opacity = "1";
  heart.style.transform = "translateX(-50%) scale(1)";
  updateBands(0, 0);
}

function pointerDown(e) {
  if (launched) return;
  dragging = true;
  startX = e.clientX - dx;
  startY = e.clientY - dy;
  arrow.style.transition = "none";
  if (e.pointerId && arrow.setPointerCapture) {
    arrow.setPointerCapture(e.pointerId);
  }
  e.preventDefault();
}

function pointerMove(e) {
  if (!dragging || launched) return;
  const rawDx = e.clientX - startX;
  const rawDy = e.clientY - startY;

  // Constrain pulling down (dy: 0 to 130px) and aiming left/right (dx: -75px to 75px)
  dx = Math.max(-75, Math.min(75, rawDx));
  dy = Math.max(0, Math.min(130, rawDy));

  const rotation = dx * 0.25;
  arrow.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;
  updateBands(dx, dy);

  if (dy > 15 && hint) {
    hint.style.opacity = "0";
  }
}

function pointerUp(e) {
  if (!dragging) return;
  dragging = false;

  if (e && e.pointerId && arrow.hasPointerCapture?.(e.pointerId)) {
    arrow.releasePointerCapture(e.pointerId);
  }

  // If pulled back less than 25px, snap back
  if (dy < 25) {
    arrow.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    arrow.style.transform = "translate(0, 0) rotate(0deg)";
    dx = 0;
    dy = 0;
    updateBands(0, 0);
    if (hint) hint.style.opacity = "1";
    return;
  }

  // LAUNCH ARROW
  launched = true;
  if (hint) hint.style.opacity = "0";

  updateBands(0, 0);

  const flyY = -(game.getBoundingClientRect().height - 110);
  const flyX = -dx * 0.8;
  const launchRotation = -dx * 0.25;

  arrow.style.transition = "transform 0.38s cubic-bezier(0.15, 0.85, 0.3, 1), opacity 0.15s 0.32s";
  arrow.style.transform = `translate(${flyX}px, ${flyY}px) rotate(${launchRotation}deg) scale(0.9)`;

  setTimeout(() => {
    arrow.style.opacity = "0";
    if (heart) {
      heart.classList.add("pop-burst");
      const heartRect = heart.getBoundingClientRect();
      const burstX = heartRect.left + heartRect.width / 2;
      const burstY = heartRect.top + heartRect.height / 2;
      burstHeartParticles(burstX, burstY, 35);
      burst(burstX, burstY, 45);
    }
    launchFireworks(6);

    setTimeout(() => {
      showScreen("reveal");
    }, 500);
  }, 360);
}

if (arrow) {
  arrow.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerup", pointerUp);
  window.addEventListener("pointercancel", pointerUp);
  window.addEventListener("resize", () => updateBands(dx, dy));

  arrow.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && !launched) {
      e.preventDefault();
      dx = 0;
      dy = 85;
      pointerUp();
    }
  });
}

// Cake Interaction
const cakeContainer = document.getElementById("cakeContainer");
if (cakeContainer) {
  cakeContainer.addEventListener("click", () => {
    cakeContainer.classList.remove("cake-bounce");
    void cakeContainer.offsetWidth; // Force reflow
    cakeContainer.classList.add("cake-bounce");

    const rect = cakeContainer.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    burstHeartParticles(x, y, 22);
    burst(x, y, 35);
    launchFireworks(4);
  });

  cakeContainer.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cakeContainer.click();
    }
  });
}

// Background Floating Hearts Generator
const heartsContainer = document.getElementById("floatingHeartsBg");
const heartSymbols = ["♡", "💗", "💖", "💕", "✨"];

function createBackgroundHeart() {
  if (!heartsContainer) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const h = document.createElement("div");
  h.className = "bg-heart";
  h.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  h.style.left = Math.random() * 100 + "%";

  const duration = 8 + Math.random() * 10;
  h.style.animationDuration = duration + "s";
  h.style.fontSize = (14 + Math.random() * 14) + "px";

  heartsContainer.appendChild(h);
  setTimeout(() => {
    h.remove();
  }, duration * 1000);
}

setInterval(createBackgroundHeart, 2200);
for (let i = 0; i < 5; i++) {
  setTimeout(createBackgroundHeart, i * 400);
}

// Music Toggle Feature
const musicToggle = document.getElementById("musicToggle");
const bgAudio = document.getElementById("bgAudio");

if (musicToggle && bgAudio) {
  musicToggle.addEventListener("click", () => {
    if (bgAudio.paused) {
      bgAudio.play().then(() => {
        musicToggle.classList.remove("no-audio");
        musicToggle.classList.add("playing");
        musicToggle.querySelector(".music-text").textContent = "Playing";
      }).catch(err => {
        console.log("Audio file not found or browser prevented autoplay:", err);
        musicToggle.classList.add("no-audio");
        const musicText = musicToggle.querySelector(".music-text");
        if (musicText) musicText.textContent = "No Audio";
        setTimeout(() => {
          musicToggle.classList.remove("no-audio");
          if (musicText) musicText.textContent = "Music";
        }, 2200);
      });
    } else {
      bgAudio.pause();
      musicToggle.classList.remove("playing", "no-audio");
      musicToggle.querySelector(".music-text").textContent = "Music";
    }
  });
}

// Particle Canvas Fireworks & Confetti
const canvas = document.getElementById("fireworks");
const ctx = canvas ? canvas.getContext("2d") : null;
let particles = [], animationId = null, fireworksTimer = null, continuousTimer = null;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const particleColors = ["#f4b8d3", "#b8dcf2", "#fceaf1", "#ffffff", "#d68bad", "#ffd166"];

function burst(x, y, count = 42) {
  if (!ctx) return;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 4.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 60 + Math.random() * 35,
      max: 95,
      size: 2.5 + Math.random() * 2.5,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      gravity: 0.04
    });
  }
  if (!animationId) animate();
}

function burstHeartParticles(x, y, count = 25) {
  if (!ctx) return;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      life: 50 + Math.random() * 30,
      size: 14 + Math.random() * 10,
      color: "#e08bb3",
      gravity: 0.02,
      isEmoji: true,
      char: Math.random() > 0.4 ? "💗" : "✨"
    });
  }
  if (!animationId) animate();
}

function burstConfetti(count = 80) {
  if (!ctx) return;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * innerWidth,
      y: -20 - Math.random() * (innerHeight * 0.4),
      vx: (Math.random() - 0.5) * 2.5,
      vy: 1.5 + Math.random() * 3.5,
      life: 160 + Math.random() * 80,
      size: 4 + Math.random() * 4,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      gravity: 0.015,
      confetti: true,
      rotation: Math.random() * 6
    });
  }
  if (!animationId) animate();
}

function launchFireworks(count = 5) {
  let made = 0;
  clearInterval(fireworksTimer);
  fireworksTimer = setInterval(() => {
    burst(
      innerWidth * (0.15 + Math.random() * 0.7),
      innerHeight * (0.15 + Math.random() * 0.45),
      35 + Math.floor(Math.random() * 25)
    );
    if (++made >= count) clearInterval(fireworksTimer);
  }, 400);
  if (!animationId) animate();
}

function startContinuousFireworks() {
  stopContinuousFireworks();
  continuousTimer = setInterval(() => {
    burst(
      innerWidth * (0.15 + Math.random() * 0.7),
      innerHeight * (0.15 + Math.random() * 0.45),
      30 + Math.floor(Math.random() * 20)
    );
  }, 1800);
}

function stopContinuousFireworks() {
  if (continuousTimer) {
    clearInterval(continuousTimer);
    continuousTimer = null;
  }
}

function stopFireworks() {
  clearInterval(fireworksTimer);
  fireworksTimer = null;
  stopContinuousFireworks();
  particles = [];
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  if (ctx) ctx.clearRect(0, 0, innerWidth, innerHeight);
}

function animate() {
  if (!ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter(p => p.life > 0 && p.y < innerHeight + 40);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.99;
    p.life--;

    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 25));

    if (p.isEmoji) {
      ctx.font = `${p.size}px sans-serif`;
      ctx.fillText(p.char, p.x, p.y);
    } else if (p.confetti) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation || 0) + p.life * 0.04);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.8);
      ctx.restore();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  if (particles.length) {
    animationId = requestAnimationFrame(animate);
  } else {
    animationId = null;
  }
}

// Initial slingshot band render
updateBands(0, 0);
