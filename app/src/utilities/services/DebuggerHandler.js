// Handles the application debugger and validates the search form.
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
        const missingFields = [];
        
        if (selectedStartStation === null) {
            missingFields.push("Start station");
        }
        
        if (selectedEndStation === null) {
            missingFields.push("End station");
        }
        
        if (selectedAlgorithm === null) {
            missingFields.push("Algorithm");
        }
        
        if (missingFields.length > 0) {
            this.appInstance.setState({
                debugger: "The following fields are not selected: " + missingFields.join(', '),
            });
        }
    }
}


export default DebuggerHandler;