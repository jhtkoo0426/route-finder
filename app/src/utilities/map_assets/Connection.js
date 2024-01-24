import { SVG_CONNECTION_OPACITY_UNVISITED } from "../Constants";



// Represents a physical connection between two Station instances.
class Connection {
    constructor(startStation, endStation) {
        this.startStation = startStation;
        this.endStation = endStation;
        this.metroLines = new Set();
        this.state = {
            opacity: SVG_CONNECTION_OPACITY_UNVISITED,
        };
    }

    addMetroLine(metroLineName) {
        this.metroLines.add(metroLineName);
    }
}


export default Connection;