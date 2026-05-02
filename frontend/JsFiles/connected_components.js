/* =====================================================
   connected_components.js — Connected Components
   Uses StepController from visualizer.js
   ===================================================== */

console.log("Connected Components JS Loaded");

let ccComponents = [];
let ccNodeComponent = [];

/* ================= STEP GENERATOR ================= */

function buildCCSteps(nNodes, adjList) {
    const visited      = Array(nNodes).fill(false);
    ccNodeComponent    = Array(nNodes).fill(-1);
    ccComponents       = [];
    steps              = [];

    const COLORS = [
        "#22c55e", // green
        "#3b82f6", // blue
        "#facc15", // yellow
        "#ef4444", // red
        "#a855f7", // purple
        "#14b8a6"  // teal
    ];

    let compId = 0;

    for (let i = 0; i < nNodes; i++) {
        if (!visited[i]) {
            const comp  = [];
            const queue = [i];
            visited[i]  = true;
            const color = COLORS[compId % COLORS.length];

            while (queue.length) {
                const u = queue.shift();
                comp.push(u);
                ccNodeComponent[u] = compId;

                steps.push({ t: "visit", u, color });

                for (const { node: v } of adjList[u]) {
                    if (!visited[v]) {
                        visited[v] = true;
                        queue.push(v);
                        steps.push({ t: "edge", u, v });
                        steps.push({ t: "active", u: v, color });
                    }
                }
            }

            ccComponents.push(comp);
            compId++;
        }
    }

    // Final result step
    steps.push({ t: "result", components: ccComponents.map(c => [...c]) });
}

/* ================= APPLY STEP ================= */

function applyStep(s) {
    if (!nodeBodies) return;

    if (s.t === "active") {
        if (nodeBodies[s.u]) nodeBodies[s.u].render.fillStyle = "#facc15";
    }

    if (s.t === "visit") {
        if (nodeBodies[s.u]) nodeBodies[s.u].render.fillStyle = s.color;
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

    if (s.t === "result") {
        let output = `Connected Components Found: ${s.components.length}\n\n`;
        s.components.forEach((comp, i) => {
            output += `Component ${i + 1}: { ${comp.join(", ")} }\n`;
        });
        const codeArea = document.getElementById("codeArea");
        if (codeArea) codeArea.textContent = output;
    }
}

/* ================= RUN CONNECTED COMPONENTS ================= */

function runCC() {
    const nNodes = Number(document.getElementById("n").value);

    if (!graphCreated || nNodes <= 0) {
        alert("Build the graph first using 'Build Graph'");
        return;
    }

    // Reset visual state
    nodeBodies.forEach(n => { n.render.fillStyle = "#020617"; });
    edgeList.forEach(e   => { e.active = false; });

    buildCCSteps(nNodes, adj);
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

void bfs(int s, vector<vector<int>>& adj,
         vector<bool>& visited, vector<int>& comp) {
    queue<int> q;
    visited[s] = true;
    q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        comp.push_back(u);
        for (int v : adj[u])
            if (!visited[v]) { visited[v]=true; q.push(v); }
    }
}

int main() {
    int n = 6;
    vector<vector<int>> adj(n);
    // add edges...
    vector<bool> visited(n, false);
    int compCount = 0;
    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            vector<int> comp;
            bfs(i, adj, visited, comp);
            cout << "Component " << ++compCount << ": ";
            for (int x : comp) cout << x << " ";
            cout << "\\n";
        }
    }
}`;
    } else if (lang === "java") {
        code = `import java.util.*;

class ConnectedComponents {
    static void bfs(int s, List<List<Integer>> adj,
                    boolean[] vis, List<Integer> comp) {
        Queue<Integer> q = new LinkedList<>();
        vis[s] = true; q.add(s);
        while (!q.isEmpty()) {
            int u = q.poll(); comp.add(u);
            for (int v : adj.get(u))
                if (!vis[v]) { vis[v]=true; q.add(v); }
        }
    }
    public static void main(String[] args) {
        int n = 6;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i=0;i<n;i++) adj.add(new ArrayList<>());
        boolean[] vis = new boolean[n];
        int cnt = 0;
        for (int i=0;i<n;i++) {
            if (!vis[i]) {
                List<Integer> comp = new ArrayList<>();
                bfs(i, adj, vis, comp);
                System.out.println("Component " + (++cnt) + ": " + comp);
            }
        }
    }
}`;
    } else if (lang === "python") {
        code = `from collections import deque

def find_components(adj, n):
    visited = [False] * n
    components = []
    for i in range(n):
        if not visited[i]:
            comp, q = [], deque([i])
            visited[i] = True
            while q:
                u = q.popleft()
                comp.append(u)
                for v in adj[u]:
                    if not visited[v]:
                        visited[v] = True
                        q.append(v)
            components.append(comp)
    return components`;
    }

    if (codeArea) codeArea.textContent = code;
}
