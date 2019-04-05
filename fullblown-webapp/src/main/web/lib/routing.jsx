import React, {Component} from 'react';
import createHistory from 'history/createHashHistory';

const history = createHistory();
const paramSeparator = "/";
class Router {

  push(path,state) {
    history.push(path,state);
  }

  /**
   * return the current navigation view.
   * @returns {string}
   */
  getCurrentRoute(){
    const result = history.location.pathname.slice(1).split(paramSeparator)[0];
    return result;
  }

  // location,action => {}
  // returns unsubscribe method
  listen(fun) {
    return history.listen(fun);
  }

  location() {
    return history.location;
  }

}

export const Routing = new Router();