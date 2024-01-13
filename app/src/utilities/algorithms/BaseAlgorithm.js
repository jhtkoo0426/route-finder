class BaseAlgorithm {
    constructor(stations) {
        this.stations = stations;
        this.distances = new Map();
        this.visited = new Map();
        this.previousStation = new Map();
    }

    initializeDistances(startStationName) {
        Object.keys(this.stations).forEach(stationName => {
            this.distances[stationName] = Infinity;
            this.visited[stationName] = false;
            this.previousStation[stationName] = null;
        });
        this.distances[startStationName] = 0;
    }

    markStationAsVisited(stationName) {
        this.visited[stationName] = true;
    }

    updateDistances(currentStation, neighborName, neighborDistance) {
        const newDistance = this.distances[currentStation] + neighborDistance;

        if (newDistance < this.distances[neighborName]) {
            this.distances[neighborName] = newDistance;
            this.previousStation[neighborName] = currentStation;
            this.enqueue(neighborName, newDistance);
        }
    }

    // Abstract methods to be implemented by subclasses
    enqueue(stationName, distance) {
        throw new Error("enqueue method must be implemented by subclasses");
    }

    dequeue() {
        throw new Error("dequeue method must be implemented by subclasses");
    }

    isEmpty() {
        throw new Error("isEmpty method must be implemented by subclasses");
    }

    searchPath(startStationName, endStationName) {
        throw new Error("isEmpty method must be implemented by subclasses");
    }

    constructPath(previousStation, startStation, endStation) {
        throw new Error("isEmpty method must be implemented by subclasses");
    }
}


export default BaseAlgorithm;