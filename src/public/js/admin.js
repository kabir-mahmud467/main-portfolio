const sidebarButton = document.querySelector("[data-sidebar-button]");
const adminSidebar = document.querySelector("[data-admin-sidebar]");
const darkModeButton = document.querySelector("[data-dark-mode-button]");

if (sidebarButton && adminSidebar) {
  sidebarButton.addEventListener("click", () => {
    adminSidebar.classList.toggle("-translate-x-full");
  });
}

if (localStorage.getItem("admin-theme") === "dark") {
  document.documentElement.classList.add("dark");
}

if (darkModeButton) {
  darkModeButton.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
      "admin-theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
  });
}
