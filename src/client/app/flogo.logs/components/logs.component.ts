import {Component, ElementRef, Renderer} from '@angular/core';
import {LogService} from '../log.service';
import {ChildWindowService, ChildWindow} from '../../../common/services/child-window.service';


@Component(
  {
    selector: 'flogo-logs',
    moduleId: module.id,
    templateUrl: 'logs.tpl.html',
    styleUrls: ['logs.component.css']
  }
)
export class FlogoLogs {
  messages: string[];
  searchValue: string = '';
  isOpen: boolean = false;
  childWindow: ChildWindow = null;

  constructor(private windowService: ChildWindowService) {
  }

  ngOnInit() {
  }

  public windowAction(event) {
    switch(event) {
      case 'close':
        this.closeLogs();
        break;

      case 'maximize':
        this.closeLogs();
        setTimeout(()=>this.open(),100);
        break;

      case 'back':
        break;
    }
  }

  public toggleLogs() {
    this.isOpen = !this.isOpen;
  }

  public showLogs() {
    this.isOpen = true;
  }

  public closeLogs() {
    this.isOpen = false;
  }

  // --------- windows service

   get isChildWindowOpen() {
    return this.childWindow && this.childWindow.isOpen();
   }

   open() {
     if (!this.windowService.isSupported()){
      console.log('Child window not supported');
      return;
     } else if (this.childWindow && this.childWindow.isOpen()) {
      return this.childWindow.focus();
     }

     this.childWindow = this.windowService.open('/logs', 'logs');
     this.childWindow.closed
       .subscribe(e => {
        this.childWindow = null;
       });

     }

}
