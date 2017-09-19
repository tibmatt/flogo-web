import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import {BaseRequestOptions, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FlowsModule as FlogoFlowsModule } from '../../flogo.flows/flogo.flows.module';
import { CommonModule as FlogoCommonModule } from '../../../common/common.module';
import { CoreModule as FlogoCoreModule } from '../../../common/core.module';
import {IFlogoApplicationFlowModel } from '../../../common/application.model';
import { AppDetailService } from '../../flogo.apps/services/apps.service';
import { AppsApiService } from '../../../common/services/restapi/v2/apps-api.service';
import { ErrorService } from '../../../common/services/error.service';
import { FlogoAppSettingsComponent } from '../../flogo.apps.settings/components/settings.component';
import {MockBackend} from '@angular/http/testing';
import {HttpUtilsService} from '../../../common/services/restapi/http-utils.service';


@Component({
  selector: 'flogo-export-flow-modal',
  template: `
            <flogo-export-flow [flows]="flows"></flogo-export-flow>
            `
})
class ContainerComponent {
  flows: Array<IFlogoApplicationFlowModel> = makeMockAppDetail();
}

class MockAppDetailService extends AppDetailService {

  public exportFlow(flowIds: string) {
    return makeMockAppDetailResponse(flowIds);
  }

}

describe('FlogoExportFlowsComponent component', () => {
  const flow = null;
  let comp: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;
  const checkboxList = fixture.debugElement.queryAll(By.css('.flogo-export-flow-list input'));
  const exportButton = fixture.debugElement.query(By.css('#exportFlows'));
  const selectAllLink = fixture.debugElement.query(By.css('#selectAll'));

  function createComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [
        Ng2Bs3ModalModule,
        TranslateModule.forRoot({
          provide: TranslateLoader,
          useFactory: (http: Http) => new TranslateStaticLoader(http, '/base/dist/public/assets/i18n', '.json'),
          deps: [Http],
        }),
        Ng2Bs3ModalModule,
        FlogoCoreModule,
        FlogoCommonModule,
        FlogoFlowsModule,
      ],
      declarations: [
        FlogoAppSettingsComponent,
        ContainerComponent
      ], // declare the test component
      providers: [
        { provide: AppDetailService, useClass: MockAppDetailService }
      ],
      //  schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents()
      .then(() => done());

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerComponent);
    comp = fixture.componentInstance;
    this.httpOption = new Http(new MockBackend(), new BaseRequestOptions());
    this.appsApi = new AppsApiService(this.httpOption, new HttpUtilsService(), new ErrorService());
    this.mockAppDetailService = new MockAppDetailService(this.appsApi, new ErrorService());
    spyOn(this.mockAppDetailService, 'exportFlow');
    fixture.detectChanges();
  });
  it('When 2 flows provided, it should render 2 flows', () => {
    const flows = fixture.debugElement.queryAll(By.css('.flogo-export-flow-list'));
    expect(flows.length).toEqual(2);
  });
  it('Should select all flows on click Select All', () => {
    selectAllLink.nativeElement.click();
    fixture.detectChanges();
    checkboxList.forEach((checkbox) => {
    expect(checkbox.nativeElement.checked).toBeTruthy();
    });
  });
  it('Should unselect all flows on click unselect All', () => {
    const unselectAllLink = fixture.debugElement.query(By.css('#unselectAll'));
    unselectAllLink.nativeElement.click();
    fixture.detectChanges();
    checkboxList.forEach((checkbox) => {
      expect(checkbox.nativeElement.checked).toBeFalsy();
    });
  });
  it('Should export all flows selected on click of Export', () => {
    const flowIds = [];
    expect(exportButton.nativeElement.disabled).toBeTruthy();
    selectAllLink.nativeElement.click();
     this.flows.forEach((flowSelected)  => {
       flowIds.push(flowSelected.id);
    });
    fixture.detectChanges();
    expect(exportButton.nativeElement.disabled).toBeFalsy();
    exportButton.nativeElement.click();
    fixture.detectChanges();
    expect(this.mockAppDetailService.exportFlow()).toHaveBeenCalledWith(flowIds.toString());

  });
});

  function makeMockAppDetail() {
    return [
      {
        id: '897',
        name: 'Manually adjust temperature',
        description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent ',
        createdAt: new Date()
      }, {
        id: '898',
        name: 'Manually adjust humidity',
        description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent ',
        createdAt: new Date()
      }
    ];
}

 function makeMockAppDetailResponse(flowIds: string) {
  const mockFlowDetails = [{
    id: '897',
    name: 'Manually adjust temperature',
    description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent ',
    createdAt: new Date(),
    updatedAt: null
  }, {
    id: '897',
    name: 'Manually adjust temperature',
    description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent ',
    createdAt: new Date(),
    updatedAt: null
  }];
   return Promise.resolve(this.mockFlowDetails);

 }


