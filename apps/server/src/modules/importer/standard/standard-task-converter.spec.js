import { expect } from 'chai';
import { StandardTaskConverter } from './standard-task-converter';

describe('importer.standard.StandardTaskConverter', () => {
  describe('#convertAttributes', () => {
    test('should prepare one entry in the attributes', () => {
      const sourceTask = {
        activity: {
          input: {
            baz: 'hello world',
          },
        },
      };
      const activitySchema = {
        inputs: [
          { name: 'foo', type: 'string' },
          { name: 'bar', type: 'array' },
          { name: 'baz', type: 'string' },
        ],
      };
      const taskConverter = new StandardTaskConverter(sourceTask, activitySchema);

      const convertedAttributes = taskConverter.convertAttributes();
      expect(convertedAttributes).to.have.length(1);
      expect(
        convertedAttributes.map(attribute => [attribute.name, attribute.value]))
        .to.deep.include.members([
          ['baz', 'hello world'],
        ]);
    });

    test(
      'should take task\'s input value on priority before schema\'s default values',
      () => {
        const sourceTask = {
          activity: {
            input: {
              baz: 'hello world',
            },
          },
        };
        const activitySchema = {
          inputs: [
            { name: 'foo', type: 'string' },
            { name: 'bar', type: 'array' },
            { name: 'baz', type: 'string', value: 'baz defaulted' },
          ],
        };
        const taskConverter = new StandardTaskConverter(sourceTask, activitySchema);

        const convertedAttributes = taskConverter.convertAttributes();
        expect(convertedAttributes).to.have.length(1);
        expect(
          convertedAttributes.map(attribute => [attribute.name, attribute.value]))
          .to.deep.include.members([
            ['baz', 'hello world']
          ]);
      }
    );
  });
});
