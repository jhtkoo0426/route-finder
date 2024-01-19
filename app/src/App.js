// Core imports
import React, { Component } from "react";

// Components
import MapCanvas from "./utilities/map_assets/MapCanvas";
import MetroMapAssetsManager from "./utilities/MetroMapAssetsManager";
import Dijkstra from "./utilities/algorithms/Dijkstra"
import SelectDropdown from "./utilities/components/SelectDropdown";

// Constants
import {
    SVG_CONNECTION_OPACITY_VISITED,
    SVG_CONNECTION_OPACITY_UNVISITED,
    SVG_CONNECTION_OPACITY_SELECTED,
    VISUALISE_PATH_NODE_DELAY,
} from "./utilities/Constants";

// Styling
import "./css/app.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'



// Core application code
class App extends Component {
    constructor(props) {
        super(props);

        this.algorithmOptions = ["Dijkstra"];

        this.state = {
            debugger: null,                         // Logs error in the search panel

            // Visualization variables
            isVisualizingExploredPath: false,
            isVisualizingSelectedPath: false,
            isVisualized: false,

            // User-dependent variables
            selectedStartStation: null,             // Input variable for start station
            selectedEndStation: null,               // Input variable for input end station
            selectedAlgorithm: null,                // Variable for algorithm selection
            selectedAlgoPath: [],                   // Array of station names to show minimum distance path
            selectedAlgoPathDistance: null,         // Variable for mimimum distance
            selectedAlgoDuration:  null,            // Variable for measuring time elapsed for algorithm
        };

        this.metroMapAssetsManager = new MetroMapAssetsManager(
            process.env.PUBLIC_URL + '/data/connections.csv',
            process.env.PUBLIC_URL + '/data/stations.csv',
            process.env.PUBLIC_URL + '/data/railways.csv',
        )
    }

    // Initialize all metro map assets once the application has started.
    async componentDidMount() {
        await this.metroMapAssetsManager.parseCSVFiles();

        // Mount MetroMapAssetsManager to the required classes.
        this.metroMapBackendCanvas.loadAssets(this.metroMapAssetsManager);
        this.setState({
            stationNames: this.metroMapAssetsManager.getStationNames(),
        })
    }

    // Path-finding methods
    executeAlgorithms(startStationName, endStationName) {
        const dijkstra = new Dijkstra(this.metroMapAssetsManager.stations);
        const algorithmResults = {
            "Dijkstra": dijkstra.runAlgorithm(startStationName, endStationName)
        }
        return algorithmResults;
    }
    
    // Returns an optimised path with minimum transits.
    generateTravelSegments(path) {
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
        return segments;
    }  

    // State-setting methods
    // Resets states of visualization state variables. Used whenever a new search query is made.
    resetStates() {
        this.setState({
            selectedAlgoPath: [],
            selectedAlgoPathDistance: null,
            selectedAlgoDuration: null,
            debugger: null,
            isVisualisingConnectionOrder: false,
            isVisualizingSelectedPath: false,
        })
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

    // Updates the debugger state to inform users of any missing fields in the search form.
    setDebuggerState() {
        const { selectedStartStation, selectedEndStation, selectedAlgorithm } = this.state;
        const missingFields = [
            selectedStartStation === null ? "Start station" : "",
            selectedEndStation === null ? "End station" : "",
            selectedAlgorithm === null ? "Algorithm" : "",
        ];
        this.setState({
            debugger: "The following fields are not selected: " + missingFields.filter(Boolean).join(', '),
        });
    }    

    // Resets the opacity of Connection object SVG representations in the MapCanvas.
    resetVisualisedConnections() {     
        const connections = { ...this.metroMapAssetsManager.connections };
        Object.keys(connections).forEach((key) => {
            // Revert opacity to default (UNVISITED)
            connections[key].state.opacity = SVG_CONNECTION_OPACITY_UNVISITED;
        });
    }

    // Auxiliary methods
    isSearchFormValid() {
        return this.state.selectedStartStation !== null &&
            this.state.selectedEndStation !== null &&
            this.state.selectedAlgorithm !== null;
    }

    // Core app methods
    // Performs path-finding based on user-selected origin & destination stations and path-finding algorithm.
    handleSearchClick = async () => {
        const { selectedStartStation, selectedEndStation, selectedAlgorithm } = this.state;
        if (this.isSearchFormValid()) {
            this.resetStates();
            this.resetVisualisedConnections();
            this.setState({ isVisualized: false });       
            
            // Run all available algorithms and fetch the results and metrics (to be used for comparison).
            const algorithmResults = this.executeAlgorithms(selectedStartStation, selectedEndStation);

            // Only update the path, distance and duration states to that of the selected algorithm.
            const { distance, path, visitedConnectionsOrder, duration } = algorithmResults[selectedAlgorithm];
            this.setAlgorithmResultState(path, distance, duration);

            // Move viewer to start station position on map
            const startStationObj = this.metroMapAssetsManager.stations[selectedStartStation];
            this.metroMapBackendCanvas.panToLocation(startStationObj.x, startStationObj.y);
            await this.animateConnections("exploredPath", visitedConnectionsOrder, SVG_CONNECTION_OPACITY_VISITED);
            await this.animateConnections("selectedPath", path, SVG_CONNECTION_OPACITY_SELECTED);
        } else {
            this.setDebuggerState();
        }
    };

    // Animate Connection objects in the MapCanvas. There are 2 possible ways to animate connections:
    // 1) exploredPath - connectionsOrder is a hashmap of objects; 2) selectedPath - connectionsOrder
    // is an array of objects.
    animateConnections = async (type, connectionsOrder, opacity) => {
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const isVisualizingExploredPath = type === "exploredPath";
        const isVisualizingSelectedPath = !isVisualizingExploredPath;
        this.setState({
            isVisualizingExploredPath,
            isVisualizingSelectedPath,
        });
    
        for (let i = 0; i < connectionsOrder.length; i++) {
            let [start, end] = isVisualizingExploredPath
                ? [connectionsOrder[i].start, connectionsOrder[i].end]
                : [connectionsOrder[i], connectionsOrder[i + 1]];
            const connections = { ...this.metroMapAssetsManager.connections };
            const connectionKey = connections[`${start}-${end}`] ? `${start}-${end}` : `${end}-${start}`;
            if (connections[connectionKey]) {
                connections[connectionKey].state.opacity = opacity;
                this.metroMapBackendCanvas.setState({ connections });
            }
            await delay(VISUALISE_PATH_NODE_DELAY);
        }
    };  

    renderTravelPlan(travelPath) {
        const travelSegments = this.generateTravelSegments(travelPath);
        let [startX, startY] = [10, 10];

        return (
            <svg className="travel-path" height={600}>
                {travelSegments.length !== 0 && travelSegments.map((segment, index) => {
                    const updatedStartY = startY + index * 45;
                    return this.metroMapBackendCanvas.renderTravelPathSegment(segment, index, startX, updatedStartY);
                })}
            </svg>
        );
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
                                options={this.metroMapAssetsManager.getStationNames()}
                                onChange={(selectedOption) =>
                                    this.setState({ selectedStartStation: selectedOption ? selectedOption.value : "" })
                                }
                                placeholder="Select Start Station"
                            />
                        </div>
                        <div className="search-box-end-station">
                            <SelectDropdown
                                options={this.metroMapAssetsManager.getStationNames()}
                                onChange={(selectedOption) => this.setState({ selectedEndStation: selectedOption ? selectedOption.value : "" })}
                                placeholder="Select End Station"
                            />
                        </div>
                        <div className="search-box-algorithm">
                            <SelectDropdown
                                options={this.algorithmOptions}
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
                        { this.state.isVisualizingExploredPath ? <p>Exploring connections...</p> : null }
                    </div>
                    <div className="visualisation-status">
                        { this.state.isVisualizingSelectedPath ? <p>Visualised optimal path.</p> : null }
                    </div>
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
                            this.renderTravelPlan(this.state.selectedAlgoPath)
                        }
                    </div>
                </div>
                <div className="metro-map-container" style={{  height: '100vh', overflow: 'hidden', position: 'relative' }}>
                    <MapCanvas ref={(mapCanvas) => (this.metroMapBackendCanvas = mapCanvas)}/>
                </div>
            </div>
        );
    }
}


export default App;