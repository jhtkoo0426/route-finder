import RailwaysCSVParser from '../RailwaysCSVParser';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('MetroLine1,Red\nMetroLine2,Blue\nMetroLine3,Green'),
    statusText: 'OK',
  })
);

describe('RailwaysCSVParser', () => {
    let railwaysParser;

    beforeEach(() => {
        railwaysParser = new RailwaysCSVParser('mockedFilePath.csv');
    });

    it('should parse railway lines correctly', async () => {
        const parsedRailways = await railwaysParser.parse();

        expect(parsedRailways).toBeInstanceOf(Map);
        expect(parsedRailways.size).toBe(3);

        expect(parsedRailways.get('MetroLine1')).toBe('Red');
        expect(parsedRailways.get('MetroLine2')).toBe('Blue');
        expect(parsedRailways.get('MetroLine3')).toBe('Green');
    });

    it('should log a message when all railways are parsed', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await railwaysParser.parse();

        expect(consoleLogSpy).toHaveBeenCalledWith('All railways parsed');

        consoleLogSpy.mockRestore();
    });
});