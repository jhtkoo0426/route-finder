// The CSVParserFactory defines an interface for creating CSV parser
// objects, where the type of CSV file to parse is determined by its
// subclasses.



class CSVParserFactory {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async parse() {
        // All CSV parsers split their CSV files into rows by the \n symbol.
        const response = await fetch(this.filePath);
        const csvText = await response.text();
        const csvData = csvText.split(/\r\n|\n/).filter(Boolean);
        return csvData;
    }
}

export default CSVParserFactory;