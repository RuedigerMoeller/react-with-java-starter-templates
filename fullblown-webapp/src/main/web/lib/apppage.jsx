import React, {Component} from 'react';

export class BaseApplicationPage {

  getRoute() {
    return "page"
  }

  getDisplayedTitle() {
    return "page"
  }

  getComponent() {
    return "override this";
  }

  getMenuVisible() {
    return true;
  }

}

export class AppPage extends BaseApplicationPage {

  constructor(route,title,component,menuvisible=true) {
    super();
    this.route = route;
    this.title = title;
    this.component = component;
    this.menuVisible = menuvisible;
  }

  getMenuVisible() {
    return this.menuVisible;
  }

  getRoute() {
    return this.route;
  }

  getDisplayedTitle() {
    return this.title;
  }

  getComponent() {
    return this.component;
  }

}