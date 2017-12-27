import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {KClient} from 'kontraktor-client'; // java connectivity + required by hot reloading internally

let kclient = null;
export class App extends Component {

  constructor(p) {
    super(p);
    this.state = { msg: ""}
  }

  componentDidMount() {
    if ( ! kclient ) {
      kclient = new KClient().useProxies(false);
      kclient.connect("/api")
      .then( (server,error) => { // KPromise (!, differs from ES6 promise unfortunately)
        if ( server ) {
          server.ask("greet", "me")
          .then( (greeting, error) => this.setState({ msg:greeting ? greeting : ""+error }) );
        } else
          this.setState({ msg: ""+error });
      });
    }
  }

  render() {
    return <p>Hello React {this.state.msg ? "and "+this.state.msg : '' }!</p>
  }

}

if ( typeof _kHMR === 'undefined' ) { // avoid re-execution on hot reload
  const app = <App/>;
  // required for hot reloading
  window._kreactapprender = ReactDOM.render(app,document.getElementById("root"));
}
