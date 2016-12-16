import { describe, beforeEach, beforeEachProviders, it, inject, expect, injectAsync} from '@angular/core/testing';
import { FlogoAppList } from './app.list.component';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { By } from '@angular/platform-browser';


describe('FlogoAppList component', () => {
    let applications = ['Sample app C', 'Sample app A', 'Sample app B'];
    let tcb: TestComponentBuilder;

    function createComponent() {
        return tcb.createAsync(FlogoAppList);
    }

    //setup
    beforeEachProviders(()=> [
        TestComponentBuilder,
        FlogoAppList
    ]);

    beforeEach(inject([TestComponentBuilder], (_tcb:TestComponentBuilder) => {
        tcb = _tcb;
    }));

    it('Should render 3 applications', (done)=> {
         createComponent()
            .then(fixture => {
                let appList = fixture.componentInstance;
                appList.applications = applications;

               fixture.detectChanges();
               let listItems = fixture.debugElement.queryAll(By.css('ul li'));
                expect(listItems.length).toEqual(3);
                done();
            });
    });

    it('Should show the application name', (done)=> {
        createComponent()
            .then(fixture => {
                let appList = fixture.componentInstance;
                appList.applications = ['Sample app'];

                fixture.detectChanges();
                let listItems = fixture.debugElement.queryAll(By.css('ul li'));
                expect(listItems[0].nativeElement.innerHTML).toEqual('Sample app');
                done();
            });
    });


    xit('Should add an application', (done)=> {
        createComponent()
            .then(fixture => {
                let appList = fixture.componentInstance;
                appList.applications = applications;

                fixture.detectChanges();
                appList.add('Sample App D');

                let listItems = fixture.debugElement.queryAll(By.css('ul li'));
                expect(].nativeElement.innerHTML).toEqual('Sample app A');
                expect(listItems[1].nativeElement.innerHTML).toEqual('Sample app B');
                expect(listItems[2].nativeElement.innerHTML).toEqual('Sample app C');
                done();
            });
    });

});
