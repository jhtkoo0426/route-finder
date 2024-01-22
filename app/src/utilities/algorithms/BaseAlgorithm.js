class BaseAlgorithm {
    constructor(stations) {
        this.stations = stations;
        this.distances = new Map();
        this.visited = new Map();
        this.previousStation = new Map();
        this.visitedConnections = [];
    }

    initializeDistances(startStation) {
        for (const [stationName] of Object.entries(this.stations)) {
            this.distances.set(stationName, Infinity);
            this.visited.set(stationName, false);
            this.previousStation.set(stationName, null);
        }
        this.distances.set(startStation, 0);
    }

    markStationAsVisited(stationName) {
        this.visited.set(stationName, true);
    }

    markConnectionAsVisited(startStation, endStation) {
        this.visitedConnections.push({ start: startStation, end: endStation });
    }

    updateDistances(currentStation, neighborName, neighborDistance) {
        const newDistance = this.distances.get(currentStation) + neighborDistance;

        if (newDistance < this.distances.get(neighborName)) {
            this.distances.set(neighborName, newDistance);
            this.previousStation.set(neighborName, currentStation);
            this.enqueue(neighborName, newDistance);
        }
    }

    runAlgorithm(startStation, endStation) {
        const startTime = performance.now();
        const result = this.searchPath(startStation, endStation);
        const endTime = performance.now();
        result['duration'] = endTime - startTime;
        return result;
    }

    // Abstract methods to be implemented by subclasses
    enqueue(stationName, distance) {
        throw new Error("enqueue method must be implemented by subclasses, returning a boolean value");
    }

    dequeue() {
        throw new Error("dequeue method must be implemented by subclasses, returning a boolean value");
    }

    isEmpty() {
        throw new Error("isEmpty method must be implemented by subclasses, returning a boolean value");
    }

    searchPath(startStation, endStation) {
        throw new Error("searchPath method must be implemented by subclasses, returning a boolean value");
    }

    constructPath(previousStation, startStation, endStation) {
        throw new Error("constructPath method must be implemented by subclasses, returning a boolean value");
    }
}


export default BaseAlgorithm;