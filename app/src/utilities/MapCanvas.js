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

  drawStations(stations) {
    for (let [stationName, stationObj] of Object.entries(stations)) {
      this.drawStation(stationObj);
      console.log(stationObj.x, stationObj.y);
    }
  }

  drawStation(stationObj) {
    this.ctx.beginPath();
    this.ctx.arc(stationObj.x, stationObj.y, 3, 0, 2 * Math.PI, false);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#000'; // You can set your desired border color
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.fillText(stationObj.name, stationObj.x, stationObj.y);
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
