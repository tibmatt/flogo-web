import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { PostService } from '@flogo/core/services/post.service';
import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { CommonModule as NgCommonModule } from '@angular/common';
import { TaskConfiguratorComponent } from './task-configurator.component';
import { MapperModule } from '../shared/mapper';
import { FakeRootLanguageModule } from '@flogo/core/language/testing';
import { SelectTaskConfigEventData } from '@flogo/flow/task-configurator/messages';
import { InputMapperComponent } from './input-mapper';
import { IteratorComponent } from './iterator/iterator.component';
import { ValueType } from '@flogo/core';
import { SubFlowComponent } from './subflow/subflow.component';
import {FlowsListModule} from '../shared/flows-list';
import {FlogoFlowService as FlowsService} from '@flogo/flow/core';

const postServiceStub = {

  subscribe(options: any) {
    this.subscribeData = options;
  },

  publish(envelope: any) {
    this.published = envelope;
    this.subscribeData.callback(envelope);
  },

  unsubscribe(sub: any) {
  }

};

const flowServiceStub = {

  listFlowsForApp(appId) {
    return {
      name: 'test flow',
      description: 'test description',
      id: 'test_flow',
      metadata: {
        input: [],
        output: []
      }
    };
  }
};

// TODO: disabling while working on mapper upgrade
describe('Component: TaskConfiguratorComponent', () => {
  let comp: TaskConfiguratorComponent;
  let fixture: ComponentFixture<TaskConfiguratorComponent>;
  let de: DebugElement;

  beforeEach((done) => {
    TestBed.configureTestingModule({
      imports: [
        NgCommonModule,
        FakeRootLanguageModule,
        FlogoSharedModule,
        MapperModule,
        FlowsListModule
      ],
      declarations: [
        InputMapperComponent,
        IteratorComponent,
        SubFlowComponent,
        TaskConfiguratorComponent,
      ], // declare the test component
      providers: [
        {provide: PostService, useValue: postServiceStub},
        {provide: FlowsService, useValue: flowServiceStub}
      ]// ,
      // schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TaskConfiguratorComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.flowId = 'root';
        fixture.detectChanges();

        const postService = <PostService>fixture.debugElement.injector.get(PostService);
        postService.publish(getMockData());
        fixture.detectChanges();
      })
      // allow modal to open
      .then(() => setTimeout(() => done(), 0));

  });

  it('Should open the transform component', () => {
    fixture.detectChanges();
    expect(comp.isActive).toBeTruthy('Transform component is not active');
    expect(de.query(By.css('.qa-transform-modal'))).not.toBeNull('Transform modal is not present');
  });

  function getMockData(): SelectTaskConfigEventData {

    return {
      scope: [
        {
          'type': 0,
          'triggerType': 'tibco-timer',
          'name': 'Timer Trigger',
          'settings': [],
          'outputs': [
            {
              'name': 'params',
              'type': ValueType.Params,
              'value': null
            },
            {
              'name': 'content',
              'type': ValueType.Object,
              'value': null
            }
          ],
          'handler': {
            'settings': [
              {
                'name': 'repeating',
                'type': 'string',
                'value': 'true'
              },
              {
                'name': 'startDate',
                'type': 'string',
                'value': ''
              },
              {
                'name': 'hours',
                'type': 'string',
                'value': ''
              },
              {
                'name': 'minutes',
                'type': 'string'
              },
              {
                'name': 'seconds',
                'type': 'string',
                'value': '15'
              }
            ]
          },
          'id': 'RmxvZ286OlRyaWdnZXI6OjE0NzM3MTM1ODQ2NzY'
        },
        {
          'type': 1,
          'activityType': 'tibco-counter',
          'name': 'Number Counter',
          'title': 'Counter Activity',
          'attributes': {
            'inputs': [
              {
                'name': 'counterName',
                'type': ValueType.String,
                'required': true,
                'value': 'number'
              },
              {
                'name': 'increment',
                'type': ValueType.Boolean,
                'value': 'true'
              },
              {
                'name': 'reset',
                'type': ValueType.Boolean,
                'value': 'false'
              }
            ],
            'outputs': [
              {
                'name': 'value',
                'type': ValueType.Integer,
              }
            ]
          },
          'id': 'Mg'
        }
      ],
      tile: {
        'type': 1,
        'activityType': 'tibco-log',
        'name': 'Logger',
        'version': '0.0.1',
        // 'title': 'Log Activity',
        'description': 'To log the number',
        'attributes': {
          'inputs': [
            {
              'name': 'message',
              'type': ValueType.String,
              'value': 'hello world'
            },
            {
              'name': 'flowInfo',
              'type': ValueType.Boolean,
              'value': 'true'
            },
            {
              'name': 'addToFlow',
              'type': ValueType.Boolean,
              'value': 'true'
            }
          ],
          'outputs': [
            {
              'name': 'message',
              'type': ValueType.String,
              value: ''
            }
          ]
        },
        'inputMappings': [
          {
            mapTo: 'message',
            type: 1,
            value: '{T.params}'
          }
        ],
        'id': 'Mw'
      },
      handlerId: 'root',
      iterator: {
        isIterable: false,
      }
    };
  }

});

