var restify = require('restify');
var mongoose = require('mongoose');
var config = require('./app/config.js')

var port = process.env.PORT || 7070;
var mongoURI = process.env.MONGOLAB_URI || config.db;
var db = mongoose.connect(mongoURI);
var Schema = mongoose.Schema;


var server = restify.createServer({
  name: 'palette-restify',
  version: '1.0.0'
});

/*
//getting this error using the below
http.js:853
    throw new TypeError('first argument must be a string or Buffer');
*/

/*var server = restify.createServer({
    formatters: {
        'application/json': function(req, res, body){
            if(req.params.callback){
                var callbackFunctionName = req.params.callback.replace(/[^A-Za-z0-9_\.]/g, '');
                return callbackFunctionName + "(" + JSON.stringify(body) + ");";
            } else {
                return JSON.stringify(body);
            }
        },
        'text/html': function(req, res, body){
            return body;
        }
    }
});*/

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


// Create a schema for our data
var PaletteSchema = new Schema({
  name: String,
  hexList: Array
});

// Use the schema to register a model
mongoose.model('Palettes', PaletteSchema);
var PaletteMongooseModel = mongoose.model('Palettes'); // just to emphasize this isn't a Backbone Model

/*var palette1 = new PaletteMongooseModel({
  name: 'first palette',
  hexList: ["#1BE0FA", "#E780FF", "#FCD253", "#8082FF", "#DEE7DB", "#FFFFFF", "#2C2C2C", "#000000"]
});
palette1.save();*/


var getAllPalettes = function(req, res, next){
  // Resitify currently has a bug which doesn't allow you to set default headers
  // This headers comply with CORS and allow us to mongodbServer our response to any origin
  res.header( 'Access-Control-Allow-Origin', '*' );
  res.header( 'Access-Control-Allow-Method', 'POST, GET, PUT, DELETE, OPTIONS' );
  res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-File-Name, Content-Type, Cache-Control' );
  
  if( 'OPTIONS' == req.method ) {
    res.send( 203, 'OK' );
  }
  //console.log(req);
  //console.log("mongodbServer getAllPalettes");

  PaletteMongooseModel.find(function (arr,data) {
   // .sort('date', -1)
    res.send(data);
  });
}

var getPaletteByID = function (req, res, next) {
  res.send(req.params);
  return next();
}

server.get( config.baseAPIPath +'/palette/:id', getPaletteByID);
server.get( config.baseAPIPath +'/palettes', getAllPalettes);


server.listen(port, function () {
  console.log('%s listening at %s', server.name, server.url);
});