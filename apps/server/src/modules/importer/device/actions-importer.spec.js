import { ActionsImporter } from './actions-importer';

describe('importer.device.ActionsImporter', () => {
  const mockActivityRef = 'github.com/TIBCOSoftware/flogo-contrib/device/activity/setpin';
  const activitySchema = getActivitySchemaMock();
  const deviceActionsImporter = new ActionsImporter({}, [activitySchema]);

  describe('#formatAction', () => {
    let mockTask;
    let mockLink;
    let mockAction;
    beforeEach(() => {
      mockLink = { id: 1, from: 2, to: 3, type: 0 };
      mockTask = {
        id: 2,
        name: 'Set Pin',
        description: 'Simple Device Set Pin Activity',
        type: 1,
        activityRef: mockActivityRef,
      };
      mockAction = {
        id: 'a',
        name: 'my action',
        data: {
          flow: {
            links: [mockLink],
            tasks: [mockTask],
          },
        },
      };
    });

    test('should account for empty actions', () => {
      let formattedAction = null;
      expect(() => {
        formattedAction = deviceActionsImporter
          .formatAction({ id: 'a', name: 'my action' });
      }).not.toThrowError();
      expect(formattedAction).toMatchObject({ id: 'a', name: 'my action' })
    });

    test('should set the id as name if name is not provided', () => {
      const formattedAction = deviceActionsImporter
        .formatAction({ id: 'myCoolAction', data: {} });
      expect(formattedAction.name).toBe('myCoolAction');
    });

    test('should convert tasks and links into a root task', () => {
      const actionToTest = {
        ...mockAction,
        data: {
          flow: {
            ...mockAction.data.flow,
            tasks: [
              { ...mockTask },
              { ...mockTask, id: 3 },
            ],
          },
        },
      };
      const formattedAction = deviceActionsImporter.formatAction(actionToTest);
      expect(formattedAction)
        .toMatchObject({ id: 'a', name: 'my action' });
      expect(formattedAction)
        .toHaveProperty('tasks');
      expect(formattedAction)
        .toHaveProperty('links');

      expect(Array.isArray(formattedAction.links)).toBe(true);
      expect(formattedAction.links).toContain(mockLink);
      expect(Array.isArray(formattedAction.links)).toBe(true);
      expect(formattedAction.tasks).toHaveLength(2);
      const taskIds = formattedAction.tasks.map(task => task.id);
      expect(taskIds).toEqual(expect.arrayContaining([2, 3]));
    });
  });

  describe('#mapTask', () => {
    const context = { taskProps: null, mappedTask: null };
    beforeAll(() => {
      context.taskProps = {
        id: 2,
        name: 'Set Pin',
        description: 'Simple Device Set Pin Activity',
        type: 1,
        activityRef: mockActivityRef,
      };
      context.mappedTask = deviceActionsImporter.mapTask({
        ...context.taskProps,
        attributes: {
          pin: 25,
          digital: true,
        },
      });
    });

    test('should correctly map a task to the internal model', () => {
      expect(context.mappedTask).toMatchObject(context.taskProps);
      expect(Array.isArray(context.mappedTask.attributes)).toBe(true);
      expect(context.mappedTask.attributes).toHaveLength(3);
    });

    test(
      'should correctly match the task attributes with its corresponding activity schema',
      () => {
        expect(context.mappedTask.attributes).toEqual(
          expect.arrayContaining([
            { name: 'pin', type: 'int', value: 25 },
            { name: 'digital', type: 'boolean', value: true }
          ])
        );
      }
    );

    test(
      'should add those attributes defined in the activity schema but not provided by the activity',
      () => {
        expect(context.mappedTask.attributes).toEqual(
          expect.arrayContaining([
            { name: 'value', type: 'int', value: '' }
          ])
        );
      }
    );
  });

  function getActivitySchemaMock() {
    return {
      name: 'tibco-device-setpin',
      type: 'flogo:device:activity',
      ref: 'github.com/TIBCOSoftware/flogo-contrib/device/activity/setpin',
      version: '0.0.1',
      title: 'Set Pin',
      description: 'Simple Device Set Pin Activity',
      settings: [
        {
          name: 'pin',
          type: 'int',
        },
        {
          name: 'digital',
          type: 'boolean',
        },
        {
          name: 'value',
          type: 'int',
        },
      ],
      device_support: [
        {
          framework: 'arduino',
          template: 'setpin.ino.tmpl',
          devices: [],
        },
      ],
    };
  }

});
