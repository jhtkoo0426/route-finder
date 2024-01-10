import React, { Component } from "react";
import Select from "react-select";
import MetroMapBackend from "./utilities/MetroMapBackend";
import MapCanvas from "./utilities/MapCanvas";
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

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            startStation: "",
            endStation: "",
            stationnames: [],
            path: [],
            pathDistance: null,
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
        this.setState({ stationnames: names });
        this.metroMap.visualizeMetroMap(this.metroMapCanvas);
    }

    handleSearchClick = async () => {
        await this.metroMap.parseCSVFiles();

        const { startStation, endStation } = this.state;
        if (startStation !== "" && endStation !== "") {
            const result = this.metroMap.searchPath(startStation, endStation);
            this.setState({
                path: result.path,
                pathDistance: result.distance,
            });
            } else {
            console.log("Starting or ending station is not selected.");
        }
    };

    render() {
        const { startStation, endStation, stationnames, path, pathDistance } = this.state;

        return (
            <div className="App">
                <div className="search-panel">
                <h1>Route Planner</h1>
                <div className="search-menu">
                    <div className="search-box-start-station">
                    <Select
                        options={stationnames.map((station) => ({ value: station, label: station }))}
                        onChange={(selectedOption) => this.setState({ startStation: selectedOption ? selectedOption.value : "" })}
                        placeholder="Select Start Station"
                        isSearchable
                        styles={customStyles}
                    />
                    </div>
                    <div className="search-box-end-station">
                    <Select
                        options={stationnames.map((station) => ({ value: station, label: station }))}
                        onChange={(selectedOption) => this.setState({ endStation: selectedOption ? selectedOption.value : "" })}
                        placeholder="Select End Station"
                        isSearchable
                        styles={customStyles}
                    />
                    </div>
                    <button onClick={this.handleSearchClick} className="search-btn">
                    Search
                    </button>
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
