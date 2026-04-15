document.addEventListener("DOMContentLoaded", function () {

  console.log("✅ mobile expand working");

  const items = document.querySelectorAll("[data-expand]");

  items.forEach(item => {

    const full = item.querySelector(".full-content");

    if (!full) return;

    function toggle(e) {

      // ignore links & media
      if (e.target.closest("a, video, audio")) return;

      e.preventDefault();

      full.classList.toggle("active");
    }

    // desktop
    item.addEventListener("click", toggle);

    // mobile (THIS fixes your issue)
    item.addEventListener("touchend", toggle);

  });

});