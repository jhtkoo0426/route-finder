class DebuggerHandler {
    constructor(appInstance) {
        this.appInstance = appInstance;
    }

    // Reset debugger state
    resetDebuggerState() {
        this.appInstance.setState({ debugger: null });
    }

    // Set debugger state to inform users of any missing fields in the search form
    setDebuggerState() {
        const { selectedStartStation, selectedEndStation, selectedAlgorithm } = this.appInstance.state;
        const missingFields = [
            selectedStartStation === null ? "Start station" : "",
            selectedEndStation === null ? "End station" : "",
            selectedAlgorithm === null ? "Algorithm" : "",
        ];
        this.appInstance.setState({
            debugger: "The following fields are not selected: " + missingFields.filter(Boolean).join(', '),
        });
    }
}


export default DebuggerHandler;