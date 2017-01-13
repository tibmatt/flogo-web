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

describe('FlogoApplicationContainerComponent component', () => {
    let params: Subject<Params>;
    let comp:    FlogoApplicationContainerComponent, fixture: ComponentFixture<FlogoApplicationContainerComponent>,
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
            declarations: [ FlogoApplicationContainerComponent, ModalComponent,
                FlogoApplicationSearch, FlogoApplicationFlowsComponent, FlogoApplicationComponent], // declare the test component
            providers: [
                {provide: RESTAPIApplicationsService, useClass: RESTAPIApplicationsServiceMock },
                {provide: APP_BASE_HREF, useValue : '/' },
                {provide: ActivatedRoute, useValue: { params: params }  }
            ]
        });

    });

    it('Should emmit event when router params change', (done)=> {
        createComponent()
            .then(() => {
                fixture = TestBed.createComponent(FlogoApplicationContainerComponent);
                comp = fixture.componentInstance;


                comp.onParamChanged.subscribe(()=> {
                    expect(1).toEqual(1);
                    done();
                });

                fixture.detectChanges();
                params.next({'id':Promise.resolve(1)});
            });
    });

});

