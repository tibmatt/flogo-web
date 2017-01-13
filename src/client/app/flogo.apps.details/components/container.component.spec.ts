import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA }    from '@angular/core';
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

import { FlowsModule as FlogoFlowsModule } from '../../flogo.flows/flogo.flows.module';
import { CommonModule as FlogoCommonModule } from '../../../common/common.module';
import { CoreModule as FlogoCoreModule } from '../../../common/core.module';
import { FlogoFlowsAdd } from '../../flogo.flows.add/components/add.component';
import { PostService } from '../../../common/services/post.service';
import { RESTAPIFlowsService } from '../../../common/services/restapi/flows-api.service';

describe('FlogoApplicationContainerComponent component', () => {
    let params: Subject<Params>;
    let comp:    FlogoApplicationContainerComponent, fixture: ComponentFixture<FlogoApplicationContainerComponent>;
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
                deps: [Http],
                FlogoCoreModule,
                FlogoCommonModule,
                  FlogoFlowsModule
            })],
            declarations: [ FlogoApplicationContainerComponent, ModalComponent,
                FlogoApplicationSearch, FlogoApplicationFlowsComponent, FlogoApplicationComponent, FlogoFlowsAdd], // declare the test component
            providers: [
                {provide: RESTAPIApplicationsService, useClass: RESTAPIApplicationsServiceMock },
              {provide: PostService, useClass: PostService },
              {provide: RESTAPIFlowsService, useClass: RESTAPIFlowsService },
                {provide: APP_BASE_HREF, useValue : '/' },
                {provide: ActivatedRoute, useValue: { params: params }  }
            ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA]
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

