import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FlogoAppsListComponent } from './apps-list.component';
import { ErrorService } from '../../core/services/error.service';
import { AppsApiService } from '../../core/services/restapi/v2/apps-api.service';
import { AppsApiServiceMock } from '../../core/services/restapi/v2/apps-api.service.mock';
import { TimeFromNowPipe } from '../../shared/pipes/time-from-now.pipe';
import { HttpUtilsService } from '../../core/services/restapi/http-utils.service';
import { FlogoDeletePopupComponent } from '../../shared/components/delete.popup.component';
import { FlogoAppImportComponent } from '../app-import/app-import.component';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FlogoNewAppComponent } from '../new-app/new-app.component';
import { FakeRootLanguageModule } from '@flogo/core/language/testing';
import { ProfilesAPIService } from '@flogo/core/services/restapi/v2/profiles-api.service';
import { MockProfilesAPIService } from '@flogo/core/services/restapi/v2/profiles-api.service.mock';

describe('FlogoAppList component', () => {
  const applications = [
      {
        id: '1',
        name: 'Sample Application 1',
        version: '0.0.1',
        description: 'My App',
        createdAt: '2016-12-16T00:24:26+00:00',
        updatedAt: '2016-12-16T00:24:26+00:00'
      },
      {
        id: '2',
        name: 'Sample Application 2',
        version: '0.0.1',
        description: 'My App',
        createdAt: '2016-12-16T00:24:26+00:00',
        updatedAt: '2016-12-16T00:24:26+00:00'
      },
      {
        id: '3',
        name: 'Sample Application 3',
        version: '0.0.1',
        description: 'My App',
        createdAt: '2016-12-16T00:24:26+00:00',
        updatedAt: '2016-12-16T00:24:26+00:00'
      }

    ];
  let comp: FlogoAppsListComponent;
  let fixture: ComponentFixture<FlogoAppsListComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        // // TODO:  HttpModule shouldn't be required
        // HttpModule,
        // NoDependenciesFakeLanguageModule,
        FakeRootLanguageModule,
      ],
      declarations: [
        FlogoAppsListComponent,
        FlogoDeletePopupComponent,
        TimeFromNowPipe,
        FlogoAppImportComponent,
        ModalComponent,
        FlogoNewAppComponent
      ], // declare the test component
      providers: [
        HttpUtilsService,
        { provide: ProfilesAPIService, useClass: MockProfilesAPIService },
        { provide: ErrorService, useClass: ErrorService },
        { provide: AppsApiService, useClass: AppsApiServiceMock }
      ]
    });
  });

  it('Should render 3 applications', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoAppsListComponent);
        comp = fixture.componentInstance;
        comp.applications = applications;

        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.apps-list__element'));
        expect(res.length).toEqual(3);
        done();
      });
  });

  it('Should show the application name', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoAppsListComponent);
        comp = fixture.componentInstance;
        comp.applications = [
          {
            id: '123',
            name: 'Sample Application',
            version: '0.0.1',
            description: 'My App',
            createdAt: '2016-12-16T00:24:26+00:00',
            updatedAt: '2016-12-16T00:24:26+00:00'
          }
        ];

        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.app-list__app-name'));
        el = res[0].nativeElement;
        expect(el.innerText.trim()).toEqual('Sample Application');
        done();
      });
  });

  // xit('On add application, should emit the added application to the host', (done) => {
  //   compileComponent()
  //     .then(() => {
  //       fixture = TestBed.createComponent(FlogoAppsListComponent);
  //       comp = fixture.componentInstance;
  //       comp.applications = null;
  //       comp.apiApplications.add = () => {
  //         return Promise.resolve({'name': 'Untitled App'});
  //       };
  //       comp.onAddedApp.subscribe((app) => {
  //         expect(app.name).toEqual('Untitled App');
  //         done();
  //       });
  //       comp.onAdd(null);
  //     });
  // });

  it('On selected application, should emit the selected application to the host', done => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoAppsListComponent);
        comp = fixture.componentInstance;
        comp.applications = [
          {
            id: '123',
            name: 'Sample Application',
            version: '0.0.1',
            description: 'My App',
            createdAt: '2016-12-16T00:24:26+00:00',
            updatedAt: '2016-12-16T00:24:26+00:00'
          }
        ];

        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('.app-list__app-name'));
        comp.onSelectedApp.subscribe((app) => {
          expect(app.name).toEqual('Sample Application');
          done();
        });

        de.nativeElement.click();
        fixture.detectChanges();
      });
  });

  it('On mouse over must show delete icon', done => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoAppsListComponent);
        comp = fixture.componentInstance;
        comp.applications = [
          {
            id: '123',
            name: 'Sample Application',
            version: '0.0.1',
            description: 'My App',
            createdAt: '2016-12-16T00:24:26+00:00',
            updatedAt: '2016-12-16T00:24:26+00:00'
          }
        ];

        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('.apps-list__element'));

        el = de.nativeElement;
        el.addEventListener('mouseover', () => {
          // fixture.detectChanges();
          const deleteIcon = fixture.debugElement.query(By.css('.apps-list__delete-btn .flogo-icon-delete'));
          expect(deleteIcon).not.toBeNull();
          done();
        });

        const event = new Event('mouseover');
        el.dispatchEvent(event);
      });
  });

  /*xit('On delete application, should deleted the application from the list', done => {
   compileComponent()
   .then(() => {
   fixture = TestBed.createComponent(FlogoAppsListComponent);
   comp = fixture.componentInstance;
   comp.applications = applications;

   fixture.detectChanges();
   let res = fixture.debugElement.queryAll(By.css('.apps-list__element'));

   el = res[2].nativeElement;

   el.addEventListener('mouseover', () => {
   //fixture.detectChanges();
   let deleteIcon = fixture.debugElement.query(By.css('.flogo-icon-delete'));
   let element = deleteIcon.nativeElement;
   element.click();
   fixture.detectChanges();
   let confirmDelete = fixture.debugElement.query(By.css('.popup-btn-primary'));
   element = confirmDelete.nativeElement;
   element.click();
   fixture.detectChanges();
   expect(comp.applications.length).toEqual(0);
   });

   let event = new Event('mouseover');
   el.dispatchEvent(event);
   });
   });*/
});