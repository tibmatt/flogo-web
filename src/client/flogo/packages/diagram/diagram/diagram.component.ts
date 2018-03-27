import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Flow, DiagramSelection, DiagramAction, Tile } from '../interfaces';
import { TileMatrix, makeRenderableMatrix } from '../renderable-model';
@Component({
  // temporal name until old diagram implementation is removed
  selector: 'flogo-diagram-v2',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.less']
})
export class DiagramComponent implements OnChanges {
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
