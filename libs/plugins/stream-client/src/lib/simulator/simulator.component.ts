import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import perspective, { PerspectiveWorker, Table } from '@finos/perspective';
import { SimulatorService } from '../simulator.service';

@Component({
  selector: 'flogo-stream-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent implements AfterViewInit, OnChanges {
  @Input() items: any[];
  @ViewChild('inputView') inputView: ElementRef;
  @ViewChild('outputView') outputView: ElementRef;
  private worker: PerspectiveWorker;
  private table: Table;

  // todo: run everything outside the ngZone for better perf (we don't need change detection since external lib takes care of almost everything)
  constructor(private zone: NgZone, private simulationService: SimulatorService) {}

  ngOnChanges({ items: itemsChange }: SimpleChanges) {
    if (itemsChange && this.table) {
      this.table.update(this.items);
    }
  }

  ngAfterViewInit() {
    if (this.inputView && this.inputView.nativeElement) {
      this.worker = perspective.worker();
      // TODO: remove timeout hack, figure out how to know when library is ready
      setTimeout(() => {
        this.table = this.worker.table(this.items || [], { index: null, limit: 100 });
        this.inputView.nativeElement.load(this.table);
        this.outputView.nativeElement.load(this.table);
      }, 1000);
    }
  }
}
