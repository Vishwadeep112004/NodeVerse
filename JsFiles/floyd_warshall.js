let nodes, ed;
console.log("Floyd-Warshall JS Loaded");

let steps = [];
let isRunning = false;

/* ================= MAIN RUN ================= */

function run(adjMatrix) {

    const INF = Infinity;
    // Clone the matrix for manipulation
    const dist = adjMatrix.map(row => [...row]);

    steps.push({ t: "matrix", dist: dist.map(r => [...r]), k: -1, msg: "Initial distance matrix" });

    for (let k = 0; k < nodes; k++) {

        steps.push({ t: "pivot", u: k }); // highlight intermediate node k

        for (let i = 0; i < nodes; i++) {
            for (let j = 0; j < nodes; j++) {

                if (dist[i][k] !== INF && dist[k][j] !== INF &&
                    dist[i][k] + dist[k][j] < dist[i][j]) {

                    dist[i][j] = dist[i][k] + dist[k][j];
                    steps.push({ t: "update", i, j, k, val: dist[i][j], dist: dist.map(r => [...r]) });
                }
            }
        }

        steps.push({ t: "matrix", dist: dist.map(r => [...r]), k, msg: `After using node ${k} as intermediate` });
    }

    // Check for negative cycles (diagonal < 0)
    let negCycle = false;
    for (let i = 0; i < nodes; i++) {
        if (dist[i][i] < 0) { negCycle = true; break; }
    }

    steps.push({ t: "result", dist: dist.map(r => [...r]), negCycle });
}

/* ================= ANIMATION ================= */

function play() {
    if (isRunning) return;
    isRunning = true;

    let i = 0;
    const delay = 700;

    function next() {
        if (i >= steps.length) { isRunning = false; return; }
        applyStep(steps[i++]);
        setTimeout(next, delay);
    }

    next();
}

/* ================= APPLY STEP ================= */

function applyStep(s) {

    if (s.t === "pivot") {
        // Reset all nodes, highlight the intermediate node k
        nodeBodies.forEach((n, i) => {
            n.render.fillStyle = i === s.u ? "#facc15" : "#020617";
        });
        edgeList.forEach(e => { e.active = false; });
        return;
    }

    if (s.t === "update") {
        // Highlight nodes i and j being updated
        if (nodeBodies[s.i]) nodeBodies[s.i].render.fillStyle = "#f97316";
        if (nodeBodies[s.j]) nodeBodies[s.j].render.fillStyle = "#f97316";
        // Show matrix in codeArea
        showMatrix(s.dist, `Updated dist[${s.i}][${s.j}] = ${s.val} (via ${s.k})`);
        return;
    }

    if (s.t === "matrix") {
        showMatrix(s.dist, s.msg);
        return;
    }

    if (s.t === "result") {
        if (s.negCycle) {
            document.getElementById("codeArea").textContent =
                "⚠️ Negative Cycle Detected!\n(dist[i][i] < 0)";
        } else {
            showMatrix(s.dist, "✅ Final All-Pairs Shortest Paths:");
        }
        // Color all nodes green = done
        nodeBodies.forEach(n => { n.render.fillStyle = "#22c55e"; });
    }
}

function showMatrix(dist, label) {
    const INF = Infinity;
    let text = (label || "") + "\n\n";
    text += "     " + Array.from({ length: nodes }, (_, i) => String(i).padStart(5)).join("") + "\n";
    text += "     " + "─────".repeat(nodes) + "\n";
    dist.forEach((row, i) => {
        text += String(i).padStart(3) + " │ ";
        text += row.map(v => (v === INF ? "  ∞" : String(v).padStart(3))).join("  ");
        text += "\n";
    });
    document.getElementById("codeArea").textContent = text;
}

/* ================= RESET ================= */

function resetGraph() {
    nodeBodies.forEach(n => { n.render.fillStyle = "#020617"; });
    edgeList.forEach(e => { e.active = false; });
    isRunning = false;
    document.getElementById("codeArea").textContent = "";
}

/* ================= BUTTON ================= */

function runFloydWarshall() {

    nodes = Number(document.getElementById("n").value);
    if (isNaN(nodes) || nodes <= 0) { alert("Enter valid number of nodes"); return; }

    const edgeInput   = document.getElementById("edges").value.trim();
    const weightInput = document.getElementById("weights").value.trim();
    if (!edgeInput)   { alert("Enter edges"); return; }
    if (!weightInput) { alert("Enter weights for Floyd-Warshall"); return; }

    resetGraph();

    const INF = Infinity;

    // Build adjacency matrix
    const adjMatrix = Array.from({ length: nodes }, (_, i) =>
        Array.from({ length: nodes }, (_, j) => (i === j ? 0 : INF))
    );

    const edgesRaw  = edgeInput.split(",").map(e => e.trim().split("-").map(Number));
    const weightArr = weightInput.split(",").map(Number);

    edgesRaw.forEach(([u, v], idx) => {
        if (isNaN(u) || isNaN(v) || u >= nodes || v >= nodes) return;
        const w = isNaN(weightArr[idx]) ? 1 : weightArr[idx];
        adjMatrix[u][v] = Math.min(adjMatrix[u][v], w);
        if (!isDirected) adjMatrix[v][u] = Math.min(adjMatrix[v][u], w);
    });

    steps = [];
    run(adjMatrix);
    play();
}

/* ================= CODE DISPLAY ================= */

function showCode(lang) {
    const codeArea = document.getElementById("codeArea");
    let code = "";

    if (lang === "cpp") {
        code = `#include <bits/stdc++.h>
using namespace std;
const int INF = 1e9;

void floydWarshall(int n,
        vector<vector<int>>& dist) {
    for (int k = 0; k < n; k++)
      for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
          if (dist[i][k]!=INF &&
              dist[k][j]!=INF &&
              dist[i][k]+dist[k][j] < dist[i][j])
            dist[i][j] = dist[i][k]+dist[k][j];

    // Check negative cycle
    for (int i = 0; i < n; i++)
        if (dist[i][i] < 0)
            cout << "Neg Cycle!\\n";
}`;

    } else if (lang === "java") {
        code = `class FloydWarshall {
  static final int INF = (int)1e9;

  static void floyd(int n, int[][] dist) {
    for (int k = 0; k < n; k++)
      for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
          if (dist[i][k]!=INF &&
              dist[k][j]!=INF &&
              dist[i][k]+dist[k][j]<dist[i][j])
            dist[i][j]=dist[i][k]+dist[k][j];

    for (int i = 0; i < n; i++)
      if (dist[i][i] < 0)
        System.out.println("Neg Cycle!");
  }
}`;

    } else if (lang === "python") {
        code = `def floyd_warshall(n, dist):
    INF = float('inf')

    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] != INF and \\
                   dist[k][j] != INF and \\
                   dist[i][k]+dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k]+dist[k][j]

    for i in range(n):
        if dist[i][i] < 0:
            print("Negative cycle!")`;
    }

    codeArea.textContent = code;
}
