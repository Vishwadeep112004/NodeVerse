let nodes, ed;
console.log("Kosaraju's Algorithm JS Loaded");

let steps = [];
let isRunning = false;

const SCC_COLORS = [
    "#22c55e", // green
    "#3b82f6", // blue
    "#f97316", // orange
    "#a855f7", // purple
    "#14b8a6", // teal
    "#ec4899", // pink
    "#eab308"  // yellow-green
];

/* ================= MAIN RUN ================= */

function run(adjList, radjList) {

    const visited = Array(nodes).fill(false);
    const finishStack = [];

    /* ===== PASS 1: DFS on original graph, record finish order ===== */

    function dfs1(u) {
        visited[u] = true;

        steps.push({ t: "active", u });
        steps.push({ t: "visit", u });

        for (const v of adjList[u]) {
            if (!visited[v]) {
                steps.push({ t: "edge", u, v });
                dfs1(v);
            }
        }

        finishStack.push(u);
        steps.push({ t: "done", u }); // grey — finished in pass 1
    }

    steps.push({ t: "log", msg: "⏳ Pass 1: DFS on original graph\n(recording finish order...)" });

    for (let i = 0; i < nodes; i++) {
        if (!visited[i]) dfs1(i);
    }

    steps.push({ t: "log", msg: "✅ Pass 1 complete.\nFinish order: [" + finishStack.join(", ") + "]\n\n⏳ Pass 2: DFS on reversed graph..." });

    /* ===== PASS 2: DFS on reversed graph in reverse finish order ===== */

    const visited2 = Array(nodes).fill(false);
    let compId = 0;

    // Reset edge highlights between passes
    steps.push({ t: "reset_edges" });

    function dfs2(u, comp) {
        visited2[u] = true;
        steps.push({ t: "pass2", u });
        steps.push({ t: "scc", u, comp });

        for (const v of radjList[u]) {
            if (!visited2[v]) {
                steps.push({ t: "edge_rev", u, v });
                dfs2(v, comp);
            }
        }
    }

    while (finishStack.length > 0) {
        const u = finishStack.pop();
        if (!visited2[u]) {
            dfs2(u, compId);
            compId++;
        }
    }

    steps.push({ t: "result", numSCC: compId });
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

    if (s.t === "log") {
        document.getElementById("codeArea").textContent = s.msg;
        return;
    }

    if (s.t === "reset_edges") {
        edgeList.forEach(e => { e.active = false; });
        return;
    }

    if (s.t === "result") {
        let text = `✅ Found ${s.numSCC} Strongly Connected Component(s).\n\n`;
        text += "Color legend:\n";
        for (let i = 0; i < s.numSCC; i++) {
            text += `  SCC ${i}: ${SCC_COLORS[i % SCC_COLORS.length]}\n`;
        }
        document.getElementById("codeArea").textContent = text;
        return;
    }

    // Safety check for node-based steps
    if (!nodeBodies || (s.u !== undefined && !nodeBodies[s.u])) return;

    if (s.t === "active") {
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow
    }

    if (s.t === "visit") {
        nodeBodies[s.u].render.fillStyle = "#22c55e"; // green
    }

    if (s.t === "done") {
        nodeBodies[s.u].render.fillStyle = "#475569"; // slate — pass 1 finished
    }

    if (s.t === "edge") {
        edgeList.forEach(e => {
            if (e.u === s.u && e.v === s.v) e.active = true;
        });
    }

    if (s.t === "pass2") {
        nodeBodies[s.u].render.fillStyle = "#f97316"; // orange — being explored in pass 2
    }

    if (s.t === "scc") {
        const color = SCC_COLORS[s.comp % SCC_COLORS.length];
        nodeBodies[s.u].render.fillStyle = color; // final SCC color
    }

    if (s.t === "edge_rev") {
        // Reversed edge — highlight in reverse direction
        edgeList.forEach(e => {
            if (e.u === s.v && e.v === s.u) e.active = true; // reversed
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
    isRunning = false;
    document.getElementById("codeArea").textContent = "";
}

/* ================= BUTTON ================= */

function runKosaraju() {

    nodes = Number(document.getElementById("n").value);

    if (isNaN(nodes) || nodes <= 0) {
        alert("Enter valid number of nodes");
        return;
    }

    const edgeInput = document.getElementById("edges").value.trim();

    if (!edgeInput) {
        alert("Enter directed edges (e.g. 0-1,1-2,2-0)");
        return;
    }

    resetGraph();

    ed = edgeInput.split(",").map(edge => edge.trim().split("-").map(Number));

    let adjList  = Array.from({ length: nodes }, () => []);
    let radjList = Array.from({ length: nodes }, () => []); // reversed graph

    ed.forEach(([u, v]) => {
        if (isNaN(u) || isNaN(v) || u >= nodes || v >= nodes) return;
        adjList[u].push(v);
        radjList[v].push(u); // reverse edge for pass 2
    });

    steps = [];
    run(adjList, radjList);
    play();
}

/* ================= CODE DISPLAY ================= */

function showCode(lang) {

    const codeArea = document.getElementById("codeArea");
    let code = "";

    if (lang === "cpp") {
        code = `#include <bits/stdc++.h>
using namespace std;

void dfs1(int u, vector<vector<int>>& adj,
          vector<bool>& vis, stack<int>& st) {
    vis[u] = true;
    for (int v : adj[u])
        if (!vis[v]) dfs1(v, adj, vis, st);
    st.push(u);
}

void dfs2(int u, vector<vector<int>>& radj,
          vector<bool>& vis) {
    vis[u] = true;
    for (int v : radj[u])
        if (!vis[v]) dfs2(v, radj, vis);
}

int kosaraju(int n, vector<vector<int>>& adj) {
    vector<bool> vis(n, false);
    stack<int> st;
    for (int i = 0; i < n; i++)
        if (!vis[i]) dfs1(i, adj, vis, st);

    vector<vector<int>> radj(n);
    for (int u = 0; u < n; u++)
        for (int v : adj[u])
            radj[v].push_back(u);

    fill(vis.begin(), vis.end(), false);
    int scc = 0;
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (!vis[u]) { dfs2(u, radj, vis); scc++; }
    }
    return scc;
}`;

    } else if (lang === "java") {
        code = `import java.util.*;

class Kosaraju {
  static void dfs1(int u, List<List<Integer>> adj,
      boolean[] vis, Deque<Integer> st) {
    vis[u] = true;
    for (int v : adj.get(u))
      if (!vis[v]) dfs1(v, adj, vis, st);
    st.push(u);
  }
  static void dfs2(int u,
      List<List<Integer>> radj, boolean[] vis) {
    vis[u] = true;
    for (int v : radj.get(u))
      if (!vis[v]) dfs2(v, radj, vis);
  }
  static int kosaraju(int n,
      List<List<Integer>> adj) {
    boolean[] vis = new boolean[n];
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = 0; i < n; i++)
      if (!vis[i]) dfs1(i, adj, vis, st);

    List<List<Integer>> radj = new ArrayList<>();
    for (int i = 0; i < n; i++) radj.add(new ArrayList<>());
    for (int u = 0; u < n; u++)
      for (int v : adj.get(u)) radj.get(v).add(u);

    Arrays.fill(vis, false);
    int scc = 0;
    while (!st.isEmpty()) {
      int u = st.pop();
      if (!vis[u]) { dfs2(u, radj, vis); scc++; }
    }
    return scc;
  }
}`;

    } else if (lang === "python") {
        code = `from collections import defaultdict

def kosaraju(n, edges):
    adj  = defaultdict(list)
    radj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
        radj[v].append(u)

    vis, order = set(), []
    def dfs1(u):
        vis.add(u)
        for v in adj[u]:
            if v not in vis: dfs1(v)
        order.append(u)

    for i in range(n):
        if i not in vis: dfs1(i)

    vis2, scc = set(), 0
    def dfs2(u):
        vis2.add(u)
        for v in radj[u]:
            if v not in vis2: dfs2(v)

    for u in reversed(order):
        if u not in vis2:
            dfs2(u); scc += 1

    return scc`;
    }

    codeArea.textContent = code;
}
