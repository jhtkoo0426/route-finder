// Converts a given travel path and returns a well-formatted structure
// consisting of all requried transits.
class TravelPathParser {
    constructor() {
        this.metroMapAssetsManager = null;
    }

    loadAssets(assetManager) {
        this.metroMapAssetsManager = assetManager;
    }

    parseTravelPathIntoSegments(path) {
        if (!path || path.length === 0) return null;
    
        const segments = [];
        let [start, line, stops] = [null, null, 0];    
        for (let i = 0; i < path.length - 1; i++) {
            const current = path[i];
            const next = path[i + 1];
            const connection = this.metroMapAssetsManager.connections[`${current}-${next}`] || this.metroMapAssetsManager.connections[`${next}-${current}`];
            const lines = Array.from(connection.metroLines);
    
            if (!start) [start, line] = [current, lines[0]];
            if (!lines.includes(line)) {
                segments.push({ start, line, stops });
                [start, line, stops] = [current, lines[0], 1];
            } else {
                stops++;
            }
        }
        segments.push({ start, line, stops });
        segments.push({ start: path[path.length-1], line: null, stops: 0 });
        return segments;
    }
}


export default TravelPathParser;