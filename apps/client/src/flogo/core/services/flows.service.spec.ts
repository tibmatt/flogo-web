import { FlowsService } from './flows.service';
import { RESTAPIHandlersService } from './restapi/v2/handlers-api.service';
import { APIFlowsService } from './restapi/v2/flows-api.service';
import { TriggersApiService } from './restapi';
import {RESTAPIContributionsService} from '@flogo-web/client/core/services/restapi/v2/contributions.service';
import Spy = jasmine.Spy;

describe('Service: FlowsService', function (this: {
  testService: FlowsService,
  mockHandlersAPIService: RESTAPIHandlersService,
  mockTriggersService: TriggersApiService,
  mockContribTriggerAPIService: RESTAPIContributionsService,
  mockFlowsAPIService: APIFlowsService
}) {
  const mockAppTriggerData = {
    'name': 'Receive HTTP Message',
    'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
    'description': 'Simple REST Trigger',
    'settings': {
      'port': null
    },
    'id': 'receive_http_message',
    'createdAt': '2017-04-04T01:20:50.544Z',
    'updatedAt': null,
    'handlers': [
      {
        'settings': {
          'method': 'GET',
          'path': null,
          'autoIdReply': null,
          'useReplyHandler': null
        },
        'actionId': 'my_new_app'
      },
      {
        'settings': {
          'method': null,
          'path': null,
          'autoIdReply': null,
          'useReplyHandler': null
        },
        'actionId': 'app_with_trigger'
      }
    ],
    'appId': 'some_app_id_1'
  };
  let spyDelete;
  let spyDeleteTrigger;
  beforeAll(() => {
    this.mockContribTriggerAPIService = jasmine.createSpyObj<RESTAPIContributionsService>('contribTriggersService', [
      'getContributionDetails'
    ]);
    this.mockFlowsAPIService = jasmine.createSpyObj<APIFlowsService>('flowsAPIService', [
      'deleteFlow'
    ]);
    this.mockTriggersService = jasmine.createSpyObj('triggersService', [
      'getTrigger',
      'deleteTrigger'
    ]);
    this.mockHandlersAPIService = jasmine.createSpyObj<RESTAPIHandlersService>('handlersAPIService', [
      'updateHandler'
    ]);
    this.testService = new FlowsService(this.mockHandlersAPIService, this.mockFlowsAPIService,
      this.mockTriggersService, this.mockContribTriggerAPIService);
    spyDelete = <Spy> this.mockFlowsAPIService.deleteFlow;
    spyDelete.and.returnValue(Promise.resolve({}));
    spyDeleteTrigger = <Spy> this.mockTriggersService.deleteTrigger;
    spyDeleteTrigger.and.returnValue(Promise.resolve({}));
  });

  it('Should delete only the flow but not the Trigger', (done) => {
    const specTriggerData = _.assign({}, mockAppTriggerData);
    specTriggerData.handlers.pop();
    const spyGetTrigger = <Spy> this.mockTriggersService.getTrigger;
    spyGetTrigger.and.returnValue(Promise.resolve(specTriggerData));
    this.testService.deleteFlowWithTrigger('some_flow_id_1', 'some_trigger_id_1')
      .then((data) => {
        expect(_.isEqual(data, {})).toEqual(true);
        done();
      });
  });

  it('Should delete and also the Trigger', (done) => {
    const specTriggerData = _.assign({}, mockAppTriggerData);
    specTriggerData.handlers.pop();
    specTriggerData.handlers.pop();
    const spyGetTrigger = <Spy> this.mockTriggersService.getTrigger;
    spyGetTrigger.and.returnValue(Promise.resolve(specTriggerData));
    this.testService.deleteFlowWithTrigger('some_flow_id_2', 'some_trigger_id_2')
      .then((data) => {
        expect(_.isEqual(data, {})).toEqual(true);
        expect(spyDeleteTrigger).toHaveBeenCalledTimes(1);
        done();
      });
  });
});
