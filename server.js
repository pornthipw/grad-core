var express = require("express");
var handlebars = require('hbs');
var config = require('./config');
var regnu = require('./db/regnu');
var hrnu = require('./db/hrnu');
var gradnu = require('./db/gradnu');

var app = express();

var regnudb = new regnu.regnu(config);
var hrnudb = new hrnu.hrnu(config);
var gradnudb = new gradnu.gradnu(config);

app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.favicon());
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.engine('html', handlebars.__express);
  app.set('view engine', 'html');
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
});

app.get('/', function(req, res) {
  res.render('index', {baseHref:config.site.baseUrl});
});

app.get('/reg/:table', regnudb.list_table);
app.get('/hrnu/:table', hrnudb.list_table);
app.get('/gradnu/:table', gradnudb.list_table);

app.listen(config.site.port||30000);
console.log("Mongo Express server listening on port " + (config.site.port||30000));

