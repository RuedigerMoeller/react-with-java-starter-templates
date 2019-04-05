import React, {Component} from 'react';
import {Label,Image} from 'semantic-ui-react';
import {App} from "../../app/app";
import {FlexCol, FlexRow, Gap} from "./layout";
import {ROUTE_PROFILE} from "../semanticapp";

export class UserDisplay extends Component {

  onClick() {
    if ( this.props.onClick )
      this.props.onClick();
    else
      App().goto(ROUTE_PROFILE);
  }
  render() {
    return <Label size={ this.props.size || 'huge'} style={{background: 'none', margin: 0, padding: 0, cursor: 'pointer'}} onClick={e=>this.onClick()}>
      <FlexRow alignCenter>
        <Image avatar spaced={'right'} src={ (this.props.user && this.props.user.imageURL) ? this.props.user.imageURL : this.props.imageURL ? this.props.imageURL : 'imgupload/default-user.png'} style={{background: 'white'}}/>
        <FlexCol>
          <div style={{color: this.props.inverse ? 'white' : 'black', marginBottom: 6}} >{this.props.user ? this.props.user.name : this.props.name}</div>
          <div style={{color: this.props.inverse ? 'white' : 'black', fontSize: 14}} >{this.props.user ? (this.props.user.role ? this.props.user.role : this.props.role) : this.props.role }</div>
        </FlexCol>
      </FlexRow>
    </Label>
  }

}
