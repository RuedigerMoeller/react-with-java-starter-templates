import {BaseStoreImpl, setStore, Store} from "../lib/basestore";

export class StoreImpl extends BaseStoreImpl {

}

setStore( new StoreImpl() );