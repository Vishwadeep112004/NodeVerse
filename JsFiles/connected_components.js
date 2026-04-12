let nodes = 0;
let adjList = [];
let components = [];
let nodeComponent = [];

console.log("Connected Components JS Loaded");

/* ================= MAIN FUNCTION ================= */

function runConnectedComponents() {

    nodes = Number(document.getElementById("n").value);

    if (isNaN(nodes) || nodes <= 0) {
        alert("Enter valid number of nodes");
        return;
    }

    const edgeInput = document.getElementById("edges").value.trim();

    if (!edgeInput) {
        alert("Enter edges");
        return;
    }

    const ed = edgeInput.split(",")
        .map(e => e.trim().split("-").map(Number));

    adjList = Array.from({ length: nodes }, () => []);

    ed.forEach(([u, v]) => {

        if (isNaN(u) || isNaN(v) || u >= nodes || v >= nodes) return;

        adjList[u].push(v);

        if (!document.getElementById("directedBtn").classList.contains("active")) {
            adjList[v].push(u);
        }
    });

    findComponents();
    displayComponents();
    colorComponents();
}

/* ================= FIND COMPONENTS ================= */

function findComponents() {

    const visited = Array(nodes).fill(false);
    nodeComponent = Array(nodes).fill(-1);
    components = [];

    let compId = 0;

    for (let i = 0; i < nodes; i++) {

        if (!visited[i]) {

            let comp = [];
            let queue = [i];
            visited[i] = true;

            while (queue.length) {

                const u = queue.shift();
                comp.push(u);
                nodeComponent[u] = compId;

                for (const v of adjList[u]) {
                    if (!visited[v]) {
                        visited[v] = true;
                        queue.push(v);
                    }
                }
            }

            components.push(comp);
            compId++;
        }
    }
}

/* ================= DISPLAY ================= */

function displayComponents() {

    let box = document.getElementById("componentOutput");

    if (!box) {
        box = document.createElement("div");
        box.id = "componentOutput";
        box.className = "component-box";
        document.querySelector(".right-panel").appendChild(box);
    }

    let output = "";

    components.forEach((comp, i) => {
        output += `Component ${i}: ${comp.join(" → ")}\n`;
    });

    box.textContent = output;
}

/* ================= COLOR COMPONENTS ================= */

function colorComponents() {

    const colors = [
        "#22c55e",
        "#3b82f6",
        "#facc15",
        "#ef4444",
        "#a855f7",
        "#14b8a6"
    ];

    nodeBodies.forEach((node, i) => {
        const c = nodeComponent[i] % colors.length;
        node.render.fillStyle = colors[c];
    });
}