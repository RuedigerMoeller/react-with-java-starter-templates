import React from 'react';
import ReactDOM from 'react-dom';
import {KClient} from 'kontraktor-client'; // java connectivity + required by hot reloading internally
import {App} from './common/app';

if ( typeof _kHMR === 'undefined' ) { // avoid re-execution on hot reload
  // required for hot reloading
  window._kreactapprender = ReactDOM.render(App,document.getElementById("root"));
}
