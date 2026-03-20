const toggle=document.getElementById("menu-toggle");
const navLinks=document.getElementById("nav-links");

toggle.addEventListener("click",()=>{
    navLinks.classList.toggle("active");
});

function goToBFSVisualizer(){
    window.location.href="./bfs.html"
}

function goToDFSVisualizer(){
    window.location.href="./dfs.html"
}