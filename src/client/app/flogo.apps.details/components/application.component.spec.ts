import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { Component, DebugElement, EventEmitter, NO_ERRORS_SCHEMA }    from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http } from '@angular/http';
import { TranslateModule,  TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { FlowsModule as FlogoFlowsModule } from '../../flogo.flows/flogo.flows.module';
import { CommonModule as FlogoCommonModule } from '../../../common/common.module';
import { CoreModule as FlogoCoreModule } from '../../../common/core.module';
import { FlogoApplicationContainerComponent } from './container.component';
import { FlogoApplicationComponent } from './application.component';
import { FlogoApplicationSearch } from '../../flogo.apps.search/components/search.component';
import { FlogoApplicationFlowsComponent } from '../../flogo.apps.flows/components/flows.component';


@Component({
    selector: 'container',
    template: `
            <flogo-app-details-item [application]="application"></flogo-app-details-item>
            `
})
class Container {
    application = {
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

}


describe('FlogoApplicationComponent component', () => {
    let application = null;
    let comp:    Container, fixture: ComponentFixture<Container>;
    function createComponent() {
        return TestBed.compileComponents();
    }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        //FormsModule,
        //ReactiveFormsModule,
        Ng2Bs3ModalModule,
        TranslateModule.forRoot({
          provide: TranslateLoader,
          useFactory: (http: Http) => new TranslateStaticLoader(http, '/base/dist/public/assets/i18n', '.json'),
          deps: [Http],
        }),
        Ng2Bs3ModalModule,
        FlogoCoreModule,
        FlogoCommonModule,
        FlogoFlowsModule
      ],
      declarations: [
        FlogoApplicationSearch,
        FlogoApplicationFlowsComponent,
        FlogoApplicationComponent,
        Container,
      ], // declare the test component
      providers: [],
        schemas: [ NO_ERRORS_SCHEMA ]
    });

  });

    it('Should display the name correctly when the binding changes', (done)=> {
        createComponent()
            .then(() => {
                fixture = TestBed.createComponent(Container);
                comp = fixture.componentInstance;
                comp.application.name = 'Sample Application 2';
                fixture.detectChanges();

                let inputName = fixture.debugElement.query(By.css('.applicationLabel'));
                if(inputName) {
                    expect(inputName.nativeElement.innerText).toEqual('Sample Application 2');
                    done();
                }

            });
    });


    it('Should display creation date', (done) => {
        createComponent()
            .then(() => {
                fixture = TestBed.createComponent(Container);
                comp = fixture.componentInstance;

                fixture.detectChanges();
                let creation = fixture.debugElement.query(By.css('.created span'));
                if(creation) {
                    expect(creation.nativeElement.innerText).toEqual('a few seconds ago.');
                    done();
                }

            });
    });

    it('Click on Add description should show description input field', (done) => {
        createComponent()
            .then(() => {
                fixture = TestBed.createComponent(Container);
                comp = fixture.componentInstance;

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
                fixture = TestBed.createComponent(Container);
                comp = fixture.componentInstance;
                fixture.detectChanges();

                // because description field is empty, anchor add description should be present
                let addDescription = fixture.debugElement.query(By.css('.description > a'));
                if(addDescription) {
                    expect(addDescription).toBeDefined();
                    done();
                }
            });
    });

    it('When done editing description input, description should be visible as a label', (done) => {
        createComponent()
            .then(() => {
                fixture = TestBed.createComponent(Container);
                comp = fixture.componentInstance;
                fixture.detectChanges();

                let addDescription = fixture.debugElement.query(By.css('.description > a'));
                if(addDescription) {
                    addDescription.nativeElement.click();
                    comp.application.description = 'A brief description';
                    fixture.detectChanges();

                    let inputDescription = fixture.debugElement.query(By.css('#appDescription'));
                    inputDescription.nativeElement.blur();
                    fixture.detectChanges();

                    let labelDescription = fixture.debugElement.query(By.css('.descriptionLabel'));
                    if(labelDescription) {
                        expect(labelDescription.nativeElement.innerText.indexOf('A brief description')).not.toEqual(-1);
                        done();
                    }
                }
            });
    });

    it('When done editing name input, name should be visible as a label', (done) => {
        createComponent()
            .then(() => {
                fixture = TestBed.createComponent(Container);
                comp = fixture.componentInstance;
                fixture.detectChanges();

                let labelApp = fixture.debugElement.query(By.css('.applicationLabel'));
                if(labelApp) {
                    labelApp.nativeElement.click();
                    comp.application.name = 'A cool application';
                    fixture.detectChanges();


                    let inputName = fixture.debugElement.query(By.css('#appName'));
                    if(inputName) {
                        inputName.nativeElement.blur();
                        fixture.detectChanges();
                        let labelName = fixture.debugElement.query(By.css('.applicationLabel'));
                        expect(labelName.nativeElement.innerText).toEqual('A cool application');
                        done();
                    }
                }
            });
    });

    it('When description field is not empty, Add description link should not be visible', (done) => {
        createComponent()
            .then(() => {
                fixture = TestBed.createComponent(Container);
                comp = fixture.componentInstance;

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

    it('Should render 3 flows', (done)=> {
        createComponent()
            .then(() => {
                fixture = TestBed.createComponent(Container);
                comp = fixture.componentInstance;

                fixture.detectChanges();
                let flows = fixture.debugElement.queryAll(By.css('.flows-container > .flow'));
                if(flows) {
                    expect(flows.length).toEqual(3);
                    done();
                }

            });
    });

    it("If updatedAt field is not null, the name of the component should be shown as a label", (done)=> {
        createComponent()
            .then(() => {
                fixture = TestBed.createComponent(Container);
                comp = fixture.componentInstance;

                comp.application.name = 'Untitled Application';
                comp.application.updatedAt = new Date();

                fixture.detectChanges();

                let labelName = fixture.debugElement.query(By.css('.applicationLabel'));
                let labelElement = labelName.nativeElement;
                if(labelElement) {
                    expect(labelElement.innerText).toEqual('Untitled Application');
                    done();
                }
            })
    });

});

