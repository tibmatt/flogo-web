import { Component, Input } from '@angular/core';

@Component({
  selector: 'flogo-stream-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less'],
})
export class SimulatorComponent {
  @Input() items: any[];
}
