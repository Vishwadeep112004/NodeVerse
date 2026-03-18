function showCode(lang){

    const codeArea = document.getElementById("codeArea");

    let code = "";

    if(lang === "cpp"){
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

    else if(lang === "java"){
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

    else if(lang === "python"){
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

let steps=[];

function run(adjList)
{
    const visited = Array(nodes).fill(false);
    const queue = [];

    visited[0] = true;
    queue.push(0);

    while(queue.length > 0)
    {
        const u = queue.shift();
        steps.push({u:"visited"});

        for(const v of adjList[u])
        {
            if(!visited[v])
            {
                steps.push({v:"edge visited"})
                visited[v] = true;
                queue.push(v);
            }
        }
    }
}

function runBFS()
{
    nodes=Number(document.getElementById("n").value);
    ed=document.getElementById("edges").value.split(",").map(edge => edge.trim().split("-").map(Number));
    adjList = Array.from({length: nodes}, () => []);
    
    ed.forEach(edge => {
        const [u, v] = edge;
        adjList[u].push(v);
        if(!document.getElementById("directedBtn").classList.contains("active")){
            adjList[v].push(u);
        }
    });

    run(adjList);
}

