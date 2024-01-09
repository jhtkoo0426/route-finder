# route-finder
An interactive journey planner for transporting via metro networks in major cities.

## Main features
1. **Real-time visualization** of the exploration of various path-finding algorithms on metro maps.
2. A **scalable** approach which only requires users to clean and import 3 distinct files that represent key assets for creating metro maps (connections, stations and railway lines).


## Approach
### Applying design patterns
I applied sesveral design patterns in this project to offer solutions for common design challenges, while improving code quality and scalability. Ultimately, this enables me to develop more efficient, modular, and adaptable software systems (if I wanted to extend them).

1. **Strategy**: The data for this project is stored in 3 separate `.csv` files (`connections.csv`, `railways.csv` and `stations.csv`). Every row of data in each file is extracted in the same manner *but should be parsed differently*, thus I created `CSVParser` to encapsulate the parsing behaviour, where concrete implementations such as `StationsCSVParser` provides the specific implementation for parsing stations.
    <br>

    <details>
    <summary>CSVParser.js</summary>

    ```
    class CSVParser {
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

    export default CSVParser;
    ```

    </details>
   
    <details>
    <summary>StationsCSVParser.js</summary>

    ```
    class StationsCSVParser extends CSVParser {
        async parse(stations) {
            // @params stations (hashmap): Stores all Station objects that are previously
            // initialized by a StationsCSVParser instance, with the station name as the 
            // keys, and Station objects as the values.

            const csvData = await super.parse();    // The base parse method splits rows by the \n symbol.

            csvData.forEach(row => {
                const [stationName, latitude, longitude] = row.split(",");
                stations[stationName] = new Station(stationName, latitude, longitude);
            });
        
            console.log("All " + Object.entries(stations).length + " stations parsed.");
            return stations;
        }
    }


    export default StationsCSVParser;
    ```
    
    </details>

2. 