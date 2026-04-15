document.addEventListener("DOMContentLoaded", function () {

  console.log("✅ Expand system running");

  const cards = document.querySelectorAll(".card");

  // Ensure all are closed on load
  document.querySelectorAll(".full-content").forEach(el => {
    el.style.display = "none";
  });

  cards.forEach(card => {

    const content = card.querySelector(".card-content");
    const full = card.querySelector(".full-content");

    if (!content || !full) return;

    function toggle(e) {

      const tag = e.target.tagName;

      // Allow links & media
      if (
        tag === "A" ||
        tag === "VIDEO" ||
        tag === "AUDIO"
      ) return;

      e.preventDefault();

      // Close others
      document.querySelectorAll(".full-content").forEach(el => {
        if (el !== full) el.style.display = "none";
      });

      // Toggle current
      full.style.display =
        full.style.display === "block" ? "none" : "block";
    }

    // Desktop
    content.addEventListener("click", toggle);

    // Mobile (IMPORTANT)
    content.addEventListener("touchend", toggle);

  });

});