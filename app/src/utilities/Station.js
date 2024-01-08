class Station {
    constructor(name, lat, lon) {
        this.name = name;
        this.lat = lat;
        this.lon = lon;
        this.neighbours = {};   // Nested hashmap

        const R = 6371;
        
        // TODO: Bad practice for adding constants
        this.x = R * Math.cos(this.lat) * Math.sin(this.lon) + 2000;
        this.y = R * Math.cos(this.lat) * Math.cos(this.lon) - 500;

        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
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

    toRad(x) {
        return Math.PI * x / 180;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = this.toRad(lat2-lat1);
        var dLon = this.toRad(lon2-lon1);
        lat1 = this.toRad(lat1);
        lat2 = this.toRad(lat2);

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c;
        return d;
    }
}

export default Station;