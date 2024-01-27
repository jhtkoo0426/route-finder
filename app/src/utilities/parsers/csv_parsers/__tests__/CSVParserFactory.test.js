import CSVParserFactory from "../CSVParserFactory";
import ConnectionsCSVParser from "../ConnectionCSVParser";
import RailwaysCSVParser from "../RailwaysCSVParser";
import StationsCSVParser from "../StationCSVParser";


describe('CSVParserFactory.js tests', () => {
    let filePath = "test.csv";
    let csvParserFactory;
    let type;

    beforeEach(() => {
        csvParserFactory = new CSVParserFactory();
    })

    test('createParser() with type "stations" should return StationsCSVParser instance', () => {
        type = 'stations'
        expect(csvParserFactory.createParser(type, filePath)).toBeInstanceOf(StationsCSVParser);
    });

    test('createParser() with type "connections" should return ConnectionsCSVParser instance', () => {
        type = 'connections'
        expect(csvParserFactory.createParser(type, filePath)).toBeInstanceOf(ConnectionsCSVParser);
    });

    test('createParser() with type "railways" should return RailwaysCSVParser instance', () => {
        type = 'railways'
        expect(csvParserFactory.createParser(type, filePath)).toBeInstanceOf(RailwaysCSVParser);
    });

    test('createParser() should throw error for invalid parser type', () => {
        type = 'randomType'
        expect(() => csvParserFactory.createParser(type, filePath)).toThrow('Invalid parser type');
    })
});