import MinPriorityQueue from "./MinPriorityQueue";

import ConnectionsCSVParser from "./parsers/csv_parsers/ConnectionCSVParser";
import RailwaysCSVParser from "./parsers/csv_parsers/RailwaysCSVParser";
import StationsCSVParser from "./parsers/csv_parsers/StationCSVParser";



// This class manages business logic, including Station instances and supports 
// stations querying.
class MetroMapBackend {
    constructor(connectionsFilePath, stationsFilePath, railwaysFilePath) {
        this.connectionsFilePath = connectionsFilePath;
        this.stationsFilePath = stationsFilePath;
        this.railwaysFilePath = railwaysFilePath;
        this.mapInstance = null;
        this.stations = {};
        this.railwayLines = {};
    }

    // Parse all resource files to load assets for visualization.
    async parseCSVFiles() {
        const stationsCSVParser     = new StationsCSVParser(this.stationsFilePath);
        const connectionsCSVParser  = new ConnectionsCSVParser(this.connectionsFilePath);
        const railwaysCSVParser     = new RailwaysCSVParser(this.railwaysFilePath);
        
        this.stations = await stationsCSVParser.parse(this.stations);
        this.stations = await connectionsCSVParser.parse(this.stations);
        this.railwayLines = await railwaysCSVParser.parse(this.railwayLines);
    }

    // Visualise stations and connections
    visualizeMetroMap(mapInstance) {
        mapInstance.loadStations(this.stations);
        mapInstance.loadRailwayLines(this.railwayLines);
    }

    // Choose searching algorithms
    searchPath(startStationName, endStationName) {
        const stations = this.stations;
        const distances = {};
        const visited = {};
        const previousStation = {};
        const priorityQueue = new MinPriorityQueue();

        // Initialize distances
        Object.keys(stations).forEach(stationName => {
            distances[stationName] = Infinity;
            visited[stationName] = false;
            previousStation[stationName] = null;
        });
        distances[startStationName] = 0;

        // Enqueue the starting station
        priorityQueue.enqueue(startStationName, 0);

        while (!priorityQueue.isEmpty()) {
            // Dequeue a station
            const currentStation = priorityQueue.dequeue().element;

            if (visited[currentStation]) continue;

            // Mark current station as visited
            visited[currentStation] = true;

            // Check neighbors and update distances
            const neighbors = stations[currentStation].neighbours;
            Object.keys(neighbors).forEach(neighborName => {
                const neighborDistance = neighbors[neighborName].distance;
                const newDistance = distances[currentStation] + neighborDistance;

                if (newDistance < distances[neighborName]) {
                    distances[neighborName] = newDistance;
                    previousStation[neighborName] = currentStation;
                    // Enqueue the neighbor with updated distance
                    priorityQueue.enqueue(neighborName, newDistance);
                }
            });
        }

        // Construct the path
        const path = this.constructPath(previousStation, startStationName, endStationName);

        return { distance: distances[endStationName], path };
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

    // Utility methods
    getStationNames() {
        return Object.keys(this.stations);
    }
}

export default MetroMapBackend;