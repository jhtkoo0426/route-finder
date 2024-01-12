import React from "react";
import {
    SVG_CONNECTION_STROKE_WIDTH,
} from "../Constants";



class Connection {
    constructor(startStation, endStation, metroLineName) {
        this.startStation = startStation;
        this.endStation = endStation;
        this.metroLineName = metroLineName;
        this.neighbours = [];
        this.positionAmongNeighbours = -1;
    }

    renderConnection(colour) {
        const [x1, y1] = [this.startStation.x, this.startStation.y];
        const [x2, y2] = [this.endStation.x, this.endStation.y];
        const shiftAmount = (this.neighbours.length - 1) * 2;

        return (
            <line
                key={`${this.startStation.name}-${this.endStation.name}-${this.metroLineName}`}
                x1={x1 + (this.positionAmongNeighbours * 2 - shiftAmount)}
                y1={y1 + (this.positionAmongNeighbours * 2 - shiftAmount)}
                x2={x2 + (this.positionAmongNeighbours * 2 - shiftAmount)}
                y2={y2 + (this.positionAmongNeighbours * 2 - shiftAmount)}
                stroke={colour}
                strokeWidth={SVG_CONNECTION_STROKE_WIDTH}
            />
        );
    }

    findNeighbours(allConnections) {
        const sameStationsConnections = allConnections.filter(connection =>
          (connection.metroLineName !== this.metroLineName) &&
          ((connection.startStation === this.startStation && connection.endStation === this.endStation) ||
          (connection.startStation === this.endStation && connection.endStation === this.startStation))
        );
    
        this.neighbours = sameStationsConnections;
        if (this.neighbours.length >= 1) {
            for (let i = 0; i < sameStationsConnections.length; i++) {
                const connection = sameStationsConnections[i];
                connection.positionAmongNeighbours = i+1;
            }
        }
    
        // Find the position of the current connection among neighbours
        this.positionAmongNeighbours = 0;
    }
}

export default Connection;
