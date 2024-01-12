import React from "react";
import {
    SVG_CONNECTION_STROKE_WIDTH,
} from "../Constants";



class Connection {
    constructor(startStation, endStation, metroLineName) {
        this.startStation = startStation;
        this.endStation = endStation;
        this.metroLineName = metroLineName;
        this.identicalConnections = [];
        this.positionAmongNeighbours = -1;
    }

    renderConnection(colour) {
        const { x: x1, y: y1 } = this.startStation;
        const { x: x2, y: y2 } = this.endStation;
        const shiftAmount = this.identicalConnections.length;

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

        this.identicalConnections = sameStationsConnections;
        sameStationsConnections.forEach((connection, i) => {
            connection.positionAmongNeighbours = i + 1;
        });

        // Find the position of the current connection among neighbours
        this.positionAmongNeighbours = 0;
    }
}

export default Connection;
