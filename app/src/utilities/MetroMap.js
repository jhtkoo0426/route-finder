import Station from "./Station";
import MinPriorityQueue from "./MinPriorityQueue";


// This class manages business logic, including Station instances and supports 
// stations querying.
class MetroMap {
    constructor(connectionsFilePath, stationsFilePath, linesFilePath) {
        this.connectionsFilePath = connectionsFilePath;
        this.stationsFilePath = stationsFilePath;
        this.linesFilePath = linesFilePath;
        this.mapInstance = null;
        this.stations = {};
        this.railwayLines = {};
    }

    async parseCSVFiles() {
        await this.parseStationsCSV();
        await this.parseConnectionsCSV();
        await this.parseRailwaysSCV()
    }

    async parseStationsCSV() {
        const response = await fetch(this.stationsFilePath);
        const csvText = await response.text();
        const csvData = csvText.split(/\r\n|\n/).filter(Boolean);
    
        csvData.forEach(row => {
            const [stationName, latitude, longitude] = row.split(",");
            this.stations[stationName] = new Station(stationName, latitude, longitude);
        });
        console.log("All " + Object.entries(this.stations).length + " stations parsed.");
    }

    async parseConnectionsCSV() {
        const response = await fetch(this.connectionsFilePath);
        const csvText = await response.text();
        const csvData = csvText.split(/\r\n|\n/).filter(Boolean);

        csvData.forEach(row => {
            const [metroLineName, startStationName, endStationName] = row.split(",");
           
            // Build adjacency list
            var startStationObj = this.stations[startStationName];
            var endStationObj = this.stations[endStationName];
            
            if (startStationObj !== undefined && endStationObj !== undefined) {
                startStationObj.addNeighbour(endStationObj, metroLineName);
                endStationObj.addNeighbour(startStationObj, metroLineName);
            }
        })
        console.log("All connections parsed.");
    }

    async parseRailwaysSCV() {
        const response = await fetch(this.linesFilePath);
        const csvText = await response.text();
        const csvData = csvText.split(/\r\n|\n/).filter(Boolean);

        csvData.forEach(row => {
            const [metroLineName, colour] = row.split(",");
            this.railwayLines[metroLineName] = colour;
        })
        console.log("All railways parsed.");
    }

    // Visualise stations and connections
    visualizeMetroMap(mapInstance) {
        // Since we need to layer multiple elements on the map canvas, we draw assets
        // in the order that we want them to appear, where elements drawm later will be
        // on top of elemetns drawn earlier.
        Object.entries(this.stations).forEach(([ stationName, stationObj ]) => {
            mapInstance.drawStation(stationObj.x, stationObj.y, 5, stationName);
        })
        Object.entries(this.stations).forEach(([ stationName, stationObj ]) => {
            mapInstance.drawConnection(this.stations, stationName, this.railwayLines);
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
    
    geometricToCartesian(lat, lon) {
        const R = 6371;
        
        // TODO: Bad practice for adding constants
        var x = R * Math.cos(lat) * Math.sin(lon) + 1000;
        var y = R * Math.cos(lat) * Math.cos(lon) - 1000;

        x = Math.round(x);
        y = Math.round(y);
        return [x, y];
    }

    calculateDistance(startStationObj, endStationObj) {
        var [lat1, lon1] = [startStationObj.lat, startStationObj.lon];
        var [lat2, lon2] = [endStationObj.lat, endStationObj.lon]; 
        const R = 6371; // km
        var dLat = this.toRad(lat2-lat1);
        var dLon = this.toRad(lon2-lon1);
        lat1 = this.toRad(lat1);
        lat2 = this.toRad(lat2);

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c;
        return d;
    }

    toRad(x) {
        return Math.PI * x / 180;
    }
}

export default MetroMap;