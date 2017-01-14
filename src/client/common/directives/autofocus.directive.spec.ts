import {Component, Output, EventEmitter, DebugElement} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DoFocusDirective } from './autofocus.directive';

@Component({
    selector: 'container',
    template: `
            <input type="text" doFocus id="inputTextField" />
            `
})
class Container {
}

describe('Directive: DoAutoFocus', ()=> {
    let fixture: ComponentFixture<Container>, container: Container;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ DoFocusDirective, Container ]
        });
    });


    it('The input text control should have the focus', done => {
        fixture = TestBed.createComponent(Container);
        container = fixture.componentInstance;
        fixture.detectChanges();

        expect(document.activeElement.id).toEqual('inputTextField');
        done();
    });


});

