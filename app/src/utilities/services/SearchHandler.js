// Handles application searching logic.
class SearchHandler {
    constructor(appInstance) {
        this.appInstance = appInstance;
    }

    // Handles the search functionality of the application:
    // 1. Resets application states of previous search results
    // 2. Searches for the optimal path using all available algorithms
    // 3. Update application states with new search results for the selected algorithm
    // Any state changes are observed and corresponding visualization takes place afterwards.
    async handleSearchClick() {
        const { selectedStartStation, selectedEndStation, selectedAlgorithm } = this.appInstance.state;
        
        if (selectedStartStation !== null && selectedEndStation !== null && selectedAlgorithm !== null) {
            this.appInstance.resetStates();

            // Searches for the optimal path using all available algorithms
            const searchResults = await this.appInstance.algorithmSearchService.search(
                selectedStartStation,
                selectedEndStation,
                selectedAlgorithm
            );

            // Update the state for storing results of all algorithms
            this.appInstance.setAllAlgorithmsResultsState(searchResults);
            
            // Only update the path duration states to that of the selected algorithm.
            const { path } = searchResults[selectedAlgorithm];
            this.appInstance.setAlgorithmResultState(path);
            this.appInstance.mapCanvas.renderAlgorithmSearchResults(searchResults[selectedAlgorithm]);
            this.appInstance.mapCanvas.moveViewerToStation(selectedStartStation);
        } else {
            this.appInstance.setDebuggerState();
        }
    }
}


export default SearchHandler;