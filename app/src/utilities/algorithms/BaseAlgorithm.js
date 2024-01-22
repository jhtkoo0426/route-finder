// A base class for implementing pathfinding algorithms.
class BaseAlgorithm {
    constructor(stations) {
        this.stations = stations;
        this.distances = new Map();
        this.visited = new Map();
        this.previousStation = new Map();
        this.visitedConnections = [];
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
    
    markConnectionAsVisited(startStation, endStation) {
        this.visitedConnections.push({ start: startStation, end: endStation });
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
        throw new Error("enqueue method must be implemented by subclasses, returning a boolean value");
    }
    
    dequeue() {
        throw new Error("dequeue method must be implemented by subclasses, returning a boolean value");
    }
    
    isEmpty() {
        throw new Error("isEmpty method must be implemented by subclasses, returning a boolean value");
    }
    
    searchPath(startStationName, endStationName) {
        throw new Error("searchPath method must be implemented by subclasses, returning a boolean value");
    }
    
    constructPath(previousStation, startStation, endStation) {
        throw new Error("constructPath method must be implemented by subclasses, returning a boolean value");
    }

    runAlgorithm(startStationName, endStationName) {
        const startTime = performance.now();
        const result = this.searchPath(startStationName, endStationName);
        const endTime = performance.now();
        result['duration'] = endTime - startTime;
        return result;
    }
}


export default BaseAlgorithm;