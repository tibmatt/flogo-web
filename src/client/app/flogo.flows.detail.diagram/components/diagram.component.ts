import { Component, ElementRef, AfterViewInit } from 'angular2/core';
import { FlogoDiagram } from '../models';

import { DIAGRAM, TASKS } from '../mocks';

@Component( {
  selector: 'flogo-canvas-flow-diagram',
  moduleId: module.id,
  templateUrl: 'diagram.tpl.html',
  styleUrls: [ 'diagram.component.css' ],
} )
export class FlogoFlowsDetailDiagramComponent implements AfterViewInit {

  private elmRef: ElementRef;
  private diagram: FlogoDiagram;

  constructor( elementRef: ElementRef ) {
    this.elmRef = elementRef;
    console.log( Object.prototype.toString.call( this.elmRef.nativeElement ) );
  }

  ngAfterViewInit( ) {
    this.diagram = new FlogoDiagram( DIAGRAM, TASKS, this.elmRef.nativeElement );
    this.diagram.render( );
  }

}
