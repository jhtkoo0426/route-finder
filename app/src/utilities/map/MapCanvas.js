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
} from '../Constants';



// This class implements the SVG representation of a metro map. It should be
// initialized in the render() method in App.js
class MapCanvas extends PureComponent {
    constructor(props) {
        super(props);

        this.Viewer = createRef();
        this.state = {
            tool: TOOL_AUTO,        // ReactSVGPanZoom component config
            value: INITIAL_VALUE,   // ReactSVGPanZoom component config
            stations: [],           // Collection of all metro stations
            connections: [],        // Collection of all connections between metro stations
            railwayLines: null,     // Colour map for metro lines
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
                </svg>
            </ReactSVGPanZoom>
        );
    }

    render() {
        return (
            <div className="svg-container" ref={this.svgContainerRef}>
                {this.renderMap()}
            </div>
        );
    }
}


export default MapCanvas;