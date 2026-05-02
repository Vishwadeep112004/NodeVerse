/* algorithms.js — hamburger nav only; routing is done via onclick in HTML */
const toggle   = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

toggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});