import {KClient,KClientListener} from 'kontraktor-client'; // java connectivity + required by hot reloading internally
import {EventEmitter} from 'events';

class StoreImpl {

  constructor() {
    this.emitter = new EventEmitter(); // keep things simple: app is main component + emitter
    this.server = null;
    this.session = null;
  }

  addListener(name,listener) {
    this.emitter.addListener(name,listener);
  }

  removeListener(name,listener) {
    this.emitter.removeListener(name,listener);
  }

  connect() {
    return new Promise( (resolve, reject) => {
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
            resolve(server);
          } else
            reject(error);
        });
      } else {
        resolve( this.server );
      }
    });
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
            }
          });
      } else {
        reject("not connected");
        this.emitter.emit("connection", "not connected");
      }
    });
  }

  greet(whom) {
    return new Promise( (resolve,reject) => {
      this.server.ask("greet",whom)
        .then( (re,er) => {
          if ( er ) reject(er);
          else resolve(re);
        })
    });
  }

}

export const Store = new StoreImpl();