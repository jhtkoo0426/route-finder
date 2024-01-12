import React from "react";
import {
    SVG_CONNECTION_STROKE_WIDTH,
} from "../Constants";



class Connection {
    constructor(startStation, endStation) {
        this.startStation = startStation;
        this.endStation = endStation;
        this.metroLines = [];       // An array of metro lines that pass through this connection.
    }
    
    addMetroLine(metroLineName) {
        if (!this.metroLines.includes(metroLineName)) {
            this.metroLines.push(metroLineName);
        }
    }

    renderConnection(colourMap) {
        const { x: x1, y: y1 } = this.startStation;
        const { x: x2, y: y2 } = this.endStation;
        const totalLines = this.metroLines.length;
    
        return this.metroLines.map((metroLineName, index) => {
            const shiftAmount = (index - (totalLines - 1) / 2) * 2; // Adjust the shift amount as needed
    
            return (
                <line
                    key={`${this.startStation.name}-${this.endStation.name}-${metroLineName}`}
                    x1={x1 + shiftAmount}
                    y1={y1 + shiftAmount}
                    x2={x2 + shiftAmount}
                    y2={y2 + shiftAmount}
                    stroke={colourMap[metroLineName]}
                    strokeWidth={SVG_CONNECTION_STROKE_WIDTH}
                />
            );
        });
    }
    
}


export default Connection;