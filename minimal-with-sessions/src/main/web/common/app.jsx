import React, {Component} from 'react';
import {KClient,KClientListener} from 'kontraktor-client'; // java connectivity + required by hot reloading internally
import {EventEmitter} from 'events';

export class MyApp extends Component {

  constructor(p) {
    super(p);
    this.state = { msg: ""};
    this.server = null;
    this.session = null;
    this.emitter = new EventEmitter(); // keep things simple: app is main component + emitter
  }

  addListener(name,listener) {
    this.emitter.addListener(name,listener);
  }

  removeListener(name,listener) {
    this.emitter.removeListener(name,listener);
  }

  componentDidMount() {
    if ( ! this.server ) {
      this.kclient = new KClient().useProxies(false);

      this.kclient.listener = new class extends KClientListener {
        // session timeout or resurrection fail
        onInvalidResponse(response) {
          //TODO enforce full app reset
          console.error("invalid response",response);
        }
        onResurrection() {
          //TODO refresh app data from server in case
          console.log("session resurrected. should update client data + resubscribe streams in case")
        }
      };

      this.kclient.connect("/api")
      .then( (server,error) => { // KPromise (!, differs from ES6 promise unfortunately)
        if ( server ) {
          this.server = server;
          server.ask("greet", "me")
          .then( (greeting, error) => this.setState({ msg:greeting ? greeting : ""+error }) );
        } else
          this.setState({ msg: ""+error });
      });
    }
  }

  login(name,password) {
    return new Promise( (resolve,reject) => {
      if ( this.server ) {
        this.emitter.emit("connection", "connected");
        this.server.ask("login",name,password) // returns KPromise !!
          .then( (sess,error) => {
            if ( error ) {
              this.emitter.emit("login", "login failed");
              reject(""+error);
            } else {
              this.session = sess;
              resolve(sess);
              this.emitter.emit("login", "logged in");
              console.log("successfully logged in");
              this.greetSession();
            }
          });
      } else {
        reject("not connected");
        this.emitter.emit("connection", "not connected");
      }
    });
  }

  greetSession() {
    this.session.ask("greetFromSession") // KPromise !!
      .then( (res,err) => this.setState({sessionmsg: res}));
  }

  loginClicked() {
    this.login("someusername","secret")
      .then( succ => {
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
