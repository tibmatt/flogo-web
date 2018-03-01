import {LanguageService, ValidationDetails} from '@flogo/core';
import { Injectable } from '@angular/core';

@Injectable()
export class ImportErrorFormatterService {
  constructor(public _translate: LanguageService) {}

  formatMessageHeader(keyword) {
    let messageHeader = '';
    switch (keyword) {
      case 'type':
        messageHeader = this._translate.instant('IMPORT-ERROR:TYPE_MISMATCH');
        break;
      case 'required':
        messageHeader = this._translate.instant('IMPORT-ERROR:PROPERTY_REQUIRED');
        break;
      case 'activity-installed':
        messageHeader = this._translate.instant('IMPORT-ERROR:ACTIVITY_MISSING');
        break;
      case 'trigger-installed':
        messageHeader = this._translate.instant('IMPORT-ERROR:TRIGGER_MISSING');
        break;
      default:
        messageHeader = this._translate.instant('APP-LIST:BROKEN_RULE_UNKNOWN');
        break;
    }
    return messageHeader;
  }

  formatErrorMessage(detail) {
    let errorMessage = '';
    switch (detail.keyword) {
      case 'type':
      case 'required':
        errorMessage = this.getErrorContext(detail.dataPath, detail.keyword) + detail.message;
        break;
      case 'activity-installed':
        errorMessage = this._translate.instant('IMPORT-ERROR:ACTIVITY_MISSING_CONTENT', { ref: detail.params.ref });
        break;
      case 'trigger-installed':
        errorMessage = this._translate.instant('IMPORT-ERROR:TRIGGER_MISSING_CONTENT', { ref: detail.params.ref });
        break;
      default:
        errorMessage = this._translate.instant('APP-LIST:BROKEN_RULE_UNKNOWN');
        break;
    }
    return errorMessage;
  }

  getErrorContext(path, keyword) {
    const pathArray = path.split('.');
    let propName = '';
    pathArray.shift();
    if (keyword === 'type') {
      propName = pathArray.pop();
    }
    if (keyword === 'type') {
      return this._translate
        .instant('IMPORT-ERROR:TYPE_MISMATCH_CONTENT', { property: propName, JSONPath: '.' + pathArray.join('.') });
    } else {
      return `.${pathArray.join('.')} `;
    }
  }

  getErrorsDetails(details: ValidationDetails[]): ValidationDetails[] {
    return details.filter(d => this.isRationalError(d));
  }

  isRationalError(detail: ValidationDetails) {
    return detail.keyword !== 'if';
  }
}
