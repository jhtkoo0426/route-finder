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

    getRailwayLineColourMap() {
        return this.railwayLines;
    }

    // Visualization methods
    // Visualize stations and connections
    visualizeMetroMap(mapInstance) {
        mapInstance.loadRailwayLines(this.railwayLines);
        mapInstance.loadStations(this.stations);
        mapInstance.loadConnections(this.connections);
    }

    // Path-finding methods
    executeAlgorithms(startStationName, endStationName) {
        const dijkstra = new Dijkstra(this.stations);
        const algorithmResults = {
            "Dijkstra": dijkstra.runAlgorithm(startStationName, endStationName)
        }
        return algorithmResults;
    }
    
    // Returns an optimised path with minimum transits.
    generateTravelSegments(path) {
        if (!path || path.length === 0) return null;
    
        const segments = [];
        let [start, line, stops] = [null, null, 0];    
        for (let i = 0; i < path.length - 1; i++) {
            const current = path[i];
            const next = path[i + 1];
            const connection = this.connections[`${current}-${next}`] || this.connections[`${next}-${current}`];
            const lines = Array.from(connection.metroLines);
    
            if (!start) [start, line] = [current, lines[0]];
            if (!lines.includes(line)) {
                segments.push({ start, line, stops });
                [start, line, stops] = [current, lines[0], 1];
            } else {
                stops++;
            }
        }
        segments.push({ start, line, stops });
        segments.push({ start: path[path.length-1], line: null, stops: 0 });
        return segments;
    }  
}


export default MetroMapBackend;