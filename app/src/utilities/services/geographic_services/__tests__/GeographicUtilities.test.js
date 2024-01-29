import GeoUtilities from "../GeographicUtilities";
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

    test('geographicToCartesianCoordinates() should return array', () => {
        const result = GeoUtilities.geographicToCartesianCoordinates(lat, lon);
        expect(Array.isArray(result)).toBe(true);
    });

    test('geographicToCartesianCoordinates() should calculate x and y with correct formula', () => {
        const result = GeoUtilities.geographicToCartesianCoordinates(lat, lon);
        var a = EARTH_RADIUS * Math.cos(lat);
        const expectedX = Math.round(a * Math.sin(lon) + SVG_MAP_SHIFT_X) * SVG_MAP_SCALE_X;
        const expectedY = Math.round(a * Math.cos(lon) + SVG_MAP_SHIFT_Y) * SVG_MAP_SCALE_Y;
        expect(result[0]).toEqual(expectedX);
        expect(result[1]).toEqual(expectedY);
    });

    test('toRadians() should return float', () => {
        const result = GeoUtilities.toRadians(160);
        expect(typeof result).toEqual('number');
    });

    test('calculateDistance() should return float', () => {
        const result = GeoUtilities.calculateDistance(lat, lon, lat2, lon2);
        expect(typeof result).toEqual('number');
    });

    test('calculateDistance() should return correct distance between two points', () => {
        const result = GeoUtilities.calculateDistance(lat, lon, lat2, lon2);

        var deltaLat = GeoUtilities.toRadians(lat2-lat);
        var deltaLon = GeoUtilities.toRadians(lon2-lon);
        var latCopy = GeoUtilities.toRadians(lat);
        var lat2Copy = GeoUtilities.toRadians(lat2);
        var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2) * Math.cos(latCopy) * Math.cos(lat2Copy); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var expectedDistance = EARTH_RADIUS * c;
        expect(result).toEqual(expectedDistance);
    });
});