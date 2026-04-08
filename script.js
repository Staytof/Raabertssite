document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const navLinks = document.querySelectorAll("[data-nav-link]");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const sections = document.querySelectorAll("[data-section]");
const revealItems = document.querySelectorAll("[data-reveal]");
const images = document.querySelectorAll("img");
const currentYear = document.querySelector("#current-year");
const siteHeader = document.querySelector(".site-header");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const getHeaderOffset = () => siteHeader?.offsetHeight ?? 0;
const isMobileNavigationViewport = () => window.innerWidth <= 900;
const prefersMotionReduction = () => prefersReducedMotion.matches;

const syncHeaderOffset = () => {
  document.documentElement.style.setProperty("--header-offset", `${getHeaderOffset()}px`);
};

const setNavigationState = (shouldOpen) => {
  if (!menuToggle || !navigation) {
    return;
  }

  navigation.classList.toggle("is-open", shouldOpen);
  menuToggle.classList.toggle("is-open", shouldOpen);
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
  menuToggle.setAttribute("aria-label", shouldOpen ? "Fechar menu" : "Abrir menu");
  document.body.classList.toggle("nav-open", shouldOpen && isMobileNavigationViewport());
};

const closeNavigation = () => {
  setNavigationState(false);
};

const scrollToSection = (section, forcedBehavior) => {
  const sectionTop = window.scrollY + section.getBoundingClientRect().top;
  const top = Math.max(0, sectionTop - getHeaderOffset() - 16);

  window.scrollTo({
    top,
    behavior: forcedBehavior ?? (prefersMotionReduction() ? "auto" : "smooth"),
  });
};

const syncHashTarget = (forcedBehavior = "auto") => {
  const targetId = window.location.hash.replace("#", "");

  if (!targetId) {
    return;
  }

  const targetSection = document.getElementById(targetId);

  if (!targetSection) {
    return;
  }

  setActiveLink(targetId);
  scrollToSection(targetSection, forcedBehavior);
};

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

images.forEach((image) => {
  image.setAttribute("draggable", "false");
});

document.addEventListener("dragstart", (event) => {
  if (event.target instanceof HTMLImageElement) {
    event.preventDefault();
  }
});

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
  document.addEventListener(
    eventName,
    (event) => {
      event.preventDefault();
    },
    { passive: false }
  );
});

document.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  { passive: false }
);

let lastTouchEnd = 0;

document.addEventListener(
  "touchend",
  (event) => {
    const now = Date.now();

    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }

    lastTouchEnd = now;
  },
  { passive: false }
);

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const ctrlOrMeta = event.ctrlKey || event.metaKey;
  const isBlockedInspectorShortcut =
    event.key === "F12" ||
    (ctrlOrMeta && key === "u") ||
    (ctrlOrMeta && event.shiftKey && ["i", "j", "c"].includes(key));

  if (isBlockedInspectorShortcut) {
    event.preventDefault();
    event.stopPropagation();
  }
});

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    setNavigationState(!expanded);
  });

  document.addEventListener("click", (event) => {
    if (!isMobileNavigationViewport()) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    if (navigation.contains(target) || menuToggle.contains(target)) {
      return;
    }

    closeNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
    }
  });
}

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const targetId = link.getAttribute("href")?.slice(1);

    if (!targetId) {
      return;
    }

    const targetSection = document.getElementById(targetId);

    if (!targetSection) {
      return;
    }

    event.preventDefault();
    setActiveLink(targetId);
    closeNavigation();

    if (window.location.hash !== `#${targetId}`) {
      history.pushState(null, "", `#${targetId}`);
    }

    scrollToSection(targetSection);
  });
});

syncHeaderOffset();

if (sections.length) {
  let scrollSyncFrame = 0;

  const syncActiveLinkWithScroll = () => {
    const currentPosition = window.scrollY + getHeaderOffset() + 48;
    let activeSectionId = sections[0].id;

    sections.forEach((section) => {
      if (currentPosition >= section.offsetTop) {
        activeSectionId = section.id;
      }
    });

    setActiveLink(activeSectionId);
  };

  const queueScrollSync = () => {
    if (scrollSyncFrame) {
      return;
    }

    scrollSyncFrame = window.requestAnimationFrame(() => {
      scrollSyncFrame = 0;
      syncActiveLinkWithScroll();
    });
  };

  syncActiveLinkWithScroll();
  window.addEventListener("scroll", queueScrollSync, { passive: true });
  window.addEventListener("resize", () => {
    if (!isMobileNavigationViewport()) {
      closeNavigation();
    }

    syncHeaderOffset();
    syncActiveLinkWithScroll();
  });
  window.addEventListener("load", () => {
    syncHeaderOffset();
    syncActiveLinkWithScroll();
    syncHashTarget("auto");
  });
  window.addEventListener("hashchange", () => {
    syncHashTarget("auto");
  });
} else {
  window.addEventListener("resize", syncHeaderOffset);
  window.addEventListener("load", syncHeaderOffset);
}

if (revealItems.length) {
  if (prefersMotionReduction() || typeof IntersectionObserver === "undefined") {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }
}
