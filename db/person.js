var async = require('async');
var neo4j = require('neo4j');
var dbneo = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474')

var Type = require('./type4j');
var Thing = require('./thing4j');
var Environment = require('./environment4j');


//TIPOS
var personalDataJSON = {
	type: {name: 'Personal data', description: 'Any kind of personal information', label:'TYPE'},
	subtype: {name: 'Object', description: 'Set of everything.'},
	messages: {state: '%', who: 'I am personal information.'},
	functions: {"restrict_data": 'function(){ set_state(Restricted);}', "allow_data": 'function(){ set_state(Allowed);}'}
};

var publicDataJSON = {
	type: {name: 'Public data', description: 'Public information. Read-only permissions.', label:'TYPE'},
	subtype: {name: 'Personal data', description: 'Any kind of personal information.'},
	messages: {state: 'Allowed', who: 'I am public personal information.'},
	functions: {"read": 'function(){ get_content();}'}
};

var privateDataJSON = {
	type: {name: 'Private data', description: 'Private information.', label:'TYPE'},
	subtype: {name: 'Object', description: 'Set of everything.'},
	messages: {state: 'Restricted', who: 'I am private personal information.'},
	functions: {"read": 'function(){ console.log("Access not allowed to this content.");}'}
};


exports.createTypeExample = function(){
	var datosPersonales = new Type(personalDataJSON.type.name);
	var datosPublicos = new Type(publicDataJSON.type.name);
	var datosPrivados = new Type(privateDataJSON.type.name);
	
			
	        datosPersonales.comprobarType(personalDataJSON.type.name, function(result){
	        	if(result){
	        		console.log("\n"+personalDataJSON.type.name + " EXISTS!");
	        	} else{
	        		console.log("\n"+personalDataJSON.type.name + " DOESN'T EXIST yet!");
	        		datosPersonales.creandoType(personalDataJSON, function(error){
 						if(error) console.log("ERROR " + error);
	        		});
	        	}
	        });

	        datosPublicos.comprobarType(publicDataJSON.type.name, function(result){
	        	if(result){
	        		console.log("\n"+publicDataJSON.type.name + " EXISTS!");
	        	} else{
	        		console.log("\n"+publicDataJSON.type.name + " DOESN'T EXIST yet!");
	        		datosPublicos.creandoType(publicDataJSON, function(error){
 						if(error) console.log("ERROR " + error);
	        		});
	        	}
	        });

	        datosPrivados.comprobarType(privateDataJSON.type.name, function(result){
	        	if(result){
	        		console.log("\n"+privateDataJSON.type.name + " EXISTS!");
	        	} else{
	        		console.log("\n"+privateDataJSON.type.name + " DOESN'T EXIST yet!");
	        		datosPrivados.creandoType(privateDataJSON, function(error){
 						if(error) console.log("ERROR " + error);
	        		});
	        	}
	        });
};


//THINGS:
var medicalReport1JSON = {
	thing: {description: '2nd Blood test, 29/08/2013', name: '2nd Blood test', label:'THING'},
	state: {state: 'Allowed', results: 'normal', URI:'./medical/reports/blood/29_08_2013.pdf'},
	location: {lat: '0', long:'0', rad: '0.0'}
};

var medicalReport2JSON = {
	thing: {description: '1st Blood test, 26/06/2013', name: '1st Blood test', label:'THING'},
	state: {state: 'Allowed', results: 'low cholesterol', URI:'./medical/reports/blood/26_06_2013.pdf'},
	location: {lat: '0', long:'0', rad: '0.0'}
};

var bankAccount1JSON = {
	thing: {description: 'BBVA Bank account information shared with my family.', name: 'Bank Account - Family', label:'THING'},
	state: {state: 'Restricted', URI:'./bank/accounts/family/'},
	location: {lat: '0', long:'0', rad: '0.0'}
};

var bankAccount2JSON = {
	thing: {description: 'My BBVA Bank account information.', name: 'Bank Account', label:'THING'},
	state: {state: 'Restricted', URI:'./bank/accounts/personal/'},
	location: {lat: '0', long:'0', rad: '0.0'}
};

var mortgageJSON = {
	thing: {description: 'Home mortgage information.', name: 'Mortgage', label:'THING'},
	state: {state: 'Restricted', URI:'./bank/mortgage/'},
	location: {lat: '0', long:'0', rad: '0.0'}
};

var creditCardJSON = {
	thing: {description: 'My VISA credit card number.', name: 'VISA', label:'THING'},
	state: {state: 'Restricted', URI:'./bank/creditcards/visa/'},
	location: {lat: '0', long:'0', rad: '0.0'}
};

var twitterAccountJSON = {
	thing: {description: 'My Twitter Account', name: 'Twitter', label:'THING'},
	state: {state: 'Allowed', URI:'https://twitter.com/carlos'},
	location: {lat: '0', long:'0', rad: '0.0'}
};

var linkedinAccountJSON = {
	thing: {description: 'My Linkedin Account', name: 'Linkedin', label:'THING'},
	state: {state: 'Allowed', URI:'http://www.linkedin.com/pub/carlos'},
	location: {lat: '0', long:'0', rad: '0.0'}
};

exports.createThingExample = function(){
	var medicalReport1 = new Thing(medicalReport1JSON.thing.name);
	var medicalReport2 = new Thing(medicalReport2JSON.thing.name);
	var bankAccount1 = new Thing(bankAccount1JSON.thing.name);
	var bankAccount2 = new Thing(bankAccount2JSON.thing.name);
	var mortgage = new Thing(mortgageJSON.thing.name);
	var creditCard = new Thing(creditCardJSON.thing.name);
	var twitterAccount = new Thing(twitterAccountJSON.thing.name);
	var linkedinAccount = new Thing(linkedinAccountJSON.thing.name);

	async.series([
		function(callback){		
			medicalReport1.creandoThing(medicalReport1JSON, publicDataJSON.type.name);
	        callback(null, 'medicalReport1: creandoThing & asociandoThingToType, ');
	    },
	    function(callback){		
			medicalReport2.creandoThing(medicalReport2JSON, publicDataJSON.type.name);
	        callback(null, 'medicalReport2: creandoThing & asociandoThingToType');
	    },
	    function(callback){		
			bankAccount1.creandoThing(bankAccount1JSON, privateDataJSON.type.name);
	        callback(null, 'bankAccount1: creandoThing & asociandoThingToType, ');
	    },
	    function(callback){		
			bankAccount2.creandoThing(bankAccount2JSON, privateDataJSON.type.name);
	        callback(null, 'nest: creandoThing & asociandoThingToType');
	    },
	    function(callback){		
			mortgage.creandoThing(mortgageJSON, privateDataJSON.type.name);
	        callback(null, 'mortgage: creandoThing & asociandoThingToType, ');
	    },
	    function(callback){		
			creditCard.creandoThing(creditCardJSON, privateDataJSON.type.name);
	        callback(null, 'creditCard: creandoThing & asociandoThingToType');
	    },
	    function(callback){		
			twitterAccount.creandoThing(twitterAccountJSON, publicDataJSON.type.name);
	        callback(null, 'twitterAccount: creandoThing & asociandoThingToType, ');
	    },
	    function(callback){		
			linkedinAccount.creandoThing(linkedinAccountJSON, publicDataJSON.type.name);
	        callback(null, 'linkedinAccount: creandoThing & asociandoThingToType');
	    }
	],
	function(err, results){  
	    console.log('\n--->' + results);
	});
};


//person.me
var personJSON = {
	environment: {name: 'Carlos', user_mail: 'carlos.munoz.romero@bbva.com', description: 'This is my personal environment, linked to my Things and Services.', type: 'Personal Environment', label:'ENVIRONMENT'}
};

// entornos de mi person
var medicalJSON = {
	environment: {name: 'Medical Data', description: 'Medical reports.', type: 'Medical Environment', label:'ENVIRONMENT'}
};

var financialJSON = {
	environment: {name: 'Financial Data', description: 'Bank reports, mortgages, payrolls.', type: 'Financial Environment', label:'ENVIRONMENT'}
};

var internetServicesJSON = {
	environment: {name: 'Internet Services', description: 'All services: Social Networks and other accounts.', type: 'Internet Services Environment', label:'ENVIRONMENT'}
};


exports.createEnvironmentExample = function(){
	var miEntorno = new Environment(personJSON.environment.name);
	var medico = new Environment(medicalJSON.environment.name);
	var financiero = new Environment(financialJSON.environment.name);
	var servicios = new Environment(internetServicesJSON.environment.name);

	async.series([
		function(callback){		
			medico.creandoEnvironment(medicalJSON, [medicalReport1JSON.thing.name, medicalReport2JSON.thing.name]);  //"Lamp", "Nest"
	        callback(null, 'creando Environment medico');
	    },
	    function(callback){		
			financiero.creandoEnvironment(financialJSON, [bankAccount1JSON.thing.name, bankAccount2JSON.thing.name, mortgageJSON.thing.name, creditCardJSON.thing.name]);  //"Lamp", "Nest"
	        callback(null, 'creando Environment financiero');
	    },
	    function(callback){		
			servicios.creandoEnvironment(internetServicesJSON, [twitterAccountJSON.thing.name, linkedinAccountJSON.thing.name]);  //"Lamp", "Nest"
	        callback(null, 'creando Environment servicios');
	    },
	],
	function(err, results){  
	    console.log('\n--->' + results);
	    	
		miEntorno.creandoEnvironment(personJSON, ['Medical Data', 'Financial Data', 'Internet Services']);
		console.log('\n creando Environment miEntorno');
		
	});
};


