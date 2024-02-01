<h1>route-finder</h1>

A dynamic visualization tool designed to identify the most efficient metro routes in major cities. This documentation showcases the essential features of the application and outlines how it adheres to SOLID principles while strategically employing design patterns, offering a comprehensive and insightful overview.

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white">

<br>

<img src="route-finder-ui.png" alt="">

<h2>Table of Contents</h2>

- [Main Features](#main-features)
- [SOLID Principles](#solid-principles)
  - [Single Responsibility Principle](#single-responsibility-principle)
- [Design Patterns](#design-patterns)
- [Unit Testing](#unit-testing)
  - [Overview](#overview)
  - [Setup](#setup)
  - [Running tests](#running-tests)
  - [Types of tests available](#types-of-tests-available)

## Main Features
- **Automatic parsing** of metro map assets such as stations, interchanges, connections and railway lines.
- **Real-time visualization** of the exploration of various path-finding algorithms on metro maps.


## SOLID Principles
### Single Responsibility Principle
This application follows the single responsibility principle by organizing its components into distinct responsibilities:

1. **Client Code**
    - `App.js`: Manages the states of all required map assets and renders the application UI.
2. **Algorithms**
    - `BaseAlgorithm.js`: An abstract base class for implementing various pathfinding algorithms. It provides a common structure and interface for subclasses to build upon when creating specific pathfinding algorithms (e.g., `Dijkstra.js`). All implementations of BaseAlgorithm are initialized with an array of Station objects representing nodes in the graph.
3. **Components**
    - `SearchableDropdown.js`: A React component responsible for populating and rendering a searchable dropdown list.
4. **Map Assets**
    - `Station.js`: Represents a physical metro station on the metro map, including key attributes such as name and coordinates, and methods for calculating distance between stations
    - `Connection.js`: Represents a physical connection bewteen two metro stations; maintains a recrod of all unique metro lines traversing the connection.
    - `MapCanvas.js`: Renders a SVG representation of a metro map.
      - Renders all map assets (stations and connections) as SVG objects.
      - Utilises the <a href="https://github.com/chrvadala/react-svg-pan-zoom" target="_blank">react-svg-pan-zoom</a> library to enable dragging and zooming user interactions.
5. **Parsers**
    - `csv_parsers`: A family of CSV parsers that extract data from metro map asset files (see [here](#design-patterns) for details).
    - `TravelPathParser.js`: Transforms a series of `Stations` (representing a travel path between a starting and ending station) into segments to indicate potential transits between metro lines.
6. **Services**
    - `MetroMapAssetsManager.js`: This module is responsible for instantiating and managing instances of `Station`, `Connection`, and railway lines.
      - Maintains the assets' dynamic states within the application (which is particularly significant as the states of certain assets may undergo changes during the visualization process).
      - Organizes and stores these assets in suitable data structures for efficient retrieval and manipulation.

## Design Patterns
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
    <br>

2. **Factory**: Extending the above use case, I created a common interface (`CSVParserFactory`) to create different CSV parseres based on the type of data to be parsed (railways, stations or connections CSV files). Each specific parser can then handle the details of parsing that particular type of data. This allows me to encapsulate the object creation logic in the factory, and the application code doesn't need to worry about which parser to instantiate.
   <br>
   <details>
    <summary>CSVParserFactory.js</summary>
    
    ```
    class CSVParserFactory {
        createParser(type, filePath) {
            switch (type) {
                case 'stations':
                    return new StationsCSVParser(filePath);
                case 'connections':
                    return new ConnectionsCSVParser(filePath);
                // Add more cases for other types if needed
                default:
                    throw new Error('Invalid parser type');
            }
        }
    }
    ```

   </details>


## Unit Testing
This section provides information on setting up the testing environment, running tests, and writing different types of tests to ensure the reliability and stability of the application.

### Overview
Unit tests are written with the `Jest` testing framework. The application currently contains 73 unit tests across 19 test suites with 84.61% code coverage.

### Setup
To set up the testing environment for this React.js project, follow these steps:
- Install Node.js: Ensure that Node.js is installed on your machine. You can download it from https://nodejs.org/. 
- Install project dependencies: Run the following command in the project root directory to install the required dependencies:
    ```
    npm install
    ```

### Running tests
To run all unit tests for the application, follow these steps:
1. Ensure that you are in the project directory:
    ```
    cd app
    ```
    At this level, you should see the `src` directory.

2. i) Run tests for development:
    ```
    npm test
    ```
   ii) Run tests for code coverage:
    ```
    npm run test -- --coverage --watchAll=false
    ```

### Types of tests available
Currently the application consists of only unit tests. These tests focus on testing individual functions, components, or modules in isolation. They help ensure that each part of the application works as expected.