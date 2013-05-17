var express = require("express");
var Hashes = require("jshashes");
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
  //app.use(express.logger());
  app.use(express.favicon());
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.engine('html', handlebars.__express);
  app.set('view engine', 'html');
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(app.router);
});

var queryString = function(req, res, next) {
  var salt_key = 'nook123';
  var json_obj = {};
  var key_list = [];
  var str = '';
   console.log("path-->"+req.path);
  for(var key in req.query) {
    if(key == '_sign' || key == '_apiKey') {
      continue;
    }
    key_list.push(key);
  };
  key_list.sort();
  key_list.forEach(function(key) {
    if(key in req.query) {
      json_obj[key] = req.query[key];
    } 
  });

  
  var timest = (new Date()).getTime();
  
  str += req.path+'/n'+JSON.stringify(json_obj);
  console.log("Server Path-->"+str);
  var MD5 = new Hashes.MD5;
  var g_sign = MD5.b64_hmac(str,salt_key);
   console.log("req-->"+req.query._sign);
  console.log('MD5 (Server)-> '+g_sign);
  if(req.query._sign == g_sign) {
    var diff = timest - parseInt(req.query.timestamp);
    console.log('diff = '+diff);
    if(!(diff > 60*60*1000 || diff < -60*60*1000)) {
      next();
    } else {
      res.json({'error':'401'});
    }
  } else {
    res.json({'error':'401'});
  }
};


app.get('/', function(req, res) {
  res.render('index', {baseHref:config.site.baseUrl});
});

app.get('/reg/:table',queryString, regnudb.list_table);
//app.get('/reg/:table', regnudb.list_table);
app.get('/hrnu/:table', hrnudb.list_table);
app.get('/gradnu/:table', gradnudb.list_table);
app.post('/gradnu/:table', queryString, gradnudb.insert_table);
app.put('/gradnu/:table', queryString, gradnudb.update_table);
//app.post('/gradnu/:table', gradnudb.insert_table);
//app.put('/gradnu/:table', gradnudb.update_table);

app.listen(config.site.port||30000);
console.log("Mongo Express server listening on port " + (config.site.port||30000));

