import React, {Component} from 'react';
import { Button } from 'semantic-ui-react';
import {EmailInput} from "../comp/emailinput";
import {UserNameInput} from "../comp/usernameinput";
import {PasswordInput} from "../comp/passwordinput";
import {FlexCol, FlexRow, FormCard, Gap} from "../comp/layout";
import {Store} from "../basestore";
import {App} from "../../app/app";
import {FormCtx} from "../comp/ctx";
import {ROUTE_REGISTER_SUCCESS} from "../semanticapp";

export class RegisterForm extends Component {

  onRegister() {
    console.log( this.formCtx.getData() );
    if ( ! this.formCtx.isValid() ) {
      App().toast("Bitte markierte Felder ausfüllen")
    } else {
      Store().register(this.formCtx.getData())
        .then(r => App().goto(ROUTE_REGISTER_SUCCESS))
        .catch(e => App().toast(""+e) )
    }
  }

  validatePWD() {
    if ( this.formCtx )
      return this.formCtx.getValue("pwd") === this.formCtx.getValue('verifyPwd');
    return false;
  }

  render() {
    return <FormCard width={500} title={'Registrieren'} footer={
      <FlexRow justifyRight>
        <Gap/>
        <Button basic onClick={ () => App().goto("Anmelden") }>Zurück ...</Button>
        <Button primary onClick={ () => this.onRegister() }>Abschicken</Button>
        <Gap/>
      </FlexRow>
    }>
      <FlexCol margin={32}>
        <FormCtx ref={c=>this.formCtx = c} showLabel>
          <EmailInput mandatory help={'Ihre Registrierungs-Email Adresse'}/>
          <Gap/>
          <UserNameInput mandatory/>
          <Gap/>
          <Gap/>
          <PasswordInput mandatory />
          <Gap/>
          <PasswordInput validator={this.validatePWD.bind(this)} mandatory did={'verifyPwd'} label={".. wiederholen"} />
        </FormCtx>
      </FlexCol>
    </FormCard>
  }

}