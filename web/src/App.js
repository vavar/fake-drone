import _ from 'lodash';
import queryString from 'query-string';
import React, { Component } from 'react';
import { Grid, CommandList } from './components';
import { gridX, commands, directions, ENTER_KEY} from './constants';

import { library } from '@fortawesome/fontawesome-svg-core' // eslint-disable-next-line
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faPlane, faListAlt, faKeyboard } from '@fortawesome/free-solid-svg-icons'

import './App.css';

library.add(faPlane, faListAlt, faKeyboard);

function isValidCommand(command) {
  return _.includes(commands, command);
}

function getQueryString(params) {
  if (_.isEmpty(params)) {
    return Promise.resolve('');
  }

  const [inputX,inputY,inputFace] = params.toLowerCase().split(',');
  const x = _.indexOf(gridX, inputX);
  const y = inputY - 1;
  const f = _.indexOf(directions,inputFace)
  if (x === -1 || y === -1 || f === -1) {
    return Promise.reject(new Error('invalid argument for PLACE command'));
  }
  console.log('');
  return Promise.resolve(`?${queryString.stringify({x,y,f})}`);
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
    this.setState({droneName: event.target.value.toUpperCase(), commands: [], current: null});
  }

  onCommandChange(event) {
    this.setState({ newCommand: event.target.value.toUpperCase() });
  }

  componentDidMount() {
    const { droneName } = this.state;
    fetch(`/api/drone/${droneName.toLowerCase()}/status`)
      .then(response => {
        if (response.status === 200 ) {
          return response.json().then(current => {
            this.setState({current});
          });
        }
      })
      .catch(console.log);
  }

  onCommandKeyDown(event) {
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

      const { droneName, commands } = this.state;
      getQueryString(params)
        .then(qs => fetch(`/api/drone/${droneName.toLowerCase()}/actions/${command.toLowerCase()}${qs}`))
        .then(response => {
          if (response.status !== 200 ) {
            this.setState({ errorMessage: 'failed to connect server' });
          }
          return response.json().then( current => {
            commands.unshift(val);
            this.setState({newCommand: '', commands, current, errorMessage: ''});
          }).catch((err) => { 
            console.log(err);
            this.setState({ errorMessage: `Unavailable to process command: ${command}`});
          });
        }).catch(err => {
          this.setState({ errorMessage: err.message });
        });
    }
  }

  showErrorMessage() {
    const { errorMessage } = this.state;
    if (!_.isEmpty(errorMessage)) {
      return (<div><span>{errorMessage}</span></div>)
    }
  }
  render() {
    const { droneName, commands, current, newCommand } = this.state;
    return (
      <div className='App'>
        <div className='drone-name'>
          <div className='icon'><FontAwesomeIcon icon='list-alt' size='2x'/></div>
          <input type='text' name='droneName' value={droneName} 
              onChange={this.onDroneNameChange}
              placeholder='drone name'/>
        </div>
        <div className='new-command'>
          <div className='icon'><FontAwesomeIcon icon='keyboard' size='2x'/></div>
          <input type='text' name='newCommand' value={newCommand} 
              onChange={this.onCommandChange}
              onKeyDown={this.onCommandKeyDown}
              placeholder='command e.g. place a,5,north' />
            {this.showErrorMessage()}
        </div>
        <div className='container'>
          <Grid current={current}/>
          <CommandList commands={commands}/>
        </div>
      </div>
    );
  }
}

export default App;
