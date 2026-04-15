document.addEventListener("DOMContentLoaded", function () {

  const items = document.querySelectorAll("[data-expand]");

  items.forEach(item => {

    const full = item.querySelector(".full-content");

    if (!full) return;

    item.addEventListener("click", function (e) {

      // ignore links/media/buttons
      if (e.target.closest("a, video, audio, button")) return;

      // close all first
      document.querySelectorAll(".full-content").forEach(el => {
        el.classList.remove("active");
      });

      // open this one
      full.classList.add("active");

      // smooth scroll into view
      setTimeout(() => {
        full.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

    });

  });

  // CLOSE BUTTON
  document.querySelectorAll(".close-btn").forEach(btn => {

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      btn.closest(".full-content").classList.remove("active");
    });

  });

});