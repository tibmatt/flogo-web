import {Component, Input, Output, EventEmitter, HostListener, HostBinding, ElementRef} from '@angular/core';
import {IFlogoApplicationModel} from '../../../common/application.model';

@Component({
  selector: 'flogo-app-delete-popover',
  moduleId: module.id,
  templateUrl: 'delete.popover.tpl.html',
  styleUrls: ['delete.popover.css']
})
export class FlogoAppDeletePopoverComponent {
  @HostBinding('class.alwaysVisible')
  isPopupOpen: boolean = false;
  @Input()
  app: IFlogoApplicationModel;
  @Output()
  confirmDel: EventEmitter<IFlogoApplicationModel> = new EventEmitter();
  nativeElement: any;

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (event.target !== this.nativeElement && !this.nativeElement.contains(event.target)) {
      this.isPopupOpen = false;
    }
  }

  constructor(private _eref: ElementRef) {
    this.nativeElement = this._eref.nativeElement;
  }

  showPopup(event) {
    //event.stopPropagation();
    event.preventDefault();
    this.isPopupOpen = true;
  }

  confirmDelete(event) {
    event.stopPropagation();
    this.confirmDel.emit(this.app);
  }

  cancelDelete(event) {
    event.stopPropagation();
    this.isPopupOpen = false;
  }

}
