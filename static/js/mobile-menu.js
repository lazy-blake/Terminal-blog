// Mobile Menu Toggle - Fixed version
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const mobileOverlay = document.querySelector(".mobile-menu-overlay");
  const mobileSidebar = document.querySelector(".mobile-sidebar");
  const body = document.body;

  function openMenu(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (hamburger) hamburger.classList.add("active");
    if (mobileOverlay) mobileOverlay.classList.add("active");
    if (mobileSidebar) mobileSidebar.classList.add("active");
    body.classList.add("menu-open");
  }

  function closeMenuFunc(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (hamburger) hamburger.classList.remove("active");
    if (mobileOverlay) mobileOverlay.classList.remove("active");
    if (mobileSidebar) mobileSidebar.classList.remove("active");
    body.classList.remove("menu-open");
  }

  // Hamburger click
  if (hamburger) {
    hamburger.addEventListener("click", openMenu);
  }

  // Close button - Use event delegation on the sidebar
  if (mobileSidebar) {
    mobileSidebar.addEventListener("click", function (e) {
      // Check if the clicked element is the close button or its child
      if (
        e.target.classList.contains("close-menu") ||
        e.target.closest(".close-menu")
      ) {
        closeMenuFunc(e);
      }
    });
  }

  // Overlay click
  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeMenuFunc);
  }

  // Close menu when clicking a link
  const mobileNavLinks = document.querySelectorAll(
    ".mobile-nav-menu .nav-link",
  );
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", function () {
      setTimeout(closeMenuFunc, 100);
    });
  });

  // Close menu on escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenuFunc();
    }
  });

  // Debug - log if close button exists
  setTimeout(() => {
    const closeBtn = document.querySelector(".close-menu");
    if (closeBtn) {
      console.log("Close button found:", closeBtn);
      // Add direct listener as backup
      closeBtn.addEventListener("click", function (e) {
        console.log("Close button clicked!");
        closeMenuFunc(e);
      });
    } else {
      console.log("Close button NOT found");
    }
  }, 100);
});
