import { Component, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Flow, DiagramSelection, DiagramAction, Tile } from '../interfaces';
import { TileMatrix, makeRenderableMatrix } from '../renderable-model';
import { animate, animateChild, query, stagger, style, transition, trigger } from '@angular/animations';
@Component({
  // temporal name until old diagram implementation is removed
  selector: 'flogo-diagram-v2',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.less'],
  animations: [
    trigger('list', [
      transition(':enter', [
        // child animation selector + stagger
        query('@items',
          stagger(100, animateChild())
        )
      ]),
    ]),
    trigger('items', [
      // cubic-bezier for a tiny bouncing feel
      transition(':enter', [
        style({ transform: 'scale(0.7)', opacity: 0 }),
        animate('0.8s cubic-bezier(.8,-0.6,0.2,1.5)',
          style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1, height: '*' }),
        animate('0.8s cubic-bezier(.8,-0.6,0.2,1.5)',
          style({ transform: 'scale(0.5)', opacity: 0, height: '0px', margin: '0px' }))
      ]),
    ])
  ],
})
export class DiagramComponent implements OnChanges {
  @HostBinding('@list') animateList = true;
  @Input() flow: Flow;
  @Input() selection: DiagramSelection;
  @Output() action = new EventEmitter<DiagramAction>();

  tileMatrix: TileMatrix;

  ngOnChanges({ flow: flowChange }: SimpleChanges) {
    if (flowChange) {
      this.tileMatrix = makeRenderableMatrix(this.flow, 7);
    }
  }

  onAction(action: DiagramAction) {
    this.action.emit(action);
  }

  trackByIndex(index, row: Tile[]) {
    return index;
  }

}
