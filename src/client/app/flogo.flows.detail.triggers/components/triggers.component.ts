import { Component, OnDestroy } from '@angular/core';
import { PostService } from '../../core/services/post.service';
import { PUB_EVENTS, SUB_EVENTS } from '../messages';
import { RESTAPITriggersService } from '../../core/services/restapi/triggers-api.service';

@Component(
  {
    selector: 'flogo-flows-detail-triggers',
    templateUrl: 'triggers.tpl.html',
    styleUrls: [ 'triggers.component.less' ]
  }
)
export class FlogoFlowsDetailTriggersComponent implements OnDestroy {
  public triggers: any;
  private _subscriptions: any;
  private _addTriggerMsg: any;
  private _selectTriggerMsg: any;

  constructor( private _postService: PostService, private _restAPITriggersService: RESTAPITriggersService ) {
    console.group( 'Constructing FlogoFlowsDetailTasksComponent' );

    this.initSubscribe();
    this._loadTriggers();

    console.groupEnd();
  }

  private initSubscribe() {
    this._subscriptions = [];

    const subs = [
      _.assign( {}, SUB_EVENTS.addTrigger, { callback: this._getAddTriggerMsg.bind( this ) } ),
      _.assign( {}, SUB_EVENTS.selectTrigger, { callback: this._getSelectTriggerMsg.bind( this ) } )
    ];

    _.each(
      subs, sub => {
        this._subscriptions.push( this._postService.subscribe( sub ) );
      }
    );
  }

  ngOnDestroy() {
    this._subscriptions.forEach(
      ( sub: any ) => {
        this._postService.unsubscribe( sub );
      }
    );
  }

  private _getAddTriggerMsg( data: any, envelope: any ) {
    console.group( 'Add trigger message in triggers' );

    console.log( data );
    console.log( envelope );

    this._addTriggerMsg = data;

    console.groupEnd();
  }

  private _getSelectTriggerMsg( data: any, envelope: any ) {
    console.group( 'Select trigger message in triggers' );

    console.log( data );
    console.log( envelope );

    this._selectTriggerMsg = data;

    console.groupEnd();
  }

  sendAddTriggerMsg( trigger: any ) {
    this._postService.publish(
      _.assign(
        {}, PUB_EVENTS.addTrigger, {
          data: _.assign( {}, this._addTriggerMsg, { trigger: _.cloneDeep( trigger ) } )
        }
      )
    );
  }

  private _loadTriggers() {
    console.log('Loading triggers');

    this._restAPITriggersService.getTriggers()
      .then(
        ( triggers: any ) => {
          this.triggers = triggers;
        }
      )
      .catch(
        ( err: any ) => {
          console.error( err );
        }
      );
  }

  public onInstalledAction( response: any ) {
    console.group( `[FlogoFlowsDetailTriggers] onInstalled` );
    console.log( response );
    console.groupEnd();
    this._loadTriggers();
  }

}
