import { FlogoAppImportErrorComponent } from './import.error.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from 'ng2-translate/ng2-translate';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { ImportErrorFormatterService } from '../services/message.formatter.service';
import { By } from '@angular/platform-browser';
import { mockImportErrorResponse } from '../mocks/error.response.mock';

@Component({
  selector: 'flogo-container-component',
  template: `
    <div class="flows">
      <flogo-import-error [importValidationErrors]="errors" (modalClose)="closeModal()"></flogo-import-error>
    </div>
  `
})
class ContainerComponent {
  errors;

  closeModal() {
    return true;
  }
}

describe('Component: FlogoAppImportErrorComponent', () => {
  let comp: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [FlogoAppImportErrorComponent, ModalComponent, ContainerComponent], // declare the test component
      providers: [ImportErrorFormatterService],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('Should list 3 errors', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        comp = fixture.componentInstance;
        comp.errors = mockImportErrorResponse;
        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-error__list'));
        expect(res.length).toEqual(3);
        done();
      });
  });

  it('Should list the last error as an activity missing error', (done) => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        comp = fixture.componentInstance;
        comp.errors = mockImportErrorResponse;
        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-error__list-container .flogo-error__content'));
        const el: HTMLElement = res[2].nativeElement;
        expect(el.innerHTML).toEqual('IMPORT-ERROR:ACTIVITY_MISSING_CONTENT');
        done();
      });
  });
});
