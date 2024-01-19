import React, { Component } from "react";
import Select from "react-select";
import MetroMapBackend from "./utilities/MetroMapBackend";
import MapCanvas from "./utilities/map_assets/MapCanvas";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import "./css/app.css";

import {
    SVG_CONNECTION_OPACITY_VISITED,
    SVG_CONNECTION_OPACITY_UNVISITED,
    SVG_CONNECTION_OPACITY_SELECTED,
    VISUALISE_PATH_NODE_DELAY,
} from "./utilities/Constants";

// React-select component styling
const customStyles = {
    control: (provided, state) => ({
        ...provided,
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 123, 255, 0.6)' : null,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#007bff' : null,
        color: state.isSelected ? 'white' : 'black',
    }),
};



// Core application code
class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedStartStation: null,             // Input variable for start station
            selectedEndStation: null,               // Input variable for input end station
            selectedAlgorithm: null,                // Variable for algorithm selection
            stationNames: [],                       // A collection of metro station names
            stationObjects: [],                           // Array of Station.js objects
            railwayLinesColourMap: null,            // Variable for metro line colour mappings
            selectedAlgoPath: [],                   // Array of station names to show minimum distance path
            selectedAlgoPathDistance: null,         // Variable for mimimum distance
            selectedAlgoDuration:  null,            // Variable for measuring time elapsed for algorithm
            debugger: null,                         // Logs error in the search panel
            isVisualisingExploredPath: false,
            isVisualisingSelectedPath: false,
            isVisualised: false,
        };
        
        this.metroMap = new MetroMapBackend(
            process.env.PUBLIC_URL + '/data/connections.csv',
            process.env.PUBLIC_URL + '/data/stations.csv',
            process.env.PUBLIC_URL + '/data/railways.csv',
        );
    }

    // Initialize all metro map assets once the application has started.
    async componentDidMount() {
        await this.metroMap.parseCSVFiles();
        const names = this.metroMap.getStationNames();
        const stationObjects = this.metroMap.getStationObjects();
        const railwayLinesColourMap = this.metroMap.getRailwayLineColourMap();

        this.setState({
            stationNames: names,
            stationObjects: stationObjects,
            railwayLinesColourMap: railwayLinesColourMap,
        });
        this.metroMap.visualizeMetroMap(this.metroMapCanvas);
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
            isVisualisingSelectedPath: false,
        })
    }

    // Updates the state of algorithm state variables. Used whenever the search form is sent.
    setAlgorithmResultState(path, distance, duration) {
        this.setState({
            selectedAlgoPath: path,
            selectedAlgoPathDistance: distance,
            selectedAlgoDuration: duration,
            isVisualised: true,
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
        const connections = { ...this.metroMapCanvas.state.connections };
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
            this.setState({ isVisualised: false });       
            
            // Run all available algorithms and fetch the results and metrics (to be used for comparison).
            const algorithmResults = this.metroMap.executeAlgorithms(selectedStartStation, selectedEndStation);

            // Only update the path, distance and duration states to that of the selected algorithm.
            const { distance, path, visitedConnectionsOrder, duration } = algorithmResults[selectedAlgorithm];
            this.setAlgorithmResultState(path, distance, duration);

            // Move viewer to start station position on map
            const startStationObj = this.state.stationObjects[selectedStartStation];
            this.metroMapCanvas.panToLocation(startStationObj.x, startStationObj.y);
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
        const isVisualisingExploredPath = type === "exploredPath";
        const isVisualisingSelectedPath = !isVisualisingExploredPath;
        this.setState({
            isVisualisingExploredPath,
            isVisualisingSelectedPath,
        });
    
        for (let i = 0; i < connectionsOrder.length; i++) {
            let [start, end] = isVisualisingExploredPath
                ? [connectionsOrder[i].start, connectionsOrder[i].end]
                : [connectionsOrder[i], connectionsOrder[i + 1]];
            const connections = { ...this.metroMapCanvas.state.connections };
            const connectionKey = connections[`${start}-${end}`] ? `${start}-${end}` : `${end}-${start}`;
            if (connections[connectionKey]) {
                connections[connectionKey].state.opacity = opacity;
                this.metroMapCanvas.setState({ connections });
            }
            await delay(VISUALISE_PATH_NODE_DELAY);
        }
    };  

    renderTravelPlan(travelPath) {
        const travelSegments = this.metroMap.generateTravelSegments(travelPath);
        let [startX, startY] = [10, 10];

        return (
            <svg className="travel-path" height={600}>
                {travelSegments.length !== 0 && travelSegments.map((segment, index) => {
                    const updatedStartY = startY + index * 45;
                    return this.metroMapCanvas.renderTravelPathSegment(segment, index, startX, updatedStartY);
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
                            <Select
                                options={this.state.stationNames.map((station) => ({ value: station, label: station }))}
                                onChange={(selectedOption) => this.setState({ selectedStartStation: selectedOption ? selectedOption.value : "" })}
                                placeholder="Select Start Station"
                                isSearchable
                                styles={customStyles}
                            />
                        </div>
                        <div className="search-box-end-station">
                            <Select
                                options={this.state.stationNames.map((station) => ({ value: station, label: station }))}
                                onChange={(selectedOption) => this.setState({ selectedEndStation: selectedOption ? selectedOption.value : "" })}
                                placeholder="Select End Station"
                                isSearchable
                                styles={customStyles}
                            />
                        </div>
                        <div className="search-box-algorithm">
                            <Select
                                options={['Dijkstra'].map((algo) => ({value: algo, label: algo }))}
                                onChange={(algorithmOption) => this.setState({ selectedAlgorithm: algorithmOption.value })}
                                placeholder="Select algorithm"
                                isSearchable
                                styles={customStyles}
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
                        { this.state.isVisualisingExploredPath ? <p>Exploring connections...</p> : null }
                    </div>
                    <div className="visualisation-status">
                        { this.state.isVisualisingSelectedPath ? <p>Visualised optimal path.</p> : null }
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
                    <MapCanvas ref={(mapCanvas) => (this.metroMapCanvas = mapCanvas)}/>
                </div>
            </div>
        );
    }
}


export default App;