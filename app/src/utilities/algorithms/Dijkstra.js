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

    searchPath(startStationName, endStationName) {
        this.initializeDistances(startStationName);
        this.enqueue(startStationName, 0);
        
        while (!this.isEmpty()) {
            const currentStationName = this.dequeue();
    
            if (this.visited[currentStationName]) continue;
            this.markStationAsVisited(currentStationName);
    
            const neighboursNames = this.mapGraph.getStationNeighbourNames(currentStationName);
            neighboursNames.forEach((neighbourName) => {
                const distance = this.mapGraph.getNeighbourDistance(currentStationName, neighbourName);
                if (distance !== Infinity) { // Ensure you handle infinite distances properly
                    this.updateDistances(currentStationName, neighbourName, distance);
                    this.markConnectionAsVisited(currentStationName, neighbourName);
                }
            });
        }
    
        const path = this.constructPath(this.previousStation, startStationName, endStationName);
        return {
            distance: this.distances[endStationName],
            path: path,
            visitedConnectionsOrder: this.visitedConnections,
        };
    }
    

    constructPath(previousStation, startStation, endStation) {
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