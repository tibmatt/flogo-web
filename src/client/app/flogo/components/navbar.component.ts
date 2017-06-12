import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'flogo-navbar',
  // moduleId: module.id,
  templateUrl: 'navbar.tpl.html',
  styleUrls: ['navbar.component.less']
})

export class FlogoNavbarComponent implements OnInit {

  public isInstructionsActivated: boolean  = false;

  ngOnInit() {
    setTimeout(() => {
      this.showInstructions();
    }, 500);
  }

  showInstructions() {
    let instructions:string = localStorage.getItem('flogo-show-instructions');
    if(_.isEmpty(instructions)) {
      localStorage.setItem('flogo-show-instructions', new Date().toString());
      this.isInstructionsActivated = true;
    }
    return this.isInstructionsActivated;
  }

  public onClosedInstructions(closed) {
    this.isInstructionsActivated = false;
  }

  public activateInstructions(event:any) {
    this.isInstructionsActivated = true;
  }

}
