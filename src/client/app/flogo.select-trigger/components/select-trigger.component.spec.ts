import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { TranslateModule } from 'ng2-translate/ng2-translate';
import { FlogoSelectTriggerComponent } from './select-trigger.component';
import { RESTAPIActivitiesService } from '../../../common/services/restapi/activities-api.service';
import { RESTAPITriggersService } from '../../../common/services/restapi/triggers-api.service';
import { RESTAPITriggersService as RESTAPITriggersServiceV2 } from '../../../common/services/restapi/v2/triggers-api.service';
import { RESTAPIContributionsService } from '../../../common/services/restapi/v2/contributions.service';
import { RESTAPITriggersServiceMock } from '../../../common/services/restapi/triggers-api.service.mock';
import { RESTAPITriggersServiceMock as RESTAPITriggersServiceMockV2 } from '../../../common/services/restapi/v2/triggers-api.service.mock';
import { InstallerModule } from '../../flogo.installer/flogo.installer.module';
import { PostService } from '../../../common/services/post.service';
import { HttpUtilsService } from '../../../common/services/restapi/http-utils.service';
import { FlogoProfileService } from '../../../common/services/profile.service';
import { FlogoProfileServiceMock } from '../../../common/services/profile.service.mock';
import { FLOGO_PROFILE_TYPE } from '../../../common/constants';
import {ModalComponent, Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';

const postServiceStub = {

  subscribe(options: any) {
    this.subscribeData = options;
  },

  publish(envelope: any) {
    this.published = envelope;
  },

  unsubscribe(sub: any) {
  }

};

describe('FlogoSelectTrigger component', () => {
  let comp: FlogoSelectTriggerComponent;
  let fixture: ComponentFixture<FlogoSelectTriggerComponent>;

  const existingMock = [
    {
      ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/coap',
      name: 'Simple COAP Trigger',
      description: 'Description of Simple COAP Trigger',
      id: 1
    },
    {
      ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/mqtt',
      name: 'Receive MQTT Message',
      description: 'MQTT Message description',
      id: 2
    }
  ];

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule,
        InstallerModule,
        Ng2Bs3ModalModule],
      declarations: [FlogoSelectTriggerComponent], // declare the test component
      providers: [
        RESTAPIActivitiesService,
        { provide: PostService, useValue: postServiceStub },
        { provide: FlogoProfileService, useClass: FlogoProfileServiceMock },
        { provide: RESTAPITriggersService, useClass: RESTAPITriggersServiceMock },
        { provide: RESTAPITriggersServiceV2, useClass: RESTAPITriggersServiceMockV2 },
        { provide: RESTAPIContributionsService },
        HttpUtilsService
      ]
    });
  });

  it('Should display 4 installed triggers', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
        comp = fixture.componentInstance;
        comp.appDetails = {
          appProfileType: FLOGO_PROFILE_TYPE.MICRO_SERVICE
        };
        comp.loadInstalledTriggers()
          .then(() => {
            fixture.detectChanges();
            const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.trigger__content'));
            expect(res.length).toEqual(4);
            done();
          });
      });
  });


  it('Should display 2 existing triggers', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
        comp = fixture.componentInstance;
        comp.appDetails = {
          appProfileType: FLOGO_PROFILE_TYPE.MICRO_SERVICE
        };
        const existing = function () {
          return Promise.resolve(existingMock);
        };
        comp.getExistingTriggers = existing;
        comp.loadInstalledTriggers()
          .then(() => {
            fixture.detectChanges();
            const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.arrow-div li'));
            expect(res.length).toEqual(2);
            done();
          });
      });
  });

  it('Should select an installed trigger', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
        comp = fixture.componentInstance;
        comp.appDetails = {
          appProfileType: FLOGO_PROFILE_TYPE.MICRO_SERVICE
        };
        const existing = function () {
          return Promise.resolve([]);
        };
        comp.onAddTriggerToAction.subscribe(data => {
          expect(data.triggerData.description).toEqual('Simple CoAP Trigger');
          done();
        });
        comp.getExistingTriggers = existing;
        comp.loadInstalledTriggers()
          .then(() => {
            fixture.detectChanges();
            const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.trigger__content'));
            res[0].nativeElement.click(res[0]);
          });
      });
  });

  it('Should select an existing trigger', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
        comp = fixture.componentInstance;
        comp.appDetails = {
          appProfileType: FLOGO_PROFILE_TYPE.MICRO_SERVICE
        };
        const existing = function () {
          return Promise.resolve(existingMock);
        };
        comp.onAddTriggerToAction.subscribe(data => {
          expect(data.triggerData.description).toEqual('Description of Simple COAP Trigger');
          done();
        });
        comp.getExistingTriggers = existing;
        comp.loadInstalledTriggers()
          .then(() => {
            fixture.detectChanges();
            const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.arrow-div li'));
            res[0].nativeElement.click(res[0]);
          });
      });
  });

});
