const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector(".primary-navigation");

function closeNavigation() {
  if (!menuToggle || !primaryNavigation) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Otvoriť navigáciu");
  primaryNavigation.classList.remove("is-open");
}

if (menuToggle && primaryNavigation) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Otvoriť navigáciu" : "Zavrieť navigáciu");
    primaryNavigation.classList.toggle("is-open", !isExpanded);
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeNavigation();
  });

  document.addEventListener("click", (event) => {
    if (
      event.target instanceof Node
      && !menuToggle.contains(event.target)
      && !primaryNavigation.contains(event.target)
    ) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    document.querySelectorAll("[data-category]").forEach((item) => {
      item.hidden = filter !== "vsetko" && item.dataset.category !== filter;
    });
  });
});

const joinForm = document.querySelector("[data-join-form]");
const galleryLightbox = document.querySelector("[data-gallery-lightbox]");
const galleryGrid = document.querySelector(".gallery-grid");

if (galleryLightbox instanceof HTMLDialogElement) {
  const lightboxImage = galleryLightbox.querySelector("[data-lightbox-image]");
  const closeButton = galleryLightbox.querySelector("[data-lightbox-close]");

  galleryGrid?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest(".gallery-open") : null;
    const image = button?.querySelector("img");
    if (!image || !lightboxImage) return;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    galleryLightbox.showModal();
  });

  closeButton?.addEventListener("click", () => galleryLightbox.close());
  galleryLightbox.addEventListener("click", (event) => {
    if (event.target === galleryLightbox) galleryLightbox.close();
  });
}

async function loadGalleryAssets() {
  if (!galleryGrid) return;

  try {
    const response = await fetch("assets/");
    if (!response.ok) return;

    const directory = new DOMParser().parseFromString(await response.text(), "text/html");
    const assetsUrl = new URL("assets/", document.baseURI);
    const imageUrls = [...directory.querySelectorAll("a[href]")]
      .map((link) => new URL(link.getAttribute("href"), assetsUrl))
      .map((url) => ({
        url,
        number: Number.parseInt(decodeURIComponent(url.pathname.split("/").pop() || ""), 10)
      }))
      .filter(({ url, number }) => {
        const filename = decodeURIComponent(url.pathname.split("/").pop() || "");
        return number >= 1 && number <= 22 && /^\d+\.\.?jpg$/i.test(filename);
      })
      .sort((left, right) => left.number - right.number);

    if (imageUrls.length === 0) return;

    const galleryItems = imageUrls.map(({ url, number }) => {
      const figure = document.createElement("figure");
      const button = document.createElement("button");
      const image = document.createElement("img");

      figure.className = "gallery-card";
      button.className = "gallery-open";
      button.type = "button";
      button.setAttribute("aria-label", `Zväčšiť fotografiu ${number}`);
      image.src = url.href;
      image.alt = `Fotografia folklórneho súboru ${number}`;

      button.append(image);
      figure.append(button);
      return figure;
    });

    galleryGrid.replaceChildren(...galleryItems);
  } catch {
    return;
  }
}

void loadGalleryAssets();

if (joinForm instanceof HTMLFormElement) {
  const submitButton = joinForm.querySelector('button[type="submit"]');
  const formStatus = joinForm.parentElement?.querySelector("[data-form-status]");

  if (submitButton instanceof HTMLButtonElement && formStatus instanceof HTMLParagraphElement) {
    joinForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (submitButton.disabled) return;

      submitButton.disabled = true;
      formStatus.dataset.state = "pending";
      formStatus.textContent = "Prihláška sa odosiela…";

      try {
        const response = await fetch(joinForm.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(Object.fromEntries(new FormData(joinForm)))
        });

        let result;
        try {
          result = await response.json();
        } catch {
          throw new Error("Server vrátil neplatnú odpoveď. Skúste to znova.");
        }

        if (!response.ok || result.success !== true) {
          throw new Error(
            typeof result.message === "string"
              ? result.message
              : "Server prihlášku neprijal. Skúste to znova."
          );
        }

        joinForm.reset();
        formStatus.dataset.state = "success";
        formStatus.textContent = "Ďakujeme, formulár bol úspešne odoslaný! Čoskoro sa vám ozveme. ❤️";
      } catch (error) {
        formStatus.dataset.state = "error";
        const detail = error instanceof TypeError
          ? "Skontrolujte internetové pripojenie a skúste to znova."
          : error instanceof Error
            ? error.message
            : "Skontrolujte internetové pripojenie a skúste to znova.";
        formStatus.textContent = `Prihlášku sa nepodarilo odoslať. ${detail}`;
      } finally {
        submitButton.disabled = false;
      }
    });
  }
}
