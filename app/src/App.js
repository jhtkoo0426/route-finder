import React, { Component } from "react";
import Select from "react-select";
import MetroMapBackend from "./utilities/MetroMapBackend";
import MapCanvas from "./utilities/map/MapCanvas";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import "./css/app.css";

import {
    SVG_CONNECTION_OPACITY_VISITED,
    SVG_CONNECTION_OPACITY_SELECTED,
    VISUALISE_PATH_NODE_DELAY
} from "./utilities/Constants";

// React-select styling
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
            startStation:   null,                   // Input variable for start station
            endStation:     null,                   // Input variable for input end station
            stationNames:   [],                     // A collection of metro station names
            stations:       [],                     // Array of Station objects
            path:           [],                     // Array of station names to show minimum distance path
            pathDistance:   null,                   // Variable for mimimum distance
            algorithm:      null,                   // Variable for algorithm selection
            debugger:       null,                   // Logs error in the search panel
            isVisualisingConnectionOrder: false,
            isVisualisingSelectedPath: false,
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
        this.setState({
            stationNames: names,
            stations: stationObjects,
        });
        this.metroMap.visualizeMetroMap(this.metroMapCanvas);
    }

    resetStates() {
        this.setState({
            path: [],
            pathDistance: null,
            debugger: null,
            isVisualisingConnectionOrder: false,
            isVisualisingSelectedPath: false,
        })
    }

    handleSearchClick = async () => {
        const { startStation, endStation, algorithm } = this.state;
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        // Only execute algorithm if all form fields are filled with valid values.
        if (startStation !== null && endStation !== null && algorithm !== null) {
            this.resetStates();

            // Results of executing the algorithm is a hashmap
            const { distance, path, visitedConnectionsOrder } = this.metroMap.executeAlgorithm(startStation, endStation, algorithm);
            this.setState({
                path: path,
                pathDistance: distance,
            })

            // Move viewer to start station position on map
            const startStationObj = this.state.stations[startStation];
            this.metroMapCanvas.panToLocation(startStationObj.x, startStationObj.y);
            await delay(1000);
            await this.animateConnections("connectionsOrder", visitedConnectionsOrder, SVG_CONNECTION_OPACITY_VISITED);
            await this.animateConnections("selectedPath", path, SVG_CONNECTION_OPACITY_SELECTED);
        } else {
            this.setDebuggerState();
        }
    };

    setDebuggerState() {
        const { startStation, endStation, algorithm } = this.state;
    
        const missingFields = [
            startStation === null ? "Start station" : "",
            endStation === null ? "End station" : "",
            algorithm === null ? "Algorithm" : "",
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
    
    render() {
        const { stationNames, path, pathDistance } = this.state;

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
                    <p>An interactive journey planner for transporting via metro in major cities.
                        To use this planner, select a starting, ending station, and a path-finding 
                        algorithm from the dropdowns.
                    </p>
                    <br></br>
                    <div className="search-menu">
                        <div className="search-box-start-station">
                            <Select
                                options={stationNames.map((station) => ({ value: station, label: station }))}
                                onChange={(selectedOption) => this.setState({ startStation: selectedOption ? selectedOption.value : "" })}
                                placeholder="Select Start Station"
                                isSearchable
                                styles={customStyles}
                            />
                        </div>
                        <div className="search-box-end-station">
                            <Select
                                options={stationNames.map((station) => ({ value: station, label: station }))}
                                onChange={(selectedOption) => this.setState({ endStation: selectedOption ? selectedOption.value : "" })}
                                placeholder="Select End Station"
                                isSearchable
                                styles={customStyles}
                            />
                        </div>
                        <div className="search-box-algorithm">
                            <Select
                                options={['Dijkstra'].map((algo) => ({value: algo, label: algo }))}
                                onChange={(algorithmOption) => this.setState({ algorithm: algorithmOption })}
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
                    <p>Upon entering all fields, the planner will perform the following:</p>
                    <ol>
                        <li>Visualize the order of exploring station connections, starting from stations
                        around the starting station.</li>
                        <li>Visualize the selected path.</li>
                    </ol>
                    <br></br>
                    <p>Notes:</p>
                        <ol>
                            <li>The aim of this planner is to find and visualize the <b>shortest distance path</b>
                                , not the shortest duration path.</li>
                            <li>The planner assumes that:</li>
                            <ul>
                                <li>Waiting times between station transits are neglible.</li>
                                <li>All metro lines are always available (i.e. not real-time).</li>
                            </ul>
                        </ol>
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
                        <h2>Path:</h2>
                            <ul>
                            {path.map((station, index) => (
                                <li key={index}>{station}</li>
                            ))}
                        </ul>
                        {pathDistance !== null && <p>{pathDistance}</p>}
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