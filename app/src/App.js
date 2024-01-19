import React, { Component } from "react";
import Select from "react-select";
import MetroMapBackend from "./utilities/MetroMapBackend";
import MapCanvas from "./utilities/map/MapCanvas";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import "./css/app.css";

import {
    SVG_STATION_RADIUS,
    SVG_STATION_NAME_FONT_SIZE,
    SVG_STATION_NAME_FONT_COLOR,
    SVG_STATION_INNER_CIRCLE_STROKE,
    SVG_STATION_OUTER_CIRCLE_STROKE,
    SVG_CONNECTION_STROKE_WIDTH,
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
            startStation: null,                     // Input variable for start station
            endStation: null,                       // Input variable for input end station
            stationNames: [],                       // A collection of metro station names
            stations: [],                           // Array of Station objects
            path: [],                               // Array of station names to show minimum distance path
            pathDistance: null,                     // Variable for mimimum distance
            duration:  null,                        // Variable for measuring time elapsed for algorithm
            selectedAlgorithm: null,                // Variable for algorithm selection
            debugger: null,                         // Logs error in the search panel
            railwayLines: null,                     // Variable for metro line colour mappings
            isVisualisingConnectionOrder: false,
            isVisualisingSelectedPath: false,
            isVisualised: false,
        };
        
        this.metroMap = new MetroMapBackend(
            process.env.PUBLIC_URL + '/data/connections.csv',
            process.env.PUBLIC_URL + '/data/stations.csv',
            process.env.PUBLIC_URL + '/data/railways.csv',
        );
    }

    async componentDidMount() {
        await this.metroMap.parseCSVFiles();
        const names = this.metroMap.getStationNames();
        const stationObjects = this.metroMap.getStationObjects();
        const railwayLinesColourMap = this.metroMap.getMetroLineColours();

        this.setState({
            stationNames: names,
            stations: stationObjects,
            railwayLines: railwayLinesColourMap,
        });
        this.metroMap.visualizeMetroMap(this.metroMapCanvas);
    }

    resetStates() {
        this.setState({
            path: [],
            pathDistance: null,
            duration: null,
            debugger: null,
            isVisualisingConnectionOrder: false,
            isVisualisingSelectedPath: false,
        })
    }

    resetVisualisedConnections() {        
        // Reset connection opacities in MapCanvas
        const connections = { ...this.metroMapCanvas.state.connections };
        Object.keys(connections).forEach((key) => {
            connections[key].state.opacity = SVG_CONNECTION_OPACITY_UNVISITED;  // Set opacity back to default (1)
        });
    }

    handleSearchClick = async () => {
        const { startStation, endStation, selectedAlgorithm } = this.state;

        // Only execute algorithm if all form fields are filled with valid values.
        if (startStation !== null && endStation !== null && selectedAlgorithm !== null) {
            this.resetStates();
            if (this.state.isVisualised) {
                this.resetVisualisedConnections();
                this.setState({ isVisualised: false })
            }            
            
            // Results of executing the algorithm is a nested hashmap: consists results of
            // running each available path-finding algorithm
            const algorithmResults = this.metroMap.executeAlgorithms(startStation, endStation);

            // Update the path, distance and duration states to that of the selected algorithm's
            const selectedAlgorithmResults = algorithmResults[selectedAlgorithm];
            const { distance, path, visitedConnectionsOrder, duration } = selectedAlgorithmResults;
            this.setState({
                path: path,
                pathDistance: distance,
                duration: duration,
                isVisualised: true,
            });

            // Move viewer to start station position on map
            const startStationObj = this.state.stations[startStation];
            this.metroMapCanvas.panToLocation(startStationObj.x, startStationObj.y);
            await this.animateConnections("connectionsOrder", visitedConnectionsOrder, SVG_CONNECTION_OPACITY_VISITED);
            await this.animateConnections("selectedPath", path, SVG_CONNECTION_OPACITY_SELECTED);
        } else {
            this.setDebuggerState();
        }
    };

    setDebuggerState() {
        const { startStation, endStation, selectedAlgorithm } = this.state;
    
        const missingFields = [
            startStation === null ? "Start station" : "",
            endStation === null ? "End station" : "",
            selectedAlgorithm === null ? "Algorithm" : "",
        ];
    
        this.setState({
            debugger: "The following fields are not selected: " + missingFields.filter(Boolean).join(', '),
        });
    }    

    animateConnections = async (type, connectionsOrder, opacity) => {
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        if (type === "connectionsOrder") {
            this.setState({
                isVisualisingConnectionOrder: true,
                isVisualisingSelectedPath: false,
            })
        } else {
            this.setState({
                isVisualisingConnectionOrder: false,
                isVisualisingSelectedPath: true,
            })
        }

        for (let i = 0; i < connectionsOrder.length; i++) {
            const connection = connectionsOrder[i];
            let start, end;
    
            // connectionsOrder can have two possible data types:
            // 1. hashmap (with keys=["start", "end"]); 2.array
            if (type === "connectionsOrder") {  // Hashmap
                [start, end] = [connectionsOrder[i].start, connectionsOrder[i].end]
            } else {    // Array
                start = connection;
                end = connectionsOrder[i + 1];
            }

            const connections = { ...this.metroMapCanvas.state.connections };
            let connectionKey = connections[`${start}-${end}`] ? `${start}-${end}` : `${end}-${start}`;
            if (connections[connectionKey]) {
                connections[connectionKey].state.opacity = opacity;
                this.metroMapCanvas.setState({ connections });
            }
            await delay(VISUALISE_PATH_NODE_DELAY);
        }
    };
    
    generateTravelSegments() {
        const { path } = this.state;
        const travelSegments = [];
        let [prevStart, prevMetroLine, prevStops] = [null, null, 1];
        if (!path) { return null; }

        const processTransit = (prevStops) => {
            travelSegments.push({
                start: prevStart,
                line: prevMetroLine,
                stops: prevStops,
            });
        };

        for (let i = 1; i < path.length; i++) {
            const [start, end] = [path[i - 1], path[i]];
            const connections = { ...this.metroMapCanvas.state.connections };
            const connectionKey = connections[`${start}-${end}`] ? `${start}-${end}` : `${end}-${start}`;
            const metroLines = Array.from(connections[connectionKey].metroLines);

            if (i === 1) {
                prevMetroLine = metroLines[0];
                prevStart = start;
            } else if (metroLines.includes(prevMetroLine)) {
                prevStops += 1;
            } else if (!metroLines.includes(prevMetroLine)) {
                processTransit(prevStops);
                prevMetroLine = metroLines[0];
                prevStart = start;
                prevStops = 1;
            }
        }

        // Call processTransit after the loop to handle the last segment
        processTransit(prevStops);
        travelSegments.push({
            start: path[path.length-1],
            line: null,
            stops: 0,
        });

        return travelSegments;
    }

    renderTravelPlan() {
        const travelSegments = this.generateTravelSegments();
        let [startX, startY] = [10, 10];

        return (
            <svg className="travel-path" height={600}>
                {travelSegments.length !== 0 ? (
                    travelSegments.map((segment, index) => {
                        const updatedStartY = startY + index * 45;
                        return (
                            <g key={index}>
                                {segment.line !== null ? (
                                    <>
                                        <line
                                            key={"a"}
                                            x1={startX}
                                            x2={startX}
                                            y1={updatedStartY}
                                            y2={updatedStartY + 45}
                                            stroke={this.state.railwayLines[segment.line]}
                                            strokeWidth={SVG_CONNECTION_STROKE_WIDTH}
                                        />
                                    </>
                                ) : null}

                                {/* Text for transiting station name */}
                                <text
                                    x={startX + 10}
                                    y={updatedStartY + SVG_STATION_RADIUS - 2}
                                    fontSize={SVG_STATION_NAME_FONT_SIZE}
                                    fill={SVG_STATION_NAME_FONT_COLOR}
                                    textAnchor="start"
                                >
                                    <tspan>{segment.start}</tspan>
                                </text>

                                {/* Text for line and stops */}
                                <text
                                    x={startX + 10}
                                    y={updatedStartY + SVG_STATION_RADIUS * 3.5}
                                    fontSize={SVG_STATION_NAME_FONT_SIZE}
                                    fill={SVG_STATION_NAME_FONT_COLOR}
                                    textAnchor="start"
                                >
                                    <tspan>{segment.line}</tspan>
                                    {segment.stops !== 0 ? (
                                        <tspan>
                                            {" (" + segment.stops + " stop" + (segment.stops > 1 ? "s" : "") + ")"}
                                        </tspan>
                                    ) : null}
                                </text>

                                {/* Circles for station */}
                                <circle cx={startX} cy={updatedStartY} r={SVG_STATION_RADIUS} fill={SVG_STATION_OUTER_CIRCLE_STROKE} />
                                <circle cx={startX} cy={updatedStartY} r={SVG_STATION_RADIUS - 2} fill={SVG_STATION_INNER_CIRCLE_STROKE} />
                            </g>

                        );
                    })
                ) : null}
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
                                onChange={(selectedOption) => this.setState({ startStation: selectedOption ? selectedOption.value : "" })}
                                placeholder="Select Start Station"
                                isSearchable
                                styles={customStyles}
                            />
                        </div>
                        <div className="search-box-end-station">
                            <Select
                                options={this.state.stationNames.map((station) => ({ value: station, label: station }))}
                                onChange={(selectedOption) => this.setState({ endStation: selectedOption ? selectedOption.value : "" })}
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
                        <summary>Upon entering all fields, the planner will perform the following:</summary>
                        <ol>
                            <li>Visualize the order of exploring station connections, starting from stations
                            around the starting station. <b>Connections will have increased opacity</b>.</li>
                            <li>Visualize the selected path, <b>with 100% opacity</b>.</li>
                        </ol>
                    </details>
                    <br></br>
                    <details>
                        <summary>Notes:</summary>
                        <ol>
                            <li>The aim of this planner is to find and visualize the <b>shortest distance path</b>
                            , not the shortest duration path.</li>
                            <li>The planner assumes that:</li>
                            <ul>
                                <li>Waiting times between station transits are neglible.</li>
                                <li>All metro lines are always available (i.e. not real-time).</li>
                            </ul>
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
                        { this.state.isVisualisingConnectionOrder ? <p>Exploring connections...</p> : null }
                    </div>
                    <div className="visualisation-status">
                        { this.state.isVisualisingSelectedPath ? <p>Visualised optimal path.</p> : null }
                    </div>
                    <br></br>
                    <div className="search-results">
                        {
                            this.state.duration !== null &&
                            <div className="time-analysis">
                                <h2>Time analysis</h2>
                                <p>Time elapsed: {this.state.duration.toFixed(3)}s</p>
                            </div>
                        }
                        {
                            this.state.pathDistance !== null &&
                            <p>Distance: {this.state.pathDistance.toFixed(3)}km</p>
                        }
                        {
                            this.state.path.length !== 0 &&
                            this.renderTravelPlan()
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