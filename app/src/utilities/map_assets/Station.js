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

        // Adjacency list with station names as keys and distances as values.
        this.adjacentNeighbours = new Map();
    }

    addAdjacentNeighbour(neighbourStation) {
        const neighbourStationName = neighbourStation.name;

        if (!this.isNeighbour(neighbourStationName)) {
            const neighbourLat = neighbourStation.lat;
            const neighbourLon = neighbourStation.lon;
            this.adjacentNeighbours.set(
                neighbourStationName,
                this.getDistance(this.lat, this.lon, neighbourLat, neighbourLon)
            );
        }
    }

    isNeighbour(neighbourStationName) {
        return this.adjacentNeighbours.has(neighbourStationName);
    }

    getNeighbourDistance(neighbourName) {
        return this.adjacentNeighbours.get(neighbourName);
    }

    getAdjacentNeighboursNames() {
        return Array.from(this.adjacentNeighbours.keys());
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