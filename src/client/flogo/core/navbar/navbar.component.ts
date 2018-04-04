import {Component, OnInit} from '@angular/core';
import {environment} from '../../../environments/environment';


@Component({
  selector: 'flogo-navbar',
  // moduleId: module.id,
  templateUrl: 'navbar.tpl.html',
  styleUrls: ['navbar.component.less']
})

export class FlogoNavbarComponent implements OnInit {
  public currentYear: number;
  public isWalkthroughActivated = false;
  public version: string;

  constructor() {
    this.currentYear = (new Date).getFullYear();
    this.version = environment.version;
  }

  ngOnInit() {
    // TODO: re-enable after v0.5.1 with updated content
    // setTimeout(() => {
    //   this.showInstructions();
    // }, 500);
  }

  showInstructions() {
    // TODO: show again if walkthrough content was updated?
    const instructions: string = localStorage.getItem('flogo-show-instructions');
    if (_.isEmpty(instructions)) {
      localStorage.setItem('flogo-show-instructions', new Date().toString());
      this.isWalkthroughActivated = true;
    }
    return this.isWalkthroughActivated;
  }

  public onClosedInstructions(closed) {
    this.isWalkthroughActivated = false;
  }

  public activateInstructions(event: any) {
    this.isWalkthroughActivated = true;
  }

}
