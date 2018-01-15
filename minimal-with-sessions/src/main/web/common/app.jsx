import React, {Component} from 'react';
import {EventEmitter} from 'events';
import {Store} from 'store';

export class MyApp extends Component {

  constructor(p) {
    super(p);
    this.state = { msg: ""};
  }

  componentDidMount() {
    Store.connect();
  }

  loginClicked() {
    Store.login("someusername","secret")
      .then( succ => {
        Store.greet("Somebody")
          .then( r => this.setState({msg:r}))
          .catch( er => this.setState({msg:er}) )
      })
      .catch( e => this.setState({sessionmsg: 'login failure '+e}));
  }

  render() {

    const pstyle = {color: '#fff', fontWeight: 'bold', fontSize: 20};
    return (
      <div style={{
        width:"100%", backgroundColor: '#8bf',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        padding: 20
      }}>
        <p style={pstyle}>Hello React {this.state.msg ? "and "+this.state.msg : '' }!</p>
        <button style={{padding: 8}} onClick={()=>this.loginClicked()}>DummyLogin</button>
        <br/>
        {this.state.sessionmsg && <p style={pstyle}>{this.state.sessionmsg}</p>}
      </div>
    );
  }

}

export let App = <MyApp/>;
