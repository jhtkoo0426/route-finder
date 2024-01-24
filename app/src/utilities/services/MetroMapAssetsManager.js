import CSVParserFactory from "../parsers/csv_parsers/CSVParserFactory";
import { SVG_CONNECTION_OPACITY_UNVISITED } from "../Constants";



// Manages instances of all metro map assets (stations, connections & railway lines).
class MetroMapAssetsManager {
    constructor(connectionsFilePath, stationsFilePath, railwaysFilePath) {
        this.connectionsFilePath = connectionsFilePath;
        this.stationsFilePath = stationsFilePath;
        this.railwaysFilePath = railwaysFilePath;

        this.connections = new Map();
        this.stations = new Map();
        this.railwayLinesColourMap = new Map();
        this.mapGraph = null;
    }

    // Parse all resource files to load assets for visualization.
    async parseCSVFiles() {
        const csvParserFactory = new CSVParserFactory();
        const railwaysCSVParser = csvParserFactory.createParser('railways', this.railwaysFilePath);
        const stationsCSVParser = csvParserFactory.createParser('stations', this.stationsFilePath);
        const connectionsCSVParser = csvParserFactory.createParser('connections', this.connectionsFilePath);
        
        this.railwayLinesColourMap = await railwaysCSVParser.parse();
        this.stations = await stationsCSVParser.parse();
        [this.stations, this.connections, this.mapGraph] = await connectionsCSVParser.parse(this.stations);
    }

    getStationNames() {
        return Object.keys(this.stations);
    }

    getStationObjects() {
        return this.stations;
    }
    
    // Resets the opacity of Connection objects
    resetConnectionsOpacities() {
        Object.keys(this.connections).forEach((key) => {
            this.connections[key].state.opacity = SVG_CONNECTION_OPACITY_UNVISITED;
        })
    }
}


export default MetroMapAssetsManager;