import React, {Component} from 'react';
import {KClient} from 'kontraktor-client';
import {Store} from "./store"; // java connectivity + required by hot reloading internally

export class MyApp extends Component {

  constructor(p) {
    super(p);
    this.state = { msg: ""};
  }

  componentDidMount() {
    Store.connectIfNecessary()
    .then( server => {
      Store.greetServer("random")
      .then( res => this.setState({msg:res}))
      .catch( res => this.setState({msg:res}))
    });
  }

  loginClicked() {
    Store.login("someusername","secret")
    .then( succ => {
      Store.greetSession()
      .then( r => this.setState({sessionmsg:r}))
      .catch( e => this.setState({sessionmsg:r}) );
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
