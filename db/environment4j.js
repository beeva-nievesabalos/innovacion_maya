//neo4j
// Environment4j.js
// Environments model logic.
var async = require('async');
var neo4j = require('neo4j');
var dbneo = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');

// relationships constants:
var OWNS_REL = 'HAS';
var ENV_OWNS_REL = 'LINKS';

/******* JSON **************/
//var blasterJSON = {
//	environment: {description: 'This is my personal environment, linked to my Things and Services.', name: 'Nieves Blaster', type: 'Personal Environment', label:'ENVIRONMENT'}
//};

// Constructor
//var Environment = function(name){ 
function Environment(name){
	// always initialize all instance properties
	this._name = name;
	this._json = "{}";
	this._id = "";
	console.log("Creating a new Environment " + name);	
}

var _createRelationshipEnvironment = function (nameRel, nodeFrom, nodeTo){
		var timestamp = new Date().getTime();

		nodeFrom.createRelationshipTo(nodeTo, nameRel, {date: timestamp}, function (err, relationship) {    // ...this is what actually persists.
			if (err) {
				console.log('Error saving new relationship to database:', err);
			} else {
				//console.log('R+ saved to database with id:', relationship.id);
				console.log(relationship.id + ": "+ nodeFrom.id + "---"+nameRel+"--->" + nodeTo.id);
			}
		});
	};

var _createNodeEnvironment = function (properties, callback_func){
		var nodeEnvironment = dbneo.createNode(properties);     // instantaneous, but...
		nodeEnvironment.save(function (err, nodeEnvironment) {    // ...this is what actually persists.
			if (err) {
			    console.log('Error saving new node to database:' + err);
			} else {
			    console.log( nodeEnvironment.id + " <> " + JSON.stringify(properties));
			    
			    if(properties.label == "ENVIRONMENT"){
				    nodeEnvironment.index("Environments", "name", properties.name, function (err) {
		            	if (err) return callback_func(err);
		            	else console.log("Successful index Environments to " + properties.name);
		        	});
				}
			    callback_func(nodeEnvironment.id);
			}
		});
	};

	// Para obtener el Environment por Name 
var _getIDEnvironmentByName = function(nodoEnvironmentValue, callback){  //se les pasa el property y valor del nodo a buscar
		dbneo.query(["START node=node:Environments(name='"+nodoEnvironmentValue+"')",
			"RETURN id(node)",
			"LIMIT 1"
			].join('\n'), function(err, id){
				if(err){
					console.log('\nERROR dbneo.query:'+ err); 
					callback(false);
				} else{
					//console.log('\n RETURN node.id->'+ JSON.stringify(id[0]["id(node)"]));  //ORDER BY node.id
					callback(id[0]["id(node)"]);
				}
			}
		);
	};

var _getIDThingByName = function(nodoThingValue, callback){  //se les pasa el property y valor del nodo a buscar
		dbneo.query(["START node=node:Things(name='"+nodoThingValue+"')",
			"RETURN id(node)",
			"LIMIT 1"
			].join('\n'), function(err, id){
				if(err){
					console.log('\nERROR dbneo.query:'+ err); 
					callback(false);
				} else{
					//console.log('\n RETURN node.id->'+ JSON.stringify(id[0]["id(node)"]));  //ORDER BY node.id
					callback(id[0]["id(node)"]);
				}
			}
		);
	};

Environment.prototype.asociarThing = function(nameThing){ //nameEnvironment
	//console.log(this);
	var nameEnvironment = this._json.environment.name;
	var that = this;
	console.log(nameEnvironment + " -> ID that --> " + that._id);

        if(that._id){
        	_getIDThingByName(nameThing, function(thingID){
		        if(thingID){
		        	//console.log("\n\n  switch node ->" + JSON.stringify(typeID));
		        	dbneo.getNodeById(that._id, function(err, nodeEnvironment){
		        		if(err) console.log('\nERROR getNodeById:'+ err); 	
						dbneo.getNodeById(thingID, function(err, nodeThing){
		        			if(err) console.log('\nERROR getNodeById:'+ err); 
		        			//Environment ---HAS---> THING
		        			_createRelationshipEnvironment(OWNS_REL, nodeEnvironment, nodeThing);
		        		});
		        	});
		        } else {
		        	console.log(nameThing + " isn a thing, is an Environment");
		        	_getIDEnvironmentByName(nameThing, function(envID){
				        if(envID){
				        	//console.log("\n\n  switch node ->" + JSON.stringify(typeID));
				        	dbneo.getNodeById(that._id, function(err, nodeEnvironment){
				        		if(err) console.log('\nERROR getNodeById:'+ err); 	
								dbneo.getNodeById(envID, function(err, nodeThing){
				        			if(err) console.log('\nERROR getNodeById:'+ err); 
				        			//Environment ---HAS---> THING
				        			_createRelationshipEnvironment(ENV_OWNS_REL, nodeEnvironment, nodeThing);
				        		});
				        	});
				        } // envID
				        else {console.log(nameThing + " is not thing not environment");}
				    });  
		        } // else
		    });
        } else console.log(this._name + " DOESN'T EXIST!");
}

Environment.prototype.asociarThingToEnvironment = function(nameThing, nameEnvironment){ //nameEnvironment

	_getIDEnvironmentByName(nameEnvironment, function(environmentID){

		if(environmentID){
			console.log(nameEnvironment + " -> ID that --> " + environmentID);
	        //if(that._id){
	        	_getIDThingByName(nameThing, function(thingID){
			        if(thingID){
			        	//console.log("\n\n  switch node ->" + JSON.stringify(typeID));
			        	dbneo.getNodeById(environmentID, function(err, nodeEnvironment){
			        		if(err) console.log('\nERROR getNodeById:'+ err); 	
							dbneo.getNodeById(thingID, function(err, nodeThing){
			        			if(err) console.log('\nERROR getNodeById:'+ err); 
			        			//Environment ---HAS---> THING
			        			_createRelationshipEnvironment(OWNS_REL, nodeEnvironment, nodeThing);
			        		});
			        	});
			        } /*else {
			        	console.log(nameThing + " isn a thing, is an Environment");
			        	_getIDEnvironmentByName(nameThing, function(envID){
					        if(envID){
					        	//console.log("\n\n  switch node ->" + JSON.stringify(typeID));
					        	dbneo.getNodeById(that._id, function(err, nodeEnvironment){
					        		if(err) console.log('\nERROR getNodeById:'+ err); 	
									dbneo.getNodeById(envID, function(err, nodeThing){
					        			if(err) console.log('\nERROR getNodeById:'+ err); 
					        			//Environment ---HAS---> THING
					        			_createRelationshipEnvironment(ENV_OWNS_REL, nodeEnvironment, nodeThing);
					        		});
					        	});
					        } // envID
					        else {console.log(nameThing + " is not thing not environment");}
					    });  
			        } // else
			        */
			    });
	        //} else console.log(this._name + " DOESN'T EXIST!");
		} // environmentID
	    else console.log(nameEnvironment + " is not thing not environment");
	});
}

/* Para crear los nodos de un Environment en paralelo y luego las relaciones */
Environment.prototype.creandoEnvironment =	function(environmentJSON, nameThings){
	this._json = environmentJSON;
	var that = this;

	async.parallel({
	    environmentNode: function(callback){
	    	_createNodeEnvironment(environmentJSON.environment, function(result){
	    		that._id = result;
	    		console.log('\n Node Environment ID:' + that._id );
	    		callback(null, result);
	    	});  
	    } 
	},
	function(err, response) {  
	    if(err) {
	    	console.log('\nERROR:' + err);
	    }
	    else{
	    	//CREO LAS RELACIONES con los things
	    	for(var i = 0; i < nameThings.length; i++){
	    		that.asociarThing(nameThings[i]);
	    	}	
	    }
	});
};

// Para comprobar que el Environment existe 
// nodoEnvironmentProperty = 'name'
// nodoEnvironmentValue = nombre del objeto
Environment.prototype.comprobarEnvironment = function(nodoEnvironmentValue, callback){  //se les pasa el property y valor del nodo a buscar
	console.log("Comprobar que existe el entorno con el nombre "+nodoEnvironmentValue);
	dbneo.getIndexedNodes("Environments", 'name', nodoEnvironmentValue, function(err, nodos){
		if(err) {
			console.log('\n comprobarEnvironment-ERROR:' + err);
			callback(false);
		}
		else{
			if(nodos.length > 0) callback(true);
			else callback(false);
		}
	});
};

Environment.prototype.getAllEnvironments = function(callback){  
	//start n=node(*) where has(n.label) and n.label = "ENVIRONMENT" return *
	dbneo.query([ 'START n=node(*)',
				  'WHERE has(n.label) AND n.label = "ENVIRONMENT"',
				  'RETURN id(n), n.name ORDER BY n.name'
				].join('\n'), function(err, nodes){
					if(err){
						console.log('\nERROR dbneo.query:'+ err); 
						callback(false);
					} else{
						//console.log('\n RETURN nodes ::::>'+ JSON.stringify(nodes));  //ORDER BY node.id
						callback(nodes);
					}
				}
			);
	};

Environment.prototype.getEnvironmentID = function(id, callback){  
	
	dbneo.query([ 'START a=node('+id+')',
				  'MATCH a-[r]->b',
				  'RETURN a, r, b'
				].join('\n'), function(err, nodes){
					if(err){
						console.log('\nERROR dbneo.query:'+ err); 
						callback(null);
					} else{
						console.log('\n node.r:'+ JSON.stringify(nodes[0].r.type));  //ORDER BY node.id
						console.log('\n node.b:'+ JSON.stringify(nodes[0].b.data));  //ORDER BY node.id
						callback(nodes);
					}
				}
			);
	};

module.exports = Environment;
