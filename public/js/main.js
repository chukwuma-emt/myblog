document.addEventListener("DOMContentLoaded", function () {

  console.log("✅ tap to expand loaded");

  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {

    const content = card.querySelector(".card-content");
    const full = card.querySelector(".full-content");

    if (!content || !full) return;

    content.addEventListener("click", function (e) {

      // 🚫 prevent clicking media from triggering expand
      if (
        e.target.tagName === "VIDEO" ||
        e.target.tagName === "AUDIO" ||
        e.target.tagName === "A" ||
        e.target.tagName === "BUTTON"
      ) {
        return;
      }

      if (full.style.display === "block") {
        full.style.display = "none";
      } else {
        full.style.display = "block";
      }

    });

  });

});