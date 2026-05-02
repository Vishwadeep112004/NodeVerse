/* =====================================================
   cycle_detection_undirected.js — Cycle Detection (Undirected Graph)
   Uses StepController from visualizer.js
   ===================================================== */

console.log("Cycle Detection (Undirected) JS Loaded");

let cdMethod = "dfs"; // "dfs" or "bfs"

/* ================= METHOD TOGGLE ================= */

function setMethod(val) {
    cdMethod = val;
    document.getElementById("DFS")?.classList.toggle("active",  val === "dfs");
    document.getElementById("BFS")?.classList.toggle("active",  val === "bfs");
}

/* ================= STEP GENERATOR ================= */

function buildCycleSteps(nNodes, adjList, start) {
    const visited = Array(nNodes).fill(false);
    steps = [];

    // --- DFS-based cycle detection ---
    function dfs(u, parent) {
        visited[u] = true;
        steps.push({ t: "active", u });
        steps.push({ t: "visit",  u });

        for (const { node: v } of adjList[u]) {
            if (!visited[v]) {
                steps.push({ t: "edge", u, v });
                if (dfs(v, u)) return true;
            } else if (v !== parent) {
                steps.push({ t: "cycle", u, v });
                return true;
            }
        }
        return false;
    }

    // --- BFS-based cycle detection ---
    function bfs(s) {
        const queue = [{ node: s, parent: -1 }];
        visited[s]  = true;

        while (queue.length) {
            const { node: u, parent } = queue.shift();
            steps.push({ t: "active", u });
            steps.push({ t: "visit",  u });

            for (const { node: v } of adjList[u]) {
                if (!visited[v]) {
                    visited[v] = true;
                    queue.push({ node: v, parent: u });
                    steps.push({ t: "edge", u, v });
                } else if (v !== parent) {
                    steps.push({ t: "cycle", u, v });
                    return true;
                }
            }
        }
        return false;
    }

    const detect = cdMethod === "bfs" ? bfs : (s) => dfs(s, -1);

    if (!detect(start)) {
        for (let i = 0; i < nNodes; i++) {
            if (!visited[i]) {
                if (detect(i)) break;
            }
        }
    }

    steps.push({ t: "done" });
}

/* ================= APPLY STEP ================= */

function applyStep(s) {
    if (!nodeBodies) return;

    if (s.t === "active") {
        if (nodeBodies[s.u]) nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow
    }

    if (s.t === "visit") {
        if (nodeBodies[s.u]) nodeBodies[s.u].render.fillStyle = "#22c55e"; // green
    }

    if (s.t === "edge") {
        edgeList.forEach(e => {
            if (
                (e.u === s.u && e.v === s.v) ||
                (e.u === s.v && e.v === s.u)
            ) {
                e.active = true;
            }
        });
    }

    if (s.t === "cycle") {
        edgeList.forEach(e => {
            if (
                (e.u === s.u && e.v === s.v) ||
                (e.u === s.v && e.v === s.u)
            ) {
                e.active = true;
                e.cycle  = true;
            }
        });
        if (nodeBodies[s.u]) nodeBodies[s.u].render.fillStyle = "#ef4444"; // red
        if (nodeBodies[s.v]) nodeBodies[s.v].render.fillStyle = "#ef4444"; // red

        const codeArea = document.getElementById("codeArea");
        if (codeArea) codeArea.textContent = `Cycle detected! Back edge: ${s.u} — ${s.v}`;
    }

    if (s.t === "done") {
        const hasCycle = nodeBodies.some(n => n.render.fillStyle === "#ef4444");
        const codeArea = document.getElementById("codeArea");
        if (codeArea && !hasCycle) {
            codeArea.textContent = "No cycle detected in this undirected graph.";
        }
    }
}

/* ================= MAIN RUN FUNCTION ================= */

function runCycleDetection() {
    const nNodes = Number(document.getElementById("n").value);
    const start  = Number(document.getElementById("start")?.value ?? 0);

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
    edgeList.forEach(e   => { e.active = false; e.cycle = false; });

    const codeArea = document.getElementById("codeArea");
    if (codeArea) codeArea.textContent = "";

    buildCycleSteps(nNodes, adj, start);
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

bool dfs(int u, int par, vector<vector<int>>& adj,
         vector<bool>& vis) {
    vis[u] = true;
    for (int v : adj[u]) {
        if (!vis[v]) {
            if (dfs(v, u, adj, vis)) return true;
        } else if (v != par) return true;
    }
    return false;
}

bool hasCycle(int n, vector<vector<int>>& adj) {
    vector<bool> vis(n, false);
    for (int i=0;i<n;i++)
        if (!vis[i] && dfs(i, -1, adj, vis)) return true;
    return false;
}`;
    } else if (lang === "java") {
        code = `import java.util.*;

class CycleUndirected {
    static boolean dfs(int u, int par,
                       List<List<Integer>> adj, boolean[] vis) {
        vis[u] = true;
        for (int v : adj.get(u)) {
            if (!vis[v]) { if (dfs(v,u,adj,vis)) return true; }
            else if (v != par) return true;
        }
        return false;
    }
    static boolean hasCycle(int n, List<List<Integer>> adj) {
        boolean[] vis = new boolean[n];
        for (int i=0;i<n;i++)
            if (!vis[i] && dfs(i,-1,adj,vis)) return true;
        return false;
    }
}`;
    } else if (lang === "python") {
        code = `def has_cycle_undirected(adj, n):
    visited = [False] * n

    def dfs(u, parent):
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                if dfs(v, u): return True
            elif v != parent:
                return True
        return False

    return any(not visited[i] and dfs(i, -1) for i in range(n))`;
    }

    if (codeArea) codeArea.textContent = code;
}
