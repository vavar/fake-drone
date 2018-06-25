import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {gridX, gridY, cssDirections} from '../../constants';
import './grid.css';


export class Grid extends Component {
    renderDrone(showDrone, current) {
        if (!showDrone || !current) {
            return;
        }
        const attr = cssDirections[current.direction];
        return (
            <FontAwesomeIcon icon='plane' size='3x' transform={{ rotate: attr }}/>
        );
    }
    renderGrid() {
        const { current } = this.props;
        const droneVisible = !!current;
        const grid = gridY.map((y,yindex) => gridX.map((x,xindex) => {
            const droneXIndex = xindex;
            const droneYIndex = 4 - yindex;
            const showDrone = (droneVisible && current.x === droneXIndex && current.y === droneYIndex );
            return (
                <div className='col' key={`${x}${y}`}>
                    <div className='col-label'>{x.toUpperCase()}:{y}</div>
                    <div className='col-drone'>{this.renderDrone(showDrone, current)}</div>
                </div>
            );
        }));
        return grid;
    }
    render() {
        return (
            <section className='drone-grid'>
                {this.renderGrid()}
            </section>
        );
    }
}