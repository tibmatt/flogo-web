import {Injectable} from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

export interface IOptions {
  primary?: string
  secondary?: string
}

@Injectable()
export class FlogoModal {
    constructor(public translate: TranslateService) {
    }
  confirmDelete(message, styles?: {
    [key : string] : string;
    }) {
      var options = {primary: this.translate.get('MODAL:DELETE')['value'], secondary:this.translate.get('MODAL:CANCEL')['value']};
      return this.confirm(this.translate.get('MODAL:CONFIRM_DELETION')['value'], message, options);
    }
    confirm(title, message, options : IOptions, styles?: {
        [key : string] : string;
    }) {
      var buttons = <IOptions> _.assign({}, {primary:'YES', secondary:'NO'}, options);
        let style = '';
        for(let attr in styles) {
            style += `${attr}: ${styles[attr]};`
        }
        jQuery('flogo-app').append(`
            <div class="flogo-common-service-modal-container fade">
                <div class="flogo-common-service-modal-detail fade clearfix" style="${style}">
                    <div class="flogo-common-service-modal-confirm">${title}</div>
                    <div class="flogo-common-service-modal-message">${message}</div>
                    <button class="flogo-common-service-modal-button flogo-common-service-modal-button-primary">${buttons.primary}</button>
                    <button class="flogo-common-service-modal-button flogo-common-service-modal-button-secondary">${buttons.secondary}</button>
                </div>
            </div>
        `);
        let modalContainer = jQuery('.flogo-common-service-modal-container');
        let modalDetail = jQuery('.flogo-common-service-modal-container .flogo-common-service-modal-detail');
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                modalContainer.addClass('in');
                modalDetail.addClass('in');
            }, 100);

            modalDetail.find('button').click(function() {
                if(jQuery(this).text() == buttons.primary) {
                    resolve(true);
                } else {
                    resolve(false);
                }
                modalContainer.removeClass('in');
                modalDetail.removeClass('in');
                setTimeout(function() {
                    modalContainer.remove();
                }, 500);
            });
        });
    }
}
