import MapGraph from '../MapGraph';


describe('MapGraph.js tests', () => {
    let mapGraph;
    
    beforeEach(() => {
      mapGraph = new MapGraph();
    });

    test('should be initialized with an empty adjacency list', () => {
        expect(mapGraph.adjacencyList.size).toBe(0);
    });

    test('should maintain bidirectional connection between stations', () => {
        mapGraph.addNeighbourToStation('StationA', 'StationB', 10.5);

        // Check if the source and neighbor connection is added correctly
        expect(mapGraph.adjacencyList.size).toBe(2);
        expect(mapGraph.adjacencyList.get('StationA').size).toBe(1);
        expect(mapGraph.adjacencyList.get('StationA').get('StationB')).toBe(10.5);

        // Check if the corresponding neighbor-source connection is added correctly
        expect(mapGraph.adjacencyList.get('StationB').size).toBe(1);
        expect(mapGraph.adjacencyList.get('StationB').get('StationA')).toBe(10.5);
    });

    test('should handle multiple neighbors for a station', () => {
        mapGraph.addNeighbourToStation('StationA', 'StationB', 10.5);
        mapGraph.addNeighbourToStation('StationA', 'StationC', 15.0);

        // Check if all neighbors are added correctly
        expect(mapGraph.adjacencyList.size).toBe(3);
        expect(mapGraph.adjacencyList.get('StationA').size).toBe(2);
        expect(mapGraph.adjacencyList.get('StationA').get('StationB')).toBe(10.5);
        expect(mapGraph.adjacencyList.get('StationA').get('StationC')).toBe(15.0);

        // Check bidirectional connection for StationB
        expect(mapGraph.adjacencyList.get('StationB').size).toBe(1);
        expect(mapGraph.adjacencyList.get('StationB').get('StationA')).toBe(10.5);
    });

    test('should update edge distance', () => {
        mapGraph.addNeighbourToStation('StationA', 'StationB', 10.5);
        mapGraph.addNeighbourToStation('StationA', 'StationB', 8);

        expect(mapGraph.adjacencyList.get('StationA').size).toBe(1);
        expect(mapGraph.adjacencyList.get('StationA').get('StationB')).toBe(8);
    })
});