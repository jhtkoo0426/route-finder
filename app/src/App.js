// Core imports
import React, { Component } from "react";

// Components
import AlgorithmSearchService from "./utilities/services/AlgorithmSearchService";
import MapCanvas from "./utilities/map_assets/MapCanvas";
import MetroMapAssetsManager from "./utilities/MetroMapAssetsManager";
import SelectDropdown from "./utilities/components/SelectDropdown";

// Styling
import "./css/app.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import SearchHandler from "./utilities/services/SearchHandler";
import DebuggerHandler from "./utilities/services/DebuggerHandler";



// Core application code
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            debugger: null,                         // Logs error in the search panel
            stationNames: [],

            // Visualization variables
            selectedAlgoPath: [],                   // Array of station names to show minimum distance path
            selectedAlgoPathDistance: null,         // Variable for mimimum distance
            selectedAlgoDuration:  null,            // Variable for measuring time elapsed for algorithm

            // User-dependent variables
            selectedStartStation: null,             // Input variable for start station
            selectedEndStation: null,               // Input variable for input end station
            selectedAlgorithm: null,                // Variable for algorithm selection
        };

        this.metroMapAssetsManager = new MetroMapAssetsManager(
            process.env.PUBLIC_URL + '/data/connections.csv',
            process.env.PUBLIC_URL + '/data/stations.csv',
            process.env.PUBLIC_URL + '/data/railways.csv',
        )

        this.algorithmSearchService = new AlgorithmSearchService();
        this.debuggerHandler = new DebuggerHandler(this);
        this.searchHandler = new SearchHandler(this);
    }

    // Initialize all metro map assets once the application has started.
    async componentDidMount() {
        await this.metroMapAssetsManager.parseCSVFiles();

        // Mount MetroMapAssetsManager to the required classes.
        this.mapCanvas.loadAssets(this.metroMapAssetsManager);
        this.algorithmSearchService.loadAssets(this.metroMapAssetsManager);
        this.setState({
            stationNames: this.metroMapAssetsManager.getStationNames(),
        })
    }

    // State-setting methods
    resetStates() {
        this.debuggerHandler.resetDebuggerState();
        this.metroMapAssetsManager.resetConnectionsOpacities();
    }
    
    // Resets states of visualization state variables. Used whenever a new search query is made.
    resetAlgorithmResultState() {
        this.setState({
            selectedAlgoPath: [],
            selectedAlgoPathDistance: null,
            selectedAlgoDuration: null,
            isVisualized: false,
        })
    }

    // Reset debugger state
    resetDebuggerState() {
        this.debuggerHandler.resetDebuggerState();
    }

    // Set debugger state using the DebuggerHandler class
    setDebuggerState() {
        this.debuggerHandler.setDebuggerState();
    }
    
    // Updates the state of algorithm state variables. Used whenever the search form is sent.
    setAlgorithmResultState(path, distance, duration) {
        this.setState({
            selectedAlgoPath: path,
            selectedAlgoPathDistance: distance,
            selectedAlgoDuration: duration,
            isVisualized: true,
        });
    }

    // Performs path-finding based on user-selected origin & destination stations and path-finding algorithm.
    handleSearchClick = async () => {
        this.searchHandler.handleSearchClick();
    };
    
    // Returns an optimised path with minimum transits.
    generateTravelSegments() {
        const path = this.state.selectedAlgoPath;
        if (!path || path.length === 0) return null;
    
        const segments = [];
        let [start, line, stops] = [null, null, 0];    
        for (let i = 0; i < path.length - 1; i++) {
            const current = path[i];
            const next = path[i + 1];
            const connection = this.metroMapAssetsManager.connections[`${current}-${next}`] || this.metroMapAssetsManager.connections[`${next}-${current}`];
            const lines = Array.from(connection.metroLines);
    
            if (!start) [start, line] = [current, lines[0]];
            if (!lines.includes(line)) {
                segments.push({ start, line, stops });
                [start, line, stops] = [current, lines[0], 1];
            } else {
                stops++;
            }
        }
        segments.push({ start, line, stops });
        segments.push({ start: path[path.length-1], line: null, stops: 0 });
        return this.mapCanvas.renderTravelPath(segments);
    }

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
                            <SelectDropdown
                                options={this.state.stationNames}
                                onChange={(selectedOption) =>
                                    this.setState({ selectedStartStation: selectedOption ? selectedOption.value : "" })
                                }
                                placeholder="Select Start Station"
                            />
                        </div>
                        <div className="search-box-end-station">
                            <SelectDropdown
                                options={this.state.stationNames}
                                onChange={(selectedOption) => this.setState({ selectedEndStation: selectedOption ? selectedOption.value : "" })}
                                placeholder="Select End Station"
                            />
                        </div>
                        <div className="search-box-algorithm">
                            <SelectDropdown
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
                    <br></br>
                    <div className="search-results">
                        {
                            this.state.selectedAlgoDuration !== null &&
                            <div className="time-analysis">
                                <h2>Time analysis</h2>
                                <p>Time elapsed: {this.state.selectedAlgoDuration.toFixed(3)}s</p>
                            </div>
                        }
                        {
                            this.state.selectedAlgoPathDistance !== null &&
                            <p>Distance: {this.state.selectedAlgoPathDistance.toFixed(3)}km</p>
                        }
                        {
                            this.state.selectedAlgoPath.length !== 0 &&
                            this.generateTravelSegments()
                        }
                    </div>
                </div>
                <div className="metro-map-container" style={{  height: '100vh', overflow: 'hidden', position: 'relative' }}>
                    <MapCanvas ref={(mapCanvas) => (this.mapCanvas = mapCanvas)}/>
                </div>
            </div>
        );
    }
}


export default App;