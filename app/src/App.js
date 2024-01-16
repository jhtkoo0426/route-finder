import React, { Component } from "react";
import Select from "react-select";
import MetroMapBackend from "./utilities/MetroMapBackend";
import MapCanvas from "./utilities/map/MapCanvas";
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
            startStation:   null,       // Variable for input start station
            endStation:     null,       // Variable for input end station
            stationNames:   [],         // A collection of metro station names
            path:           [],         // Variable to display minimum-distance path
            pathDistance:   null,       // Variable to display mimimum distance
            algorithm:      null,       // Variable for algorithm selection
            debugger:       null,         // Logs error in the search panel
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
        this.setState({
            stationNames: names,
        });
        this.metroMap.visualizeMetroMap(this.metroMapCanvas);
    }

    handleSearchClick = async () => {
        const { startStation, endStation, algorithm } = this.state;
        
        // Only execute algorithm if all form fields are filled with valid values.
        if (startStation !== null && endStation !== null && algorithm !== null) {
            // Results of executing the algorithm is a hashmap
            const { distance, path, visitedConnectionsOrder } = this.metroMap.executeAlgorithm(startStation, endStation, algorithm);
            this.setState({
                path: path,
                pathDistance: distance,
                debugger: null,
            });
            await this.animateVisitedConnectionsOrder(visitedConnectionsOrder);
            await this.animateSelectedPath(path);
        } else {
            this.setDebuggerState();
        }
    };

    setDebuggerState() {
        const { startStation, endStation, algorithm } = this.state;
        this.setState({
            debugger:
                "The following fields are not selected: " +
                (startStation === null ? "Start station, " : "") +
                (endStation === null ? "End station, " : "") +
                (algorithm === null ? "Algorithm, " : ""),
        });
    }

    animateVisitedConnectionsOrder = async (visitedConnectionsOrder) => {
        // Apply a delay function to each visited connection
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    
        for (let i = 0; i < visitedConnectionsOrder.length; i++) {
            const { start, end } = visitedConnectionsOrder[i];
            let connectionKey = `${start}-${end}`;
            const connections = { ...this.metroMapCanvas.state.connections };
            if (!connections[connectionKey]) {
                connectionKey = `${end}-${start}`;
            }
            connections[connectionKey].state.opacity = SVG_CONNECTION_OPACITY_VISITED;
            this.metroMapCanvas.setState({ connections });
            await delay(VISUALISE_PATH_NODE_DELAY);
        }
    }

    animateSelectedPath = async (selectedPath) => {
        // Apply a delay function to each visited connection
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        for (let i = 0; i < selectedPath.length-1; i++) {
            const start = selectedPath[i];
            const end = selectedPath[i+1];
            let connectionKey = `${start}-${end}`;
            const connections = { ...this.metroMapCanvas.state.connections };
            if (!connections[connectionKey]) {
                connectionKey = `${end}-${start}`;
            }
            console.log(connectionKey);
            if (connections[connectionKey]) {
                connections[connectionKey].state.opacity = SVG_CONNECTION_OPACITY_SELECTED;
                this.metroMapCanvas.setState({ connections });
            }
            await delay(VISUALISE_PATH_NODE_DELAY);
        }
    }
    
    render() {
        const { stationNames, path, pathDistance } = this.state;

        return (
            <div className="App">
                <div className="search-panel">
                    <h1>Route Planner</h1>
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
                    <div className="debugger">
                        {this.state.debugger !== null ? <p>{this.state.debugger}</p> : <div></div>}
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
                    <MapCanvas
                        ref={(mapCanvas) => (this.metroMapCanvas = mapCanvas)}
                    />
                </div>
            </div>
        );
    }
}


export default App;