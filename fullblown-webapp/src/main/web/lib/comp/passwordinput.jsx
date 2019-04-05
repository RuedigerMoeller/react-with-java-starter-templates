import React, {Component} from 'react';
import {BaseTextField} from "./basetextfield";

export class PasswordInput extends BaseTextField {

  static getDid() { return "pwd" };
  static getDefault() { return "" };
  static getIcon() { return 'lock' };
  static getLabel() { return "Passwort" };
  static getValidationText() { return "Bitte Passwort eingeben (6-14 Zeichen)" };

  validate(newVal, oldVal) {
    if (newVal && newVal.length > 0) {
      return (newVal.indexOf(' ') < 0 && newVal.length >= 6 && newVal.length <= 14);
    }
    return true;
  }

  prepareProps(newProps) {
    newProps = super.prepareProps(newProps);
    newProps.type = "password";
    return newProps;
  }

}