import StationCSVParser from '../StationCSVParser';


describe('StationCSVParser.js tests', () => {
    const filePath = 'test.csv';
    let csvParser;

    beforeEach(() => {
        csvParser = new StationCSVParser(filePath);
    })

    it('should parse dummy CSV file correctly', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('station1,51.02412,0.62928'),
            })
        );

        const result = await csvParser.parse();

        expect(global.fetch).toHaveBeenCalledWith(filePath);
        expect(result).toBeInstanceOf(Map);
        expect(Object.entries(result).length).toBe(1);
    });
});