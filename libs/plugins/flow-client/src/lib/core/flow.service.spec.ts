import { FlogoFlowService } from './flow.service';
import { HttpUtilsService, FlowsService } from '@flogo-web/client-core';
import { MockAPIFlowsService } from '@flogo-web/client-core/services/restapi/v2/flows-api.service.mock';
import { resultantFlowModelForCanvas } from './flow-for-canvas.mock';
import { MicroServiceModelConverter } from './models/profiles/microservice-converter.model';
import Spy = jasmine.Spy;

describe('Service: Flow', function(this: {
  service: FlogoFlowService;
  modelConverter: MicroServiceModelConverter;
  commonFlowsService: FlowsService;
  mockRESTAPI: MockAPIFlowsService;

  utilsService: HttpUtilsService;
}) {
  beforeEach(() => {
    this.modelConverter = jasmine.createSpyObj<MicroServiceModelConverter>(
      'converterService',
      ['convertToWebFlowModel']
    );
    this.commonFlowsService = jasmine.createSpyObj<FlowsService>('commonFlowsService', [
      'deleteFlowWithTrigger',
    ]);
    this.mockRESTAPI = new MockAPIFlowsService();
    const storeMock = {
      dispatch() {},
    };
    this.service = new FlogoFlowService(
      <any>this.mockRESTAPI,
      this.modelConverter,
      this.commonFlowsService,
      <any>storeMock
    );
  });

  it('Should get the Flow Details and convert it to work with flow component', done => {
    const spyConverterService = <Spy>this.modelConverter.convertToWebFlowModel;
    spyConverterService.and.returnValue(Promise.resolve({ name: 'generated flow' }));
    this.service.loadFlow('dummy').then(response => {
      expect(response).toEqual({
        flow: <any>{ name: 'generated flow' },
        triggers: resultantFlowModelForCanvas.triggers,
      });
      done();
    });
  });
});
