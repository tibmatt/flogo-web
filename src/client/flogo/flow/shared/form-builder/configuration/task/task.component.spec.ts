import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplaySubject } from 'rxjs';

import { FlogoFormBuilderConfigurationTaskComponent } from './task.component';
import {FormBuilderModule} from '@flogo/flow/shared/form-builder';
import {FlogoConfigurationCommonService} from '../shared/configuration-common.service';
import { FakeRootLanguageModule } from '@flogo/core/language/testing';

describe('Form-builder component', () => {
  let comp: FlogoFormBuilderConfigurationTaskComponent;
  let fixture: ComponentFixture<FlogoFormBuilderConfigurationTaskComponent>;

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FakeRootLanguageModule,
        FormBuilderModule,
      ],
      declarations: [],
      providers: [FlogoConfigurationCommonService]
    });
  });

  it('Should map the result of the previous task', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoFormBuilderConfigurationTaskComponent);
        comp = fixture.componentInstance;
        comp._attributes = getMockAttributes();
        comp._task = getMockTask();
        comp._fieldObserver = new ReplaySubject(2);
        comp.refreshInputs();

        const messageInput = comp.fields.inputs.find((field) => field.name === 'message');
        const control = comp.getTaskInfo(messageInput, 'input', 'input');
        expect(control.value).toEqual(5);
        done();

        function getMockAttributes() {
          return {
            inputs: [{
              name: 'message', type: 0, value: null,
              mappings: [{ type: 1, mapTo: 'message', value: '${activity.2.value}' }],
              step: {
                flow: {
                  attributes: [
                    { name: '_A.2.value', type: 'integer', value: 5 },
                    { name: '_A.3.message', type: 'string', value: '' }],
                  state: 0, status: 500
                }, id: '3', taskId: 3, tasks: null
              }
            },
              {
                name: 'flowInfo',
                type: 3,
                value: 'true',
                mappings: [{ type: 1, mapTo: 'message', value: '${activity.2.value}' }],
                step: {
                  flow: {
                    attributes: [
                      { name: '_A.2.value', type: 'integer', value: 5 },
                      { name: '_A.3.message', type: 'string', value: '' }],
                    state: 0, status: 500
                  }, id: '3', taskId: 3, tasks: null
                }
              },
              {
                name: 'addToFlow',
                type: 3,
                value: true,
                mappings: [{ type: 1, mapTo: 'message', value: '${activity.2.value}' }],
                step: {
                  flow: {
                    attributes: [{ name: '_A.2.value', type: 'integer', value: 5 }, {
                      name: '_A.3.message',
                      type: 'string',
                      value: ''
                    }], state: 0, status: 500
                  }, id: '3', taskId: 3, tasks: null
                }
              }],
            outputs: [{
              name: 'message',
              type: 0,
              step: {
                flow: {
                  attributes: [
                    { name: '_A.2.value', type: 'integer', value: 5 },
                    { name: '_A.3.message', type: 'string', value: '' }
                  ], state: 0, status: 500
                }, id: '3', taskId: 3, tasks: null
              }
            }]
          };
        }

        function getMockTask() {
          return {
            type: 1,
            activityType: 'tibco-log',
            name: 'Logger',
            version: '0.0.1',
            title: 'Log Activity',
            description: 'To log the number',
            homepage: '',
            attributes: {
              inputs: [{
                name: 'message',
                type: 0,
                value: null,
                mappings: [{ type: 1, mapTo: 'message', value: '${activity.2.value}' }],
                step: {
                  flow: {
                    attributes: [
                      { name: '_A.2.value', type: 'integer', value: '5' },
                      { name: '_A.3.message', type: 'string', value: '' }
                    ],
                    state: 0, status: 500
                  }, id: '3', taskId: 3, tasks: null
                }
              }, {
                name: 'flowInfo',
                type: 3,
                value: 'true',
                mappings: [{ type: 1, mapTo: 'message', value: '${activity.2.value}' }],
                step: {
                  flow: {
                    attributes: [
                      { name: '_A.2.value', type: 'integer', value: 5 },
                      { name: '_A.3.message', type: 'string', value: '' }
                    ], state: 0, status: 500
                  }, id: '3', taskId: 3, tasks: null
                }
              }, {
                name: 'addToFlow',
                type: 3,
                value: 'true',
                mappings: [{ type: 1, mapTo: 'message', value: '${activity.2.value}' }],
                step: {
                  flow: {
                    attributes: [{ name: '_A.2.value', type: 'integer', value: 5 }, {
                      name: '_A.3.message',
                      type: 'string',
                      value: ''
                    }], state: 0, status: 500
                  }, id: '3', taskId: 3, tasks: null
                }
              }],
              outputs: [{
                name: 'message',
                type: 0,
                step: {
                  flow: {
                    attributes: [
                      { name: '_A.2.value', type: 'integer', value: 5 },
                      { name: '_A.3.message', type: 'string', value: '' }],
                    state: 0, status: 500
                  }, id: '3', taskId: 3, tasks: null
                }
              }]
            },
            author: 'Anonymous',
            where: '',
            installed: true,
            id: 'Mw',
            inputMappings: [{ type: 1, mapTo: 'message', value: '${activity.2.value}' }]
          };
        }

      });
  });

});
