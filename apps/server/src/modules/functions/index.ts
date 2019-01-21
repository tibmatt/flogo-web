import {ContributionsService} from "../contribs";
import {functionsDBService} from "../../common/db";
import get from "lodash/get";

class FunctionManagerImpl implements ContributionsService {

  find(terms?) {
    terms = terms || {};

    return functionsDBService.db
      .find(terms)
      .then(result => (result || []).map(functionRow => prepareForOutput(functionRow)));
  }
}

export const FunctionManager = new FunctionManagerImpl();

function prepareForOutput(functionRow) {
  // this is a legacy
  return Object.assign(
    { id: functionRow.id || functionRow._id },
    { ref: functionRow.ref, homepage: get(functionRow, 'schema.homepage', '') },
    functionRow.schema
  );
}
