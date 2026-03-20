function showCode(lang) {

    const codeArea = document.getElementById("codeArea");

    let code = "";

    if (lang === "cpp") {
        code = `
#include <bits/stdc++.h>
using namespace std;

void bfs(int start, vector<vector<int>>& adj){
    int n = adj.size();
    vector<bool> visited(n,false);
    queue<int> q;

    visited[start] = true;
    q.push(start);

    while(!q.empty()){
        int u = q.front();
        q.pop();
        cout << u << " ";

        for(int v : adj[u]){
            if(!visited[v]){
                visited[v] = true;
                q.push(v);
            }
        }
    }
}
`;
    }

    else if (lang === "java") {
        code = `
import java.util.*;

class BFS {
    static void bfs(int start, List<List<Integer>> adj){
        boolean[] visited = new boolean[adj.size()];
        Queue<Integer> q = new LinkedList<>();

        visited[start] = true;
        q.add(start);

        while(!q.isEmpty()){
            int u = q.poll();
            System.out.print(u + " ");

            for(int v : adj.get(u)){
                if(!visited[v]){
                    visited[v] = true;
                    q.add(v);
                }
            }
        }
    }
}
`;
    }

    else if (lang === "python") {
        code = `
from collections import deque

def bfs(start, adj):
    visited = [False]*len(adj)
    q = deque()

    visited[start] = True
    q.append(start)

    while q:
        u = q.popleft()
        print(u, end=" ")

        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                q.append(v)
`;
    }

    codeArea.textContent = code;
}

let nodes, ed;
console.log("BFS JS Loaded");

let steps = [];

function run(adjList, start)
{
    const visited = Array(nodes).fill(false);

    function bfs(s)
    {
        const queue = [];

        visited[s] = true;
        queue.push(s);

        steps.push({t:"active", u:s});

        while(queue.length > 0)
        {
            const u = queue.shift();

            steps.push({t:"visit", u});

            for(const v of adjList[u])
            {
                if(!visited[v])
                {
                    visited[v] = true;
                    queue.push(v);

                    steps.push({t:"edge", u, v});
                    steps.push({t:"active", u:v});
                }
            }
        }
    }

    // 🔹 First BFS from given start
    bfs(start);

    // 🔹 Then handle disconnected components
    for(let i = 0; i < nodes; i++)
    {
        if(!visited[i])
        {
            bfs(i);
        }
    }
}

function play() {
    let i = 0;
    const delay = 600;

    function next() {
        if (i >= steps.length) return;

        applyStep(steps[i++]);
        setTimeout(next, delay);
    }

    next();
}

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
}

function resetGraph()
{
    // Reset node colors
    nodeBodies.forEach(node => {
        node.render.fillStyle = "#020617"; // original color
    });

    // Reset edges
    edgeList.forEach(edge => {
        edge.active = false;
    });
}

function runBFS()
{
    nodes = Number(document.getElementById("n").value);

    const start = Number(document.getElementById("start").value);

    if(isNaN(start) || start < 0 || start >= nodes){
        alert("Invalid start node");
        return;
    }
    resetGraph();

    ed = document.getElementById("edges")
        .value.split(",")
        .map(edge => edge.trim().split("-").map(Number));

    adjList = Array.from({length: nodes}, () => []);
    
    ed.forEach(edge => {
        const [u, v] = edge;
        adjList[u].push(v);

        if(!document.getElementById("directedBtn").classList.contains("active")){
            adjList[v].push(u);
        }
    });

    steps = [];

    run(adjList, start);
    play();
}