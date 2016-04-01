import { Component } from 'angular2/core';
import { PostService } from '../../../common/services/post.service';
import { MOCK_TASKS } from '../mocks/tasks';
import { SUB_EVENTS, PUB_EVENTS } from '../messages';

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
  private _selectTaskMsg : any;

  constructor( private _postService : PostService ) {
    this.initSubscribe();

    this.tasks = MOCK_TASKS || [];
  }

  private initSubscribe() {
    this._subscriptions = [];

    let subs = [
      _.assign( {}, SUB_EVENTS.addTask, { callback : this._getAddTaskMsg.bind( this ) } ),
      _.assign( {}, SUB_EVENTS.selectTask, { callback : this._getSelectTaskMsg.bind( this ) } )
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

  private _getSelectTaskMsg( data : any, envelope : any ) {
    console.group( 'Select task message in tasks' );

    console.log( data );
    console.log( envelope );

    this._selectTaskMsg = data;

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
