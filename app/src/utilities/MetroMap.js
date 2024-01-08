import Station from "./Station";
import MinPriorityQueue from "./MinPriorityQueue";


// This class manages business logic, including Station instances and supports 
// stations querying.
class MetroMap {
    constructor(cityName, stationsCSVPath, connectionsCSVPath, metroLinesCSVPath) {
        this.cityName = cityName;
        this.stationsCSVPath = stationsCSVPath;
        this.connectionsCSVPath = connectionsCSVPath;
        this.metroLinesCSVPath = metroLinesCSVPath;
        this.stations = {};
        this.metroLineColourMap = {};
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

    async parseMetroLinesCSV(filePath) {
        const response = await fetch(filePath);
        const csvText = await response.text();
        const csvData = csvText.split(/\r\n|\n/).filter(Boolean);
        
        csvData.forEach(row => {
            const [metroLineName, colour] = row.split(",");
            this.metroLineColourMap[metroLineName] = colour;
        })
    }
    
    async parseConnectionCSV(filePath) {
        const response = await fetch(filePath);
        const csvText = await response.text();
        const csvData = csvText.split(/\r\n|\n/).filter(Boolean);
        
        for (let i = 0; i < csvData.length; i++) {
            const [metroLineName, startStationName, endStationName] = csvData[i].split(",");

            // Build adjacent list
            var startStationObj = this.stations[startStationName];
            var endStationObj = this.stations[endStationName];
            
            if (startStationObj !== undefined && endStationObj !== undefined) {
                startStationObj.addNeighbour(endStationObj, metroLineName);
                endStationObj.addNeighbour(startStationObj, metroLineName);
            }
        };
    }

    // Parses stationCSV, connectionCSV
    async parseAssets() {
        await this.parseStationCSV(this.stationsCSVPath);
        await this.parseMetroLinesCSV(this.metroLinesCSVPath);
        await this.parseConnectionCSV(this.connectionsCSVPath);
    }

    // Visualise stations and connections
    visualizeMetroMap(mapInstance) {
        // Since we need to layer multiple elements on the map canvas, we draw assets
        // in the order that we want them to appear, where elements drawm later will be
        // on top of elemetns drawn earlier.
        Object.entries(this.stations).forEach(([ stationName, stationObj ]) => {
            mapInstance.drawStation(stationName, stationObj);
            mapInstance.drawConnections(this.stations, stationName, stationObj, this.metroLineColourMap);
        })
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