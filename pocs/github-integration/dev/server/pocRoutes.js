
module.exports.index = function *index() {
  if(!this.session.user) {
    this.redirect('/login');
    return;
  }

  var user = this.session.user || {login:'', avatar_url: ''};

  this.render('home.jade', {
    login: user.login,
    avatar_url: user.avatar_url
  });
};

module.exports.login = function *login() {
  this.render('login.jade', {
    pageTitle: 'Koa-jade: a Jade middleware for Koa'
  });
};

module.exports.logout = function *logout() {
  delete this.session.user;
  delete this.session.githubToken;
  this.redirect('/login');
};

module.exports.getGithubToken = function *getGithubToken() {
  var token = {token: ''};

  if(this.session.githubToken) {
    token = {token: this.session.githubToken};
  }

  this.body = token;
};


