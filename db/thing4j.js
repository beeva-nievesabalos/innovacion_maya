//neo4j
// thing4j.js
// THINGS model logic.
var async = require('async');
var neo4j = require('neo4j');
var dbneo = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');

// relationships constants:
var IS_REL = 'IS_A';
var STATE_REL = 'HAS_STATE';
var OWNS_REL = 'HAS_THINGS';
var LOCATED_REL = 'IS_LOCATED';
//var WAS_REL = 'WAS';

/******* JSON **************
var lampJSON = {
	thingNode: {description: 'beautiful lamp', name: 'lamp', label:'THING'},
	stateNode: {state: 'on'},
	locationNode: {lat: '40.42', long:'-3.6695', rad: '0.5'}
};*/

// Constructor
//var Thing = function(name){ 
function Thing(name){
	// always initialize all instance properties
	this._name = name;
	this._json = "{}";
	this._id = "";
	console.log("Creating a new thing " + name);	
}

var _createRelationshipThing = function (nameRel, nodeFrom, nodeTo){
		var timestamp = new Date().getTime();

		nodeFrom.createRelationshipTo(nodeTo, nameRel, {date: timestamp}, function (err, relationship) {    // ...this is what actually persists.
			if (err) {
				console.log('Error saving new relationship to database:', err);
			} else {
				//console.log('R+ saved to database with id:', relationship.id);
				//console.log(relationship.id + ": "+ nodeFrom.id + "---"+nameRel+"--->" + nodeTo.id);
			}
		});
	};

var _createNodeThing = function (properties, callback_func){
		var nodeThing = dbneo.createNode(properties);     // instantaneous, but...
		nodeThing.save(function (err, nodeThing) {    // ...this is what actually persists.
			if (err) {
			    console.log('Error saving new node to database:' + err);
			} else {
			    //console.log( nodeThing.id + " <> " + JSON.stringify(properties));
			    
			    if(properties.label == "THING"){
			    	//this._id = nodeThing.id;
				    nodeThing.index("Things", "name", properties.name, function (err) {
		            	if (err) return callback_func(err);
		            	else console.log("Successful index Things to " + properties.name);
		        	});
				}
			    callback_func(nodeThing.id);
			}
		});
	};

	// Para obtener el Thing por Name 
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

	// Para obtener el Type por Name 
var _getIDTypeByName = function(nodoTypeValue, callback){  //se les pasa el property y valor del nodo a buscar
		dbneo.query(["START node=node:Types(name='"+nodoTypeValue+"')",
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


var _getThingStatus = function(id, callback){  
	dbneo.query([ 'START a=node('+id+')',
				  'MATCH state<-[:HAS_STATE]-a-[:IS_A]->b-[:SAYS]->messages',
				  'RETURN state, messages' //a, b, 
				].join('\n'), function(err, status){
					if(err){
						console.log('\nERROR dbneo.query:'+ err); 
						callback(null);
					} else{
						//console.log('\n_getThingStatus node.a:'+ JSON.stringify(status[0].a.data));  
						//console.log('\n_getThingStatus node.b:'+ JSON.stringify(status[0].b.data));  
						//console.log('\n_getThingStatus status:'+ JSON.stringify(status[0].state.data));  
						//console.log('\n_getThingStatus messages:'+ JSON.stringify(status[0].messages.data));
						
						var result={};
						result.state = status[0].state.data;
						result.messages = status[0].messages.data;

						callback(result);
					}
				}
			);
	};

// Para obtener el estado de cualquier Thing de la base de datos, sólo pasandole el ID	
Thing.prototype.obtenerStatusByID = function(idThing, callback){ 
	var arrayStatus = {};
    if(idThing){
        _getThingStatus(idThing, function(status){
		    if(status){
		    	// Aqui CRUZAR Thing.state con Type.messages
		    	for(var k in status) {
				    if(k == 'state'){
					   	for(var l in status.state) {
					   		for(var m in status.messages) {
					   			if(l == m){
					   				var patron = status.messages[m];
					 
					   				patron = patron.replace("%", status.state[l]);
					   				//console.log("\n--->" + patron);
					   				arrayStatus[m] = patron;
					   			}
					   		}
					   	}
				    }
				}
				callback(arrayStatus);
		    } else {
		    	console.log(" :( ");	
		    	callback(null);
		    }
		 });
    } else {
    	console.log("Thing #" +idThing + " DOESN'T EXIST!");
    	callback(null);
    }
}



Thing.prototype.asociarType = function(nameType){ //nameThing
	var nameThing = this._json.thing.name;
	var that = this;
	console.log(nameThing + " -> ID that --> " + that._id);

        if(that._id){
        	//console.log("\n\n my wemoSwitch ID ->" + JSON.stringify(this.id));
        	_getIDTypeByName(nameType, function(typeID){
		        if(typeID){
		        	//console.log("\n\n  switch node ->" + JSON.stringify(typeID));
		        	dbneo.getNodeById(that._id, function(err, nodeThing){
		        		if(err) console.log('\nERROR getNodeById:'+ err); 	
						dbneo.getNodeById(typeID, function(err, nodeType){
		        			if(err) console.log('\nERROR getNodeById:'+ err); 
		        			//Thing ---IS_A---> TYPE
		        			_createRelationshipThing(IS_REL, nodeThing, nodeType);
		        		});
		        	});
		        } else console.log(nameType + " DOESN'T EXIST!");
		    });
        } else console.log(this._name + " DOESN'T EXIST!");
}

/* Para crear los nodos de un Thing en paralelo y luego las relaciones */
Thing.prototype.creandoThing =	function(thingJSON, nameType){
	this._json = thingJSON;
	var that = this;

	async.parallel({
	    thingNode: function(callback){
	    	_createNodeThing(thingJSON.thing, function(result){
	    		that._id = result;
	    		callback(null, result);
	    	});  
	    },
	    stateNode: function(callback){
			_createNodeThing(thingJSON.state, function(result){
	    		callback(null, result);
	    	});      
	    },
	    locationNode: function(callback){
			_createNodeThing(thingJSON.location, function(result){
	    		callback(null, result);
	    	});    
	    }
	 	/*ownerThing: function(callback){
			createNodeThing({things: '[]'}, function(result){
	    		callback(null, result);
	    	});  
	    }*/
	},
	function(err, response) {  
	    if(err) {
	    	console.log('\nERROR:' + err);
	    }
	    else{
	    	//CREO LAS RELACIONES
	    	//console.log('\nRESPONSE:' + JSON.stringify(response));
	    	dbneo.getNodeById(response.thingNode, function(err, nodeThing){
	    		//THING
	    		dbneo.getNodeById(response.stateNode, function(err, nodeState){
	    			//---has_state-->STATE
	    			_createRelationshipThing (STATE_REL, nodeThing, nodeState);	
	    		});
	    		/*dbneo.getNodeById(response.ownerThings, function(err, nodeThings){
	    			//---has_things-->THINGS
	    			_createRelationshipThing (OWNS_REL, nodeThing, nodeThings);
	    		});*/
	    		dbneo.getNodeById(response.locationNode, function(err, nodeLocation){
	    			//---is_located-->LOCATION
	    			_createRelationshipThing (LOCATED_REL, nodeThing, nodeLocation);	
	    		});

	    		that.asociarType(nameType);
	    	});	
	    }
	});
};

// Para comprobar que el Thing existe 
// nodoThingProperty = 'name'
// nodoThingValue = nombre del objeto
Thing.prototype.comprobarThing = function(nodoThingValue, callback){  //se les pasa el property y valor del nodo a buscar
	dbneo.getIndexedNodes("Things", 'name', nodoThingValue, function(err, nodos){
		if(err) {
			//console.log('\n comprobarThing-ERROR:' + err);
			callback(false);
		}
		else{
			if(nodos.length > 0) callback(true);
			else callback(false);
		}
	});
};

Thing.prototype.getAllThings = function(callback){  
	//start n=node(*) where has(n.label) and n.label = "THING" return *
	dbneo.query([ 'START n=node(*)',
				  'WHERE has(n.label) AND n.label = "THING"',
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

Thing.prototype.getThingID = function(id, callback){  
	
	dbneo.query([ 'START a=node('+id+')',
				  'MATCH a-[r]->b',
				  'RETURN a, r, b'
				].join('\n'), function(err, nodes){
					if(err){
						console.log('\nERROR dbneo.query:'+ err); 
						callback(null);
					} else{
						//console.log('\n node.r:'+ JSON.stringify(nodes[0].r.type));  //ORDER BY node.id
						//console.log('\n node.b:'+ JSON.stringify(nodes[0].b.data));  //ORDER BY node.id
						callback(nodes);
					}
				}
			);
	};




module.exports = Thing;