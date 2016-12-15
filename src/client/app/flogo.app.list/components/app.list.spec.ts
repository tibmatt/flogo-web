import { describe, beforeEach, beforeEachProviders, it, inject, expect, injectAsync} from '@angular/core/testing';
import { FlogoAppList } from './app.list.component';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { By } from '@angular/platform-browser';


describe('FlogoAppList component', () => {
    let applications = ['Sample app 1', 'Sample app 2', 'Sample app 3'];
    let tcb: TestComponentBuilder;

    //setup
    beforeEachProviders(()=> [
        TestComponentBuilder,
        FlogoAppList
    ]);

    beforeEach(inject([TestComponentBuilder], (_tcb:TestComponentBuilder) => {
        tcb = _tcb;
    }));

    it('Should render 3 applications', (done)=> {
        tcb.createAsync(FlogoAppList)
            .then(fixture => {
                let appList = fixture.componentInstance;
                appList.applications = applications;

               fixture.detectChanges();
               let listItems = fixture.debugElement.queryAll(By.css('ul li'));
                expect(listItems.length).toEqual(3);
                done();
            });
    });

});
