import koa from 'koa';
import koaStatic from 'koa-static';
import router from 'koa-router';
import bodyparser from 'koa-bodyparser';

let app = koa();
let port = process.env.PORT || 3010;

// logger
app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

app.use(function *(next){
  var path = this.path.endsWith('/')? this.path.substring(0, this.path.length - 1): this.path;

  if(!/\/[^\/]+\.[^.\/]+$/i.test(path)&&!path.toLowerCase().startsWith('/api/')){
    this.path='/';
  }
  yield  next;
});

app.use(koaStatic("../public"));
app.use(bodyparser());

app.listen(port);

