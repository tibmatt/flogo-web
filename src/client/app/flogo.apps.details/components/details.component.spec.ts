import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement }    from '@angular/core';
import { TranslateModule,  TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Http } from '@angular/http';
import { FlogoApplicationDetailsComponent } from './details.component';
import { FlogoApplicationSearch } from '../../flogo.apps.search/components/search.component';
import { FlogoApplicationFlowsComponent } from '../../flogo.apps.flows/components/flows.component';
import { RESTAPIApplicationsService } from '../../../common/services/restapi/applications-api.service';
import { RESTAPIApplicationsServiceMock } from '../../../common/services/restapi/applications-api.service.mock';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {APP_BASE_HREF} from '@angular/common'
import { Subject } from 'rxjs/Subject';

describe('FlogoApplicationDetails component', () => {
    let params: Subject<Params>;
    let comp:    FlogoApplicationDetailsComponent, fixture: ComponentFixture<FlogoApplicationDetailsComponent>,
        de:      DebugElement, el:      HTMLElement;
    function createComponent() {
        return TestBed.compileComponents();
    }

    beforeEach(() => {
        params = new Subject<Params>();
        TestBed.configureTestingModule({
            imports: [ FormsModule,
                RouterModule.forRoot([]),
                TranslateModule.forRoot({
                provide: TranslateLoader,
                useFactory: (http: Http) => new TranslateStaticLoader(http, '/base/dist/public/assets/i18n', '.json'),
                deps: [Http]
            })],
            declarations: [ FlogoApplicationDetailsComponent, ModalComponent, FlogoApplicationSearch, FlogoApplicationFlowsComponent], // declare the test component
            providers: [
                {provide: RESTAPIApplicationsService, useClass: RESTAPIApplicationsServiceMock },
                {provide: APP_BASE_HREF, useValue : '/' },
                {provide: ActivatedRoute, useValue: { params: params }  }
            ]
        });

    });

    it('Should display the name correctly when the binding changes', (done)=> {
        createComponent()
            .then(() => {
                fixture = TestBed.createComponent(FlogoApplicationDetailsComponent);
                comp = fixture.componentInstance;


                comp.onParamChanged.subscribe(()=> {
                 comp.application.name = 'Sample Application 2';
                 fixture.detectChanges();

                 let inputName = fixture.debugElement.query(By.css('#appName'));
                 expect(inputName.nativeElement.attributes['ng-reflect-model'].value).toEqual('Sample Application 2');
                 done();
                });

                fixture.detectChanges();
                params.next({'id':Promise.resolve(1)});
            });
    });

    xit("If updatedAt field is null,component will init passing the focus to the input name", (done)=> {
         createComponent()
             .then(()=> {
                 fixture = TestBed.createComponent(FlogoApplicationDetailsComponent);
                 comp = fixture.componentInstance;

                 comp.onParamChanged.subscribe(()=> {
                     console.log(comp.application);
                     fixture.detectChanges();
                     console.log(document.activeElement.id);
                     expect(document.activeElement.id).toEqual('appName');
                     done();
                 });

                 fixture.detectChanges();
                 params.next({'id':Promise.resolve(1)});
             })
     });

    it('Should display creation date', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationDetailsComponent);
                 comp = fixture.componentInstance;

                 comp.onParamChanged.subscribe(()=> {
                     fixture.detectChanges();
                     let creation = fixture.debugElement.query(By.css('.created span'));
                     expect(creation.nativeElement.innerText).toEqual('a few seconds ago.');
                     done();
                 });

                 fixture.detectChanges();
                 params.next({'id':Promise.resolve(1)});
             });
     });


    it('Click on Add description should show description input field', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationDetailsComponent);
                 comp = fixture.componentInstance;

                 comp.onParamChanged.subscribe(()=> {
                     fixture.detectChanges();

                     let inputDescription;

                     // because description field is empty, anchor add description should be present
                     let addDescription = fixture.debugElement.query(By.css('.description > a'));
                     expect(addDescription).toBeDefined();

                     // input description doesn't should be present
                     inputDescription = fixture.debugElement.query(By.css('#appDescription'));
                     expect(inputDescription).toBeNull();

                     addDescription.nativeElement.click();
                     fixture.detectChanges();

                     // after click on add description, input appDescription should be present
                     inputDescription = fixture.debugElement.query(By.css('#appDescription'));
                     expect(inputDescription).toBeDefined();
                     done();
                 });

                 fixture.detectChanges();
                 params.next({'id':Promise.resolve(1)});
             });
     });

     it('When description field is empty, Add description link should be visible', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationDetailsComponent);
                 comp = fixture.componentInstance;

                 comp.onParamChanged.subscribe(()=> {
                     fixture.detectChanges();
                    // because description field is empty, anchor add description should be present
                    let addDescription = fixture.debugElement.query(By.css('.description > a'));
                    expect(addDescription).toBeDefined();
                    done();
                 });

                 fixture.detectChanges();
                 params.next({'id':Promise.resolve(1)});
             });
     });


     it('When done editing description input, description should be visible as a label', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationDetailsComponent);
                 comp = fixture.componentInstance;

                 comp.onParamChanged.subscribe(()=> {
                     fixture.detectChanges();

                     let appDetails = fixture.componentInstance;
                     appDetails.application.description = 'A brief description';
                     appDetails.editingDescription = false;
                     fixture.detectChanges();

                     let labelDescription = fixture.debugElement.query(By.css('.descriptionLabel'));
                     let labelElement = labelDescription.nativeElement;
                     expect(labelElement.innerText.indexOf('A brief description')).not.toEqual(-1);
                     done();
                 });

                 fixture.detectChanges();
                 params.next({'id':Promise.resolve(1)});
             });
     });


     it('When done editing name input, name should be visible as a label', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationDetailsComponent);
                 comp = fixture.componentInstance;

                 comp.onParamChanged.subscribe(()=> {
                     fixture.detectChanges();
                     let appDetails = fixture.componentInstance;
                     appDetails.application.name = 'A cool application';
                     appDetails.editingName = false;
                     fixture.detectChanges();

                     let labelName = fixture.debugElement.query(By.css('.applicationLabel'));
                     let labelElement = labelName.nativeElement;
                     expect(labelElement.innerText).toEqual('A cool application');
                     done();
                 });

                 fixture.detectChanges();
                 params.next({'id':Promise.resolve(1)});
             });
     });

     it('When description field is not empty, Add description link should not be visible', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationDetailsComponent);
                 comp = fixture.componentInstance;

                 comp.onParamChanged.subscribe(()=> {
                     fixture.detectChanges();
                     let appDetails = fixture.componentInstance;
                     appDetails.application.description = 'A brief description';
                     fixture.detectChanges();

                     // because description field is not empty, anchor add description should not be present
                     let addDescription = fixture.debugElement.query(By.css('.description > a'));
                     expect(addDescription).toBeNull();
                     done();
                 });

                 fixture.detectChanges();
                 params.next({'id':Promise.resolve(1)});
             });
     });


     it('Should render 3 flows', (done)=> {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationDetailsComponent);
                 comp = fixture.componentInstance;

                 comp.onParamChanged.subscribe(()=> {
                     fixture.detectChanges();
                     let flows = fixture.debugElement.queryAll(By.css('.flows-container > .flow'));
                     expect(flows.length).toEqual(3);
                     done();
                 });

                 fixture.detectChanges();
                 params.next({'id':Promise.resolve(1)});
             });
     });

     it("If updatedAt field is not null, the name of the component should be shown as a label", (done)=> {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationDetailsComponent);
                 comp = fixture.componentInstance;

                 comp.onParamChanged.subscribe(()=> {
                     fixture.detectChanges();
                     let appDetails = fixture.componentInstance;
                     appDetails.application.name = 'Untitled Application';
                     fixture.detectChanges();

                     let labelName = fixture.debugElement.query(By.css('.applicationLabel'));
                     let labelElement = labelName.nativeElement;
                     expect(labelElement.innerText).toEqual('Untitled Application');
                     done();
                 });
                 fixture.detectChanges();
                 params.next({'id':Promise.resolve(2)});
             })
     });
});

