//pln.js
//var pln = require('natural');
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('f86d4033d563e7b92932baf9383732541afcdf84');

var texto = "Juan Rodriguez Beltrán nació en Gama el 22 de septiembre de 1974. Hijo de Benito Rodríguez y de María Florinda Beltrán, desde niño fue muy inquieto y amante de la naturaleza. Estudio en la escuela Mis pequeñas travesuras. Sus materias preferidas fueron español y, por supuesto, biología. La entantaba diseccionar sapos, estudiarlos. Su profesora preferida era Ana Martínez, que aunque estricta, supo reconocer en él talento y curiosidad por las cosas. Y él supo ganarse su cariño. Una vez graduado se fue a estudiar a la ciduad, en el colegio Nueva Israel, donde más tarde se graduaría. Con todo, su felicidad no era completa porque padecía de afecciones respiratorias, lo que le hacía ir de vez en vez al médico. En el año  1991 logró su grado como bachiller y logró ingresar a la Universidad, paradójicamente no Biología ni nada relacionado con la naturaleza, sino sistemas. Al año falleció su padre, y esto lo retrajo un poco. Sin embargo, en la Universidad conocería al amor de su vida, Noemí Velásquez, con quien contraería nupcias tiempo después.";
var testURL2 = "http://betabeers.com/en/user/nieves-abalos-serrano-5049/"
var testURL = "https://github.com/framingeinstein/node-alchemy";

alchemy.entities(texto, {}, function(err, response) {  //<URL|HTML|TEXT>
  if (err) throw err;

  // See http://www.alchemyapi.com/api/entity/htmlc.html for format of returned object
  var entities = response.entities;

  // Do something with data
  console.log("\nENTIDADES: " + JSON.stringify(entities));
});



/*
{
"type":"Person",
"relevance":"0.965",
"count":"1",
"text":"Juan Rodriguez Beltrán"
},
{
"type":"Person",
"relevance":"0.931477",
"count":"1",
"text":"Benito Rodríguez"
},
{
"type":"Country",
"relevance":"0.91733",
"count":"1",
"text":"Israel"
},
{
"type":"Person",
"relevance":"0.880341",
"count":"1",
"text":"María Florinda Beltrán"
},
{
"type":"Person",
"relevance":"0.876364",
"count":"1",
"text":"Ana Martínez"
},
{
"type":"Person",
"relevance":"0.867273",
"count":"1",
"text":"Noemí Velásquez"
}
]

*/

/*
* PLN - ESPAÑOL
* Input: recognized text (by ASR) + ...
* Output: text + recognized semantics
*/

/*var plnManager = new function(textRecognized){

		// extract keywords from text
		// data in json
}*/