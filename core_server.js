var express = require("express");
var Hashes = require("jshashes");
var handlebars = require('hbs');
var config = require('./config');
var regnu = require('./db/regnu');
var regnutest = require('./db/regnutest');
var hrnu = require('./db/hrnu');
var gradnu = require('./db/gradnu');

var app = express();

var regnudb = new regnu.regnu(config);
var regnudbtest = new regnutest.regnu(config);
var hrnudb = new hrnu.hrnu(config);
var gradnudb = new gradnu.gradnu(config);

app.configure(function() {
  //app.use(express.cookieParser());
  app.use(express.bodyParser());
  //app.use(express.logger());
  app.use(express.favicon());
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.engine('html', handlebars.__express);
  app.set('view engine', 'html');
  app.use(express.methodOverride());
  //app.use(express.session({ secret: 'keyboard cat' }));
  app.use(app.router);
});


var queryString = function(req, res, next) {
  var salt_key = 'RimbrpN1979';
  var json_obj = {};
  var json_obj_test = {};
  var key_list = [];
  var str = '';
  var client = [];
  var p = "";

  console.log(req.params);
  console.log(req.query);
  if (req.query._sign) {
    client = req.query;
    console.log("q-test--"+client);
  } else {
    if (req.body._sign) {
      client = req.body; 
      console.log("b-test--"+client);
      //console.log(req.body);
    }else{
      client = req.params; 
      console.log("c-test--"+client);
    }
  }
   
  console.log("path-->"+req.path);

  //for(var key in req.query) {
  for(var key in client) {
    console.log(key);
    if(key == '_sign' || key == '_apiKey') {
      continue;
    }
    key_list.push(key);
  };
  key_list.sort();
  key_list.forEach(function(key) {
   console.log("key-->"+key);
    json_obj[key] = client[key];
  });

  
  var timest = (new Date()).getTime();
  
  //str += p+'/n'+JSON.stringify(json_obj);
  str += req.path+'/n'+JSON.stringify(json_obj);
  console.log("Server Path-->"+str);
  var MD5 = new Hashes.MD5;
  var g_sign = MD5.b64_hmac(str,salt_key);

  console.log("req-->"+client._sign);

  console.log('MD5 (Server)-> '+g_sign);
  //if(req.query._sign == g_sign) {
  if(client._sign == g_sign) {
   // var diff = timest - parseInt(req.query.timestamp);
    var diff = timest - parseInt(client.timestamp);
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





app.get('/',function(req, res) {
  res.render('index', {baseHref:config.site.baseUrl});
});


app.get('/auth',queryString, function(req,res) {
  res.json({'success':true,'error':null});
});

//app.get('/reg/:table',queryString, regnudb.list_table);

app.get('/reg/:table',regnudb.list_table);
app.get('/regnutest/:table',regnudbtest.list_table);

//app.get('/reg/:id',regnudb.get_table);
app.get('/hrnu/:table', hrnudb.list_table);
app.get('/gradnu/:table', gradnudb.list_table);
app.post('/gradnu/:table', queryString, gradnudb.insert_table);
app.put('/gradnu/:table', queryString, gradnudb.update_table);

app.post('/gradnu/:table/delete', queryString, gradnudb.delete_table ); 

app.post('/bibtex/create',gradnudb.insert_bibtex);
app.get('/bibtex/:id',gradnudb.get_bibtex);


app.get('/test/:num',queryString, function(req, res) {
  var ret = {'value':0};
  if(req.params.num) {
    ret['value']=parseInt(req.params.num)+1;
  }
  res.json(ret);
});

app.get('/test/noauth/:num',function(req, res) {
  
  var ret = {'value':0};
  if(req.params.num) {
    console.log(req.params.num);
    ret['value']=parseInt(req.params.num)+1;
  }
  res.json(ret);
});

app.listen(config.site.port||30001);
console.log("Mongo Express server listening on port " + (config.site.port||30001));

