import StationsCSVParser from "./StationCSVParser";
import ConnectionCSVParser from "./ConnectionCSVParser";
import RailwayCSVParser from "./RailwayCSVParser";



// A factory that creates different CSV parsers based on the type of data to
// be parsed. Each specific parser handles the details of parsing that particular
// type of data. This encapsulates the object creation logic into the factory, so
// the application code doesn't need to worry about which parser to instantiate.
class CSVParserFactory {
    // @params {string} type
    // @params {string} filePath
    // @returns {BaseCSVParser}
    createParser(type, filePath) {
        switch (type) {
            case 'stations':
                return new StationsCSVParser(filePath);
            case 'connections':
                return new ConnectionCSVParser(filePath);
            case 'railways':
                return new RailwayCSVParser(filePath);
            default:
                throw new Error('Invalid parser type');
        }
    }
}


export default CSVParserFactory;