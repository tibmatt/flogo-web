import {Component, AfterViewInit, OnInit, ViewChild, ElementRef, Renderer} from '@angular/core';
import {ActivatedRoute, Params as RouteParams} from '@angular/router';
import {IFlogoApplicationModel, IFlogoApplicationFlowModel} from '../../../common/application.model';
import {PostService} from '../../../common/services/post.service'
import {PUB_EVENTS as SUB_EVENTS} from '../../flogo.flows.add/message';
import {RESTAPIFlowsService} from '../../../common/services/restapi/flows-api.service';
import {RESTAPIApplicationsService} from '../../../common/services/restapi/applications-api.service';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {notification} from '../../../common/utils';


@Component({
  selector: 'flogo-apps-details',
  moduleId: module.id,
  templateUrl: 'details.tpl.html',
  styleUrls: ['details.component.css']
})

export class FlogoApplicationDetailsComponent implements AfterViewInit, OnInit {
  @ViewChild('appInputName') appInputName: ElementRef;
  @ViewChild('appInputDescription') appInputDescription: ElementRef;
  application: IFlogoApplicationModel = null;
  searchPlaceHolder: string = '';
  createdAtFormatted: any;
  updateAtFormatted: any;
  editingDescription: boolean = false;
  editingName: boolean = false;
  flows: Array<IFlogoApplicationFlowModel> = [];
  private _sub: any;


  constructor(private route: ActivatedRoute,
              public translate: TranslateService,
              private renderer: Renderer,
              private postService: PostService,
              private apiFlows: RESTAPIFlowsService,
              private apiApplications: RESTAPIApplicationsService) {
    this.restoreState();
    this.initSubscribe();
  }

  ngOnInit() {
    this.route.params
      .subscribe((params: RouteParams) => {
        let appId = params['id'];
        this.restoreState();
        this.apiApplications.getApp(appId)
          .then((application: IFlogoApplicationModel) => {
            this.application = application;
            this.flows = this.getOriginalFlows();
          })
          .then(() => {
            this.searchPlaceHolder = this.translate.instant('DETAILS:SEARCH');

            let timeStr = this.application.createdAt;
            this.createdAtFormatted = moment(timeStr, 'YYYYMMDD hh:mm:ss').fromNow();


            if (this.application.updatedAt == null) {
              this.editingName = true;
              this.updateAtFormatted = null;
            } else {
              this.editingName = false;
              this.updateAtFormatted = moment(this.application.updatedAt, 'YYYYMMDD hh:mm:ss').fromNow();
            }
          })
          .then(() => {
            if (this.application.updatedAt == null) {
              this.renderer.invokeElementMethod(this.appInputName.nativeElement, 'focus', []);
            }
          });

      });
  }

  private initSubscribe() {
    this._sub = this.postService.subscribe(_.assign({}, SUB_EVENTS.addFlow, {
      callback: this.addNewFlow.bind(this)
    }));
  }

  ngOnDestroy() {
    this.postService.unsubscribe(this._sub);
  }

  // create a new flow
  private addNewFlow(flowInfo: any) {
    let newFlow = {
      name: flowInfo.name,
      description: flowInfo.description,
      appId: flowInfo.appId,
      paths: {},
      items: {}
    };
    this.apiFlows.createFlow(newFlow).then(() => {
      let message = this.translate.instant('FLOWS:SUCCESS-MESSAGE-FLOW-CREATED');
      notification(message, 'success', 3000);
    }).catch((err) => {
      let message = this.translate.instant('FLOWS:CREATE_FLOW_ERROR', err);
      notification(message, 'error');
      return err;
    }).then(()=>this.getAllFlows())
      .catch((err) => {
      console.error(err);
    });
  }

  getAllFlows() {
    this.apiApplications.getApp(this.application.id).then((app: any) => {
      this.flows = app.flows;
      this.application = app;
    }).catch(error=>console.log)
  }

  getOriginalFlows() {
    return _.clone(this.application.flows || []);
  }


  ngAfterViewInit() {
    // if(this.application.updatedAt == null) {
    //     this.renderer.invokeElementMethod(this.appInputName.nativeElement, 'focus',[]);
    // }
  }

  onClickAddDescription(event) {
    this.editingDescription = true;
    // wait to refresh view
    setTimeout(() => {
      this.renderer.invokeElementMethod(this.appInputDescription.nativeElement, 'focus', []);
    }, 0);
  }

  onInputDescriptionBlur(event) {
    this.editingDescription = false;
    let app: IFlogoApplicationModel = this.application;
    this.apiApplications.updateApp(app.id, _.pick(app, ['name', 'description'])).then(app => {
      this.updateAtFormatted = moment(app.updatedAt, 'YYYYMMDD hh:mm:ss').fromNow();
    });
  }

  onInputNameChange(event) {
    this.application.updatedAt = new Date();
  }

  onInputNameBlur(event) {
    let app: IFlogoApplicationModel = this.application;
    if (app.name) {
      this.editingName = false;
      this.apiApplications.updateApp(app.id, _.pick(app, 'name')).then(app => {
        this.updateAtFormatted = moment(app.updatedAt, 'YYYYMMDD hh:mm:ss').fromNow();
      });
    }
  }

  onClickLabelName(event) {
    this.editingName = true;
    setTimeout(() => {
      this.renderer.invokeElementMethod(this.appInputName.nativeElement, 'focus', []);
    }, 0);
  }

  onClickLabelDescription(event) {
    this.editingDescription = true;
    setTimeout(() => {
      this.renderer.invokeElementMethod(this.appInputDescription.nativeElement, 'focus', []);
    }, 0);
  }

  onKeyUpName(event) {
    if (event.code == "Enter") {
      this.editingName = false;
    }
  }

  onKeyUpDescription(event) {
  }

  onChangedSearch(search) {
    let flows = this.application.flows || [];

    if (search && flows.length) {
      let filtered = flows.filter((flow: IFlogoApplicationFlowModel) => {
        return (flow.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (flow.description || '').toLowerCase().includes(search.toLowerCase())
      });

      this.flows = filtered || [];

    } else {
      this.flows = this.getOriginalFlows();
    }
  }

  private restoreState() {
    this.application = null;
    this.searchPlaceHolder = '';
    this.createdAtFormatted = null;
    this.updateAtFormatted = null;
    this.editingDescription = false;
    this.editingName = false;
    this.flows = [];
  }

}
