const {
    Engine, Render, Runner, World,
    Bodies, Mouse, MouseConstraint, Events
} = Matter;

/* ================= ENGINE SETUP ================= */

const engine = Engine.create();
engine.world.gravity.y = 0;

// Make canvas responsive to its container
const rightPanel = document.querySelector(".right-panel");
const canvasW = rightPanel ? rightPanel.clientWidth  || 900 : 900;
const canvasH = rightPanel ? rightPanel.clientHeight || 600 : 600;

const render = Render.create({
    canvas: document.getElementById("world"),
    engine: engine,
    options: {
        width: canvasW,
        height: canvasH,
        wireframes: false,
        background: "#020617"
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Resize canvas when window resizes
window.addEventListener("resize", () => {
    if (!rightPanel) return;
    render.options.width  = rightPanel.clientWidth;
    render.options.height = rightPanel.clientHeight;
    render.canvas.width   = rightPanel.clientWidth;
    render.canvas.height  = rightPanel.clientHeight;
});

/* ================= GLOBAL STATE ================= */

let nodeBodies  = [];
let edgeList    = [];
let adj         = [];
let graphCreated = false;
let isDirected   = false;

// Each algo file declares its own `steps` array and `applyStep` function
// StepController below wires them together with UI controls
let steps = [];

const nInput      = document.getElementById("n");
const edgesInput  = document.getElementById("edges");
const weightsInput = document.getElementById("weights");

/* ================= STEP CONTROLLER ================= */

const StepController = {
    currentIndex: 0,
    playing: false,
    timer: null,
    speed: 600,

    /** Set steps array from algo JS (called after generating steps) */
    load(stepsArr) {
        this.currentIndex = 0;
        this.playing = false;
        clearInterval(this.timer);
        this.updateUI();
    },

    play() {
        if (this.playing) return;
        if (this.currentIndex >= steps.length) {
            this.currentIndex = 0;
            this._resetColors();
            this._replayUpTo(0);
        }
        this.playing = true;
        this._updatePlayBtn(true);

        this.timer = setInterval(() => {
            if (this.currentIndex >= steps.length) {
                this.pause();
                return;
            }
            applyStep(steps[this.currentIndex]);
            this.currentIndex++;
            this.updateUI();
        }, this.speed);
    },

    pause() {
        this.playing = false;
        clearInterval(this.timer);
        this._updatePlayBtn(false);
    },

    togglePlay() {
        if (this.playing) this.pause();
        else this.play();
    },

    nextStep() {
        this.pause();
        if (this.currentIndex >= steps.length) return;
        applyStep(steps[this.currentIndex]);
        this.currentIndex++;
        this.updateUI();
    },

    prevStep() {
        this.pause();
        if (this.currentIndex <= 0) return;
        this.currentIndex--;
        this._resetColors();
        this._replayUpTo(this.currentIndex);
        this.updateUI();
    },

    setSpeed(ms) {
        this.speed = ms;
        if (this.playing) {
            this.pause();
            this.play();
        }
    },

    reset() {
        this.pause();
        this.currentIndex = 0;
        this._resetColors();
        this.updateUI();
    },

    updateUI() {
        const label    = document.getElementById("stepLabel");
        const fill     = document.getElementById("progressFill");
        const total    = steps.length;
        const current  = this.currentIndex;

        if (label) label.textContent = `Step ${current} / ${total}`;
        if (fill)  fill.style.width  = total > 0 ? `${(current / total) * 100}%` : "0%";
    },

    _updatePlayBtn(isPlaying) {
        const btn = document.getElementById("playBtn");
        if (!btn) return;
        btn.textContent = isPlaying ? "Pause" : "Play";
        btn.classList.toggle("playing", isPlaying);
    },

    _resetColors() {
        nodeBodies.forEach(n => {
            n.render.fillStyle  = "#020617";
            n.render.strokeStyle = "#334155";
        });
        edgeList.forEach(e => { e.active = false; });
        // Clear any extra labels (e.g. Dijkstra distance labels)
        if (typeof nodeDistLabels !== "undefined") {
            nodeDistLabels = [];
        }
    },

    _replayUpTo(index) {
        for (let i = 0; i < index; i++) {
            applyStep(steps[i]);
        }
    }
};

/* ================= KEYBOARD SHORTCUTS ================= */

document.addEventListener("keydown", (e) => {
    // Only on algo pages (where steps exist)
    if (!document.getElementById("playBtn")) return;

    if (e.code === "Space") {
        e.preventDefault();
        StepController.togglePlay();
    } else if (e.code === "ArrowRight") {
        e.preventDefault();
        StepController.nextStep();
    } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        StepController.prevStep();
    }
});

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
        const endX   = B.x - unitX * radius;
        const endY   = B.y - unitY * radius;

        ctx.strokeStyle = e.active ? "#facc15" : "#334155";
        ctx.lineWidth   = e.active ? 3 : 1.5;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Glow on active edge
        if (e.active) {
            ctx.strokeStyle = "rgba(250,204,21,0.3)";
            ctx.lineWidth   = 8;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        /* Arrow for Directed */
        if (e.directed) {
            const angle    = Math.atan2(dy, dx);
            const arrowLen = 13;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - arrowLen * Math.cos(angle - Math.PI / 6),
                       endY - arrowLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(endX - arrowLen * Math.cos(angle + Math.PI / 6),
                       endY - arrowLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = e.active ? "#facc15" : "#475569";
            ctx.fill();
        }

        /* Weight label */
        if (e.weight !== null && e.weight !== undefined) {
            const midX  = (startX + endX) / 2;
            const midY  = (startY + endY) / 2;
            const offset = 16;
            const perpX  = -unitY * offset;
            const perpY  =  unitX * offset;

            ctx.fillStyle = "#facc15";
            ctx.font      = "bold 13px JetBrains Mono, Courier New";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(e.weight, midX + perpX, midY + perpY);
        }
    });

    /* Node Labels */
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    nodeBodies.forEach((b, i) => {
        // Node number
        ctx.fillStyle = "#e2e8f0";
        ctx.font      = "bold 15px JetBrains Mono, Courier New";
        ctx.fillText(i, b.position.x, b.position.y);

        // Glow ring for highlighted nodes
        const color = b.render.fillStyle;
        if (color !== "#020617") {
            const grd = ctx.createRadialGradient(b.position.x, b.position.y, 18, b.position.x, b.position.y, 34);
            grd.addColorStop(0, color + "33");
            grd.addColorStop(1, "transparent");
            ctx.beginPath();
            ctx.arc(b.position.x, b.position.y, 34, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
        }
    });
});

/* ================= BOUNDARIES ================= */

function addBoundaries() {
    const w = render.options.width;
    const h = render.options.height;
    const t = 50;
    World.add(engine.world, [
        Bodies.rectangle(w / 2, -t / 2,    w, t, { isStatic: true }),
        Bodies.rectangle(w / 2, h + t / 2, w, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, h / 2,    t, h, { isStatic: true }),
        Bodies.rectangle(w + t / 2, h / 2, t, h, { isStatic: true })
    ]);
}

/* ================= CREATE GRAPH ================= */

function createGraph(nNodes, edgeStr, weightStr = "") {
    World.clear(engine.world, false);
    nodeBodies = [];
    edgeList   = [];
    adj        = Array.from({ length: nNodes }, () => []);
    steps      = [];

    StepController.reset();
    addBoundaries();

    const W  = render.options.width;
    const H  = render.options.height;
    const cx = W / 2;
    const cy = H / 2;
    const r  = Math.min(W, H) * 0.35;

    /* Create Nodes */
    for (let i = 0; i < nNodes; i++) {
        const angle = 2 * Math.PI * i / nNodes - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        const body = Bodies.circle(x, y, 22, {
            collisionFilter: { group: -1 },
            frictionAir: 0.06,
            restitution: 0.1,
            render: {
                fillStyle:   "#020617",
                strokeStyle: "#334155",
                lineWidth: 2
            }
        });

        nodeBodies.push(body);
        World.add(engine.world, body);
    }

    /* Parse Weights */
    const weightArr = weightStr ? weightStr.split(",").map(Number) : [];

    /* Parse Edges */
    if (edgeStr && edgeStr.trim()) {
        edgeStr.split(",").forEach((e, index) => {
            const [u, v] = e.trim().split("-").map(Number);
            if (isNaN(u) || isNaN(v)) return;
            const w = weightArr[index] ?? null;

            adj[u].push({ node: v, weight: w });
            if (!isDirected) adj[v].push({ node: u, weight: w });

            edgeList.push({ u, v, weight: w, active: false, directed: isDirected });
        });
    }

    /* Enable Drag */
    const mouse = Mouse.create(render.canvas);
    World.add(engine.world, MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2 }
    }));

    graphCreated = true;
}

/* ================= SHOW GRAPH BUTTON ================= */

function showGraph() {
    const nVal = nInput ? +nInput.value : 0;
    const eVal = edgesInput ? edgesInput.value : "";
    const wVal = weightsInput ? weightsInput.value : "";
    createGraph(nVal, eVal, wVal);
}
