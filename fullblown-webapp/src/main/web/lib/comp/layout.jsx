import React, {Component} from 'react';
import {omit} from "./basetextfield";
import { Card, Transition } from 'semantic-ui-react';

export const FlexRow = p => {
  const style = {display: 'flex', flexDirection: 'row',...p.style};
  if ( p.flex )
    style.flex = p.flex;
  if ( p.m4 )
    style.margin = 4;
  if ( p.m8 )
    style.margin = 8;
  if ( p.stretchw )
    style.width = '100%';
  if ( p.centerSelf )
    style.alignSelf = 'center';
  if ( p.alignCenter )
    style.alignItems = 'center';
  if ( p.justifyCenter )
    style.justifyContent = 'center';
  else if ( p.justifyRight )
    style.justifyContent = 'flex-end';
  p = omit(p, 'alignCenter', 'justifyCenter','scribbletitle',"justifyRight","stretchw","m4","m8"  );
  return <div {...p} style={style}>{p.children}</div>;
};
export const FlexCol = p => {
  const style = {display: 'flex', flexDirection: 'column',...p.style};
  if ( p.flex )
    style.flex = p.flex;
  if ( p.m4 )
    style.margin = 4;
  if ( p.m8 )
    style.margin = 8;
  if (p.scrollY)
    style.overflowY = 'auto';
  if ( p.alignCenter )
    style.alignItems = 'center';
  if ( p.alignStretch )
    style.alignItems = 'stretch';
  if ( p.justifyCenter )
    style.justifyContent = 'center';
  if ( p.margin )
    style.margin = p.margin;
  if ( p.marginTop )
    style.marginTop = p.marginTop;
  p = omit(p, 'alignCenter', 'justifyCenter','scribbletitle',"margin","marginTop","alignStretch","m4","m8" );
  return <div {...p} style={style}>{p.children}</div>;
};

export const Gap = p => {
  let gap = p.small ? 4 : p.large ? 32 : p.huge ? 64 : 16;
  return <div style={{ height: p.vgap || gap, width: p.hgap || gap}}/>
};

export class MountTransition extends Component {

  constructor(p) {
    super(p);
    this.state = {
      visible: false
    }
  }

  componentDidMount() {
    this.setState({visible:true});
  }

  render() {
    return <Transition visible={this.state.visible}>{this.props.children}</Transition>
  }

}

export const FormCard = ({title,children,width,footer}) => <Card style={{ width: width ? width : 600}}>
  <Card.Content>
    <Card.Header>{title}</Card.Header>
  </Card.Content>
  <Card.Content>
    <FlexCol alignCenter>
      {children}
    </FlexCol>
  </Card.Content>
  <Card.Content extra>
    <FlexRow justifyRight>
      {footer}
    </FlexRow>
  </Card.Content>
</Card>;
