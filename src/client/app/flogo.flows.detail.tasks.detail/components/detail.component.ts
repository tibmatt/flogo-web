import { Component } from '@angular/core';
import { PostService } from '../../../common/services/post.service';
import { SUB_EVENTS } from '../messages';

@Component(
  {
    selector : 'flogo-flows-detail-tasks-detail',
    moduleId : module.id,
    templateUrl : 'detail.tpl.html',
    styleUrls : [ 'detail.component.css' ],
  }
)

export class FlogoFlowsDetailTasksDetail {
  _flowId:string;
  _task : any;
  _step : any;
  _context: any;
  private _subscriptions : any;
  _selectTaskMsg : any;

  constructor( private _postService : PostService ) {
    console.group( 'Constructing FlogoFlowsDetailTasks' );

    this.initSubscribe();

    console.groupEnd();
  }

  private initSubscribe() {
    this._subscriptions = [];

    let subs = [
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

  private _getSelectTaskMsg( data : any, envelope : any ) {
    // TODO is need it?
    this._flowId = data.id;
    console.group( 'Select task message in tasks' );

    console.log( data );
    console.log( envelope );

    this._selectTaskMsg = data;
    this._task = data.task;
    this._step = data.step;
    this._context = data.context;

    if(_.isFunction( envelope.done )) {
      envelope.done();
    }

    console.groupEnd();
  }

}
