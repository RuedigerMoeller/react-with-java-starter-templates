import React, {Component} from 'react';
import {StoreImpl} from "./store";
import {setStore, Store} from "../lib/basestore"; // java connectivity + required by hot reloading internally
import {SemanticApp} from "../lib/semanticapp";
import {AppPage} from "../lib/apppage";

const theApp = {};

// initialize Store
if ( typeof _kHMR === 'undefined' ) { // avoid re-execution on hot reload
  setStore( new StoreImpl() );
}

export class MyApp extends SemanticApp {

  constructor(p) {
    super(p);
    theApp.get = this;
    this.state = { msg: ""};
    //_DEV_
    console.log("App Created")
    //_EDEV_
  }

  componentDidMount() {
    super.componentDidMount();
  }

  getLoggedInSections() {
    return [
      // new AppPage("home","Dashboard",<Discussion style={{width: "90%", marginBottom: 20}}/>),
      new AppPage("home","Dashboard",<div>Welcome</div>),
      new AppPage("search","Suche..",<div>Suche</div>),
      new AppPage("sample","Meine Beispiele",<div>Hallo</div>),
      new AppPage("profile","Mein Profil",this.getProfileScreen())
    ]
  }

}

export const AppElem = <MyApp/>;
export function App() { return theApp.get }