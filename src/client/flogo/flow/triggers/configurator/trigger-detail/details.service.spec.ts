import {ConfigureDetailsService} from './details.service';
import {SettingsFormBuilder} from './settings-form-builder';
import {CurrentTriggerState} from '../interfaces';
import {ConfigureTriggerSchema, ConfigureTriggersMock} from '../mocks/triggers.mock';
import Spy = jasmine.Spy;

describe('Serive: ConfigureDetailsService', function(this: {
  testService: ConfigureDetailsService,
  settingsFormBuilder: SettingsFormBuilder
}) {
  const MockData: CurrentTriggerState = {
    appId: 'test_app',
    appProperties: [],
    ...ConfigureTriggersMock[0],
    schema: ConfigureTriggerSchema,
    fields: {
      settings: []
    },
    flowMetadata: null
  };

  beforeEach(() => {
    this.settingsFormBuilder = jasmine.createSpyObj<SettingsFormBuilder>('settingsFormBuilder', [
      'build'
    ]);
    const mapperController = jasmine.createSpyObj('mapperControllerFactory', [
      'createController'
    ]);
    const nameAsynValidator = jasmine.createSpyObj('triggerNameValidatorService', [
      'create'
    ]);
    this.testService = new ConfigureDetailsService(this.settingsFormBuilder, mapperController, nameAsynValidator);
  });

  it('Should disable the common settings when the trigger has multiple handlers', () => {
    const spying = <Spy>this.settingsFormBuilder.build;
    spying.and.callFake(function() {
      expect(arguments[2]).toEqual(true);
    });
    this.testService.build(MockData);
    expect(spying).toHaveBeenCalled();
  });
});
