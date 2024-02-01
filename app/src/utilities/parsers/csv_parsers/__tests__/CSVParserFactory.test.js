import CSVParserFactory from "../CSVParserFactory";
import ConnectionsCSVParser from "../ConnectionCSVParser";
import RailwayCSVParser from "../RailwayCSVParser";
import StationsCSVParser from "../StationCSVParser";


describe('CSVParserFactory.js tests', () => {
    let filePath = "test.csv";
    let csvParserFactory;
    let type;

    beforeEach(() => {
        csvParserFactory = new CSVParserFactory();
    })

    it('createParser() with type "stations" should return StationsCSVParser instance', () => {
        type = 'stations'
        expect(csvParserFactory.createParser(type, filePath)).toBeInstanceOf(StationsCSVParser);
    });

    it('createParser() with type "connections" should return ConnectionsCSVParser instance', () => {
        type = 'connections'
        expect(csvParserFactory.createParser(type, filePath)).toBeInstanceOf(ConnectionsCSVParser);
    });

    it('createParser() with type "railways" should return RailwaysCSVParser instance', () => {
        type = 'railways'
        expect(csvParserFactory.createParser(type, filePath)).toBeInstanceOf(RailwayCSVParser);
    });

    it('createParser() should throw error for invalid parser type', () => {
        type = 'randomType'
        expect(() => csvParserFactory.createParser(type, filePath)).toThrow('Invalid parser type');
    })
});