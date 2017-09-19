import {Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from 'ng2-translate';
import {FlogoFlowTriggersPanelComponent} from './triggers-panel.component';
import {By} from '@angular/platform-browser';

@Component({
  selector: 'flogo-container',
  template: `
    <flogo-flows-detail-triggers-panel
                [triggers]="triggersList"
                [actionId]="flowId"
                [appDetails]="{appId:'123', appProfileType: 0}"></flogo-flows-detail-triggers-panel>
  `
})

class ContainerComponent {
  triggersList = [];
  flowId = 'abc';
  public mockTriggersData() {
    this.triggersList = [{
      'name': 'Receive HTTP Message',
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
      'description': 'Simple REST Trigger',
      'settings': {
        'port': null
      },
      'id': 'trigger1',
      'handlers': [
        {
          'settings': {
            'method': 'GET',
            'path': null,
            'autoIdReply': null,
            'useReplyHandler': null
          },
          'actionId': 'abc',
          'outputs': {}
        },
        {
          'settings': {
            'method': null,
            'path': null,
            'autoIdReply': null,
            'useReplyHandler': null
          },
          'actionId': 'abc',
          'outputs': {}
        }
      ]
    }, {
      'name': 'Timer',
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/timer',
      'description': 'Simple Timer Trigger',
      'settings': {
        'port': null
      },
      'id': 'trigger2',
      'handlers': [
        {
          'settings': {
            'method': 'GET',
            'path': null,
            'autoIdReply': null,
            'useReplyHandler': null
          },
          'actionId': 'abc',
          'outputs': {}
        },
        {
          'settings': {
            'method': null,
            'path': null,
            'autoIdReply': null,
            'useReplyHandler': null
          },
          'actionId': 'ghi',
          'outputs': {}
        }
      ]
    }];
  }
}

describe('Component: FlogoFlowTriggersPanelComponent', () => {
  let comp: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [FlogoFlowTriggersPanelComponent, ContainerComponent]
    });
  });

  it('Should list zero triggers', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        comp = fixture.componentInstance;
        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-icon-trigger'));
        expect(res.length).toEqual(0);
        done();
      });
  });

  it('Should list three triggers', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        comp = fixture.componentInstance;
        comp.mockTriggersData();
        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-icon-trigger'));
        expect(res.length).toEqual(3);
        done();
      });
  });
});
