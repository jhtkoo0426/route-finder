import { useRef } from "react";
import MetroMap from "./utilities/MetroMap";


function App() {
  // Initialize a MetroMap object
  const metroMap = new MetroMap(
    "London",
    process.env.PUBLIC_URL + '/data/londonstations.csv',
    process.env.PUBLIC_URL + '/data/londonrailwaylines.csv'
  );
  metroMap.visualize();

  // Initialize a canvas for creating the metro map
  const canvasRef = useRef(null);

  return (
    <div className="App">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
