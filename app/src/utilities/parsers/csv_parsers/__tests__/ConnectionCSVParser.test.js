import ConnectionCSVParser from "../ConnectionCSVParser";
import Station from "../../../map_assets/Station";
import MapGraph from "../../../map_assets/MapGraph";
import Connection from "../../../map_assets/Connection";


describe('ConnectionCSVParser.js tests', () => {
    const filePath = 'test.csv';
    let csvParser;
    let stations;
    let stationA;
    let stationB;

    beforeEach(() => {
        stationA = new Station('stationA', 51.01942, 0.23587);
        stationB = new Station('stationB', 50.98252, -0.59123);
    })

    it('should parse dummy CSV file correctly', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('railway1,stationA,stationB\nrailway2,stationA,stationB'),
            })
        );

        csvParser = new ConnectionCSVParser(filePath);
        stations = [stationA, stationB];

        const result = await csvParser.parse(stations);

        expect(global.fetch).toHaveBeenCalledWith(filePath);
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(Array);
        expect(result[1]).toBeInstanceOf(Map);
        expect(result[2]).toBeInstanceOf(MapGraph);
    });

    it('parseConnection() should add metro lines correctly', () => {
        const parser = new ConnectionCSVParser();
        const existingConnection = new Connection(stationA, stationB);
        const connections = { 'stationA-stationB': existingConnection };
        const connectionKey = 'stationA-stationB';
        const firstStation = { name: 'stationA' };
        const secondStation = { name: 'stationB' };

        parser.createOrUpdateConnection(connections, connectionKey, 'railway1', firstStation, secondStation);

        expect(connections[connectionKey]).toBe(existingConnection);
        const connectedMetroLines = Array.from(connections[connectionKey].connectedMetroLines);
        expect(connectedMetroLines[0]).toEqual('railway1');
    });

    it('parseConnection() should add multiple metro lines correctly', () => {
        const parser = new ConnectionCSVParser();
        const existingConnection = new Connection(stationA, stationB);
        const connections = { 'stationA-stationB': existingConnection };
        const connectionKey = 'stationA-stationB';
        const firstStation = { name: 'stationA' };
        const secondStation = { name: 'stationB' };

        parser.createOrUpdateConnection(connections, connectionKey, 'railway1', firstStation, secondStation);
        let connectedMetroLines = Array.from(connections[connectionKey].connectedMetroLines);
        expect(connectedMetroLines.length).toBe(1);
        expect(connectedMetroLines[0]).toEqual('railway1');
        
        parser.createOrUpdateConnection(connections, connectionKey, 'railway2', firstStation, secondStation);
        connectedMetroLines = Array.from(connections[connectionKey].connectedMetroLines);
        expect(connectedMetroLines.length).toBe(2);
        expect(connectedMetroLines[0]).toEqual('railway1');
        expect(connectedMetroLines[1]).toEqual('railway2');
        expect(connections[connectionKey]).toBe(existingConnection);
    });

    it('should create connection and calculate distance when both start and end stations exist', () => {
        const parser = new ConnectionCSVParser();
        const stations = {
          'StationA': { name: 'StationA' },
          'StationB': { name: 'StationB' },
        };
        const connections = {};
        const mapGraph = new MapGraph();
  
        const row = 'MetroLine1,StationA,StationB';
        parser.parseConnection(row, stations, connections, mapGraph);
        const connectionKey = parser.getConnectionKey(stations['StationA'], stations['StationB']);
        expect(connections[connectionKey]).toBeInstanceOf(Connection);
      });

    it('sortStationsByName() should sort station names correctly', () => {
        const result = csvParser.sortStationsByName(stationB, stationA);
        expect(result).toBeInstanceOf(Array);
        expect(result[0].name).toBe("stationA");
        expect(result[1].name).toBe("stationB");
    });

    it('getConnectionKey() should return correct string representation of key', () => {
        const result = csvParser.getConnectionKey(stationA, stationB);
        expect(result).toBe("stationA-stationB");
    })
});