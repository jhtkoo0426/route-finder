# route-finder
An interactive journey planner for transporting via metro networks in major cities.

## Main features
1. **Real-time visualization** of the exploration of various path-finding algorithms on metro maps.
2. A **scalable** approach which only requires users to clean and import 3 distinct files that represent key assets for creating metro maps (connections, stations and railway lines).


## Approach
### Applying design patterns
I applied sesveral design patterns in this project to offer solutions for common design challenges, while improving code quality and scalability. Ultimately, this enables me to develop more efficient, modular, and adaptable software systems (if I wanted to extend them).
1. **Abstract Factory**: The data for this project is stored in 3 separate `.csv` files (`connections.csv`, `railways.csv` and `stations.csv`). Every row of data in each file is extracted in the same manner but should be parsed differently. Therefore, I created a base `CSVParserFactory` class which represents a `.csv` parser interface (see `CSVParserFactory.js`).
    <br>

    <details>
    <summary>CSVParserFactory.js</summary>

    ```
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
    ```

    </details>
   
    <details>
    <summary>Usage</summary>

    ```
    async parseCSVFiles() {
        const stationsCSVParser     = new StationsCSVParser(this.stationsFilePath);
        const connectionsCSVParser  = new ConnectionsCSVParser(this.connectionsFilePath);
        const railwaysCSVParser     = new RailwaysCSVParser(this.railwaysFilePath);
        
        this.stations = await stationsCSVParser.parse(this.stations);
        this.stations = await connectionsCSVParser.parse(this.stations);
        this.railwayLines = await railwaysCSVParser.parse(this.railwayLines);
    }
    ```
    
    </details>

2. 