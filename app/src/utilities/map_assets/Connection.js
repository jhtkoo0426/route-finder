import React from "react";
import {
    SVG_CONNECTION_STROKE_WIDTH,
    SVG_CONNECTION_OPACITY_UNVISITED,
} from "../Constants";



class Connection {
    constructor(startStation, endStation) {
        this.startStation = startStation;
        this.endStation = endStation;
        this.metroLines = new Set();
        this.state = {
            opacity: SVG_CONNECTION_OPACITY_UNVISITED,
        };
    }

    addMetroLine(metroLineName) {
        this.metroLines.add(metroLineName);
    }

    renderConnection(colourMap) {
        const totalLines = Array.from(this.metroLines).length;
        
        return Array.from(this.metroLines).map((metroLineName, index) => {
            const shiftAmount = (SVG_CONNECTION_STROKE_WIDTH * 0.5) * (0.5 - 0.5 * totalLines + index);
            return (
                <line
                    key={`${this.startStation.name}-${this.endStation.name}-${metroLineName}`}
                    x1={this.startStation.x + shiftAmount}
                    y1={this.startStation.y + shiftAmount}
                    x2={this.endStation.x + shiftAmount}
                    y2={this.endStation.y + shiftAmount}
                    stroke={colourMap[metroLineName]}
                    strokeWidth={SVG_CONNECTION_STROKE_WIDTH}
                    opacity={this.state.opacity}
                />
            );
        });
    }
}


export default Connection;