import { cloneDeep } from 'lodash';
import { ActionBase, Dictionary } from '@flogo-web/client-core';

import {
  ErrorService,
  RESTAPIContributionsService,
} from '@flogo-web/client-core/services';

import { mockTriggerDetails } from '../../ui-model-trigger.mock';
import {
  mockActivitiesDetails,
  mockErrorFlow,
  mockErrorHandler,
  mockFlow,
  mockResultantUIFlow,
  mockResultantUIFlowWithError,
  mockResultantUIFlowWithTransformations,
  mockTransformationData,
} from './ui-model-flow.mock';
import { MicroServiceModelConverter } from './microservice-converter.model';
import Spy = jasmine.Spy;

describe('Service: Microservice converter model', function(this: {
  service: MicroServiceModelConverter;
  errorService: ErrorService;
  contribServiceMock: RESTAPIContributionsService;
  emptySchemaRegistry: Dictionary<ActionBase>;
}) {
  beforeEach(() => {
    this.contribServiceMock = jasmine.createSpyObj<RESTAPIContributionsService>(
      'contribService',
      ['getContributionDetails', 'listContribs']
    );
    this.errorService = new ErrorService();
    this.service = new MicroServiceModelConverter(
      this.contribServiceMock,
      this.errorService
    );
    this.emptySchemaRegistry = {};
  });

  it('Should throw error when Activity does not have a activityRef', () => {
    let thrownError: Error;
    try {
      const spy = <Spy>this.contribServiceMock.listContribs;
      spy.and.returnValue([]);
      this.service.convertToWebFlowModel(mockErrorFlow, this.emptySchemaRegistry);
    } catch (error) {
      thrownError = error;
      expect(error.name).toEqual('Activity: Wrong input json file');
      expect(error.type).toEqual('ValidationError');
    }
    expect(thrownError).toBeDefined();
  });

  it('Should convert the Engine Flow Model to UI Flow model', done => {
    const thisTestData: any = cloneDeep(mockFlow);
    const spyTriggerService = <Spy>this.contribServiceMock.getContributionDetails;
    spyTriggerService.and.returnValue(Promise.resolve(mockTriggerDetails));
    const spyActivityService = <Spy>this.contribServiceMock.listContribs;
    spyActivityService.and.returnValue(Promise.resolve(mockActivitiesDetails));
    this.service
      .convertToWebFlowModel(thisTestData, this.emptySchemaRegistry)
      .then((flow: any) => {
        expect(flow).toEqual(mockResultantUIFlow);
        done();
      });
  });

  it('Should have error handler in UI Flow model', done => {
    const thisTestData: any = cloneDeep(mockFlow);
    const spyTriggerService = <Spy>this.contribServiceMock.getContributionDetails;
    spyTriggerService.and.returnValue(mockTriggerDetails);
    const spyActivityService = <Spy>this.contribServiceMock.listContribs;
    spyActivityService.and.returnValue(Promise.resolve(mockActivitiesDetails));
    thisTestData.errorHandler = mockErrorHandler;
    this.service
      .convertToWebFlowModel(thisTestData, this.emptySchemaRegistry)
      .then((flow: any) => {
        expect(flow).toEqual(mockResultantUIFlowWithError);
        done();
      });
  });

  it('Should maintain the transformation details of a tile', done => {
    const thisTestData: any = cloneDeep(mockFlow);
    const spyTriggerService = <Spy>this.contribServiceMock.getContributionDetails;
    spyTriggerService.and.returnValue(mockTriggerDetails);
    const spyActivityService = <Spy>this.contribServiceMock.listContribs;
    spyActivityService.and.returnValue(Promise.resolve(mockActivitiesDetails));
    thisTestData.tasks[0].attributes = mockTransformationData.attributes;
    thisTestData.tasks[0].inputMappings = mockTransformationData.inputMappings;
    this.service
      .convertToWebFlowModel(thisTestData, this.emptySchemaRegistry)
      .then((flow: any) => {
        expect(flow).toEqual(mockResultantUIFlowWithTransformations);
        done();
      });
  });
});
