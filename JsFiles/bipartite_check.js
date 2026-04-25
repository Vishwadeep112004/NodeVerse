let nodes, ed;
console.log("Bipartite Check JS Loaded");

let steps = [];
let isRunning = false;

/* ================= MAIN RUN ================= */

function run(adjList, start) {

    const color = Array(nodes).fill(-1); // -1 = unvisited
    let isBipartite = true;

    function bfs(s) {

        color[s] = 0;
        const queue = [s];
        steps.push({ t: "color_a", u: s }); // side A = blue

        while (queue.length > 0) {

            const u = queue.shift();
            steps.push({ t: "visit", u });

            for (const v of adjList[u]) {

                if (color[v] === -1) {
                    color[v] = 1 - color[u];
                    queue.push(v);
                    steps.push({ t: "edge", u, v });
                    if (color[v] === 0) steps.push({ t: "color_a", u: v });
                    else                steps.push({ t: "color_b", u: v });

                } else if (color[v] === color[u]) {
                    // Same color neighbor → not bipartite
                    steps.push({ t: "conflict", u, v });
                    isBipartite = false;
                    return false;
                }
            }
        }
        return true;
    }

    // Handle disconnected graph
    for (let i = 0; i < nodes; i++) {
        if (color[i] === -1) {
            if (!bfs(i)) break;
        }
    }

    steps.push({ t: "result", bipartite: isBipartite });
}

/* ================= ANIMATION ================= */

function play() {
    if (isRunning) return;
    isRunning = true;

    let i = 0;
    const delay = 600;

    function next() {
        if (i >= steps.length) { isRunning = false; return; }
        applyStep(steps[i++]);
        setTimeout(next, delay);
    }

    next();
}

/* ================= APPLY STEP ================= */

function applyStep(s) {

    if (s.t === "result") {
        document.getElementById("codeArea").textContent = s.bipartite
            ? "✅ Graph IS Bipartite!\n(Can be 2-colored with no conflict)"
            : "❌ Graph is NOT Bipartite!\n(Odd-length cycle detected)";
        return;
    }

    if (!nodeBodies || !nodeBodies[s.u]) return;

    if (s.t === "color_a") {
        nodeBodies[s.u].render.fillStyle = "#3b82f6"; // blue — side A
    }

    if (s.t === "color_b") {
        nodeBodies[s.u].render.fillStyle = "#f97316"; // orange — side B
    }

    if (s.t === "visit") {
        // Keep existing color, just pulse — no change needed
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

    if (s.t === "conflict") {
        // Highlight conflicting edge in red via cycle flag
        edgeList.forEach(e => {
            if (
                (e.u === s.u && e.v === s.v) ||
                (e.u === s.v && e.v === s.u)
            ) {
                e.active = true;
                e.cycle = true;
            }
        });
        nodeBodies[s.u].render.fillStyle = "#ef4444"; // red
        if (nodeBodies[s.v]) nodeBodies[s.v].render.fillStyle = "#ef4444";
    }
}

/* ================= RESET ================= */

function resetGraph() {
    nodeBodies.forEach(n => { n.render.fillStyle = "#020617"; });
    edgeList.forEach(e => { e.active = false; e.cycle = false; });
    isRunning = false;
    document.getElementById("codeArea").textContent = "";
}

/* ================= BUTTON ================= */

function runBipartite() {

    nodes = Number(document.getElementById("n").value);

    if (isNaN(nodes) || nodes <= 0) { alert("Enter valid number of nodes"); return; }

    const edgeInput = document.getElementById("edges").value.trim();
    if (!edgeInput) { alert("Enter edges"); return; }

    resetGraph();

    ed = edgeInput.split(",").map(e => e.trim().split("-").map(Number));

    let adjList = Array.from({ length: nodes }, () => []);
    ed.forEach(([u, v]) => {
        if (isNaN(u) || isNaN(v) || u >= nodes || v >= nodes) return;
        adjList[u].push(v);
        adjList[v].push(u); // always undirected for bipartite check
    });

    steps = [];
    run(adjList, 0);
    play();
}

/* ================= CODE DISPLAY ================= */

function showCode(lang) {
    const codeArea = document.getElementById("codeArea");
    let code = "";

    if (lang === "cpp") {
        code = `#include <bits/stdc++.h>
using namespace std;

bool isBipartite(int n,
        vector<vector<int>>& adj) {
    vector<int> color(n, -1);
    for (int s = 0; s < n; s++) {
        if (color[s] != -1) continue;
        queue<int> q;
        color[s] = 0; q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : adj[u]) {
                if (color[v] == -1) {
                    color[v] = 1 - color[u];
                    q.push(v);
                } else if (color[v] == color[u])
                    return false;
            }
        }
    }
    return true;
}`;

    } else if (lang === "java") {
        code = `import java.util.*;

class Bipartite {
  static boolean check(int n,
      List<List<Integer>> adj) {
    int[] color = new int[n];
    Arrays.fill(color, -1);
    for (int s = 0; s < n; s++) {
      if (color[s] != -1) continue;
      Queue<Integer> q = new LinkedList<>();
      color[s] = 0; q.add(s);
      while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : adj.get(u)) {
          if (color[v] == -1) {
            color[v] = 1 - color[u];
            q.add(v);
          } else if (color[v] == color[u])
            return false;
        }
      }
    }
    return true;
  }
}`;

    } else if (lang === "python") {
        code = `from collections import deque

def is_bipartite(n, adj):
    color = [-1] * n
    for s in range(n):
        if color[s] != -1: continue
        q = deque([s])
        color[s] = 0
        while q:
            u = q.popleft()
            for v in adj[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    q.append(v)
                elif color[v] == color[u]:
                    return False
    return True`;
    }

    codeArea.textContent = code;
}
