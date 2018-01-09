import {Component, ViewChild} from '@angular/core';
import {IFlogoTrigger} from '@flogo/flow/triggers/models';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NavigationEnd, Router} from '@angular/router';
import {TriggerBlockComponent} from '@flogo/flow/triggers/trigger-block/trigger-block.component';
import {Observable} from 'rxjs/Observable';
import {FakeRootLanguageModule} from '@flogo/core/language/testing';

@Component({
  selector: 'flogo-container',
  template: `
    <flogo-flow-triggers-trigger-block #triggerBlock
      [trigger]="triggerEntity"
      [keepSelected]="isMapperOpen"
      [isDevice]="isDeviceType"
      (onMenuItemSelected)="checkMenuAction($event)"></flogo-flow-triggers-trigger-block>
  `
})
class FlogoContainerComponent {
  triggerEntity: IFlogoTrigger;
  isMapperOpen: boolean;
  isDeviceType: boolean;
  @ViewChild('triggerBlock') triggerBlock: TriggerBlockComponent;

  constructor() {
    this.triggerEntity = {
      'name': 'Timer',
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/timer',
      'description': 'Simple Timer trigger',
      'settings': {},
      'id': '432423',
      'createdAt': '',
      'updatedAt': '',
      'handlers': [
        {
          'settings': {},
          'outputs': {},
          'actionMappings': {
            'input': [],
            'output': []
          },
          'actionId': '435435'
        }
      ],
      'appId': '34543523',
      'handler': {
        'settings': {},
        'outputs': {},
        'actionMappings': {
          'input': [],
          'output': []
        },
        'actionId': '435643'
      }
    };
    this.isDeviceType = false;
    this.isMapperOpen = false;
  }

  checkMenuAction(event) {}
}

class MockRouterService {
  events = Observable.create(observer => {
    observer.next(new NavigationEnd(123, '', ''));
    observer.complete();
  });
}

describe('Component: TriggerBlockComponent', () => {
  let comp: FlogoContainerComponent;
  let fixture: ComponentFixture<FlogoContainerComponent>;

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FakeRootLanguageModule
      ],
      declarations: [
        FlogoContainerComponent,
        TriggerBlockComponent
      ],
      providers: [
        {provide: Router, useClass: MockRouterService},
      ]
    });
  });

  it('When initiated trigger is not selected', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoContainerComponent);
        comp = fixture.componentInstance;
        fixture.detectChanges();
        expect(comp.triggerBlock.isSelected).toEqual(false);
        done();
      });
  });

  it('Trigger menu should open when trigger is selected in case of microservices', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoContainerComponent);
        comp = fixture.componentInstance;
        comp.triggerBlock.handleTriggerSelection();
        fixture.detectChanges();
        expect(comp.triggerBlock.isSelected).toEqual(true);
        done();
      });
  });

  it('Trigger configuration details must be shown when trigger is selected in case of device profile', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoContainerComponent);
        comp = fixture.componentInstance;
        comp.isDeviceType = true;
        fixture.detectChanges();
        comp.triggerBlock.onMenuItemSelected.subscribe((data) => {
          expect(data.operation).toEqual('configure');
          done();
        });
        comp.triggerBlock.handleTriggerSelection();
        fixture.detectChanges();
      });
  });

  it('Trigger should be unselected once the trigger mapper is closed', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoContainerComponent);
        comp = fixture.componentInstance;
        comp.isMapperOpen = true;
        comp.triggerBlock.selectedMenuItem('trigger-mappings');
        fixture.detectChanges();
        comp.isMapperOpen = false;
        fixture.detectChanges();
        expect(comp.triggerBlock.isSelected).toEqual(false);
        done();
      });
  });
});
