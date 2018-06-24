import React, { Component } from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import { Grid, CommandList } from './components';

import { library } from '@fortawesome/fontawesome-svg-core' // eslint-disable-next-line
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faPlane } from '@fortawesome/free-solid-svg-icons'

import './App.css';

library.add(faPlane);

const ENTER_KEY = 13;

function isValidCommand(command) {
  return _.includes(['PLACE','MOVE','LEFT','RIGHT'], command);
}

function getQueryString(params) {
  if (_.isEmpty(params)) {
    return '';
  }

  const [x,y,f] = params.toLowerCase().split(',');
  return `?${queryString.stringify({x,y,f})}`;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      droneName: 'ABC',
      newCommand: '',
      errorMessage: '',
      current: null,
      commands: [],
    };
    this.onCommandChange = this.onCommandChange.bind(this);
    this.onCommandKeyDown = this.onCommandKeyDown.bind(this);
    this.onDroneNameChange = this.onDroneNameChange.bind(this);
  }

  onDroneNameChange(event) {
    this.setState({droneName: event.target.value.toUpperCase(), commands: []});
  }

  onCommandChange(event) {
    this.setState({ newCommand: event.target.value.toUpperCase() });
  }

  async onCommandKeyDown(event) {
    if (event.keyCode !== ENTER_KEY) {
        return;
    }

    event.preventDefault();
    var val = this.state.newCommand.trim();

    if (val) {

      const [command, params] = val.split(' ');

      if (!isValidCommand(command)) {
        return;
      }

      const qs = getQueryString(params);
      const { droneName, commands } = this.state;
      try {
        const response = await fetch(`/api/drone/${droneName.toLowerCase()}/actions/${command.toLowerCase()}${qs}`);
        if (response.status === 200 ) {
          const current = await response.json();
          commands.push(val);
          this.setState({newCommand: '', commands, current});
        }
      }catch(err){
        console.log(err);
      }
    }
  }

  render() {
    const { droneName, commands, current, newCommand, errorMessage } = this.state;
    return (
      <div className='App'>
        <div className='drone-name input-group'>
          <label htmlFor='droneName'>Fake Drone Name:</label>
          <div>
            <div><input type='text' name='droneName' value={droneName} onChange={this.onDroneNameChange}></input></div>
          </div>
        </div>
        <div className='new-command input-group'>
            <label htmlFor='newCommand'>New Command:</label>
            <div>
              <input type='text' name='newCommand' value={newCommand} 
                onChange={this.onCommandChange}
                onKeyDown={this.onCommandKeyDown}/>
              <span>{errorMessage}</span>
            </div>
        </div>
        <Grid current={current}/>
        <CommandList commands={commands}/>
      </div>
    );
  }
}

export default App;
