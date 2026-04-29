let nodes, ed;
console.log("Topological Sort (Kahn's) JS Loaded");


/* ================= MAIN RUN ================= */

function run(adjList) {

    const indegree = Array(nodes).fill(0);

    for (let u = 0; u < nodes; u++) {
        for (const v of adjList[u]) {
            indegree[v]++;
        }
    }

    // Show initial indegrees
    steps.push({ t: "indegree", degrees: [...indegree] });

    const queue = [];

    for (let i = 0; i < nodes; i++) {
        if (indegree[i] === 0) {
            queue.push(i);
            steps.push({ t: "active", u: i });
        }
    }

    const topoOrder = [];

    while (queue.length > 0) {

        const u = queue.shift();

        steps.push({ t: "visit", u });

        topoOrder.push(u);

        for (const v of adjList[u]) {

            steps.push({ t: "edge", u, v });

            indegree[v]--;

            if (indegree[v] === 0) {
                queue.push(v);
                steps.push({ t: "active", u: v });
            }
        }

        steps.push({ t: "done", u });
    }

    if (topoOrder.length !== nodes) {
        steps.push({ t: "cycle_detected" });
    } else {
        steps.push({ t: "result", order: [...topoOrder] });
    }
}

/* ================= ANIMATION ================= */

/* play() removed — StepController handles playback */

/* ================= APPLY STEP ================= */

function applyStep(s) {

    if (s.t === "indegree") {
        let text = "Indegrees:
";
        s.degrees.forEach((d, i) => { text += `  Node ${i}: ${d}
`; });
        document.getElementById("codeArea").textContent = text;
        return;
    }

    if (s.t === "result") {
        document.getElementById("codeArea").textContent =
            "✅ Topological Order:
" + s.order.join(" → ");
        return;
    }

    if (s.t === "cycle_detected") {
        document.getElementById("codeArea").textContent =
            "❌ Cycle Detected!
Topological Sort not possible on cyclic graph.";
        return;
    }

    // Safety check
    if (!nodeBodies || !nodeBodies[s.u]) return;

    if (s.t === "active") {
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow — in queue
    }

    if (s.t === "visit") {
        nodeBodies[s.u].render.fillStyle = "#22c55e"; // green — processing
    }

    if (s.t === "done") {
        nodeBodies[s.u].render.fillStyle = "#a855f7"; // purple — finalized
    }

    if (s.t === "edge") {
        edgeList.forEach(e => {
            if (e.u === s.u && e.v === s.v) {
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
        document.getElementById("codeArea").textContent = "";
}

/* ================= BUTTON ================= */

function runTopoKahn() {

    nodes = Number(document.getElementById("n").value);

    if (isNaN(nodes) || nodes <= 0) {
        alert("Enter valid number of nodes");
        return;
    }

    const edgeInput = document.getElementById("edges").value.trim();

    if (!edgeInput) {
        alert("Enter edges (e.g. 0-1,1-2)");
        return;
    }

    resetGraph();

    ed = edgeInput.split(",")
        .map(edge => edge.trim().split("-").map(Number));

    let adjList = Array.from({ length: nodes }, () => []);

    ed.forEach(edge => {
        const [u, v] = edge;
        if (isNaN(u) || isNaN(v) || u >= nodes || v >= nodes) return;
        adjList[u].push(v); // Directed only — Topo Sort requires DAG
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

vector<int> topoKahn(int n, vector<vector<int>>& adj) {
    vector<int> indegree(n, 0);
    for (int u = 0; u < n; u++)
        for (int v : adj[u]) indegree[v]++;

    queue<int> q;
    for (int i = 0; i < n; i++)
        if (indegree[i] == 0) q.push(i);

    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u])
            if (--indegree[v] == 0) q.push(v);
    }
    return order; // empty if cycle exists
}`;

    } else if (lang === "java") {
        code = `import java.util.*;

class TopoKahn {
    static List<Integer> topoSort(int n, List<List<Integer>> adj) {
        int[] indegree = new int[n];
        for (int u = 0; u < n; u++)
            for (int v : adj.get(u)) indegree[v]++;

        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < n; i++)
            if (indegree[i] == 0) q.add(i);

        List<Integer> order = new ArrayList<>();
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int v : adj.get(u))
                if (--indegree[v] == 0) q.add(v);
        }
        return order;
    }
}`;

    } else if (lang === "python") {
        code = `from collections import deque

def topo_kahn(n, adj):
    indegree = [0] * n
    for u in range(n):
        for v in adj[u]:
            indegree[v] += 1

    q = deque(i for i in range(n) if indegree[i] == 0)
    order = []

    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                q.append(v)

    return order  # len < n means cycle`;
    }

    codeArea.textContent = code;
}
