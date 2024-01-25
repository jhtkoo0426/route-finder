import Dijkstra from "../algorithms/Dijkstra"



// Handles user queries via the search button.
class AlgorithmSearchService {
    constructor() {
        this.metroMapAssetsManager = null;
        this.algorithmOptions = ["Dijkstra"];
    }

    // @params {MetroMapAssetsManager} assetManager
    loadAssets(assetManager) {
        this.metroMapAssetsManager =  assetManager;
    }

    // Runs all available algorithms and fetch the results and metrics (to be used for comparison).
    // @params {string} startStationName
    // @params {string} endStationName
    // @returns {Map}
    async search(startStationName, endStationName) {
        const dijkstra = new Dijkstra(this.metroMapAssetsManager.mapGraph);
        const algorithmResults = {
            "Dijkstra": dijkstra.runAlgorithm(startStationName, endStationName)
        }
        return algorithmResults;
    }
}


export default AlgorithmSearchService;