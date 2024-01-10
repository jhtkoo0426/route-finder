import React, { Component } from 'react';
import { INITIAL_VALUE, ReactSVGPanZoom, TOOL_AUTO } from 'react-svg-pan-zoom';


class MapCanvas extends Component {
    constructor(props) {
        super(props);

        this.Viewer = React.createRef();
        this.state = {
            tool: TOOL_AUTO,
            value: INITIAL_VALUE,
            circles: [],
            connections: [],
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            mapWidth: window.innerWidth * 0.8,
        };
        this.STATION_RADIUS = 6;
        this.GAP_SIZE = 60;
        this.SVG_MAP_WIDTH = 4000;
        this.SVG_MAP_HEIGHT = 3000;
    }

    drawStation = (cx, cy, radius, name) => {
        this.setState((prevState) => ({
            circles: [...prevState.circles, { cx, cy, radius, name }],
        }));
    };

    drawConnection(stations, stationName, colourMap) {
        const stationObj = stations[stationName];
        const [x, y] = [stationObj.x, stationObj.y];
    
        Object.entries(stationObj.neighbours).forEach((neighbour) => {
            const neighbourStationName = neighbour[0];
            const metroLines = Array.from(neighbour[1].lines); // Convert Set to array
            const neighbourStationObj = stations[neighbourStationName];
            const [x2, y2] = [neighbourStationObj.x, neighbourStationObj.y];
    
            // Use functional form of setState for correct state updates
            this.setState(prevState => ({
                connections: [
                    ...prevState.connections,
                    { x, y, x2, y2, colours: metroLines.map(metroLine => colourMap[metroLine]) }
                ]
            }));
        });
    }

    renderCircles() {
        const { circles } = this.state;
    
        return circles.map((circle, index) => (
            <g key={index}>
                <circle cx={circle.cx} cy={circle.cy} r={this.STATION_RADIUS} fill="black" />
                <circle cx={circle.cx} cy={circle.cy} r={this.STATION_RADIUS - 2} fill="white" />
                <text x={circle.cx + 15} y={circle.cy - 15} fontSize="10" fill="black" textAnchor="bottom">
                    {this.transformStationName(circle.name).split('\n').map((line, i) => (
                    <tspan key={i} x={circle.cx + 10} dy="1.2em">
                        {line}
                    </tspan>
                    ))}
                </text>
            </g>
        ));
    }

    renderConnections() {
        const { connections } = this.state;
    
        return connections.map((connection, index) => {
            const { x, y, x2, y2, colours } = connection;
            const shiftAmount = (colours.length - 1) * 2; // Calculate the shift amount based on the number of colours
    
            return (
                <g key={index}>
                    {colours.map((colour, lineIndex) => {
                        // Calculate the adjusted positions based on the shift amount
                        const adjustedX1 = x + (lineIndex * 2 - shiftAmount);
                        const adjustedY1 = y + (lineIndex * 2 - shiftAmount);
                        const adjustedX2 = x2 + (lineIndex * 2 - shiftAmount);
                        const adjustedY2 = y2 + (lineIndex * 2 - shiftAmount);
    
                        return (
                            <line
                                key={lineIndex} x1={adjustedX1} y1={adjustedY1} x2={adjustedX2} 
                                y2={adjustedY2} stroke={colour} strokeWidth="3"
                            />
                        );
                    })}
                </g>
            );
        });
    }

    renderGridLines() {
        const gridSizeX = Math.ceil(this.SVG_MAP_WIDTH / this.GAP_SIZE);
        const gridSizeY = Math.ceil(this.SVG_MAP_HEIGHT / this.GAP_SIZE);
        console.log(gridSizeX, gridSizeY)

        const verticalLines = Array.from({ length: gridSizeX + 1 }, (_, index) => (
            <line
                key={`vertical-${index}`} x1={index * this.GAP_SIZE} y1={0} x2={index * this.GAP_SIZE} 
                y2={this.SVG_MAP_HEIGHT} stroke="#ddd" strokeWidth="1"
            />
        ));

        const horizontalLines = Array.from({ length: gridSizeY + 1 }, (_, index) => (
            <line
                key={`horizontal-${index}`} x1={0} y1={index * this.GAP_SIZE} x2={this.SVG_MAP_WIDTH + 21}
                y2={index * this.GAP_SIZE} stroke="#ddd" strokeWidth="1"
            />
        ));

        return (
            <g>
                {verticalLines}
                {horizontalLines}
            </g>
        );
    }
    
    transformStationName(name) {
        // Split the input string into an array of words
        const words = name.split(' ');
        
        // Initialize variables to keep track of the current line length and the result string
        let currentLineLength = 0;
        let result = '';
        
        // Iterate through each word
        for (const word of words) {
            // Check if adding the current word exceeds the 12-character limit
            if (currentLineLength + word.length > 8) {
                // If yes, insert a newline before the word
                result += '\n' + word + ' ';
                currentLineLength = word.length + 1; // Reset the line length
            } else {
                // If not, add the word to the result string and update the line length
                result += word + ' ';
                currentLineLength += word.length + 1;
            }
        }
        return result.trim();
    }

    handleResize = () => {
        this.setState({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            mapWidth: window.innerWidth * 0.8,
        });

        // Additionally, you might want to fit the viewer to the updated dimensions
        this.Viewer.current.fitToViewer();
    };

    componentDidMount() {
        this.Viewer.current.fitToViewer();
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    render() {
        return (
            <div
                className='svg-container'
                ref={this.svgContainerRef}
                style={{ width: '100%', height: '100%', overflow: 'hidden', userSelect: 'none' }}
            >
                <ReactSVGPanZoom
                    ref={this.Viewer}
                    width={this.state.mapWidth}
                    height={this.state.screenHeight}
                    tool={this.state.tool}
                    onChangeTool={(tool) => this.setState({ tool })}
                    onChangeValue={(value) => this.setState({ value })}
                    value={this.state.value}
                    onZoom={(e) => {}}
                    onPan={(e) => {}}
                    onClick={(event) => console.log('click', event.x, event.y, event.originalEvent)}
                    detectAutoPan={false}
                    scaleFactorMax={2}
                    scaleFactorMin={0.5}
                    scaleFactorOnWheel={1.05}
                    preventPanOutside={true}
                >
                    <svg width={this.SVG_MAP_WIDTH} height={this.SVG_MAP_HEIGHT}>
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