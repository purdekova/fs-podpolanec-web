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
    if (event.target.closest("a")) closeNavigation();
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
if (joinForm) {
  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = joinForm.querySelector("[data-form-status]");
    if (status) status.textContent = "Formulár je pripravený na overenie a pripojenie k odosielaciemu systému.";
  });
}
