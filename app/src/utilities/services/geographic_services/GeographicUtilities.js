import {
    SVG_MAP_SHIFT_X,
    SVG_MAP_SHIFT_Y,
    SVG_MAP_SCALE_X,
    SVG_MAP_SCALE_Y,
    EARTH_RADIUS
} from "../../Constants";



// Performs geographic calculations such as translating geographic to Cartesian
// coordinates, finding distances between points, etc.
class GeographicUtilities {
    // @params {float} lat
    // @params {float} lon
    // @returns {Array}
    static geographicToCartesianCoordinates(lat, lon) {
        var a = EARTH_RADIUS * Math.cos(lat);
        var x = Math.round(a * Math.sin(lon) + SVG_MAP_SHIFT_X) * SVG_MAP_SCALE_X;
        var y = Math.round(a * Math.cos(lon) + SVG_MAP_SHIFT_Y) * SVG_MAP_SCALE_Y;
        return [x, y];
    }

    // @params {float} x
    // @returns {float}
    static toRadians(x) {
        return Math.PI * x / 180;
    }

    // @params {float} lat1
    // @params {float} lon1
    // @params {float} lat2
    // @params {float} lon2
    // @returns {float} distance
    static calculateDistance(lat1, lon1, lat2, lon2) {
        var deltaLat = this.toRadians(lat2-lat1);
        var deltaLon = this.toRadians(lon2-lon1);
        lat1 = this.toRadians(lat1);
        lat2 = this.toRadians(lat2);

        var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var distance = EARTH_RADIUS * c;
        return distance;
    }
}


export default GeographicUtilities;