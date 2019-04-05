import React, {Component} from 'react';
import {KClient} from 'kontraktor-client';
import { Button, Modal } from 'semantic-ui-react';
import {Routing} from "./routing";
import {LoginForm} from "./forms/loginform";
import {Store} from "./basestore";
import {FlexCol, FlexRow, MountTransition} from "./comp/layout";
import {RegisterForm} from "./forms/registerform";
import {Toast} from "./comp/toast";
import {ProfileForm} from "./forms/profile";
import {UserDisplay} from "./comp/userdisplay";
import {AppPage} from "./apppage";

/**
 * there are some default routes expected constant
 */

export const ROUTE_LOGIN = 'login';
export const ROUTE_PROFILE = 'profile';
export const ROUTE_REGISTER = 'register';
export const ROUTE_REGISTER_SUCCESS = 'register_success';

export class SemanticApp extends Component {

  constructor(p) {
    super(p);
    this.state = {
      modalOpen: false,
      modalContent: false,
      mandatory: false,
      modalSize: 'small'
    };
    Store().addListener("login", arg => {
      if ( arg === 'logged in' )
        this.goto(this.getDefaultRoute())
    });
  }

  componentDidMount() {
    this.unsubs = Routing.listen( (loc,action) => this.forceUpdate());
    if ( ! Store().isLoggedIn() )
      this.goto( this.getDefaultRoute() );
  }

  render() {
    return <div style={{ height: '100%', background: this.getBackground(), display: 'flex', flexDirection: 'column' }}>
      <Toast ref={c=>this.toastComp=c}/>
      <Modal ref={c => this.modal = c}
             open={this.state.modalOpen}
             closeOnDimmerClick={!this.state.mandatory}
             onClose={(ev)=> this.onCloseModal(ev)}
             size={this.state.modalSize}
      >
        <div>{this.state.modalContent}</div>
      </Modal>
      {this.renderHeader()}
      {this.renderBody()}
    </div>
  }

  renderBody() {
    if ( ! this.mountKey )
      this.mountKey = 1;
    else
      this.mountKey++;
    return <FlexCol style={{ background: this.getAppBodyBG(), width: "100%", height: '100%', maxWidth: this.getMaxWidth(), margin: 'auto', overflowY: 'auto' }}>
        <MountTransition style={{width:"100%"}} key={this.mountKey}>
          <FlexCol style={{ background: this.getAppBodyBG(), width: "100%", height: '100%', maxWidth: this.getMaxWidth(), margin: 'auto' }}>
            {this.getView(Routing.getCurrentRoute())}
            </FlexCol>
        </MountTransition>
      </FlexCol>
  }

  renderHeader() {
    return <div style={{ position: 'relative', background: this.getHeaderBG(), minHeight: this.getHeaderMinH()}}>
      {Store().isLoggedIn() ? <FlexRow justifyRight style={{margin: 16}}><UserDisplay inverse size={'large'} user={Store().getUser()}/></FlexRow> : null }
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: this.getHeaderDarkBG(), width: "100%", maxWidth: this.getMaxWidth(), margin: 'auto' }}>
        {this.renderNavigation()}
      </div>
    </div>
  }

  renderNavigation() {
    return <Button.Group size={'large'}>
      {this.getSections().map( sect => sect.getMenuVisible() ? <Button key={sect.getRoute()}
        style={{margin:0, borderRadius: 0, color: '#fff', background: Routing.getCurrentRoute() !== sect.getRoute() ? this.getHeaderDarkBG() : this.getHeaderBG()}}
        toggle
        onClick={()=>this.onSectionChange(sect)}>{sect.getDisplayedTitle()}</Button>
        : null )}
    </Button.Group>
  }

  goto(route) {
    Routing.push(route);
    this.forceUpdate();
  }

  /////////////////////// modals, toast ////////////////////////////////////////////

  toast(msg,status) {
    this.toastComp.setMessage(msg,status);
  }

  openModal(content, mandatory=false, size="small") {
    if ( size==='fullscreen' ) // fixes a layout issue in seamntic ui 0.84
      size = 'large';
    this.setState({
      modalOpen: true,
      modalContent: content,
      modalSize: size,
      mandatory: mandatory
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false,
      modalContent: null,
      mandatory: false
    });
  }

  onCloseModal(ev){
    const el = ev.toElement || ev.relatedTarget || ev.target;
    if( el && el.className.indexOf("dimmer") > 0  )
    {
       this.closeModal();
    }
  }

  /////////////////////// routing ///////////////////////////////////////////

  getView(route,circuitbreaker) {
    if ( !route || route.length == 0 ) {
      if ( circuitbreaker )
        return <div>Circular call, View "{route}" not found</div>;
      return this.getDefaultView();
    }
    const scr = this.switchRoute(route);
    if ( scr ) {
      return scr;
    }
    if ( circuitbreaker )
      return <div>Circular call, View "{route}" not found</div>;
    return this.getDefaultView();
  }

  /**
   * if route can be resolved to a screen, return this, else return null.
   * call super in order to handle built in screens properly
   * @param route
   */
  switchRoute(route) {
    const res = this.getSections().find( apppage => apppage.getRoute() === route );
    if ( res )
        return this.wrapPage(res.getComponent());
    return null;
  }

  /**
   * called by getView on each page component.
   *
   * @param content
   * @returns {*}
   */
  wrapPage(content) {
    return <FlexCol alignCenter marginTop={100} children={content}/>
  }

  onSectionChange(s) {
    Routing.push(s.getRoute());
  }

  getDefaultView() {
    return this.getView( this.getDefaultRoute(),true);
  }
  getDefaultRoute() {
    return this.getSections()[0].getRoute();
  }

  ///////////////////////////////////////// default screen factory methods

  getProfileScreen() { return <ProfileForm/>; }
  getRegisterScreen() { return <RegisterForm/>; }
  getRegisterSuccessScreen() {
    return [
        <h2>Registrierung erfolgreich !</h2>,
        <p>
          In Kürze werden sie eine Bestätigungs-Mail erhalten.<br/>
          Bitte überprüfen sie Ihr Postfach und bestätigen durch Klick auf den darin enthaltenen Button die
          Richtigkeit der Mailadresse.
        </p>
      ];
  }
  getLoginScreen() {return <LoginForm/>;}

  /**
   *
   * @returns an array of AppPages with at least one element for default route
   */
  getSections() {
    return Store().isLoggedIn() ? this.getLoggedInSections() : [
      new AppPage("login","Anmelden",this.getLoginScreen()),
      new AppPage("register","Registrieren",this.getRegisterScreen(), false),
      new AppPage("register_success","Registrieren",this.getRegisterSuccessScreen(),false)
    ];
  }

  // override
  getLoggedInSections() {
    return [
      new AppPage("home","Pls Override",<div>your app's home</div>),
    ];
  }

  ////////////////////////////////// styles ////////////////////////////////////////////

  getHeaderMinH() { return 100; }
  getHeaderBG() { return '#66b0be'; }
  getHeaderDarkBG() { return '#042A2B'; }
  getAppBodyBG() { return '#fff'; }
  getBackground() { return '#CDEDF6'; }
  getMaxWidth() { return 1250; }

  //////////////////////////////// tools ///////////////////////////////////////////////

  formatDateTime(date) {
    var strTime = this.formatTime(date);
    return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
  }

  formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    hours = hours < 10 ? '0' + hours : hours;
    var strTime = hours + ':' + minutes;
    return strTime;
  }

  normalizeToLocalDay(date) {
    const copy = new Date(date);
    copy.setHours(0);
    copy.setMinutes(0);
    copy.setSeconds(0);
    copy.setMilliseconds(0);
    return copy;
  }

  humanReadable(date){
    const diff = new Date().getTime() - date.getTime();

    if ( this.normalizeToLocalDay(date.getTime()).getTime() === this.normalizeToLocalDay(new Date()).getTime() ) {
      return this.formatTime(date);
    }
    return this.formatDateTime(date);
  }

}