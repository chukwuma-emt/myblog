document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("menuBtn");
  const nav = document.getElementById("navMenu");
  if (!btn || !nav) return;
  btn.addEventListener("click", function () {
    nav.classList.toggle("active");
  });
});
