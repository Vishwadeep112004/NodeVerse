const toggle=document.getElementById("menu-toggle");
const navLinks=document.getElementById("nav-links");

toggle.addEventListener("click",()=>{
    navLinks.classList.toggle("active");
});

function goToBFSVisualizer(){
    window.location.href="./bfs.html"
}

function goToDFSVisualizer(){
    window.location.href="./dfs.html"
}

function goToConnectedComponentsVisualizer(){
    window.location.href="./connected_components.html"
}

function goToCycleDetectionUndirectedVisualizer(){
    window.location.href="./cycle_detection_undirected.html"
}

function goToCycleDetectionDirectedVisualizer(){
    window.location.href="./cycle_detection_directed.html"
}

function goToBipartiteGraphCheckVisualizer(){
    window.location.href="./bipartite_check.html"
}

function goToTopologicalSortDFSVisualizer(){
    window.location.href="./topological_sort_dfs.html"
}

function goToTopologicalSortKahnVisualizer(){
    window.location.href="./topological_sort_kahn.html"
}

function goToKosarajuVisualizer(){
    window.location.href="./kosaraju.html"
}

function goToTarjanVisualizer(){
    window.location.href="./tarjan.html"
}

function goToDijkstraVisualizer(){
    window.location.href="./dijkstra.html"
}

function goToBellmanFordVisualizer(){
    window.location.href="./bellman_ford.html"
}

function goToFloydWarshallVisualizer(){
    window.location.href="./floyd_warshall.html"
}

function goToPrimVisualizer(){
    window.location.href="./prim.html"
}

function goToKruskalVisualizer(){
    window.location.href="./kruskal.html"
}