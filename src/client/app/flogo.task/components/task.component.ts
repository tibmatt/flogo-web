import { Component, SimpleChange } from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskContainerComponent} from '../../flogo.task.container/components/task.container.component';
import {PostService} from '../../../common/services/post.service';
import {BehaviorSubject} from 'rxjs/Rx';
import {PUB_EVENTS as FLOGO_TASKCONTAINER_SUB_EVENTS, SUB_EVENTS as FLOGO_TASKCONTAINER_PUB_EVENTS} from '../../flogo.task.container/messages';
import {PUB_EVENTS, SUB_EVENTS} from '../messages';

@Component({
  selector: 'flogo-task',
  styleUrls: ['task.css'],
  moduleId: module.id,
  templateUrl: 'task.tpl.html',
  directives: [ROUTER_DIRECTIVES, FlogoTaskContainerComponent],
  inputs: ['data:task']
})

export class FlogoTaskComponent{
  modifiedState: any;
  inputSchema: string;
  inputState: string;
  inputSchemaSubject: any;
  inputStateSubject: any;
  modifiedStateSubject: any;
  data: any;
  _subscriptions: any[];

  constructor(private _postService: PostService) {
    this._initSubscribe();
  }

  private _initSubscribe() {
    this._subscriptions = [];

    let subs = [
      _.assign( {}, FLOGO_TASKCONTAINER_SUB_EVENTS.runFromThisTitle, { callback : this._runFromThisTile.bind( this ) } ),
      _.assign( {}, SUB_EVENTS.updateTaskResults, { callback : this._updateTaskResults.bind( this ) } )
    ];

    _.each(
      subs, sub => {
        this._subscriptions.push( this._postService.subscribe( sub ) );
      }
    );
  }


  _updateTaskResults(data:any, envelope:any) {
    this._postService.publish(_.assign({}, FLOGO_TASKCONTAINER_PUB_EVENTS.updateTaskResults, {data}));
  }

  ngOnDestroy() {
    _.each( this._subscriptions, sub => {
        this._postService.unsubscribe( sub );
      }
    );
  }

  setData(data:any) {
    this.data = data;
  }

  _runFromThisTile(data:any, envelope:any) {
    this._postService.publish(_.assign({}, PUB_EVENTS.runFromThisTile, {data}));
  }

  getStateData() {
    return {
      "name": "pets-query",
      "inputs": [
        {
          "name": "url",
          "value": "http://localhost"
        },
        {
          "name": "port",
          "value": "8081"
        },
        {
          "name": "payload",
          "value": {
            "age": 3,
            "type": "dog"
          }
        }
      ],
      "outputs": [
        {
          "name": "result",
          "value": false
        }
      ]
    }

  }

  getSchema() {
    return {
      "name": "pets-query",
      "title": "Pets query",
      "inputs" : [
        {
          "name": "url",
          "type": "string",
          "title": "URL"
        },
        {
          "name": "port",
          "type": "number",
          "title": "Port"
        },
        {
          "name": "payload",
          "type": "object",
          "title": "Payload"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "boolean",
          "title": "Is OK?"
        }
      ]
    }
  }

  stringify(json:any) {
    return JSON.stringify(json, null, 2);
  }

  /*
  changeInputSchema(event:any) {
    this.inputSchemaSubject.next(event.value);
  }
  changeInputState(event:any) {
    this.inputStateSubject.next(event.value);
  }
  */

  _init() {
    /*
    this.inputSchema = this.stringify(this.getSchema());
    this.inputState  = this.stringify(this.getStateData());

    this.inputSchemaSubject = new BehaviorSubject(this.inputSchema);
    this.inputStateSubject  = new BehaviorSubject(this.inputState);
    this.modifiedStateSubject  = new BehaviorSubject({});

    this.modifiedStateSubject.subscribe(
      (value:any) => {
        this.modifiedState = JSON.stringify(value, null, 2);
      }

    );
    */
  }

  ngOnChanges(
    changes : {
      [ propKey : string ] : SimpleChange
    }
  ) {

    console.log( changes );

    if ( changes[ 'data' ] ) {
      if ( this.data ) {
        this._init();
      }
    }
  }

  /*
  onGetModifiedState(state:any) {
  }
  */

}
