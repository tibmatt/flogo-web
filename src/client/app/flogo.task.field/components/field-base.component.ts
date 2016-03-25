export class FlogoTaskFieldBaseComponent{
  schema: any;
  stateField: any;

  setConfiguration(fieldSchema:any, stateTask:any, parameterType:string) {
    this.schema = fieldSchema;

    var parameters = (parameterType === 'input') ? stateTask.inputs : stateTask.outputs;

    this.stateField = parameters.find( (param:any) => {
      return param.name === fieldSchema.name;
    });

  }

}
