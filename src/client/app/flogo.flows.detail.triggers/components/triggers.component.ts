import {Component} from 'angular2/core';
import {PostService} from '../../../common/services/post.service';
import {TRIGGERS as TRIGGERS_MOCK} from '../mocks/triggers';

export const PUB_EVENTS = {
  LIST_TRIGGERS: {
    channel:  'flogo-triggers',
    topic:  'list-triggers'
  },
  LIST_TRIGGERS_DONE: {
    channel:  'flogo-triggers',
    topic:  'list-triggers-done'
  }
};


@Component({
  selector: 'flogo-flows-detail-triggers',
  moduleId: module.id,
  templateUrl: 'triggers.tpl.html',
  styleUrls: ['triggers.component.css']
})
export class FlogoFlowsDetailTriggers{
  public triggers: any;
  subscriptions:any;
  constructor(private _postService: PostService){
    this.subscriptions = [];
    this.initSubscribe();

    this._postService.publish(_.assign({},PUB_EVENTS.LIST_TRIGGERS));
  }


  ngOnDestroy() {
    this.subscriptions.forEach((sub:any) => {
      this._postService.unsubscribe(sub);
    });
  }

  private initSubscribe(){

    this.subscriptions.push(this._postService.subscribe({
      channel: PUB_EVENTS.LIST_TRIGGERS.channel,
      topic: PUB_EVENTS.LIST_TRIGGERS.topic,
      callback: function() {
        this._listTriggers();
      }.bind(this)
    }));


    // when the list of triggers arrive
    let sub = {
      channel: PUB_EVENTS.LIST_TRIGGERS_DONE.channel,
      topic: PUB_EVENTS.LIST_TRIGGERS_DONE.topic,
      callback:  (data:any, envelope:any) => {
        this.triggers = data.triggers || [];
      }
    };

    this.subscriptions.push(this._postService.subscribe(sub));

  }

  private _listTriggers() {
    let triggers =  TRIGGERS_MOCK;
    var triggerDoneEvent = _.assign({}, PUB_EVENTS.LIST_TRIGGERS_DONE, {data:{triggers:triggers}});
    this._postService.publish(triggerDoneEvent);

  }

}
