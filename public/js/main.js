document.addEventListener("DOMContentLoaded", function () {

  console.log("✅ mobile tap fixed");

  document.querySelectorAll(".card").forEach(card => {

    const content = card.querySelector(".card-content");
    const full = card.querySelector(".full-content");

    if (!content || !full) return;

    content.addEventListener("click", function () {

      // Close others (optional but nice UX)
      document.querySelectorAll(".full-content").forEach(el => {
        if (el !== full) el.style.display = "none";
      });

      full.style.display =
        full.style.display === "block" ? "none" : "block";
    });

  });

});