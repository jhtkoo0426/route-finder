import CSVParser from "../BaseCSVParser";


describe('BaseCSVParser.js tests', () => {
    const filePath = 'test.csv';
    let csvParser;

    beforeEach(() => {
        csvParser = new CSVParser(filePath);
    });

    test('should parse the dummy CSV file correctly', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('randomText,0.1,0.2'),
            })
        );

        const parsedData = await csvParser.parse();

        expect(global.fetch).toHaveBeenCalledWith(filePath);
        expect(parsedData).toEqual(['randomText,0.1,0.2']);
    });

    test('should handle fetch error', async () => {
        // Mock the fetch function to return an error response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: 'Not Found',
            })
        );

        // Expecting an error to be thrown during parse
        await expect(csvParser.parse()).rejects.toThrow('Failed to fetch CSV file: Not Found');
        expect(global.fetch).toHaveBeenCalledWith(filePath);
    });

    test('should split CSV into rows correctly', () => {
        const csvText = 'Header1,Header2\nValue1,Value2\nValue3,Value4';
        const result = csvParser.splitCSVIntoRows(csvText);

        expect(result).toEqual(['Header1,Header2', 'Value1,Value2', 'Value3,Value4']);
    });
});