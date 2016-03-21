import { TASKS, DIAGRAM } from '../mock';
import { FGDiagram, FGTaskDictionary } from '../models';
import { Injectable } from 'angular2/core';

@Injectable( )
export class FGTaskService {

  getTasks( ): Promise < FGTaskDictionary > {
    return Promise.resolve( TASKS );
  }

  getDiagram( ): Promise < FGDiagram > {
    return Promise.resolve( DIAGRAM );
  }

}
