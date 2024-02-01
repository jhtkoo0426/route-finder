import MapGraph from '../MapGraph';


describe('MapGraph.js tests', () => {
    let mapGraph;
    
    beforeEach(() => {
      mapGraph = new MapGraph();
    });

    it('should be initialized with an empty adjacency list', () => {
        expect(mapGraph.adjacencyList.size).toBe(0);
    });

    it('should maintain bidirectional connection between stations', () => {
        mapGraph.addNeighbourToStation('stationA', 'stationB', 10.5);

        // Check if the source and neighbor connection is added correctly
        expect(mapGraph.adjacencyList.size).toBe(2);
        expect(mapGraph.adjacencyList.get('stationA').size).toBe(1);
        expect(mapGraph.adjacencyList.get('stationA').get('stationB')).toBe(10.5);

        // Check if the corresponding neighbor-source connection is added correctly
        expect(mapGraph.adjacencyList.get('stationB').size).toBe(1);
        expect(mapGraph.adjacencyList.get('stationB').get('stationA')).toBe(10.5);
    });

    it('should handle multiple neighbors for a station', () => {
        mapGraph.addNeighbourToStation('stationA', 'stationB', 10.5);
        mapGraph.addNeighbourToStation('stationA', 'StationC', 15.0);

        // Check if all neighbors are added correctly
        expect(mapGraph.adjacencyList.size).toBe(3);
        expect(mapGraph.adjacencyList.get('stationA').size).toBe(2);
        expect(mapGraph.adjacencyList.get('stationA').get('stationB')).toBe(10.5);
        expect(mapGraph.adjacencyList.get('stationA').get('StationC')).toBe(15.0);

        // Check bidirectional connection for stationB
        expect(mapGraph.adjacencyList.get('stationB').size).toBe(1);
        expect(mapGraph.adjacencyList.get('stationB').get('stationA')).toBe(10.5);
    });

    it('should update edge distance', () => {
        mapGraph.addNeighbourToStation('stationA', 'stationB', 10.5);
        mapGraph.addNeighbourToStation('stationA', 'stationB', 8);

        expect(mapGraph.adjacencyList.get('stationA').size).toBe(1);
        expect(mapGraph.adjacencyList.get('stationA').get('stationB')).toBe(8);
    })

    it('getNeighbourDistance() should return distance if source station in adjacency list', () => {
        mapGraph.addNeighbourToStation('stationA', 'stationB', 10.5);
        const result = mapGraph.getNeighbourDistance('stationA', 'stationB');
        expect(result).toBe(10.5);
    });    

    it('getNeighbourDistance() should return undefined if source station not in adjacency list', () => {
        const result = mapGraph.getNeighbourDistance('nonExistentStation', 'stationB');
        expect(result).toBeUndefined();
    });    
});