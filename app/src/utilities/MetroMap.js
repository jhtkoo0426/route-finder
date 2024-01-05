import Station from "./Station";


// This class manages Station instances and supports querying of stations.
class MetroMap {
    constructor(cityName, stationsCSVPath, connectionsCSVPath) {
        this.cityName = cityName;
        this.stationsCSVPath = stationsCSVPath;
        this.connectionsCSVPath = connectionsCSVPath;
        this.stations = {};
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
            var startStationObj = this.stations[startStationName];
            var endStationObj = this.stations[endStationName];
            startStationObj.addNeighbour(endStationObj);
            endStationObj.addNeighbour(startStationObj);
        });
    }

    async visualize() {
        this.parseStationCSV(this.stationsCSVPath);
        this.parseConnectionCSV(this.connectionsCSVPath);
    }
}

export default MetroMap;