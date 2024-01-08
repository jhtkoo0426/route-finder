import React, { Component } from 'react';

class MapCanvas extends Component {
    constructor(props) {
        super(props);

        this.state = {
            scale: 1,
            isDragging: false,
            lastX: 0,
            lastY: 0,
        };

        this.STATION_RADIUS = 6;
        this.LINE_WIDTH = 4;

        this.canvasRef = React.createRef();
    }

    // Invoked immediate after the MapCanvas component has been inserted into the DOM.
    // Performs actions that require interaction with the DOM, e.g. event handlers.
    componentDidMount() {
        this.ctx = this.canvasRef.current.getContext('2d');
        this.canvasRef.current.addEventListener('mousedown', this.handleMouseDown);
        this.canvasRef.current.addEventListener('mousemove', this.handleMouseMove);
        this.canvasRef.current.addEventListener('mouseup', this.handleMouseUp);
        this.canvasRef.current.addEventListener('mouseleave', this.handleMouseUp);
        this.canvasRef.current.addEventListener('wheel', this.handleWheel);
    }

    componentWillUnmount() {
        this.canvasRef.current.removeEventListener('mousedown', this.handleMouseDown);
        this.canvasRef.current.removeEventListener('mousemove', this.handleMouseMove);
        this.canvasRef.current.removeEventListener('mouseup', this.handleMouseUp);
        this.canvasRef.current.removeEventListener('mouseleave', this.handleMouseUp);
        this.canvasRef.current.removeEventListener('wheel', this.handleWheel);
    }

    // Event handlers, such as mouse/wheel handlers.
    handleMouseDown = (e) => {
        this.setState({
            isDragging: true,
            lastX: e.clientX,
            lastY: e.clientY,
        });
    };

    handleMouseMove = (e) => {
        if (this.state.isDragging) {
            const deltaX = e.clientX - this.state.lastX;
            const deltaY = e.clientY - this.state.lastY;

            this.canvasRef.current.style.left = `${this.canvasRef.current.offsetLeft + deltaX}px`;
            this.canvasRef.current.style.top = `${this.canvasRef.current.offsetTop + deltaY}px`;

            this.setState({
                lastX: e.clientX,
                lastY: e.clientY,
            });
        }
    };

    handleMouseUp = () => {
        this.setState({
            isDragging: false,
        });
    };

    handleWheel = (e) => {
        e.preventDefault();
        const scaleDelta = e.deltaY > 0 ? 0.9 : 1.1; // Adjust the scale factor as needed

        this.setState((prevState) => ({
            scale: prevState.scale * scaleDelta,
        }));

        // Adjust the canvas scale directly without clearing or redrawing
        this.canvasRef.current.style.transform = `scale(${this.state.scale})`;
    };

    // Methods for drawing assets on the canvas, including stations and interchanges.
    drawStation(stationName, stationObj) {
        var stationNeighbours = Object.entries(stationObj.neighbours);
        
        // Draw stations: Determine type of station indicator to use.
        if (stationNeighbours.length > 2) {
            // Stations with more than 2 neighbours are represented with a CIRCLE.
            // Draw the black circle first, then the white circle on top.
            this.ctx.beginPath();
            this.ctx.arc(stationObj.x, stationObj.y, this.STATION_RADIUS, 0, 2*Math.PI);
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
            this.ctx.closePath();

            this.ctx.beginPath();
            this.ctx.arc(stationObj.x, stationObj.y, this.STATION_RADIUS-this.LINE_WIDTH/2, 0, 2*Math.PI);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();
            this.ctx.closePath();
        } else {
            // Stations with at most 2 neighbours are represented with a RECTANGLE
            const WIDTH = 2;
            const HEIGHT = 5;
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(stationObj.x, stationObj.y, WIDTH, HEIGHT);
        }

        // Label station name
        this.ctx.font = "10px Arial";
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(stationName, stationObj.x+5, stationObj.y);
    }

    drawConnections(stations, stationName, stationObj, metroLineColourMap) {
        var neighbours = stationObj.neighbours;
        var startStationObj = stations[stationName];
        for (let neighbourStationName in neighbours) {
            var endStationObj = stations[neighbourStationName];

            // Accessing the current station's details
            let stationDetails = neighbours[neighbourStationName];
        
            // Accessing the distance and lines properties
            let lines = stationDetails.lines;
            console.log(lines)

            for (let line of lines) {
              console.log(line)
              this.drawConnection(
                startStationObj.x,
                startStationObj.y,
                endStationObj.x,
                endStationObj.y,
                metroLineColourMap[line]
              )
            }
        }
    }

    drawConnection(x1, y1, x2, y2, colour) {
        // Set line colour before stroke
        this.ctx.beginPath();

        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = this.LINE_WIDTH;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    render() {
        return (
            <canvas
                ref={this.canvasRef}
                className='metro-map'
                width={5000}
                height={5000}
                style={{ position: 'absolute', width: '5000px', height: '5000px', cursor: 'grab' }}
            />
        );
    }
}

export default MapCanvas;
