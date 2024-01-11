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
    SVG_STATION_RADIUS,
    SVG_STATION_OUTER_CIRCLE_STROKE,
    SVG_STATION_INNER_CIRCLE_STROKE,
    SVG_STATION_NAME_FONT_SIZE,
    SVG_STATION_NAME_FONT_COLOR,
    SVG_CONNECTION_STROKE_WIDTH,
} from '../Constants';



class MapCanvas extends PureComponent {
    constructor(props) {
        super(props);

        this.Viewer = createRef();
        this.state = {
            tool: TOOL_AUTO,
            value: INITIAL_VALUE,
            stations: [],
            connections: [],
            railwayLines: null,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            mapWidth: window.innerWidth * 0.8,
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

    componentDidMount() {
        this.Viewer.current.fitToViewer();
        window.addEventListener('resize', this.handleResize);

        // Set initial viewer position
        this.Viewer.current.zoom(-6500, -5500, 0.4);
        this.Viewer.current.pan(-6500, -5500);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    loadStations = (stationsList) => {
        this.setState({ stations: stationsList });
    };

    loadRailwayLines = (railwayLinesList) => {
        this.setState({ railwayLines: railwayLinesList });
    }

    renderCircles() {
        const { stations } = this.state;

        return Object.entries(stations).map(([stationName, stationObj]) => (
            <g key={stationName}>
                <circle cx={stationObj.x} cy={stationObj.y} r={SVG_STATION_RADIUS} fill={SVG_STATION_OUTER_CIRCLE_STROKE} />
                <circle cx={stationObj.x} cy={stationObj.y} r={SVG_STATION_RADIUS - 2} fill={SVG_STATION_INNER_CIRCLE_STROKE} />
                <text x={stationObj.x + 15} y={stationObj.y - 15} fontSize={SVG_STATION_NAME_FONT_SIZE} fill={SVG_STATION_NAME_FONT_COLOR} textAnchor="bottom">
                    {stationObj.trunicatedName.split('\n').map((line, i) => (
                        <tspan key={i} x={stationObj.x + 10} dy="1.2em">
                        {line}
                        </tspan>
                    ))}
                </text>
            </g>
        ));
    }

    renderConnections() {
        return Object.entries(this.state.stations).map(([stationName, stationObj]) => {
            const [x, y] = [stationObj.x, stationObj.y];
    
            return Object.entries(stationObj.neighbours).map(([neighbourStationName, neighbour]) => {
                const [x2, y2] = [
                    this.state.stations[neighbourStationName].x,
                    this.state.stations[neighbourStationName].y
                ];
                const colours = Array.from(neighbour.lines).map(metroLine => this.state.railwayLines[metroLine]);
                const shiftAmount = (colours.length - 1) * 2;
    
                return (
                    <g key={`${stationName}-${neighbourStationName}`}>
                        {colours.map((colour, lineIndex) => (
                            <line
                                key={lineIndex}
                                x1={x + (lineIndex * 2 - shiftAmount)}
                                y1={y + (lineIndex * 2 - shiftAmount)}
                                x2={x2 + (lineIndex * 2 - shiftAmount)}
                                y2={y2 + (lineIndex * 2 - shiftAmount)}
                                stroke={colour}
                                strokeWidth={SVG_CONNECTION_STROKE_WIDTH}
                            />
                        ))}
                    </g>
                );
            });
        });
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

    render() {
        return (
            <div className="svg-container" ref={this.svgContainerRef}>
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
                    preventPanOutside={true}>
                    <svg width={SVG_MAP_WIDTH} height={SVG_MAP_HEIGHT}>
                        {this.renderGridLines()}
                        {this.renderConnections()}
                        {this.renderCircles()}
                    </svg>
                </ReactSVGPanZoom>
            </div>
        );
    }
}


export default MapCanvas;