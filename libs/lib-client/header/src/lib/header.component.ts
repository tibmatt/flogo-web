import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Header component is used to provide a similar structure of the header in the resource designer
 * page (http://localhost:4200/resources/:resourceID/:resourceType). There are few customizable areas to which user
 * might want their own components to be added. The header will have a box shadow in the bottom.
 *
 * Customizable areas:
 *  - resource logo (selector: `header-role="resource-logo"`): This will allow developers add their own logo of the plugin.
 *             It is recommended to maintain a maximum of 48x48 size logo. Developer can use any supported HTML5 approach to
 *             design their logo.
 *
 *  - right side block (selector: `header-role="right-block"`): This will allow users add resource specific action elements
 *            in the right side of the header. For example, in flows, the "Run Flow", "Log" and "Menu" are added to the
 *            right side block
 *
 *  - bottom block (selector: `header-role="bottom-block"`): This will allow users add any additional items to the bottom of
 *            the header. For example, in flows, the flow and error tabs are added to the bottom of the header
 *
 *  Inputs and Outputs:
 *    Like all components this one also has a set of inputs and outputs which will allow the consumers to provide dynamic
 *    values using inputs and respond to few user actions by subscribing to the outputs
 *
 *    Inputs:
 *      - name <string> : It is the name of the resource which can be changed
 *      - appName <string> : It is the name of the application to which the resource belongs to
 *      - description <string> (Optional): It is the description of the resource which is displayed in the header.
 *
 *    Outputs:
 *      - goBack()(void) : It is an event which emits when user clicks on the back icon or application name.
 *      - changeName() (string) : It is an event which emits the changed name of the resource.
 *      - changeDescription() (string): It is an event which emits the changed description of the resource.
 *
 * Example of usage:
 *  <flogo-designer-header [name]="Get Employee Details" [appName]="Employee Manager"
 *         (goBack)="goBackToAppPage()" (changeName)="updateResourceName($event)" >
 *   <svg header-role="resource-logo">logo to display</svg>
 *   <ng-container header-role="right-block">
 *       <logs></logs>
 *       <menu></menu>
 *   </ng-container>
 *   <div header-role="bottom-block">Caption to my resource designer page / tabs</div>
 *  </flogo-designer-header>
 **/
@Component({
  selector: 'flogo-designer-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.less'],
})
export class HeaderComponent {
  // Resource name to be displayed in the header
  @Input()
  name: string;

  // Application name to which the resource belongs
  @Input()
  appName: string;

  // Description of the resource
  @Input()
  description: string;

  // Event handler of click event on application name or back icon
  @Output()
  goBack: EventEmitter<void> = new EventEmitter<void>();

  // Event handler to handle change of the resource name
  @Output()
  changeName: EventEmitter<string> = new EventEmitter<string>();

  // Event handler to handle change of the resource description
  @Output()
  changeDescription: EventEmitter<string> = new EventEmitter<string>();
  isHoveredOnBack = false;

  onMouseOverBackControl() {
    this.isHoveredOnBack = true;
  }

  onMouseOutBackControl() {
    this.isHoveredOnBack = false;
  }
}
