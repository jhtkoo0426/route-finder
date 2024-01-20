import Dijkstra from "../algorithms/Dijkstra"



// Handles user queries via the search button
class AlgorithmSearchService {
    constructor() {
        this.metroMapAssetsManager = null;
    }

    loadAssetsManager(assetManager) {
        this.metroMapAssetsManager =  assetManager;
    }

    async search(selectedStartStation, selectedEndStation, selectedAlgorithm) {
        // Run all available algorithms and fetch the results and metrics (to be used for comparison).
        return this.executeAlgorithms(selectedStartStation, selectedEndStation);
    }

    executeAlgorithms(startStationName, endStationName) {
        const dijkstra = new Dijkstra(this.metroMapAssetsManager.stations);
        const algorithmResults = {
            "Dijkstra": dijkstra.runAlgorithm(startStationName, endStationName)
        }
        return algorithmResults;
    }
}


export default AlgorithmSearchService;