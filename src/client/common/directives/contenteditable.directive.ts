import {Directive, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange} from 'angular2/core';
import {RESTAPIFlowsService} from '../services/restapi/flows-api.service';

@Directive({
    selector: '[myContenteidtable]',
    host: {
        '(mouseenter)': 'onMouseEnter()',
        '(mouseleave)': 'onMouseLeave()',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    },
    providers: [RESTAPIFlowsService]
})
export class Contenteditable {
    private _el: HTMLElement;
    private $el: any;

    @Input()
    myContenteidtable: string;

    @Output()
        myContenteidtableChange = new EventEmitter();

    constructor(private el: ElementRef, private _flow: RESTAPIFlowsService) {
        this._el = el.nativeElement;
        this.$el = window.jQuery(this._el);
    }
    ngOnInit() {
        this.$el.html(this.myContenteidtable);
        this._el.setAttribute('contenteditable', 'true');
        this.$el.append('<i class="fa fa-pencil" style="float: right;display: none" aria-hidden="true"></i>');
    }
    onMouseEnter() {
        this.$el.find('i').eq(0).css('display', 'block');
        this.$el.css('backgroundColor', '#fff');
    }
    onMouseLeave() {
        this.$el.find('i').eq(0).css('display', 'none');
        if(document.activeElement != this._el) {
            this.$el.css('backgroundColor', '');
        }
    }
    onFocus() {
        this._el.style.background = '#fff';
    }
    onBlur() {
        this.$el.css('backgroundColor', '');
        if(this.$el.text() != this.myContenteidtable) {
            console.log(this.$el.text());
            this.myContenteidtableChange.emit(this.$el.text());
        }
    }
}