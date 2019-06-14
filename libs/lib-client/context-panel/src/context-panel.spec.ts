import { async, TestBed } from '@angular/core/testing';
import { ContextPanelAreaComponent } from './context-panel-area.component';
import { TriggerComponent } from './trigger/trigger.component';

describe('ContextPanel', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DiagramModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DiagramModule).toBeDefined();
  });
});
