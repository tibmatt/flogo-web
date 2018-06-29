import { isEqual } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { OperatorFunction } from 'rxjs/interfaces';
import { pipe } from 'rxjs/util/pipe';
import { combineLatest, distinctUntilChanged, distinctUntilKeyChanged, map, shareReplay } from 'rxjs/operators';

import { MapExpression, MapperState, TreeState } from '../../models';

function selectFromMapperState<T extends keyof MapperState>(property: T):
  OperatorFunction<MapperState, MapperState[T]> {
  return pipe(
    distinctUntilKeyChanged<MapperState>(property),
    map((state: MapperState) => state[property]),
  );
}

export const selectedInputKey = selectFromMapperState('mappingKey');
export const selectInputsState = selectFromMapperState('inputs');
export const selectMappings = selectFromMapperState('mappings');

export const selectFunctionsState = selectFromMapperState('functions');
export const selectOutputsState = selectFromMapperState('outputs');

function selectFromTreeState<P extends keyof TreeState>(propName: P) {
  return function(source: Observable<TreeState>) {
    return source.pipe(
      map(treeState => treeState[propName]),
      distinctUntilChanged(),
    );
  };
}

export const selectNodesFromOutputs = pipe(
  selectOutputsState,
  selectFromTreeState('nodes'),
);

export const selectFilterFromOutputs = pipe(
  selectOutputsState,
  selectFromTreeState('filterTerm'),
);

export const selectNodesFromFunctions = pipe(
  selectFunctionsState,
  selectFromTreeState('nodes'),
);

export const selectFilterFromFunctions = pipe(
  selectFunctionsState,
  selectFromTreeState('filterTerm'),
);

export const selectInputFilter: OperatorFunction<MapperState, string | null> = pipe(
  selectInputsState,
  map((inputsState) => inputsState.filterTerm)
);

export const selectInputNodes = pipe(
  selectInputsState,
  map((inputsState: MapperState['inputs']) => inputsState.nodes),
);

export const selectInputsList = pipe(
  selectInputNodes,
  map(inputs => Object.values(inputs)),
);

interface EditingExpression {
  currentKey: string;
  expression?: string;
}
export const selectCurrentEditingExpression = (source: Observable<MapperState>): Observable<null | EditingExpression> => {
  const sharedSource: Observable<MapperState> = source.pipe(shareReplay());
  return sharedSource
    .pipe(
      selectedInputKey,
      combineLatest(
        sharedSource.pipe(selectMappings),
        (currentKey, mappings) => {
          if (!currentKey) {
            return null;
          }
          const nodeMappings = mappings[currentKey] || <MapExpression>{};
          return {
            currentKey,
            expression: nodeMappings.expression,
          };
        },
      ),
      distinctUntilChanged(isEqual),
    );
};

export const selectCurrentNode = (source: Observable<MapperState>) => {
  const sharedSource = source.pipe(shareReplay());
  return sharedSource
    .pipe(
      selectedInputKey,
      combineLatest(
        sharedSource.pipe(selectInputNodes),
        (currentNodeKey, nodes) => currentNodeKey && nodes ? nodes[currentNodeKey] : null,
      ),
      distinctUntilChanged(),
    );
};

export const selectFilteredNodes = (source: Observable<MapperState>) => {
  const sharedSource = source.pipe(shareReplay());
  return source.pipe(
    selectInputFilter,
    combineLatest(
      sharedSource.pipe(selectInputsList),
      (filterTerm: string, inputs) => {
        if (!filterTerm || !filterTerm.trim()) {
          return inputs;
        }
        filterTerm = filterTerm.trim().toLowerCase();
        return inputs.filter(inputNode => inputNode.label.toLowerCase().includes(filterTerm));
      }),
  );
};

