// Constants
import { SVG_STATION_NAME_LINE_MAX_CHARS } from "../Constants";

// Utilities
import GeoUtilities from "../services/geographic_services/GeographicUtilities";



// Represents a physical metro station.
class Station {
    constructor(name, lat, lon) {
        this.name = name;
        this.transformedName = this.transformStationName();
        this.lat = lat;
        this.lon = lon;
        [this.x, this.y] = this.calculateXYCoordinates(lat, lon);
    }

    calculateXYCoordinates(lat, lon) {
        return GeoUtilities.geographicToCartesianCoordinates(lat, lon);
    }

    getDistance(lat1, lon1, lat2, lon2) {
        return GeoUtilities.calculateDistance(lat1, lon1, lat2, lon2);
    }

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