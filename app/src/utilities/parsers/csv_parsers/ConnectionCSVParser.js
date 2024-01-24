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
class ConnectionsCSVParser extends CSVParser {
    async parse(stations) {
        const csvData = await super.parse();

        let connections = new Map();
        let mapGraph = new MapGraph();

        csvData.forEach(row => {
            const [metroLineName, startStationName, endStationName] = row.split(",");
            const startStationObj = stations[startStationName];
            const endStationObj = stations[endStationName];

            if (startStationObj && endStationObj) {
                const [firstStation, secondStation] = [startStationObj, endStationObj].sort((a, b) => a.name.localeCompare(b.name));
                const connectionKey = `${firstStation.name}-${secondStation.name}`;

                connections[connectionKey] = connections[connectionKey] || new Connection(firstStation, secondStation);
                connections[connectionKey].addMetroLine(metroLineName);

                // Update the neighbors for both stations.
                firstStation.addAdjacentNeighbour(secondStation, metroLineName);
                secondStation.addAdjacentNeighbour(firstStation, metroLineName);

                const distance = StationGeoUtils.calculateDistance(startStationObj, endStationObj);
                mapGraph.addNeighbourToStation(startStationName, endStationName, distance);
            }
        });

        console.log("All connections parsed.");
        return [stations, connections, mapGraph];
    }
}


export default ConnectionsCSVParser;