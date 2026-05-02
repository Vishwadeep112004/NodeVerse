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

    //  DFS CYCLE DETECTION
    function dfs(u, parent){

        visited[u] = true;

        steps.push({t:"active", u});
        steps.push({t:"visit", u});

        for(const v of adjList[u]){

            if(!visited[v]){
                steps.push({t:"edge", u, v});

                if(dfs(v, u)) return true;
            }
            else if(v !== parent){
                //  cycle detected
                steps.push({t:"cycle", u, v});
                return true;
            }
        }

        return false;
    }

    //  BFS CYCLE DETECTION
    function bfs(s){

        const queue = [];
        queue.push({node:s, parent:-1});
        visited[s] = true;

        while(queue.length){

            const {node:u, parent} = queue.shift();

            steps.push({t:"active", u});
            steps.push({t:"visit", u});

            for(const v of adjList[u]){

                if(!visited[v]){
                    visited[v] = true;
                    queue.push({node:v, parent:u});

                    steps.push({t:"edge", u, v});
                }
                else if(v !== parent){
                    //  cycle detected
                    steps.push({t:"cycle", u, v});
                    return true;
                }
            }
        }

        return false;
    }

    //  Start from given node
    if(useDFS){
        if(dfs(start, -1)) return;
    } else {
        if(bfs(start)) return;
    }

    //  Handle disconnected graph
    for(let i=0;i<nodes;i++){
        if(!visited[i]){
            if(useDFS){
                if(dfs(i,-1)) break;
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

    if(s.t==="active"){
        nodeBodies[s.u].render.fillStyle = "#facc15"; // yellow
    }

    if(s.t==="visit"){
        nodeBodies[s.u].render.fillStyle = "#22c55e"; // green
    }

    if(s.t==="edge"){
        edgeList.forEach(e=>{
            if(
                (e.u===s.u && e.v===s.v) ||
                (e.u===s.v && e.v===s.u)
            ){
                e.active = true;
            }
        });
    }

    if(s.t==="cycle"){
        edgeList.forEach(e=>{
            if(
                (e.u===s.u && e.v===s.v) ||
                (e.u===s.v && e.v===s.u)
            ){
                e.active = true;
                e.cycle = true;
            }
        });

        nodeBodies[s.u].render.fillStyle = "#ef4444";
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

    ed.forEach(edge=>{
        const [u,v] = edge;
        adjList[u].push(v);
        adjList[v].push(u); 
    });

    steps = [];

    run(adjList, start);
    StepController.load(steps);

    if (document.getElementById('statusText'))

        document.getElementById('statusText').textContent = steps.length + ' steps generated';

    StepController.play();
}
