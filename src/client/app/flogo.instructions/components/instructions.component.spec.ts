import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement }    from '@angular/core';
import { TranslateModule, TranslateService, TranslateLoader, TranslateStaticLoader, TranslatePipe } from 'ng2-translate/ng2-translate';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Http } from '@angular/http'

import { FlogoInstructionsComponent } from './instructions.component';


describe('Component: FlogoInstructions Modal', ()=> {

  let comp:    FlogoInstructionsComponent;
  let fixture: ComponentFixture<FlogoInstructionsComponent>;
  let de:      DebugElement;
  let el:      HTMLElement;

  // synchronous beforeEach
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, '/base/dist/public/assets/i18n', '.json'),
        deps: [Http]
      })],
      declarations: [ FlogoInstructionsComponent, ModalComponent ], // declare the test component
    });  // compile template and css

      /*
    TestBed.configureTestingModule({
        declarations: [ FlogoInstructionsComponent, ModalComponent ], // declare the test component
        providers: [ TranslateService, TranslateLoader ]
    })
    */



  });

  it('When load, should select by default the step number 1', done => {

    TestBed.compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlogoInstructionsComponent);
        comp = fixture.componentInstance; // FlogoInstructionsComponent test instance
        //console.log(comp);
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('.flogo-instructions-option-selected > span'));

        el = de.nativeElement;
        expect(de.nativeElement.innerHTML).toEqual('1');
        done();
      });
  });

    /*let tcb: TestComponentBuilder;

    //setup
    beforeEachProviders(()=> [
        TranslateService,
        TranslateLoader,
        FlogoInstructionsComponent
    ]);

    beforeEach(inject([TestComponentBuilder], (_tcb:TestComponentBuilder) => {
        tcb = _tcb;
    }));


   it('When load, should select by default the step number 1', done => {
        tcb.createAsync(FlogoInstructionsComponent)
            .then(fixture => {
                let selected: any;
                fixture.detectChanges();
                selected = fixture.debugElement.query(By.css('.flogo-instructions-option-selected > span'));
                expect(selected.nativeElement.innerHTML).toEqual('1');
                done();
            });
    });

    xit('When load, back button must not exist and next button should exist', done => {

        tcb.createAsync(FlogoInstructionsComponent)
            .then(fixture => {
                fixture.detectChanges();
                let backButton = fixture.debugElement.query(By.css('#buttonBack'));
                expect(backButton).toBeNull();
                let nextButton = fixture.debugElement.query(By.css('#buttonNext'));
                expect(nextButton).not.toBeNull(nextButton);
                done();
            });
    });

    xit('Click on next  should move to step 2', done => {
        tcb.createAsync(FlogoInstructionsComponent)
            .then(fixture => {
                let instructions = fixture.componentInstance;
                fixture.detectChanges();

                let buttonNextDebug = fixture.debugElement.query(By.css('#buttonNext'));
                let button = buttonNextDebug.nativeElement;

                button.click();
                fixture.detectChanges();
                let selected = fixture.debugElement.query(By.css('.flogo-instructions-option-selected > span'));
                expect(selected.nativeElement.innerHTML).toEqual('2');

                done();
            });
    });

    xit('When last step is selected, close button should exist', done => {
        tcb.createAsync(FlogoInstructionsComponent)
            .then(fixture => {
                let instructions = fixture.componentInstance;
                instructions.currentIndex = instructions.steps.length -1;

                fixture.detectChanges();
                let buttonClose = fixture.debugElement.query(By.css('#buttonClose'));
                expect(buttonClose).not.toBeNull();
                done();
            });
    });

    xit('Click on back  should move to step 3', done => {
        tcb.createAsync(FlogoInstructionsComponent)
            .then(fixture => {
                let instructions = fixture.componentInstance;
                instructions.currentIndex = instructions.steps.length -1;
                fixture.detectChanges();

                let buttonBackDebug = fixture.debugElement.query(By.css('#buttonBack'));
                let button = buttonBackDebug.nativeElement;

                button.click();
                fixture.detectChanges();
                let selected = fixture.debugElement.query(By.css('.flogo-instructions-option-selected > span'));
                expect(selected.nativeElement.innerHTML).toEqual('3');
                done();
            });
    });*/


});
