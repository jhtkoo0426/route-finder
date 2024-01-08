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

    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this.ctx = this.canvasRef.current.getContext('2d');
    this.canvasRef.current.addEventListener('mousedown', this.handleMouseDown);
    this.canvasRef.current.addEventListener('mousemove', this.handleMouseMove);
    this.canvasRef.current.addEventListener('mouseup', this.handleMouseUp);
    this.canvasRef.current.addEventListener('mouseleave', this.handleMouseUp);
  }

  componentWillUnmount() {
    this.canvasRef.current.removeEventListener('mousedown', this.handleMouseDown);
    this.canvasRef.current.removeEventListener('mousemove', this.handleMouseMove);
    this.canvasRef.current.removeEventListener('mouseup', this.handleMouseUp);
    this.canvasRef.current.removeEventListener('mouseleave', this.handleMouseUp);
  }

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

  drawStations(stations, railwayColourMap) {
    for (let [stationName, stationObj] of Object.entries(stations)) {
      this.drawStation(stationName, stationObj, stations, railwayColourMap);
    }
  }

  drawStation(stationName, stationObj, stations, railwayColourMap) {
    var stationNeighbours = Object.entries(stationObj.neighbours);
    
    // Draw stations: Determine type of station indicator to use.
    if (stationNeighbours.length > 2) {
      // Stations with more than 2 neighbours are represented with a CIRCLE
      this.ctx.beginPath();
      this.ctx.arc(stationObj.x, stationObj.y, 3, 0, 2 * Math.PI, false);
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = '#000'; // You can set your desired border color
      this.ctx.stroke();
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
    this.ctx.fillText(stationName, stationObj.x+5, stationObj.y);
  }

  drawConnections(stations, connections, railwayColourMap) {
    for (let [stationName, neighbours] of Object.entries(connections)) {
      neighbours.map(neighbour => {
        var startStationObj = stations[stationName];
        var endStationObj = stations[neighbour.station];
  
        // Set line colour before stroke
        console.log(neighbour.line, railwayColourMap[neighbour.line]);
        this.ctx.beginPath(); // Start a new path
  
        this.ctx.strokeStyle = railwayColourMap[neighbour.line];
        this.ctx.moveTo(startStationObj.x, startStationObj.y);
        this.ctx.lineTo(endStationObj.x, endStationObj.y);
        this.ctx.stroke();
      })
    }
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
