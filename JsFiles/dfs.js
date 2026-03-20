function showCode(lang) {

    const codeArea = document.getElementById("codeArea");

    let code = "";

    if (lang === "cpp") {
        code = `
#include <bits/stdc++.h>
using namespace std;

void dfs(int u, vector<vector<int>>& adj, vector<bool>& visited){
    visited[u] = true;
    cout << u << " ";

    for(int v : adj[u]){
        if(!visited[v]){
            dfs(v, adj, visited);
        }
    }
}
`;
    }

    else if (lang === "java") {
        code = `
import java.util.*;

class DFS {
    static void dfs(int u, List<List<Integer>> adj, boolean[] visited){
        visited[u] = true;
        System.out.print(u + " ");

        for(int v : adj.get(u)){
            if(!visited[v]){
                dfs(v, adj, visited);
            }
        }
    }
}
`;
    }

    else if (lang === "python") {
        code = `
def dfs(u, adj, visited):
    visited[u] = True
    print(u, end=" ")

    for v in adj[u]:
        if not visited[v]:
            dfs(v, adj, visited)
`;
    }

    codeArea.textContent = code;
}
let nodes, ed;
console.log("DFS JS Loaded");

let steps = [];
let isRunning = false;

/* ================= DFS LOGIC ================= */

function run(adjList, start) {
    const visited = Array(nodes).fill(false);

    function dfs(u) {

        visited[u] = true;

        steps.push({ t: "active", u });   // exploring
        steps.push({ t: "visit", u });    // visited

        for (const v of adjList[u]) {
            if (!visited[v]) {

                steps.push({ t: "edge", u, v }); // edge traversal
                dfs(v);

                // 🔥 backtracking step
                steps.push({ t: "backtrack", u });
            }
        }
    }

    // Start DFS from given node
    dfs(start);

    // Handle disconnected components
    for (let i = 0; i < nodes; i++) {
        if (!visited[i]) {
            dfs(i);
        }
    }
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

    if (s.t === "active") {
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow
    }

    if (s.t === "visit") {
        nodeBodies[s.u].render.fillStyle = "#22c55e"; // green
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

    if (s.t === "backtrack") {
        nodeBodies[s.u].render.fillStyle = "#3b82f6"; // blue
    }
}

/* ================= RESET GRAPH ================= */

function resetGraph() {
    nodeBodies.forEach(node => {
        node.render.fillStyle = "#020617";
    });

    edgeList.forEach(edge => {
        edge.active = false;
    });
}

/* ================= RUN DFS ================= */

function runDFS() {

    nodes = Number(document.getElementById("n").value);
    const start = Number(document.getElementById("start").value);

    if (isNaN(start) || start < 0 || start >= nodes) {
        alert("Invalid start node");
        return;
    }

    resetGraph();

    ed = document.getElementById("edges")
        .value.split(",")
        .map(edge => edge.trim().split("-").map(Number));

    let adjList = Array.from({ length: nodes }, () => []);

    ed.forEach(edge => {
        const [u, v] = edge;
        adjList[u].push(v);

        if (!document.getElementById("directedBtn").classList.contains("active")) {
            adjList[v].push(u);
        }
    });

    steps = [];

    run(adjList, start);
    play();
}