import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import MetroMap from "./utilities/MetroMap";
import "./App.css"; // Import your CSS file for styling

function App() {
  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");
  const [stationnames, setStationNames] = useState([]);
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);

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

  const handleSearchClick = async () => {
    await metroMap.parseAssets();
    var result = metroMap.searchPath(startStation, endStation);
    console.log(result.distance);
    console.log(result.path);
  };

  return (
    <div className="App">
      <div className="menu">
        <div className="search-box-start-station">
          <Select
            options={stationnames.map(station => ({ value: station, label: station }))}
            value={{ value: startStation, label: startStation }}
            onChange={(selectedOption) => setStartStation(selectedOption.value)}
            placeholder="Select Start Station"
            isSearchable
          />
        </div>
        <div className="search-box-end-station">
          <Select
            options={stationnames.map(station => ({ value: station, label: station }))}
            value={{ value: endStation, label: endStation }}
            onChange={(selectedOption) => setEndStation(selectedOption.value)}
            placeholder="Select End Station"
            isSearchable
          />
        </div>
        <div></div>
        <button onClick={handleSearchClick}>Search</button>
      </div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
