const Datastore = require('nedb');

function defer() {
  const defered = {};
  defered.promise = new Promise((resolve, reject) => {
    defered.callback = (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    };
  });
  return defered;
}

export class Database {

  constructor(options, indexes = []) {
    this.collection = new Datastore(options);
    indexes.forEach(index => this.collection.ensureIndex(index));
  }

  allDocs() {
    return this.find({});
  }

  get() {
    return Promise.resolve({});
  }

  insert(data) {
    const deferred = defer();
    this.collection.insert(data, deferred.callback);
    return deferred.promise;
  }

  removeAll() {
    const deferred = defer();
    this.collection.remove({}, { multi: true }, deferred.callback);
    return deferred.promise;
  }

  insertBulk(items) {
    return new Promise((resolve, reject) => {
      this.collection.insert(items, function (err, newDocs) {
        if(err) {
          reject(err)
        } else {
          resolve(newDocs);
        }
      });
    });
  }

  find(query, projection = {}) {
    const deferred = defer();
    this.collection.find(query, projection, deferred.callback);
    return deferred.promise;
  }

  findOne(query, projection = {}) {
    const deferred = defer();
    this.collection.findOne(query, projection, deferred.callback);
    return deferred.promise;
  }

  update(query, update, options) {
    const deferred = defer();
    const args = Array.prototype.slice.call(arguments);
    args.push(deferred.callback);
    this.collection.update.apply(this.collection, args);
    return deferred.promise;
  }

  remove(query, options) {
    const deferred = defer();
    const args = Array.prototype.slice.call(arguments);
    args.push(deferred.callback);
    this.collection.remove.apply(this.collection, args);
    return deferred.promise;
  }

  put(doc) {
    const id = doc._id || null;

    return new Promise((resolve, reject) => {
      this.collection.update({_id: id}, doc, {upsert: true}, function(err, result) {
        if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  bulkDocs(docs) {
    throw new Error('Bulk method not implemented');
  }

}

export class DatabaseService {
  constructor() {
    this.db = new Database({autoload: true});
  }

  init() {
    return Promise.resolve(this.collection);
  }
}



