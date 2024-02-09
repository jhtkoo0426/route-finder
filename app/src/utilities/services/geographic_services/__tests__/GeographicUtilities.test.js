import GeographicUtilities from "../GeographicUtilities";
import {
    SVG_MAP_SHIFT_X,
    SVG_MAP_SHIFT_Y,
    SVG_MAP_SCALE_X,
    SVG_MAP_SCALE_Y,
    EARTH_RADIUS
} from "../../../Constants";

describe('GeographicUtilities.js tests', () => {
    let [lat, lon] = [51.0, 0.25];
    let [lat2, lon2] = [55.2, -0.86];

    it('geographicToCartesianCoordinates() should return array', () => {
        const result = GeographicUtilities.geographicToCartesianCoordinates(lat, lon);
        expect(Array.isArray(result)).toBe(true);
    });

    it('geographicToCartesianCoordinates() should calculate x and y with correct formula', () => {
        const result = GeographicUtilities.geographicToCartesianCoordinates(lat, lon);
        var a = EARTH_RADIUS * Math.cos(lat);
        const expectedX = Math.round(a * Math.sin(lon) + SVG_MAP_SHIFT_X) * SVG_MAP_SCALE_X;
        const expectedY = Math.round(a * Math.cos(lon) + SVG_MAP_SHIFT_Y) * SVG_MAP_SCALE_Y;
        expect(result[0]).toEqual(expectedX);
        expect(result[1]).toEqual(expectedY);
    });

    it('toRadians() should return float', () => {
        const result = GeographicUtilities.toRadians(160);
        expect(typeof result).toEqual('number');
    });

    it('calculateDistance() should return float', () => {
        const result = GeographicUtilities.calculateDistance(lat, lon, lat2, lon2);
        expect(typeof result).toEqual('number');
    });

    it('calculateDistance() should return correct distance between two points', () => {
        const result = GeographicUtilities.calculateDistance(lat, lon, lat2, lon2);

        var deltaLat = GeographicUtilities.toRadians(lat2-lat);
        var deltaLon = GeographicUtilities.toRadians(lon2-lon);
        var latCopy = GeographicUtilities.toRadians(lat);
        var lat2Copy = GeographicUtilities.toRadians(lat2);
        var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2) * Math.cos(latCopy) * Math.cos(lat2Copy); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var expectedDistance = EARTH_RADIUS * c;
        expect(result).toEqual(expectedDistance);
    });
});