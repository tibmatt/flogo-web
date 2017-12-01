import { Injectable } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import * as lodash from 'lodash';

export interface IOptions {
  primary?: string;
  secondary?: string;
}

@Injectable()
export class FlogoModal {
  constructor(public translate: TranslateService) {
  }

  confirmDelete(message, styles?: {
    [key: string]: string;
  }) {
    const options = {
      primary: this.translate.get('MODAL:DELETE')['value'],
      secondary: this.translate.get('MODAL:CANCEL')['value']
    };
    return this.confirm(this.translate.get('MODAL:CONFIRM-DELETION')['value'], message, options);
  }

  confirm(title, message, options: IOptions, styles?: {
    [key: string]: string;
  }) {
    const buttons = <IOptions> lodash.assign({}, { primary: 'YES', secondary: 'NO' }, options);
    let style = '';
    for (const attr in styles) {
      if (styles.hasOwnProperty(attr)) {
        style += `${attr}: ${styles[attr]};`;
      }
    }
    const textMessage = lodash.escape(message);
    jQuery('flogo').append(`
            <div class="flogo-common-service-modal-container fade">
                <div class="flogo-common-service-modal-detail fade clearfix" style="${style}">
                    <div class="flogo-common-service-modal-confirm">${title}</div>
                    <div class="flogo-common-service-modal-message">${textMessage}</div>
                    <button class="flogo-common-service-modal-button flogo-button--default">${buttons.primary}</button>
                    <button class="flogo-common-service-modal-button flogo-button--secondary">${buttons.secondary}</button>
                </div>
            </div>
        `);
    const modalContainer = jQuery('.flogo-common-service-modal-container');
    const modalDetail = jQuery('.flogo-common-service-modal-container .flogo-common-service-modal-detail');
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        modalContainer.addClass('in');
        modalDetail.addClass('in');
      }, 100);

      modalDetail.find('button').click(function () {
        if (jQuery(this).text() === buttons.primary) {
          resolve(true);
        } else {
          resolve(false);
        }
        modalContainer.removeClass('in');
        modalDetail.removeClass('in');
        setTimeout(function () {
          modalContainer.remove();
        }, 500);
      });
    });
  }
}