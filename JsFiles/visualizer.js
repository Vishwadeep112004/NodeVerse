const {
    Engine, Render, Runner, World,
    Bodies, Mouse, MouseConstraint, Events
} = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;

const render = Render.create({
    canvas: document.getElementById("world"),
    engine: engine,
    options: {
        width: 900,
        height: 500,
        wireframes: false,
        background: "#020617"
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

/* ============ GLOBAL STATE ============ */
let nodeBodies = [];
let edgeList = [];
let adj = [];
let steps = [];
let graphCreated = false;

const order = document.getElementById("order");

/* ============ DRAW EDGES + LABELS ============ */
Events.on(render, "afterRender", () => {
    const ctx = render.context;

    // THREAD EDGES
    edgeList.forEach(e => {
        const A = nodeBodies[e.u].position;
        const B = nodeBodies[e.v].position;

        if (e.active) {
            ctx.shadowColor = "#facc15";
            ctx.shadowBlur = 25;
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 4;
        } else {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
    });

    // NODE LABELS
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "16px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    nodeBodies.forEach((b, i) => {

        if (b.render.fillStyle === "#22c55e") {
            ctx.fillStyle = "#22ff88";
            ctx.shadowColor = "#22ff88";
            ctx.shadowBlur = 20;
        }
        else if (b.render.fillStyle === "#facc15") {
            ctx.fillStyle = "#facc15";
            ctx.shadowColor = "#facc15";
            ctx.shadowBlur = 20;
        }
        else {
            ctx.fillStyle = "#e5e7eb";
            ctx.shadowBlur = 0;
        }

        ctx.font = "bold 16px Segoe UI";
        ctx.fillText(i, b.position.x, b.position.y);
    });
    ctx.shadowBlur = 0;

});

/* ============ BOUNDARIES ============ */
function addBoundaries() {
    const w = render.options.width;
    const h = render.options.height;
    const t = 50;

    World.add(engine.world, [
        Bodies.rectangle(w / 2, -t / 2, w, t, { isStatic: true }),
        Bodies.rectangle(w / 2, h + t / 2, w, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, h / 2, t, h, { isStatic: true }),
        Bodies.rectangle(w + t / 2, h / 2, t, h, { isStatic: true })
    ]);
}

/* ============ CREATE GRAPH ============ */
function createGraph(n, edgeStr) {
    World.clear(engine.world, false);
    nodeBodies = [];
    edgeList = [];
    adj = Array.from({ length: n }, () => []);
    steps = [];

    addBoundaries();

    const cx = 450, cy = 250, r = 180;

    for (let i = 0; i < n; i++) {
        let a = 2 * Math.PI * i / n;
        let x = cx + r * Math.cos(a);
        let y = cy + r * Math.sin(a);

        const body = Bodies.circle(x, y, 22, {
            collisionFilter: { group: -1 },
            frictionAir: 0.05,
            restitution: 0.1,
            render: {
                fillStyle: "#020617",
                strokeStyle: "#334155",
                lineWidth: 2
            }
        });

        nodeBodies.push(body);
        World.add(engine.world, body);
    }

    edgeStr.split(",").forEach(e => {
        let [u, v] = e.trim().split("-").map(Number);
        if (isNaN(u) || isNaN(v)) return;

        adj[u].push(v);
        adj[v].push(u);
        edgeList.push({ u, v, active: false });
    });

    const mouse = Mouse.create(render.canvas);
    World.add(engine.world,
        MouseConstraint.create(engine, {
            mouse,
            constraint: { stiffness: 0.2 }
        })
    );
}

/* ============ BFS LOGIC ============ */


/* ============ BFS ANIMATION ============ */




function typeNode(val) {
    let span = document.createElement("span");
    span.textContent = " " + val;
    span.style.opacity = 0;
    span.style.transform = "scale(0.5)";
    span.style.transition = "0.4s ease";
    order.appendChild(span);

    setTimeout(() => {
        span.style.opacity = 1;
        span.style.transform = "scale(1)";
    }, 50);
}

/* ============ BUTTONS ============ */
function showGraph() {
    createGraph(+n.value, edges.value);
    graphCreated = true;
}

const n = document.getElementById("n");
const edges = document.getElementById("edges");
const start = document.getElementById("start");
