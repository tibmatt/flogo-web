import {Component} from '@angular/core';
import { Contenteditable } from './contenteditable.directive';
import { describe, beforeEachProviders, it, inject, expect, injectAsync } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';

@Component({
    selector: 'container',
    template: '<h3 [(myContenteditable)]="name" (myContenteditableChange)="changed($event,null)"></h3>',
    directives: [Contenteditable]
})
export class Container {
    name: string = '';

    changed(value, property) {
        console.log('Changing:');
        console.log(value);
    }

}

describe('Directive: Contenteditable', ()=> {
    let fixture, tcb;

    // setup
    beforeEachProviders(()=>[TestComponentBuilder, Container]);

    beforeEach(injectAsync([TestComponentBuilder], _tcb => {
        tcb = _tcb;
    }));


    it('Changing the model variable should change the inner text', done => {
        tcb.createAsync(Container)
            .then(fixture => {
                let container = fixture.componentInstance;
                let element = fixture.nativeElement;
                container.name = 'hello';
                fixture.detectChanges();
                expect(element.querySelector('h3').innerText).toBe('hello');
                done();
            });

    });

});
