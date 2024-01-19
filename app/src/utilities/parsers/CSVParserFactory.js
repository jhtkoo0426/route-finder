import StationsCSVParser from "./csv_parsers/StationCSVParser";
import ConnectionsCSVParser from "./csv_parsers/ConnectionCSVParser";
import RailwaysCSVParser from "./csv_parsers/RailwaysCSVParser";



// A factory that creates different CSV parsers based on the type of data to
// be parsed. Each specific parser handles the details of parsing that particular
// type of data. This encapsulates the object creation logic into the factory, so
// the application code doesn't need to worry about which parser to instantiate.
class CSVParserFactory {
    createParser(type, filePath) {
        switch (type) {
            case 'stations':
                return new StationsCSVParser(filePath);
            case 'connections':
                return new ConnectionsCSVParser(filePath);
            case 'railways':
                return new RailwaysCSVParser(filePath);
            default:
                throw new Error('Invalid parser type');
        }
    }
}


export default CSVParserFactory;