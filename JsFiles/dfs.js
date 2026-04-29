/* =====================================================
   dfs.js — Depth First Search
   Uses StepController from visualizer.js
   ===================================================== */

console.log("DFS JS Loaded");

/* ================= DFS STEP GENERATOR ================= */

function run(adjList, start) {
    const visited = Array(nodeBodies.length).fill(false);

    function dfs(u) {
        visited[u] = true;
        steps.push({ t: "active", u });
        steps.push({ t: "visit",  u });

        for (const v of adjList[u]) {
            if (!visited[v]) {
                steps.push({ t: "edge", u, v });
                dfs(v);
                steps.push({ t: "backtrack", u });
            }
        }
    }

    dfs(start);

    // Handle disconnected components
    for (let i = 0; i < nodeBodies.length; i++) {
        if (!visited[i]) dfs(i);
    }
}

/* ================= APPLY STEP ================= */

function applyStep(s) {
    if (s.t === "active") {
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow — exploring
    }
    if (s.t === "visit") {
        nodeBodies[s.u].render.fillStyle = "#22c55e"; // green — visited
    }
    if (s.t === "edge") {
        edgeList.forEach(e => {
            if ((e.u === s.u && e.v === s.v) || (e.u === s.v && e.v === s.u)) {
                e.active = true;
            }
        });
    }
    if (s.t === "backtrack") {
        nodeBodies[s.u].render.fillStyle = "#3b82f6"; // blue — backtracked
    }
}

/* ================= RUN DFS ================= */

function runDFS() {
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

    // Reset visual state
    nodeBodies.forEach(n => { n.render.fillStyle = "#020617"; });
    edgeList.forEach(e  => { e.active = false; });

    const edgeInput = document.getElementById("edges").value;
    let adjList = Array.from({ length: nNodes }, () => []);

    edgeInput.split(",").forEach(edge => {
        const [u, v] = edge.trim().split("-").map(Number);
        if (isNaN(u) || isNaN(v)) return;
        adjList[u].push(v);
        if (!document.getElementById("directedBtn").classList.contains("active")) {
            adjList[v].push(u);
        }
    });

    steps = [];
    run(adjList, start);
    StepController.load(steps);

    document.getElementById("statusText").textContent = `${steps.length} steps generated`;
    StepController.play();
}

/* ================= CODE DISPLAY ================= */

function showCode(lang) {
    const codeArea = document.getElementById("codeArea");
    let code = "";

    if (lang === "cpp") {
        code = `#include <bits/stdc++.h>
using namespace std;

void dfs(int u, vector<vector<int>>& adj,
         vector<bool>& visited) {
    visited[u] = true;
    cout << u << " ";

    for (int v : adj[u]) {
        if (!visited[v]) {
            dfs(v, adj, visited);
        }
    }
}`;
    } else if (lang === "java") {
        code = `import java.util.*;

class DFS {
    static void dfs(int u, List<List<Integer>> adj,
                    boolean[] visited) {
        visited[u] = true;
        System.out.print(u + " ");

        for (int v : adj.get(u)) {
            if (!visited[v]) {
                dfs(v, adj, visited);
            }
        }
    }
}`;
    } else if (lang === "python") {
        code = `def dfs(u, adj, visited):
    visited[u] = True
    print(u, end=" ")

    for v in adj[u]:
        if not visited[v]:
            dfs(v, adj, visited)`;
    }

    codeArea.textContent = code;
}