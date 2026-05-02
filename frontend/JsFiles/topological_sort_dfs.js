let nodes, ed;
console.log("Topological Sort (DFS) JS Loaded");


/* ================= MAIN RUN ================= */

function run(adjList) {

    const visited = Array(nodes).fill(false);
    const stack   = []; // finish order → reversed = topo order

    function dfs(u) {
        visited[u] = true;
        steps.push({ t: "active", u });

        for (const v of adjList[u]) {
            if (!visited[v]) {
                steps.push({ t: "edge", u, v });
                dfs(v);
                steps.push({ t: "backtrack", u });
            }
        }

        stack.push(u);
        steps.push({ t: "done", u }); // purple — added to stack
    }

    for (let i = 0; i < nodes; i++) {
        if (!visited[i]) dfs(i);
    }

    const topoOrder = [...stack].reverse();
    steps.push({ t: "result", order: topoOrder });
}

/* ================= ANIMATION ================= */

/* play() removed — StepController handles playback */

/* ================= APPLY STEP ================= */

function applyStep(s) {

    if (s.t === "result") {
        document.getElementById("codeArea").textContent =
            "Success Topological Order (DFS):
" + s.order.join(" → ");
        return;
    }

    if (!nodeBodies || !nodeBodies[s.u]) return;

    if (s.t === "active") {
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow
    }

    if (s.t === "backtrack") {
        nodeBodies[s.u].render.fillStyle = "#3b82f6"; // blue — backtracked
    }

    if (s.t === "done") {
        nodeBodies[s.u].render.fillStyle = "#a855f7"; // purple — in stack
    }

    if (s.t === "edge") {
        edgeList.forEach(e => {
            if (e.u === s.u && e.v === s.v) e.active = true;
        });
    }
}

/* ================= RESET ================= */

function resetGraph() {
    nodeBodies.forEach(n => { n.render.fillStyle = "#020617"; });
    edgeList.forEach(e => { e.active = false; });
        document.getElementById("codeArea").textContent = "";
}

/* ================= BUTTON ================= */

function runTopoDFS() {

    nodes = Number(document.getElementById("n").value);

    if (isNaN(nodes) || nodes <= 0) { alert("Enter valid number of nodes"); return; }

    const edgeInput = document.getElementById("edges").value.trim();
    if (!edgeInput) { alert("Enter directed edges (e.g. 0-1,1-2)"); return; }

    resetGraph();

    ed = edgeInput.split(",").map(e => e.trim().split("-").map(Number));

    let adjList = Array.from({ length: nodes }, () => []);
    ed.forEach(([u, v]) => {
        if (isNaN(u) || isNaN(v) || u >= nodes || v >= nodes) return;
        adjList[u].push(v); // directed only
    });

    steps = [];
    run(adjList);
    StepController.load(steps);

    if (document.getElementById('statusText'))

        document.getElementById('statusText').textContent = steps.length + ' steps generated';

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
         vector<bool>& vis, stack<int>& st) {
    vis[u] = true;
    for (int v : adj[u])
        if (!vis[v]) dfs(v, adj, vis, st);
    st.push(u);
}

vector<int> topoSort(int n,
        vector<vector<int>>& adj) {
    vector<bool> vis(n, false);
    stack<int> st;
    for (int i = 0; i < n; i++)
        if (!vis[i]) dfs(i, adj, vis, st);
    vector<int> order;
    while (!st.empty()) {
        order.push_back(st.top());
        st.pop();
    }
    return order;
}`;

    } else if (lang === "java") {
        code = `import java.util.*;

class TopoDFS {
  static List<Integer> topoSort(int n,
      List<List<Integer>> adj) {
    boolean[] vis = new boolean[n];
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = 0; i < n; i++)
      if (!vis[i]) dfs(i, adj, vis, st);
    List<Integer> order = new ArrayList<>(st);
    Collections.reverse(order);
    return order;
  }
  static void dfs(int u,
      List<List<Integer>> adj,
      boolean[] vis, Deque<Integer> st) {
    vis[u] = true;
    for (int v : adj.get(u))
      if (!vis[v]) dfs(v, adj, vis, st);
    st.push(u);
  }
}`;

    } else if (lang === "python") {
        code = `def topo_dfs(n, adj):
    visited = [False] * n
    stack = []

    def dfs(u):
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                dfs(v)
        stack.append(u)

    for i in range(n):
        if not visited[i]:
            dfs(i)

    return stack[::-1]  # reverse = topo order`;
    }

    codeArea.textContent = code;
}
