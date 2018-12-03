import { FlogoAppImportComponent } from './app-import.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { BsModalModule } from 'ng2-bs3-modal';
import { ImportErrorFormatterService } from '../core/import-error-formatter.service';
import { By } from '@angular/platform-browser';
import { mockImportErrorResponse } from './mocks/error.response.mock';
import { NoDependenciesFakeLanguageModule } from '@flogo-web/client/core/language/testing';

@Component({
  selector: 'flogo-container-component',
  template: `
    <div class="flows">
      <flogo-home-app-import [importValidationErrors]="errors" (modalClose)="closeModal()"></flogo-home-app-import>
    </div>
  `,
})
class ContainerComponent {
  errors;

  closeModal() {
    return true;
  }
}

describe('Component: FlogoAppImportComponent', () => {
  let comp: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoDependenciesFakeLanguageModule, BsModalModule],
      declarations: [FlogoAppImportComponent, ContainerComponent], // declare the test component
      providers: [ImportErrorFormatterService],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('Should list 3 errors', done => {
    compileComponent().then(() => {
      fixture = TestBed.createComponent(ContainerComponent);
      comp = fixture.componentInstance;
      comp.errors = mockImportErrorResponse[0].meta.details;
      fixture.detectChanges();
      const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-error__list'));
      expect(res.length).toEqual(3);
      done();
    });
  });

  it('Should list the last error as an activity missing error', done => {
    compileComponent().then(() => {
      fixture = TestBed.createComponent(ContainerComponent);
      comp = fixture.componentInstance;
      comp.errors = mockImportErrorResponse[0].meta.details;
      fixture.detectChanges();
      const res: Array<DebugElement> = fixture.debugElement.queryAll(
        By.css('.flogo-error__list-container .flogo-error__content')
      );
      const el: HTMLElement = res[2].nativeElement;
      expect(el.innerHTML).toEqual('IMPORT-ERROR:ACTIVITY_MISSING_CONTENT');
      done();
    });
  });
});
