import { SVG_CONNECTION_OPACITY_UNVISITED } from "../Constants";



// Represents a physical connection between two Station instances.
class Connection {
    constructor(startStation, endStation) {
        this.startStation = startStation;
        this.endStation = endStation;

        // Tracks all unique metro lines that go through startStation to endStation
        this.connectedMetroLines = new Set();
        this.state = {
            opacity: SVG_CONNECTION_OPACITY_UNVISITED,
        };
    }

    // @params {String} metroLineName
    addMetroLine(metroLineName) {
        this.connectedMetroLines.add(metroLineName);
    }

    getMetroLinesArray() {
        return Array.from(this.connectedMetroLines);
    }

    getMetroLinesCount() {
        return this.connectedMetroLines.size;
    }
}


export default Connection;