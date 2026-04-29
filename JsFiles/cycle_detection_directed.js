let nodes, ed;
console.log("Cycle Detection JS Loaded");

let useDFS = true;

/* ================= METHOD TOGGLE ================= */

function setMethod(val){
    useDFS = val;

    document.getElementById("DFS")?.classList.toggle("active", val);
    document.getElementById("BFS")?.classList.toggle("active", !val);
}

/* ================= MAIN RUN ================= */

function run(adjList, start){

    const visited = Array(nodes).fill(false);
    const recStack = Array(nodes).fill(false); // 🔥 IMPORTANT

    // 🔹 DFS CYCLE DETECTION (DIRECTED)
    function dfs(u){

        visited[u] = true;
        recStack[u] = true; // 🔥 mark in recursion stack

        steps.push({t:"active", u});
        steps.push({t:"visit", u});

        for(const v of adjList[u]){

            if(!visited[v]){
                steps.push({t:"edge", u, v});

                if(dfs(v)) return true;
            }
            else if(recStack[v]){ // 🔥 cycle condition
                steps.push({t:"cycle", u, v});
                return true;
            }
        }

        recStack[u] = false; // 🔥 remove from stack
        return false;
    }

    // ⚠️ BFS not valid for directed cycle detection (kept for UI)
    function bfs(){
        alert("BFS cycle detection is not supported for directed graphs. Use DFS.");
        return false;
    }

    // 🔹 Start from given node
    if(useDFS){
        if(dfs(start)) return;
    } else {
        if(bfs(start)) return;
    }

    // 🔹 Handle disconnected graph
    for(let i=0;i<nodes;i++){
        if(!visited[i]){
            if(useDFS){
                if(dfs(i)) break;
            } else {
                if(bfs(i)) break;
            }
        }
    }
}

/* ================= ANIMATION ================= */

function play(){
    if(isRunning) return;
    isRunning = true;

    let i=0;
    const delay = 600;

    function next(){
        if(i>=steps.length){
                        return;
        }

        applyStep(steps[i++]);
        setTimeout(next, delay);
    }

    next();
}

/* ================= APPLY STEP ================= */

function applyStep(s){

    // 🔥 SAFETY CHECK (fix your crash)
    if(!nodeBodies || !nodeBodies[s.u]) return;

    if(s.t==="active"){
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow
    }

    if(s.t==="visit"){
        nodeBodies[s.u].render.fillStyle = "#22c55e"; // green
    }

    if(s.t==="edge"){
        edgeList.forEach(e=>{
            if(e.u===s.u && e.v===s.v){ // directed match
                e.active = true;
            }
        });
    }

    if(s.t==="cycle"){
        edgeList.forEach(e=>{
            if(e.u===s.u && e.v===s.v){
                e.active = true;
                e.cycle = true;
            }
        });

        nodeBodies[s.u].render.fillStyle = "#ef4444";
        if(nodeBodies[s.v])
            nodeBodies[s.v].render.fillStyle = "#ef4444";
    }
}

/* ================= RESET ================= */

function resetGraph(){
    nodeBodies.forEach(node=>{
        node.render.fillStyle = "#020617";
    });

    edgeList.forEach(edge=>{
        edge.active = false;
        edge.cycle = false;
    });
}

/* ================= BUTTON ================= */

function runCycleDetection(){

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

    let adjList = Array.from({length:nodes}, ()=>[]);

    // 🔥 DIRECTED GRAPH (IMPORTANT CHANGE)
    ed.forEach(edge=>{
        const [u,v] = edge;
        adjList[u].push(v); // only one direction
    });

    steps = [];

    run(adjList, start);
    StepController.load(steps);

    if (document.getElementById('statusText'))

        document.getElementById('statusText').textContent = steps.length + ' steps generated';

    StepController.play();
}
