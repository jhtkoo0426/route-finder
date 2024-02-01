import MapGraph from '../../map_assets/MapGraph';
import AlgorithmSearchService from '../AlgorithmSearchService';
import MetroMapAssetsManager from '../MetroMapAssetsManager';


describe('AlgorithmSearchService.js tests', () => {
    let algorithmSearchService;
    let metroMapAssetsManager;
    let mapGraph;

    beforeEach(async () => {
        metroMapAssetsManager = new MetroMapAssetsManager(
            'mockConnectionsFilePath',
            'mockStationsFilePath',
            'mockRailwaysFilePath'
        );

        // Mocking parseCSVFiles method
        metroMapAssetsManager.parseCSVFiles = jest.fn();

        algorithmSearchService = new AlgorithmSearchService();
        algorithmSearchService.loadAssets(metroMapAssetsManager);

        mapGraph = new MapGraph();
        mapGraph.addNeighbourToStation('stationA', 'stationB', 0.5);
        mapGraph.addNeighbourToStation('stationB', 'stationC', 0.8);
        mapGraph.addNeighbourToStation('stationA', 'stationC', '0.14');
        mapGraph.addNeighbourToStation('stationB', 'stationC', 0.61);

        metroMapAssetsManager.mapGraph = mapGraph;
    });

    it('should load assets manager correctly', () => {
        expect(algorithmSearchService.metroMapAssetsManager).toBeInstanceOf(MetroMapAssetsManager);
    });

    it('search method should return results for Dijkstra algorithm', async () => {
        const startStation = 'stationA';
        const endStation = 'stationC';

        const result = await algorithmSearchService.search(startStation, endStation);

        expect(result).toHaveProperty('Dijkstra');
        expect(result).toEqual(expect.any(Object));
    });
});