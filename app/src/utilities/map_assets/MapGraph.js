// An bidrectional adjacency list representation of a metro map. Used by
// path-finding algorithms to find efficient paths between stations.
class MapGraph {
    constructor() {
        // In the adjacency, station names (strings) should be used as keys.
        this.adjacencyList = new Map();
    }

    // Add bidirectional connection bewteen the source and neighbour station.
    // @param {string} sourceStationName
    // @param {string} neighbourStationName
    // @param {float} distance
    addNeighbourToStation(sourceStationName, neighbourStationName, distance) {
        // Add the source-neighbour connection
        if (!this.adjacencyList.has(sourceStationName)) {
            this.adjacencyList.set(sourceStationName, new Map());
        }
        this.adjacencyList.get(sourceStationName).set(neighbourStationName, distance);

        // Add the neighbour-source connection
        if (!this.adjacencyList.has(neighbourStationName)) {
            this.adjacencyList.set(neighbourStationName, new Map());
        }
        this.adjacencyList.get(neighbourStationName).set(sourceStationName, distance);
    }

    // @param {string} sourceStationName
    // @param {string} neighbourStationName
    // @returns {float} distance
    getNeighbourDistance(sourceStationName, neighbourStationName) {
        if (this.adjacencyList.has(sourceStationName)) {
            let result = this.adjacencyList.get(sourceStationName).get(neighbourStationName);
            return result;
        }
    }

    getStationNeighbourNames(sourceStationName) {
        return Array.from(this.adjacencyList.get(sourceStationName).keys());
    }

    getStationNames() {
        return Array.from(this.adjacencyList.keys());
    }
}


export default MapGraph;