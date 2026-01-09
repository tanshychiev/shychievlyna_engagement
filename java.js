console.log("✅ java.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // ELEMENTS
  // =========================
  const intro = document.getElementById("intro-overlay");
  const openBtn = document.getElementById("open-btn");
  const site = document.getElementById("site");

  const music = document.getElementById("bg-music");
  const muteBtn = document.getElementById("mute-btn");
  const topControls =
    document.getElementById("top-controls") ||
    document.querySelector(".top-controls");

  const videoOverlay = document.getElementById("video-overlay");
  const video = document.getElementById("intro-video");

  const guestNameEl = document.getElementById("guest-name");
  const flowersBox = document.getElementById("flowers");

  const bg1 = document.querySelector(".bg-1");
  const bg2 = document.querySelector(".bg-2");

  // =========================
  // SAFETY CHECK
  // =========================
  const missing = [];
  if (!intro) missing.push("intro-overlay");
  if (!openBtn) missing.push("open-btn");
  if (!site) missing.push("site");
  if (!music) missing.push("bg-music");
  if (!muteBtn) missing.push("mute-btn");
  if (!videoOverlay) missing.push("video-overlay");
  if (!video) missing.push("intro-video");

  if (missing.length) {
    console.error("❌ Missing HTML id:", missing.join(", "));
    alert("Missing HTML id: " + missing.join(", "));
    return;
  }

  // =========================
  // START STATE
  // =========================
  site.classList.add("site-hidden");

  // lock scroll during intro
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  // hide video overlay at start
  videoOverlay.style.display = "none";
  videoOverlay.style.zIndex = "99999999";

  // backgrounds
  if (bg1 && bg2) {
    bg1.classList.add("active");
    bg2.classList.remove("active");
  }

  // hide top controls until site shows
  if (topControls) topControls.classList.remove("show");

  // =========================
  // GUEST NAME FROM GOOGLE APPS SCRIPT (TYPE EFFECT)
  // =========================
  if (guestNameEl) {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get("code") || "").trim();

    const WEB_APP_URL =
      "https://script.google.com/macros/s/AKfycbzl3dl8Hw0TklP7FSCohYBquuaOd57U2gBYi6UujlwQ522nxe-Tv-uN_7HmtU1giWjbVQ/exec";

    function typeName(name) {
      name = (name || "").replace(/\+/g, " ").trim();
      if (!name) name = "Honored Guest";

      guestNameEl.textContent = "";
      let i = 0;

      function step() {
        if (i < name.length) {
          guestNameEl.textContent += name.charAt(i);
          i++;
          setTimeout(step, 110);
        }
      }
      step();
    }

    if (!code) {
      typeName(guestNameEl.textContent);
    } else {
      fetch(`${WEB_APP_URL}?code=${encodeURIComponent(code)}`)
        .then((res) => res.json())
        .then((data) => typeName(data.name))
        .catch(() => typeName("Honored Guest"));
    }
  }

  // =========================
  // MUSIC SETUP + MUTE
  // =========================
  music.volume = 0.6;
  music.muted = false;
  setMuteIcon(false);

  muteBtn.addEventListener("click", async () => {
    // ensure user gesture can start music
    if (music.paused) {
      try {
        await music.play();
      } catch {}
    }
    music.muted = !music.muted;
    setMuteIcon(music.muted);
  });

  function setMuteIcon(isMuted) {
    muteBtn.innerHTML = isMuted
      ? '<i class="fa-solid fa-volume-xmark"></i>'
      : '<i class="fa-solid fa-volume-high"></i>';
  }

  // =========================
  // VIDEO SETUP
  // =========================
  video.muted = true; // important for mobile
  video.controls = false;

  // If your video file has audio but you want ONLY video visuals:
  // video.muted = true; (keep)
  // music will play after video ends

  // =========================
  // INTRO -> PLAY VIDEO -> SHOW SITE
  openBtn.addEventListener("click", () => {
    // hide intro
    intro.style.display = "none";

    // show video overlay
    videoOverlay.style.display = "flex";
    videoOverlay.style.zIndex = "99999999";

    // lock scroll
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // ▶️ play VIDEO (muted, visual only)
    video.muted = true;
    video.currentTime = 0;
    video.play().catch(() => {});

    // 🎵 play MUSIC (sound)
    music.muted = false;
    music.volume = 0.6;
    music.currentTime = 0;
    music.play().catch(() => {});
  });

  video.addEventListener("ended", finishIntro);
  video.addEventListener("error", finishIntro);

  function finishIntro() {
    console.log("✅ finishIntro()");
    try {
      video.pause();
    } catch {}

    videoOverlay.style.display = "none";

    // switch background
    if (bg1 && bg2) {
      bg1.classList.remove("active");
      bg2.classList.add("active");
    }

    // show site
    site.classList.remove("site-hidden");

    // unlock scroll
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    // show top controls
    if (topControls) topControls.classList.add("show");

    // start background music (after intro)
    music.play().catch(() => {});

    // start animations
    startFalling();
    initGalleryReveal();
    initPolaroidGallery();
  }

  // =========================
  // FALLING ICONS ANIMATION
  // =========================
  let fallTimer = null;

  function startFalling() {
    if (!flowersBox) return;

    flowersBox.innerHTML = "";
    if (fallTimer) clearInterval(fallTimer);

    const ICONS = ["💠", "🫧", "❄️", "💙", "🔹", "✨", "💖", "💛", "🌟"];
    const rand = (min, max) => Math.random() * (max - min) + min;

    function spawnOne() {
      const f = document.createElement("div");
      f.className = "flower";
      f.textContent = ICONS[Math.floor(Math.random() * ICONS.length)];

      f.style.position = "absolute";
      f.style.left = rand(0, 100) + "%";
      f.style.top = "-60px";
      f.style.fontSize = rand(12, 25) + "px";
      f.style.pointerEvents = "none";

      flowersBox.appendChild(f);

      const driftX = rand(-90, 90);
      const fallDist = rand(900, 2400);
      const dur = rand(7, 12) * 1000;
      const delay = rand(0, 600);

      const anim = f.animate(
        [
          { transform: "translate(0px, 0px)", opacity: 0 },
          { opacity: 1, offset: 0.12 },
          { transform: `translate(${driftX}px, ${fallDist}px)`, opacity: 0 },
        ],
        {
          duration: dur,
          delay,
          iterations: 1,
          easing: "linear",
          fill: "forwards",
        }
      );

      anim.onfinish = () => f.remove();
    }

    for (let i = 0; i < 6; i++) setTimeout(spawnOne, i * 250);
    fallTimer = setInterval(spawnOne, 900);
  }

  // =========================
  // GALLERY REVEAL (optional)
  // =========================
  function initGalleryReveal() {
    const targets = document.querySelectorAll(
      ".gallery-feature, .g-item, .polaroid"
    );
    if (!targets.length) return;

    targets.forEach((el) => el.classList.add("reveal"));

    let lastY = window.scrollY;
    let scrollDir = "down";

    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        scrollDir = y > lastY ? "down" : "up";
        lastY = y;
      },
      { passive: true }
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.remove("from-bottom", "from-top");
            void el.offsetWidth;
            el.classList.add(scrollDir === "down" ? "from-bottom" : "from-top");
          }
        });
      },
      { threshold: 0.25 }
    );

    targets.forEach((el) => observer.observe(el));
  }

  // =========================
  // COUNTDOWN TIMER
  // =========================
  const targetDate = new Date("2026-01-30T07:00:00").getTime();
  const dEl = document.getElementById("cd-days");
  const hEl = document.getElementById("cd-hours");
  const mEl = document.getElementById("cd-mins");
  const sEl = document.getElementById("cd-secs");

  function updateCountdown() {
    if (!dEl || !hEl || !mEl || !sEl) return;

    const diff = targetDate - Date.now();

    if (diff <= 0) {
      dEl.textContent =
        hEl.textContent =
        mEl.textContent =
        sEl.textContent =
          "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    dEl.textContent = String(days).padStart(2, "0");
    hEl.textContent = String(hours).padStart(2, "0");
    mEl.textContent = String(mins).padStart(2, "0");
    sEl.textContent = String(secs).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // =========================
  // POLAROID STACK GALLERY
  // =========================
  function initPolaroidGallery() {
    const stack = document.getElementById("polaroidStack");
    if (!stack) return;

    const photos = [
      "img/love26.jpg",
      "img/love 7.jpg",
      "img/love2.jpg",
      "img/love1.jpg",
      "img/love 6.jpg",
      "img/love3.jpg",
      "img/love 5.jpg",
      "img/love 8.jpg",
      "img/love11.jpg",
      "img/love12.jpg",
      "img/love13.jpg",
      "img/love14.jpg",
      "img/love115.jpg",
      "img/love16.jpg",
      "img/love18.jpg",
      "img/love17.jpg",
      "img/love22.jpg",
      "img/love23.jpg",
      "img/love27.jpg",
    ];

    let index = 0;
    const imgs = stack.querySelectorAll("img");

    function render() {
      imgs.forEach((img, i) => {
        img.src = photos[(index + i) % photos.length];
      });
    }

    render();

    stack.addEventListener("click", () => {
      index = (index + 1) % photos.length;
      render();
    });

    imgs.forEach((img) => {
      img.onerror = () => console.log("❌ Missing image:", img.src);
    });
  }
});

