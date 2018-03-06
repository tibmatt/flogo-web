import { expect } from 'chai';
import { StandardTaskConverter } from './standard-task-converter';

describe('importer.standard.StandardTaskConverter', function () {
  describe('#converAttributes', function () {
    it('should set the default value for empty fields', function () {
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
      expect(convertedAttributes).to.have.length(3);
      expect(
        convertedAttributes.map(attribute => [attribute.name, attribute.value]))
        .to.deep.include.members([
          ['foo', ''],
          ['bar', []],
          ['baz', 'hello world'],
        ]);
    });
  });
});
