import React, {Component} from 'react';
import {BaseTextField} from "./basetextfield";

export class UserNameInput extends BaseTextField {

  static getDid() { return "name" };
  static getDefault() { return "" };
  static getIcon(){ return 'user' };
  static getLabel() { return "Angezeigter Name" };
  static getPlaceholder() { return "My Name" };
  static getValidationText() { return "Für Andere angezeigter Name (6-30 Zeichen)" };

  validate(newVal, oldVal) {
    return newVal.length > 3 && newVal.length < 30;
  }

}