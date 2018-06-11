interface GroupState {
  isValid: boolean;
  isDirty: boolean;
}
export function applyGroupProperty<TState extends GroupState, PName extends keyof TState>(
  group: TState,
  propertyName: PName,
  newValue: TState[PName],
): TState {
  if (group[propertyName] !== newValue) {
    return {
      // have to typecast due to https://github.com/Microsoft/TypeScript/issues/13557
      ...(<any>group),
      [propertyName]: newValue,
    };
  }
  return group;
}

export function reduceGroupStatus<T extends GroupState>(groupState: T, fromFields: GroupState[]): T {
  const status = calculateGroupStatus(fromFields);
  groupState = applyGroupProperty(groupState, 'isValid', status.isValid);
  groupState = applyGroupProperty(groupState, 'isDirty', status.isDirty);
  return groupState;
}

export function calculateGroupStatus(fields: GroupState[]) {
  return {
    isValid: !!fields.find(field => field.isValid),
    isDirty: !!fields.find(field => field.isDirty),
  };
}
