import { Component, Inject } from '@angular/core';
import { FLOGO_VERSION } from '@flogo-web/client/core';

@Component({
  selector: 'flogo-navbar',
  templateUrl: 'navbar.tpl.html',
  styleUrls: ['navbar.component.less'],
})
export class FlogoNavbarComponent {
  public currentYear: number;
  isOpenMenu = false;

  constructor(@Inject(FLOGO_VERSION) public version: string) {
    this.currentYear = new Date().getFullYear();
  }

  toggleNavMenu() {
    this.isOpenMenu = !this.isOpenMenu;
  }

  closeNavMenu() {
    this.isOpenMenu = false;
  }
}
