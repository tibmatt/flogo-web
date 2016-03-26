export class FlogoTaskFieldBaseComponent{
  schema: any;
  value: any;
  parameterType: string;

  setConfiguration(fieldSchema:any, stateTask:any, parameterType:string) {
    this.schema = fieldSchema;
    this.value = '';
    this.parameterType = parameterType;

    let parameters = (parameterType === 'input') ? stateTask.inputs : stateTask.outputs;

    let stateField = parameters.find( (param:any) => {
      return param.name === fieldSchema.name;
    });

    if(stateField) {
      this.value = stateField.value;
    }
  }

  getParameterType() {
    return this.parameterType;
  }

  exportToJson() {
    return {
      "name": this.schema.name,
      "value": this.value
    }
  }

}
