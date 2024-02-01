import RailwayCSVParser from '../RailwayCSVParser';


describe('RailwayCSVParser.js tests', () => {
    const filePath = 'test.csv';
    let csvParser;

    beforeEach(() => {
        csvParser = new RailwayCSVParser(filePath);
    })

    it('should parse dummy CSV file correctly', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('railway1,#000000'),
            })
        );

        const result = await csvParser.parse();

        expect(global.fetch).toHaveBeenCalledWith(filePath);
        expect(result).toBeInstanceOf(Map);
    });
});