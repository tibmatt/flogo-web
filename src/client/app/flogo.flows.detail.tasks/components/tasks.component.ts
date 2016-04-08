import { Component } from 'angular2/core';
import { PostService } from '../../../common/services/post.service';
import { RESTAPIService } from "../../../common/services/rest-api.service";
import { MOCK_TASKS } from '../mocks/tasks';
import { SUB_EVENTS, PUB_EVENTS } from '../messages';
import { RouteParams } from 'angular2/router';

import {InstallComponent} from '../../flogo.flows.detail.tasks.install/components/install.component';
import { flogoIDEncode } from '../../../common/utils';

@Component(
  {
    selector : 'flogo-flows-detail-tasks',
    moduleId : module.id,
    directives: [InstallComponent],
    templateUrl : 'tasks.tpl.html',
    styleUrls : [ 'tasks.component.css' ]
  }
)

export class FlogoFlowsDetailTasks {
  public filteredTasks : any[] = [];
  private _filterQuery : string = null;

  private tasks : any[] = [];

  private _subscriptions : any;
  private _addTaskMsg : any;

  constructor( private _postService : PostService, private _routeParams : RouteParams, private _restApiService : RESTAPIService) {
    console.group( 'Constructing FlogoFlowsDetailTasks' );

    console.log( this._routeParams );

    this.initSubscribe();
    this._loadActivities();

    console.groupEnd();
  }

  ngOnDestroy() {
    this._subscriptions.forEach(
      ( sub : any ) => {
        this._postService.unsubscribe( sub );
      }
    );
  }

  public get filterQuery() {
    return this._filterQuery;
  }

  public set filterQuery(query:string){
    this._filterQuery = query;
    this._filterActivities();
  }

  public sendAddTaskMsg( task : any ) {

    this._postService.publish(
      _.assign(
        {}, PUB_EVENTS.addTask, {
          // TODO for the moment, the taskId can only be number, so timestamp is used.
          data : _.assign(
            {}, this._addTaskMsg, {
              task : _.assign( {}, task, { id : flogoIDEncode( '' + (Date.now() >>> 1)  ) } ) // avoid overflow 32 bit system
            }
          )
        }
      )
    );
  }

  private initSubscribe() {
    this._subscriptions = [];

    let subs = [
      _.assign( {}, SUB_EVENTS.addTask, { callback : this._getAddTaskMsg.bind( this ) } ),
      _.assign( {}, SUB_EVENTS.installActivity, { callback : this._loadActivities.bind( this ) } ),
    ];

    _.each(
      subs, sub => {
        this._subscriptions.push( this._postService.subscribe( sub ) );
      }
    );
  }

  private _loadActivities() {
    console.log('Loading activities')
    this._restApiService.activities
      .getInstalled()
      .then((tasks:any[]) => {
        this.tasks = tasks;
        this._filterActivities();
      });
  }


  private _getAddTaskMsg( data : any, envelope : any ) {
    console.group( 'Add task message in tasks' );

    console.log( data );
    console.log( envelope );

    this._addTaskMsg = data;

    console.groupEnd();
  }

  private _filterActivities() {
    if (this.filterQuery) {
      let filterQuery = this.filterQuery.toLowerCase();
      this.filteredTasks = _.filter(this.tasks, task => task.name.toLowerCase().indexOf(filterQuery) >= 0);
    } else {
      this.filteredTasks = this.tasks;
    }
  }

}
