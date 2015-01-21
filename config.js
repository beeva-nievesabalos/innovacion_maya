//config.js

/*
 * Configuration SERVER params
 */
/**
 * EXPRESS : Module dependencies.
 */
var express = require('express')
	, stylus = require('stylus')
 	, nib = require('nib')
  , routes = require('./routes')
  , appconf = require('./agents/googleapis/googleappconfig')
  , path = require('path')
  , examples = require('./db/examples')
  , person = require('./db/person')
  , books = require('./db/books')
  , neo4j = require('./db/neo4j');

var server =  express();

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

// all environments
server.set('port', process.env.PORT || 4000);
server.set('views', __dirname + '/views');
server.set('view engine', 'jade');
server.use(express.favicon());
server.use(express.logger('dev'));
server.use(express.bodyParser());
server.use(express.methodOverride());
server.use(server.router);
server.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
server.use(express.static(path.join(__dirname, 'public')));

if ('development' == server.get('env')) {
	server.use(express.errorHandler());
}

// REST GENERALES
server.get('/', routes.index);
server.get('/login/:idUser', routes.login);
server.get('/unknown', routes.unknown_event);      // evento desconocido
server.get('/googleapis', appconf.login);
server.get('/ioe', routes.ioe);  //pasarle el usuario??
server.get('/ioe/error', routes.ioe_error);  //pasarle el usuario??
server.get('/ioe/success', routes.ioe_success);  //pasarle el usuario??

server.get('/ioe/addThing', routes.ioe_thing_add);  //pasarle el usuario??
server.get('/ioe/addType', routes.ioe_type_add);  //pasarle el usuario??
server.get('/ioe/addEnvironment', routes.ioe_env_add);  //pasarle el usuario??

server.get('/ioe/showThings', neo4j.show_things);  //pasarle el usuario??
server.get('/ioe/showTypes', neo4j.show_types);  //pasarle el usuario??
server.get('/ioe/showEnvironments', neo4j.show_environments);  //pasarle el usuario??

server.get('/ioe/thing/:id', neo4j.show_thing_id);  //pasarle el usuario??
server.get('/ioe/type/:id', neo4j.show_type_id);  //pasarle el usuario??
server.get('/ioe/environment/:id', neo4j.show_environment_id);  //pasarle el usuario??

server.post('/ioe/addType', neo4j.create_type);
server.post('/ioe/addThing', neo4j.create_thing);
server.post('/ioe/addEnvironment', neo4j.create_environment);

server.get('/ioe/addTypeExample', examples.createTypeExample);
server.get('/ioe/addThingExample', examples.createThingExample);
server.get('/ioe/addEnvironmentExample', examples.createEnvironmentExample);

server.get('/ioe/test/:idthing', examples.prueba);

server.get('/ioe/person/addEntornoExample', person.createEnvironmentExample);
server.get('/ioe/person/addTypeExample', person.createTypeExample);
server.get('/ioe/person/addThingExample', person.createThingExample);

server.get('/ioe/books/addEntornoBEEVA', books.createEnvironmentExample);
server.get('/ioe/books/addTypeBook', books.createTypeExample);
server.get('/ioe/books/addThingBooks', books.createThingExample);

server.get('/ioe/addThingAndroid/:serial/:type', neo4j.create_thing_android);

//server.get('/beevalibs/book/list', beevalibs.show_book_list);
//server.get('/beevalibs/book/:idbook', beevalibs.show_book_details);
//server.get('/beevalibs/book/:idbook/history', beevalibs.show_book_history);

module.exports = server;



/*exports.runServer = function(){  //server
 	// Creamos el servidor y lo lanzamos 
    http.createServer(server).listen(server.get('port'), function(){
        console.log('Maya server listening on port ' + server.get('port'));
     });
}
*/