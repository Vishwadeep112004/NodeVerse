let nodes, ed;
console.log("Kruskal's MST JS Loaded");


/* ================= UNION-FIND ================= */

let parent_uf = [];
let rank_uf   = [];

function find(x) {
    if (parent_uf[x] !== x)
        parent_uf[x] = find(parent_uf[x]); // path compression
    return parent_uf[x];
}

function unite(x, y) {
    const px = find(x), py = find(y);
    if (px === py) return false; // already connected
    if (rank_uf[px] < rank_uf[py]) parent_uf[px] = py;
    else if (rank_uf[px] > rank_uf[py]) parent_uf[py] = px;
    else { parent_uf[py] = px; rank_uf[px]++; }
    return true;
}

/* ================= MAIN RUN ================= */

function run(edgeObjs) {

    // edgeObjs: [{u, v, w}] sorted by weight
    edgeObjs.sort((a, b) => a.w - b.w);

    // Init DSU
    parent_uf = Array.from({ length: nodes }, (_, i) => i);
    rank_uf   = Array(nodes).fill(0);

    let totalWeight = 0;
    let edgesInMST  = 0;

    for (const { u, v, w } of edgeObjs) {

        steps.push({ t: "check_edge", u, v, w }); // highlight edge being considered

        if (unite(u, v)) {
            // Edge accepted into MST
            steps.push({ t: "mst_edge", u, v, w });
            steps.push({ t: "visit", u });
            steps.push({ t: "visit", v });
            totalWeight += w;
            edgesInMST++;
        } else {
            // Edge skipped — would create cycle
            steps.push({ t: "skip_edge", u, v });
        }

        if (edgesInMST === nodes - 1) break; // MST complete
    }

    steps.push({ t: "result", totalWeight });
}

/* ================= ANIMATION ================= */

/* play() removed — StepController handles playback */

/* ================= APPLY STEP ================= */

function applyStep(s) {

    if (s.t === "result") {
        document.getElementById("codeArea").textContent =
            `Success MST Complete!
Total Weight: ${s.totalWeight}

(Green nodes + active edges = MST)`;
        return;
    }

    if (s.t === "check_edge") {
        // Briefly highlight the edge being considered
        edgeList.forEach(e => {
            const match = (e.u === s.u && e.v === s.v) || (e.u === s.v && e.v === s.u);
            if (match) e.active = true;
        });
        return;
    }

    if (s.t === "skip_edge") {
        // Deactivate — edge rejected
        edgeList.forEach(e => {
            const match = (e.u === s.u && e.v === s.v) || (e.u === s.v && e.v === s.u);
            if (match) { e.active = false; e.cycle = true; }
        });
        return;
    }

    if (s.t === "mst_edge") {
        // Keep edge permanently active (MST edge)
        edgeList.forEach(e => {
            const match = (e.u === s.u && e.v === s.v) || (e.u === s.v && e.v === s.u);
            if (match) { e.active = true; e.cycle = false; }
        });
        return;
    }

    if (!nodeBodies || !nodeBodies[s.u]) return;

    if (s.t === "visit") {
        nodeBodies[s.u].render.fillStyle = "#22c55e"; // green — in MST
    }
}

/* ================= RESET ================= */

function resetGraph() {
    nodeBodies.forEach(n => { n.render.fillStyle = "#020617"; });
    edgeList.forEach(e => { e.active = false; e.cycle = false; });
        document.getElementById("codeArea").textContent = "";
}

/* ================= BUTTON ================= */

function runKruskal() {

    nodes = Number(document.getElementById("n").value);
    if (isNaN(nodes) || nodes <= 0) { alert("Enter valid number of nodes"); return; }

    const edgeInput   = document.getElementById("edges").value.trim();
    const weightInput = document.getElementById("weights").value.trim();

    if (!edgeInput)   { alert("Enter edges"); return; }
    if (!weightInput) { alert("Kruskal's requires weights!"); return; }

    resetGraph();

    const edgesRaw  = edgeInput.split(",").map(e => e.trim().split("-").map(Number));
    const weightArr = weightInput.split(",").map(Number);

    const edgeObjs = edgesRaw.map(([u, v], idx) => ({
        u, v, w: isNaN(weightArr[idx]) ? 1 : weightArr[idx]
    })).filter(({ u, v }) => !isNaN(u) && !isNaN(v) && u < nodes && v < nodes);

    steps = [];
    run(edgeObjs);
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
typedef tuple<int,int,int> edge;

int parent[100], rnk[100];

int find(int x) {
    return parent[x]==x ? x :
           parent[x]=find(parent[x]);
}

bool unite(int x, int y) {
    x=find(x); y=find(y);
    if (x==y) return false;
    if (rnk[x]<rnk[y]) swap(x,y);
    parent[y]=x;
    if (rnk[x]==rnk[y]) rnk[x]++;
    return true;
}

int kruskal(int n, vector<edge>& edges) {
    sort(edges.begin(), edges.end());
    iota(parent, parent+n, 0);
    fill(rnk, rnk+n, 0);
    int total = 0, cnt = 0;
    for (auto [w,u,v] : edges) {
        if (unite(u, v)) {
            total += w; cnt++;
            if (cnt == n-1) break;
        }
    }
    return total;
}`;

    } else if (lang === "java") {
        code = `import java.util.*;

class Kruskal {
  static int[] par, rnk;

  static int find(int x) {
    return par[x]==x ? x :
           (par[x]=find(par[x]));
  }

  static boolean unite(int x, int y) {
    x=find(x); y=find(y);
    if (x==y) return false;
    if (rnk[x]<rnk[y]) { int t=x;x=y;y=t; }
    par[y]=x;
    if (rnk[x]==rnk[y]) rnk[x]++;
    return true;
  }

  static int kruskal(int n, int[][] edges) {
    Arrays.sort(edges,(a,b)->a[2]-b[2]);
    par=new int[n]; rnk=new int[n];
    for(int i=0;i<n;i++) par[i]=i;
    int total=0, cnt=0;
    for (int[] e : edges) {
      if (unite(e[0],e[1])) {
        total+=e[2]; cnt++;
        if (cnt==n-1) break;
      }
    }
    return total;
  }
}`;

    } else if (lang === "python") {
        code = `def kruskal(n, edges):
    edges.sort(key=lambda e: e[2])
    par = list(range(n))
    rnk = [0] * n

    def find(x):
        while par[x] != x:
            par[x] = par[par[x]]
            x = par[x]
        return x

    def unite(x, y):
        x,y = find(x),find(y)
        if x==y: return False
        if rnk[x]<rnk[y]: x,y=y,x
        par[y]=x
        if rnk[x]==rnk[y]: rnk[x]+=1
        return True

    total = cnt = 0
    for u,v,w in edges:
        if unite(u,v):
            total+=w; cnt+=1
            if cnt==n-1: break
    return total`;
    }

    codeArea.textContent = code;
}
