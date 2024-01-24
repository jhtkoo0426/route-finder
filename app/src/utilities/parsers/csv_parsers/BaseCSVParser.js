// Defines an interface for creating CSV parser objects, where the type of CSV 
// file to parse is determined by its subclasses.
class CSVParser {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async parse() {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch CSV file: ${response.statusText}`);
            }

            const csvText = await response.text();
            const csvRows = this.splitCSVIntoRows(csvText);
            return csvRows;
        } catch (error) {
            this.handleParseError(error);
            throw error;
        }
    }

    splitCSVIntoRows(csvText) {
        const csvData = csvText.split(/\r\n|\n/).map(line => line.trim()).filter(Boolean);
        return csvData;
    }

    handleParseError(error) {
        console.error(`Error parsing CSV: ${error.message}`);
    }
}

export default CSVParser;
