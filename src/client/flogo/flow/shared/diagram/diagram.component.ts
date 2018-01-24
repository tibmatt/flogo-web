import * as _ from 'lodash';

import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChange } from '@angular/core';
import { LanguageService } from '@flogo/core';

import { FlogoFlowDiagram, IFlogoFlowDiagram, IFlogoFlowDiagramTaskDictionary } from './models';
import { PostService } from '@flogo/core/services/post.service';
import { PUB_EVENTS, SUB_EVENTS } from './messages';
import { FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE, FLOGO_FLOW_DIAGRAM_NODE_TYPE } from './constants';
import { FLOGO_PROFILE_TYPE, FLOGO_TASK_TYPE } from '@flogo/core/constants';
import { FlogoFlowDiagramNode } from './models/node.model';

@Component(
  {
    selector: 'flogo-flow-diagram',
    templateUrl: 'diagram.component.html',
    styleUrls: ['diagram.component.less'],
  }
)
export class FlogoFlowsDetailDiagramComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input()
  public tasks: IFlogoFlowDiagramTaskDictionary;
  @Input()
  public diagram: IFlogoFlowDiagram;
  @Input()
  public id: string;
  @Input()
  public appDetails: { appId: string, appProfileType: FLOGO_PROFILE_TYPE };
  @Input()
  public appId: string;
  public enabledSelectTrigger = false;
  private _elmRef: ElementRef;
  private _diagram: FlogoFlowDiagram;
  private _subscriptions: any[ ];

  constructor(elementRef: ElementRef, private _postService: PostService, private _translate: LanguageService) {
    this.enabledSelectTrigger = false;
    this._elmRef = elementRef;
    this.initSub();
  }

  ngAfterViewInit() {
    if (_.isEmpty(this.diagram) || (this.id === 'errorHandler' && _.isEmpty(this.diagram.root))) {
      this.diagram = FlogoFlowDiagram.getEmptyDiagram(this.id === 'errorHandler' ? 'error' : null);
    }

    this._diagram = new FlogoFlowDiagram(this.diagram, this.tasks || {}, this._translate, this.appDetails.appProfileType,
      this._elmRef.nativeElement, this.id === 'errorHandler' ? 'error' : null);

    // Render the diagram on next js cycle such that the diagram elements are added to the DOM.
    setTimeout(() => {
      this._diagram.render();
    }, 0);

  }

  ngOnChanges(changes: {
    [ propKey: string ]: SimpleChange
  }) {

    console.log(changes);

    // TODO
    //   WARN: multiple rendering warning:
    //     note that these change monitor may trigger render while the
    //     subscriptions of onAfterEditTask and onAfterAddTask may do the same thing.
    //     may need optimisation later
    // only trigger the render for single time per change
    // monitor the updates of diagram
    if (changes['diagram']) {

      console.groupCollapsed('Updated diagram');
      console.log(this.diagram);
      console.groupEnd();

    if (this.id === 'errorHandler' && _.isEmpty(this.diagram.root)) {
        this.diagram = FlogoFlowDiagram.getEmptyDiagram('error');
      }

      if (this.diagram && this.tasks && this._diagram) {
        this._diagram.updateAndRender({
          tasks: this.tasks,
          diagram: this.diagram
        })
          .then((diagram) => {
            this._diagram = diagram;
          });
      }

      // monitor the updates of tasks
    } else if (changes['tasks']) {

      console.groupCollapsed('Updated tasks');
      console.log(this.tasks);
      console.groupEnd();

      if (this.diagram && this.tasks && this._diagram) {
        this._diagram.updateAndRender({
          tasks: this.tasks
        })
          .then((diagram) => {
            this._diagram = diagram;
          });
      }
    }

  }

  ngOnDestroy() {
    // TODO

    this.unsub();
  }

  // forwarding event
  addTask($event: any) {
    // TODO
    console.group('forwarding add task event');

    console.log($event);

    const data = $event.detail;
    data.id = this.id;

    const nodeType = data.node.type;
    if (nodeType === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD || nodeType === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW) {
      // add task event
      this._postService.publish(_.assign({}, PUB_EVENTS.addTask, { data: data }));
    } else {
      console.warn('unknown event type');
    }

    console.groupEnd();
  }

  // forwarding event
  selectTask($event: any) {
    // TODO
    console.group('forwarding select task event');
    console.log($event);

    const data = $event.detail;
    data.id = this.id;

    // TODO
    //   need to support link and other nodes
    if (data.node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_ERROR_NEW) {
      // select trigger event
      this._postService.publish(_.assign({}, PUB_EVENTS.selectTrigger, { data: data }));
    } else if (data.node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE) {
      // select task event
      this._postService.publish(_.assign({}, PUB_EVENTS.selectTask, { data: data }));
    } else if (data.node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
      // select branch event
      this._postService.publish(_.assign({}, PUB_EVENTS.selectBranch, { data: data }));
    } else {
      console.warn('unknown event type, yet');
    }

    console.groupEnd();
  }

  // forwarding event based on item type
  onMenuItemClicked($event: any) {
    console.group('forwarding menu item clicked event');
    const menuItemType = $event.detail.origEvent.target.getAttribute('data-menu-item-type');

    if (_.isEmpty(menuItemType)) {
      console.warn('Invalid data menu item type.');
    } else {
      const data = $event.detail;
      data.id = this.id;

      switch (Number(menuItemType)) {
        case FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.ADD_BRANCH:
          this._postService.publish(_.assign({}, PUB_EVENTS.addBranch, { data: data }));
          break;
        case FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.SELECT_TRANSFORM:
          this._postService.publish(_.assign({}, PUB_EVENTS.selectConfigureTask, { data: data }));
          break;
        case FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.DELETE:
          this._postService.publish(_.assign({}, PUB_EVENTS.deleteTask, { data: data }));
          break;
      }
    }
    console.groupEnd();
  }

  private initSub() {
    if (_.isEmpty(this._subscriptions)) {
      this._subscriptions = [];
    }

    if (!this._postService) {
      console.error('No PostService Found..');
      return;
    }

    const subs = [
      _.assign({}, SUB_EVENTS.addTrigger, { callback: this._addTriggerDone.bind(this) }), // TODO: should remove this
      _.assign({}, SUB_EVENTS.selectTrigger, { callback: this._selectTriggerDone.bind(this) }), // TODO: should remove this
      _.assign({}, SUB_EVENTS.addTask, { callback: this._addTaskDone.bind(this) }),
      _.assign({}, SUB_EVENTS.selectTask, { callback: this._selectTaskDone.bind(this) }),
      _.assign({}, SUB_EVENTS.deleteTask, { callback: this._deleteTaskDone.bind(this) }),
      _.assign({}, SUB_EVENTS.render, {
        callback: function () {
          this._diagram.render();
        }.bind(this)
      }),
      _.assign({}, SUB_EVENTS.addBranch, { callback: this._addBranchDone.bind(this) }),
    ];

    _.each(
      subs, (sub) => {
        this._subscriptions.push(this._postService.subscribe(sub));
      }
    );
  }

  private unsub() {
    if (_.isEmpty(this._subscriptions)) {
      return true;
    }

    _.each(
      this._subscriptions, (sub) => {
        this._postService.unsubscribe(sub);
      }
    );

    return true;
  }

  private _afterEditTaskHandler(data: any) {

    console.group('_afterEditTaskHandler');
    console.log(data);

    // the tasks should have been passed into this component after changing
    // so re-render the diagram
    this._diagram.updateAndRender({
      tasks: this.tasks
    })
      .then((diagram) => {
        this._diagram = diagram;
      });

    // TODO
    //   if there are nodes position changing, then should apply the new diagram when updating
    // this._diagram.updateAndRender( {
    //   tasks: this.tasks,
    //   diagram: this.diagram
    // } );

    console.groupEnd();
  }

  private _addTriggerDone(data: any, envelope: any) {
    if (!this.raisedByThisDiagram(data.id)) {
      return;
    }

    console.group('Add Trigger Done');

    console.log(data);
    console.log(envelope);

    this._associateNodeWithTaskAndUpdateDiagram(data)
      .then(() => {
        if (_.isFunction(envelope.done)) {
          envelope.done(this._diagram);
        }
      })
      .then(() => {
        // navigate to add task
        return this._diagram.triggerByTaskID('selectTrigger', data.task.id);
      })
      .catch((err: any) => {
        console.error(err);
      });

    console.groupEnd();
  }

  private _addTaskDone(data: any, envelope: any) {
    if (!this.raisedByThisDiagram(data.id)) {
      return;
    }
    console.group('Add Task Done');

    console.log(data);
    console.log(envelope);

    this._associateNodeWithTaskAndUpdateDiagram(data)
      .then(() => {
        if (_.isFunction(envelope.done)) {
          envelope.done(this._diagram);
        }
      })
      .then(() => {
        // todo: remove, this is a temporal solution to prevent auto opening a new tile
        if (envelope.skipTaskAutoSelection) {
          return;
        }
        // navigate to add task
        return this._diagram.triggerByTaskID('selectTask', data.task.id);
      })
      .catch((err: any) => {
        console.error(err);
      });

    console.groupEnd();
  }

  private _selectTriggerDone(data: any, envelope: any) {
    if (!this.raisedByThisDiagram(data.id)) {
      return;
    }
    console.group('Select Trigger Done');

    console.log(data);
    console.log(envelope);

    this._associateNodeWithTaskAndUpdateDiagram(data)
      .then(
        () => {
          if (_.isFunction(envelope.done)) {
            envelope.done(this._diagram);
          }
        }
      );

    console.groupEnd();
  }

  private raisedByThisDiagram(id: string) {
    return this.id === (id || '');
  }

  private _selectTaskDone(data: any, envelope: any) {
    if (!this.raisedByThisDiagram(data.id)) {
      return;
    }

    console.group('Select task Done');

    console.log(data);
    console.log(envelope);

    this._associateNodeWithTaskAndUpdateDiagram(data)
      .then(
        () => {
          if (_.isFunction(envelope.done)) {
            envelope.done(this._diagram);
          }
        }
      );


    console.groupEnd();
  }

  private _deleteTaskDone(data: any, envelope: any) {
    if (!this.raisedByThisDiagram(data.id)) {
      return;
    }
    console.group('Delete task done.');

    console.log(data);
    console.log(envelope);

    const node = <FlogoFlowDiagramNode>this._diagram.nodes[_.get(data, 'node.id', '')];

    if (node) {
      this._diagram.deleteNode(node)
        .then((diagram: FlogoFlowDiagram) => {
          if (diagram && _.isFunction(diagram.render)) {
            return this._diagram.render();
          } else {
            return diagram;
          }
        })
        .then((diagram) => {
          this._diagram = diagram;
          if (_.isFunction(envelope.done)) {
            envelope.done(this._diagram);
          }
        });
    }

    console.groupEnd();
  }

  /**
   * Update the task information, link the node with the task, and then update & render the diagram
   *
   * @param data
   * @private
   */
  private _associateNodeWithTaskAndUpdateDiagram(data: any): Promise<any> {
    if (data.node && data.task) {
      // link the new task to FlogoFlowDiagramNode
      return this._diagram.linkNodeWithTask(data.node.id, data.task)
        .then((diagram) => {
          return diagram.updateAndRender(
            {
              tasks: this.tasks
            })
            .then((updatedDiagram) => {
              this._diagram = updatedDiagram;
            });
        });
    }

    // link the trigger with the root node with node id omitted
    // this should make the ../trigger/add deeplinking work

    if (data.task && data.task.type === FLOGO_TASK_TYPE.TASK_ROOT) {
      // link the trigger to FlogoFlowDiagramNode
      return this._diagram.linkNodeWithTask(this._diagram.root.is, data.task)
        .then((diagram) => {
          return diagram.updateAndRender({
            tasks: this.tasks
          })
            .then((updatedDiagram) => {
              this._diagram = updatedDiagram;
            });
        });
    }

    return Promise.reject('Invalid parameters.');
  }

  private _addBranchDone(data: any, envelope: any) {
    if (!this.raisedByThisDiagram(data.id)) {
      return;
    }
    console.group('Add branch done.');

    console.log(data);
    console.log(envelope);

    const node = <FlogoFlowDiagramNode>this._diagram.nodes[_.get(data, 'node.id', '')];

    // if node is of add type and task is of branch type
    if (node &&
      (_.get(data, 'task.type', -1) === FLOGO_TASK_TYPE.TASK_BRANCH) &&
      (_.get(data, 'node.type', ''))) {

      this._diagram.addBranch(data.node, data.task)
        .then((diagram) => {
          return diagram.updateAndRender(
            {
              tasks: this.tasks
            })
            .then((updatedDiagram: FlogoFlowDiagram) => {
              this._diagram = updatedDiagram;
            });
        })
        .then(() => {
          return _.isFunction(envelope.done) && envelope.done(this._diagram);
        })
        .then(() => {
          // navigate to add task
          return this._diagram.triggerByTaskID('addTask', data.task.id);
        })
        .catch((err: any) => {
          console.error(err);
        });
    }

    console.groupEnd();
  }
}
