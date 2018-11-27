import { FlogoNewAppComponent } from './new-app.component';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { BsModalModule } from 'ng2-bs3-modal';
import { ProfilesAPIService } from '../../core/services/restapi/v2/profiles-api.service';
import { MockProfilesAPIService } from '../../core/services/restapi/v2/profiles-api.service.mock';
import { By } from '@angular/platform-browser';
import { FLOGO_PROFILE_TYPE } from '../../core/constants';
import { NoDependenciesFakeLanguageModule } from '@flogo-web/client/core/language/testing';

describe('Component: FlogoNewAppComponent', () => {
  let comp: FlogoNewAppComponent;
  let service = null;
  let fixture: ComponentFixture<FlogoNewAppComponent>;

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [NoDependenciesFakeLanguageModule, BsModalModule],
      providers: [{ provide: ProfilesAPIService, useClass: MockProfilesAPIService }],
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
    comp.newAppModal.open();
    fixture.detectChanges();
    comp.add.subscribe((profileDetails) => {
      expect(profileDetails.profileType).toEqual(FLOGO_PROFILE_TYPE.MICRO_SERVICE);
      done();
    });
    const de = fixture.debugElement.queryAll(By.css('.flogo-profile__section'));
    de[1].nativeElement.click();
  });

  it('Should show 3 devices in the list when device is selected', (done) => {
    comp.newAppModal.open();
    comp.showList = true;
    service.getProfilesList().then((res) => {
      comp.devicesList = res;
      fixture.detectChanges();
      const de = fixture.debugElement.queryAll(By.css('.flogo-profile__list-element'));
      expect(de.length).toEqual(3);
      done();
    });
  });

  it('Should emit \'Atmel AVR\' when selecting Atmel AVR device profile', (done) => {
    comp.newAppModal.open();
    comp.add.subscribe((profileDetails) => {
      expect(profileDetails.deviceType).toEqual('Atmel AVR');
      done();
    });
    comp.showList = true;
    service.getProfilesList().then((res) => {
      comp.devicesList = res;
      fixture.detectChanges();
      const de = fixture.debugElement.queryAll(By.css('.flogo-profile__list-element'));
      de[0].nativeElement.click();
    });
  });
});
