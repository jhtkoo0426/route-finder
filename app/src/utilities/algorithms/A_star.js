// Import necessary dependencies
import BaseAlgorithm from "./BaseAlgorithm";
import MinPriorityQueue from "./MinPriorityQueue";

// A* algorithm implementation
class AStar extends BaseAlgorithm {
    constructor(mapGraph, endStationName) {
        super(mapGraph, endStationName);
        this.priorityQueue = new MinPriorityQueue();
        this.heuristic = new Map();  // Stores the heuristic value for each station.
    }

    // Override the enqueue method to include the heuristic value.
    enqueue(stationName, distance) {
        const totalDistance = distance + this.heuristic[stationName];
        this.priorityQueue.enqueue(stationName, totalDistance);
    }

    // Override the dequeue method to get the station with the minimum total cost.
    dequeue() {
        return this.priorityQueue.dequeue().element;
    }

    // Override the isEmpty method to check if the priority queue is empty.
    isEmpty() {
        return this.priorityQueue.isEmpty();
    }

    // Override the searchOptimalPath method to incorporate the A* algorithm logic.
    searchOptimalPath(startStationName, endStationName) {
        this.initializeDistances(startStationName);
        this.heuristic[endStationName] = 0;  // Set heuristic value for the end station.
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
                    this.heuristic[neighbourName] = this.calculateHeuristic(neighbourName, endStationName);
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

    // Calculate the heuristic value (estimated cost) from a station to the goal station.
    calculateHeuristic(stationName, goalStationName) {
        return Math.min(
            this.mapGraph.getNeighbourDistance(stationName, goalStationName),
            this.mapGraph.getNeighbourDistance(goalStationName, stationName)
        );
    }

    // Override the constructOptimalPath method to build the path specific to A* algorithm.
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


export default AStar;