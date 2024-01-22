// Constants
import { SVG_STATION_NAME_LINE_MAX_CHARS } from "../Constants";

// Utilities
import GeoUtilities from "../services/GeoUtils";



// Represents a physical metro station.
class Station {
    constructor(name, lat, lon) {
        this.name = name;
        this.trunicatedName = this.transformStationName();
        this.lat = lat;
        this.lon = lon;
        [this.x, this.y] = this.geographicToCartesianCoordinates(this.lat, this.lon);

        // neighbours is an adjacency list of neighbouring stations relative to this
        // station. The keys are station names of the neighbouring stations, and the
        // values are hashmaps which contain 2 values: distance between this station
        // and the neighbour station, as well as a list of all metro lines that
        // connect bewteen these stations.
        this.neighbours = new Map();
    }

    addNeighbour(station, metroLineName) {
        const { name, lat, lon } = station;

        if (name in this.neighbours) {
            this.neighbours[name].lines.add(metroLineName);
        } else {
            this.neighbours[name] = {
                distance: this.calculateDistance(this.lat, this.lon, lat, lon),
                lines: new Set([metroLineName]),
            };
        }
    }

    geographicToCartesianCoordinates(lat, lon) {
        return GeoUtilities.geographicToCartesianCoordinates(lat, lon);
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        return GeoUtilities.calculateDistance(lat1, lon1, lat2, lon2);
    }

    transformStationName() {
        const words = this.name.split(' ');
        let result = words.reduce((acc, word) => {
            if (acc.length === 0 || acc[acc.length - 1].length + word.length > SVG_STATION_NAME_LINE_MAX_CHARS) {
                acc.push(word);
            } else {
                acc[acc.length - 1] += ` ${word}`;
            }
            return acc;
        }, []);

        return result.join('\n');
    }
}


export default Station;