import {Injectable} from 'angular2/core';

@Injectable()
export class FlogoModal {
    constructor() {
    }
    confirm(message, options?: {
        [key : string] : string;
    }) {
        let style = '';
        for(let attr in options) {
            style += `${attr}: ${options[attr]};`
        }
        window.jQuery('flogo-app').append(`
            <div class="flogo-common-service-modal-container fade">
                <div class="flogo-common-service-modal-detail fade clearfix" style="${style}">
                    <div class="flogo-common-service-modal-confirm">Confirm</div>
                    <div class="flogo-common-service-modal-message">${message}</div>
                    <button class="flogo-common-service-modal-button flogo-common-service-modal-button-primary">YES</button>
                    <button class="flogo-common-service-modal-button flogo-common-service-modal-button-secondary">NO</button>
                </div>
            </div>
        `);
        let modalContainer = window.jQuery('.flogo-common-service-modal-container');
        let modalDetail = window.jQuery('.flogo-common-service-modal-container .flogo-common-service-modal-detail');
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                modalContainer.addClass('in');
                modalDetail.addClass('in');
            }, 100);

            modalDetail.find('button').click(function() {
                if(window.jQuery(this).text() == 'YES') {
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
