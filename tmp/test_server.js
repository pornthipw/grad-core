var express = require('express');
var Hashes = require("jshashes");
var handlebars = require('hbs');
var http = require('http');
var fs = require('fs');
var os  = require('os');
var read = fs.readFileSync;
//var str = read('./ui.css', 'utf8');

var request = require("request").defaults({ encoding: null });

var config = require('./config_test');
var app = express();


app.configure(function () {
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


var time = process.hrtime();

//setInterval(tick1, 2000);
//setInterval(tick, 2000);

console.log(os.type());
console.log(os.arch());
console.log(os.release());

console.log(process.version);

function tick1() {
  var options = {
    host: 'www.db.grad.nu.ac.th',
    port: 80,
    path: '/apps/core/#/bibtex'
    //path: '/apps/core/reg/LEVELID'
  };

    http.get(options, function(res) {
      console.log("Got response: " + res.statusCode);
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
    var diff = process.hrtime(time);  
    //var stream = fs.createWriteStream("my_file.txt");
    //stream.once('open', function(fd) {
        //stream.write("My first row\n");
        //stream.write("My second row\n");
        //stream.write(" diff[0] " + diff[0] + "  -   " + diff[1] + " diff[1] ");
        //stream.end();
    //});
    //console.log(Date.now());
    var str = diff[0] + "  -   " + diff[1] + " \n";
    fs.open('my_file.txt', 'a', 666, function( e, id ) {
      //fs.write( id, 'string to append to file', null, 'utf8', function(){
      fs.write(id,str,null,'utf8',function(){
        fs.close(id, function(){
          //console.log('file closed');
        });
      });
    });

    console.log(" diff[0] " + diff[0] + "  -   " + diff[1] + " diff[1] ");
    time = process.hrtime();  
};

      //time = (stop[0]*1e9 + stop[1])/1e6;
      //console.log(res.headers);
      //console.dir(res);
      
  var pool = require('generic-pool').Pool({
        name     : 'http_request',
        create   : function(callback) {
            var c = http.createClient(80, 'www.db.grad.nu.ac.th');
            callback(null, c);
        },
        destroy  : function(client) { },
        max      : 10,
        idleTimeoutMillis : 300,
        log : false
  });
  var now = new Date().toISOString().replace(/T+/g, ' ').replace(/\..+/, '') ; 
  console.log(now);
  for(var i = 0; i < 2000; i++) {
    pool.acquire(function(err, client) {
         //var request = client.request("GET", '/');
         var request = client.request("GET",'/apps/core/bibtex/bibtex_enrty');
         request.end();
         request.on('response', function(response) {
              console.log(response.statusCode);
              //console.log(res.headers);
              //console.dir(res);
              var now = new Date().toISOString().replace(/T+/g, ' ').replace(/\..+/, '') ; 

              var diff = process.hrtime(time);  
              var str = diff[0] + "  -   " + diff[1]/1e9 + "  -  " + now + " \n";
              fs.open('my_file.txt', 'a', 666, function( e, id ) {
                   fs.write(id,str,null,'utf8',function(){
                        fs.close(id, function(){
                          console.log(now);
                          console.log(" diff[0] " + diff[0] + "  -   " + diff[1]/1e9 + " diff[1] ");
                          time = process.hrtime();  
                          pool.release(client);
                        });
                   });
              });
              
              //console.log(now);
              //console.log(" diff[0] " + diff[0] + "  -   " + diff[1]/1e9 + " diff[1] ");
              //time = process.hrtime();  
              //pool.release(client);
         });
    });
  }
    
app.listen(config.site.port||4001);

console.log("Mongo Express server listening "+ (config.site.baseUrl) +" on port " + (config.site.port||4001));


