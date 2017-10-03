import * as _ from 'lodash';

import {
  Component, ViewChild, ElementRef, Input, OnDestroy, HostListener, trigger, transition, style, animate, state,
  AnimationTransitionEvent
} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/of';

import { PostService } from '../../common/services/post.service';

import {
  FLOGO_TASK_ATTRIBUTE_TYPE as ATTRIBUTE_TYPE,
  FLOGO_TASK_TYPE as TASK_TYPE,
  FLOGO_ERROR_ROOT_NAME as ERROR_ROOT_NAME
} from '../../common/constants';
import { REGEX_INPUT_VALUE_INTERNAL, REGEX_INPUT_VALUE_EXTERNAL, TYPE_ATTR_ASSIGNMENT } from './constants';
import { PUB_EVENTS, SUB_EVENTS } from './messages';
import { normalizeTaskName, convertTaskID } from '../../common/utils';

import { IMapFunctionsLookup, IMapping, IMapExpression, ISchemaProvider } from '../flogo.mapper/models/map-model';
import { IFlogoFlowDiagramTask } from '../flogo.flows.detail.diagram/models/task.model';
import { MapperTranslator } from './mapper-translator';

const TILE_MAP_ROOT_KEY = 'root-task';

interface TransformData {
  result: any;
  precedingTiles: any[];
  precedingTilesOutputs: any[];
  tile: any;
  tileInputInfo: any;
  mappings: any;
}

@Component({
  selector: 'flogo-transform',
  styleUrls: ['transform.component.less'],
  templateUrl: 'transform.component.html',
  animations: [
    trigger('dialog', [
      state('hidden', style({
        transform: 'translateY(-100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('hidden => visible', [
        animate('300ms ease-out')
      ]),
      transition('visible => hidden', [
        animate('250ms ease-in')
      ])
    ])
  ],
})
export class TransformComponent implements OnDestroy {
  fieldsConnections: any = {};
  isCollapsedOutput = true;
  isCollapsedInput = true;
  currentFieldSelected: any = {};
  errors: any;

  @Input()
  flowId: string;
  mapperContext: any;

  isValid: boolean;
  isDirty: boolean;

  // Two variables control the display of the modal to support animation when opening and closing: modalState and isActive.
  // this is because the contents of the modal need to visible up until the close animation finishes
  // modalState = 'inactive' || 'active'
  // TODO: we might be able to use a single variable when upgrading to angular >= 4.x as it allows to animate with *ngIf
  // controls the in/out transition of the modal
  modalState: 'visible'|'hidden' = 'hidden';
  // controls the rendering of the content of the modal
  isActive = false;

  showDeleteConfirmation = false;
  @ViewChild('deleteContainer') deleteContainer: ElementRef;

  data: TransformData = {
    result: null,
    precedingTiles: [],
    precedingTilesOutputs: [],
    tile: null,
    tileInputInfo: null,
    mappings: null
  };

  private _subscriptions: any[];
  private currentMappings: { [key: string]: IMapExpression };

  constructor(private _postService: PostService) {
    this.initSubscriptions();
    this.resetState();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  onSelectedItem(params: any) {
    this.currentFieldSelected = params;
  }

  onModalStateChange(event: AnimationTransitionEvent) {
    if (event.toState === 'visible' && event.phaseName === 'start') {
      this.isActive = true;
    } else if (event.toState === 'hidden' && event.phaseName === 'done') {
      this.isActive = false;
    }
  }

  removeError(change: any) {
    this.errors = this.errors || { invalidMappings: { errors: [] } };
    const index = this.errors.invalidMappings.errors.findIndex(function (item: any) {
      return item.value.mapTo === change.field;
    });

    if (index !== -1) {
      this.errors.invalidMappings.errors.splice(index, 1);
    }
    if (!this.errors.invalidMappings.errors.length) {
      this.errors = null;
    }

  }

  onToggledSchema(state: any) {
    if (state.isInput) {
      this.isCollapsedInput = state.isCollapsed;
    } else {
      this.isCollapsedOutput = state.isCollapsed;
    }
  }

  updateErrors(change: any) {
    const currentError = change.errors.invalidMappings.errors[0];
    this.errors = this.errors || { invalidMappings: { errors: [] } };

    if (change.errors.invalidMappings && change.errors.invalidMappings.errors) {
      const index = this.errors.invalidMappings.errors.findIndex(function (item: any) {
        return item.value.mapTo === change.field;
      });

      if (index === -1) {
        this.errors.invalidMappings.errors.push(currentError);
      } else {
        this.errors.invalidMappings.errors[index] = currentError;
      }
    }
  }

  onMappingsChange(change: IMapping) {
    // if (change.hasError) {
    //   this.updateErrors(change);
    // } else {
    //   this.removeError(change);
    // }
    //
    // this.fieldsConnections[change.field] = { value: change.value, mapTo: change.field, hasError: change.hasError };
    // this.isValid = this.checkIsValid();
    // this.isDirty = !change.isInit;
    //
    // if (this.isValid) {
    //   this.data.result = this.getResult();
    // }
    this.isValid = true;
    this.isDirty = true;
    this.currentMappings = _.cloneDeep(change).mappings;
  }

  getResult() {
    const results: any[] = [];

    for (const key in this.fieldsConnections) {
      if (this.fieldsConnections.hasOwnProperty(key)) {
        if (!this.fieldsConnections[key].hasError && this.fieldsConnections[key].value) {
          results.push({
            type: TYPE_ATTR_ASSIGNMENT,
            mapTo: this.fieldsConnections[key].mapTo,
            value: this.fieldsConnections[key].value
          });
        }
      }
    }

    return results;
  }

  checkIsValid() {
    let hasNonEmpty = false;

    for (const key in this.fieldsConnections) {
      if (this.fieldsConnections.hasOwnProperty(key)) {
        if (this.fieldsConnections[key].hasError) {
          return false;
        }
        if (this.fieldsConnections[key].value) {
          hasNonEmpty = true;
        }
      }
    }

    return hasNonEmpty;
  }


  saveTransform() {
    this._postService.publish(_.assign({}, PUB_EVENTS.saveTransform, {
      data: {
        tile: this.data.tile,
        inputMappings: MapperTranslator.translateMappingsOut(this.currentMappings),
        id: this.flowId
      }
    }));
    this.close();
  }

  deleteTransform() {
    this._postService.publish(_.assign({}, PUB_EVENTS.deleteTransform, {
      data: {
        tile: this.data.tile,
        id: this.flowId
      }
    }));
    this.close();
  }

  cancel() {
    this.close();
  }

  openDeleteConfirmation(event: Event) {
    this.showDeleteConfirmation = true;
    event.stopPropagation();
  }

  cancelDeleteConfirmation() {
    this.showDeleteConfirmation = false;
  }

  @HostListener('click', ['$event'])
  clickOutsideDeleteConfirmation(event: Event) {
    if (this.showDeleteConfirmation && this.deleteContainer && !this.deleteContainer.nativeElement.contains(event.target)) {
      this.showDeleteConfirmation = false;
    }
  }

  private initSubscriptions() {

    const subHandlers = [
      _.assign({}, SUB_EVENTS.selectActivity, { callback: this.onTransformSelected.bind(this) })
    ];

    this._subscriptions = subHandlers.map(handler => this._postService.subscribe(handler));

  }

  private raisedByThisDiagram(id: string) {
    return this.flowId === (id || '');
  }

  private cancelSubscriptions() {
    if (_.isEmpty(this._subscriptions)) {
      return true;
    }
    this._subscriptions.forEach(this._postService.unsubscribe);
    return true;
  }

  private onTransformSelected(data: {
    id: string,
    previousTiles: IFlogoFlowDiagramTask[],
    tile: IFlogoFlowDiagramTask
  }, envelope: any) {
    if (!this.raisedByThisDiagram(data.id)) {
      return;
    }
    this.data = {
      result: null,
      precedingTiles: data.previousTiles,
      precedingTilesOutputs: this.extractPrecedingTilesOutputs(data.previousTiles),
      tile: data.tile,
      tileInputInfo: this.extractTileInputInfo(data.tile || {}),
      mappings: data.tile.inputMappings ? _.cloneDeep(data.tile.inputMappings) : []
    };
    this.data.mappings = this.transformMappingsToInternalFormat(this.data.mappings);

    this.mapperContext = this.createContext(data.tile, data.previousTiles);

    this.resetState();

    this.open();

  }

  // todo: get data from event
  private createContext(inputTile: IFlogoFlowDiagramTask, outputTiles: IFlogoFlowDiagramTask[]) {
    const inputSchema = MapperTranslator.createInputSchema(inputTile);
    const outputSchema = MapperTranslator.createOutputSchema(outputTiles);
    const mappings = MapperTranslator.translateMappingsIn(inputTile.inputMappings);
    return {
      getMapFunctionsProvider(): IMapFunctionsLookup {
        return {
          getFunctions() {
            return Observable.of([]);
          },
          isValidFunction() {
            // throw new Error('not implemented');
            return true;
          },
          getFunction() {
            throw new Error('not implemented');
          }
        };
      },
      getScopedOutputSchemaProvider(): ISchemaProvider {
        return {
          getSchema: () => outputSchema
        };
      },
      getContextInputSchemaProvider(): ISchemaProvider {
        return {
          getSchema: () => inputSchema
        };
      },
      getContextData() {
        return {};
      },
      getMapping(): IMapping {
        return {
          mappings
        };
      }
    };
  }

  private extractPrecedingTilesOutputs(precedingTiles: any[]) {
    return _.chain(precedingTiles || [])
      .filter((tile: any) => {
        const attrHolder = tile.type === TASK_TYPE.TASK_ROOT ? tile : tile.attributes;
        return attrHolder && attrHolder.outputs && attrHolder.outputs.length > 0;
      })
      .map((tile: any) => {
        const name = normalizeTaskName(tile.name);
        const attrHolder = tile.type === TASK_TYPE.TASK_ROOT ? tile : tile.attributes;
        const outputs = attrHolder.outputs.map(this.mapInOutObjectDisplay);
        return [name, outputs];
      })
      .fromPairs()
      .value();
  }

  private extractTileInputInfo(tile: any) {
    return (tile.attributes && tile.attributes.inputs) ? tile.attributes.inputs.map(this.mapInOutObjectDisplay) : [];
  }

  private mapInOutObjectDisplay(inputOutput: { name: string, type: ATTRIBUTE_TYPE }) {
    let attributeType = ATTRIBUTE_TYPE[inputOutput.type];
    if (!attributeType) {
      attributeType = <string> (inputOutput.type || '');
      console.warn(`WARN! Unknown type: ${inputOutput.type}`);
    }

    return {
      name: inputOutput.name,
      type: attributeType.toLowerCase()
    };
  }

  private transformMappingsToExternalFormat(mappings: any[]) {
    const tileMap: any = {};
    _.forEach(this.data.precedingTiles, (tile: any) => {
      tileMap[normalizeTaskName(tile.name)] = {
        id: convertTaskID(tile.id),
        isRoot: tile.type === TASK_TYPE.TASK_ROOT,
        isError: tile.triggerType === ERROR_ROOT_NAME
      };
    });

    const re = REGEX_INPUT_VALUE_INTERNAL;

    mappings.forEach(mapping => {
      const matches = re.exec(mapping.value);
      if (!matches) {
        return; // ignoring it
      }

      const taskInfo = tileMap[matches[2]];
      const property = matches[3];
      let path;
      if (taskInfo.isRoot) {
        path = taskInfo.isError ? `E.${property}` : `T.${property}`;
      } else {
        path = `A${taskInfo.id}.${property}`;
      }
      const rest = matches[4] || '';
      mapping.value = `{${path}}${rest}`;
    });

    return mappings;

  }

  private transformMappingsToInternalFormat(mappings: any[]) {
    const tileMap: any = {};
    _.forEach(this.data.precedingTiles, (tile: any) => {
      let tileId: any = convertTaskID(tile.id) || undefined;
      if (tile.type === TASK_TYPE.TASK_ROOT) {
        tileId = tile.triggerType === ERROR_ROOT_NAME ? ERROR_ROOT_NAME : TILE_MAP_ROOT_KEY;
      }
      tileMap[tileId] = normalizeTaskName(tile.name);
    });

    const re = REGEX_INPUT_VALUE_EXTERNAL;

    mappings.forEach(mapping => {
      const matches = re.exec(mapping.value);
      if (!matches) {
        return; // ignoring it
      }


      let taskName = tileMap[matches[2]];
      if (!taskName) {
        const type = matches[1];
        taskName = type === 'T' ? tileMap[TILE_MAP_ROOT_KEY] : tileMap[ERROR_ROOT_NAME];
      }
      const property = matches[3];
      const rest = matches[4] || '';
      mapping.value = `${taskName}.${property}${rest}`;
    });

    return mappings;

  }

  private resetState() {
    this.isValid = true;
    this.isDirty = false;
    this.errors = null;
    this.showDeleteConfirmation = false;
    this.fieldsConnections = {};
  }

  private open() {
    this.modalState = 'visible';
  }

  private close() {
    this.modalState = 'hidden';
  }

}
