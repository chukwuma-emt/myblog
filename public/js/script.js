document.addEventListener("DOMContentLoaded", function () {
  console.log("JS Loaded ✅");

  const btn = document.getElementById("menuBtn");
  const nav = document.getElementById("navMenu");

  console.log("BTN:", btn);
  console.log("NAV:", nav);

  if (!btn || !nav) {
    console.error("Menu elements not found ❌");
    return;
  }

  btn.addEventListener("click", function () {
    console.log("Menu clicked 🔥");
    nav.classList.toggle("active");
  });
});