import Connection from "../../map_assets/Connection";
import CSVParser from "../BaseCSVParser";



// A CSV parser for connections.csv. This parser expects the CSV file to consist
// of basic information about each railway connection in the required metro network.
// Railway connection information is expected to be arranged as follows:
// Column 1: Metro line name
// Column 2: Start station name
// Column 3: End station name
class ConnectionsCSVParser extends CSVParser {
    async parse(stations) {
        // @params stations (hashmap): Stores all Station objects that are previously
        // initialized by a StationsCSVParser instance, with the station name as the 
        // keys, and Station objects as the values.

        const csvData = await super.parse();    // The base parse method splits rows by the \n symbol.

        var connections = [];
        csvData.forEach(row => {
            const [metroLineName, startStationName, endStationName] = row.split(",");
           
            // Each initialized Station object contains a neighbours variable, which is
            // a hashmap representing an adjacency list.
            var startStationObj = stations[startStationName];
            var endStationObj = stations[endStationName];
            
            if (startStationObj !== undefined && endStationObj !== undefined) { 
                // Add neighbours to adjacenct neighbours of both stations
                startStationObj.addNeighbour(endStationObj, metroLineName);
                endStationObj.addNeighbour(startStationObj, metroLineName);
                // Add station pair to unique connections.
                var connection = new Connection(startStationObj, endStationObj, metroLineName);
                connections.push(connection);
            }
        })

        // For every Connection, check if any other Connection object share the same
        // start and end station. This will help prevent any rendered Connection 
        // objects from overlapping.
        for (let i = 0; i < connections.length; i++) {
            connections[i].findNeighbours(connections);
        }

        console.log("All connections parsed.");
        return [stations, connections];
    }
}


export default ConnectionsCSVParser