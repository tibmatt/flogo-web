import {ConfiguratorComponent} from './configurator.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {ConfiguratorModule} from './configurator.module';
import {TriggersMock} from './mocks/triggers.mock';
import {By} from '@angular/platform-browser';
import {FakeRootLanguageModule} from '@flogo/core/language/testing';
import {ConfiguratorStatus} from './interfaces';

describe('ConfiguratorComponent component', () => {
  let component: ConfiguratorComponent;
  let fixture: ComponentFixture<ConfiguratorComponent>;
  let de: DebugElement;
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
        FakeRootLanguageModule
      ]
    });
    fixture = TestBed.createComponent(ConfiguratorComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
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
});
