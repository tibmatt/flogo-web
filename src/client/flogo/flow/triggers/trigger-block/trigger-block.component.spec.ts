import {Component, DebugElement, ViewChild} from '@angular/core';
import {IFlogoTrigger} from '@flogo/flow/triggers/models';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NavigationEnd, Router} from '@angular/router';
import {TriggerBlockComponent} from '@flogo/flow/triggers/trigger-block/trigger-block.component';
import {Observable} from 'rxjs/Observable';
import {FakeRootLanguageModule} from '@flogo/core/language/testing';
import {By} from '@angular/platform-browser';

@Component({
  selector: 'flogo-container',
  template: `
    <flogo-flow-triggers-trigger-block #triggerBlock
                                       [trigger]="triggerEntity"
                                       [isDevice]="isDeviceType"
                                       (menuItemSelected)="checkMenuAction($event)"></flogo-flow-triggers-trigger-block>
  `
})
class FlogoContainerComponent {
  triggerEntity: IFlogoTrigger;
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

  beforeEach((done) => {
    return TestBed.compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlogoContainerComponent);
        comp = fixture.componentInstance;
        done();
      });
  });

  it('When initiated trigger is not selected', () => {
    comp = fixture.componentInstance;
    fixture.detectChanges();
    const triggerBlock: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.trigger_block--selected'));
    expect(triggerBlock.length).toEqual(0);
  });

  describe('for microservice profiles', () => {
    it('trigger menu should open when hovered on trigger and it should be selected', () => {
      comp.isDeviceType = false;
      comp.triggerBlock.handleTriggerMenuShow();
      fixture.detectChanges();
      expect(comp.triggerBlock.isShowingMenu).toEqual(true);
    });

    it('trigger settings must be shown when trigger is selected', (done) => {
      comp.isDeviceType = false;
      fixture.detectChanges();
      comp.triggerBlock.menuItemSelected.subscribe((data) => {
        expect(data.operation).toEqual('show-settings');
        done();
      });
      comp.triggerBlock.handleTriggerSelection();
      fixture.detectChanges();
    });
  });

  describe('for device profiles', () => {
    it('trigger settings must be shown when trigger is selected', (done) => {
      comp.isDeviceType = true;
      fixture.detectChanges();
      comp.triggerBlock.menuItemSelected.subscribe((data) => {
        expect(data.operation).toEqual('show-settings');
        done();
      });
      comp.triggerBlock.handleTriggerSelection();
      fixture.detectChanges();
    });
  });
});
