import { activitySchemaToTask, parseMapping } from './utils';

describe('Function: ParseMapping', () => {
  describe('Evaluating an activity', () => {
    beforeEach(() => {
      this.parsedMapping = parseMapping('${activity.rest_20.message}.category.id');
    });

    it('Should extract the correct attribute name', () => {
      expect(this.parsedMapping.attributeName).toEqual('message');
    });

    it('Should extract the correct taskId', () => {
      expect(this.parsedMapping.taskId).toEqual('rest_20');
    });

    it('It cannot be root', () => {
      expect(this.parsedMapping.isRoot).toEqual(false);
    });

    it('Should extract the path', () => {
      expect(this.parsedMapping.path).toEqual('category.id');
    });
  });

  describe('Evaluating a trigger', () => {
    beforeEach(() => {
      this.parsedMapping = parseMapping('${trigger.pathParams}');
    });

    it('Should extract the correct attribute name', () => {
      expect(this.parsedMapping.attributeName).toEqual('pathParams');
    });

    it('Should be root', () => {
      expect(this.parsedMapping.isRoot).toEqual(true);
    });

    it('taskId should be null', () => {
      expect(this.parsedMapping.taskId).toBeNull();
    });
  });

  describe('Bad input', () => {
    it('On Unknown Z type should return null', () => {
      expect(parseMapping('{Z.pathParams}')).toBeNull();
      expect(parseMapping('${Z.pathParams}')).toBeNull();
    });

    it('On unclosed curly braces should return null', () => {
      expect(parseMapping('${A.pathParams')).toBeNull();
      expect(parseMapping('{A.pathParams')).toBeNull();
    });
  });
});

describe('Function: activitySchemaToTask', function() {
  const schemasUnderTest = {
    normal: {
      inputs: [
        {
          name: 'flowInfo',
          type: 'boolean',
          value: 'false',
        },
        {
          name: 'addToFlow',
          type: 'boolean',
        },
      ],
    },
    mapper: {
      inputs: [
        {
          name: 'mappings',
          type: 'array',
          required: true,
          display: {
            name: 'Mapper',
            type: 'mapper',
            mapperOutputScope: 'action',
          },
        },
      ],
    },
  };

  it('Should create configurations for inputs with default values for normal activities', () => {
    const normalTask = activitySchemaToTask(schemasUnderTest.normal);
    expect(normalTask.inputMappings).toBeDefined();
    expect(normalTask.inputMappings).toEqual([
      {
        mapTo: 'flowInfo',
        type: 2,
        value: 'false',
      },
    ]);
  });

  it('Should not create configurations for inputs for normal activities', () => {
    expect(activitySchemaToTask(schemasUnderTest.mapper).inputMappings).toBeUndefined();
  });
});
