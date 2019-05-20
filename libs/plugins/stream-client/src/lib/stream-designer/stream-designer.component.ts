import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ValueType } from '@flogo-web/core';

import { SimulatorService } from '../simulator.service';

@Component({
  selector: 'flogo-stream-designer',
  templateUrl: './stream-designer.component.html',
  styleUrls: ['./stream-designer.component.less'],
  providers: [SimulatorService],
})
export class StreamDesignerComponent implements OnInit {
  isPanelOpen = false;
  simulationData$: Observable<any[]>;
  isMenuOpen = false;

  constructor(private simulationService: SimulatorService) {}

  ngOnInit() {
    this.simulationData$ = this.simulationService.data$.pipe(
      scan((acc: any[], val) => {
        acc.unshift(val);
        return acc.slice(0, 5);
      }, [])
    );
  }

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;

    if (this.isPanelOpen) {
      this.simulationService.startSimulation([
        { name: 'field1', type: ValueType.Integer },
        { name: 'field2', type: ValueType.String },
      ]);
    } else {
      this.simulationService.stopSimulation();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  deleteStream() {
    this.closeMenu();
  }
}
