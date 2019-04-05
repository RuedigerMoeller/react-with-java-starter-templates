import React, {Component} from 'react';
import {BaseTextField} from "./basetextfield";
import RichTextEditor from 'react-rte';
import ReactDOM from 'react-dom';
import './richtextcss.css';

export class RichText extends BaseTextField {

  static isComp() { return true; };
  static getDid() { return "richtext" }
  static getDefault() { return "" }
  static getIcon(){ return null }
  static getLabel() { return "Text" }
  static getPlaceholder() { return this.getLabel() }
  static getValidationText() { return "validation failure" }
  static getHelp() { return null };

  constructor(p) {
    super(p);
    this.state = {
      edit: false
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if ( nextProps.default ) {
      this.setState({value:nextProps.default});
      this.rte.setValue(nextProps.default);
    }
  }

  handleValChange(val){
    this.onChange(val);
    this.setState({edit:false});
  }

  handleClick(e) {
    if ( !this.state.edit && ! this.props.disabled )
      this.setState({edit:true}, () => {
        if ( this.rte )
          this.rte.doFocus();
      });
  }

  getValue() {
    if ( this.rte )
      return this.rte.state.value.toString('html');
    return null;
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
    return <RTE
      ref={c=>this.rte = c}
      disabled={disabled}
      default={this.state.value||this.props.default} onChange={val=>this.handleValChange(val)}
      readOnly={!this.state.edit}
      onClick={e=>this.handleClick(e)}
      placeholder={this.getPlaceholder()}
    />
  }

}

class RTE extends Component {

  constructor(p) {
    super(p);
    this.state = {
      value: RichTextEditor.createValueFromString(this.props.default, 'html')
    }
  }

  setValue(htmlStr) {
    this.setState({value: RichTextEditor.createValueFromString(htmlStr, 'html')});
  }

  getValue() {
    return this.state.value.toString('html')
  }

  doFocus() {
    let dn = ReactDOM.findDOMNode(this.mref );
    let nodes = dn.getElementsByClassName("public-DraftEditor-content");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].focus();
    }
  }

  onChange(value) {
    this.setState({value});
  }

  onBlur(ev) {
    if (this.props.onChange) {
      this.props.onChange(
        this.state.value.toString('html')
      );
    }
  }

  onClick(e) {
    this.props.onClick(e);
  }

  render () {
    const toolbarConfig = {
      // Optionally specify the groups to display (displayed in the order listed).
      display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'HISTORY_BUTTONS'],
      INLINE_STYLE_BUTTONS: [
        {label: 'Bold', style: 'BOLD', className: 'custom-css-class'},
        {label: 'Italic', style: 'ITALIC'},
        {label: 'Underline', style: 'UNDERLINE'}
      ],
      BLOCK_TYPE_BUTTONS: [
        {label: 'UL', style: 'unordered-list-item'},
        {label: 'OL', style: 'ordered-list-item'},
        {label: 'Quote', style: 'blockquote'}
      ]
    };
    return <div onClick={e=>this.onClick(e)}>
      <RichTextEditor
        editorClassName={ !this.props.disabled ? 'rte-semantic' : 'rte-semantic-disabled'}
        ref={c=>this.mref = c}
        toolbarConfig={toolbarConfig}
        autoFocus
        value={this.state.value}
        onChange={v=>this.onChange(v)}
        onBlur={v=>this.onBlur(v)}
        readOnly={this.props.readOnly}
        placeholder={this.props.placeholder}
      />
    </div>;
  }
}