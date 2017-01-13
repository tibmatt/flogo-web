import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement }    from '@angular/core';
import { TranslateModule,  TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Http } from '@angular/http';
import { FlogoApplicationContainerComponent } from './container.component';
import { FlogoApplicationComponent } from './application.component';
import { FlogoApplicationSearch } from '../../flogo.apps.search/components/search.component';
import { FlogoApplicationFlowsComponent } from '../../flogo.apps.flows/components/flows.component';
import { RESTAPIApplicationsService } from '../../../common/services/restapi/applications-api.service';
import { RESTAPIApplicationsServiceMock } from '../../../common/services/restapi/applications-api.service.mock';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {APP_BASE_HREF} from '@angular/common'
import { Subject } from 'rxjs/Subject';

describe('FlogoApplicationComponent component', () => {
    let params: Subject<Params>;
    let comp:    FlogoApplicationComponent, fixture: ComponentFixture<FlogoApplicationComponent>,
        de:      DebugElement, el:      HTMLElement;
    function createComponent() {
        return TestBed.compileComponents();
    }

    let application = {
        id: "1",
        name: "Sample Application 1",
        version: "0.0.1",
        description: null, /* should be null for test */
        createdAt: new Date(),
        updatedAt: null,   /* should be null for test */
        flows: [
            {
                id: '897',
                name: 'Manually adjust temperature',
                description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Luptas oilsksd as asdfwo',
                createdAt: new Date()
            },
            {
                id: '987',
                name: 'Raise temperature & notifiy operator',
                description: 'A basic flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
                createdAt: new Date()
            },
            {
                id: '879',
                name: 'Log temperature',
                description: 'A complex flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
                createdAt: new Date()
            }
        ]
    };

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
            declarations: [ FlogoApplicationContainerComponent, ModalComponent,
                FlogoApplicationSearch, FlogoApplicationFlowsComponent, FlogoApplicationComponent], // declare the test component
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
                fixture = TestBed.createComponent(FlogoApplicationComponent);
                comp = fixture.componentInstance;

                comp.application = application;
                comp.editingName = true;
                comp.application.name = 'Sample Application 2';
                fixture.detectChanges();

                let inputName = fixture.debugElement.query(By.css('#appName'));
                expect(inputName.nativeElement.attributes['ng-reflect-model'].value).toEqual('Sample Application 2');
                done();
            });
    });

    xit("If updatedAt field is null,component will init passing the focus to the input name", (done)=> {
         createComponent()
             .then(()=> {
                 fixture = TestBed.createComponent(FlogoApplicationComponent);
                 comp = fixture.componentInstance;

                 comp.application = application;
                 comp.updateChanges();

                 fixture.detectChanges();
                 console.log(document.activeElement.id);
                 expect(document.activeElement.id).toEqual('appName');
                 done();

             })
     });

    it('Should display creation date', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationComponent);
                 comp = fixture.componentInstance;

                 comp.application = application;
                 comp.updateChanges();

                 fixture.detectChanges();
                 let creation = fixture.debugElement.query(By.css('.created span'));
                 expect(creation.nativeElement.innerText).toEqual('a few seconds ago.');
                 done();

             });
     });


    it('Click on Add description should show description input field', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationComponent);
                 comp = fixture.componentInstance;


                 comp.application = application;
                 comp.updateChanges();

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
     });

     it('When description field is empty, Add description link should be visible', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationComponent);
                 comp = fixture.componentInstance;
                 comp.application = application;
                 comp.updateChanges();
                 fixture.detectChanges();

                 // because description field is empty, anchor add description should be present
                 let addDescription = fixture.debugElement.query(By.css('.description > a'));
                 expect(addDescription).toBeDefined();
                 done();
             });
     });


     it('When done editing description input, description should be visible as a label', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationComponent);
                 comp = fixture.componentInstance;
                 comp.application = application;
                 comp.updateChanges();
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
     });


     it('When done editing name input, name should be visible as a label', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationComponent);
                 comp = fixture.componentInstance;
                 comp.application = application;
                 comp.updateChanges();
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
     });

     it('When description field is not empty, Add description link should not be visible', (done) => {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationComponent);
                 comp = fixture.componentInstance;

                 comp.application = application;
                 comp.updateChanges();

                     fixture.detectChanges();
                     let appDetails = fixture.componentInstance;
                     appDetails.application.description = 'A brief description';
                     fixture.detectChanges();

                     // because description field is not empty, anchor add description should not be present
                     let addDescription = fixture.debugElement.query(By.css('.description > a'));
                     expect(addDescription).toBeNull();
                     done();

             });
     });


     xit('Should render 3 flows', (done)=> {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationComponent);
                 comp = fixture.componentInstance;

                 comp.application = application;
                 comp.updateChanges();

                 fixture.detectChanges();
                 let flows = fixture.debugElement.queryAll(By.css('.flows-container > .flow'));
                 expect(flows.length).toEqual(3);
                 done();

             });
     });

     xit("If updatedAt field is not null, the name of the component should be shown as a label", (done)=> {
         createComponent()
             .then(() => {
                 fixture = TestBed.createComponent(FlogoApplicationComponent);
                 comp = fixture.componentInstance;

                 comp.application = application;
                 comp.application.name = 'Untitled Application';
                 comp.updateChanges();

                     fixture.detectChanges();
                     //let appDetails = fixture.componentInstance;
                     //appDetails.application.name = 'Untitled Application';
                     //fixture.detectChanges();

                     let labelName = fixture.debugElement.query(By.css('.applicationLabel'));
                     let labelElement = labelName.nativeElement;
                     expect(labelElement.innerText).toEqual('Untitled Application');
                     done();
             })
     });
});

