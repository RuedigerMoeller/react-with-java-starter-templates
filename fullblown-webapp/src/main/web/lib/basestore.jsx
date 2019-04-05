import {EventEmitter} from 'events';
import {KClient,KClientListener} from 'kontraktor-client';
import {toES6Prom} from "./util";
import {App} from "../app/app"; // java connectivity + required by hot reloading internally

export class BaseStoreImpl {

  constructor() {
    this.server = null;
    this.session = null;
    this.kclient = null;
    this.logindata = null;
    this.emitter = new EventEmitter(); // keep things simple: app is main component + emitter
  }

  addListener(name,listener) {
    this.emitter.addListener(name,listener);
  }

  removeListener(name,listener) {
    this.emitter.removeListener(name,listener);
  }

  isLoggedIn() {
    return !!this.session;
  }

  getUser() {
    return this.logindata.user;
  }

  onSessionEvent(event,err) {
    console.log("session event",event,err);
    switch ( event.type ) {
      case 'user':
        this.logindata.user = event.data.newRecord;
        App().forceUpdate();
        break;
      case 'discussionChange':
        this.emitter.emit(event.type,event.data);
    }
  }

  login(name,password) {
    return new Promise( (resolve,reject) => {
      this.connectIfNecessary()
        .then( r => {
          if ( this.server ) {
            this.server.ask("login",name,password, (event,err) => this.onSessionEvent(event,err) ) // returns KPromise !!
              .then( (ldata,error) => {
                if ( error ) {
                  this.emitter.emit("login", "login failed");
                  reject(""+error);
                } else {
                  this.session = ldata.session;
                  this.logindata = ldata;
                  resolve(ldata.session);
                  this.emitter.emit("login", "logged in");
                  console.log("successfully logged in");
                }
              });
          } else {
            reject("not connected");
            this.emitter.emit("connection", "not connected");
          }
        })
        .catch( e => {
          reject("not connected:"+e);
          this.emitter.emit("connection", "not connected");
        });
    });
  }

  register(data) {
    return new Promise( (resolve, reject) => {
      this.connectIfNecessary()
        .then( r => {
          this.server.ask("register",data).then( (r,e) => e ? reject(e) : resolve(r) );
        })
        .catch( e => reject(e));
    });
  }

  _initKClient(kclient) {
    this.kclient.coder.registerDecoder("MapRecord",
      obj => {
        const newObj = obj.map;
        newObj._key = obj.key;
        newObj._typ = obj._typ;
        return newObj;
      }
    );
    this.kclient.coder.registerDecoder("set",
      obj => {
        obj.splice(0,1);
        return obj;
      }
    );
    this.kclient.coder.registerDecoder("map",
      obj => {
        const res = {};
        for ( let i = 0; i < obj.length; i+=2)
          res[obj[i]] = obj[i+1];
        res._typ = obj._typ;
        return res;
      }
    );
    this.kclient.listener = new class extends KClientListener {
      // session timeout or resurrection fail
      onInvalidResponse(response) {
        //TODO enforce full app reset
        console.error("invalid response",response);
      }
      onResurrection() {
        //TODO refresh app data from server in case
        console.log("session resurrected. should update client data + resubscribe streams in case");
      }
    };
  }

  connectIfNecessary() {
    return new Promise( (resolve, reject ) => {
      if ( ! this.server ) {
        this.kclient = new KClient().useProxies(false);
        this._initKClient(this.kclient);

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

  ///////////////////////////////// server calls /////////////////////////////////////////

  uploadImage(base64String, imageType ){
    return new Promise((resolve, reject)=> {
      if( !this.session ){
        reject("Bitte zuerst einloggen ... ")
      }else{
        this.session.ask("uploadImage",base64String,imageType).then((result,error)=> {
          if( result )
          {
            resolve(result);
          }else{
            reject(error);
          }
        })
      }
    });
  }

  saveProfile(data) {
    return toES6Prom(this.session.ask("saveProfile",data));
  }

  // comments

  getOrCreateDiscussion(commentTreeKey) {
    return toES6Prom( this.session.ask("getOrCreateDiscussion",commentTreeKey));
  }

  editComment(commentTreeKey, commentId, text0 ) {
    return toES6Prom( this.session.ask("editComment",commentTreeKey,commentId,text0) );
  }

  addComment(commentTreeKey, parentCommentId, text0 ) {
    return toES6Prom( this.session.ask("addComment",commentTreeKey,parentCommentId,text0) );
  }

  delComment(commentTreeKey, nodeId) {
    return toES6Prom( this.session.ask("delComment",commentTreeKey,nodeId) );
  }
}

const theStore = {};
export function Store() {
  return theStore.get;
}
export function setStore(store) {
  theStore.get = store;
}