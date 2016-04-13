import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {RESTAPIFlowsService} from '../../../common/services/restapi/flows-api.service';
import {RESTAPIActivitiesService} from '../../../common/services/restapi/activities-api.service';
import { flogoIDEncode } from '../../../common/utils';
import {FlogoFlowsAdd} from '../../flogo.flows.add/components/add.component';

import {PostService} from '../../../common/services/post.service'
import {PUB_EVENTS as SUB_EVENTS} from '../../flogo.flows.add/message';

@Component({
  selector: 'flogo-flows',
  moduleId: module.id,
  templateUrl: 'flows.tpl.html',
  styleUrls: ['flows.component.css'],
  directives: [ROUTER_DIRECTIVES, FlogoFlowsAdd],
  providers: [RESTAPIFlowsService, RESTAPIActivitiesService]
})

export class FlogoFlowsComponet{
    private _sub: any;
    public flows: any[] = [];

    constructor(
        private _flow:RESTAPIFlowsService,
        private _postService: PostService
    ){
        this.getAllFlows();
        this.initSubscribe();
    }
    private initSubscribe() {
        this._sub = this._postService.subscribe(_.assign({}, SUB_EVENTS.addFlow, {
            callback: this._addFlowMsg.bind(this)
        }));
    }
    ngOnDestroy() {
        this._postService.unsubscribe(this._sub);
    }

    // create a new flow
    private _addFlowMsg(data: any) {
        new Promise((resolve, reject)=>{
            let request = {
                name: data.name,
                description: data.description?data.description:'This flow has no description.',
                paths: {},
                items: {}
            };
            this._flow.createFlow(_.clone(request)).then((response)=>{
                console.log('create flow successful ' + response);
                resolve(response);
            }).catch((err)=>{
                console.log("create flow error ", err);
                reject(err);
            });
        }).then(()=>{
                return this.getAllFlows();
            }).catch((err)=>{
                console.error(err);
            });
    }

    // delete a flow
    deleteFlow( id, rev) {
        new Promise((resolve, reject)=> {
            this._flow.deleteFlow(id, rev).then((response)=> {
                console.log('remove flow successful ' + response);
                this.getAllFlows();
                resolve(response);

            }).catch((err)=> {
                console.log('remove flow error ' + err);
                reject(err);
            });
        });
    }
    getAllFlows(){
        return new Promise((resolve, reject)=>{
            this._flow.getFlows().then((response)=>{
                if(typeof response !== 'object'){
                    response = JSON.parse(response);
                }
                this.flows = response;
                resolve(response);
            }).catch((err)=>{
                reject(err);
            })
        })
    }

    // export flogoIDEncode
    // mainly for Route Link
    flogoIDEncode( id ) {
        return flogoIDEncode( id );
    }
}
