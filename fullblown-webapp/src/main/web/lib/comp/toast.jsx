import React, {Component} from 'react';
import {Message,Transition} from 'semantic-ui-react';

export class Toast extends Component {

  constructor(p) {
    super(p);
    this.state = {
      visible: false,
      text: "No message",
      type: 'warning'
    };
    this.count = 0;
  }

  setMessage(msg,type='info') {
    this.setState({text:msg,type,visible:true});
    const finCount = ++this.count;
    setTimeout(()=>{
      if ( this.count === finCount )
        this.setState({visible:false});
    }, 3000);
  }

  render() {
    return <Transition visible={this.state.visible}>
        <Message style={{position: 'absolute', zIndex: 9999, width: "66%", left: '16%', top: 8}}
               content={this.state.text} warning={this.state.type==='warning'} error={this.state.type==='error'}/>
    </Transition>
  }
}