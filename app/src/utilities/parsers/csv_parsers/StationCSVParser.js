import CSVParser from "../BaseCSVParser";
import Station from "../../map_assets/Station";


// A CSV parser for station.csv. This parser expects the CSV file to consist of
// basic information about each unique station in the required metro network.
// Station information is expected to be arranged as follows:
// Column 1: Station name
// Column 2: Latitude coordinates
// Column 3: Longitude coordinates
class StationsCSVParser extends CSVParser {
    async parse(stations) {
        // @params stations (hashmap): Stores all Station objects that are previously
        // initialized by a StationsCSVParser instance, with the station name as the 
        // keys, and Station objects as the values.

        const csvData = await super.parse();    // The base parse method splits rows by the \n symbol.

        csvData.forEach(row => {
            const [stationName, latitude, longitude] = row.split(",");
            stations[stationName] = new Station(stationName, latitude, longitude);
        });
      
        console.log("All " + Object.entries(stations).length + " stations parsed.");
        return stations;
    }
}


export default StationsCSVParser;