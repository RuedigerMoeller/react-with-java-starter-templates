import React, {Component} from 'react';
import {BaseTextField} from "./basetextfield";

export const validateEmail = function(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
};

export class EmailInput extends BaseTextField {

  static getDid() { return "email" };
  static getDefault() { return "" };
  static getIcon(){ return 'mail' };
  static getLabel() { return "Email Adresse" };
  static getPlaceholder() { return "xx@xx.xx" };
  static getValidationText() { return "Bitte gültige Email eingeben" };

  validate(newVal, oldVal) {
    return validateEmail(newVal);
  }

}