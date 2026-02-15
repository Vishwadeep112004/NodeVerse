document.getElementById("arrow").addEventListener("click",()=>{
    window.scrollTo({
        top:window.innerHeight,
        behavior:"smooth"
    });
});

const toggle=document.getElementById("menu-toggle");
const navLinks=document.getElementById("nav-links");

toggle.addEventListener("click",()=>{
    navLinks.classList.toggle("active");
});