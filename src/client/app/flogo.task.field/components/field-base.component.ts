export class FlogoTaskFieldBaseComponent{
  schema: any;
  value: any;
  fieldSubject: any;
  parameterType: string;

  onChangeField() {
    this.fieldSubject.next('changing field');
  }

  setConfiguration(fieldSchema:any, stateTask:any, parameterType:string, fieldSubject:any) {
    this.schema = fieldSchema;
    this.value = '';
    this.fieldSubject = fieldSubject;
    this.parameterType = parameterType;

    let parameters = (parameterType === 'input') ? (stateTask.inputs || []) : (stateTask.outputs || []);

    let stateField = parameters.find( (param:any) => {
      return param.name === fieldSchema.name;
    });

    if(stateField) {
      if(fieldSchema.type === 'object') {
        this.value = JSON.stringify(stateField.value, null, 2);
      } else {
        this.value = stateField.value;
      }
    }
  }

  getParameterType() {
    return this.parameterType;
  }

  exportToJson() {
    //if(this.schema.type === 'object') {
    //  debugger;
    //}

    return {
      [this.schema.name]: this.value
    }
  }

}
