import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { PostService } from '../../../common/services/post.service';
import { CommonModule as FlogoCommonModule } from '../../../common/common.module';
import { CoreModule as FlogoCoreModule } from '../../../common/core.module';
import { TransformComponent } from './transform.component';
import { ErrorDisplayComponent } from './error-display.component';
import { HelpComponent } from './help.component';
import { MapEditorComponent } from './map-editor.component';
import { TransformJsonPanelComponent } from './transform-json-panel.component';
import { TransformMapperComponent } from './transform-mapper.component';
import { TransformMapperFieldComponent } from './transform-mapper-field.component';
import { VisualMapperComponent } from './visual-mapper.component';
import { VisualMapperInputComponent } from './visual-mapper-input.component';
import { VisualMapperOutputComponent } from './visual-mapper-output.component';

const EXISTING_FLOW_NAME = 'existing';
const flowsServiceStub = {

  findFlowsByName(name: string) {
    let flowArr = [];
    if (name === EXISTING_FLOW_NAME) {
      flowArr = [{ id: '123', name: EXISTING_FLOW_NAME }];
    }
    return Promise.resolve(flowArr);
  }

};

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
// TODO: disabling while working on mapper upgrade
xdescribe('Component: TransformComponent', () => {
  let comp: TransformComponent;
  let fixture: ComponentFixture<TransformComponent>;
  let de: DebugElement;

  beforeEach((done) => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          provide: TranslateLoader,
          useFactory: (http: Http) => new TranslateStaticLoader(http, '/base/dist/public/assets/i18n', '.json'),
          deps: [Http],
        }),
        FlogoCoreModule,
        FlogoCommonModule
      ],
      declarations: [
        ErrorDisplayComponent,
        HelpComponent,
        MapEditorComponent,
        TransformJsonPanelComponent,
        TransformMapperFieldComponent,
        TransformMapperComponent,
        VisualMapperComponent,
        VisualMapperInputComponent,
        VisualMapperOutputComponent,
        TransformComponent

      ], // declare the test component
      providers: [
        // { provide: RESTAPIFlowsService, useValue: flowsServiceStub },
        { provide: PostService, useValue: postServiceStub }
      ]// ,
      // schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TransformComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.flowId = 'root';
        comp.fieldsConnections = { oldfield: { data: 'should be cleared' } };
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
    expect(comp.active).toBeTruthy('Transform component is not active');
    expect(de.query(By.css('.flogo-transform-modal'))).not.toBeNull('Transform modal is not present');
  });

  it('When mapping changes should clear the connection state', fakeAsync(() => {
    fixture.detectChanges();
    expect(comp.fieldsConnections).toEqual({
      message: {
        value: 'timer-trigger.params',
        mapTo: 'message',
        hasError: false
      }
    });
  }));

  function getMockData() {

    return {
      'previousTiles': [
        {
          'type': 0,
          'triggerType': 'tibco-timer',
          'name': 'Timer Trigger',
          'title': 'Timer Trigger',
          'settings': [],
          'outputs': [
            {
              'name': 'params',
              'type': 6,
              'value': null
            },
            {
              'name': 'content',
              'type': 4,
              'value': null
            }
          ],
          'endpoint': {
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
                'type': 0,
                'required': true,
                'value': 'number'
              },
              {
                'name': 'increment',
                'type': 3,
                'value': 'true'
              },
              {
                'name': 'reset',
                'type': 3,
                'value': 'false'
              }
            ],
            'outputs': [
              {
                'name': 'value',
                'type': 1
              }
            ]
          },
          'id': 'Mg'
        }
      ],
      'tile': {
        'type': 1,
        'activityType': 'tibco-log',
        'name': 'Logger',
        'version': '0.0.1',
        'title': 'Log Activity',
        'description': 'To log the number',
        'attributes': {
          'inputs': [
            {
              'name': 'message',
              'type': 0,
              'value': 'hello world'
            },
            {
              'name': 'flowInfo',
              'type': 3,
              'value': 'true'
            },
            {
              'name': 'addToFlow',
              'type': 3,
              'value': 'true'
            }
          ],
          'outputs': [
            {
              'name': 'message',
              'type': 0
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
      'id': 'root'
    };
  }

});

