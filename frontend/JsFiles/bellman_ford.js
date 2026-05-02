/* =====================================================
   bellman_ford.js — Bellman-Ford Shortest Path
   Uses StepController from visualizer.js
   ===================================================== */

console.log("Bellman-Ford JS Loaded");

let nodeDistLabels = [];

/* ================= DISTANCE LABELS OVERLAY ================= */

Events.on(render, "afterRender", () => {
    if (nodeDistLabels.length === 0) return;

    const ctx = render.context;
    ctx.font          = "bold 11px JetBrains Mono, Courier New";
    ctx.textAlign     = "center";
    ctx.textBaseline  = "middle";

    nodeBodies.forEach((b, i) => {
        const d = nodeDistLabels[i];
        if (d === undefined || d === null) return;

        const label = d === Infinity ? "∞" : d;

        // Background pill
        ctx.fillStyle = "rgba(2,6,23,0.85)";
        ctx.beginPath();
        // Use arc-based rounded rect for compatibility
        const rx = b.position.x - 14, ry = b.position.y + 25;
        const rw = 28, rh = 16, rr = 4;
        ctx.moveTo(rx + rr, ry);
        ctx.lineTo(rx + rw - rr, ry);
        ctx.arcTo(rx + rw, ry, rx + rw, ry + rr, rr);
        ctx.lineTo(rx + rw, ry + rh - rr);
        ctx.arcTo(rx + rw, ry + rh, rx + rw - rr, ry + rh, rr);
        ctx.lineTo(rx + rr, ry + rh);
        ctx.arcTo(rx, ry + rh, rx, ry + rh - rr, rr);
        ctx.lineTo(rx, ry + rr);
        ctx.arcTo(rx, ry, rx + rr, ry, rr);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#facc15";
        ctx.fillText(label, b.position.x, b.position.y + 33);
    });
});

/* ================= MAIN RUN ================= */

function buildBFSteps(edgesRaw, weightArr, nNodes, start) {
    const INF  = Infinity;
    const dist = Array(nNodes).fill(INF);
    dist[start] = 0;
    nodeDistLabels = [...dist];
    steps = [];

    steps.push({ t: "init",   dist: [...dist] });
    steps.push({ t: "active", u: start });

    // V-1 relaxation rounds
    for (let round = 0; round < nNodes - 1; round++) {
        let anyUpdate = false;

        edgesRaw.forEach(([u, v], idx) => {
            const w = weightArr[idx] ?? 1;

            steps.push({ t: "relax_try", u, v });

            if (dist[u] !== INF && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                nodeDistLabels[v] = dist[v];
                steps.push({ t: "dist", u: v, d: dist[v] });
                anyUpdate = true;
            }

            // Handle undirected: relax reverse edge too
            if (!isDirected) {
                steps.push({ t: "relax_try", u: v, v: u });
                if (dist[v] !== INF && dist[v] + w < dist[u]) {
                    dist[u] = dist[v] + w;
                    nodeDistLabels[u] = dist[u];
                    steps.push({ t: "dist", u, d: dist[u] });
                    anyUpdate = true;
                }
            }
        });

        if (!anyUpdate) break; // Early exit optimization
    }

    // Check for negative cycles (V-th pass)
    let hasNegCycle = false;
    edgesRaw.forEach(([u, v], idx) => {
        const w = weightArr[idx] ?? 1;
        if (dist[u] !== INF && dist[u] + w < dist[v]) {
            steps.push({ t: "neg_cycle", u, v });
            hasNegCycle = true;
        }
    });

    steps.push({ t: "result", dist: [...dist], negCycle: hasNegCycle });
}

/* ================= APPLY STEP ================= */

function applyStep(s) {
    if (s.t === "init") {
        nodeDistLabels = s.dist.map(d => d);
        return;
    }

    if (s.t === "result") {
        const codeArea = document.getElementById("codeArea");
        if (!codeArea) return;
        if (s.negCycle) {
            codeArea.textContent =
                "⚠ Negative Cycle Detected!\nShortest paths are undefined.";
        } else {
            let text = "✓ Shortest Distances (Bellman-Ford):\n";
            s.dist.forEach((d, i) => {
                text += `  Node ${i}: ${d === Infinity ? "∞ (unreachable)" : d}\n`;
            });
            codeArea.textContent = text;
        }
        return;
    }

    if (!nodeBodies || !nodeBodies[s.u]) return;

    if (s.t === "active") {
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow — source
    }

    if (s.t === "relax_try") {
        edgeList.forEach(e => {
            if (
                (e.u === s.u && e.v === s.v) ||
                (!isDirected && e.u === s.v && e.v === s.u)
            ) { e.active = true; }
        });
    }

    if (s.t === "dist") {
        nodeDistLabels[s.u] = s.d;
        nodeBodies[s.u].render.fillStyle = "#f97316"; // orange — relaxed
    }

    if (s.t === "neg_cycle") {
        edgeList.forEach(e => {
            if (e.u === s.u && e.v === s.v) { e.active = true; e.cycle = true; }
        });
        if (nodeBodies[s.u]) nodeBodies[s.u].render.fillStyle = "#ef4444";
        if (nodeBodies[s.v]) nodeBodies[s.v].render.fillStyle = "#ef4444";
    }
}

/* ================= RESET ================= */

function resetBFGraph() {
    nodeBodies.forEach(n => { n.render.fillStyle = "#020617"; });
    edgeList.forEach(e   => { e.active = false; e.cycle = false; });
    nodeDistLabels = [];
    const codeArea = document.getElementById("codeArea");
    if (codeArea) codeArea.textContent = "";
}

/* ================= MAIN RUN BUTTON ================= */

function runBellmanFord() {
    const nNodes = Number(document.getElementById("n").value);
    const start  = Number(document.getElementById("start").value);

    if (!graphCreated || nNodes <= 0) {
        alert("Build the graph first using 'Build Graph'");
        return;
    }
    if (isNaN(start) || start < 0 || start >= nNodes) {
        alert("Invalid start node");
        return;
    }

    const edgeInput   = document.getElementById("edges").value.trim();
    const weightInput = document.getElementById("weights").value.trim();

    if (!edgeInput)   { alert("Enter edges"); return; }
    if (!weightInput) { alert("Enter weights (supports negative values!)"); return; }

    resetBFGraph();

    const edgesRaw  = edgeInput.split(",").map(e => e.trim().split("-").map(Number));
    const weightArr = weightInput.split(",").map(Number);

    buildBFSteps(edgesRaw, weightArr, nNodes, start);
    StepController.load(steps);

    const statusEl = document.getElementById("statusText");
    if (statusEl) statusEl.textContent = `${steps.length} steps generated`;

    StepController.play();
}

/* ================= CODE DISPLAY ================= */

function showCode(lang) {
    const codeArea = document.getElementById("codeArea");
    let code = "";

    if (lang === "cpp") {
        code = `#include <bits/stdc++.h>
using namespace std;
typedef tuple<int,int,int> edge; // u,v,w

vector<int> bellmanFord(int src, int n,
        vector<edge>& edges) {
    vector<int> dist(n, INT_MAX);
    dist[src] = 0;

    for (int i = 0; i < n-1; i++)
        for (auto [u,v,w] : edges)
            if (dist[u]!=INT_MAX &&
                dist[u]+w < dist[v])
                dist[v] = dist[u]+w;

    // Detect negative cycle
    for (auto [u,v,w] : edges)
        if (dist[u]!=INT_MAX &&
            dist[u]+w < dist[v])
            cout << "Negative Cycle!";

    return dist;
}`;

    } else if (lang === "java") {
        code = `import java.util.*;

class BellmanFord {
  static int[] bellman(int src, int n,
      int[][] edges) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;

    for (int i = 0; i < n-1; i++)
      for (int[] e : edges) {
        int u=e[0],v=e[1],w=e[2];
        if (dist[u]!=Integer.MAX_VALUE &&
            dist[u]+w < dist[v])
          dist[v] = dist[u]+w;
      }

    for (int[] e : edges)
      if (dist[e[0]]!=Integer.MAX_VALUE
          && dist[e[0]]+e[2] < dist[e[1]])
        System.out.println("Neg Cycle!");

    return dist;
  }
}`;

    } else if (lang === "python") {
        code = `def bellman_ford(src, n, edges):
    dist = [float('inf')] * n
    dist[src] = 0

    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and \\
               dist[u] + w < dist[v]:
                dist[v] = dist[u] + w

    for u, v, w in edges:
        if dist[u] != float('inf') and \\
           dist[u] + w < dist[v]:
            print("Negative cycle!")
            return None

    return dist`;
    }

    if (codeArea) codeArea.textContent = code;
}
