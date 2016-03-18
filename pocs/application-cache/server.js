var koa = require('koa');
var serve = require('koa-static');

var app = module.exports = koa();

app.keys = ['key1', 'key2'];


app.use(serve(__dirname + '/app'));

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Koa listening on port 3000');



