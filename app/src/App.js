import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import MetroMap from "./utilities/MetroMap";
import "./App.css"; // Import your CSS file for styling

// React-select styling
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    border: '1px solid #ccc', // customize the border
    borderRadius: '4px', // customize the border radius
    boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 123, 255, 0.6)' : null,
    fontFamily: 'Inter',
    fontSize: '14px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#007bff' : null,
    color: state.isSelected ? 'white' : 'black',
    fontFamily: 'Inter',
    fontSize: '14px',
  }),
};


function App() {
  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");
  const [stationnames, setStationNames] = useState([]);
  const [path, setPath] = useState([]);
  const [pathDistance, setPathDistance] = useState([]);
  const metroMap = new MetroMap(
    "London",
    process.env.PUBLIC_URL + '/data/londonstations.csv',
    process.env.PUBLIC_URL + '/data/londonrailwaylines.csv'
  );

  useEffect(() => {
    const fetchData = async () => {
      await metroMap.parseAssets();
      const names = metroMap.getStationNames();
      setStationNames(names);
    };

    fetchData();
  }, []); // Run only once when component mounts

  const canvasRef = useRef(null);
  const testRef = useRef(null);

  const handleSearchClick = async () => {
    console.log(startStation, endStation);
    await metroMap.parseAssets();
    var result = metroMap.searchPath(startStation, endStation);
    setPath(result.path);
    setPathDistance(result.distance);
  };

  return (
    <div className="App">
      <div className="menu">
        <div className="search-box-start-station">
          <Select
            options={stationnames.map(station => ({ value: station, label: station }))}
            onChange={(selectedOption) => setStartStation(selectedOption ? selectedOption.value : "")}
            placeholder="Select Start Station"
            isSearchable
            styles={customStyles}
            ref={testRef}
          />
        </div>
        <div className="search-box-end-station">
          <Select
            options={stationnames.map(station => ({ value: station, label: station }))}
            onChange={(selectedOption) => setEndStation(selectedOption ? selectedOption.value : "")}
            placeholder="Select End Station"
            isSearchable
            styles={customStyles}
          />
        </div>
        <button onClick={handleSearchClick}>Search</button>
      </div>
      <div>
        <h2>Path:</h2>
        <ul>
          {path.map((station, index) => (
            <li key={index}>{station}</li>
          ))}
        </ul>
        {pathDistance}
      </div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
