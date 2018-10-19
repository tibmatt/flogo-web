import { expect } from 'chai';
import { StandardTaskConverter } from './standard-task-converter';

describe('importer.standard.StandardTaskConverter', function () {
  describe('#convertAttributes', function () {
    it('should prepare one entry in the attributes', function () {
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

    it('should prepare attributes from activity input and schema with default values', function () {
      const sourceTask = {
        activity: {
          input: {
            baz: 'hello world',
          },
        },
      };
      const activitySchema = {
        inputs: [
          { name: 'foo', type: 'string', value: 'foo defaulted' },
          { name: 'bar', type: 'array' },
          { name: 'baz', type: 'string' },
        ],
      };
      const taskConverter = new StandardTaskConverter(sourceTask, activitySchema);

      const convertedAttributes = taskConverter.convertAttributes();
      expect(convertedAttributes).to.have.length(2);
      expect(
        convertedAttributes.map(attribute => [attribute.name, attribute.value]))
        .to.deep.include.members([
          ['baz', 'hello world'],
          ['foo', 'foo defaulted']
        ]);
    });

    it('should take task\'s input value on priority before schema\'s default values', function () {
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
    });
  });
});
