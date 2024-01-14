import React from "react";
import {
    SVG_CONNECTION_STROKE_WIDTH,
    SVG_CONNECTION_OPACITY_UNVISITED,
    SVG_CONNECTION_OPACITY_VISITED,
    SVG_CONNECTION_OPACITY_SELECTED,
} from "../Constants";



class Connection {
    constructor(startStation, endStation) {
        this.startStation = startStation;
        this.endStation = endStation;
        this.metroLines = [];
        this.state = {
            visited: false,
            selected: false,
            opacity: SVG_CONNECTION_OPACITY_UNVISITED,
        };
    }

    addMetroLine(metroLineName) {
        if (!this.metroLines.includes(metroLineName)) {
            this.metroLines.push(metroLineName);
        }
    }

    renderConnection(colourMap) {
        const totalLines = this.metroLines.length;

        return this.metroLines.map((metroLineName, index) => {
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