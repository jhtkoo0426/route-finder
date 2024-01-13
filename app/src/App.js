import React, { Component } from "react";
import Select from "react-select";
import MetroMapBackend from "./utilities/MetroMapBackend";
import MapCanvas from "./utilities/map/MapCanvas";
import "./css/app.css";


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
            debugger:       "",         // Logs error in the search panel
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
        this.setState({ stationNames: names });
        this.metroMap.visualizeMetroMap(this.metroMapCanvas);
    }

    handleSearchClick = async () => {
        const { startStation, endStation, algorithm } = this.state;
        console.log(startStation, endStation, algorithm);
        if (startStation !== null && endStation !== null && algorithm !== null) {
            const result = this.metroMap.findPath(startStation, endStation, algorithm);
            this.setState({
                path: result.path,
                pathDistance: result.distance,
                debugger: ""
            });
        } else {
            this.setState({
                debugger: "The following fields are not selected: " + 
                  (startStation === null ? "Start station, " : "") +
                  (endStation === null ? "End station, " : "") +
                  (algorithm === null ? "Algorithm, " : "")
            })              
        }
    };

    render() {
        const { startStation, endStation, stationNames, path, pathDistance } = this.state;

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
                                options={['Dijkstra', 'Test'].map((algo) => ({value: algo, label: algo }))}
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
                        {this.state.debugger !== "" ? <p>{this.state.debugger}</p> : <div></div>}
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
                <div className="metro-map-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
                    <MapCanvas ref={(mapCanvas) => (this.metroMapCanvas = mapCanvas)}/>
                </div>
            </div>
        );
    }
}


export default App;