import { provide } from '@angular/core';
import { describe, beforeEach, beforeEachProviders, it, inject, expect, injectAsync} from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { TranslateService, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { By } from '@angular/platform-browser';
import { HTTP_PROVIDERS } from '@angular/http';
import { FlogoApplicationDetailsComponent } from './details.component';
import { ROUTER_PROVIDERS } from '@angular/router';
import { RouteParams } from '@angular/router-deprecated';


describe('FlogoApplicationDetails component', () => {
    let tcb: TestComponentBuilder;

    let mockApplication = {
        id: "1",
        name: "Cool Application",
        version: "0.0.1",
        description: "My App",
        createdAt: new Date(),
        updatedAt: null
    };

    function createComponent() {
        return tcb.createAsync(FlogoApplicationDetailsComponent);
    }

    //setup
    beforeEachProviders(()=> [
        HTTP_PROVIDERS,
        ROUTER_PROVIDERS,
        TestComponentBuilder,
        TranslateService,
        TranslateLoader,
        provide(RouteParams, { useValue: new RouteParams({ application: mockApplication }) }),
        FlogoApplicationDetailsComponent
    ]);

    beforeEach(inject([TestComponentBuilder], (_tcb:TestComponentBuilder) => {
        window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        tcb = _tcb;
    }));

    it('Should display the name correctly when the binding changes', (done)=> {
        createComponent()
            .then(fixture => {
                let appDetails = fixture.componentInstance;
                appDetails.application.name = 'Sample Application 2';
                fixture.detectChanges();

                let inputName = fixture.debugElement.query(By.css('#appName'));
                expect(inputName.nativeElement.value).toEqual('Sample Application 2');
                done();
            });
    });

    it("If updatedAt field is null,component will init passing the focus to the input name", (done)=> {
        createComponent()
            .then(fixture => {
                fixture.detectChanges();
                expect(document.activeElement.id).toEqual('appName');
                done();
            })
    });


    it('Should display creation date', (done) => {
        createComponent()
            .then(fixture => {
                fixture.detectChanges();
                let creation = fixture.debugElement.query(By.css('.created > span'));
                expect(creation.nativeElement.innerText).toEqual('a few seconds ago');
                done();
            });
    });




});
