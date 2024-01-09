import React, { Component } from 'react';

class MapCanvas extends Component {
    constructor(props) {
        super(props);

        this.svgRef = React.createRef();
        this.svgContainer = React.createRef();

        this.state = {
            pan: { x: 0, y: 0 },
            scale: 1,
            dragging: false,
            startPan: { x: 0, y: 0 },
            circles: [],
            connections: [],
        };

        this.STATION_RADIUS = 6;
    }

    handleWheel = (e) => {
        const { scale, pan } = this.state;
        const scaleFactor = 0.001;  // Adjust this factor for slower or faster zooming
        const newScale = scale + e.deltaY * scaleFactor;
        const limitedScale = Math.max(0.5, Math.min(5, newScale));
    
        this.setState({
            scale: limitedScale,
        });
    
        // Adjust the pan to keep the zoom centered on the mouse position
        const rect = this.svgContainer.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const deltaX = (mouseX - pan.x) * (1 - limitedScale / scale);
        const deltaY = (mouseY - pan.y) * (1 - limitedScale / scale);
        this.setState({
            pan: { x: pan.x - deltaX, y: pan.y - deltaY },
        });
    };
    

    handleMouseDown = (e) => {
        this.setState({
            dragging: true,
            startPan: { x: e.clientX, y: e.clientY },
        });
    };

    handleMouseMove = (e) => {
        const { dragging, startPan, pan, scale } = this.state;
        if (!dragging) return;

        const dx = e.clientX - startPan.x;
        const dy = e.clientY - startPan.y;

        this.setState({
            pan: { x: pan.x + dx, y: pan.y + dy },
            startPan: { x: e.clientX, y: e.clientY },
        });
    };

    handleMouseUp = () => {
        this.setState({ dragging: false });
    };

    componentDidMount() {
        const svgContainer = this.svgContainer.current;

        svgContainer.addEventListener('wheel', this.handleWheel);
        svgContainer.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
        const svgContainer = this.svgContainer.current;

        svgContainer.removeEventListener('wheel', this.handleWheel);
        svgContainer.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    drawStation = (cx, cy, radius, name) => {
        this.setState(prevState => ({
            circles: [...prevState.circles, { cx, cy, radius, name }]
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

    render() {
        const { pan, scale } = this.state;

        return (
            <div
                className='svg-container'
                ref={this.svgContainer}
                style={{ width: '100%', height: '100%', overflow: 'hidden', userSelect: 'none' }}
            >
                <svg
                    className='metro-map'
                    ref={this.svgRef}
                    width={4000}
                    height={3000}
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
                >
                    {this.renderCircles()}
                    {this.renderConnections()}
                </svg>
            </div>
        );
    }
}

export default MapCanvas;
