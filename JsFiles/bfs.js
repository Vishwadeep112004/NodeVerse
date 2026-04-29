/* =====================================================
   bfs.js — Breadth First Search
   Uses StepController from visualizer.js
   ===================================================== */

console.log("BFS JS Loaded");

let parent = [];

/* ================= BFS STEP GENERATOR ================= */

function run(adjList, start) {
    const visited = Array(nodeBodies.length).fill(false);
    parent = Array(nodeBodies.length).fill(-1);

    function bfs(s) {
        const queue = [];
        visited[s] = true;
        queue.push(s);
        steps.push({ t: "active", u: s });

        while (queue.length > 0) {
            const u = queue.shift();
            steps.push({ t: "visit", u });

            for (const v of adjList[u]) {
                if (!visited[v]) {
                    visited[v] = true;
                    queue.push(v);
                    parent[v] = u;
                    steps.push({ t: "edge", u, v });
                    steps.push({ t: "active", u: v });
                }
            }
        }
    }

    bfs(start);

    // Handle disconnected components
    for (let i = 0; i < nodeBodies.length; i++) {
        if (!visited[i]) bfs(i);
    }
}

/* ================= APPLY STEP ================= */

function applyStep(s) {
    if (s.t === "active") {
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow — in queue
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
}

/* ================= RUN BFS ================= */

function runBFS() {
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
        const parts = edge.trim().split("-").map(Number);
        const [u, v] = parts;
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

/* ================= SHOW PATH ================= */

function showPath() {
    const start  = Number(document.getElementById("start").value);
    const nNodes = nodeBodies.length;
    let output = "BFS Shortest Paths from Node " + start + ":\n\n";

    for (let i = 0; i < nNodes; i++) {
        if (i === start) { output += `Node ${i}: [${i}]\n`; continue; }

        let path = [], curr = i;
        while (curr !== -1) { path.push(curr); curr = parent[curr]; }
        path.reverse();

        if (path[0] !== start) {
            output += `Node ${i}: Unreachable\n`;
        } else {
            output += `Node ${i}: ${path.join(" → ")}\n`;
        }
    }

    document.getElementById("codeArea").textContent = output;
}

/* ================= CODE DISPLAY ================= */

function showCode(lang) {
    const codeArea = document.getElementById("codeArea");
    let code = "";

    if (lang === "cpp") {
        code = `#include <bits/stdc++.h>
using namespace std;

void bfs(int start, vector<vector<int>>& adj) {
    int n = adj.size();
    vector<bool> visited(n, false);
    queue<int> q;

    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " ";

        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`;
    } else if (lang === "java") {
        code = `import java.util.*;

class BFS {
    static void bfs(int start, List<List<Integer>> adj) {
        boolean[] visited = new boolean[adj.size()];
        Queue<Integer> q = new LinkedList<>();

        visited[start] = true;
        q.add(start);

        while (!q.isEmpty()) {
            int u = q.poll();
            System.out.print(u + " ");

            for (int v : adj.get(u)) {
                if (!visited[v]) {
                    visited[v] = true;
                    q.add(v);
                }
            }
        }
    }
}`;
    } else if (lang === "python") {
        code = `from collections import deque

def bfs(start, adj):
    visited = [False] * len(adj)
    q = deque()

    visited[start] = True
    q.append(start)

    while q:
        u = q.popleft()
        print(u, end=" ")

        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                q.append(v)`;
    }

    codeArea.textContent = code;
}