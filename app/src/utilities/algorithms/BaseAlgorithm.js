// A base class for implementing pathfinding algorithms.
class BaseAlgorithm {
    constructor(mapGraph, endStationName) {
        this.mapGraph = mapGraph;
        this.endStationName = endStationName;
        this.distances = new Map();         // Stores the minimum distance between two stations discovered so far.
        this.visitedStations = new Map();   // Keeps track of visited stations during exploration.
        this.previousStation = new Map();   // Stores stations in the optimal path from the starting station to each station.
        this.visitedEdges = [];             // Keeps track of the order of visiting edges between stations.
    }

    // @params {String} startStationName
    initializeDistances(startStationName) {
        this.mapGraph.getStationNames().forEach(stationName => {
            this.distances[stationName] = Infinity;
            this.visitedStations[stationName] = false;
            this.previousStation[stationName] = null;
        });
        this.distances[startStationName] = 0;
    }

    // @params {String} stationName
    // @returns {Boolean}
    stationIsVisited(stationName) {
        return this.visitedStations[stationName] === true;
    }

    // @params {String} stationName
    markStationAsVisited(stationName) {
        this.visitedStations[stationName] = true;
    }
    
    // @params {String} startStationName
    // @params {String} endStationName
    addEdgeToVisitedEdges(startStationName, endStationName) {
        this.visitedEdges.push({ start: startStationName, end: endStationName });
    }

    // @params {String} currentStationName
    // @params {String} neighbourName
    // @params {float} neighbourDistance
    updateDistances(currentStationName, neighbourName, neighbourDistance) {
        const newDistance = this.distances[currentStationName] + neighbourDistance;

        if (newDistance < this.distances[neighbourName]) {
            this.distances[neighbourName] = newDistance;
            this.previousStation[neighbourName] = currentStationName;
            this.enqueue(neighbourName, newDistance);
        }
    }

    // Executes the algorithm from the starting to ending station.
    // @params {String} startStationName
    // @params {String} endStationName
    // @returns {Map} result
    runAlgorithm(startStationName, endStationName) {
        const startTime = performance.now();
        const result = this.searchOptimalPath(startStationName, endStationName);
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
    
    searchOptimalPath(startStationName, endStationName) {
        throw new Error("searchOptimalPath method must be implemented by subclasses, returning a boolean value");
    }
    
    constructOptimalPath(previousStation, startStation, endStation) {
        throw new Error("constructOptimalPath method must be implemented by subclasses, returning a boolean value");
    }
}


export default BaseAlgorithm;