import { Injectable } from 'angular2/core';
import { FlogoFlowDiagramProcess, IFlogoFlowDiagram, IFlogoFlowDiagramTaskDictionary } from '../models';
import { PROCESS, MOCK_TASKS } from '../mocks';
import { Http, Headers, RequestOptions, Response } from 'angular2/http';
import {TASKS} from "../../app/flogo.flows.detail.diagram/mocks/mock-tasks";

@Injectable()
export class RESTAPIService {

  flows:any;
  instances:any;
  activities:any;
  triggers:any;

  mockFlow:any;

  // TODO
  //    need to replace this mock with real implementation
  constructor(private http:Http) {

    // TODO
    //    this is only mock implementation
    this.mockFlow = {
      "1": {
        "created": 1459288333311,
        "paths": {},
        "name": "Payroll Distribution",
        "description": "This is a demo flow",
        "id": "1",
        "updated": 1459288333311,
        "items": {}
      }
    };

    // TODO
    //    this is only POC implementation with mock data
    this.flows = {
      get: () => {
        return Promise.resolve(
          [
            {
              "id": "1",
              "name": "Payroll Distribution",
              "description": "Chase payroll",
              "created": 1459288333311,
              "updated": 1459288333311
            },
            {
              "name": "Hello World",
              "description": "My first flow",
              "created": 1459288333311,
              "updated": 1459288333311
            }
          ]
        );
      },
      getFlowByID: (id:string) => {
        return Promise.resolve(this.mockFlow[id]);
      },
      updateFlowByID: (id:string, flow:any) => {
        this.mockFlow[id] = flow
        return Promise.resolve(id);
      },
      getFlowConfigByID: (id:string) => {
        return Promise.resolve(
          FlogoFlowDiagramProcess.toProcess(
            <IFlogoFlowDiagram>this.mockFlow[id].paths,
            <IFlogoFlowDiagramTaskDictionary>this.mockFlow[id].items
          )
        );
      },
      getFlowConfigByIDDemo: (id:string) => {
        return Promise.resolve(PROCESS);
      },
      upload: (id:string) => {
        // TODO
        //  upload current flow to process service server
        return this.flows.getFlowConfigByID(id)
          .then(
            (flowConfig:any) => {

              let body = JSON.stringify(flowConfig);
              let headers = new Headers(
                {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              );
              let options = new RequestOptions({headers: headers});


              return this.http.post('http://localhost:9090/processes', body, options)
                .toPromise();
            }
          )
          .then(
            (response:Response) => {
              if (response.text()) {
                return response.json()
              } else {
                return response;
              }
            }
          );
      },
      start: (id:string, data:any) => {
        // TODO
        //    start a new instance of a flow
        let body = JSON.stringify(
          {
            "processUri": `http://localhost:9090/processes/${id}`,
            "data": data
          }
        );

        let headers = new Headers(
          {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        );

        let options = new RequestOptions({headers: headers});


        return this.http.post('http://localhost:8080/process/start', body, options)
          .toPromise()
          .then(
            rsp => {
              if (rsp.text()) {
                return rsp.json();
              } else {
                return rsp;
              }
            }
          );
      },
      restartFrom: (id:string, data:any, step:number) => {
        // TODO

        // get the state of the last step
        let snapshotID = step - 1;
        if (snapshotID < 1) {
          return Promise.reject(`Invalid step ${step} to start from.`);
        }

        return this.instances.getSnapshot(id, snapshotID)
          .then(
            (state:any) => {

              // then restart from that state with data

              let body = JSON.stringify(
                {
                  'initialState': state,
                  'data': data
                }
              );

              let headers = new Headers(
                {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              );

              let options = new RequestOptions({headers: headers});

              return this.http.post('http://localhost:8080/process/restart', body, options)
                .toPromise()
                .then(
                  rsp => {
                    if (rsp.text()) {
                      return rsp.json();
                    } else {
                      return rsp;
                    }
                  }
                );
            }
          );
      }
    };

    this.instances = {
      getStepsByInstanceID: (id:string) => {
        let headers = new Headers(
          {
            'Accept': 'application/json'
          }
        );

        let options = new RequestOptions({headers: headers});

        return this.http.get(`http://localhost:9190/instances/${id}/steps`, options)
          .toPromise()
          .then(
            rsp => {
              if (rsp.text()) {
                return rsp.json();
              } else {
                return rsp;
              }
            }
          );
      },
      getStatusByInstanceID: (id:string) => {
        let headers = new Headers(
          {
            'Accept': 'application/json'
          }
        );

        let options = new RequestOptions({headers: headers});

        return this.http.get(`http://localhost:9190/instances/${id}/status`, options)
          .toPromise()
          .then(
            rsp => {
              if (rsp.text()) {
                return rsp.json();
              } else {
                return rsp;
              }
            }
          );
      },
      getSnapshot: (instanceID:string, snapshotID:number) => {
        // TODO

        let headers = new Headers(
          {
            'Accept': 'application/json'
          }
        );

        let options = new RequestOptions({headers: headers});

        return this.http.get(`http://localhost:9190/instances/${instanceID}/snapshot/${snapshotID}`, options)
          .toPromise()
          .then(
            rsp => {
              if (rsp.text()) {
                return rsp.json();
              } else {
                return rsp;
              }
            }
          );
      },
      whenInstanceFinishByID: (id:string) => {
        return new Promise(
          (resolve, reject) => {
            let TIMEOUT = 1000;
            let _recur = () => {
              setTimeout(
                function () {
                  this.instances.getStatusByInstanceID(id)
                    .then(
                      (rsp:any) => {
                        if (rsp.status === "500") {
                          resolve(rsp);
                        } else {
                          _recur();
                        }
                      }
                    )
                    .catch(reject);
                }.bind(this), TIMEOUT
              );
            };

            _recur();
          }
        );
      }
    };

    this._initActivities();

  }


  _initActivities() {

    let activities = MOCK_TASKS.map((activity:any, index:number) => Object.assign({isInstalled: index < 2, version: '0.0.1'}, activity));
    let getCopy = (arr:any[]) => arr.map((activity:any) => Object.assign({}, activity));

    let self = this;
    this.activities = {

      getAll() {
        return Promise.resolve(getCopy(activities));
      },

      getInstalled() {
        let installed = activities.filter((activity:any) => activity.isInstalled);
        return Promise.resolve(getCopy(installed));
      },

      getAvailableToInstall() {
        let available = activities.filter((activity:any) => !activity.isInstalled);
        return Promise.resolve(getCopy(available));
      },

      install(activitiesToInstall:{name:string, version:string}[]) {

        let installMap = activitiesToInstall.reduce((map:any, a:any) => {
          map[a.name] = a.version || '0.0.1';
          return map;
        }, {});

        activities
          .filter((activity:any) => {
            return installMap[activity.name] && installMap[activity.name] == activity.version;
          })
          .forEach((activity:any) => activity.isInstalled = true);

        return self.activities.getInstalled();

      },

      uninstall() {
        console.warn('Not implemented yet');
      }

    };

    this.activities.get = () => {

      if (!status) {
        return this.activities.getAll();
      } else if (status == 'installed') {
        return this.activities.getInstalled();
      } else if (status == 'none') {
        return this.activities.getAvailableToInstall();
      }

      throw new Error(`Unknown option "${status}"`);

    }

  }


}
