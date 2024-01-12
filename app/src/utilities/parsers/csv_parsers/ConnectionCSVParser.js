import Connection from "../../map_assets/Connection";
import CSVParser from "../BaseCSVParser";

class ConnectionsCSVParser extends CSVParser {
    async parse(stations) {
        const csvData = await super.parse();

        let connections = new Map();

        csvData.forEach(row => {
            const [metroLineName, startStationName, endStationName] = row.split(",");
            const startStationObj = stations[startStationName];
            const endStationObj = stations[endStationName];

            if (startStationObj && endStationObj) {
                const [firstStation, secondStation] = [startStationObj, endStationObj].sort((a, b) => a.name.localeCompare(b.name));

                const connectionKey = `${firstStation.name}-${secondStation.name}`;

                connections[connectionKey] = connections[connectionKey] || this.createConnection(firstStation, secondStation);
                connections[connectionKey].addMetroLine(metroLineName);

                // Update the neighbors for both stations.
                firstStation.addNeighbour(secondStation, metroLineName);
                secondStation.addNeighbour(firstStation, metroLineName);
            }
        });

        console.log("All connections parsed.");
        return [stations, connections];
    }

    createConnection(stationA, stationB) {
        return new Connection(stationA, stationB);
    }
}


export default ConnectionsCSVParser;