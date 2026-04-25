let nodes, ed;
console.log("Dijkstra's Algorithm JS Loaded");

let steps = [];
let isRunning = false;
let nodeDistLabels = []; // distance displayed below each node

/* ================= EXTRA RENDER LAYER (Distance Labels) ================= */

Events.on(render, "afterRender", () => {
    if (nodeDistLabels.length === 0) return;

    const ctx = render.context;
    ctx.font = "bold 11px Courier New";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    nodeBodies.forEach((b, i) => {
        const d = nodeDistLabels[i];
        if (d === undefined || d === null) return;

        const label = d === Infinity ? "∞" : d;

        // Dark pill background
        ctx.fillStyle = "rgba(2, 6, 23, 0.85)";
        ctx.beginPath();
        ctx.roundRect(b.position.x - 14, b.position.y + 25, 28, 16, 4);
        ctx.fill();

        ctx.fillStyle = "#facc15";
        ctx.fillText(label, b.position.x, b.position.y + 33);
    });
});

/* ================= MAIN RUN ================= */

function run(adjList, start) {

    const INF = Infinity;
    const dist = Array(nodes).fill(INF);
    const visited = Array(nodes).fill(false);

    dist[start] = 0;
    nodeDistLabels = [...dist];

    steps.push({ t: "dist_init", dist: [...dist] });
    steps.push({ t: "active", u: start });

    // Simple min-priority queue (array sort — fine for small graphs)
    const pq = [[0, start]];

    while (pq.length > 0) {

        pq.sort((a, b) => a[0] - b[0]);
        const [d, u] = pq.shift();

        if (visited[u]) continue;
        visited[u] = true;

        steps.push({ t: "visit", u, d });

        for (const { node: v, weight: w } of adjList[u]) {

            if (w === null || w === undefined) continue;

            steps.push({ t: "relax", u, v });

            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push([dist[v], v]);
                steps.push({ t: "dist", u: v, d: dist[v] });
                steps.push({ t: "active", u: v });
            }
        }
    }

    steps.push({ t: "result", dist: [...dist] });
}

/* ================= ANIMATION ================= */

function play() {
    if (isRunning) return;
    isRunning = true;

    let i = 0;
    const delay = 600;

    function next() {
        if (i >= steps.length) {
            isRunning = false;
            return;
        }

        applyStep(steps[i++]);
        setTimeout(next, delay);
    }

    next();
}

/* ================= APPLY STEP ================= */

function applyStep(s) {

    if (s.t === "dist_init") {
        nodeDistLabels = s.dist.map(d => d === Infinity ? Infinity : d);
        return;
    }

    if (s.t === "result") {
        let text = "✅ Shortest Distances:\n";
        s.dist.forEach((d, i) => {
            text += `  Node ${i}: ${d === Infinity ? "∞ (unreachable)" : d}\n`;
        });
        document.getElementById("codeArea").textContent = text;
        return;
    }

    if (!nodeBodies || !nodeBodies[s.u]) return;

    if (s.t === "active") {
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow
    }

    if (s.t === "visit") {
        nodeBodies[s.u].render.fillStyle = "#22c55e"; // green — settled
    }

    if (s.t === "dist") {
        nodeDistLabels[s.u] = s.d;
        nodeBodies[s.u].render.fillStyle = "#f97316"; // orange — relaxed
    }

    if (s.t === "relax") {
        edgeList.forEach(e => {
            if (
                (e.u === s.u && e.v === s.v) ||
                (!isDirected && e.u === s.v && e.v === s.u)
            ) {
                e.active = true;
            }
        });
    }
}

/* ================= RESET ================= */

function resetGraph() {
    nodeBodies.forEach(node => {
        node.render.fillStyle = "#020617";
    });
    edgeList.forEach(edge => {
        edge.active = false;
    });
    nodeDistLabels = [];
    isRunning = false;
    document.getElementById("codeArea").textContent = "";
}

/* ================= BUTTON ================= */

function runDijkstra() {

    nodes = Number(document.getElementById("n").value);
    const start = Number(document.getElementById("start").value);

    if (isNaN(nodes) || nodes <= 0) {
        alert("Enter valid number of nodes");
        return;
    }

    if (isNaN(start) || start < 0 || start >= nodes) {
        alert("Invalid start node");
        return;
    }

    const edgeInput = document.getElementById("edges").value.trim();
    const weightInput = document.getElementById("weights").value.trim();

    if (!edgeInput) { alert("Enter edges"); return; }
    if (!weightInput) { alert("Dijkstra requires weights! Enter them in the Weights field."); return; }

    resetGraph();

    const edgePairs = edgeInput.split(",").map(e => e.trim().split("-").map(Number));
    const weightArr = weightInput.split(",").map(Number);

    let adjList = Array.from({ length: nodes }, () => []);

    edgePairs.forEach(([u, v], idx) => {
        if (isNaN(u) || isNaN(v) || u >= nodes || v >= nodes) return;
        const w = isNaN(weightArr[idx]) ? 1 : weightArr[idx];
        adjList[u].push({ node: v, weight: w });
        if (!isDirected) {
            adjList[v].push({ node: u, weight: w });
        }
    });

    steps = [];
    run(adjList, start);
    play();
}

/* ================= CODE DISPLAY ================= */

function showCode(lang) {

    const codeArea = document.getElementById("codeArea");
    let code = "";

    if (lang === "cpp") {
        code = `#include <bits/stdc++.h>
using namespace std;
typedef pair<int,int> pii;

vector<int> dijkstra(int src, int n,
        vector<vector<pii>>& adj) {
    vector<int> dist(n, INT_MAX);
    priority_queue<pii, vector<pii>,
                   greater<pii>> pq;
    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u])
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
    }
    return dist;
}`;

    } else if (lang === "java") {
        code = `import java.util.*;

class Dijkstra {
  static int[] dijkstra(int src, int n,
      List<int[]>[] adj) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    PriorityQueue<int[]> pq =
        new PriorityQueue<>(
            Comparator.comparingInt(a -> a[0]));
    dist[src] = 0;
    pq.offer(new int[]{0, src});

    while (!pq.isEmpty()) {
      int[] cur = pq.poll();
      int d = cur[0], u = cur[1];
      if (d > dist[u]) continue;
      for (int[] e : adj[u]) {
        int v = e[0], w = e[1];
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          pq.offer(new int[]{dist[v], v});
        }
      }
    }
    return dist;
  }
}`;

    } else if (lang === "python") {
        code = `import heapq

def dijkstra(src, n, adj):
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq,
                    (dist[v], v))

    return dist`;
    }

    codeArea.textContent = code;
}
