import {ActionsImporter} from "./actions-importer";
import {expect} from "chai";

describe("importer.legacy.ActionsImporter", () => {
  const legacyActionImporter = new ActionsImporter({},[]);

  test('should return empty array for undefined actions', () => {
    let formattedAction = legacyActionImporter.extractActions({ id: 'a', name: 'my app' });
    expect(formattedAction).to.be.an('array').of.length(0);
  });
});
