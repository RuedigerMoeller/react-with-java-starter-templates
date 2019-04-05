import React, {Component} from 'react';
import { Button } from 'semantic-ui-react';
import {EmailInput} from "../comp/emailinput";
import {UserNameInput} from "../comp/usernameinput";
import {PasswordInput} from "../comp/passwordinput";
import {FlexCol, FlexRow, FormCard, Gap} from "../comp/layout";
import {Store} from "../basestore";
import {App} from "../../app/app";
import {FormCtx} from "../comp/ctx";
import {UserDisplay} from "../comp/userdisplay";
import {ImageUpload} from "../comp/imageupload";

export class ProfileForm extends Component {

  validatePWD() {
    if ( this.formCtx )
      return this.formCtx.getValue("pwd") === this.formCtx.getValue('verifyPwd');
    return false;
  }

  onSubmit() {
    let data = this.formCtx.getData();
    if ( ! this.formCtx.isValid() ) {
      App().toast("Bitte markierte Felder ausfüllen");
    } else {
      console.log(data);
      Store().saveProfile(data)
        .then(r=>App().toast(r))
        .catch(e=>App().toast(e,'error'));
    }
  }

  render() {
    if ( ! Store().isLoggedIn() ) {
      return <div>Not logged in</div>
    }
    const user = Store().getUser();
    return <FormCard width={500} title={<UserDisplay user={user}/>} footer={
      <FlexRow justifyRight>
        <Gap/>
        <Button primary onClick={ () => this.onSubmit() }>Änderungen speichern</Button>
        <Gap/>
      </FlexRow>
    }>
      <FlexCol margin={32}>
        <FormCtx ref={c=>this.formCtx = c} showLabel>
          <ImageUpload default={user.imageURL}/>
          <Gap/>
          <EmailInput disabled help={'Ihre Registrierungs-Email Adresse (wird nicht angezeigt)'} default={user.email}/>
          <Gap/>
          <UserNameInput disabled default={user.name}/>
          <Gap/>
          <Gap/>
          <h4>Passwort Ändern:</h4>
          <PasswordInput label={"neues Passwort"} help={'Zum passwort ändern, hier neues Passwort eingeben und unten mit altem Passwort bestätigen um das Passwort zu ändern'}/>
          <Gap/>
          <PasswordInput validator={this.validatePWD.bind(this)}
                         did={'verifyPwd'} placeholder={'neues Passwort wiederholen'}
                         label={".. wiederholen"}
                         help={'neues Passwort zur Sicherheit wiederholen'}
          />
          <Gap/>
          <PasswordInput did={'oldPwd'} placeholder={'altes Passwort'}
                         label={"altes Password"}
                         help={'altes Passwort zur Bestätigung der Passwort Änderung'}
          />
        </FormCtx>
      </FlexCol>
    </FormCard>
  }

}