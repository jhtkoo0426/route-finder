import { SVG_MAP_SHIFT_X, SVG_MAP_SHIFT_Y, SVG_STATION_NAME_LINE_MAX_CHARS, EARTH_RADIUS } from "../Constants";


class Station {
    constructor(name, lat, lon) {
        this.name = name;
        this.trunicatedName = this.transformStationName();
        this.lat = lat;
        this.lon = lon;
        [this.x, this.y] = this.calculateXY(this.lat, this.lon);

        // neighbours is an adjacency list of neighbouring stations relative to this
        // station. The keys are station names of the neighbouring stations, and the
        // values are hashmaps which contain 2 values: distance between this station
        // and the neighbour station, as well as a list of all metro lines that
        // connect bewteen these stations.
        this.neighbours = {};
    }

    addNeighbour(station, metroLineName) {
        const [stationName, stationLat, stationLon] = [station.name, station.lat, station.lon];
        
        if (stationName in this.neighbours) {
            this.neighbours[stationName].lines.add(metroLineName);
        } else {
            this.neighbours[stationName] = {
                distance: this.calculateDistance(this.lat, this.lon, stationLat, stationLon),
                lines: new Set([metroLineName]),
            };
        }        
    }

    calculateXY(lat, lon) {
        var a = EARTH_RADIUS * Math.cos(lat);
        var x = Math.round(a * Math.sin(lon) + SVG_MAP_SHIFT_X) * 4;
        var y = Math.round(a * Math.cos(lon) + SVG_MAP_SHIFT_Y) * 4;
        return [x, y];
    }

    toRad(x) {
        return Math.PI * x / 180;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        var dLat = this.toRad(lat2-lat1);
        var dLon = this.toRad(lon2-lon1);
        lat1 = this.toRad(lat1);
        lat2 = this.toRad(lat2);

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = EARTH_RADIUS * c;
        return d;
    }

    transformStationName() {
        const words = this.name.split(' ');
        let currentLineLength = 0;
        let result = '';

        for (const word of words) {
            if (currentLineLength + word.length > SVG_STATION_NAME_LINE_MAX_CHARS) {
                result += '\n';
                currentLineLength = word.length + 1;
            } else {
                currentLineLength += word.length + 1;
            }
            result += word + ' ';
        }
        return result.trim();
    }
}

export default Station;