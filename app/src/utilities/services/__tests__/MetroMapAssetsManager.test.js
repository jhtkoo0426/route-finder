import MetroMapAssetsManager from "../MetroMapAssetsManager";
import CSVParserFactory from "../../parsers/csv_parsers/CSVParserFactory";
import { SVG_CONNECTION_OPACITY_UNVISITED } from "../../Constants";

jest.mock("../../parsers/csv_parsers/CSVParserFactory");


describe('MetroMapAssetsManager.js tests', () => {
    let manager;

    beforeEach(() => {
        const connectionsFilePath = 'test1.csv';
        const stationsFilePath = 'test2.csv';
        const railwaysFilePath = 'test3.csv';

        // Create an instance of MetroMapAssetsManager
        manager = new MetroMapAssetsManager(connectionsFilePath, stationsFilePath, railwaysFilePath);
    });

    test('should initialize all attributes correctly', () => {
        expect(manager).toBeInstanceOf(MetroMapAssetsManager);
        expect(manager.connectionsFilePath).toBe('test1.csv');
        expect(manager.stationsFilePath).toBe('test2.csv');
        expect(manager.railwaysFilePath).toBe('test3.csv');

        expect(manager.connections).toBeInstanceOf(Map);
        expect(manager.connections.size).toBe(0);
        expect(manager.stations).toBeInstanceOf(Map);
        expect(manager.stations.size).toBe(0);
        expect(manager.railwayLinesColourMap).toBeInstanceOf(Map);
        expect(manager.railwayLinesColourMap.size).toBe(0);
    });

    test('parseCSVFiles() should invoke the correct methods on CSV parsers', async () => {
        // We can assume the CSVParserFactory is correct
        const mockParserFactory = new CSVParserFactory();
        CSVParserFactory.mockImplementation(() => mockParserFactory);

        const mockRailwaysCSVParser = { parse: jest.fn() };
        const mockStationsCSVParser = { parse: jest.fn() };
        const mockConnectionsCSVParser = { parse: jest.fn() };

        mockParserFactory.createParser
            .mockReturnValueOnce(mockRailwaysCSVParser)
            .mockReturnValueOnce(mockStationsCSVParser)
            .mockReturnValueOnce(mockConnectionsCSVParser);

        // Mock data
        const mockRailwayLinesColourMap = { /* mock data */ };
        const mockStationsData = { /* mock data */ };
        const mockConnectionsData = { /* mock data */ };
        const mockMapGraph = { /* mock data */ };

        mockRailwaysCSVParser.parse.mockResolvedValueOnce(mockRailwayLinesColourMap);
        mockStationsCSVParser.parse.mockResolvedValueOnce(mockStationsData);
        mockConnectionsCSVParser.parse.mockResolvedValueOnce([mockStationsData, mockConnectionsData, mockMapGraph]);

        await manager.parseCSVFiles();

        expect(manager.railwayLinesColourMap).toEqual(mockRailwayLinesColourMap);
        expect(manager.stations).toEqual(mockStationsData);
        expect(manager.connections).toEqual(mockConnectionsData);
        expect(manager.mapGraph).toEqual(mockMapGraph);
    });
    
    test('getStationNames() should return array of correct length', () => {
        const result = manager.getStationNames();
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBe(0);
    });

    test('getStationObjects() should return map of Station objects', () => {
        const result = manager.getStationObjects();
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(0);
    });

    test('resetConnectionsOpacities() should reset opacities for all connections', () => {
        manager.connections = {
            connection1: { state: { opacity: 0.5 } },
            connection2: { state: { opacity: 0.7 } },
        };
        manager.resetConnectionsOpacities();

        // Assert
        Object.values(manager.connections).forEach((connection) => {
            expect(connection.state.opacity).toBe(SVG_CONNECTION_OPACITY_UNVISITED);
        });
    });
})