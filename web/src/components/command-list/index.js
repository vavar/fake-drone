import React, { Component } from 'react';
import ShortUniqueId from 'short-unique-id';

import './command-list.css';

const uid = new ShortUniqueId();

export class CommandList extends Component {
    renderCommands() {
        const { commands } = this.props;
        const content = commands.map(command => {
            return (
                <div className='command-item' key={uid.randomUUID(6)}>{command}</div>
            );
        });
        return content;
    }

    render() {
        return (
            <div className='command-list container'>
                <div className='title'><h3>Command History</h3></div>
                <div className='list'>
                    {this.renderCommands()}
                </div>
            </div>
        );
    }
}