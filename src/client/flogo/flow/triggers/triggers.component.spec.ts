import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';

import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BsModalModule } from 'ng2-bs3-modal';

import { InstallerModule } from '@flogo/flow/shared/installer';
import { UIModelConverterService } from '@flogo/flow/core/ui-model-converter.service';
import { FakeRootLanguageModule } from '@flogo/core/language/testing';
import { FlogoFlowTriggersPanelComponent } from './triggers.component';
import { FlogoSelectTriggerComponent } from './select-trigger/select-trigger.component';

import { TriggersApiService } from '@flogo/core/services';
import { RESTAPIHandlersService } from '@flogo/core/services/restapi/v2/handlers-api.service';
import { HttpUtilsService } from '@flogo/core/services/restapi/http-utils.service';
import { RESTAPIContributionsService } from '@flogo/core/services/restapi/v2/contributions.service';
import { PostService } from '@flogo/core/services/post.service';
import { FlogoProfileService } from '@flogo/core/services/profile.service';
import { FlogoProfileServiceMock } from '@flogo/core/services/profile.service.mock';

import { App } from '@flogo/core/interfaces/flow/app';
import { featureReducer, FlowState, Init, INITIAL_STATE } from '../core/state';
import { TriggerBlockComponent } from './trigger-block';
import { ConfiguratorModule as TriggersConfiguratorModule } from './configurator';

const TEST_STATE: FlowState = {
  ...INITIAL_STATE,
  id: 'abc',
  app: <App>(<any>{
    id: 'someId',
    name: 'name',
    description: '',
    type: 'microservice',
  }),
};

const MICROSERVICE_TRIGGERS_HANDLERS = {
  triggers: {
    trigger1: {
      id: 'trigger1',
      name: 'Receive HTTP Message',
      ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
      description: 'Simple REST Trigger',
      settings: {
        port: null,
      },
      createdAt: '',
      updatedAt: '',
      handlers: [
        {
          settings: {
            method: 'GET',
            path: null,
            autoIdReply: null,
            useReplyHandler: null,
          },
          actionId: 'abc',
          outputs: {},
          actionMappings: {
            input: [],
            output: [],
          },
        },
        {
          settings: {
            method: null,
            path: null,
            autoIdReply: null,
            useReplyHandler: null,
          },
          actionId: 'abc',
          outputs: {},
          actionMappings: {
            input: [],
            output: [],
          },
        },
      ],
    },
    trigger2: {
      id: 'trigger2',
      name: 'Timer',
      createdAt: '',
      updatedAt: '',
      ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/timer',
      description: 'Simple Timer Trigger',
      settings: {
        port: null,
      },
      handlers: [
        {
          settings: {
            method: 'GET',
            path: null,
            autoIdReply: null,
            useReplyHandler: null,
          },
          actionId: 'abc',
          outputs: {},
          actionMappings: {
            input: [],
            output: [],
          },
        },
        {
          settings: {
            method: null,
            path: null,
            autoIdReply: null,
            useReplyHandler: null,
          },
          actionId: 'ghi',
          outputs: {},
          actionMappings: {
            input: [],
            output: [],
          },
        },
      ],
    },
  },
  handlers: {
    trigger1: {
      triggerId: 'trigger1',
      actionId: 'abc',
      settings: {
        method: 'GET',
        path: null,
        autoIdReply: null,
        useReplyHandler: null,
      },
      outputs: {},
      actionMappings: {
        input: [],
        output: [],
      },
    },
    trigger2: {
      triggerId: 'trigger2',
      actionId: 'ghi',
      settings: {
        method: null,
        path: null,
        autoIdReply: null,
        useReplyHandler: null,
      },
      outputs: {},
      actionMappings: {
        input: [],
        output: [],
      },
    },
  },
};

const DEVICE_TRIGGERS_HANDLERS = {
  triggers: {
    trigger1: {
      id: 'trigger1',
      name: 'Read From BME',
      ref: 'github.com/TIBCOSoftware/flogo-contrib/device/trigger/bme280stream',
      settings: {
        reading: '',
        interval: '500',
      },
      handlers: [
        {
          settings: {},
          actionId: 'abc',
          outputs: {},
        },
      ],
    },
  },
  handlers: {
    trigger1: {
      triggerId: 'trigger1',
      actionId: 'abc',
      settings: {},
      outputs: {},
    },
  },
};

class MockActivityContribService {}

class MockTriggerServiceV2 {}

class MockHandlerService {}

class MockUIConverterService {}

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

  unsubscribe() {},
};

describe('Component: FlogoFlowTriggersPanelComponent', () => {
  let fixture: ComponentFixture<FlogoFlowTriggersPanelComponent>;
  let store: Store<FlowState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FakeRootLanguageModule,
        InstallerModule,
        BsModalModule,
        TriggersConfiguratorModule,
        StoreModule.forRoot({
          flow: featureReducer,
        }),
      ],
      declarations: [FlogoFlowTriggersPanelComponent, TriggerBlockComponent, FlogoSelectTriggerComponent],
      providers: [
        { provide: PostService, useValue: postServiceStub },
        { provide: Router, useClass: MockRouterService },
        { provide: FlogoProfileService, useClass: FlogoProfileServiceMock },
        { provide: RESTAPIContributionsService, useClass: MockActivityContribService },
        { provide: TriggersApiService, useClass: MockTriggerServiceV2 },
        { provide: RESTAPIHandlersService, useClass: MockHandlerService },
        { provide: UIModelConverterService, useClass: MockUIConverterService },
        HttpUtilsService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(FlogoFlowTriggersPanelComponent);
  });

  it('When zero triggers provided it should list zero triggers', () => {
    store.dispatch(
      new Init({
        ...TEST_STATE,
        triggers: {},
        handlers: {},
      })
    );
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-icon-trigger'));
    expect(res.length).toEqual(0);
  });

  it('If two triggers are provided it should list two triggers', () => {
    store.dispatch(
      new Init({
        ...TEST_STATE,
        ...MICROSERVICE_TRIGGERS_HANDLERS,
      })
    );
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-icon-trigger'));
    expect(res.length).toEqual(2);
  });

  it('Should always show Add Trigger button for Microservice Profile', () => {
    store.dispatch(
      new Init({
        ...TEST_STATE,
        ...MICROSERVICE_TRIGGERS_HANDLERS,
      })
    );
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-icon-add'));
    expect(res.length).toEqual(1);
  });

  it('Should show Add Trigger button for Device Profile when there are no triggers associated to the Flow', () => {
    store.dispatch(
      new Init({
        ...TEST_STATE,
        app: <any>{
          ...TEST_STATE.app,
          type: 'device',
        },
        triggers: {},
        handlers: {},
      })
    );
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-icon-add'));
    expect(res.length).toEqual(1);
  });

  it('Should not have Add Trigger button for Device Profile when a trigger is already associated to the Flow', () => {
    store.dispatch(
      new Init({
        ...TEST_STATE,
        app: <any>{
          ...TEST_STATE.app,
          device: 'device',
        },
        ...DEVICE_TRIGGERS_HANDLERS,
      })
    );
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-icon-add'));
    expect(res.length).toEqual(0);
  });
});
