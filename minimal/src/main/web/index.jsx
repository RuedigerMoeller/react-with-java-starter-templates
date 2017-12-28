import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {KClient} from 'kontraktor-client'; // java connectivity + required by hot reloading internally

export class App extends Component {

  constructor(p) {
    super(p);
    this.state = { msg: ""};
    this.server = null;
  }

  componentDidMount() {
    if ( ! this.server ) {
      this.kclient = new KClient().useProxies(false);
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

  render() {
    return <div style={{width: "100%", backgroundColor: '#abf', padding: 50}}>
      <p style={{color: '#fff', fontSize: 30, fontWeight: 'bold'}}>Hello React {this.state.msg ? "and "+this.state.msg : '' }!</p>
    </div>
  }

}

if ( typeof _kHMR === 'undefined' ) { // avoid re-execution on hot reload
  const app = <App/>;
  // required for hot reloading
  window._kreactapprender = ReactDOM.render(app,document.getElementById("root"));
}
