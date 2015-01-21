var async = require('async');
var neo4j = require('neo4j');
var dbneo = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474')

var Type = require('./type4j');
var Thing = require('./thing4j');
var Environment = require('./environment4j');

//var wemoAPI = require('./type api/wemo-api'); 
//wemoAPI.switch_on();

//examples THINGS + FORMATS
var electricJSON = {
	type: {name: 'Electrical device', description: 'Produces or is powered by electricity.', label:'TYPE'},
	subtype: {name: 'Object', description: 'Set of everything.'},
	messages: {state: 'Switched %', who: 'I am an electrical device.'},
	functions: {"switch on": 'function(){ set_state(On);}', "switch off": 'function(){ set_state(Off);}'}
};

var switchJSON = {
	type: {name: 'Switch', description: 'Type of a switch: on/off.', label:'TYPE'},
	subtype: {name: 'Electrical device', description: 'Produces or is powered by electricity.'},
	messages: {state: 'Switched %', who: 'I am a switch.'},
	functions: {"switch on": 'function(){ super.set_state(On);}', "switch off": 'function(){ super.set_state(Off)}'}
};

var lampJSON = {
	thing: {description: 'Desk lamp', name: 'Lamp', label:'THING'},
	state: {state: 'on'},
	location: {lat: '40.42', long:'-3.6695', rad: '0.5'}
};

var thermostatJSON = {
	type: {name: 'Thermostat', description: 'Senses the temperature of a system.', label:'TYPE'},
	subtype: {name: 'Electrical device', description: 'Produces or is powered by electricity.'},
	messages: {state: 'Switched %', who: 'I am a thermostat.', temperature: "It's % degrees Celsius."},
	functions: {"switch on": 'function(){ super.set_state(On);}', "switch off": 'function(){ super.set_state(Off);}', "temperature up": 'function(){ set_attribute(temperature, 21);}', "temperature down": 'function(){ set_attribute(temperature, 15);}'}
};

var nestJSON = {
	thing: {description: 'Nest learning thermostat', name: 'Nest', label:'THING'},
	state: {state: 'on', temperature: '21'}, //degrees Celsius
	location: {lat: '40.42', long:'-3.669', rad: '2.5'}
};

var wemoswitchJSON = {
	type: {name: 'WeMo Switch', description: 'The Belkin Wi-Fi enabled WeMo Switch lets you turn electronic devices on or off from anywhere.', label:'TYPE'},
	subtype: {name: 'Switch', description: 'Type of a switch: on/off.'},
	messages: {state: 'Switched %', who: 'I am a switch.'},
	functions: {  "switch on": 'function(){ var wemoAPI = require(\'./type api/wemo-api\'); wemoAPI.switch_on(); }'
				, "switch off": 'function(){ var wemoAPI = require(\'./type api/wemo-api\'); wemoAPI.switch_off(); }'}
};



exports.prueba = function(request, response){
	var idThing = request.params.idthing;
	var thing = new Thing("test");

	thing.obtenerStatusByID(idThing, function(estado){
		console.log("PRUEBA - estado "+ JSON.stringify(estado));
	});	

	response.send(200, "Thing #"+ idThing +"");
};

exports.createThingExample = function(){
	var lampara = new Thing(lampJSON.thing.name);
	var nest = new Thing(nestJSON.thing.name);

	async.series([
		function(callback){		
			lampara.creandoThing(lampJSON, switchJSON.type.name);
	        callback(null, 'lampara: creandoThing & asociandoThingToType, ');
	    },
	    function(callback){		
			nest.creandoThing(nestJSON, thermostatJSON.type.name);
	        callback(null, 'nest: creandoThing & asociandoThingToType');
	    }
	],
	function(err, results){  
	    console.log('\n--->' + results);
	});
};


exports.createTypeExample = function(){
	var interruptor = new Type(switchJSON.type.name);
	var termostato = new Type(thermostatJSON.type.name);
	var dispositivo = new Type(electricJSON.type.name);
	var wemo = new Type(wemoswitchJSON.type.name);
			
	        dispositivo.comprobarType(electricJSON.type.name, function(result){
	        	if(result){
	        		console.log("\n"+electricJSON.type.name + " EXISTS!");
	        	} else{
	        		console.log("\n"+electricJSON.type.name + " DOESN'T EXIST yet!");
	        		dispositivo.creandoType(electricJSON, function(error){
 						if(error) console.log("ERROR " + error);
	        		});
	        	}
	        });

	        interruptor.comprobarType(switchJSON.type.name, function(result){
	        	if(result){
	        		console.log("\n"+switchJSON.type.name + " EXISTS!");
	        	} else{
	        		console.log("\n"+switchJSON.type.name + " DOESN'T EXIST yet!");
	        		interruptor.creandoType(switchJSON, function(error){
 						if(error) console.log("ERROR " + error);
	        		});
	        	}
	        });

	        termostato.comprobarType(thermostatJSON.type.name, function(result){
	        	if(result){
	        		console.log("\n"+thermostatJSON.type.name + " EXISTS!");
	        	} else{
	        		console.log("\n"+thermostatJSON.type.name + " DOESN'T EXIST yet!");
	        		termostato.creandoType(thermostatJSON, function(error){
 						if(error) console.log("ERROR " + error);
	        		});
	        	}
	        });

	        wemo.comprobarType(wemoswitchJSON.type.name, function(result){
	        	if(result){
	        		console.log("\n"+wemoswitchJSON.type.name + " EXISTS!");
	        	} else{
	        		console.log("\n"+wemoswitchJSON.type.name + " DOESN'T EXIST yet!");
	        		wemo.creandoType(wemoswitchJSON, function(error){
 						if(error) console.log("ERROR " + error);
	        		});
	        	}
	        });
};



var blasterJSON = {
	environment: {name: 'Nieves Blaster', description: 'This is my personal environment, linked to my Things and Services.', type: 'Personal Environment', label:'ENVIRONMENT'}
};

exports.createEnvironmentExample = function(){
	var entorno = new Environment(blasterJSON.environment.name);

	async.series([
		function(callback){		
			entorno.creandoEnvironment(blasterJSON, ["Lamp", "Nest"]);
	        callback(null, 'creando Environment');
	    }
	],
	function(err, results){  
	    console.log('\n--->' + results);
	});
};