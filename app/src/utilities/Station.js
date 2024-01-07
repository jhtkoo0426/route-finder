class Station {
    constructor(name, lat, lng) {
        this.name = name;
        this.lat = lat;
        this.lng = lng;
        this.neighbours = {};

        const R = 6371; // Earth's radius in km
        const latRad = this.toRad(this.lat);
        const lngRad = this.toRad(this.lng);

        this.x = (R * lngRad) * 6 + 1000;
        this.y = (R * Math.log(Math.tan(Math.PI / 4 + latRad / 2)) - 6500) * 5;

        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }

    addNeighbour(station) {
        const [stationName, stationLat, stationLng] = [station.name, station.lat, station.lng];
        this.neighbours[stationName] = this.calculateDistance(this.lat, this.lng, stationLat, stationLng);
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