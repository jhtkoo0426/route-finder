// Create a new class for handling search logic
class SearchHandler {
    constructor(appInstance) {
        this.appInstance = appInstance;
    }

    async handleSearchClick() {
        const { selectedStartStation, selectedEndStation, selectedAlgorithm } = this.appInstance.state;
        if (selectedStartStation !== null && selectedEndStation !== null && selectedAlgorithm !== null) {
            this.appInstance.resetStates();
            const searchResults = await this.appInstance.algorithmSearchService.search(
                selectedStartStation,
                selectedEndStation,
                selectedAlgorithm
            );

            // Only update the path, distance, and duration states to that of the selected algorithm.
            const { distance, path, duration } = searchResults[selectedAlgorithm];
            this.appInstance.setAlgorithmResultState(path, distance, duration);
            this.appInstance.mapCanvas.renderAlgorithmSearchResults(searchResults[selectedAlgorithm]);
            this.appInstance.mapCanvas.moveViewerToStation(selectedStartStation);
        } else {
            this.appInstance.setDebuggerState();
        }
    }
}


export default SearchHandler;