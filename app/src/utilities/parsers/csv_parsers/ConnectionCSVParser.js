import Connection from "../../map_assets/Connection";
import MapGraph from "../../map_assets/MapGraph";
import StationGeoUtils from "../../services/geographic_services/StationGeographicUtilities";
import CSVParser from "./BaseCSVParser";



// A CSV parser for connections.csv. This parser expects the CSV file to consist of
// all possible connections between stations in the required metro network.
// Connection information is expected to be arranged as follows:
// Column 1: Metro line name
// Column 2: Start station name
// Column 3: End station name
class ConnectionCSVParser extends CSVParser {
    // @params {Array} stations
    // @returns {Array} parseResult
    async parse(stations) {
        const csvData = await super.parse();

        let connections = new Map();
        let mapGraph = new MapGraph();

        csvData.forEach(row => {
            this.parseConnection(row, stations, connections, mapGraph);
        });

        console.log("All connections parsed.");
        const parseResult = [stations, connections, mapGraph];
        return parseResult;
    }

    // @params {string} row
    // @params {Map} stations
    // @params {Map} connections
    // @params {MapGraph} mapGraph
    parseConnection(row, stations, connections, mapGraph) {
        const [metroLineName, startStationName, endStationName] = row.split(",");
        const startStationObj = stations[startStationName];
        const endStationObj = stations[endStationName];

        if (startStationObj && endStationObj) {
            const [firstStation, secondStation] = this.sortStationsByName(startStationObj, endStationObj);
            const connectionKey = this.getConnectionKey(firstStation, secondStation);
            this.createOrUpdateConnection(connections, connectionKey, metroLineName, firstStation, secondStation);
            this.calculateAndAddDistance(mapGraph, startStationName, endStationName, startStationObj, endStationObj);
        }
    }

    // Auxiliary methods
    // @params {Station} stationAObj
    // @params {Station} stationBObj
    // @returns {Array}
    sortStationsByName(stationAObj, stationBObj) {
        return [stationAObj, stationBObj].sort((a, b) => a.name.localeCompare(b.name));
    }

    // @params {Station} stationAObj
    // @params {Station} stationBObj
    // @returns {string}
    getConnectionKey(stationAObj, stationBObj) {
        return `${stationAObj.name}-${stationBObj.name}`;
    }

    // @params {Map} connections
    // @params {string} connectionKey
    // @params {string} metroLineName
    // @params {Station} firstStation
    // @params {Station} secondStation
    createOrUpdateConnection(connections, connectionKey, metroLineName, firstStation, secondStation) {
        connections[connectionKey] = connections[connectionKey] || new Connection(firstStation, secondStation);
        connections[connectionKey].addMetroLine(metroLineName);
    }

    // @params {MapGraph} mapGraph
    // @params {string} startStationName
    // @params {string} endStationName
    // @params {Station} startStationObj
    // @params {Station} endStationObj
    calculateAndAddDistance(mapGraph, startStationName, endStationName, startStationObj, endStationObj) {
        const distance = StationGeoUtils.calculateDistance(startStationObj, endStationObj);
        mapGraph.addNeighbourToStation(startStationName, endStationName, distance);
    }
}


export default ConnectionCSVParser;