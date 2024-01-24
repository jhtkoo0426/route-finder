import Dijkstra from "../algorithms/Dijkstra"



// Handles user queries via the search button.
class AlgorithmSearchService {
    constructor() {
        this.metroMapAssetsManager = null;
        this.algorithmOptions = ["Dijkstra"];
    }

    loadAssets(assetManager) {
        this.metroMapAssetsManager =  assetManager;
    }

    async search(selectedStartStation, selectedEndStation) {
        // Run all available algorithms and fetch the results and metrics (to be used for comparison).
        return this.executeAlgorithms(selectedStartStation, selectedEndStation);
    }

    executeAlgorithms(startStationName, endStationName) {
        const dijkstra = new Dijkstra(this.metroMapAssetsManager.mapGraph);
        const algorithmResults = {
            "Dijkstra": dijkstra.runAlgorithm(startStationName, endStationName)
        }
        return algorithmResults;
    }
}


export default AlgorithmSearchService;