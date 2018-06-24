import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './grid.css';

const gridX = ['a','b','c','d','e'];
const gridY = ['5','4','3','2','1'];
const direction = [
    270,
    0,
    90,
    180,
];

export class Grid extends Component {
    renderDrone(showDrone, current) {
        if (!showDrone || !current) {
            return;
        }
        const attr = direction[current.direction];
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
                <div className='col' key={`${y}${x}`}>
                    <div className='col-label'>{y}:{x.toUpperCase()}</div>
                    {this.renderDrone(showDrone, current)}
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