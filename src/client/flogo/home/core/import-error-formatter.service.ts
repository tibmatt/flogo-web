import {LanguageService, ValidationDetail} from '@flogo/core';
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
      case 'pattern':
        messageHeader = this._translate.instant('IMPORT-ERROR:PATTERN_MISMATCH');
        break;
      case 'enum':
      case 'minLength':
      case 'const':
      case 'app-empty':
      case 'cannot-identify-app-type':
        messageHeader = this._translate.instant('IMPORT-ERROR:DATA_MISMATCH');
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

  formatErrorMessage(detail: ValidationDetail) {
    let errorMessage = '';
    switch (detail.keyword) {
      case 'type':
      case 'required':
      case 'pattern':
      case 'minLength':
        errorMessage = this.getErrorContext(detail.dataPath, detail.keyword) + detail.message;
        break;
      case 'enum':
        errorMessage = this.getErrorContext(detail.dataPath, detail.keyword)
          + this._translate.instant('IMPORT-ERROR:ONE_AMONG_CONTENT', { val: detail.params.allowedValues.join(',') });
        break;
      case 'const':
        errorMessage = this.getErrorContext(detail.dataPath, detail.keyword)
          + this._translate.instant('IMPORT-ERROR:CONSTANT_CONTENT', { val: detail.params.allowedValue });
        break;
      case 'app-empty':
      case 'cannot-identify-app-type':
        errorMessage = detail.message;
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

  getErrorsDetails(details: ValidationDetail[]): ValidationDetail[] {
    return details.filter(d => this.isRationalError(d));
  }

  isRationalError(detail: ValidationDetail) {
    return detail.keyword !== 'if';
  }
}
