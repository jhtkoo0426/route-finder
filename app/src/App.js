// Core imports
import React, { Component } from "react";

// Components
import MapCanvas from "./utilities/map_assets/MapCanvas";
import SearchableDropdown from "./utilities/components/SearchableDropdown";

// Utilities, services & parsers
import AlgorithmSearchService from "./utilities/services/AlgorithmSearchService";
import DebuggerHandler from "./utilities/services/DebuggerHandler";
import MetroMapAssetsManager from "./utilities/services/MetroMapAssetsManager";
import SearchHandler from "./utilities/services/SearchHandler";
import TravelPathParser from "./utilities/parsers/path_parsers/TravelPathParser";

// Styling
import "./css/app.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'



// Core application code
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            debugger: null,                 // Logs error in the search panel
            stationNames: [],               // Variable for array of all station names  

            // Visualization variables
            selectedAlgoPath: [],           // Array of station names to show minimum distance path
            isVisualizingExploredPath: false,
            isVisualizingSelectedPath: false,

            // User interaction variables
            selectedStartStation: null,     // Input variable for start station
            selectedEndStation: null,       // Input variable for input end station
            selectedAlgorithm: null,        // Variable for algorithm selection
            algorithmResults: null,         // Stores all algorithm results
        };

        this.metroMapAssetsManager = new MetroMapAssetsManager(
            process.env.PUBLIC_URL + '/data/connections.csv',
            process.env.PUBLIC_URL + '/data/stations.csv',
            process.env.PUBLIC_URL + '/data/railways.csv',
        )

        this.algorithmSearchService = new AlgorithmSearchService();
        this.debuggerHandler = new DebuggerHandler(this);
        this.searchHandler = new SearchHandler(this);
        this.travelPathParser = new TravelPathParser();
    }

    // Initialize all metro map assets once the application has started.
    async componentDidMount() {
        await this.metroMapAssetsManager.parseCSVFiles();

        // Mount MetroMapAssetsManager to the required classes.
        this.mapCanvas.loadAssets(this.metroMapAssetsManager);
        this.algorithmSearchService.loadAssets(this.metroMapAssetsManager);
        this.travelPathParser.loadAssets(this.metroMapAssetsManager);
        this.setState({
            stationNames: this.metroMapAssetsManager.getStationNames(),
        })
    }

    // USER INTERACTION METHODS
    // Performs path-finding based on user-selected origin & destination stations and path-finding algorithm.
    handleSearchClick = async () => {
        this.searchHandler.handleSearchClick();
    };

    // STATE MANAGEMENT METHODS
    resetStates() {
        this.resetDebuggerState();
        this.metroMapAssetsManager.resetConnectionsOpacities();
    }

    resetDebuggerState() {
        this.debuggerHandler.resetDebuggerState();
    }

    setDebuggerState() {
        this.debuggerHandler.setDebuggerState();
    }
    
    // Updates the state of algorithm state variables. Used whenever the search form is sent.
    setAlgorithmResultState(path) {
        this.setState({
            selectedAlgoPath: path,
            isVisualized: true,
        });
    }

    // Updates the results of all algorithms
    setAllAlgorithmsResultsState(results) {
        this.setState({
            algorithmResults: results
        });
    }
    
    // PATH-FINDING ALGORITHM METHODS
    // Returns an optimised path with minimum transits.
    generateTravelSegments() {
        const path = this.state.selectedAlgoPath;
        const segments = this.travelPathParser.parseTravelPathIntoSegments(path);
        return this.mapCanvas.renderTravelPath(segments);
    }

    updateVisualizationStates = (isVisualizingExploredPath, isVisualizingSelectedPath) => {
        this.setState({
            isVisualizingExploredPath: isVisualizingExploredPath,
            isVisualizingSelectedPath: isVisualizingSelectedPath,
        });
    };

    render() {
        return (
            <div className="App">
                <div className="search-panel">
                    <div className="title">
                        <h1>Route Planner</h1>
                        <a href="https://github.com/jhtkoo0426/route-finder" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon size="lg" icon={faGithub}></FontAwesomeIcon>
                        </a>
                    </div>
                    <br></br>
                    <p>An interactive journey planner for transporting via metro in major cities. The map 
                       on the right consists of stationts (represented by circles) and connections
                       (represented by coloured lines). To use this planner, select a starting, ending 
                       station, and a path-finding algorithm from the dropdowns.</p>
                    <br></br>
                    <div className="search-menu">
                        <div className="search-box-start-station">
                            <SearchableDropdown
                                options={this.state.stationNames}
                                onChange={(selectedOption) =>
                                    this.setState({ selectedStartStation: selectedOption ? selectedOption.value : "" })
                                }
                                placeholder="Select Start Station"
                            />
                        </div>
                        <div className="search-box-end-station">
                            <SearchableDropdown
                                options={this.state.stationNames}
                                onChange={(selectedOption) => this.setState({ selectedEndStation: selectedOption ? selectedOption.value : "" })}
                                placeholder="Select End Station"
                            />
                        </div>
                        <div className="search-box-algorithm">
                            <SearchableDropdown
                                options={this.algorithmSearchService.algorithmOptions}
                                onChange={(algorithmOption) => this.setState({ selectedAlgorithm: algorithmOption.value })}
                                placeholder="Select algorithm"
                            />
                        </div>
                        <button onClick={this.handleSearchClick} className="search-btn">
                            Search
                        </button>
                    </div>
                    <br></br>
                    <details>
                        <summary>After completing all required fields, the planner will execute the following actions:</summary>
                        <ol>
                            <li>Illustrate the sequence of exploring station connections, beginning from stations in proximity to the starting station. <b>Connections will be displayed with enhanced opacity</b>.</li>
                            <li>Present a visual representation of the chosen path, <b>with full opacity</b>.</li>
                            <li>Show the elapsed time for the execution of the selected algorithm.</li>
                        </ol>
                    </details>
                    <br></br>
                    <details>
                        <summary>Important Points:</summary>
                        <ol>
                            <li>The primary objective of this planner is to identify and display the <b>shortest distance path</b>, not necessarily the path with the shortest duration.</li>
                            <li>The planner operates under the assumptions that:</li>
                            <ul>
                                <li>Waiting times between station transits are considered negligible.</li>
                                <li>All metro lines are consistently available, and real-time updates are not taken into consideration.</li>
                            </ul>
                            <li>The time measured by a path-finding algorithm represents solely the total duration of exploring stations and determining the shortest-distance path. This duration does not account for the time spent on visualization.</li>
                        </ol>
                    </details>
                    <br></br>
                    <hr></hr>
                    <br></br>
                    {
                        this.state.debugger !== null
                        ?<div className="debugger">
                            <p>{this.state.debugger}</p>
                        </div>
                        :null
                    }
                    <div className="exploration-status">
                        { this.state.isVisualizingExploredPath === true && <p>Exploring connections...</p> }
                    </div>
                    <br></br>
                    <div className="visualisation-status">
                        { this.state.isVisualizingSelectedPath === true && <p>Visualized the shortest-distance path.</p> }
                    </div>
                    <br></br>
                    <div className="search-results">
                        {
                            this.state.selectedAlgorithm !== null &&
                            <>
                                <div className="selected-algo-display">
                                    <p>Visualising {this.state.selectedAlgorithm} exploration</p>
                                </div>
                                <br></br>
                            </>
                        }
                        {
                            this.state.algorithmResults !== null &&
                            Object.keys(this.state.algorithmResults).map(algorithmName => {
                                const algorithmResults = this.state.algorithmResults[algorithmName];
                                const distance = algorithmResults['distance'];
                                const duration = algorithmResults['duration'];
                                return (
                                    <p key={algorithmName}>
                                        {algorithmName}: {duration.toFixed(3)}s | {distance.toFixed(3)}km
                                    </p>
                                );
                            })}
                        {
                            this.state.selectedAlgoPath.length !== 0 &&
                            this.generateTravelSegments()
                        }
                    </div>
                </div>
                <div className="metro-map-container" style={{  height: '100vh', overflow: 'hidden', position: 'relative' }}>
                    <MapCanvas
                        ref={(mapCanvas) => (this.mapCanvas = mapCanvas)}
                        updateVisualizationStates={this.updateVisualizationStates}
                    />
                </div>
            </div>
        );
    }
}


export default App;