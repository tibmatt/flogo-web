var koa = require('koa');
var http = require('http');
var serve = require('koa-static');
var session = require('koa-generic-session');
var githubAuth = require('koa-github');
var routes = require('koa-route');
var co =require('co');
var fs = require('co-fs');
var koaJade = require('koa-jade');
var path = require('path');
var json = require('koa-json');

var app = module.exports = koa();
var pocRoutes = require('./pocRoutes.js');

app.use(json());

var jade = new koaJade({
  viewPath: path.resolve(__dirname, 'views'),
  debug: true,
  helperPath: [
    path.resolve(__dirname, 'helpers'),
    { _: require('lodash') }
  ],
  locals: {
    page_title: 'Koa-jade example',
    author: 'Chris Yip'
  },
  app: app
});

// Read github credentials temporarily from file
//TODO uncomment on deploy
/*
var gitHubCredentials = null;

co(function *(){
  var fileContent = yield fs.readFile(__dirname + '/github-credentials.json', 'utf8');
  return Promise.resolve(fileContent);
}).then(function (value) {
  gitHubCredentials = JSON.parse(value);
}, function (err) {
  console.error('Error reading credentials file');
  console.error(err.stack);
});
*/
//-----------------------

app.name = 'poc-github';
app.keys = ['key1', 'key2'];

app.use(session());
app.use(githubAuth({
  clientID: 'fda0d38213dc0fc9340b',
  clientSecret: 'bca47af67b0b33574cc6f7d3de10c2b60da12833',
  callbackURL: 'http://localhost:3000/github/auth/callback',
  userKey: 'user',
  scope: ['user','repo'],
  timeout: 10000
}));

/*
app.use(function *handler() {
  console.log(this.request.url);

  if (!this.session.githubToken) {
    this.body = '<a href="/github/auth">login with github</a>';
  } else {
    this.body = this.session.user;
  }
});
 */

app.use(routes.get('/', pocRoutes.index));
app.use(routes.get('/login', pocRoutes.login));
app.use(routes.get('/logout', pocRoutes.logout));
app.use(routes.get('/githubtoken', pocRoutes.getGithubToken));


app.use(serve(__dirname + '/../../build-app'));

app.listen(3000);
console.log('Koa listening on port 3000');



