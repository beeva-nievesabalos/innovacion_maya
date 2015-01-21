// neo4j
// type4j.js
// TYPE model logic.
var async = require('async');
var neo4j = require('neo4j');
var dbneo = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');

// relationships constants:
var IS_REL = 'IS_A';
var API_FUNCTION_REL = 'DOES';
var API_SMS_REL = 'SAYS';
//var OWNS_REL = 'HAS_THINGS';

/******* JSON **************
var switchJSON = {
	typeNode: {name: 'oldSwitch', description: 'old type of a switch: on/off', label:'TYPE'},
	subtypeNode: {name: 'electrical device', description: 'produces or is powered by electricity'},
	messagesNode: {on: 'Switched on.', off: 'Switched off.', who: 'I am an old switch.'},
	functionsNode: {"switch on": 'function(){}', "switch off": 'function(){}'}
};*/

// Constructor
//var Type = function(name){ 
function Type(name){
	// always initialize all instance properties
	this._name = name;
	this._id = "";
	this._json = "{}";
	console.log("Creating a new type " + name);
}

var _createRelationshipType = function (nameRel, nodeFrom, nodeTo){
	var timestamp = new Date().getTime();

	nodeFrom.createRelationshipTo(nodeTo, nameRel, {date: timestamp}, function (err, relationship) {    // ...this is what actually persists.
		if (err) {
			console.log('Error saving new relationship to database:', err);
			//callback_func(err);
		} else {
			//console.log('R+ saved to database with id:', relationship.id);
			//console.log(relationship.id + ": "+ nodeFrom.id + "---"+nameRel+"--->" + nodeTo.id);
		}
	});
};

var _createNodeType = function (properties, callback_func){
	var nodeType = dbneo.createNode(properties);     // instantaneous, but...
	nodeType.save(function (err, nodeType) {    // ...this is what actually persists.
		if (err) {
		    console.log('Error saving new node to database:' + err);
		    callback_func(null)
		} else {
		    //console.log('N+ saved to database with id:' + nodeType.id);
		    //console.log( nodeType.id + " <> " + JSON.stringify(properties));

		    if(properties.label == "TYPE"){
			    nodeType.index("Types", "name", properties.name, function (err) {
	            	if (err) return callback_func(err);
	            	else console.log("Successful index Types to " + properties.name);
	        	});
			}
		    callback_func(nodeType.id);
		}
	});
};

	// Para obtener el Type por Name 
var _getIDTypeByName = function(nodoTypeValue, callback){  //se les pasa el property y valor del nodo a buscar
		dbneo.query(["START node=node:Types(name='"+nodoTypeValue+"')",
			"RETURN id(node)",
			"LIMIT 1"
			].join('\n'), function(err, id){
				if(err){
					console.log('\nERROR dbneo.query_getIDTypeByName:'+ err); 
					callback(false);
				} else{
					//console.log('\n RETURN node.id->'+ JSON.stringify(id[0]["id(node)"]));  //ORDER BY node.id
					callback(id[0]["id(node)"]);
				}
			}
		);
	};


// Aqui asociamos un tipo con su padre
Type.prototype.asociarSubtype = function(nameSupertype){ 
	//console.log(this);
	var nameType = this._json.type.name;
	var that = this;
	console.log("\nQuiero asociar " + nameType + "(" + that._id + ") con " + nameSupertype);

	//_getIDTypeByName(nameType, function(typeID)
        if(that._id){
        	_getIDTypeByName(nameSupertype, function(typeID){
		        if(typeID){
		        	dbneo.getNodeById(that._id, function(err, nodeSubtype){
		        		if(err) console.log('\nERROR getNodeById:'+ err); 	
						dbneo.getNodeById(typeID, function(err, nodeType){
		        			if(err) console.log('\nERROR getNodeById:'+ err); 
		        			//Thing ---IS_A---> TYPE
		        			_createRelationshipType(IS_REL, nodeSubtype, nodeType);
		        		});
		        	});
		        }
		        else console.log(nameType + " DOESN'T EXIST!");
		    });
        }
        else console.log(that._name + " DOESN'T EXIST!");
}

/* Para crear los nodos de un Type en paralelo y luego las relaciones */
// Si error, devuelto en el callback_error, si no error, callback_error(null)
Type.prototype.creandoType = function(typeJSON, callback_error){
	this._json = typeJSON;
	var that = this;

	async.parallel({
	    typeNode: function(callback){
	    	_createNodeType(typeJSON.type, function(result){
	    		if(result){
	    			that._id = result;
	    			console.log(that._name + " id " + that._id);
	    			callback(null, result);
	    		} else
	    			callback(true, "Error connecting database");
	    	});  
	    },
	    /*subtypeNode: function(callback){  
			//_createNodeType({name: 'switch', messages: mensajes, functions: funciones});  
			_createNodeType(typeJSON.subtype, function(result){
	    		if(result)
	    			callback(null, result);
	    		else
	    			callback(true, "Error connecting database");
	    	}); 
	    },*/
	 	/*ownerThings: function(callback){
			_createNodeType({things: '[]'}, function(result){
	    		callback(null, result);
	    	}); //contains things idNodes! 
	    },*/
	    messagesNode: function(callback){
			_createNodeType(typeJSON.messages, function(result){
	    		if(result)
	    			callback(null, result);
	    		else
	    			callback(true, "Error connecting database");
	    	});   
	    },
	    functionsNode: function(callback){	
			_createNodeType(typeJSON.functions, function(result){
	    		if(result)
	    			callback(null, result);
	    		else
	    			callback(true, "Error connecting database");
	    	});  
	    }
	},
	function(err, response) {  
	    if(err) {
	    	console.log('\nERROR:' + err);
	    	callback_error(err);
	    }
	    else{
	    	//CREO LAS RELACIONES
	    	//console.log('\nRESPONSE:' + JSON.stringify(response));
	    	dbneo.getNodeById(response.typeNode, function(err, nodeType){
	    		//TYPE
	    		dbneo.getNodeById(response.messagesNode, function(err, nodeMessages){
	    			//---says-->MESSAGES
	    			_createRelationshipType (API_SMS_REL, nodeType, nodeMessages);	
	    		});

	    		dbneo.getNodeById(response.functionsNode, function(err, nodeFunctions){
	    			//---does-->FUNCTIONS
	    			_createRelationshipType (API_FUNCTION_REL, nodeType, nodeFunctions);	
	    		});

	    		/*dbneo.getNodeById(response.subtypeNode, function(err, nodeSupertype){
	    			//---is_a-->SUPERTYPE
	    			_createRelationshipType (IS_REL, nodeType, nodeSupertype);
	    		});*/
	    		that.asociarSubtype(that._json.subtype.name);

	    		/*dbneo.getNodeById(response.ownerThings, function(err, nodeThings){
	    			//---has_things-->THINGS
	    			_createRelationshipType (OWNS_REL, nodeType, nodeThings);
	    		});*/

	    		callback_error(null);
	    	});
	    }
	});
};

// Para comprobar que el Type existe 
// DEVUELVE TRUE si existe el type en la DB;
// nodoTypeProperty = 'name'
// nodoTypeValue = nombre del tipo
Type.prototype.comprobarType =	function(nodoTypeValue, callback){  //se les pasa el property y valor del nodo a buscar
	dbneo.getIndexedNodes("Types", 'name', nodoTypeValue, function(err, nodos){
		if(err) {
			console.log('\n comprobarType-ERROR:' + err);
			callback(false);
		}
		else{
			//console.log('\n comprobarType-Nodo TYPE: name='+nodoTypeValue);
			//console.log('\n comprobarType-Busqueda:'+ JSON.stringify(nodos));
			if(nodos.length > 0) callback(true);
			else callback(false);
		}
	});
};


Type.prototype.getAllTypes = function(callback){  
	//start n=node(*) where has(n.label) and n.label = "Type" return *
	dbneo.query([ 'START n=node(*)',
				  'WHERE has(n.label) AND n.label = "TYPE"',
				  'RETURN id(n), n.name ORDER BY n.name'
				].join('\n'), function(err, nodes){
					if(err){
						console.log('\nERROR dbneo.query getAllTypes:'+ err); 
						callback(false);
					} else{
						//console.log('\n RETURN nodes ::::>'+ JSON.stringify(nodes));  //ORDER BY node.id
						callback(nodes);
					}
				}
			);
	};

Type.prototype.getTypeID = function(id, callback){  
	
	dbneo.query([ 'START a=node('+id+')',
				  'MATCH a-[r]->b',
				  'RETURN a, r, b'
				].join('\n'), function(err, nodes){
					if(err){
						console.log('\nERROR dbneo.query getTypeID:'+ err); 
						callback(null);
					} else{
						//console.log('\n node.r:'+ JSON.stringify(nodes[0].r.type));  //ORDER BY node.id
						//console.log('\n node.b:'+ JSON.stringify(nodes[0].b.data));  //ORDER BY node.id
						callback(nodes);
					}
				}
			);
	};

/*var _getThingStatus = function(id, callback){  
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
	};*/


var _getStatusID = function(id, callback){  //id del type
	
	dbneo.query([ 'START a=node('+id+')',
				  'MATCH a-[:SAYS]->b',
				  'RETURN b'
				].join('\n'), function(err, nodes){
					if(err){
						console.log('\nERROR dbneo.query getStatusID:'+ err); 
						callback(null);
					} else{
						//console.log('\n node.r:'+ JSON.stringify(nodes[0].r.type));  //ORDER BY node.id
						console.log('\n node.status:'+ JSON.stringify(nodes[0].b.data));  //ORDER BY node.id
						callback(nodes[0].b.data);
					}
				}
			);
	};


Type.prototype.devolverPlantillaStatus = function(nameType, callback){ 
	
	//console.log("\nQuiero crear una plantilla de Status de " + nameType);
	_getIDTypeByName(nameType, function(typeID){
		if(typeID){
			//console.log("\ntypeID = " + typeID);
		    _getStatusID(typeID, function(status_node){
		    	//console.log("\nstatus_node = " + status_node);
		    	callback(status_node);
		    });
		}
		else console.log("\ndevolverPlantillaStatus: " +nameType + " DOESN'T EXIST!");
	});
}



module.exports = Type;