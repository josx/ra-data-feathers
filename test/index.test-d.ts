import { restClient } from "../lib";
import { expectType, expectError } from 'tsd';

interface IFunctionResult {
  (type: any, resource: any, params: any): any
}

const configIdandPatch = {
  id: "_id", // In this example, the database uses '_id' rather than 'id'
  usePatch: true, // Use PATCH instead of PUT for updates
}

expectType<IFunctionResult>(restClient(null, configIdandPatch));

const configFull = {
  id: 'id', // If your database uses an id field other than 'id'. Optional.
  usePatch: false, // Use PATCH instead of PUT for UPDATE requests. Optional.
  my_resource: { // Options for individual resources can be set by adding an object with the same name. Optional.
    id: 'id', // If this specific table uses an id field other than 'id'. Optional.
  },
  /* Allows to use custom query operators from various feathers-database-adapters in GET_MANY calls.
   * Will be merged with the default query operators ['$gt', '$gte', '$lt', '$lte', '$ne', '$sort', '$or', '$nin', '$in']
   */
  customQueryOperators: []
};

expectType<IFunctionResult>(restClient(null, configFull));

// this will be ignored and use default value instead
const configUnexpected = {
  randomly: 1
};

expectType<IFunctionResult>(restClient(null, configUnexpected));
