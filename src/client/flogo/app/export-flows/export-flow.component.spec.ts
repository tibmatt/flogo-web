import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement } from '@angular/core';
import { BsModalModule } from 'ng2-bs3-modal';
import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { CoreModule as FlogoCoreModule } from '@flogo/core';
import { FakeRootLanguageModule } from '@flogo/core/language/testing';
import {FlowSummary } from '@flogo/core/interfaces/app/flow-summary';
import { AppDetailService } from '@flogo/app/core/apps.service';
import { FlogoExportFlowsComponent } from './export-flows.component';

@Component({
  template: `<flogo-export-flow [flows]="flows" [isLegacyExport]="isLegacyExport"></flogo-export-flow>`
})
class TestHostComponent {
  flows: Array<FlowSummary> = makeMockFlows();
  isLegacyExport = false;
}

class MockAppDetailService {
  flows = makeMockAppDetailResponse();

  exportFlow = jasmine.createSpy('exportFlow').and.callFake((flowIds: string) => Promise.resolve(this.flows));

}

describe('FlogoExportFlowsComponent component', () => {
  let containerComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let checkboxList: DebugElement[];
  let exportButton: DebugElement;
  let selectAllLink: DebugElement;

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [
        FakeRootLanguageModule,
        BsModalModule,
        FlogoCoreModule,
        FlogoSharedModule,
      ],
      declarations: [
        // FlogoAppSettingsComponent,
        FlogoExportFlowsComponent,
        TestHostComponent,
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
    fixture = TestBed.createComponent(TestHostComponent);
    containerComponent = fixture.componentInstance;
    fixture.detectChanges();
    checkboxList = fixture.debugElement.queryAll(By.css('.flogo-export-flow-list-item input'));
    exportButton = fixture.debugElement.query(By.css('.js-btn-export'));
    selectAllLink = fixture.debugElement.query(By.css('.js-btn-select-all'));
  });

  it('When 2 flows provided, it should render 2 flows', () => {
    const flows = fixture.debugElement.queryAll(By.css('.flogo-export-flow-list-item'));
    expect(flows.length).toEqual(3);
  });

  it('Should select all flows on click Select All', () => {
    selectAllLink.nativeElement.click();
    fixture.detectChanges();
    const checkedFlowsCount = checkboxList.filter(checkbox => checkbox.nativeElement.checked).length;
    expect(checkedFlowsCount).toEqual(checkboxList.length, 'Expected all flows selected');
  });

  it('Should unselect all flows on click unselect All', () => {
    const unselectAllLink = fixture.debugElement.query(By.css('#unselectAll'));
    unselectAllLink.nativeElement.click();
    fixture.detectChanges();
    const checkedFlowsCount = checkboxList.filter(checkbox => checkbox.nativeElement.checked).length;
    expect(checkedFlowsCount).toEqual(0, 'Expected no flows selected');
  });

  describe('Legacy export', function () {
    let exportFlowsComponent;
    let appDetailServiceSpy;
    const performExport = () => {
      fixture.detectChanges();
      const exporter = exportFlowsComponent.exportFlows();
      exporter();
      fixture.detectChanges();
    };
    beforeEach(function () {
      selectAllLink.nativeElement.click();
      fixture.detectChanges();
      const exportFlowsComponentDe = fixture.debugElement.query(By.directive(FlogoExportFlowsComponent));
      exportFlowsComponent = <FlogoExportFlowsComponent> exportFlowsComponentDe.componentInstance;
      appDetailServiceSpy = fixture.debugElement.injector.get(AppDetailService);
    });
    it('If in legacy mode it should export legacy format', function() {
      containerComponent.isLegacyExport = true;
      performExport();
      expect(appDetailServiceSpy.exportFlow.calls.mostRecent().args[1]).toBe(true);
    });
    it('If not in legacy mode it should export the standard format', function() {
      containerComponent.isLegacyExport = false;
      performExport();
      expect(appDetailServiceSpy.exportFlow.calls.mostRecent().args[1]).toBe(false);
    });
  });

  it('Should export only the flows that are selected', () => {
    fixture.detectChanges();
    expect(exportButton.nativeElement.disabled).toBeTruthy();
    // all except last one
    checkboxList.slice(0, -1).forEach(checkboxElement => checkboxElement.nativeElement.click());
    fixture.detectChanges();

    expect(exportButton.nativeElement.disabled).toBeFalsy();

    const exportFlowsComponentDe = fixture.debugElement.query(By.directive(FlogoExportFlowsComponent));
    const exportFlowsComponent = <FlogoExportFlowsComponent> exportFlowsComponentDe.componentInstance;
    const exporter = exportFlowsComponent.exportFlows();
    exporter();
    fixture.detectChanges();

    // all original flows except the last one
    const expectedFlowIds = containerComponent.flows.slice(0, -1).map(flow => flow.id);
    const appDetailServiceSpy = fixture.debugElement.injector.get(AppDetailService);
    expect(appDetailServiceSpy.exportFlow.calls.mostRecent().args[0]).toEqual(expectedFlowIds);
  });

  it('Should select all flows onload by default', () => {
    fixture.detectChanges();
    const exportFlowsComponentDe = fixture.debugElement.query(By.directive(FlogoExportFlowsComponent));
    const exportFlowsComponent = <FlogoExportFlowsComponent> exportFlowsComponentDe.componentInstance;
    exportFlowsComponent.openExport();
    fixture.detectChanges();
    const checkedFlowsCount = checkboxList.filter(checkbox => checkbox.nativeElement.checked).length;
    expect(checkedFlowsCount).toBeGreaterThan(0);
    expect(checkedFlowsCount).toEqual(exportFlowsComponent.flows.length, 'Expected all flows selected default');

  });

});

  function makeMockFlows() {
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
      },
      {
        id: '899',
        name: 'Manually adjust humidity',
        description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent ',
        createdAt: new Date()
      }
    ];
  }

 function makeMockAppDetailResponse() {
    return [{
      id: '897',
      name: 'Manually adjust temperature',
      description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent ',
      createdAt: new Date(),
      updatedAt: null
    }, {
      id: '898',
      name: 'Manually adjust temperature',
      description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent ',
      createdAt: new Date(),
      updatedAt: null
    }];
 }


