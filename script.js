document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const navLinks = document.querySelectorAll("[data-nav-link]");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const sections = document.querySelectorAll("[data-section]");
const revealItems = document.querySelectorAll("[data-reveal]");
const currentYear = document.querySelector("#current-year");
const siteHeader = document.querySelector(".site-header");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const getHeaderOffset = () => siteHeader?.offsetHeight ?? 0;

const syncHeaderOffset = () => {
  document.documentElement.style.setProperty("--header-offset", `${getHeaderOffset()}px`);
};

const closeNavigation = () => {
  if (!menuToggle || !navigation) {
    return;
  }

  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

const scrollToSection = (section) => {
  const sectionTop = window.scrollY + section.getBoundingClientRect().top;
  const top = Math.max(0, sectionTop - getHeaderOffset() - 16);

  window.scrollTo({
    top,
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
  });
};

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navigation.classList.toggle("is-open");
  });
}

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
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

  syncActiveLinkWithScroll();
  window.addEventListener("scroll", syncActiveLinkWithScroll, { passive: true });
  window.addEventListener("resize", () => {
    syncHeaderOffset();
    syncActiveLinkWithScroll();
  });
  window.addEventListener("load", () => {
    syncHeaderOffset();
    syncActiveLinkWithScroll();
  });
  window.addEventListener("hashchange", () => {
    const targetId = window.location.hash.replace("#", "");

    if (!targetId) {
      return;
    }

    setActiveLink(targetId);
  });
} else {
  window.addEventListener("resize", syncHeaderOffset);
  window.addEventListener("load", syncHeaderOffset);
}

if (revealItems.length) {
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
