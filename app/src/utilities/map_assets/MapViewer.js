import React, { PureComponent, createRef } from 'react';
import { INITIAL_VALUE, ReactSVGPanZoom, TOOL_AUTO } from 'react-svg-pan-zoom';
import {
    SVG_MAP_SCALE_MIN,
    SVG_MAP_SCALE_MAX,
    SVG_MAP_SCALE_SPEED,
    SVG_VIEWER_INITIAL_PAN_X,
    SVG_VIEWER_INITIAL_PAN_Y,
    SVG_MAP_DEFAULT_ZOOM_FACTOR
} from '../Constants';



class MapViewer extends PureComponent {
    constructor(props) {
        super(props);
        this.Viewer = createRef();
        this.state = {
            tool: TOOL_AUTO,                        // ReactSVGPanZoom component config
            value: INITIAL_VALUE,                   // ReactSVGPanZoom component config
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            mapWidth: window.innerWidth * 0.8,      // Scale factor adjusts to grid width
        };
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

    setViewerPosition(x, y) {
        this.Viewer.current.setPointOnViewerCenter(x, y, SVG_MAP_DEFAULT_ZOOM_FACTOR);
    }

    handleResize = () => {
        this.setState({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            mapWidth: window.innerWidth * 0.8,
        });
        this.Viewer.current.fitToViewer();
    };

    render() {
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
                disableDoubleClickZoomWithToolAuto={true}
            >
                {this.props.children}
            </ReactSVGPanZoom>
        );
    }
}

export default MapViewer;
