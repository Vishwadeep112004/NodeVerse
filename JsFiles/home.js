/* =====================================================
   home.js — Animated canvas background + nav + counters
   ===================================================== */

/* ================= HAMBURGER ================= */
const toggle   = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

toggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

/* ================= SCROLL-BASED NAV ================= */
const mainNav = document.getElementById("mainNav");
window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
        mainNav.style.background = "rgba(2,6,23,0.95)";
    } else {
        mainNav.style.background = "rgba(2,6,23,0.7)";
    }
});

/* ================= SCROLL HINT ================= */
document.getElementById("scrollHint").addEventListener("click", () => {
    document.getElementById("features").scrollIntoView({ behavior: "smooth" });
});

/* ================= ANIMATED COUNTER ================= */
function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            el.textContent = target + (el.dataset.suffix || "");
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current) + (el.dataset.suffix || "");
        }
    }, 16);
}

const counterEls = document.querySelectorAll(".stat-num");

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counterEls.forEach(el => counterObserver.observe(el));

/* ================= ANIMATED GRAPH BACKGROUND ================= */
(function() {
    const canvas = document.getElementById("bgCanvas");
    const ctx    = canvas.getContext("2d");

    const ACCENT    = "#00ff88";
    const ACCENT2   = "#00d4ff";
    const NODE_COUNT = 18;
    const EDGE_PROB  = 0.22;

    let W, H, nodes, edges;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function randBetween(a, b) { return a + Math.random() * (b - a); }

    function initGraph() {
        nodes = [];
        edges = [];

        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x:  randBetween(0.05 * W, 0.95 * W),
                y:  randBetween(0.05 * H, 0.95 * H),
                vx: randBetween(-0.18, 0.18),
                vy: randBetween(-0.18, 0.18),
                r:  randBetween(3, 7),
                pulse: Math.random() * Math.PI * 2,
                color: Math.random() > 0.65 ? ACCENT2 : ACCENT,
            });
        }

        for (let i = 0; i < NODE_COUNT; i++) {
            for (let j = i + 1; j < NODE_COUNT; j++) {
                if (Math.random() < EDGE_PROB) {
                    edges.push({ i, j });
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Edges
        edges.forEach(({ i, j }) => {
            const A = nodes[i], B = nodes[j];
            const dx = B.x - A.x, dy = B.y - A.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const maxDist = 0.38 * Math.min(W, H);

            if (dist > maxDist) return;

            const alpha = (1 - dist / maxDist) * 0.28;
            ctx.beginPath();
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(B.x, B.y);
            ctx.strokeStyle = `rgba(0,255,136,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Nodes
        nodes.forEach(n => {
            n.pulse += 0.025;
            const r = n.r + Math.sin(n.pulse) * 1.5;

            // Glow
            const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
            grd.addColorStop(0, n.color === ACCENT2 ? "rgba(0,212,255,0.25)" : "rgba(0,255,136,0.2)");
            grd.addColorStop(1, "transparent");
            ctx.beginPath();
            ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = n.color;
            ctx.fill();
        });
    }

    function update() {
        nodes.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;

            // Soft bounce off edges
            if (n.x < 0 || n.x > W) { n.vx *= -1; n.x = Math.max(0, Math.min(W, n.x)); }
            if (n.y < 0 || n.y > H) { n.vy *= -1; n.y = Math.max(0, Math.min(H, n.y)); }
        });
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    window.addEventListener("resize", () => {
        resize();
    });

    resize();
    initGraph();
    loop();
})();

/* ================= FEATURE CARD PARALLAX (subtle) ================= */
document.addEventListener("mousemove", (e) => {
    const cards = document.querySelectorAll(".feature-card");
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    cards.forEach((card, i) => {
        const factor = 0.006 * (i % 2 === 0 ? 1 : -1);
        card.style.transform = `translateY(-6px) rotateX(${dy * factor * 300}deg) rotateY(${dx * factor * 300}deg)`;
    });
});

document.addEventListener("mouseleave", () => {
    document.querySelectorAll(".feature-card").forEach(card => {
        card.style.transform = "";
    });
});

/* ================= ALGO GROUP COLOR HOVER ================= */
document.querySelectorAll(".algo-group").forEach(group => {
    const color = group.dataset.color;
    group.addEventListener("mouseenter", () => {
        group.style.borderColor = color + "55";
    });
    group.addEventListener("mouseleave", () => {
        group.style.borderColor = "";
    });
    group.querySelectorAll(".algo-list li").forEach(li => {
        li.addEventListener("mouseenter", () => {
            li.querySelector(".algo-name").style.color = color;
            li.querySelector(".go-arrow").style.color  = color;
        });
        li.addEventListener("mouseleave", () => {
            li.querySelector(".algo-name").style.color = "";
            li.querySelector(".go-arrow").style.color  = "";
        });
    });
});