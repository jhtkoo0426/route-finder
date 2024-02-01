import Station from '../Station';

describe('Station.js tests', () => {
    it('calculateXYCoordinates() returns an array', () => {
        const station = new Station('Test Station', 40.7128, -74.0060);
        const coordinates = station.calculateXYCoordinates(40.7128, -74.0060);
        expect(Array.isArray(coordinates)).toBe(true);
    });

    it('getDistance() returns a number', () => {
        const station = new Station('Test Station', 40.7128, -74.0060);
        const distance = station.getDistance(40.7128, -74.0060, 41.8781, -87.6298);
        expect(typeof distance).toBe('number');
    });

    it('transformStationName() transforms station name', () => {
        const station = new Station('Long Station Name That Exceeds Max Chars Limit', 40.7128, -74.0060);
        const transformedName = station.transformStationName('Long Station Name That Exceeds Max Chars Limit');
        expect(typeof transformedName).toBe('string');
        expect(transformedName).toEqual('Long Station\nName That\nExceeds Max\nChars Limit');
    });
});