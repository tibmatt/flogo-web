import {Component, Output, EventEmitter} from '@angular/core';
import { FlogoInstructionsComponent } from './instructions.component';
import { describe, beforeEachProviders, it, inject, expect, injectAsync } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { By } from '@angular/platform-browser';


describe('Component: FlogoInstructions Modal', ()=> {
    let tcb: TestComponentBuilder;

    //setup
    beforeEachProviders(()=> [
        TestComponentBuilder,
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

    it('When load, back button must not exist and next button should exist', done => {

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

    it('Click on next  should move to step 2', done => {
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

    it('When last step is selected, close button should exist', done => {
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

    it('Click on back  should move to step 3', done => {
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
    });



});
