import TravelPathParser from '../TravelPathParser';

describe('TravelPathParser', () => {
    let parser;

    beforeEach(() => {
        parser = new TravelPathParser();
    });

    test('parseTravelPathIntoSegments() returns null for empty path', () => {
        const result = parser.parseTravelPathIntoSegments([]);
        expect(result).toBeNull();
    });

    test('parseTravelPathIntoSegments() returns null for null path', () => {
        const result = parser.parseTravelPathIntoSegments(null);
        expect(result).toBeNull();
    });

    test('parseTravelPathIntoSegments() returns correct segments for a simple path', () => {
        parser.loadAssets({
            connections: {
                'A-B': { getMetroLinesArray: () => ['MetroLine1'] },
                'B-C': { getMetroLinesArray: () => ['MetroLine1'] },
            },
        });

        const path = ['A', 'B', 'C'];
        const result = parser.parseTravelPathIntoSegments(path);

        expect(result).toEqual([
            { start: 'A', line: 'MetroLine1', stops: 2 },
            { start: 'C', line: null, stops: 0 },
        ]);
    });
    
    test('parseTravelPathIntoSegments() returns correct result for a single stop path', () => {
        parser.loadAssets({
            connections: {
                'A-B': { getMetroLinesArray: () => ['MetroLine1'] },
            },
        });
      
        const path = ['A'];
        const result = parser.parseTravelPathIntoSegments(path);
      
        expect(result).toEqual([
            { start: null, line: null, stops: 0 },
            { start: 'A', line: null, stops: 0 },
        ]);
    });

    test('parseTravelPathIntoSegments() handles multiple lines correctly', () => {
        parser.loadAssets({
            connections: {
                'A-B': { getMetroLinesArray: () => ['MetroLine1'] },
                'B-C': { getMetroLinesArray: () => ['MetroLine2'] },
            },
        });

        const path = ['A', 'B', 'C'];
        const result = parser.parseTravelPathIntoSegments(path);

        expect(result).toEqual([
            { start: 'A', line: 'MetroLine1', stops: 1 },
            { start: 'B', line: 'MetroLine2', stops: 1 },
            { start: 'C', line: null, stops: 0 },
        ]);
    });

    test('parseTravelPathIntoSegments() handles connections in both directions', () => {
        const mockConnectionAB = { getMetroLinesArray: () => ['MetroLine1'] };
        const mockConnectionBA = { getMetroLinesArray: () => ['MetroLine2'] };
      
        parser.loadAssets({
            connections: {
                'A-B': mockConnectionAB,
                'B-A': mockConnectionBA,
            },
        });
      
        const path = ['A', 'B', 'A'];
        const result = parser.parseTravelPathIntoSegments(path);
      
        expect(result).toEqual([
            { start: 'A', line: 'MetroLine1', stops: 1 },
            { start: 'B', line: 'MetroLine2', stops: 1 },
            { start: 'A', line: null, stops: 0 },
        ]);
    });
    
    test('parseTravelPathIntoSegments() handles reversed path connections', () => {
        parser.loadAssets({
            connections:  {
                'A-B': { getMetroLinesArray: () => ['MetroLine1']}
            }
        })

        const path = ['B', 'A'];
        const result = parser.parseTravelPathIntoSegments(path);
        expect(result).toEqual([
            { start: 'B', line: 'MetroLine1', stops: 1},
            { start: 'A', line: null, stops: 0}
        ])
    });
});