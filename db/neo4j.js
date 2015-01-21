//neo4j
var async = require('async');
var neo4j = require('neo4j');
var dbneo = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474')

var Type = require('./type4j');
var Thing = require('./thing4j');
var Environment = require('./environment4j');


/**
* Create Environment (INT+EXT). Creates a new environment and stores it in Neo4j database
* @param envJSON: JSON with the info to create an environment
* @param arrayThings: Things initially connected to the environment
*/
exports.createEnvironment = function(envJSON, arrayThings, callback_http){
	var entorno = new Environment(envJSON.environment.name);

	async.series([
		function(callback){	
			entorno.comprobarEnvironment(envJSON.environment.name, function(result){
				if(result){
	        		console.log("\n"+ envJSON.environment.name + " EXISTS!");
	        		callback(null, 'comprobarEnv!');
	        	} else{
	        		console.log("\n"+ envJSON.environment.name + " DOESN'T EXIST yet!");
					entorno.creandoEnvironment(envJSON, arrayThings);
	        		callback(null, 'creando Environment');
	        	}
	        });
	    }
	],
	function(err, results){  
	   console.log('\n--->' + results);
	    if(err == true){
	    	//AVISAR EN LA PLATAFORMA DE QUE NO HA SIDO CREADO
	    	callback_http(err);
	    } else{
	    	callback_http(null);
	    }
	});
};

// Idem: Comunicación para REST
exports.create_environment = function(request, response){
	var env = {
	      name: request.body.name
	    , description: request.body.description
	    , type: request.body.type
	    , thing1name: request.body.thing1name
	    , thing2name: request.body.thing2name
	    }

	var envJSON = {
		environment: {name: env.name, description: env.description, type: env.type, label:'ENVIRONMENT'}
	};

	console.log(JSON.stringify(envJSON));

	exports.createEnvironment(envJSON, [env.thing1name, env.thing2name], function(error){
		if(error == true){
			response.render('ioe_error', {title: 'Maya', subtitle: 'ERROR',  info_error: "Couldn't reach database (connection refused)"});
		} else {
			response.render('ioe_success', {title: 'Maya', subtitle: 'Environment Created',  info_success: "Environment "+env.name+" created successfully."});
		}
	});
};

/**
* Create Type (INT+EXT). Creates a new type and stores it in Neo4j database
* @param typeJSON: JSON with the info to create a type
* 
*/
exports.createType = function(typeJSON, callback_http){
	var type = new Type(typeJSON.type.name);

	async.series([
	    function(callback){
	        type.comprobarType(typeJSON.type.name, function(result){
	        	if(result){
	        		console.log("\n"+typeJSON.type.name + " EXISTS!");
	        		callback(null, 'comprobarType!');
	        	}
	        	else{
	        		console.log("\n"+typeJSON.type.name + " DOESN'T EXIST yet!");
	        		type.creandoType(typeJSON, function(error){
	        			if(error){
	        				callback(true, "error creandoType:" + error);
	        			}
	        			else {
	        				callback(null, 'comprobarType! & [creandoType]');
	        			}
	        		});
	        	}
	        });
	    }
	],
	function(err, results){  
	    console.log('\n--->' + results);
	    if(err == true){
	    	//AVISAR EN LA PLATAFORMA DE QUE NO HA SIDO CREADO
	    	callback_http(err);
	    } else{
	    	callback_http(null);
	    }
	});
};


// Idem: Comunicación para REST
exports.create_type = function(request, response){
	var type = {
	      name: request.body.name
	    , description: request.body.description
	    , subtype: request.body.subtype
	    , message1name: request.body.message1name
	    , message1text: request.body.message1text
	    , message2name: request.body.message2name
	    , message2text: request.body.message2text  
	    , function1name: request.body.function1name 
	    , function1code: request.body.function1code 
	    , function2name: request.body.function2name
	    , function2code: request.body.function2code
	    }

	var typeJSON = {
		type: {name: type.name, description: type.description, label:'TYPE'},
		subtype: {name: type.subtype, description: 'subtype of...'},
		messages: {},
		functions: {}
	};

	typeJSON.messages[type.message1name] = type.message1text;
	typeJSON.messages[type.message2name] = type.message2text;
	typeJSON.functions[type.function1name] = 'function(){'+type.function1code+'}';
	typeJSON.functions[type.function2name] = 'function(){'+type.function2code+'}';

	console.log(JSON.stringify(typeJSON));

	exports.createType(typeJSON, function(error){
		if(error == true){
			response.render('ioe_error', {title: 'Maya', subtitle: 'ERROR',  info_error: "Couldn't reach database (connection refused)"});
		} else {
			response.render('ioe_success', {title: 'Maya', subtitle: 'Format Created',  info_success: "Format "+type.name+" created successfully."});
		}
	});
};


/**
* Create Thing (INT+EXT). Creates a new thing and stores it in Neo4j database
* @param thingJSON: JSON with the info to create a thing
* @param nameType: name of the type associated to the thing
*/
exports.createThing = function(thingJSON, nameType, callback_http){
	
	var type = new Type(nameType);

	async.series([
		function(callback){		
			type.comprobarType(nameType, function(exists){
				if (exists == true){
					var thing = new Thing(thingJSON.thing.name);
					thing.creandoThing(thingJSON, nameType);
					callback(null, 'creandoThing & asociandoThingToType');
				} else{
					console.log("\nEl type al que se quiere asociar el objeto no existe");
					callback(true, 'Error connecting with database. Format unknown in database.');
				}
			});  
	    }
	],
	function(err, results){   
	    if(err == true){
	    	//AVISAR EN LA PLATAFORMA DE QUE NO HA SIDO CREADO
	    	callback_http(err);
	    } else{
	    	callback_http(null);
	    }
	});

};


// Idem: Comunicación para REST
exports.create_thing = function(request, response){
	var thing = {
	      name: request.body.name
	    , description: request.body.description
	    , type: request.body.type
	    , lat: request.body.lat
	    , long: request.body.long
	    , attribute1: request.body.attribute1 
	    , attribute2: request.body.attribute2 
	    , value1: request.body.value1
	    , value2: request.body.value2
	    }

	var thingJSON = {
		thing: {name: thing.name, description: thing.description, label:'THING'},
		state: {},
		location: {lat: thing.lat, long: thing.long, rad: '0.0'}
	};

	thingJSON.state[thing.attribute1] = thing.value1;
	thingJSON.state[thing.attribute2] = thing.value2;

	console.log(JSON.stringify(thingJSON));

	exports.createThing(thingJSON, thing.type, function(error){
		if(error == true){
			response.render('ioe_error', {title: 'Maya', subtitle: 'ERROR',  info_error: "Couldn't reach database (connection refused)"});
		} else {
			response.render('ioe_success', {title: 'Maya', subtitle: 'Thing Created',  info_success: "Thing "+thing.name+" created successfully."});
		}
	});
};

/**
* Create Thing JSON Android (EXT). Creates a new thing and stores it in Neo4j database
* @param request -> serial + format
*/

// Idem: Comunicación para REST
exports.create_thing_android = function(request, response){
	var serial = request.param('serial');
    var type = request.param('type');
    var entorno = new Environment('entorno android');
    var nombre_test_entorno = "Nieves Blaster";

	var thingJSON = {
		thing: {description: type+'-'+serial, name: serial, label:'THING'},
		state: {},
		location: {lat: '0.0', long:'0.0', rad: '0.0'}
	};

	var typeAndroid = new Type("test android");

	typeAndroid.devolverPlantillaStatus(type, function(status){

		//un for aqui que meta en 'state' lo extraido de la BD
		//thingJSON.state[thing.attribute1] = thing.value1;
		//thingJSON.state[thing.attribute2] = thing.value2;

		
		//console.log("\nYeah status=" + JSON.stringify(status));  //JSON!!
		thingJSON.state = status;
		console.log(JSON.stringify(thingJSON));

		exports.createThing(thingJSON, type, function(error){
			if(error == true){
				response.render('ioe_error', {title: 'Maya', subtitle: 'ERROR',  info_error: "Couldn't reach database (connection refused)"});
			} else {
				entorno.asociarThingToEnvironment(serial, nombre_test_entorno);
				response.render('ioe_success', {title: 'Maya', subtitle: 'Thing Created',  info_success: "Thing "+thing.name+" created successfully."});
			}
		});

	});
};


/**
* Show Things (INT+EXT). Gets all the things in Neo4j database
*/
exports.showThings = function(callback){
	var objeto = new Thing("nanai");
	var json = {};

	objeto.getAllThings(function(arrayThings){
		if(arrayThings.length > 0){
			//console.log("\n ARRAY THINGS: ");
			for (var i = 0; i < arrayThings.length; i++){ 
				//console.log("["+arrayThings[i]["id(n)"]+"]: " + arrayThings[i]["n.name"]);
				json[i] = {id: arrayThings[i]["id(n)"],
						 name: arrayThings[i]["n.name"]};
			}
			console.log("\n JSON THINGS: " + JSON.stringify(json));
			callback(json);
		} else{
			callback(null);
		}
	});	

};

// Idem: Comunicación para REST
exports.show_things = function(request, response){
	
	exports.showThings(function(things){
		if(things){
			response.render('ioe_showThings', {title: 'Maya', subtitle: 'Things Manager', info: 'Show All', result: /*JSON.stringify(*/things/*)*/});
		} else {
			//No ha recuperado ningún THING :()
			response.render('ioe_error', {title: 'Maya', subtitle: 'ERROR',  info_error: "Things not found or error connecting with database."});
		}
	});
};

/**
* Show Types (INT+EXT). Gets all the types in Neo4j database
*/
exports.showTypes = function(callback){
	var tipo = new Type("nanai");
	var json = {};
	
	tipo.getAllTypes(function(arrayTypes){
		if(arrayTypes.length > 0){
			//console.log("\n ARRAY THINGS: ");
			for (var i = 0; i < arrayTypes.length; i++){ 
				//console.log("["+arrayTypes[i]["id(n)"]+"]: " + arrayTypes[i]["n.name"]);
				json[i] = {id: arrayTypes[i]["id(n)"],
						 name: arrayTypes[i]["n.name"]};
			}
			console.log("\n JSON TYPES: " + JSON.stringify(json));
			callback(json);
		} else{
			callback(null);
		}
	});	

};

// Idem: Comunicación para REST
exports.show_types = function(request, response){
	
	exports.showTypes(function(types){
		if(types){
			response.render('ioe_showTypes', {title: 'Maya', subtitle: 'Formats Manager', info: 'Show All', result: /*JSON.stringify(*/types/*)*/});
		} else {
			//No ha recuperado ningún THING :()
			//No ha recuperado ningún TYPE :()
			response.render('ioe_error', {title: 'Maya',  subtitle: 'ERROR',  info_error: "Formats not found or error connecting with database."});
		}
	});

};

/**
* Show Environments (INT+EXT). Gets all the environments in Neo4j database
*/
exports.showEnvironments = function(callback){
	var env = new Environment("nanai");
	var json = {};
	
	env.getAllEnvironments(function(arrayEnvs){
		if(arrayEnvs.length > 0){
			//console.log("\n ARRAY THINGS: ");
			for (var i = 0; i < arrayEnvs.length; i++){ 
				//console.log("["+arrayTypes[i]["id(n)"]+"]: " + arrayEnvs[i]["n.name"]);
				json[i] = {id: arrayEnvs[i]["id(n)"],
						 name: arrayEnvs[i]["n.name"]};
			}
			console.log("\n JSON Envs: " + JSON.stringify(json));
			callback(json);
		} else{
			callback(null);
		}
	});	

};

// Idem: Comunicación para REST
exports.show_environments = function(request, response){
	
	exports.showEnvironments(function(environments){
		if(environments){
			response.render('ioe_showEnvironments', {title: 'Maya', subtitle: 'Environments Manager', info: 'Show All', result: /*JSON.stringify(*/environments/*)*/});
		} else {
			//No ha recuperado ningún ENV
			response.render('ioe_error', {title: 'Maya',  subtitle: 'ERROR',  info_error: "Formats not found or error connecting with database."});
		}
	});

};



/**
* Show Thing by ID (INT+EXT). Gets the thing with ID from Neo4j database
*/
exports.showThingID = function(id, callback){
	var objeto = new Thing("nanai");

	objeto.getThingID(id, function(thingNodes){
		if(thingNodes){
			var node_from = { name: /*JSON.stringify(*/thingNodes[0].a.data.name//)
				 			, id: id
							, description: /*JSON.stringify(*/thingNodes[0].a.data.description/*)*/};

		    var json = {me: node_from};

		    async.forEach(thingNodes, function (item, callback_iter){ 
			    //console.log(item); // print the key
			    var rel = item.r.type; //JSON.stringify();
				var data = item.b.data; ///*JSON.stringify(*/); 
				var wh = "";

				if(rel == "IS_LOCATED") wh = "Where am I?";
				if(rel == "IS_A") wh = "What am I?";
				if(rel == "HAS_STATE") {
					wh = "How am I?";
					objeto.obtenerStatusByID(id, function(estado){
						data = estado;
						console.log("PRUEBA - estado "+ JSON.stringify(estado));

						json[item.r.type] = {
							question: wh,
							data: data
						};
						callback_iter(); // tell async that the iterator has completed
					});	
				}
				else{
					json[item.r.type] = {
						question: wh,
						data: data
					};
				    callback_iter(); // tell async that the iterator has completed
				}
				
			}, function(err) {
			    //console.log('iterating done');
			    console.log("\nTHING ID=" + JSON.stringify(json));
				callback(json);
			});  
		} else{
			callback(null);
		}
	});	

};

// Idem: Comunicación para REST
exports.show_thing_id = function(request, response){
	var id = request.param('id');

	exports.showThingID(id, function(thing){
		if(thing){
			response.render('ioe_showThingID', {title: 'Maya', subtitle: 'Things Manager', info: "Show Thing", result: thing /*JSON.stringify(thing)*/});
		} else {
			//No ha recuperado ningún THING :()
			//No ha recuperado ningún TYPE :()
			response.render('ioe_error', {title: 'Maya', subtitle: 'No Thing found',  info_error: "Couldn't reach database (connection refused)"});
		}
	});
};

/**
* Show Type by ID (INT+EXT). Gets the thing with ID from Neo4j database
*/
exports.showTypeID = function(id, callback){
	var tipo = new Type("nanai");
	var json = {};

	tipo.getTypeID(id, function(typeNodes){
		if(typeNodes){
			var node_from = { name: /*JSON.stringify(*/typeNodes[0].a.data.name//)
							, id: id
							, description: /*JSON.stringify(*/typeNodes[0].a.data.description/*)*/};

		    var json = {me: node_from};

			for (var i = 0; i < typeNodes.length; i++){ 
				var rel = typeNodes[i].r.type; //JSON.stringify();
				var wh = "";

				if(rel == "IS_A") wh = "What am I?";
				if(rel == "SAYS") wh = "What do I say?";
				if(rel == "DOES") wh = "What do I do?";

				json[typeNodes[i].r.type] = {
					question: wh,
					data: /*JSON.stringify(*/typeNodes[i].b.data//)
				};
			}
			console.log("\nTYPE ID=" + JSON.stringify(json));
			callback(json);
		} else{
			callback(null);
		}
	});	

};

// Idem: Comunicación para REST
exports.show_type_id = function(request, response){
	var id = request.param('id');

	exports.showTypeID(id, function(type){
		console.log("\n*** type=" + JSON.stringify(type));
		if(type){
			response.render('ioe_showTypeID', {title: 'Maya', subtitle: 'Formats Manager',  info: "Show Format", result: type /*JSON.stringify(type)*/});
		} else {
			//No ha recuperado ningún TYPE :()
			response.render('ioe_error', {title: 'Maya', subtitle: 'No Format found',  info_error: "Couldn't reach database (connection refused)"});
		}
	});
};


/**
* Show Type by ID (INT+EXT). Gets the thing with ID from Neo4j database
*/
exports.showEnvironmentID = function(id, callback){
	var env = new Environment("nanai");
	var json = {};

	env.getEnvironmentID(id, function(envNodes){
		if(envNodes){
			var node_from = { name: /*JSON.stringify(*/envNodes[0].a.data.name//)
							, id: id
							, description: /*JSON.stringify(*/envNodes[0].a.data.description/*)*/};

		    var json = {
		    			me: node_from,
		    			things: []	
		    			};

			for (var i = 0; i < envNodes.length; i++){ 
				console.log("\n envNodes B =>>" + JSON.stringify(envNodes[i].b.data));
				var rel = envNodes[i].r.type; //JSON.stringify();
				
				json.things.push(
				{
					rel: rel,
					data: /*JSON.stringify(*/envNodes[i].b.data//)
				});
			}
			console.log("\nENV ID=" + JSON.stringify(json));
			callback(json);
		} else{
			callback(null);
		}
	});	

};

// Idem: Comunicación para REST
exports.show_environment_id = function(request, response){
	var id = request.param('id');

	exports.showEnvironmentID(id, function(env){
		console.log("\n*** env=" + JSON.stringify(env) + "\n");
		if(env){
			response.render('ioe_showEnvironmentID', {title: 'Maya', subtitle: 'Environments Manager',  info: "Show Environment", result: env /*JSON.stringify(type)*/});
		} else {
			//No ha recuperado ningún TYPE :()
			response.render('ioe_error', {title: 'Maya', subtitle: 'No Environment found',  info_error: "Couldn't reach database (connection refused)"});
		}
	});
};