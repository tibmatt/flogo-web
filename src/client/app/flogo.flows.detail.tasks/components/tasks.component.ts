import { Component } from 'angular2/core';
import { PostService } from '../../../common/services/post.service';
import { MOCK_TASKS } from '../mocks/tasks';
import { SUB_EVENTS, PUB_EVENTS } from '../messages';
import { RouteParams } from 'angular2/router';

@Component(
  {
    selector : 'flogo-flows-detail-tasks',
    moduleId : module.id,
    templateUrl : 'tasks.tpl.html',
    styleUrls : [ 'tasks.component.css' ]
  }
)

export class FlogoFlowsDetailTasks {
  private tasks : any;
  private _subscriptions : any;
  private _addTaskMsg : any;

  constructor( private _postService : PostService, private _routeParams : RouteParams ) {
    console.group( 'Constructing FlogoFlowsDetailTasks' );

    console.log( this._routeParams );

    this.initSubscribe();

    this.tasks = MOCK_TASKS || [];

    console.groupEnd();
  }

  private initSubscribe() {
    this._subscriptions = [];

    let subs = [
      _.assign( {}, SUB_EVENTS.addTask, { callback : this._getAddTaskMsg.bind( this ) } )
    ];

    _.each(
      subs, sub => {
        this._subscriptions.push( this._postService.subscribe( sub ) );
      }
    );
  }

  ngOnDestroy() {
    this._subscriptions.forEach(
      ( sub : any ) => {
        this._postService.unsubscribe( sub );
      }
    );
  }

  private _getAddTaskMsg( data : any, envelope : any ) {
    console.group( 'Add task message in tasks' );

    console.log( data );
    console.log( envelope );

    this._addTaskMsg = data;

    console.groupEnd();
  }

  sendAddTaskMsg( task : any ) {

    // TODO
    //  Remove this mock later
    _.pull( MOCK_TASKS, task );

    this._postService.publish(
      _.assign(
        {}, PUB_EVENTS.addTask, {
          data : _.assign( {}, this._addTaskMsg, { task : task } )
        }
      )
    );
  }
}
