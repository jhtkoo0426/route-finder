import BaseAlgorithm from "./BaseAlgorithm";
import MinPriorityQueue from "./MinPriorityQueue";



// This Dijkstra's algorithm implementation will explore all possible connections
// of a metro map. It is NOT OPTIMISED.
class Dijkstra extends BaseAlgorithm {
    constructor(mapGraph) {
        super(mapGraph);
        this.priorityQueue = new MinPriorityQueue();
    }

    enqueue(stationName, distance) {
        this.priorityQueue.enqueue(stationName, distance);
    }

    dequeue() {
        return this.priorityQueue.dequeue().element;
    }

    isEmpty() {
        return this.priorityQueue.isEmpty();
    }

    searchOptimalPath(startStationName, endStationName) {
        this.initializeDistances(startStationName);
        this.enqueue(startStationName, 0);
        
        while (!this.isEmpty()) {
            const stationName = this.dequeue();
    
            if (this.stationIsVisited(stationName)) continue;
            this.markStationAsVisited(stationName);
    
            const neighboursNames = this.mapGraph.getStationNeighbourNames(stationName);
            neighboursNames.forEach((neighbourName) => {
                const distance = this.mapGraph.getNeighbourDistance(stationName, neighbourName);
                if (distance !== Infinity) {
                    this.updateDistances(stationName, neighbourName, distance);
                    this.addEdgeToVisitedEdges(stationName, neighbourName);
                }
            });
        }
    
        const path = this.constructOptimalPath(this.previousStation, startStationName, endStationName);
        return {
            distance: this.distances[endStationName],
            path: path,
            visitedConnectionsOrder: this.visitedEdges,
        };
    }
    
    constructOptimalPath(previousStation, startStation, endStation) {
        const path = [];
        let currentStation = endStation;

        while (currentStation !== startStation && currentStation !== null) {
            path.unshift(currentStation);
            currentStation = previousStation[currentStation];
        }

        if (currentStation === startStation) {
            path.unshift(startStation);
        }
        
        return path;
    }
}


export default Dijkstra;