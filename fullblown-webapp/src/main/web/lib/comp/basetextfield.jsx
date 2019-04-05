import React, {Component} from 'react';
import { Input, Popup, Icon, Label } from 'semantic-ui-react';

export const isNil = (val) => {
  return val === undefined || val === null || val === "" ||
    (val.constructor.name == "Array" && val.length === 0) ||
    (val.constructor.name == "Map" && val.size === 0);
};

export const validateUrl = function(url) {
  const re = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
  return re.test(url.toLowerCase());
};

export const validateOnlyLetters = function(checkString) {
  const re = /^[a-z A-Z]*$/;
  return re.test(checkString.toLowerCase());
};

export const validatePhoneNumber = function(checkString) {
  const re = /^[-+]?(?=.*\d)[\d \(\)]+$/;
  return re.test(checkString.toLowerCase());
};

export function omit(props,...propsToStrip) {
  return Object.keys(props).reduce((result, key) => {
    if( !propsToStrip.includes(key) ) {
      result[key] = props[key];
    }
    return result;
  }, {});
}

/**
 * values:
 * * getValue setValue - pure text value
 * * getObjectValue setObjectValue - object value (e.g. date) default to value
 *
 * events:
 * * onValid( val, component ) - fires only if validity state changes !!
 * * onValue( newval, willItBeValid, component)
 *
 * props:
 * * default - initial value
 * * disabled
 */
export class BaseTextField extends Component {

  static isComp() { return true; };
  static getDid() { return "text" }
  static getDefault() { return "" }
  static getIcon(){ return null }
  static getLabel() { return "default label" }
  static getPlaceholder() { return this.getLabel() }
  static getValidationText() { return "validation failure" }
  static getHelp() { return this.getValidationText()};

  constructor(props) {
    super(props);
    const value = isNil(props.value) ? this.getDefault() : props.value;
    this.state = {
      valid: false,
      value: value
    };
  }

  componentDidMount() {
    if ( this.props.ctx && this.props.ctx.comps ) {
      this.props.ctx.comps[this.getDid()] = this;
    }
    if (this.props.getObjectValue)
      this.setObjectValue(this.props.getObjectValue);
    else if ( this.props.defaultValue )
      this.setObjectValue(this.props.defaultValue);
    else
      this.doValidate(this.state.value,'');
  }

  componentWillReceiveProps(nextProps) {
    const valueIsGiven = (nextProps.value !== undefined && nextProps.value !== null);
    // do not test props.objectValue here, otherwise datatable is not editable any more ...
    const valueIsDifferent = (nextProps.value || nextProps.value === 0) && nextProps.value != this.state.value;
    if (valueIsGiven && valueIsDifferent){
      if ( typeof nextProps.getObjectValue !== 'undefined') {
        this.setObjectValue(nextProps.getObjectValue);
      } else {
        this.setValue(nextProps.value);
      }
    }
  }

  getDefault(){
    return this.props.default || this.props.getObjectValue || this.constructor.getDefault();
  }

  getDid() {
    if ( ! this.constructor.getDid ) {
      console.error("component "+this.constructor.name+" misses static getDid()");
      return "no-dataid-method";
    }
    return this.props.did || this.constructor.getDid();
  }

  getLabel() {
    return this.props.label || this.constructor.getLabel();
  }

  getIcon() {
    return this.props.icon || this.constructor.getIcon();
  }

  getPlaceholder() {
    return this.props.placeholder || this.constructor.getPlaceholder();
  }

  getValidationText() {
    return this.props.validationText || this.constructor.getValidationText();
  }

  isValid() {
    return this.state.valid;
  }

  doValidate(newVal,oldVal) {
    let res = null;
    const oldValid =  this.state.valid;
    if ( this.props.validator ) {
      res = this.props.validator(newVal,oldVal,(newVal,oldVal)=>this.validate);
    } else {
      res = this.validate(newVal, oldVal);
    }

    // include this.props.mandatory
    if ( this.props.mandatory && isNil(newVal) )
      res = false;
    else if (!this.props.mandatory && isNil(newVal))
      res = true;

    if( !this.props.mandatory && isNil(newVal) && !res)
    {
      res = true;
    }

    if ( oldValid !== res ) {
      if ( this.props.onValid ) {
        this.props.onValid(res, this);
      }
      this.setState({valid:res});
    }
    return res;
  }

  validate(newVal, oldVal) {
    return true;
  }

  onChange(val) {
    const nextValid = this.doValidate(val,this.state.value);
    this.setValue(val,
      () => {
        if(this.props.onValue){
          this.props.onValue(val, nextValid, this);
        }
      }
    );
  }

  setValue(val, afterValFun){
    this.setState({value: val},
      () => {
        this.doValidate(val,"");
        if (afterValFun){
          afterValFun();
        }
      }
    );
  }

  getMaxLength(){
    return this.props.maxLength;
  }

  getMinLength(){
    return this.props.minLength;
  }

  prepareProps(newProps){
    newProps.maxLength = this.getMaxLength();
    newProps.minLength = this.getMinLength();
    return newProps;
  }

  getValue() {
    if ( this.input && this.input.inputRef )
      return this.input.inputRef.value;
    return null;
  }

  render() {
    let newProps = this.prepareProps(
      omit( this.props,
        "objectValue", "showLabel",
        "onValid","label","help",
        "validator","onValue", "did",
        "mandatory"
      ));
    let popupText = this.isValid() ? this.getHelp() : this.getValidationText();
    if ( popupText )
      return <Popup
        trigger={this.createControl(newProps)}
        content={<div>{popupText}</div>}
        on='hover'
      />
    return this.createControl(newProps);
  }

  getHelp() {
    return this.props.help || this.constructor.getHelp();
  }

  onBlur(ev)
  {
    if( this.props.onBlur)
    {
      this.props.onBlur(ev);
    }
  }

  onFocus(ev){
    if( this.props.onFocus)
    {
      this.props.onFocus(ev);
    }
  }

  createControl(newProps) {
    const disabled = newProps.disabled;
    if ( this.getIcon() ) {
      newProps.icon=<Icon name={this.getIcon()}/>;
      newProps.iconPosition='left';
    }
    if ( this.props.showLabel ) {
      // white is an invalid color, need to copy paste full label
      newProps.label=this.isValid() ? <Label basic pointing='left'>{this.getLabel()}</Label> : <Label color={'red'} basic pointing='left'>{this.getLabel()}</Label>;
      newProps.labelPosition='right';
    }
    return <span style={{position: 'relative', overflowX: 'hidden', whiteSpace: "nowrap" }}>
      <Input
        {...newProps}
        disabled={disabled}
        value={this.state.value}
        placeholder={ this.props.showLabel && this.getPlaceholder() === this.getLabel() ? "" : this.getPlaceholder() }
        onFocus={(ev)=> this.onFocus(ev)}
        onBlur={(ev)=> this.onBlur(ev)}
        onChange={ (ev,val) => this.onChange(val.value)}
        ref={c=>this.input = c}
        style={this.getStyle()}
        error={!this.isValid() && !this.props.showLabel}
      />
      {this.getButtonComponent()}
    </span>
  }

  getButtonComponent() {
    return null;
  }

  getStyle() {
    return {...this.props.style};
  }

  getObjectValue() {
    return this.getValue();
  }

  setObjectValue(ov) {
    this.setValue(ov);
  }

}