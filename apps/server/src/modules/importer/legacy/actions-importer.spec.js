import {ActionsImporter} from "./actions-importer";

describe("importer.legacy.ActionsImporter", () => {
  const legacyActionImporter = new ActionsImporter({},[]);

  test('should return empty array for undefined actions', () => {
    let formattedAction = legacyActionImporter.extractActions({ id: 'a', name: 'my app' });
    expect(formattedAction).to.be.an('array').toHaveLength(0);
  });
});
