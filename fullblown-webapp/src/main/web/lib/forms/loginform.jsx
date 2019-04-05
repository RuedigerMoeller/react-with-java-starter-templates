import React, {Component} from 'react';
import { Button } from 'semantic-ui-react';
import {EmailInput} from "../comp/emailinput";
import {PasswordInput} from "../comp/passwordinput";
import {FlexCol, FlexRow, FormCard, Gap} from "../comp/layout";
import {Store} from "../basestore";
import {App} from "../../app/app";
import {FormCtx} from "../comp/ctx";
import {ROUTE_REGISTER} from "../semanticapp";

export class LoginForm extends Component {

  constructor(p) {
    super(p);
  }

  onLogin() {
    let data = this.formContext.getData();
    console.log("CTX",data);
    if ( ! this.formContext.isValid() ) {
      App().toast("Bitte markierte Felder ausfüllen")
    } else {
      Store().login(data.email,data.pwd)
        .then(r => App().forceUpdate())
        .catch(e => App().toast(""+e,'error') )
    }
  }

  render() {
    return <FormCard width={500} title={'Anmelden'} footer={
      <FlexRow justifyRight>
        <Gap/>
        <Button basic onClick={ () => App().goto( ROUTE_REGISTER ) }>Registrieren ..</Button>
        <Button primary onClick={ () => this.onLogin() }>Log In</Button>
        <Gap/>
      </FlexRow>
    }>
      <FlexCol margin={32}>
        <FormCtx ref={c => this.formContext = c} showLabel>
          <EmailInput mandatory help={'Ihre Registrierungs-Email Adresse'}/>
          <Gap/>
          <PasswordInput mandatory />
        </FormCtx>
      </FlexCol>
    </FormCard>
  }

}