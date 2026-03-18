const {
    Engine, Render, Runner, World,
    Bodies, Mouse, MouseConstraint, Events
} = Matter;

/* ================= ENGINE SETUP ================= */

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

/* ================= GLOBAL STATE ================= */

let nodeBodies = [];
let edgeList = [];
let adj = [];
let graphCreated = false;
let isDirected = false;

const n = document.getElementById("n");
const edges = document.getElementById("edges");
const weights = document.getElementById("weights");

/* ================= TOGGLE TYPE ================= */

function setType(val) {
    isDirected = val;

    document.getElementById("directedBtn")
        ?.classList.toggle("active", val);

    document.getElementById("undirectedBtn")
        ?.classList.toggle("active", !val);
}

/* ================= DRAW EDGES + LABELS ================= */

Events.on(render, "afterRender", () => {
    const ctx = render.context;

edgeList.forEach(e => {

    const A = nodeBodies[e.u].position;
    const B = nodeBodies[e.v].position;

    const radius = 22;

    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len === 0) return;

    const unitX = dx / len;
    const unitY = dy / len;

    const startX = A.x + unitX * radius;
    const startY = A.y + unitY * radius;

    const endX = B.x - unitX * radius;
    const endY = B.y - unitY * radius;

    ctx.strokeStyle = e.active ? "#facc15" : "#475569";
    ctx.lineWidth = e.active ? 4 : 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    /* ===== Arrow for Directed ===== */
    if (e.directed) {
        const angle = Math.atan2(dy, dx);
        const arrowLen = 14;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLen * Math.cos(angle - Math.PI / 6),
            endY - arrowLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowLen * Math.cos(angle + Math.PI / 6),
            endY - arrowLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = e.active ? "#facc15" : "#475569";
        ctx.fill();
    }

    /* ===== Draw Weight (Offset from Line) ===== */
    if (e.weight !== null) {

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        // Perpendicular offset
        const offset = 18;
        const perpX = -unitY * offset;
        const perpY = unitX * offset;

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 14px Segoe UI";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            e.weight,
            midX + perpX,
            midY + perpY
        );
    }

});

    /* ===== Node Labels ===== */

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    nodeBodies.forEach((b, i) => {
        ctx.fillStyle = "#e5e7eb";
        ctx.font = "bold 16px Segoe UI";
        ctx.fillText(i, b.position.x, b.position.y);
    });
});

/* ================= BOUNDARIES ================= */

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

/* ================= CREATE GRAPH ================= */

function createGraph(nNodes, edgeStr, weightStr = "") {

    World.clear(engine.world, false);

    nodeBodies = [];
    edgeList = [];
    adj = Array.from({ length: nNodes }, () => []);

    addBoundaries();

    const cx = 450;
    const cy = 250;
    const r = 180;

    /* ===== Create Nodes ===== */

    for (let i = 0; i < nNodes; i++) {

        let angle = 2 * Math.PI * i / nNodes;
        let x = cx + r * Math.cos(angle);
        let y = cy + r * Math.sin(angle);

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

    /* ===== Parse Weights ===== */

    const weightArr = weightStr
        ? weightStr.split(",").map(Number)
        : [];

    /* ===== Parse Edges ===== */

    edgeStr.split(",").forEach((e, index) => {

        let [u, v] = e.trim().split("-").map(Number);
        if (isNaN(u) || isNaN(v)) return;

        const w = weightArr[index] ?? null;

        adj[u].push({ node: v, weight: w });

        if (!isDirected) {
            adj[v].push({ node: u, weight: w });
        }

        edgeList.push({
            u,
            v,
            weight: w,
            active: false,
            directed: isDirected
        });
    });

    /* ===== Enable Drag ===== */

    const mouse = Mouse.create(render.canvas);
    World.add(engine.world,
        MouseConstraint.create(engine, {
            mouse,
            constraint: { stiffness: 0.2 }
        })
    );

    graphCreated = true;
}

/* ================= BUTTON ================= */

function showGraph() {
    createGraph(+n.value, edges.value, weights.value);
}
