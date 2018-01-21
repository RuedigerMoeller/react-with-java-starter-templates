import {EventEmitter} from 'events';
import {KClient,KClientListener} from 'kontraktor-client'; // java connectivity + required by hot reloading internally

class StoreImpl {

  constructor() {
    this.server = null;
    this.session = null;
    this.kclient = null;
    this.emitter = new EventEmitter(); // keep things simple: app is main component + emitter
  }

  addListener(name,listener) {
    this.emitter.addListener(name,listener);
  }

  removeListener(name,listener) {
    this.emitter.removeListener(name,listener);
  }

  login(name,password) {
    return new Promise( (resolve,reject) => {
      if ( this.server ) {
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
    // convert kontraktor promise to es6 promise
    return new Promise( (resolve,reject) => {
      // IMPORTANT: in case of void methods use 'tell' (else memleakage)
      this.session.ask("greetSession") // KPromise !!
      .then( (res,err) => {
        if ( !err ) resolve(res); else reject(err);
      });
    });
  }

  greetServer(who) {
    // convert kontraktor promise to es6 promise
    return new Promise( (resolve,reject) => {
      // IMPORTANT: in case of void methods use 'tell' (else memleakage)
      this.server.ask("greetServer", who) // KPromise !!
      .then( (res,err) => {
        if ( !err ) resolve(res); else reject(err);
      });
    });
  }

  connectIfNecessary() {
    return new Promise( (resolve, reject ) => {
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
            this.emitter.emit("connection", "connected");
          } else
            reject(""+error);
        });
      } else
        resolve( this.server );
    });
  }

}


export let Store = null;
if ( typeof _kHMR === 'undefined' ) { // avoid re-execution on hot reload
  Store = new StoreImpl();
}