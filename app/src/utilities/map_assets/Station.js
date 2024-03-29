// Constants
import { SVG_STATION_NAME_LINE_MAX_CHARS } from "../Constants";

// Utilities
import GeographicUtilities from "../services/geographic_services/GeographicUtilities";



// Represents a physical metro station.
class Station {
    constructor(name, lat, lon) {
        this.name = name;
        this.fittedName = this.transformStationName();
        this.lat = lat;
        this.lon = lon;
        [this.x, this.y] = this.calculateXYCoordinates(lat, lon);
    }

    // @params {float} lat
    // @params {float} lon
    // @returns {Array}
    calculateXYCoordinates(lat, lon) {
        return GeographicUtilities.geographicToCartesianCoordinates(lat, lon);
    }

    // @params {float} lat1
    // @params {float} lon1
    // @params {float} lat2
    // @params {float} lon2
    // @returns {float}
    getDistance(lat1, lon1, lat2, lon2) {
        return GeographicUtilities.calculateDistance(lat1, lon1, lat2, lon2);
    }

    // @params {string} stationName
    // @returns {string}
    transformStationName() {
        const words = this.name.split(' ');
        return words.reduce((lines, word) => {
            const lastLine = lines[lines.length - 1];
            if (!lastLine || lastLine.length + word.length > SVG_STATION_NAME_LINE_MAX_CHARS) {
                lines.push(word);
            } else {
                lines[lines.length - 1] += ` ${word}`;
            }
            return lines;
        }, []).join('\n');
    }
}


export default Station;