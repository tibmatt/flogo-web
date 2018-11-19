import { FlogoNewAppComponent } from './new-app.component';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ProfilesAPIService } from '../../core/services/restapi/v2/profiles-api.service';
import { MockProfilesAPIService } from '../../core/services/restapi/v2/profiles-api.service.mock';
import { By } from '@angular/platform-browser';
import { FLOGO_PROFILE_TYPE } from '@flogo/core';
import { NoDependenciesFakeLanguageModule } from '@flogo/core/language/testing';
import {ModalControl} from '@flogo/core/modal';
import {OverlayRef} from '@angular/cdk/overlay';

describe('Component: FlogoNewAppComponent', () => {
  let comp: FlogoNewAppComponent;
  let service = null;
  let fixture: ComponentFixture<FlogoNewAppComponent>;
  const overlayRefStub =  jasmine.createSpyObj<OverlayRef>('overlayRef', [
    'dispose'
  ]);
  const modalControl = new ModalControl(overlayRefStub);

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [NoDependenciesFakeLanguageModule],
      providers: [ { provide: ProfilesAPIService, useClass: MockProfilesAPIService },
        { provide: ModalControl, useValue: modalControl}],
      declarations: [FlogoNewAppComponent], // declare the test component
    })
      .compileComponents();
  });

  beforeEach(inject([ProfilesAPIService], (serviceAPI: ProfilesAPIService) => {
    service = serviceAPI;
    fixture = TestBed.createComponent(FlogoNewAppComponent);
    comp = fixture.componentInstance;
  }));

  it('Should emit \'microservice\' when selecting microservice profile', (done) => {
    fixture.detectChanges();
    comp.control.result.subscribe((profileDetails) => {
      expect(profileDetails.profileType).toEqual(FLOGO_PROFILE_TYPE.MICRO_SERVICE);
      done();
    });
    const de = fixture.debugElement.queryAll(By.css('.flogo-profile__section'));
    de[1].nativeElement.click();
  });
});
