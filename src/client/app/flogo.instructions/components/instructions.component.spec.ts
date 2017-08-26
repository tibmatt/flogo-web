import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Http } from '@angular/http';
import { FlogoInstructionsComponent } from './instructions.component';


describe('Component: FlogoInstructions Modal', () => {

  let comp: FlogoInstructionsComponent;
  let fixture: ComponentFixture<FlogoInstructionsComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  // synchronous beforeEach
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, '/base/dist/public/assets/i18n', '.json'),
        deps: [Http]
      })],
      declarations: [FlogoInstructionsComponent, ModalComponent], // declare the test component
    });  // compile template and css

  });

  it('When load, should select by default the step number 1', done => {
    TestBed.compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlogoInstructionsComponent);
        comp = fixture.componentInstance; // FlogoInstructionsComponent test instance
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('.flogo-instructions-option-selected > span'));

        el = de.nativeElement;
        expect(de.nativeElement.innerHTML).toEqual('1');
        done();
      });
  });


  it('When load, back button must not exist and next button should exist', done => {

    TestBed.compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlogoInstructionsComponent);
        fixture.detectChanges();
        const backButton = fixture.debugElement.query(By.css('#buttonBack'));
        expect(backButton).toBeNull();
        const nextButton = fixture.debugElement.query(By.css('#buttonNext'));
        expect(nextButton).not.toBeNull(nextButton);
        done();
      });
  });

  it('Click on next  should move to step 2', done => {
    TestBed.compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlogoInstructionsComponent);
        const instructions = fixture.componentInstance;
        fixture.detectChanges();

        const buttonNextDebug = fixture.debugElement.query(By.css('#buttonNext'));
        const button = buttonNextDebug.nativeElement;

        button.click();
        fixture.detectChanges();
        const selected = fixture.debugElement.query(By.css('.flogo-instructions-option-selected > span'));
        expect(selected.nativeElement.innerHTML).toEqual('2');

        done();
      });
  });

  it('When last step is selected, close button should exist', done => {
    TestBed.compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlogoInstructionsComponent);
        const instructions = fixture.componentInstance;
        instructions.currentIndex = instructions.steps.length - 1;

        fixture.detectChanges();
        const buttonClose = fixture.debugElement.query(By.css('#buttonClose'));
        expect(buttonClose).not.toBeNull();
        done();
      });
  });

  it('Click on back  should move to step 3', done => {
    TestBed.compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlogoInstructionsComponent);
        const instructions = fixture.componentInstance;
        instructions.currentIndex = instructions.steps.length - 1;
        fixture.detectChanges();

        const buttonBackDebug = fixture.debugElement.query(By.css('#buttonBack'));
        const button = buttonBackDebug.nativeElement;

        button.click();
        fixture.detectChanges();
        const selected = fixture.debugElement.query(By.css('.flogo-instructions-option-selected > span'));
        expect(selected.nativeElement.innerHTML).toEqual('3');
        done();
      });
  });

});
