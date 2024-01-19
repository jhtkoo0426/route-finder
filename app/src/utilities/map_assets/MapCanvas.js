import React, { PureComponent, createRef } from 'react';
import { INITIAL_VALUE, ReactSVGPanZoom, TOOL_AUTO } from 'react-svg-pan-zoom';
import {
    SVG_MAP_WIDTH,
    SVG_MAP_HEIGHT,
    SVG_MAP_SCALE_MIN,
    SVG_MAP_SCALE_MAX,
    SVG_MAP_SCALE_SPEED,
    SVG_GRID_LINE_WIDTH,
    SVG_GRID_LINE_STROKE,
    SVG_GRID_LINE_GAP_INTERVAL,
    SVG_VIEWER_INITIAL_PAN_X,
    SVG_VIEWER_INITIAL_PAN_Y,
    SVG_STATION_RADIUS,
    SVG_STATION_NAME_FONT_SIZE,
    SVG_STATION_NAME_FONT_COLOR,
    SVG_STATION_INNER_CIRCLE_STROKE,
    SVG_STATION_OUTER_CIRCLE_STROKE,
    SVG_CONNECTION_STROKE_WIDTH,
} from '../Constants';



// This class implements the SVG representation of a metro map. It should be
// initialized in the render() method in App.js
class MapCanvas extends PureComponent {
    constructor(props) {
        super(props);

        this.Viewer = createRef();
        this.state = {
            tool: TOOL_AUTO,                        // ReactSVGPanZoom component config
            value: INITIAL_VALUE,                   // ReactSVGPanZoom component config
            stations: [],                           // Collection of all metro stations
            connections: [],                        // Collection of all connections between metro stations
            railwayLines: new Set(),                // Colour map for metro lines
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            mapWidth: window.innerWidth * 0.8,      // Scale factor adjusts to grid width
        };
    }

    handleResize = () => {
        this.setState({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            mapWidth: window.innerWidth * 0.8,
        });
        this.Viewer.current.fitToViewer();
    };

    panToLocation(mapX, mapY) {
        // this.Viewer.current.pan(mapX, mapY);
        this.Viewer.current.setPointOnViewerCenter(mapX, mapY, 1);
    }

    componentDidMount() {
        this.Viewer.current.fitToViewer();
        window.addEventListener('resize', this.handleResize);

        // Set initial viewer position
        this.Viewer.current.pan(SVG_VIEWER_INITIAL_PAN_X, SVG_VIEWER_INITIAL_PAN_Y);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    loadRailwayLines = (railwayLinesList) => {
        this.setState({ railwayLines: railwayLinesList });
    };

    loadStations = (stationsList) => {
        this.setState({ stations: stationsList });
    };

    loadConnections = (connectionsList) => {
        this.setState({ connections: connectionsList });
    };

    renderStations() {
        return Object.entries(this.state.stations).map(([stationName, stationObj]) => (
            stationObj.renderStation()
        ));
    }

    renderConnections() {
        return Object.entries(this.state.connections).map(([connectionKey, connection]) => (
            connection.renderConnection(this.state.railwayLines)
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
                {Object.keys(this.state.railwayLines).map((metroLineName, index) => (
                    <div key={metroLineName}>
                        <div style={{ backgroundColor: this.state.railwayLines[metroLineName] }}></div>
                        <p>{metroLineName}</p>
                    </div>
                ))}
            </div>
        );
    }

    
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
        return (
            <g key={index}>
                {segment.line !== null && this.renderTravelPathLine(startX, updatedStartY, this.state.railwayLines[segment.line])}
                {this.renderTravelPathStationText(startX, updatedStartY, segment.start, SVG_STATION_NAME_FONT_SIZE, SVG_STATION_NAME_FONT_COLOR, "start")}
                {this.renderTravelPathStationText(startX, updatedStartY + SVG_STATION_RADIUS * 3.5, segment.stops !== 0 ? `${segment.line} (${segment.stops} stop${segment.stops > 1 ? 's' : ''})` : null, SVG_STATION_NAME_FONT_SIZE, SVG_STATION_NAME_FONT_COLOR, "start")}
                {this.renderTravelPathStationCircles(startX, updatedStartY)}
            </g>
        );
    }
    
    renderMap() {
        return (
            <ReactSVGPanZoom
                ref={this.Viewer}
                width={this.state.mapWidth}
                height={this.state.screenHeight}
                tool={this.state.tool}
                onChangeTool={(tool) => this.setState({ tool })}
                onChangeValue={(value) => this.setState({ value })}
                value={this.state.value}
                detectAutoPan={false}
                scaleFactorMax={SVG_MAP_SCALE_MAX}
                scaleFactorMin={SVG_MAP_SCALE_MIN}
                scaleFactorOnWheel={SVG_MAP_SCALE_SPEED}
                preventPanOutside={true}
                disableDoubleClickZoomWithToolAuto={true}>
                <svg key={this.state.forceRerender} width={SVG_MAP_WIDTH} height={SVG_MAP_HEIGHT}>
                    {this.renderGridLines()}
                    {this.renderConnections()}
                    {this.renderStations()}
                    {this.renderRailwayLinesLegend()}
                </svg>
            </ReactSVGPanZoom>
        );
    }

    render() {
        return (
            <div className="svg-container" ref={this.svgContainerRef}>
                {this.renderMap()}
                {this.renderRailwayLinesLegend()}
            </div>
        );
    }
}


export default MapCanvas;