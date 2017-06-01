import { TranslateService } from 'ng2-translate/ng2-translate';
import {Injectable} from "@angular/core";

@Injectable()
export class ImportErrorFormatterService {
  constructor(public _translate: TranslateService){

  }

  formatMessageHeader(keyword){
    let messageHeader = '';
    switch (keyword) {
      case "type":
        messageHeader = this._translate.instant("IMPORT-ERROR:TYPE_MISMATCH");
        break;
      case "required":
        messageHeader = this._translate.instant("IMPORT-ERROR:PROPERTY_REQUIRED");
        break;
      case "activity-installed":
        messageHeader = this._translate.instant("IMPORT-ERROR:ACTIVITY_MISSING");
        break;
      case "trigger-installed":
        messageHeader = this._translate.instant("IMPORT-ERROR:TRIGGER_MISSING");
        break;
      default:
        messageHeader = this._translate.instant("APP-LIST:BROKEN_RULE_UNKNOWN");
        break;
    }
    return messageHeader;
  }

  formatErrorMessage(detail) {
    let errorMessage='';
    switch (detail.keyword) {
      case "type":
      case "required":
        errorMessage = this.getErrorContext(detail.dataPath, detail.keyword) + detail.message;
        break;
      case "activity-installed":
        errorMessage = this._translate.instant("IMPORT-ERROR:ACTIVITY_MISSING_CONTENT", {ref: detail.data});
        break;
      case "trigger-installed":
        errorMessage = this._translate.instant("IMPORT-ERROR:TRIGGER_MISSING_CONTENT", {ref: detail.data});
        break;
      default:
        errorMessage = this._translate.instant("APP-LIST:BROKEN_RULE_UNKNOWN");
        break;
    }
    return errorMessage;
  }

  getErrorContext(path, keyword){
    let pathArray = path.split('.'), propName = '',getNthIndex = /\d+/g;
    pathArray.shift();
    if(keyword === "type") {propName = pathArray.pop()}
    /*pathArray = pathArray.map((val) => {
      let index = val.match(getNthIndex), prop = val.split('[');
      if(index) {
        return `Item at index ${index} of ${prop[0]}`;
      }
      return val;
    });*/
    if(keyword === "type") {
      return this._translate
        .instant("IMPORT-ERROR:TYPE_MISMATCH_CONTENT", {property: propName, JSONPath: '.'+pathArray.join('.')});
    } else {
      return `.${pathArray.join('.')} `;
    }
  }
}
