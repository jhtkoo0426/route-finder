import Dijkstra from '../Dijkstra';
import MapGraph from '../../map_assets/MapGraph';

describe('Dijkstra Algorithm', () => {
    let mapGraph;
    let dijkstra;

    beforeEach(() => {
        mapGraph = new MapGraph();
    });

    it('should find optimal path and distance between two stations', () => {
        mapGraph.addNeighbourToStation('stationA', 'stationB', 0.51);
        mapGraph.addNeighbourToStation('stationB', 'stationC', 0.12);
        dijkstra = new Dijkstra(mapGraph);

        const result = dijkstra.searchOptimalPath('stationA', 'stationC');
        expect(result.distance).toBe(0.63);
        expect(result.path).toEqual(['stationA', 'stationB', 'stationC']);
        expect(result.visitedConnectionsOrder).toEqual([
            { start: 'stationA', end: 'stationB' },
            { start: 'stationB', end: 'stationA' },
            { start: 'stationB', end: 'stationC' },
            { start: 'stationC', end: 'stationB' }
        ]);
    });

    it('should construct optimal path even if currentStation is equal to startStation', () => {
        mapGraph.addNeighbourToStation('stationA', 'stationB', 0.51);
        mapGraph.addNeighbourToStation('stationB', 'stationC', 0.12);
        dijkstra = new Dijkstra(mapGraph);

        const result = dijkstra.searchOptimalPath('stationA', 'stationC');
        expect(result.path).toEqual(['stationA', 'stationB', 'stationC']);
    }); 

    it('should visit station, mark as visited, and process neighbors', () => {
        mapGraph.addNeighbourToStation('stationA', 'stationB', 0.51);
        mapGraph.addNeighbourToStation('stationB', 'stationC', 0.12);
        const dijkstra = new Dijkstra(mapGraph);

        // Mock stationIsVisited to return false initially and then true
        const stationIsVisitedMock = jest.fn();
        stationIsVisitedMock.mockReturnValueOnce(false).mockReturnValueOnce(true);
        dijkstra.stationIsVisited = stationIsVisitedMock;
        dijkstra.mapGraph.getStationNeighbourNames = jest.fn().mockReturnValue(['stationB']);
        dijkstra.mapGraph.getNeighbourDistance = jest.fn().mockReturnValue(0.5);
        dijkstra.searchOptimalPath('stationA', 'stationC');
        
        expect(stationIsVisitedMock).toHaveBeenCalledWith('stationA');
        expect(dijkstra.mapGraph.getStationNeighbourNames).toHaveBeenCalledWith('stationA');
        expect(dijkstra.mapGraph.getNeighbourDistance).toHaveBeenCalledWith('stationA', 'stationB');
    });    
});