const Datastore = require('nedb');

class Database {

  constructor(options) {
    this.collection = new Datastore(options);
  }

  allDocs() {
    return this.find({});
  }

  get() {
    return Promise.resolve({});
  }

  removeAll() {
    return new Promise((resolve, reject) => {
      this.collection.remove({}, {multi: true}, function (err, numRemoved) {
        if(err) {
          reject(err)
        } else {
          resolve(numRemoved);
        }
      })
    });
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

  find(search) {
    return new Promise((resolve, reject) => {
      return this.collection.find(search, (err, docs) => {
        if(err) {
          reject(err)
        } else {
          resolve(docs)
        }
      });
    });
  }

  remove(doc) {
    const id = doc._id || null;

    return new Promise((resolve, reject) => {
      this.collection.remove({_id: id}, {}, function(err, result) {
        if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
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



