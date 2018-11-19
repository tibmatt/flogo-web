import {FlogoAppImportComponent} from './app-import.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {ImportErrorFormatterService} from '../core/import-error-formatter.service';
import {By} from '@angular/platform-browser';
import {mockImportErrorResponse} from './mocks/error.response.mock';
import {NoDependenciesFakeLanguageModule} from '@flogo/core/language/testing';
import {MODAL_TOKEN, ModalControl} from '@flogo/core/modal';
import {ValidationDetail} from '@flogo/core';
import {OverlayRef} from '@angular/cdk/overlay';

const newAppImportDataStub: ValidationDetail = {
  keyword: 'abc',
  dataPath: '/abc',
  schemaPath: 'schema/abc',
  message: 'hello world',
};

export class ErrorFormatterStub {
  getErrorsDetails() {
    return newAppImportDataStub;
  }
}

describe('Component: FlogoAppImportComponent', () => {
  let comp: FlogoAppImportComponent;
  let fixture: ComponentFixture<FlogoAppImportComponent>;
  const overlayRefStub = jasmine.createSpyObj<OverlayRef>('overlayRef', [
    'dispose'
  ]);
  const modalControl = new ModalControl(overlayRefStub);

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoDependenciesFakeLanguageModule],
      declarations: [FlogoAppImportComponent], // declare the test component
      providers: [
        {provide: ImportErrorFormatterService, useClass: ErrorFormatterStub},
        {provide: ModalControl, useValue: modalControl},
        {provide: MODAL_TOKEN, useValue: newAppImportDataStub}],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(FlogoAppImportComponent);
    comp = fixture.componentInstance;
  });
  it('Should list 3 errors', (done) => {
    fixture.detectChanges();
    comp.errorDetails = mockImportErrorResponse[0].meta.details;
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-error__list'));
    expect(res.length).toEqual(3);
    done();
  });

  it('Should list the last error as an activity missing error', (done) => {
    fixture.detectChanges();
    comp.errorDetails = mockImportErrorResponse[0].meta.details;
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-error__list-container .flogo-error__content'));
    const el: HTMLElement = res[2].nativeElement;
    expect(el.innerHTML).toEqual('IMPORT-ERROR:ACTIVITY_MISSING_CONTENT');
    done();
  });
});
