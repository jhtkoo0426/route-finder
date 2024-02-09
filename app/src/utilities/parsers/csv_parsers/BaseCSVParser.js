// Defines an interface for creating CSV parser objects, where the type of CSV 
// file to parse is determined by its subclasses.
class BaseCSVParser {
    constructor(filePath) {
        this.filePath = filePath;
    }

    // Extracts all rows from a .csv file into an array.
    // @returns {Array}
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
            throw error;
        }
    }

    // @params {string} csvText
    // @returns {Array}
    splitCSVIntoRows(csvText) {
        let lines = csvText.split(/\r\n|\n/);           // Split the CSV text into lines
        lines = lines.map(line => line.trim());         // Trim leading and trailing whitespaces from each line
        const nonEmptyLines = lines.filter(Boolean);    // Remove empty lines
        return nonEmptyLines;
    }
}

export default BaseCSVParser;
