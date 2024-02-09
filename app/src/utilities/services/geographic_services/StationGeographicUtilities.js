// Utilities
import GeographicUtilities from "./GeographicUtilities";



// Performs geographic calculations for Station objects.
class StationGeographicUtilities extends GeographicUtilities {
    // @params {Station} stationObject
    // @returns {Array}
    static geographicToCartesianCoordinates(stationObject) {
        let [lat, lon] = [stationObject.lat, stationObject.lon];
        return super.geographicToCartesianCoordinates(lat, lon);
    }

    // @params {Station} startStationObject
    // @params {Station} endStationObject
    // @returns {float}
    static calculateDistance(startStationObject, endStationObject) {
        let [lat1, lon1] = [startStationObject.lat, startStationObject.lon];
        let [lat2, lon2] = [endStationObject.lat, endStationObject.lon];
        // Utilize the inherited method from the base class
        return super.calculateDistance(lat1, lon1, lat2, lon2);
    }
}


export default StationGeographicUtilities;