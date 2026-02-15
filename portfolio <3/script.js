document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     HELPERS
  ====================================================== */
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  /* =====================================================
     1) HOTSPOTS – “Et glimt af mig”
  ====================================================== */
  (() => {
    const hotspots = $$(".hotspot");
    const tooltip = $("#hotspot-tooltip");
    const wrapper = $(".basket-wrapper");

    if (!hotspots.length || !tooltip || !wrapper) return;

    const titleEl = $(".tooltip-title", tooltip);
    const textEl = $(".tooltip-text", tooltip);
    let activeHotspot = null;

    function positionTooltip(hotspot) {
      const hotspotRect = hotspot.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();

      const centerX = hotspotRect.left + hotspotRect.width / 2 - wrapperRect.left;
      const centerY = hotspotRect.top + hotspotRect.height / 2 - wrapperRect.top;

      tooltip.style.left = `${centerX}px`;
      tooltip.style.top = `${centerY}px`;
    }

    function showTooltip(hotspot) {
      if (titleEl) titleEl.textContent = hotspot.dataset.title || "";
      if (textEl) textEl.textContent = hotspot.dataset.text || "";
      positionTooltip(hotspot);
      tooltip.classList.add("visible");
      activeHotspot = hotspot;
    }

    function hideTooltip() {
      tooltip.classList.remove("visible");
      activeHotspot = null;
    }

    hotspots.forEach((hotspot) => {
      hotspot.addEventListener("mouseenter", () => showTooltip(hotspot));
      hotspot.addEventListener("mouseleave", hideTooltip);
      hotspot.addEventListener("click", (e) => {
        e.preventDefault();
        activeHotspot === hotspot ? hideTooltip() : showTooltip(hotspot);
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.classList.contains("hotspot") && !tooltip.contains(e.target)) {
        hideTooltip();
      }
    });
  })();

  /* =====================================================
     2) SKILLS – fade ind (icons)
  ====================================================== */
  (() => {
    const icons = $$(".skill-icon");
    if (!icons.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.3 }
    );

    icons.forEach((icon) => observer.observe(icon));
  })();

  /* =====================================================
     3) CONTENT-VIDEO (play/pause når content-section er i view)
  ====================================================== */
  (() => {
    const contentSection = $(".content-section");
    const videos = $$(".scroll-video");
    if (!contentSection || !videos.length) return;

    videos.forEach((video) => {
      video.loop = true;
      video.pause();
      video.currentTime = 0;
    });

    function checkVideos() {
      const rect = contentSection.getBoundingClientRect();
      const inView = rect.bottom > 0 && rect.top < window.innerHeight;

      videos.forEach((video) => {
        if (inView) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    }

    window.addEventListener("scroll", checkVideos, { passive: true });
    checkVideos();
  })();

  /* =====================================================
     4) PROJEKT-KARRUSEL (index) + dots + hover GIF på plader
  ====================================================== */

(function () {
  const projectSection = document.querySelector(".projects-section");
  if (!projectSection) return;

  const track = projectSection.querySelector(".carousel-track");
  const slides = track ? Array.from(track.children) : [];

  const prevBtn = projectSection.querySelector(".carousel-btn.prev");
  const nextBtn = projectSection.querySelector(".carousel-btn.next");
  const dots = Array.from(projectSection.querySelectorAll(".carousel-dots .dot"));

  const headingEl = projectSection.querySelector("#menu-heading");
  const descEl = projectSection.querySelector("#menu-description");

  if (!track || slides.length === 0) return;

  let currentIndex = 0;

  // --- Helpers ------------------------------------------------

  function clampIndex(i) {
    if (i < 0) return slides.length - 1;
    if (i >= slides.length) return 0;
    return i;
  }

  function resetAllPlateImgsToStatic() {
    projectSection.querySelectorAll(".plate-img").forEach((img) => {
      const staticSrc = img.dataset.static;
      if (staticSrc) img.src = staticSrc;
    });
  }

  function updateMenuText(i) {
    if (!headingEl || !descEl) return;

    const slide = slides[i];
    const heading = slide?.dataset?.heading || "";
    const description = slide?.dataset?.description || "";

    headingEl.textContent = heading;
    descEl.textContent = description;
  }

  function updateDots(i) {
    if (!dots.length) return;
    dots.forEach((dot, idx) => {
      dot.classList.toggle("is-active", idx === i);
      dot.setAttribute("aria-current", idx === i ? "true" : "false");
    });
  }

  function updateActiveClass(i) {
    slides.forEach((slide, idx) => {
      slide.classList.toggle("is-active", idx === i);
    });
  }

  function updateCarousel(i) {
    currentIndex = clampIndex(i);

    // Flyt track (1 slide = 100%)
    track.style.transform = `translateX(${-currentIndex * 100}%)`;

    updateActiveClass(currentIndex);
    updateDots(currentIndex);
    updateMenuText(currentIndex);

    // Når vi skifter slide, så sørg for at alle billeder står på PNG igen
    resetAllPlateImgsToStatic();
  }

  // --- Events: buttons + dots ---------------------------------

  nextBtn?.addEventListener("click", () => updateCarousel(currentIndex + 1));
  prevBtn?.addEventListener("click", () => updateCarousel(currentIndex - 1));

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => updateCarousel(i));
  });

  // --- Hover/focus: PNG <-> GIF -------------------------------
  // (kun hvis data-static + data-gif findes)

  projectSection.querySelectorAll(".plate-img").forEach((img) => {
    const staticSrc = img.dataset.static;
    const gifSrc = img.dataset.gif;
    if (!staticSrc || !gifSrc) return;

    // Hover (mus)
    img.addEventListener("mouseenter", () => {
      img.src = gifSrc;
    });

    img.addEventListener("mouseleave", () => {
      img.src = staticSrc;
    });

    // Fokus (tastatur) – focus/blur virker mest stabilt på linket,
    // men vi lader det også sidde på img hvis du tab’er til den.
    img.addEventListener("focus", () => {
      img.src = gifSrc;
    });

    img.addEventListener("blur", () => {
      img.src = staticSrc;
    });

    // Bonus: hvis brugeren tab’er til linket rundt om billedet
    const link = img.closest("a");
    if (link) {
      link.addEventListener("focus", () => (img.src = gifSrc));
      link.addEventListener("blur", () => (img.src = staticSrc));
    }
  });

  // --- Init ----------------------------------------------------
  updateCarousel(0);
})();


  /* =====================================================
     5) NAV: Dropdown + Smooth scroll + Header behavior
  ====================================================== */
  (() => {
    const header = $(".hero-header");
    const hero = $(".project-hero"); // hero på projektsider (hvis findes)
    const dropdown = $("#projectsDropdown");
    const dropdownBtn = $("#projectsBtn");
    const dropdownMenu = $("#projectsMenu");

    /* --- Dropdown --- */
    function setDropdown(open) {
      if (!dropdown || !dropdownBtn) return;
      dropdown.classList.toggle("open", open);
      dropdownBtn.setAttribute("aria-expanded", String(open));
    }

    if (dropdown && dropdownBtn) {
      dropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains("open");
        setDropdown(!isOpen);
      });

      dropdownMenu?.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (link) setDropdown(false);
      });

      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) setDropdown(false);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setDropdown(false);
      });
    }

    /* --- Smooth scroll --- */
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const target = $(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      });
    });

    /* --- Header show/hide --- */
    if (!header) return;

    const HIDE_DELAY = 2000;
    const HERO_OFFSET = 40;
    let lastY = window.scrollY;
    let hideTimer = null;
    let heroBottom = 0;

    function showHeader() {
      header.classList.add("scroll-up");
      header.classList.remove("scroll-down");
    }

    function hideHeader() {
      header.classList.add("scroll-down");
      header.classList.remove("scroll-up");
    }

    function clearHideTimer() {
      if (!hideTimer) return;
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    function computeHeroBottom() {
      if (!hero) {
        heroBottom = 140; // fallback hvis siden ikke har .project-hero
        return;
      }
      const rect = hero.getBoundingClientRect();
      heroBottom = window.scrollY + rect.bottom;
    }

    computeHeroBottom();
    window.addEventListener("load", computeHeroBottom);
    window.addEventListener("resize", computeHeroBottom);

    showHeader();

    window.addEventListener(
      "scroll",
      () => {
        const currentY = window.scrollY;
        const scrollingDown = currentY > lastY;

        const dropdownOpen = dropdown && dropdown.classList.contains("open");
        if (dropdownOpen) {
          showHeader();
          clearHideTimer();
          lastY = currentY;
          return;
        }

        const inHero = currentY < heroBottom - HERO_OFFSET;
        if (inHero) {
          showHeader();
          clearHideTimer();
          lastY = currentY;
          return;
        }

        if (!scrollingDown) {
          showHeader();
          clearHideTimer();
        } else {
          if (!hideTimer) {
            hideTimer = setTimeout(() => {
              const stillOutsideHero = window.scrollY >= heroBottom - HERO_OFFSET;
              if (stillOutsideHero) hideHeader();
              hideTimer = null;
            }, HIDE_DELAY);
          }
        }

        lastY = currentY;
      },
      { passive: true }
    );
  })();

  /* =====================================================
     6) OFFKITCHEN – Polaroid scroll-lock (ommig)
  ====================================================== */
  (() => {
    const offSection = $(".offkitchen");
    const photos = $$(".offkitchen .polaroid");
    if (!offSection || !photos.length) return;

    let progress = 0;
    const startY = 240;
    const endY = [-140, -140, -140, -140];

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = (t) => t * t * (3 - 2 * t);

    function render(p) {
      const step = 1 / photos.length;

      photos.forEach((img, i) => {
        const local = clamp01((p - i * step) / step);
        const t = smooth(local);
        const y = lerp(startY, endY[i], t);

        img.style.opacity = t;
        img.style.transform = `translateY(${y}px)`;
        img.style.zIndex = 10 + i;
      });
    }

    render(0);

    // Snap kun ved manuel scroll (wheel)
    let lastUserScrollAt = 0;
    window.addEventListener(
      "wheel",
      () => {
        lastUserScrollAt = Date.now();
      },
      { passive: true }
    );

    function allowAutoSnapNow() {
      return Date.now() - lastUserScrollAt < 600;
    }

    function inSnapZone() {
      const rect = offSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const tol = 140;

      const nearTop = Math.abs(rect.top) < tol;
      const heightOk = Math.abs(rect.height - vh) < 40;

      return nearTop && heightOk;
    }

    let snapping = false;
    function snapToSection() {
      if (snapping) return;
      snapping = true;

      offSection.scrollIntoView({ behavior: "smooth", block: "start" });

      setTimeout(() => {
        snapping = false;
      }, 450);
    }

    function isLocked() {
      const rect = offSection.getBoundingClientRect();
      const tol = 80; // <-- større tolerance = lettere at ramme
      return rect.top >= -tol && rect.top <= tol;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!allowAutoSnapNow()) return;
        if (inSnapZone()) snapToSection();
      },
      { passive: true }
    );

    let rafId = null;
    function scheduleRender() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        render(progress);
      });
    }

    window.addEventListener(
      "wheel",
      (e) => {
        if (!isLocked()) return;

        if (progress >= 1 && e.deltaY > 0) return;
        if (progress <= 0 && e.deltaY < 0) return;

        e.preventDefault();
        progress = clamp01(progress + e.deltaY * 0.0016);
        scheduleRender();
      },
      { passive: false }
    );
  })();

  /* =====================================================
     7) REVIEWS – LOOP (ommig)
  ====================================================== */
  (() => {
    const reviewsSection = $(".reviews-section");
    if (!reviewsSection) return;

    const track = $(".reviews-track", reviewsSection);
    const slides = $$(".reviews-slide", reviewsSection);
    const prevBtn = $(".reviews-prev", reviewsSection);
    const nextBtn = $(".reviews-next", reviewsSection);
    const dots = $$(".reviews-dots .dot", reviewsSection);

    if (!track || !slides.length || !prevBtn || !nextBtn) return;

    let index = 0;
    const total = slides.length; // fx 2

    function update() {
      // CSS: track=200% og slide=50%
      track.style.transform = `translateX(-${index * 50}%)`;

      if (dots.length) {
        dots.forEach((d, i) => {
          d.classList.toggle("is-active", i === index);
          d.setAttribute("aria-current", i === index ? "true" : "false");
        });
      }
    }

    function goTo(i) {
      index = (i + total) % total;
      update();
    }

    nextBtn.addEventListener("click", () => goTo(index + 1));
    prevBtn.addEventListener("click", () => goTo(index - 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

    update();
  })();

  /* =====================================================
     8) LIGHTBOX (collage)
  ====================================================== */
  (() => {
    const lightbox = $("#collageLightbox");
    if (!lightbox) return;

    const lightboxImg = $(".lightbox-img", lightbox);
    const collageBtn = $(".collage-btn");
    const collageThumb = $(".collage-thumb");

    if (!collageBtn || !collageThumb || !lightboxImg) return;

    function openLightbox() {
      const fullSrc = collageThumb.getAttribute("data-full") || collageThumb.src;
      lightboxImg.src = fullSrc;
      lightboxImg.alt = collageThumb.alt || "Collage i stor visning";

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      lightboxImg.src = "";
      lightboxImg.alt = "";
    }

    collageBtn.addEventListener("click", openLightbox);
    lightbox.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  })();

  /* =====================================================
     9) RESULT-VIDEO (projektsider) – play/reset ved view
  ====================================================== */
  (() => {
    const section = $(".project-section.result");
    const video = $(".result-video");
    if (!section || !video) return;

    let wasInView = false;

    function playFromStart() {
      video.currentTime = 0;
      const playPromise = video.play();
      playPromise?.catch?.(() => {});
    }

    function resetVideo() {
      video.pause();
      video.currentTime = 0;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!wasInView) {
              playFromStart();
              wasInView = true;
            }
          } else {
            if (wasInView) {
              resetVideo();
              wasInView = false;
            }
          }
        });
      },
      { threshold: 0.45 }
    );

    observer.observe(section);
  })();

  /* =====================================================
     10) KOKKEHAT (index) – loop GIF (png -> gif -> png)
  ====================================================== */
  (() => {
    const kokkehat = $("#kokkehat");
    if (!kokkehat) return;

    const staticHat = "billeder/kokkehat.png";
    const animatedHat = "billeder/kokkehat.gif";
    const animationLength = 2500;
    const loopDelay = 10000;

    function playHat() {
      kokkehat.src = animatedHat;
      setTimeout(() => {
        kokkehat.src = staticHat;
      }, animationLength);
    }

    playHat();
    setInterval(playHat, loopDelay);
  })();

  /* =====================================================
     11) OM MIG GIF (index) – spil når #om-mig er i view
  ====================================================== */
  (() => {
    const img = $("#omMigGif");
    const section = $("#om-mig");
    if (!img || !section) return;

    const staticSrc = img.dataset.static;
    const animatedSrc = img.dataset.animated;
    const animationLength = 2500;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = animatedSrc;
            setTimeout(() => {
              img.src = staticSrc;
            }, animationLength);
          } else {
            img.src = staticSrc;
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
  })();

  /* =====================================================
     12) SOFTSKILLS GIFs (index) – sekvens når sektion er i view
  ====================================================== */
  (() => {
    const section = $("#softskills");
    const cards = $$(".softskills-gif");
    if (!section || !cards.length) return;

    const gifDuration = 2500;
    const stagger = 1000;

    let timeouts = [];
    let isPlaying = false;

    function clearTimers() {
      timeouts.forEach((t) => clearTimeout(t));
      timeouts = [];
    }

    function resetToStatic() {
      cards.forEach((img) => {
        const staticSrc = img.dataset.static;
        if (staticSrc) img.src = staticSrc;
      });
    }

    function playSequence() {
      if (isPlaying) return;
      isPlaying = true;

      resetToStatic();
      clearTimers();

      cards.forEach((img, i) => {
        const animatedSrc = img.dataset.animated;
        const staticSrc = img.dataset.static;
        if (!animatedSrc || !staticSrc) return;

        timeouts.push(
          setTimeout(() => {
            img.src = animatedSrc;
            timeouts.push(
              setTimeout(() => {
                img.src = staticSrc;
              }, gifDuration)
            );
          }, i * stagger)
        );
      });

      timeouts.push(
        setTimeout(() => {
          isPlaying = false;
        }, (cards.length - 1) * stagger + gifDuration + 50)
      );
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playSequence();
          } else {
            clearTimers();
            resetToStatic();
            isPlaying = false;
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
  })();

  /* =====================================================
     13) OM-MIG SIDE HERO GIF (ommig.html) – #om-hero / #kokkenGif
  ====================================================== */
  (() => {
    const section = $("#om-hero");
    const img = $("#kokkenGif");
    if (!section || !img) return;

    const staticSrc = img.dataset.static;
    const animatedSrc = img.dataset.animated;
    const gifDuration = 2500;
    let timer = null;

    function playGif() {
      if (timer) clearTimeout(timer);
      img.src = animatedSrc;
      timer = setTimeout(() => {
        img.src = staticSrc;
      }, gifDuration);
    }

    img.src = staticSrc;
    playGif();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playGif();
          } else {
            if (timer) clearTimeout(timer);
            img.src = staticSrc;
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
  })();
});
