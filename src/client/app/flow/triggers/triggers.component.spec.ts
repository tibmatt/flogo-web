import {Component, DebugElement } from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import { NavigationEnd, Router } from '@angular/router';
import {TranslateModule} from 'ng2-translate';
import { Observable } from 'rxjs/Observable';

import {FlogoFlowTriggersPanelComponent} from './triggers.component';

import {FlogoSelectTriggerComponent} from './select-trigger/select-trigger.component';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';

import {RESTAPITriggersService as RESTAPITriggersServiceV2} from '@flogo/core/services/restapi/v2/triggers-api.service';
import {RESTAPIHandlersService} from '@flogo/core/services/restapi/v2/handlers-api.service';
import {RESTAPITriggersServiceMock} from '@flogo/core/services/restapi/triggers-api.service.mock';
import {RESTAPITriggersService} from '@flogo/core/services/restapi/triggers-api.service';
import {HttpUtilsService} from '@flogo/core/services/restapi/http-utils.service';
import {RESTAPIActivitiesService} from '@flogo/core/services/restapi/activities-api.service';
import {RESTAPIContributionsService} from '@flogo/core/services/restapi/v2/contributions.service';
import {PostService} from '@flogo/core/services/post.service';
import {FlogoProfileService} from '@flogo/core/services/profile.service';
import {FlogoProfileServiceMock} from '@flogo/core/services/profile.service.mock';

import { UIModelConverterService } from '@flogo/flow/core/ui-model-converter.service';
import { InstallerModule } from '@flogo/flow/shared/installer';
import { TriggerMapperModule } from '../../flogo.trigger-mapper/trigger-mapper.module';
import { FlogoTriggerClickHandlerService } from './shared/click-handler.service';


@Component({
  selector: 'flogo-container',
  template: `
    <flogo-flow-triggers
      [triggers]="triggersList"
      [actionId]="flowId"
      [appDetails]="{appId:'123', appProfileType: profileType}"></flogo-flow-triggers>
  `
})

class ContainerComponent {
  triggersList = [];
  flowId = 'abc';
  public profileType = 0;
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
  public mockDeviceTriggerData() {
    this.triggersList = [{
      'name': 'Read From BME',
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/device/trigger/bme280stream',
      'settings': {
        'reading': '',
        'interval': '500'
      },
      'id': 'trigger1',
      'handlers': [{
          'settings': {},
          'actionId': 'abc',
          'outputs': {}
        }]
    }];
  }
}

class MockActivityContribService {

}

class MockTriggerServiceV2 {

}

class MockHandlerService {

}

class MockUIConverterService {

}

class MockRouterService {
  events = Observable.create(observer => {
    observer.next(new NavigationEnd(123, '', ''));
    observer.complete();
  });
}

const postServiceStub = {

  subscribe(options: any) {
    this.subscribeData = options;
  },

  publish(envelope: any) {
    this.published = envelope;
  },

  unsubscribe() {
  }

};

describe('Component: FlogoFlowTriggersPanelComponent', () => {
  let comp: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        InstallerModule,
        Ng2Bs3ModalModule,
        TriggerMapperModule,
      ],
      declarations: [
        FlogoFlowTriggersPanelComponent,
        ContainerComponent,
        FlogoSelectTriggerComponent
      ],
      providers: [
        FlogoTriggerClickHandlerService,
        {provide: PostService, useValue: postServiceStub },
        {provide: Router, useClass: MockRouterService},
        { provide: FlogoProfileService, useClass: FlogoProfileServiceMock },
        { provide: RESTAPITriggersService, useClass: RESTAPITriggersServiceMock },
        { provide: RESTAPIActivitiesService, useClass: MockActivityContribService },
        { provide: RESTAPIContributionsService, useClass: MockActivityContribService },
        {provide: RESTAPITriggersServiceV2, useClass: MockTriggerServiceV2},
        {provide: RESTAPIHandlersService, useClass: MockHandlerService},
        {provide: UIModelConverterService, useClass: MockUIConverterService},
        // {provide: TriggerMapperService, useValue: { open() {}, close() {}, save() {} }},
        HttpUtilsService
      ]
    });
  });

  it('When zero triggers provided it should list zero triggers', (done) => {
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

  it('Should always show Add Trigger button for Microservice Profile', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        comp = fixture.componentInstance;
        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-icon-add'));
        expect(res.length).toEqual(1);
        done();
      });
  });

  it('Should show Add Trigger button for Device Profile when there are no triggers associated to the Flow',
    (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        comp = fixture.componentInstance;
        comp.profileType = 1;
        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-icon-add'));
        expect(res.length).toEqual(1);
        done();
      });
  });

  it('Should not have Add Trigger button for Device Profile when a trigger is already associated to the Flow',
    (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        comp = fixture.componentInstance;
        comp.profileType = 1;
        comp.mockDeviceTriggerData();
        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-icon-add'));
        expect(res.length).toEqual(0);
        done();
      });
  });
});
