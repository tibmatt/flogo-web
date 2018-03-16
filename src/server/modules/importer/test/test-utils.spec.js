import {expect} from "chai";

class Asserter {
  constructor(isSuccessful, errors) {
    this.isSuccessful = isSuccessful;
    this.errors = errors;
  }

  assertIsSuccessful() {
    expect(this.isSuccessful).to.equal(true);
    return this;
  }

  assertIsFailed() {
    expect(this.isSuccessful).to.equal(false);
    return this;
  }
}

class AppImporterTestContext {
  constructor(importerFactory) {
    this.appImporterFactory = importerFactory;
    this.isSuccess = false;
    this.errors = null;
  }

  async importAndCreateAssert(appToImport) {
    try {
      await this.importApp(appToImport);
      this.isSuccess = true;
    } catch(errors) {
      this.isSuccess = false;
      this.errors = errors;
    }
    return this.createAssert();
  }

  async importApp(appData) {
    const importer = await this.appImporterFactory.create(appData);
    await importer.import(appData);
  }

  createAssert() {
    return new Asserter(this.isSuccess, this.errors);
  }
}

export function makeImporterContext(importerFactory) {
  return new AppImporterTestContext(importerFactory);
}
