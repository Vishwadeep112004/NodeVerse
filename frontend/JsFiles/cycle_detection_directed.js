/* =====================================================
   cycle_detection_directed.js — Cycle Detection (Directed Graph)
   Uses StepController from visualizer.js
   ===================================================== */

console.log("Cycle Detection (Directed) JS Loaded");

/* ================= STEP GENERATOR ================= */

function buildCycleSteps(nNodes, adjList, start) {
    const visited  = Array(nNodes).fill(false);
    const recStack = Array(nNodes).fill(false);
    steps = [];

    function dfs(u) {
        visited[u]  = true;
        recStack[u] = true;

        steps.push({ t: "active", u });
        steps.push({ t: "visit",  u });

        for (const { node: v } of adjList[u]) {
            if (!visited[v]) {
                steps.push({ t: "edge", u, v });
                if (dfs(v)) return true;
            } else if (recStack[v]) {
                steps.push({ t: "cycle", u, v });
                return true;
            }
        }

        recStack[u] = false;
        return false;
    }

    // Start from the specified node
    if (!dfs(start)) {
        // Handle disconnected components
        for (let i = 0; i < nNodes; i++) {
            if (!visited[i]) {
                if (dfs(i)) break;
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
            if (e.u === s.u && e.v === s.v) { // directed — exact match only
                e.active = true;
            }
        });
    }

    if (s.t === "cycle") {
        edgeList.forEach(e => {
            if (e.u === s.u && e.v === s.v) {
                e.active = true;
                e.cycle  = true;
            }
        });
        if (nodeBodies[s.u]) nodeBodies[s.u].render.fillStyle = "#ef4444"; // red
        if (nodeBodies[s.v]) nodeBodies[s.v].render.fillStyle = "#ef4444"; // red

        const codeArea = document.getElementById("codeArea");
        if (codeArea) codeArea.textContent = `Cycle detected! Back edge: ${s.u} → ${s.v}`;
    }

    if (s.t === "done") {
        // Check if any cycle was found (red nodes exist)
        const hasCycle = nodeBodies.some(n => n.render.fillStyle === "#ef4444");
        const codeArea = document.getElementById("codeArea");
        if (codeArea && !hasCycle) {
            codeArea.textContent = "No cycle detected in this directed graph.";
        }
    }
}

/* ================= MAIN RUN FUNCTION ================= */

function runCycleDetectionDirected() {
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

bool dfs(int u, vector<vector<int>>& adj,
         vector<bool>& vis, vector<bool>& rec) {
    vis[u] = rec[u] = true;
    for (int v : adj[u]) {
        if (!vis[v] && dfs(v, adj, vis, rec)) return true;
        else if (rec[v]) return true;
    }
    rec[u] = false;
    return false;
}

bool hasCycle(int n, vector<vector<int>>& adj) {
    vector<bool> vis(n,false), rec(n,false);
    for (int i=0;i<n;i++)
        if (!vis[i] && dfs(i, adj, vis, rec)) return true;
    return false;
}`;
    } else if (lang === "java") {
        code = `import java.util.*;

class CycleDirected {
    static boolean dfs(int u, List<List<Integer>> adj,
                       boolean[] vis, boolean[] rec) {
        vis[u] = rec[u] = true;
        for (int v : adj.get(u)) {
            if (!vis[v] && dfs(v, adj, vis, rec)) return true;
            else if (rec[v]) return true;
        }
        rec[u] = false;
        return false;
    }
    static boolean hasCycle(int n, List<List<Integer>> adj) {
        boolean[] vis=new boolean[n], rec=new boolean[n];
        for (int i=0;i<n;i++)
            if (!vis[i] && dfs(i,adj,vis,rec)) return true;
        return false;
    }
}`;
    } else if (lang === "python") {
        code = `def has_cycle_directed(adj, n):
    visited  = [False] * n
    rec_stack = [False] * n

    def dfs(u):
        visited[u] = rec_stack[u] = True
        for v in adj[u]:
            if not visited[v] and dfs(v): return True
            elif rec_stack[v]: return True
        rec_stack[u] = False
        return False

    return any(not visited[i] and dfs(i) for i in range(n))`;
    }

    if (codeArea) codeArea.textContent = code;
}
