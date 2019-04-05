import React, {Component} from 'react';
import {Store} from "../basestore";
import {App} from "../../app/app";
import {FlexCol, FlexRow, Gap} from "./layout";
import {Label,Image,Button} from 'semantic-ui-react';
import {RichText} from "./richtext";
import {UserDisplay} from "./userdisplay";

const testId = "test5";
export class Discussion extends Component {

  constructor(p) {
    super(p);
    this.state = {
      root: null
    };
  }

  componentDidMount() {
    Store().addListener("discussionChange", this.li = data => {
      console.log("discchange", data );
      if ( data.foreignKey === this.getDiscId() ) {
        this.processChange(data);
      }
    });
    Store().getOrCreateDiscussion(this.props.discId || testId)
      .then( d => this.setState({root: d}) )
      .catch( e => App().toast("" + e) );
  }

  processChange(data) {
    switch ( data.type ) {
      case 'add': {
        if ( this.state.root ) {
          this.rootCommentNode.processAdd(this.state.root,data);
        }
      } break;
      case 'del': {
        if ( this.state.root ) {
          this.rootCommentNode.processDel(this.state.root,data);
        }
      } break;
      case 'edit': {
        if ( this.state.root ) {
          this.rootCommentNode.processEdit(this.state.root,data);
        }
      } break;
    }
  }

  componentWillUnmount() {
    Store().removeListener("discussionChange",this.li);
  }

  getDiscId() {
    return this.props.discId || testId;
  }

  render() {
    return <FlexCol key={this.getDiscId()} style={this.props.style}>
      {/*<pre>{JSON.stringify(this.state.root,0,2)}</pre>*/}
      <CommentNode ref={c=>this.rootCommentNode=c} key={this.state.root ? this.state.root.id : 'root'} node={this.state.root} root={this.state.root} />
    </FlexCol>
  }

}

const FlatLevel = 4;
const MAX_LEN = 10000;
class CommentNode extends Component {

  constructor(p) {
    super(p);
    this.state = {
      expanded: true
    };
  }
  // bcast
  processAdd(root, data) {
    if ( root.id === data.parentId ) {
      const fakeNode = {
        creation: data.creation,
        lastModified: data.creation,
        text: data.text,
        id: data.id,
        children: [],
        author: data.author,
        imageURL: data.imageURL,
      };
      root.children = [fakeNode,...root.children];
      this.forceUpdate();
    } else {
      if ( root.children )
        root.children.forEach( ch => this.processAdd(ch,data));
    }
  }

  // bcast
  processDel(root, data) {
    if ( root.id === data.parentId ) {
      if ( root.children ) {
        root.children.forEach( ch => {
          if ( ch.id === data.id ) {
            const na = [];
            root.children.forEach(el => {
              if ( el.id !== data.id )
                na.push(el);
            });
            root.children = na;
            this.forceUpdate();
          }
        });
      }
    } else {
      if ( root.children )
        root.children.forEach( ch => this.processDel(ch,data));
    }
  }

  // bcast
  processEdit(root, data) {
    if ( "root" === data.id ) {
      root.text = data.text;
      root.lastModified = data.creation;
      this.childGroup.forceUpdate();
      return;
    }
    if ( root.id === data.parentId ) {
      if ( root.children ) {
        root.children.forEach( ch => {
          if ( ch.id === data.id ) {
            ch.text = data.text;
            ch.lastModified = data.creation;
            this.forceUpdate();
          }
        });
      }
    } else {
      if ( root.children )
        root.children.forEach( ch => this.processEdit(ch,data));
    }
  }

  getHtml() {
    return { __html: this.props.node.text };
  }

  handleValue(val,valid,comp) {
    const value = val;
    if ( valid && value !== this.props.node.text ) {
      if ( value.length > MAX_LEN ) {
        App().toast("Text is too long, cannot submit","error");
        return;
      }
      if ( this.props.node.id === 'new' ) {
        if ( !value || value.trim().length === 0 || value==='<p><br></p>' ) {
          this.onDel();
          App().toast("Leerer Kommentar entfernt");
          return;
        }
        Store().addComment(this.props.root._key,this.props.parent.id,value)
          .then( rec => {
            this.props.parent.children = this.props.parent.children.filter(x=>x.id !== 'new');
            this.props.parentComp.forceUpdate();
            App().toast("Kommentar gespeichert");
          })
          .catch( e => App().toast(""+e));
      } else {
        Store().editComment(this.props.root._key,this.props.node.id,value)
          .then( rec => {
            this.props.node.text = rec.text;
            App().toast("Kommentar gespeichert");
            this.forceUpdate();
          })
          .catch( e => App().toast(""+e));
      }
    }
  }

  onAdd(e) {
    const fakeNode = {
      creation: new Date().getTime(),
      lastModified: new Date().getTime(),
      text: "",
      id: "new",
      children: [],
      author: Store().getUser().name,
      imageURL: Store().getUser().imageURL,
    };
    const newChildren = this.props.node.children ? [...this.props.node.children] : [];
    newChildren.unshift(fakeNode);
    this.props.node.children = newChildren;
    this.forceUpdate();
  }

  onDel() {
    if ( this.props.node.id === 'new' ) {
      let index = this.props.parent.children.indexOf(this.props.node);
      this.props.parent.children.splice(index,1);
      this.props.parentComp.forceUpdate();
      App().toast("Kommentar gelöscht");
    } else {
      Store().delComment(this.props.root._key,this.props.node.id)
        .then( recOrDel => {
          // if ( recOrDel === 'deleted') {
          //   let index = this.props.parent.children.indexOf(this.props.node);
          //   this.props.parent.children = [...this.props.parent.children];
          //   this.props.parent.children.splice(index,1);
          //   this.props.parentComp.forceUpdate();
          // } else {
          //   this.props.node.text = recOrDel.text;
          //   this.forceUpdate();
          // }
          App().toast("Kommentar gelöscht");
        })
        .catch( e => App().toast(""+e));
    }
  }

  onToggle() {
    this.setState({expanded: !this.state.expanded});
  }

  render() {
    let node = this.props.node;
    const level = this.props.level || 0;
    if ( ! node )
      return <div/>;
    const text = "" || node.text;
    const noteditable = node.author !== Store().getUser().name || node.text === '[deleted]';
    return <FlexCol style={{ width: '100%'}}>
      <Gap/>
      <FlexRow alignCenter>
        <UserDisplay imageURL={node.imageURL} name={node.author} background={'#eee'} role={node.role} size={'large'}/>
        {level > FlatLevel ? <div style={{marginLeft: 4}}>antwortet {'@'+this.props.parent.author}</div> : ""}
        <div style={{marginLeft: 4, fontSize: 10}}>{App().humanReadable(new Date(node.creation))}</div>
        {node.lastModified !== node.creation && <div style={{marginLeft: 4, fontSize: 10}}>edited {App().humanReadable(new Date(node.lastModified))}</div>}
      </FlexRow>
      <Gap small/>
      <Gap small/>
      <RichText placeholder={'Dein Kommentar hier ...'} default={node.text} readonly={noteditable} disabled={noteditable} onValue={ (val, valid, comp) => this.handleValue(val,valid,comp)}/>
      <Gap small/><Gap small/>
      <FlexRow>
        <FlexRow>
          {node.children && node.children.length > 0 && level < FlatLevel && <Button size={'mini'} icon={this.state.expanded ? 'minus' : 'plus'} onClick={e=>this.onToggle()}/>}
        </FlexRow>
        <FlexRow flex={1} justifyRight>
          { node.id !== 'root' && (node.text !== '[deleted]' || (node.children && node.children.length === 0)) && node.author === Store().getUser().name && <Button size={'mini'} title={'Löschen'} onClick={()=>this.onDel()}>Löschen</Button> }
          { node.id !== 'new' && (node.author !== Store().getUser().name) && <Button size={'mini'} primary title={'Antworten'} onClick={e=>this.onAdd(e)}>Antworten</Button> }
          { node.id === 'new' && <Button primary size={'mini'} title={'Senden'} >Senden</Button> }
        </FlexRow>
      </FlexRow>
      {this.state.expanded && <ChildGroup ref={c => this.childGroup = c} level={level} children={node.children} node={node} root={this.props.root}/>}
    </FlexCol>
  }

}

// avoid flicker => separate children from text head
class ChildGroup extends Component {

  constructor(p) {
    super(p);
  }

  render() {
    const children = this.props.children;
    const level = this.props.level;
    return <FlexCol style={{ width: '100%'}} >
      { children && children.map( childnode => <FlexRow key={childnode.id} stretchw>
        { this.props.level < FlatLevel && <div style={{background: '#eee', width: 3, minHeight: 10, marginRight: 16, marginLeft: 13}}/>}
        <CommentNode root={this.props.root} parent={this.props.node} parentComp={this} node={childnode} level={level+1}/>
      </FlexRow>)}
    </FlexCol>
  }
}