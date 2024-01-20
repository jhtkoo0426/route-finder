import CSVParser from "./BaseCSVParser";



// A CSV parser for railways.csv. This parser expects the CSV file to consist of
// basic information about each unique station in the required metro network.
// Station information is expected to be arranged as follows:
// Column 1: Station name
// Column 2: Latitude coordinates
// Column 3: Longitude coordinates
class RailwaysCSVParser extends CSVParser {
    async parse() {
        let railwayLines = new Map();
        const csvData = await super.parse();    // The base parse method splits rows by the \n symbol.

        csvData.forEach(row => {
            const [metroLineName, colour] = row.split(",");
            railwayLines[metroLineName] = colour;
        })
        console.log("All railways parsed.");
        return railwayLines;
    }
}


export default RailwaysCSVParser;