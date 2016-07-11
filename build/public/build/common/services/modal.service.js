"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var FlogoModal = (function () {
    function FlogoModal() {
    }
    FlogoModal.prototype.confirmDelete = function (message, styles) {
        var options = { primary: 'DELETE', secondary: 'CANCEL' };
        return this.confirm('Confirm deletion', message, options);
    };
    FlogoModal.prototype.confirm = function (title, message, options, styles) {
        var buttons = _.assign({}, { primary: 'YES', secondary: 'NO' }, options);
        var style = '';
        for (var attr in styles) {
            style += attr + ": " + styles[attr] + ";";
        }
        jQuery('flogo-app').append("\n            <div class=\"flogo-common-service-modal-container fade\">\n                <div class=\"flogo-common-service-modal-detail fade clearfix\" style=\"" + style + "\">\n                    <div class=\"flogo-common-service-modal-confirm\">" + title + "</div>\n                    <div class=\"flogo-common-service-modal-message\">" + message + "</div>\n                    <button class=\"flogo-common-service-modal-button flogo-common-service-modal-button-primary\">" + buttons.primary + "</button>\n                    <button class=\"flogo-common-service-modal-button flogo-common-service-modal-button-secondary\">" + buttons.secondary + "</button>\n                </div>\n            </div>\n        ");
        var modalContainer = jQuery('.flogo-common-service-modal-container');
        var modalDetail = jQuery('.flogo-common-service-modal-container .flogo-common-service-modal-detail');
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                modalContainer.addClass('in');
                modalDetail.addClass('in');
            }, 100);
            modalDetail.find('button').click(function () {
                if (jQuery(this).text() == buttons.primary) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
                modalContainer.removeClass('in');
                modalDetail.removeClass('in');
                setTimeout(function () {
                    modalContainer.remove();
                }, 500);
            });
        });
    };
    FlogoModal = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], FlogoModal);
    return FlogoModal;
}());
exports.FlogoModal = FlogoModal;
