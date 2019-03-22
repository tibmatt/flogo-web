import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  TriggersApiService,
  RESTAPIContributionsService,
  HttpUtilsService,
  FlogoProfileService,
} from '@flogo-web/client/core/services';
import { FakeRootLanguageModule } from '@flogo-web/client/core/language/testing';
import { TriggersApiServiceMock } from '@flogo-web/client/core/services/restapi/v2/triggers-api.service.mock';
import { FlogoProfileServiceMock } from '@flogo-web/client/core/services/profile.service.mock';

import { TriggersModule } from '../triggers.module';
import { FlogoSelectTriggerComponent } from './select-trigger.component';

describe('FlogoSelectTrigger component', () => {
  let comp: FlogoSelectTriggerComponent;
  let fixture: ComponentFixture<FlogoSelectTriggerComponent>;

  const existingMock = [
    {
      ref: 'some_path_to_repo/trigger/coap',
      name: 'Simple COAP Trigger',
      description: 'Description of Simple COAP Trigger',
      id: 1,
    },
    {
      ref: 'some_path_to_repo/trigger/mqtt',
      name: 'Receive MQTT Message',
      description: 'MQTT Message description',
      id: 2,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FakeRootLanguageModule, TriggersModule],
      providers: [
        { provide: FlogoProfileService, useClass: FlogoProfileServiceMock },
        { provide: TriggersApiService, useClass: TriggersApiServiceMock },
        { provide: RESTAPIContributionsService },
        HttpUtilsService,
      ],
    });
    return TestBed.compileComponents();
  });

  it('Should display 4 installed triggers', done => {
    fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
    comp = fixture.componentInstance;
    comp.appDetails = { appId: 'foo' };
    fixture.detectChanges();
    comp.loadInstalledTriggers().then(() => {
      fixture.detectChanges();
      const res: Array<DebugElement> = fixture.debugElement.queryAll(
        By.css('.trigger__content')
      );
      expect(res.length).toEqual(4);
      done();
    });
  });

  it('Should display 2 existing triggers', done => {
    fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
    comp = fixture.componentInstance;
    const existing = function() {
      return Promise.resolve(existingMock);
    };
    comp.getExistingTriggers = existing;
    comp.loadInstalledTriggers().then(() => {
      fixture.detectChanges();
      const res: Array<DebugElement> = fixture.debugElement.queryAll(
        By.css('.arrow-div li')
      );
      expect(res.length).toEqual(2);
      done();
    });
  });

  it('Should select an installed trigger', done => {
    fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
    comp = fixture.componentInstance;
    const existing = function() {
      return Promise.resolve([]);
    };
    comp.addTriggerToAction.subscribe(data => {
      expect(data.triggerData.description).toEqual('Simple CoAP Trigger');
      done();
    });
    comp.getExistingTriggers = existing;
    comp.loadInstalledTriggers().then(() => {
      fixture.detectChanges();
      const res: Array<DebugElement> = fixture.debugElement.queryAll(
        By.css('.trigger__content')
      );
      res[0].nativeElement.click(res[0]);
    });
  });

  it('Should select an existing trigger', done => {
    fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
    comp = fixture.componentInstance;
    const existing = function() {
      return Promise.resolve(existingMock);
    };
    comp.addTriggerToAction.subscribe(data => {
      expect(data.triggerData.description).toEqual('Description of Simple COAP Trigger');
      done();
    });
    comp.getExistingTriggers = existing;
    comp.loadInstalledTriggers().then(() => {
      fixture.detectChanges();
      const res: Array<DebugElement> = fixture.debugElement.queryAll(
        By.css('.arrow-div li')
      );
      res[0].nativeElement.click(res[0]);
    });
  });
});
