import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'flogo-navbar',
  // moduleId: module.id,
  templateUrl: 'navbar.tpl.html',
  styleUrls: ['navbar.component.less']
})

export class FlogoNavbarComponent implements OnInit {
  public currentYear: number;
  public isWalkthroughActivated = false;

  constructor() {
    this.currentYear = (new Date).getFullYear();
  }

  ngOnInit() {
    setTimeout(() => {
      this.showInstructions();
    }, 500);
  }

  showInstructions() {
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
