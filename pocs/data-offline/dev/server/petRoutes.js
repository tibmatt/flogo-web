var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var db = monk('localhost/pets');
var pets = wrap(db.get("pets"));

// for tests
module.exports.pets = pets;


module.exports.addPet = function *addPet() {
  var petFromRequest = yield parse(this);
  var newPet = JSON.parse(petFromRequest);
  console.dir(petFromRequest);

  // TODO add simple schema
  /*
  if(!petFromRequest.name) {
    this.throw(400, "name required");
  }
  */

  var insertedPet = yield pets.insert(newPet);

  //this.set("location", "/pet/" + insertedPet._id);
  this.body = insertedPet;
  this.status = 200;
};

module.exports.getPet = function *getPet(id) {
  var pet = yield pets.findById(id);

  this.body = pet;
  this.status = 200;
};

module.exports.getPets = function *getPets(id) {
  var list = yield pets.find(id);

  this.body = list;
  this.status = 200;
};

module.exports.updatePet = function *updatePet(id) {
  var petFromRequest = yield parse(this);

  yield pets.updateById(id, petFromRequest);

  this.set("location", "/pets/" + id);
  this.status = 204;
};

module.exports.deletePet = function *deletePet(id) {
  yield pets.remove({id:id});
  this.status = 200;
};
