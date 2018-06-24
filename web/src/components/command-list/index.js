import React, { Component } from 'react';
import ShortUniqueId from 'short-unique-id';
 
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
            <div className='command-list'>
                {this.renderCommands()}
            </div>
        );
    }
}