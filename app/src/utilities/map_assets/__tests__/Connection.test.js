import Connection from '../Connection';
import Station from '../Station';


describe('Connection.js tests', () => {
    let connection;

    beforeEach(() => {
        const stationA = new Station("A", 51.0, 0.45);
        const stationB = new Station("B", 50.2, -0.67);

        connection = new Connection(stationA, stationB);
    })

    test('should be initialized with empty metro lines set', () => {
        expect(connection.connectedMetroLines.size).toBe(0);
    })

    test('addMetroLine() should add metro line', () => {
        connection.addMetroLine("Metro line A");
        expect(connection.connectedMetroLines.size).toBe(1);
    });

    test('addMetroLine() should add unique metro line', () => {
        connection.addMetroLine("Metro line A");
        expect(connection.connectedMetroLines.size).toBe(1);
        connection.addMetroLine("Metro line B");
        expect(connection.connectedMetroLines.size).toBe(2);
    });

    test('addMetroLine() should not add existing metro line', () => {
        connection.addMetroLine("Metro line A");
        connection.addMetroLine("Metro line A");
        expect(connection.connectedMetroLines.size).toBe(1);
    })

    // Tests for getMetroLinesArray method
    test('getMetroLinesArray() should return array', () => {
        connection.addMetroLine("Metro line A");
        const result = connection.getMetroLinesArray();
        expect(result).toBeInstanceOf(Array);
    });

    test('getMetroLinesArray() should return correct-length array', () => {
        connection.addMetroLine("Metro line A");
        connection.addMetroLine("Metro line B");
        const result = connection.getMetroLinesArray();
        expect(result.length).toBe(2);

        connection.addMetroLine("Metro line B");
        const result2 = connection.getMetroLinesArray();
        expect(result2.length).toBe(2);
    });

    // Tests for getMetroLinesCount method
    test('getMetroLinesCount() should return integer', () => {
        connection.addMetroLine("Metro line B");
        const result = connection.getMetroLinesCount();
        expect(typeof result).toBe('number');
        expect(Number.isInteger(result)).toBe(true);
    });

    test('getMetroLinesCount() should return correct length', () => {
        connection.addMetroLine("Metro line A");
        connection.addMetroLine("Metro line A");
        const length = connection.getMetroLinesCount();
        expect(length).toBe(1);

        connection.addMetroLine("Metro line B");
        const length2 = connection.getMetroLinesCount();
        expect(length2).toBe(2);
    })
});