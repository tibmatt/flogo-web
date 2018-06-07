import {ConfiguratorComponent} from './configurator.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import { Store, StoreModule } from '@ngrx/store';
import {FakeRootLanguageModule} from '@flogo/core/language/testing';
import { featureReducer, FlowState, INITIAL_STATE } from '@flogo/flow/core/state';
import {ConfiguratorModule} from './configurator.module';
import {TriggersMock} from './mocks/triggers.mock';
import {ConfiguratorStatus} from './interfaces';
import { OpenConfigureWithSelection } from '@flogo/flow/core/state/trigger-configure.actions';

const TEST_STATE: FlowState = {
  ...INITIAL_STATE,
  id: 'abc',
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

describe('ConfiguratorComponent component', () => {
  let triggerSchemas;
  let component: ConfiguratorComponent;
  let fixture: ComponentFixture<ConfiguratorComponent>;
  let de: DebugElement;
  let store: Store<FlowState>;
  const MockData: ConfiguratorStatus = {
    selectedTriggerId: 'trigger_1',
    isOpen: true,
    disableSave: true,
    triggers: [...TriggersMock]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ConfiguratorModule,
        FakeRootLanguageModule,
        StoreModule.forRoot({
          flow: featureReducer,
        }, {
          initialState: { flow: TEST_STATE },
        }),
      ],
    });
    fixture = TestBed.createComponent(ConfiguratorComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  beforeEach(function () {
    store.dispatch(new OpenConfigureWithSelection({ triggerId: 'trigger1', triggerSchemas }));
  });

  it('Should be instantiated without any error', () => {
    expect(component).toBeDefined();
  });

  it('Should have currentModal "isOpen" status set to false', () => {
    expect(component.currentConfiguratorState.isOpen).toEqual(false);
  });

  it('Should show exact number of triggers', () => {
    component.onNextStatus(MockData);
    fixture.detectChanges();
    const triggerElements = fixture.debugElement.queryAll(By.css('.js-trigger-element'));
    expect(triggerElements.length).toEqual(2);
  });

  it('Should select at least one trigger by default', () => {
    component.onNextStatus(MockData);
    fixture.detectChanges();
    const triggerElements = fixture.debugElement.queryAll(By.css('.js-trigger-element.is-selected'));
    expect(triggerElements.length).toEqual(1);
  });

  it('Should disable save by default', () => {
    component.onNextStatus(MockData);
    fixture.detectChanges();
    expect(component.currentConfiguratorState.disableSave).toEqual(true);
  });

  triggerSchemas = {
    'github.com/TIBCOSoftware/flogo-contrib/trigger/rest': {
      'name': 'flogo-rest',
      'type': 'flogo:trigger',
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
      'version': '0.0.1',
      'title': 'Receive HTTP Message',
      'description': 'Simple REST Trigger',
      'homepage': 'https://github.com/TIBCOSoftware/flogo-contrib/tree/master/trigger/rest',
      'settings': [
        {
          'name': 'port',
          'type': 'integer',
          'required': true
        }
      ],
      'output': [
        {
          'name': 'params',
          'type': 'params'
        },
        {
          'name': 'pathParams',
          'type': 'params'
        },
        {
          'name': 'queryParams',
          'type': 'params'
        },
        {
          'name': 'header',
          'type': 'params'
        },
        {
          'name': 'content',
          'type': 'any'
        }
      ],
      'reply': [
        {
          'name': 'code',
          'type': 'integer'
        },
        {
          'name': 'data',
          'type': 'any'
        }
      ],
      'handler': {
        'settings': [
          {
            'name': 'method',
            'type': 'string',
            'required' : true,
            'allowed' : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
          },
          {
            'name': 'path',
            'type': 'string',
            'required' : true
          }
        ]
      }
    },
    'github.com/TIBCOSoftware/flogo-contrib/trigger/timer': {
      'name': 'flogo-timer',
      'type': 'flogo:trigger',
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/timer',
      'version': '0.0.1',
      'title': 'Timer',
      'description': 'Simple Timer trigger',
      'homepage': 'https://github.com/TIBCOSoftware/flogo-contrib/tree/master/trigger/timer',
      'settings': [
      ],
      'output': [
        {
          'name': 'params',
          'type': 'params'
        },
        {
          'name': 'content',
          'type': 'object'
        }
      ],
      'handler': {
        'settings': [
          {
            'name': 'repeating',
            'type': 'string',
            'value': 'false',
            'required' : true
          },
          {
            'name': 'notImmediate',
            'type': 'string',
            'value': 'true'
          },
          {
            'name': 'startDate',
            'type': 'string',
            'value': '2018-01-01T12:00:00Z00:00'
          },
          {
            'name': 'hours',
            'type': 'string'
          },
          {
            'name': 'minutes',
            'type': 'string'
          },
          {
            'name': 'seconds',
            'type': 'string'
          }
        ]
      }
    }
  };

});
