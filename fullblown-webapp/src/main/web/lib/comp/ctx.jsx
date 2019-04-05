import React, {Component} from 'react';

export class Ctx extends Component {

  render() {
    return React.Children.map(this.props.children,
      (ch) => {
        if ( ch && ch.type && ch.type.isComp && ch.type.isComp() ) {
          const props = {
            ctx: this.getContextObject()
          };
          if ( ch.props.showLabel === undefined && this.props.showLabel !== undefined) {
            props.showLabel = this.props.showLabel;
          }
          return React.cloneElement(ch, props );
        } else
          return ch;
      });
  }

  getContextObject() {
    return this.props.ctx;
  }
}

export class FormCtx extends Ctx {

  constructor(p) {
    super(p);
    this.comps = {};
  }

  getContextObject() {
    return this;
  }

  getObjectValue(did) {
    const comp = this.comps[did];
    if ( comp )
      return comp.getValue();
    return null;
  }

  isValid() {
    return Object.values(this.comps).reduce( (acc,comp) => acc&&comp.isValid(), true );
  }

  getValue(did) {
    const comp = this.comps[did];
    if ( comp )
      return comp.getValue();
    return null;
  }

  setObjectValue(did,oval) {
    const comp = this.comps[did];
    if ( comp )
      comp.setObjectValue(oval);
  }

  setValue(did,val) {
    const comp = this.comps[did];
    if ( comp )
      comp.setValue(val);
  }

  getData() {
    const res = {};
    Object.keys(this.comps).forEach( key => res[key] = this.getObjectValue(key));
    return res;
  }

  setData(data) {
    Object.keys(data).forEach( key => this.setObjectValue(data[key]));
  }

}