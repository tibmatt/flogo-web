import {
  Directive, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output,
  SimpleChange
} from '@angular/core';
import { SanitizeService } from '../../core/services/sanitize.service';

@Directive({
  selector: '[fgContentEditable]',
  providers: []
})
export class ContenteditableDirective implements OnInit, OnChanges {
  @Input()
  fgContentEditable: string;
  @Input()
  placeholder: string;
  @Output()
  fgContentEditableChange = new EventEmitter();
  private _el: HTMLElement;
  private $el: any;
  private colorFlag: boolean;

  constructor(private el: ElementRef, private sanitizer: SanitizeService) {
    this._el = el.nativeElement;
    this.$el = jQuery(this._el);
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (_.has(changes, 'fgContentEditable')) {
      const input = changes['fgContentEditable'].currentValue;
      if (input) {
        this.el.nativeElement.textContent = input;
      }
    }
  }

  ngOnInit() {
    if (this.fgContentEditable !== undefined) {
      this.$el.text(this.fgContentEditable);
    }
    this.$el.attr('contenteditable', 'true');
    this.$el.css({
      'paddingRight': '38px',
      'marginLeft': '-10px',
      'paddingLeft': '10px',
      'borderRadius': '4px',
      'outline': 'none',
      'lineHeight': parseInt(this.$el.css('lineHeight'), 10) - 2 + 'px',
      'border': '1px solid transparent'
    });
    this._initPlaceholder();
    const origColor = this.$el.css('color');
    if (origColor === 'rgb(255, 255, 255)') {
      this.colorFlag = true;
    }
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (document.activeElement !== this._el) {
      this.$el.css({ 'background': '#fff url("/assets/svg/flogo.flows.detail.edit.icon.svg") center right no-repeat' });
      if (this.colorFlag) {
        this.$el.css('color', '#666');
      }
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (document.activeElement !== this._el) {
      this.$el.css({
        'background': '',
        'border': '1px solid transparent',
      });
      if (this.colorFlag) {
        this.$el.css('color', 'rgb(255, 255, 255)');
      }
    } else {
      // omit
    }
  }

  @HostListener('focus')
  onFocus() {
    this.$el.css({
      'background': '#fff',
      'border': '1px solid #0082d5',
      'overflow': 'auto',
      'text-overflow': 'clip'
    });
    if (this.colorFlag) {
      this.$el.css('color', 'rgb(102, 102, 102)');
    }
    if (this.$el.find('span')) {
      this.$el.find('span').eq(0).remove();
    }
  }

  @HostListener('blur')
  onBlur() {
    if (this.placeholder || this.$el.text() !== '') {
      this.$el.css({
        'background': '',
        'border': '1px solid transparent',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
      }).scrollLeft(0);

      if (this.colorFlag) {
        this.$el.css('color', 'rgb(255, 255, 255)');
      }
      if (this.$el.text() === '' && this.fgContentEditable === undefined) {
        // omit
      } else if (this.$el.text() !== this.fgContentEditable) {
        this.fgContentEditableChange.emit(this.$el.text());
      }
      this._initPlaceholder();
    } else {
      this.$el.focus();
      const sumFlash = 5;
      const warmEle = this.$el;
      let cur = 0;
      let timer;
      timer = setInterval(() => {
        if (cur <= sumFlash) {
          if (cur % 2) {
            warmEle.css('border', '#0082d5 solid 1px');
          } else {
            warmEle.css('border', '#ff9948 solid 1px');
          }
          cur++;
        } else {
          clearInterval(timer);
        }
      }, 100);
    }

  }

  private _initPlaceholder() {
    if (this.$el.text() === '') {
      this.$el.append(`<span>${this.placeholder}</span>`);
    } else {
      if (this.$el.find('span')) {
        this.$el.find('span').eq(0).remove();
      }
    }
  }
}
