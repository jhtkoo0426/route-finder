import Dijkstra from "../algorithms/Dijkstra"
import A_star from "../algorithms/A_star";



// Handles user queries via the search button.
class AlgorithmSearchService {
    constructor() {
        this.metroMapAssetsManager = null;
        this.algorithmOptions = ["Dijkstra", "A*"];
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
        const a_star = new A_star(this.metroMapAssetsManager.mapGraph, endStationName);
        const algorithmResults = {
            "Dijkstra": dijkstra.runAlgorithm(startStationName, endStationName),
            "A*": a_star.runAlgorithm(startStationName, endStationName),
        }
        return algorithmResults;
    }
}


export default AlgorithmSearchService;