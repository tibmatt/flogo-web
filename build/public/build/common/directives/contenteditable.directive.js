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
var flows_api_service_1 = require('../services/restapi/flows-api.service');
var Contenteditable = (function () {
    function Contenteditable(el, _flow) {
        this.el = el;
        this._flow = _flow;
        this.myContenteditableChange = new core_1.EventEmitter();
        this._el = el.nativeElement;
        this.$el = jQuery(this._el);
    }
    Contenteditable.prototype.ngOnInit = function () {
        if (this.myContenteditable != undefined)
            this.$el.html(this.myContenteditable);
        this.$el.attr('contenteditable', 'true');
        this.$el.css({ 'paddingRight': '38px', 'marginLeft': '-10px', 'paddingLeft': '10px', 'borderRadius': '4px', 'outline': 'none', 'lineHeight': parseInt(this.$el.css('lineHeight')) - 2 + 'px', 'border': '1px solid transparent' });
        this._initPlaceholder();
        var origColor = this.$el.css('color');
        if (origColor == 'rgb(255, 255, 255)') {
            this.colorFlag = true;
        }
    };
    Contenteditable.prototype.onMouseEnter = function () {
        if (document.activeElement != this._el) {
            this.$el.css({ 'background': '#fff url("/assets/svg/flogo.flows.detail.edit.icon.svg") center right no-repeat' });
            if (this.colorFlag) {
                this.$el.css('color', '#666');
            }
        }
    };
    Contenteditable.prototype.onMouseLeave = function () {
        if (document.activeElement != this._el) {
            this.$el.css({ 'background': '', 'border': '1px solid transparent' });
            if (this.colorFlag)
                this.$el.css('color', 'rgb(255, 255, 255)');
        }
        else {
        }
    };
    Contenteditable.prototype.onFocus = function () {
        this.$el.css({ 'background': '#fff', 'border': '1px solid #0082d5' });
        if (this.colorFlag)
            this.$el.css('color', 'rgb(102, 102, 102)');
        if (this.$el.find('span')) {
            this.$el.find('span').eq(0).remove();
        }
    };
    Contenteditable.prototype.onBlur = function () {
        if (this.placeholder || this.$el.text() !== '') {
            this.$el.css({ 'background': '', 'border': '1px solid transparent' });
            if (this.colorFlag)
                this.$el.css('color', 'rgb(255, 255, 255)');
            if (this.$el.text() === '' && this.myContenteditable === undefined) {
            }
            else if (this.$el.text() !== this.myContenteditable) {
                this.myContenteditableChange.emit(this.$el.text());
            }
            this._initPlaceholder();
        }
        else {
            this.$el.focus();
            var cur_1 = 0, sumFlash_1 = 5, warmEle_1 = this.$el, timer_1;
            timer_1 = setInterval(function () {
                if (cur_1 <= sumFlash_1) {
                    if (cur_1 % 2) {
                        warmEle_1.css('border', '#0082d5 solid 1px');
                    }
                    else {
                        warmEle_1.css('border', '#ff9948 solid 1px');
                    }
                    cur_1++;
                }
                else {
                    clearInterval(timer_1);
                }
            }, 100);
        }
    };
    Contenteditable.prototype._initPlaceholder = function () {
        if (this.$el.text() == '') {
            this.$el.append("<span>" + this.placeholder + "</span>");
        }
        else {
            if (this.$el.find('span')) {
                this.$el.find('span').eq(0).remove();
            }
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], Contenteditable.prototype, "myContenteditable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], Contenteditable.prototype, "placeholder", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], Contenteditable.prototype, "myContenteditableChange", void 0);
    Contenteditable = __decorate([
        core_1.Directive({
            selector: '[myContenteditable]',
            host: {
                '(mouseenter)': 'onMouseEnter()',
                '(mouseleave)': 'onMouseLeave()',
                '(focus)': 'onFocus()',
                '(blur)': 'onBlur()'
            },
            providers: [flows_api_service_1.RESTAPIFlowsService]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, flows_api_service_1.RESTAPIFlowsService])
    ], Contenteditable);
    return Contenteditable;
}());
exports.Contenteditable = Contenteditable;
