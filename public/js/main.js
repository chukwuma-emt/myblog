document.addEventListener("DOMContentLoaded", function () {

  console.log("JS working");

  const contents = document.querySelectorAll(".card-content");

  contents.forEach(content => {

    content.addEventListener("click", function (e) {

      const full = content.querySelector(".full-content");

      if (!full) return;

      // Ignore links
      if (e.target.tagName === "A") return;

      // Toggle
      full.classList.toggle("active");

    });

  });

});