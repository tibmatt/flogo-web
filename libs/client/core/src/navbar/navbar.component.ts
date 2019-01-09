import { isEmpty } from 'lodash';
import { Component, OnInit, Inject } from '@angular/core';
import { FLOGO_VERSION } from '../flogo-version.token';

@Component({
  selector: 'flogo-navbar',
  // moduleId: module.id,
  templateUrl: 'navbar.tpl.html',
  styleUrls: ['navbar.component.less'],
})
export class FlogoNavbarComponent implements OnInit {
  public currentYear: number;
  public isWalkthroughActivated = false;
  isOpenMenu = false;

  constructor(@Inject(FLOGO_VERSION) public version: string) {
    this.currentYear = new Date().getFullYear();
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
    if (isEmpty(instructions)) {
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

  toggleNavMenu() {
    this.isOpenMenu = !this.isOpenMenu;
  }

  closeNavMenu() {
    this.isOpenMenu = false;
  }
}
