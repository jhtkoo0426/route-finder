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
    executeAlgorithms(startStationName, endStationName) {
        const dijkstra = new Dijkstra(this.stations);
        const algorithmResults = {
            "Dijkstra": dijkstra.runAlgorithm(startStationName, endStationName)
        }
        return algorithmResults;
    }

    // Utility methods
    getStationNames() {
        return Object.keys(this.stations);
    }

    getStationObjects() {
        return this.stations;
    }

    getConnections() {
        return this.connections;
    }

    getMetroLineColours() {
        return this.railwayLines;
    }
}


export default MetroMapBackend;