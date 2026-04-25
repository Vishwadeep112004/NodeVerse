let nodes, ed;
console.log("Prim's MST JS Loaded");

let steps = [];
let isRunning = false;

/* ================= MAIN RUN ================= */

function run(adjList, start) {

    const INF    = Infinity;
    const inMST  = Array(nodes).fill(false);
    const key    = Array(nodes).fill(INF);
    const parent = Array(nodes).fill(-1);

    key[start] = 0;
    let totalWeight = 0;

    // Priority queue: [key, node]
    const pq = [[0, start]];

    steps.push({ t: "active", u: start });

    while (pq.length > 0) {

        pq.sort((a, b) => a[0] - b[0]);
        const [k, u] = pq.shift();

        if (inMST[u]) continue;
        inMST[u] = true;
        totalWeight += k;

        steps.push({ t: "visit", u });

        // Add the MST edge (parent → u)
        if (parent[u] !== -1) {
            steps.push({ t: "mst_edge", u: parent[u], v: u });
        }

        for (const { node: v, weight: w } of adjList[u]) {

            if (!inMST[v] && w < key[v]) {
                key[v]    = w;
                parent[v] = u;
                pq.push([key[v], v]);
                steps.push({ t: "candidate", u: v, w });
            }
        }
    }

    steps.push({ t: "result", totalWeight });
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
        document.getElementById("codeArea").textContent =
            `✅ MST Complete!\nTotal Weight: ${s.totalWeight}\n\n(Cyan edges = MST edges)`;
        return;
    }

    if (!nodeBodies || !nodeBodies[s.u]) return;

    if (s.t === "active") {
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow — start node
    }

    if (s.t === "candidate") {
        nodeBodies[s.u].render.fillStyle = "#f97316"; // orange — candidate
    }

    if (s.t === "visit") {
        nodeBodies[s.u].render.fillStyle = "#22c55e"; // green — in MST
    }

    if (s.t === "mst_edge") {
        // Highlight MST edge in teal/cyan
        edgeList.forEach(e => {
            if (
                (e.u === s.u && e.v === s.v) ||
                (e.u === s.v && e.v === s.u)
            ) {
                e.active = true;
            }
        });
    }
}

/* ================= RESET ================= */

function resetGraph() {
    nodeBodies.forEach(n => { n.render.fillStyle = "#020617"; });
    edgeList.forEach(e => { e.active = false; });
    isRunning = false;
    document.getElementById("codeArea").textContent = "";
}

/* ================= BUTTON ================= */

function runPrim() {

    nodes = Number(document.getElementById("n").value);
    const start = Number(document.getElementById("start").value);

    if (isNaN(nodes) || nodes <= 0) { alert("Enter valid number of nodes"); return; }
    if (isNaN(start) || start < 0 || start >= nodes) { alert("Invalid start node"); return; }

    const edgeInput   = document.getElementById("edges").value.trim();
    const weightInput = document.getElementById("weights").value.trim();

    if (!edgeInput)   { alert("Enter edges"); return; }
    if (!weightInput) { alert("Prim's requires weights!"); return; }

    resetGraph();

    const edgesRaw  = edgeInput.split(",").map(e => e.trim().split("-").map(Number));
    const weightArr = weightInput.split(",").map(Number);

    let adjList = Array.from({ length: nodes }, () => []);

    edgesRaw.forEach(([u, v], idx) => {
        if (isNaN(u) || isNaN(v) || u >= nodes || v >= nodes) return;
        const w = isNaN(weightArr[idx]) ? 1 : weightArr[idx];
        adjList[u].push({ node: v, weight: w });
        adjList[v].push({ node: u, weight: w }); // always undirected for MST
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

int prim(int src, int n,
        vector<vector<pii>>& adj) {
    vector<int> key(n, INT_MAX);
    vector<bool> inMST(n, false);
    priority_queue<pii, vector<pii>,
                   greater<pii>> pq;
    key[src] = 0;
    pq.push({0, src});
    int total = 0;

    while (!pq.empty()) {
        auto [k, u] = pq.top(); pq.pop();
        if (inMST[u]) continue;
        inMST[u] = true; total += k;

        for (auto [v, w] : adj[u])
            if (!inMST[v] && w < key[v]) {
                key[v] = w;
                pq.push({w, v});
            }
    }
    return total; // MST total weight
}`;

    } else if (lang === "java") {
        code = `import java.util.*;

class Prim {
  static int prim(int src, int n,
      List<int[]>[] adj) {
    int[] key = new int[n];
    boolean[] inMST = new boolean[n];
    Arrays.fill(key, Integer.MAX_VALUE);
    PriorityQueue<int[]> pq =
        new PriorityQueue<>(
            Comparator.comparingInt(a->a[0]));
    key[src] = 0;
    pq.offer(new int[]{0, src});
    int total = 0;

    while (!pq.isEmpty()) {
      int[] cur = pq.poll();
      int k=cur[0], u=cur[1];
      if (inMST[u]) continue;
      inMST[u]=true; total+=k;

      for (int[] e : adj[u]) {
        int v=e[0], w=e[1];
        if (!inMST[v] && w<key[v]) {
          key[v]=w;
          pq.offer(new int[]{w,v});
        }
      }
    }
    return total;
  }
}`;

    } else if (lang === "python") {
        code = `import heapq

def prim(src, n, adj):
    key = [float('inf')] * n
    in_mst = [False] * n
    key[src] = 0
    pq = [(0, src)]
    total = 0

    while pq:
        k, u = heapq.heappop(pq)
        if in_mst[u]: continue
        in_mst[u] = True
        total += k

        for v, w in adj[u]:
            if not in_mst[v] and w < key[v]:
                key[v] = w
                heapq.heappush(pq, (w, v))

    return total`;
    }

    codeArea.textContent = code;
}
