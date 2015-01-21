var async = require('async');
var neo4j = require('neo4j');
var dbneo = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474')

var Type = require('./type4j');
var Thing = require('./thing4j');
var Environment = require('./environment4j');


//libros 
var libro1JSON = {
	thing: {author: 'Thomas Lockwood', name: 'Design Thinking: Integrating Innovation, Customer Experience, and Brand Value', code: 'DES-LOC', category: 'Innovation', label:'THING'},
	state: {state: 'Available', owner: 'Beeva Innovacion', ISBN: '978-1581156683'},
	location: {lat: '40.443142', long:'-3.669823', rad: '0.0'}
};

var libro2JSON = {
	thing: {author:'Joel Spolsky', name: 'The best software writing 1', code: 'SOF-SPO', category: 'Software', label:'THING'},
	state: {state: 'Available', owner: 'Beeva Innovacion', ISBN: '978-1590595008'},
	location: {lat: '40.443142', long:'-3.669823', rad: '0.0'}
};


exports.createThingExample = function(){
	var libro1 = new Thing(libro1JSON.thing.name);
	var libro2 = new Thing(libro2JSON.thing.name);

	async.series([
		function(callback){		
			libro1.creandoThing(libro1JSON, bookJSON.type.name);
	        callback(null, 'libro 1, ');
	    },
	    function(callback){		
			libro2.creandoThing(libro2JSON, bookJSON.type.name);
	        callback(null, 'libro2, ');
	    }
	],
	function(err, results){  
	    console.log('\n--->' + results);
	});
};

var bookJSON = {
	type: {name: 'Beeva Library', description: 'Books at innovacion@beeva.com', label:'TYPE'},
	subtype: {name: 'Book', description: ''},
	messages: {state: '%', owner: '%', who: 'I am a book.'},
	functions: {  "lent": 'function(user){ set_attribute(state, "Not available"); set_attribute(owner, user)}'
				, "returned": 'function(){ set_attribute(state, "Available"); set_attribute(owner, "Beeva Innovacion") }'}
};

exports.createTypeExample = function(){
	var book = new Type(bookJSON.type.name);
			
	        book.comprobarType(bookJSON.type.name, function(result){
	        	if(result){
	        		console.log("\n" + bookJSON.type.name + " EXISTS!");
	        	} else{
	        		console.log("\n" + bookJSON.type.name + " DOESN'T EXIST yet!");
	        		book.creandoType(bookJSON, function(error){
 						if(error) console.log("ERROR " + error);
	        		});
	        	}
	        });
};

var libros = ['The best software writing 1', 'Design Thinking: Integrating Innovation, Customer Experience, and Brand Value'];

var beevaInnovacionJSON = {
	environment: {name: 'Beeva Innovacion', description: 'Entorno del departamento de Innovación en BEEVA.', type: 'Work Environment', label:'ENVIRONMENT'}
};

exports.createEnvironmentExample = function(){
	var entorno = new Environment(beevaInnovacionJSON.environment.name);

	async.series([
		function(callback){		
			entorno.creandoEnvironment(beevaInnovacionJSON, libros);
	        callback(null, 'creando BEEVA Innovacion Environment');
	    }
	],
	function(err, results){  
	    console.log('\n--->' + results);
	});
};