import MinPriorityQueue from "./MinPriorityQueue";

import ConnectionsCSVParser from "./parsers/csv_parsers/ConnectionCSVParser";
import RailwaysCSVParser from "./parsers/csv_parsers/RailwaysCSVParser";
import StationsCSVParser from "./parsers/csv_parsers/StationCSVParser";

import Dijkstra from "./algorithms/Dijkstra";



// This class handles business logic, including Station instances and supports 
// stations querying.
class MetroMapBackend {
    constructor(connectionsFilePath, stationsFilePath, railwaysFilePath) {
        this.connectionsFilePath = connectionsFilePath;
        this.stationsFilePath = stationsFilePath;
        this.railwaysFilePath = railwaysFilePath;
        this.mapInstance = null;
        this.stations = new Map();
        this.railwayLines = new Map();
        this.connections = [];
    }

    // Parse all resource files to load assets for visualization.
    async parseCSVFiles() {
        const railwaysCSVParser     = new RailwaysCSVParser(this.railwaysFilePath);
        this.railwayLines = await railwaysCSVParser.parse(this.railwayLines);

        const stationsCSVParser     = new StationsCSVParser(this.stationsFilePath);
        this.stations = await stationsCSVParser.parse(this.stations);

        const connectionsCSVParser  = new ConnectionsCSVParser(this.connectionsFilePath);
        [this.stations, this.connections] = await connectionsCSVParser.parse(this.stations);
    }

    // Visualise stations and connections
    visualizeMetroMap(mapInstance) {
        mapInstance.loadRailwayLines(this.railwayLines);
        mapInstance.loadStations(this.stations);
        mapInstance.loadConnections(this.connections);
    }

    // Choose searching algorithms
    findPath(startStationName, endStationName, algorithmOption) {
        if (algorithmOption.value === 'Dijkstra') {
            console.log(algorithmOption);
            this.algorithm = new Dijkstra(this.stations);
        }
        return this.algorithm.searchPath(startStationName, endStationName);
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