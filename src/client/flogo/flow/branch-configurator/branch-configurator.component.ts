import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {FlowState} from '@flogo/flow/core/state';
import {FlogoFlowService as FlowsService} from '@flogo/flow/core';
import {FLOGO_TASK_TYPE, GraphNode, ItemBranch, LanguageService} from '@flogo/core';
import {MapperController, MapperControllerFactory} from '@flogo/flow/shared/mapper';
import {
 getStateWhenConfigureChanges,
} from '@flogo/flow/shared/configurator/configurator.selector';
import {skip, takeUntil} from 'rxjs/operators';
import {SingleEmissionSubject} from '@flogo/core/models';
import {cloneDeep} from 'lodash';
import {getInputContext} from '@flogo/flow/core/models/task-configure/get-input-context';
import {Subscription} from 'rxjs';
import * as FlowActions from '@flogo/flow/core/state/flow/flow.actions';
import {animate, style, transition, trigger} from '@angular/animations';
import {createSaveBranchAction} from '@flogo/flow/task-configurator/models/save-action-creator';
import {createBranchMappingContext} from '@flogo/flow/branch-configurator/branch-configurator-context';


@Component({
  selector: 'flogo-flow-branch-configurator',
  styleUrls: [
    '../../../assets/_mapper-modal.less',
    'branch-configurator.component.less'
  ],
  templateUrl: 'branch-configurator.component.html',
  animations: [
    trigger('dialog', [
      transition('void => *', [
        style({transform: 'translateY(-100%)', opacity: 0}),
        animate('250ms ease-in')
      ]),
      transition('* => void', [
        animate('250ms ease-in', style({transform: 'translateY(-100%)', opacity: 0}))
      ]),
    ])
  ],
})
export class BranchConfiguratorComponent implements OnInit {

  itemId: string;
  inputScope: any[];
  isActive = false;
  isSaveDisabled = false;
  isEmpty = false;
  parentActivity: string;
  childActivity: string;
  inputMapperController: MapperController;
  private contextChange$ = SingleEmissionSubject.create();
  private inputMapperStateSubscription: Subscription;
  private destroy$ = SingleEmissionSubject.create();

  constructor(
    private store: Store<FlowState>,
    private _flowService: FlowsService,
    private translate: LanguageService,
    private mapperControllerFactory: MapperControllerFactory,
  ) {
  }

  ngOnInit() {
    this.store
      .pipe<FlowState>(
        getStateWhenConfigureChanges([FLOGO_TASK_TYPE.TASK_BRANCH]),
        takeUntil(this.destroy$),
      )
      .subscribe(state => {
        if (state) {
          this.initConfigurator(state);
        } else if (this.isActive) {
          this.close();
        }
      });
  }

  private initConfigurator(state: FlowState) {
    this.itemId = state.taskConfigure;
    this.ensurePreviousContextCleanup();
    this.contextChange$ = SingleEmissionSubject.create();
    const selectedItem = <ItemBranch>cloneDeep(state.mainItems[this.itemId] || state.errorItems[this.itemId]);
    this.createActivityLinksInfo(state);
    this.isSaveDisabled = true;
    this.inputScope = getInputContext(this.itemId, state);
    const {propsToMap, mappings} = createBranchMappingContext(selectedItem.condition);
    this.resetInputMappingsController(propsToMap, this.inputScope, mappings);
    this.open();

  }

  private ensurePreviousContextCleanup() {
    if (this.contextChange$ && !this.contextChange$.isStopped) {
      this.contextChange$.emitAndComplete();
    }
  }

  private createActivityLinksInfo(state) {
    const selectedLinksGraph = <GraphNode>cloneDeep(state.mainGraph.nodes[this.itemId] || state.errorGraph.nodes[this.itemId]);
    const selectedLinksParentItem = cloneDeep(state.mainItems[selectedLinksGraph.parents[0]] ||
      state.errorItems[selectedLinksGraph.parents[0]]);
    const selectedLinksChildItem = cloneDeep(state.mainItems[selectedLinksGraph.children[0]] ||
      state.errorItems[selectedLinksGraph.children[0]]);
    this.childActivity = selectedLinksChildItem ? selectedLinksChildItem.name : null;
    this.parentActivity = selectedLinksParentItem ? selectedLinksParentItem.name : null;
  }

  private resetInputMappingsController(propsToMap, inputScope, mappings) {
    if (this.inputMapperStateSubscription && !this.inputMapperStateSubscription.closed) {
      this.inputMapperStateSubscription.unsubscribe();
    }
    this.inputMapperController = this.mapperControllerFactory.createController(propsToMap, inputScope, mappings);
    this.inputMapperStateSubscription = this.inputMapperController.state$
      .pipe(
        skip(1),
        takeUntil(this.contextChange$)
      )
      .subscribe((state) => {
        this.isEmpty = !state.mappings.condition;
        this.isSaveDisabled = !state.isDirty || !state.isValid || this.isEmpty;
      });
  }

  private open() {
    this.isActive = true;
  }

  private close() {
    if (!this.contextChange$.closed) {
      this.contextChange$.emitAndComplete();
    }
    this.isActive = false;
  }

  save() {
    createSaveBranchAction(this.store, {
      id: this.itemId,
      condition: this.inputMapperController.getCurrentState().mappings.condition.expression,
    })
      .subscribe(action => {
        this.store.dispatch(action);
        this.isActive = false;
      });
  }

  cancel() {
    this.store.dispatch(new FlowActions.CancelItemConfiguration());
  }
}
