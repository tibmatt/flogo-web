var koa = require('koa');
var serve = require('koa-static');
var routes = require('koa-route');

var app = module.exports = koa();


var petRoutes = require("./petRoutes.js");

app.use(routes.post("/pet", petRoutes.addPet));
app.use(routes.get("/pets",petRoutes.getPets));
app.use(routes.get("/pet/:id",petRoutes.getPet));
app.use(routes.put("/pet/:id", petRoutes.updatePet));
app.use(routes.del("/pet/:id", petRoutes.deletePet));


app.use(serve(__dirname + '/../../build-app'));
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Koa listening on port ' + port);



