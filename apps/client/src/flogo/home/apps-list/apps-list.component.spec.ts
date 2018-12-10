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
import { BsModalComponent } from 'ng2-bs3-modal';
import { FakeRootLanguageModule } from '@flogo-web/client/core/language/testing';
import { NotificationsService } from '@flogo-web/client/core/notifications/notifications.service';
import { NotificationsServiceMock } from '@flogo-web/client/core/notifications/testing';

describe('FlogoAppList component', () => {
  const applications = [
    {
      id: '1',
      name: 'Sample Application 1',
      version: '0.0.1',
      description: 'My App',
      createdAt: '2016-12-16T00:24:26+00:00',
      updatedAt: '2016-12-16T00:24:26+00:00',
    },
    {
      id: '2',
      name: 'Sample Application 2',
      version: '0.0.1',
      description: 'My App',
      createdAt: '2016-12-16T00:24:26+00:00',
      updatedAt: '2016-12-16T00:24:26+00:00',
    },
    {
      id: '3',
      name: 'Sample Application 3',
      version: '0.0.1',
      description: 'My App',
      createdAt: '2016-12-16T00:24:26+00:00',
      updatedAt: '2016-12-16T00:24:26+00:00',
    },
  ];
  let comp: FlogoAppsListComponent;
  let fixture: ComponentFixture<FlogoAppsListComponent>;
  let de: DebugElement;
  let el: HTMLElement;

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
        BsModalComponent,
      ], // declare the test component
      providers: [
        HttpUtilsService,
        { provide: ErrorService, useClass: ErrorService },
        { provide: AppsApiService, useClass: AppsApiServiceMock },
        {
          provide: NotificationsService,
          useValue: new NotificationsServiceMock(),
        },
      ],
    });
    return TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlogoAppsListComponent);
    comp = fixture.componentInstance;
  });

  it('Should render 3 applications', () => {
    comp.applications = applications;
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.qa-app'));
    expect(res.length).toEqual(3);
  });

  it('Should show the application name', () => {
    comp.applications = [
      {
        id: '123',
        name: 'Sample Application',
        version: '0.0.1',
        description: 'My App',
        createdAt: '2016-12-16T00:24:26+00:00',
        updatedAt: '2016-12-16T00:24:26+00:00',
      },
    ];
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(
      By.css('.qa-app-name')
    );
    el = res[0].nativeElement;
    expect(el.innerText.trim()).toEqual('Sample Application');
  });

  it('On selected application, should emit the selected application to the host', done => {
    comp.applications = [
      {
        id: '123',
        name: 'Sample Application',
        version: '0.0.1',
        description: 'My App',
        createdAt: '2016-12-16T00:24:26+00:00',
        updatedAt: '2016-12-16T00:24:26+00:00',
      },
    ];

    fixture.detectChanges();
    de = fixture.debugElement.query(By.css('.qa-app-name'));
    comp.appSelected.subscribe(app => {
      expect(app.name).toEqual('Sample Application');
      done();
    });

    de.nativeElement.click();
    fixture.detectChanges();
  });

  it('On mouse over must show delete icon', done => {
    comp.applications = [
      {
        id: '123',
        name: 'Sample Application',
        version: '0.0.1',
        description: 'My App',
        createdAt: '2016-12-16T00:24:26+00:00',
        updatedAt: '2016-12-16T00:24:26+00:00',
      },
    ];

    fixture.detectChanges();
    de = fixture.debugElement.query(By.css('.qa-app'));

    el = de.nativeElement;
    el.addEventListener('mouseover', () => {
      // fixture.detectChanges();
      const deleteIcon = fixture.debugElement.query(By.css('.qa-app-delete'));
      expect(deleteIcon).not.toBeNull();
      done();
    });

    const event = new Event('mouseover');
    el.dispatchEvent(event);
  });
});
