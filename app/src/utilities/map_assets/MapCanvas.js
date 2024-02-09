import React, { PureComponent, createRef } from 'react';

// Components and constants
import MapViewer from './MapViewer';
import {
    SVG_MAP_WIDTH,
    SVG_MAP_HEIGHT,
    SVG_GRID_LINE_WIDTH,
    SVG_GRID_LINE_STROKE,
    SVG_GRID_LINE_GAP_INTERVAL,
    SVG_STATION_RADIUS,
    SVG_STATION_NAME_FONT_SIZE,
    SVG_STATION_NAME_FONT_COLOR,
    SVG_STATION_INNER_CIRCLE_STROKE,
    SVG_STATION_OUTER_CIRCLE_STROKE,
    SVG_STATION_NAME_SHIFT_X,
    SVG_STATION_NAME_SHIFT_Y,
    SVG_CONNECTION_STROKE_WIDTH,
    SVG_CONNECTION_OPACITY_VISITED,
    SVG_CONNECTION_OPACITY_SELECTED,
    VISUALISE_PATH_NODE_DELAY,
} from '../Constants';




// This class implements the SVG representation of a metro map, including rendering and
// animating all map assets.
class MapCanvas extends PureComponent {
    constructor(props) {
        super(props);

        this.viewer = createRef();
        this.state = {
            stations: [],                           // Collection of all metro stations
            connections: [],                        // Collection of all connections between metro stations
            railwayLinesColourMap: new Map(),       // Colour map for metro lines
        };
    }

    loadAssets(assetManager) {
        this.setState({
            stations: assetManager.stations,
            connections: assetManager.connections,
            railwayLinesColourMap: assetManager.railwayLinesColourMap,
        })
    }

    moveViewerToStation(stationName) {
        const stationObj = this.state.stations[stationName];
        this.viewer.current.setViewerPosition(stationObj.x, stationObj.y);
    }

    // RENDERING METHODS
    // 1. Rendering assets (stations, connections, grids & legend)
    // Renders the Station object on the MapCanvas
    renderStation(stationObj) {
        return (
            <g key={stationObj.name}>
                <circle cx={stationObj.x} cy={stationObj.y} r={SVG_STATION_RADIUS} fill={SVG_STATION_OUTER_CIRCLE_STROKE} />
                <circle cx={stationObj.x} cy={stationObj.y} r={SVG_STATION_RADIUS - 2} fill={SVG_STATION_INNER_CIRCLE_STROKE} />
                <text
                    x={stationObj.x + SVG_STATION_NAME_SHIFT_X}
                    y={stationObj.y + SVG_STATION_NAME_SHIFT_Y}
                    fontSize={SVG_STATION_NAME_FONT_SIZE}
                    fill={SVG_STATION_NAME_FONT_COLOR}
                    textAnchor="bottom">
                    {stationObj.fittedName.split('\n').map((line, i) => (
                        <tspan key={i} x={stationObj.x + 10} dy="1.2em">
                            {line}
                        </tspan>
                    ))}
                </text>
            </g>
        )
    }

    renderStations() {
        return Object.entries(this.state.stations).map(([stationName, stationObj]) => (
            this.renderStation(stationObj)
        ));
    }

    renderConnection(connectionObj) {
        const metroLineCount = connectionObj.getMetroLinesCount();
        const metroLinesArray = connectionObj.getMetroLinesArray();
        const [startStation, endStation] = [connectionObj.startStation, connectionObj.endStation];
        
        return metroLinesArray.map((metroLineName, index) => {
            const shiftAmount = (SVG_CONNECTION_STROKE_WIDTH * 0.5) * (0.5 - 0.5 * metroLineCount + index);
            return (
                <line
                    key={`${startStation.name}-${endStation.name}-${metroLineName}`}
                    x1={startStation.x + shiftAmount}
                    y1={startStation.y + shiftAmount}
                    x2={endStation.x + shiftAmount}
                    y2={endStation.y + shiftAmount}
                    stroke={this.state.railwayLinesColourMap.get(metroLineName)}
                    strokeWidth={SVG_CONNECTION_STROKE_WIDTH}
                    opacity={connectionObj.state.opacity}
                />
            );
        });
    }

    renderConnections() {
        return Object.entries(this.state.connections).map(([connectionKey, connectionObj]) => (
            this.renderConnection(connectionObj)
        ));
    }

    renderGridLines() {
        const gridSizeX = Math.ceil(SVG_MAP_WIDTH / SVG_GRID_LINE_GAP_INTERVAL);
        const gridSizeY = Math.ceil(SVG_MAP_HEIGHT / SVG_GRID_LINE_GAP_INTERVAL);

        const createLines = (length, keyPrefix, coordinate, isVertical) =>
            Array.from({ length }, (_, index) => (
                <line
                    key={`${keyPrefix}-${index}`}
                    x1={isVertical ? index * coordinate : 0}
                    y1={isVertical ? 0 : index * coordinate}
                    x2={isVertical ? index * coordinate : SVG_MAP_WIDTH}
                    y2={isVertical ? SVG_MAP_HEIGHT : index * coordinate}
                    stroke={SVG_GRID_LINE_STROKE}
                    strokeWidth={SVG_GRID_LINE_WIDTH}
                />
            ));

        const verticalLines = createLines(gridSizeX + 1, 'vertical', SVG_GRID_LINE_GAP_INTERVAL, true);
        const horizontalLines = createLines(gridSizeY + 1, 'horizontal', SVG_GRID_LINE_GAP_INTERVAL, false);

        return (
            <g>{verticalLines}{horizontalLines}</g>
        );
    }

    renderRailwayLinesLegend() {
        return (
            <div className='map-legend'>
                {Array.from(this.state.railwayLinesColourMap.keys()).map((metroLineName, index) => (
                    <div key={metroLineName}>
                        <div style={{ backgroundColor: this.state.railwayLinesColourMap.get(metroLineName) }}></div>
                        <p>{metroLineName}</p>
                    </div>
                ))}
            </div>
        );
    }

    // 2. Rendering travel plan assets
    renderTravelPathLine(x, startY, lineColor) {
        return (
            <line
                x1={x}
                x2={x}
                y1={startY}
                y2={startY + 45}
                stroke={lineColor}
                strokeWidth={SVG_CONNECTION_STROKE_WIDTH}
            />
        );
    }

    renderTravelPathStationText(x, startY, text, fontSize, fill, textAnchor) {
        if (!text) { return null; }
        return (
            <text x={x + 10} y={startY + SVG_STATION_RADIUS - 2} fontSize={fontSize} fill={fill} textAnchor={textAnchor}>
                <tspan>{text}</tspan>
            </text>
        );
    }

    renderTravelPathStationCircles(x, startY) {
        return (
            <g>
                <circle cx={x} cy={startY} r={SVG_STATION_RADIUS} fill={SVG_STATION_OUTER_CIRCLE_STROKE} />
                <circle cx={x} cy={startY} r={SVG_STATION_RADIUS - 2} fill={SVG_STATION_INNER_CIRCLE_STROKE} />
            </g>
        );
    }

    renderTravelPathSegment(segment, index, startX, updatedStartY) {
        const lineColour = this.state.railwayLinesColourMap.get(segment.line);
        return (
            <g key={index}>
                {segment.line !== null && this.renderTravelPathLine(startX, updatedStartY, lineColour)}
                {this.renderTravelPathStationText(startX, updatedStartY, segment.start, SVG_STATION_NAME_FONT_SIZE, SVG_STATION_NAME_FONT_COLOR, "start")}
                {this.renderTravelPathStationText(startX, updatedStartY + SVG_STATION_RADIUS * 3.5, segment.stops !== 0 ? `${segment.line} (${segment.stops} stop${segment.stops > 1 ? 's' : ''})` : null, SVG_STATION_NAME_FONT_SIZE, SVG_STATION_NAME_FONT_COLOR, "start")}
                {this.renderTravelPathStationCircles(startX, updatedStartY)}
            </g>
        );
    }

    renderTravelPath(travelSegments) {
        let [startX, startY] = [10, 10];
        return (
            <svg className="travel-path" height={600}>
                {travelSegments.length !== 0 && travelSegments.map((segment, index) => {
                    const updatedStartY = startY + index * 45;
                    return this.renderTravelPathSegment(segment, index, startX, updatedStartY);
                })}
            </svg>
        );
    }

    // 3. Render algorithm search results
    async renderAlgorithmSearchResults(searchResults) {
        const { path, visitedConnectionsOrder } = searchResults;
        
        // Only update the path, distance and duration states to that of the selected algorithm.
        await this.animateConnections("exploredPath", visitedConnectionsOrder, SVG_CONNECTION_OPACITY_VISITED);
        await this.animateConnections("selectedPath", path, SVG_CONNECTION_OPACITY_SELECTED);
    }

    // ANIMATION METHODS
    // Animate Connection objects in the MapCanvas. There are 2 possible ways to animate connections:
    // 1) exploredPath - connectionsOrder is a hashmap of objects; 2) selectedPath - connectionsOrder
    // is an array of objects.
    animateConnections = async (type, connectionsOrder, opacity) => {
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    
        const {
            updateVisualizationStates,
        } = this.props;
    
        // Use the callback function to update the state in App.js
        updateVisualizationStates(
            type === "exploredPath",
            type === "selectedPath",
        );

        for (let i = 0; i < connectionsOrder.length - 1; i++) {
            let [start, end] = type === "exploredPath"
                ? [connectionsOrder[i].start, connectionsOrder[i].end]
                : [connectionsOrder[i], connectionsOrder[i + 1]];
            const connections = { ...this.state.connections };
            const connectionKey = connections[`${start}-${end}`] ? `${start}-${end}` : `${end}-${start}`;
            if (connections[connectionKey]) {
                connections[connectionKey].state.opacity = opacity;
                this.setState({ connections });
            }
            await delay(VISUALISE_PATH_NODE_DELAY);
        }
    };

    render() {
        return (
            <div className="svg-container" ref={this.svgContainerRef}>
                <MapViewer ref={this.viewer}>
                    <svg width={SVG_MAP_WIDTH} height={SVG_MAP_HEIGHT}>
                        {this.renderGridLines()}
                        {this.renderConnections()}
                        {this.renderStations()}
                    </svg>
                </MapViewer>
                {this.renderRailwayLinesLegend()}
            </div>
        );
    }
}


export default MapCanvas;