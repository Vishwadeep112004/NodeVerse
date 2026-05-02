/* =====================================================
   visualizer_extra.js
   Extra features for the Visualizer page:
   - Preset graph templates
   - Export: PNG, JSON, URL, Adjacency List
   ===================================================== */

/* ================= PRESET TEMPLATES ================= */

const PRESETS = {
    path: {
        n: 5, edges: "0-1,1-2,2-3,3-4", weights: "", directed: false,
        label: "Path Graph (5 nodes)"
    },
    cycle: {
        n: 6, edges: "0-1,1-2,2-3,3-4,4-5,5-0", weights: "", directed: false,
        label: "Cycle Graph (6 nodes)"
    },
    tree: {
        n: 7, edges: "0-1,0-2,1-3,1-4,2-5,2-6", weights: "", directed: false,
        label: "Binary Tree (7 nodes)"
    },
    complete: {
        n: 5, edges: "0-1,0-2,0-3,0-4,1-2,1-3,1-4,2-3,2-4,3-4", weights: "", directed: false,
        label: "Complete Graph K5"
    },
    dag: {
        n: 6, edges: "0-1,0-2,1-3,2-3,3-4,3-5", weights: "3,5,2,4,1,6", directed: true,
        label: "DAG (6 nodes, weighted)"
    },
    random: null // generated dynamically
};

function loadPreset(name) {
    let preset = PRESETS[name];

    if (name === "random") {
        const nNodes = Math.floor(Math.random() * 4) + 5; // 5-8 nodes
        const edgeSet = new Set();
        const edgeArr = [];
        const density = 0.45;

        for (let i = 0; i < nNodes; i++) {
            for (let j = i + 1; j < nNodes; j++) {
                if (Math.random() < density) {
                    edgeSet.add(`${i}-${j}`);
                    edgeArr.push(`${i}-${j}`);
                }
            }
        }

        // Ensure connected (add spanning edges)
        for (let i = 1; i < nNodes; i++) {
            const key = `${i-1}-${i}`;
            if (!edgeSet.has(key)) edgeArr.push(key);
        }

        preset = {
            n: nNodes,
            edges: edgeArr.join(","),
            weights: "",
            directed: false,
            label: `Random Graph (${nNodes} nodes)`
        };
    }

    if (!preset) return;

    document.getElementById("n").value       = preset.n;
    document.getElementById("edges").value   = preset.edges;
    document.getElementById("weights").value = preset.weights;
    setType(preset.directed);
    showGraph();

    const status = document.getElementById("statusText");
    if (status) status.textContent = preset.label + " loaded";
}

/* ================= EXPORT PNG ================= */

function exportPNG() {
    const canvas = document.getElementById("world");
    const link   = document.createElement("a");
    link.download = "nodeverse-graph.png";
    link.href     = canvas.toDataURL("image/png");
    link.click();

    const status = document.getElementById("statusText");
    if (status) status.textContent = "Graph exported as PNG Success";
}

/* ================= COPY JSON ================= */

function copyJSON() {
    const nNodes = nodeBodies.length;
    const edgeData = edgeList.map(e => ({
        from: e.u,
        to:   e.v,
        weight: e.weight,
        directed: e.directed
    }));

    const graphJSON = JSON.stringify({
        nodes: nNodes,
        edges: edgeData,
        directed: isDirected
    }, null, 2);

    navigator.clipboard.writeText(graphJSON).then(() => {
        const status = document.getElementById("statusText");
        if (status) status.textContent = "Graph JSON copied to clipboard Success";
    }).catch(() => {
        const area = document.getElementById("codeArea");
        if (area) area.textContent = graphJSON;
    });
}

/* ================= SHARE URL ================= */

function shareURL() {
    const nVal = document.getElementById("n").value;
    const eVal = document.getElementById("edges").value;
    const wVal = document.getElementById("weights").value;
    const dVal = isDirected ? "1" : "0";

    const params = new URLSearchParams({
        n: nVal,
        edges: eVal,
        weights: wVal,
        directed: dVal
    });

    const url = window.location.origin + window.location.pathname + "#" + params.toString();
    window.location.hash = params.toString();

    navigator.clipboard.writeText(url).then(() => {
        const status = document.getElementById("statusText");
        if (status) status.textContent = "Share URL copied to clipboard Success";
    }).catch(() => {
        const area = document.getElementById("codeArea");
        if (area) area.textContent = "Share URL:\n" + url;
    });
}

/* ================= COPY ADJACENCY LIST ================= */

function copyAdjList() {
    const nNodes = nodeBodies.length;
    let text = `Adjacency List (${isDirected ? "Directed" : "Undirected"}):\n\n`;

    const adjArr = Array.from({ length: nNodes }, () => []);
    edgeList.forEach(e => {
        const wPart = e.weight !== null ? `(w=${e.weight})` : "";
        adjArr[e.u].push(`${e.v}${wPart}`);
        if (!isDirected && e.u !== e.v) adjArr[e.v].push(`${e.u}${wPart}`);
    });

    for (let i = 0; i < nNodes; i++) {
        text += `${i}: [${adjArr[i].join(", ")}]\n`;
    }

    // Also generate adjacency matrix
    text += "\nAdjacency Matrix:\n    ";
    for (let j = 0; j < nNodes; j++) text += ` ${j}`;
    text += "\n";
    const matrix = Array.from({ length: nNodes }, () => Array(nNodes).fill(0));
    edgeList.forEach(e => {
        matrix[e.u][e.v] = e.weight !== null ? e.weight : 1;
        if (!isDirected) matrix[e.v][e.u] = e.weight !== null ? e.weight : 1;
    });
    for (let i = 0; i < nNodes; i++) {
        text += ` ${i}: [${matrix[i].join(",")}]\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
        const status = document.getElementById("statusText");
        if (status) status.textContent = "Adjacency list copied Success";
    }).catch(() => {});

    const area = document.getElementById("codeArea");
    if (area) area.textContent = text;
}
