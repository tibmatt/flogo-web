/**
 * The FloGo task
 */
export interface FGTask {
  id: string; // id of the task
  name: string; // name of the task
  attrs: {
    inputs: FGTaskInputs,
    outputs: FGTaskOutputs
  };
}

export interface FGTaskDictionary {
  [ index: string ]: FGTask;
}

export interface FGTaskInputs {
  [ paramKey: string ]: any
}

export interface FGTaskOutputs {
  [ paramKey: string ]: any
}
