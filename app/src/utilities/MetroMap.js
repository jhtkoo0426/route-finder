import Station from "./Station";
import MinPriorityQueue from "./MinPriorityQueue";


// This class manages business logic, including Station instances and supports 
// stations querying.
class MetroMap {
    constructor(cityName, stationsCSVPath, connectionsCSVPath, railwayColourCSVPath) {
        this.cityName = cityName;
        this.stationsCSVPath = stationsCSVPath;
        this.connectionsCSVPath = connectionsCSVPath;
        this.railwayColourCSVPath = railwayColourCSVPath;
        this.stations = {};
        this.railwayColourMap = {};
        this.connections = {};
    }

    // Parses the stations file; Assumes that there is no header line
    async parseStationCSV(filePath) {
        const response = await fetch(filePath);
        const csvText = await response.text();
        const csvData = csvText.split(/\r\n|\n/).filter(Boolean);
    
        csvData.forEach(row => {
            const [stationName, latitude, longitude] = row.split(",");
            this.stations[stationName] = new Station(stationName, latitude, longitude);
        });
    }
    
    async parseConnectionCSV(filePath) {
        const response = await fetch(filePath);
        const csvText = await response.text();
        const csvData = csvText.split(/\r\n|\n/).filter(Boolean);
    
        csvData.forEach(row => {
            const [metroLineName, startStationName, endStationName] = row.split(",");

            // Build adjacent list
            var startStationObj = this.stations[startStationName];
            var endStationObj = this.stations[endStationName];
            
            if (startStationObj !== undefined && endStationObj !== undefined) {
                startStationObj.addNeighbour(endStationObj);
                endStationObj.addNeighbour(startStationObj);
    
                // Build connections list
                if (this.connections.hasOwnProperty(startStationName)) {
                    if (!this.connections[startStationName].some(entry => entry.station === endStationName && entry.line === metroLineName)) {
                        this.connections[startStationName].push({ station: endStationName, line: metroLineName});
                    }
                } else {
                    this.connections[startStationName] = [{ station: endStationName, line: metroLineName}];
                }
            }
        });
    }

    async parseRailwayColoursCSV(filePath) {
        const response = await fetch(filePath);
        const csvText = await response.text();
        const csvData = csvText.split(/\r\n|\n/).filter(Boolean);
        
        csvData.forEach(row => {
            const [metroLineName, colour] = row.split(",");
            this.railwayColourMap[metroLineName] = colour;
        })
    }

    // Parses stationCSV, connectionCSV
    async parseAssets() {
        await this.parseStationCSV(this.stationsCSVPath);
        await this.parseConnectionCSV(this.connectionsCSVPath);
        await this.parseRailwayColoursCSV(this.railwayColourCSVPath);
    }

    // Visualise stations and connections
    visualizeMetroMap(mapInstance) {
        mapInstance.drawStations(this.stations);
        mapInstance.drawConnections(this.stations, this.connections, this.railwayColourMap);
    }

    // Choose searching algorithms
    searchPath(startStationName, endStationName) {
        const stations = this.stations;
        const distances = {};
        const visited = {};
        const previousStation = {};
        const priorityQueue = new MinPriorityQueue();

        // Initialize distances
        Object.keys(stations).forEach(stationName => {
            distances[stationName] = Infinity;
            visited[stationName] = false;
            previousStation[stationName] = null;
        });
        distances[startStationName] = 0;

        // Enqueue the starting station
        priorityQueue.enqueue(startStationName, 0);

        while (!priorityQueue.isEmpty()) {
            // Dequeue a station
            const currentStation = priorityQueue.dequeue().element;

            if (visited[currentStation]) continue;

            // Mark current station as visited
            visited[currentStation] = true;

            // Check neighbors and update distances
            const neighbors = stations[currentStation].neighbours;
            Object.keys(neighbors).forEach(neighborName => {
                const neighborDistance = neighbors[neighborName].distance;
                const newDistance = distances[currentStation] + neighborDistance;

                if (newDistance < distances[neighborName]) {
                    distances[neighborName] = newDistance;
                    previousStation[neighborName] = currentStation;
                    // Enqueue the neighbor with updated distance
                    priorityQueue.enqueue(neighborName, newDistance);
                }
            });
        }

        // Construct the path
        const path = this.constructPath(previousStation, startStationName, endStationName);

        return { distance: distances[endStationName], path };
    }

    constructPath(previousStation, startStation, endStation) {
        const path = [];
        let currentStation = endStation;

        while (currentStation !== startStation && currentStation !== null) {
            path.unshift(currentStation);
            currentStation = previousStation[currentStation];
        }

        if (currentStation === startStation) {
            path.unshift(startStation);
        }

        return path;
    }

    // Utility methods
    getStationNames() {
        return Object.keys(this.stations);
    }
}

export default MetroMap;