import {Component, Output, EventEmitter} from '@angular/core';
import { Contenteditable } from './contenteditable.directive';
import { describe, beforeEachProviders, it, inject, expect, injectAsync } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { By } from '@angular/platform-browser';

@Component({
    selector: 'container',
    template: `
            <h3 [(myContenteditable)]="name"
            (myContenteditableChange)="changed($event,null)"></h3>
            `,
    directives: [Contenteditable]
})
export class Container {
    @Output() changes = new EventEmitter();
    name: string = '';

    // helper function to repeat the event propagation
    changed(value, property) {
        this.changes.emit(value);
    }
}

describe('Directive: Contenteditable', ()=> {
    let fixture, tcb: TestComponentBuilder;

    // setup
    beforeEachProviders(()=>[TestComponentBuilder, Container]);

    beforeEach(injectAsync([TestComponentBuilder], (_tcb: TestComponentBuilder) => {
        tcb = _tcb;
    }));


    it('Changing the model variable should change the inner text', done => {
        tcb.createAsync(Container)
            .then(fixture => {
                let container = fixture.componentInstance;
                let element = fixture.nativeElement;
                container.name = 'a new name';
                fixture.detectChanges();
                expect(element.querySelector('h3').innerText).toBe('a new name');
                done();
            });
    });

    it('Blur event should emit the edited value', done => {
        tcb.createAsync(Container)
            .then(fixture => {
                let container = fixture.componentInstance;
                fixture.detectChanges();

                let h3Debug = fixture.debugElement.query(By.css('h3'));

                container.changes.subscribe(value => {
                    expect(value).toEqual('A new value');
                    done();
                });

                let h3Element = h3Debug.nativeElement;
                if(h3Element) {
                    h3Element.focus();
                    h3Element.innerHTML = 'A new value';
                    h3Element.blur();
                }

            });

    });



});
