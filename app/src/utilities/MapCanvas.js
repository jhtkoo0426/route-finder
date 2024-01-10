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
                                key={lineIndex}
                                x1={adjustedX1}
                                y1={adjustedY1}
                                x2={adjustedX2}
                                y2={adjustedY2}
                                stroke={colour}
                                strokeWidth="2"
                            />
                        );
                    })}
                </g>
            );
        });
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

    componentDidMount() {
        this.Viewer.current.fitToViewer();
    }
    
    /* Read all the available methods in the documentation */
    // _zoomOnViewerCenter1 = () => this.Viewer.current.zoomOnViewerCenter(1.1);
    // _fitSelection1 = () => this.Viewer.current.fitSelection(40, 40, 200, 200);
    // _fitToViewer1 = () => this.Viewer.current.fitToViewer();

    // /* keep attention! handling the state in the following way doesn't fire onZoom and onPam hooks */
    // _zoomOnViewerCenter2 = () => this.setState({ value: zoomOnViewerCenter(this.state.value, 1.1) });
    // _fitSelection2 = () => this.setState({ value: fitSelection(this.state.value, 40, 40, 200, 200) });
    // _fitToViewer2 = () => this.setState({ value: fitToViewer(this.state.value) });

    render() {
        return (
            <div
                className='svg-container'
                ref={this.svgContainerRef}
                style={{ width: '100%', height: '100%', overflow: 'hidden', userSelect: 'none' }}>
                {/* <h1>ReactSVGPanZoom</h1>
                    <hr />
            
                    <button className="btn" onClick={this._zoomOnViewerCenter1}>Zoom on center (mode 1)</button>
                    <button className="btn" onClick={this._fitSelection1}>Zoom area 200x200 (mode 1)</button>
                    <button className="btn" onClick={this._fitToViewer1}>Fit (mode 1)</button>
                    <hr />
            
                    <button className="btn" onClick={this._zoomOnViewerCenter2}>Zoom on center (mode 2)</button>
                    <button className="btn" onClick={this._fitSelection2}>Zoom area 200x200 (mode 2)</button>
                    <button className="btn" onClick={this._fitToViewer2}>Fit (mode 2)</button>
                    <hr />
                */}
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
                >
                    <svg width={2000} height={2000}>
                        {this.renderConnections()}
                        {this.renderCircles()}
                    </svg>
                </ReactSVGPanZoom>
            </div>
        );
    }
}

export default MapCanvas;