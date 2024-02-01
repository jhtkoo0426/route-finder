import StationGeoUtils from "../StationGeographicUtilities";
import Station from "../../../map_assets/Station";


describe('StationGeographicUtilities.js tests', () => {
    let lat, lon, lat2, lon2, stationA, stationB;

    beforeEach(() => {
        lat = 51.0;
        lon = 0.25;
        lat2 = 55.2;
        lon2 = -0.86;

        stationA = new Station("A", lat, lon);
        stationB = new Station("B", lat2, lon2);
    });

    it('geographicToCartesianCoordinates() should return array', () => {
        const result = StationGeoUtils.geographicToCartesianCoordinates(stationA);
        expect(Array.isArray(result)).toBe(true);
    });

    it('calculateDistance() should return float', () => {
        const result = StationGeoUtils.calculateDistance(stationA, stationB);
        expect(typeof result).toEqual('number');
    });
});
