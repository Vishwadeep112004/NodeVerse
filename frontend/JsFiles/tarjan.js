let nodes, ed;
console.log("Tarjan's Algorithm JS Loaded");


const SCC_COLORS = [
    "#22c55e", "#3b82f6", "#f97316",
    "#a855f7", "#14b8a6", "#ec4899", "#eab308"
];

/* ================= MAIN RUN ================= */

function run(adjList) {

    const disc     = Array(nodes).fill(-1);
    const low      = Array(nodes).fill(-1);
    const inStack  = Array(nodes).fill(false);
    const stk      = [];
    let timer      = 0;
    let sccCount   = 0;

    function dfs(u) {

        disc[u] = low[u] = timer++;
        stk.push(u);
        inStack[u] = true;

        steps.push({ t: "active", u });
        steps.push({ t: "visit",  u });

        for (const v of adjList[u]) {

            if (disc[v] === -1) {
                // Tree edge
                steps.push({ t: "edge", u, v });
                dfs(v);
                low[u] = Math.min(low[u], low[v]);

            } else if (inStack[v]) {
                // Back edge — part of SCC
                low[u] = Math.min(low[u], disc[v]);
                steps.push({ t: "back_edge", u, v });
            }
        }

        // u is root of an SCC
        if (low[u] === disc[u]) {

            const sccNodes = [];

            while (true) {
                const w = stk.pop();
                inStack[w] = false;
                sccNodes.push(w);
                if (w === u) break;
            }

            sccNodes.forEach(w => {
                steps.push({ t: "scc", u: w, comp: sccCount });
            });

            sccCount++;
        }
    }

    for (let i = 0; i < nodes; i++) {
        if (disc[i] === -1) dfs(i);
    }

    steps.push({ t: "result", numSCC: sccCount });
}

/* ================= ANIMATION ================= */

/* play() removed — StepController handles playback */

/* ================= APPLY STEP ================= */

function applyStep(s) {

    if (s.t === "result") {
        let text = `Success Found ${s.numSCC} SCC(s) via Tarjan's.

Color = SCC group`;
        document.getElementById("codeArea").textContent = text;
        return;
    }

    if (!nodeBodies || !nodeBodies[s.u]) return;

    if (s.t === "active") {
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow
    }

    if (s.t === "visit") {
        nodeBodies[s.u].render.fillStyle = "#22c55e"; // green
    }

    if (s.t === "edge") {
        edgeList.forEach(e => {
            if (e.u === s.u && e.v === s.v) e.active = true;
        });
    }

    if (s.t === "back_edge") {
        edgeList.forEach(e => {
            if (e.u === s.u && e.v === s.v) {
                e.active = true;
                e.cycle  = true;
            }
        });
    }

    if (s.t === "scc") {
        const color = SCC_COLORS[s.comp % SCC_COLORS.length];
        nodeBodies[s.u].render.fillStyle = color;
    }
}

/* ================= RESET ================= */

function resetGraph() {
    nodeBodies.forEach(n => { n.render.fillStyle = "#020617"; });
    edgeList.forEach(e => { e.active = false; e.cycle = false; });
        document.getElementById("codeArea").textContent = "";
}

/* ================= BUTTON ================= */

function runTarjan() {

    nodes = Number(document.getElementById("n").value);
    if (isNaN(nodes) || nodes <= 0) { alert("Enter valid number of nodes"); return; }

    const edgeInput = document.getElementById("edges").value.trim();
    if (!edgeInput) { alert("Enter directed edges"); return; }

    resetGraph();

    ed = edgeInput.split(",").map(e => e.trim().split("-").map(Number));

    let adjList = Array.from({ length: nodes }, () => []);
    ed.forEach(([u, v]) => {
        if (isNaN(u) || isNaN(v) || u >= nodes || v >= nodes) return;
        adjList[u].push(v); // directed
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

int timer_val = 0;

void dfs(int u, vector<vector<int>>& adj,
    vector<int>& disc, vector<int>& low,
    vector<bool>& inStk, stack<int>& stk,
    int& scc) {
    disc[u] = low[u] = timer_val++;
    stk.push(u); inStk[u] = true;

    for (int v : adj[u]) {
        if (disc[v] == -1) {
            dfs(v,adj,disc,low,inStk,stk,scc);
            low[u] = min(low[u], low[v]);
        } else if (inStk[v])
            low[u] = min(low[u], disc[v]);
    }

    if (low[u] == disc[u]) {
        while (stk.top() != u) {
            inStk[stk.top()] = false;
            stk.pop();
        }
        inStk[stk.top()] = false;
        stk.pop(); scc++;
    }
}

int tarjan(int n, vector<vector<int>>& adj) {
    vector<int> disc(n,-1), low(n,0);
    vector<bool> inStk(n,false);
    stack<int> stk;
    int scc = 0;
    for (int i = 0; i < n; i++)
        if (disc[i]==-1)
            dfs(i,adj,disc,low,inStk,stk,scc);
    return scc;
}`;

    } else if (lang === "java") {
        code = `import java.util.*;

class Tarjan {
  int[] disc, low; boolean[] inStk;
  Deque<Integer> stk = new ArrayDeque<>();
  int timer = 0, scc = 0;

  void dfs(int u, List<List<Integer>> adj) {
    disc[u] = low[u] = timer++;
    stk.push(u); inStk[u] = true;

    for (int v : adj.get(u)) {
      if (disc[v] == -1) {
        dfs(v, adj);
        low[u] = Math.min(low[u], low[v]);
      } else if (inStk[v])
        low[u] = Math.min(low[u], disc[v]);
    }

    if (low[u] == disc[u]) {
      while (stk.peek() != u) {
        inStk[stk.pop()] = false;
      }
      inStk[stk.pop()] = false; scc++;
    }
  }
}`;

    } else if (lang === "python") {
        code = `def tarjan(n, adj):
    disc = [-1]*n; low = [0]*n
    in_stk = [False]*n; stk = []
    timer = [0]; scc = [0]

    def dfs(u):
        disc[u] = low[u] = timer[0]; timer[0]+=1
        stk.append(u); in_stk[u] = True

        for v in adj[u]:
            if disc[v] == -1:
                dfs(v)
                low[u] = min(low[u], low[v])
            elif in_stk[v]:
                low[u] = min(low[u], disc[v])

        if low[u] == disc[u]:
            while stk[-1] != u:
                in_stk[stk.pop()] = False
            in_stk[stk.pop()] = False
            scc[0] += 1

    for i in range(n):
        if disc[i] == -1: dfs(i)
    return scc[0]`;
    }

    codeArea.textContent = code;
}
