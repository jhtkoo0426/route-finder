import BaseAlgorithm from "./BaseAlgorithm";
import MinPriorityQueue from "../MinPriorityQueue";



// This Dijkstra's algorithm implementation will explore all possible connections
// of a metro map. It is NOT OPTIMISED.
class Dijkstra extends BaseAlgorithm {
    constructor(stations) {
        super(stations);
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
            const currentStation = this.dequeue();

            if (this.visited[currentStation]) continue;

            this.markStationAsVisited(currentStation);

            const neighbors = this.stations[currentStation].neighbours;
            Object.keys(neighbors).forEach(neighborName => {
                this.updateDistances(currentStation, neighborName, neighbors[neighborName].distance);
                this.markConnectionAsVisited(currentStation, neighborName);
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