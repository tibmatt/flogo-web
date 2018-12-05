import { ActionsImporter } from './actions-importer';

describe('importer.legacy.ActionsImporter', () => {
  const legacyActionImporter = new ActionsImporter({}, []);

  test('should return empty array for undefined actions', () => {
    let formattedAction = legacyActionImporter.extractActions({
      id: 'a',
      name: 'my app',
    });
    expect(formattedAction).toBeInstanceOf(Array);
    expect(formattedAction).toHaveLength(0);
  });
});
