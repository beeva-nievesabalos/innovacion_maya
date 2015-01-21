//var db = require('./db/dbHelper')
var http = require('http')
  , async = require('async')
  , EventEmitter = require('events').EventEmitter;

/* MAYA GLOBAL */
maya = new EventEmitter(); 
maya["server"] = require('./config');        //crea una variable que configura el server (express)
maya["info"] = "Maya rules";
maya["db"] = require('./db/dbHelper');
maya["neo4j"] = require('./db/neo4j');

maya["moment"] = require('moment');
maya.moment.lang('es'); 
maya.moment().local();

var Blasters = new EventEmitter();
Blasters["info"] = "Blasters rules";
maya["Blasters"] = Blasters;


/*var WeMo = require('wemo.js');


WeMo.discover(function(WeMos) {
  console.log('Lista de Wemos: ' + WeMos);
  WeMos.forEach(function(thisWeMo) {

    console.log('Found %s at %s',thisWeMo.info.device.friendlyName,thisWeMo.location.host);
    var client = WeMo.createClient(thisWeMo.location.host); //IP del wemo
    client.state(function(err,state) {

      if (state===1) {
        // WeMo if on, turn it off
        console.log('Turning %s Off',thisWeMo.info.device.friendlyName)
        client.off();
      } else {
        // WeMo is off, turn it on
        console.log('Turning %s On',thisWeMo.info.device.friendlyName)
        client.on();
      }
    });
  });
});
*/



/*db.getIDFromAliasAgent(aliasBlaster, function(result){
  console.log("["+aliasBlaster+"]=>"+result);
});
*/
maya.db.getActiveBlasters(function(result){
  var numBlasters = result.length;
  for (var i = 0; i < numBlasters; i++) {
    var blaster = result[i];
    var alias = result[i].alias;
    maya.Blasters[alias] = require(result[i].uri + "/me");          //require de cada me.js
    maya.Blasters[alias].info  = result[i];
    //console.log("*("+Maya.Blasters[alias].idAgents+")["+ Maya.Blasters[alias].alias +"]=> "+ Maya.Blasters[alias].description);
    //console.log("*URL["+ Maya.Blasters[alias].uri +"]");
    //console.log("\nB:"+alias+" ("+ JSON.stringify(maya.Blasters[alias]) +")");

    maya.db.getUserData(maya.Blasters[alias].info.idAgents, function(userData){
       var datos =  userData[0];
       maya.db.getAliasFromIDAgent(datos.idAgents, function(res){
          maya.Blasters[res].user = datos;
          maya.Blasters[res].user.info = datos.alias;
          //console.log("\nB:"+maya.Blasters[res].info.name+" <-> U:"+datos.name+" ("+ JSON.stringify(maya.Blasters[res].user) +")");
       });
    });
  } //for

  maya.db.getActivesAgentsInformation(function(result){
       var numAgents = result.length;
       for (var i = 0; i < numAgents; i++) {
          var agent = result[i].alias;
          maya[agent] = require(result[i].uri);
          maya[agent].info = result[i];
          /*Maya[agent] = {
            "this": new function(){require(result[i].uri);},
            "info": result[i]
          };*/
          //console.log("("+ Maya[agent].info.idAgents+")["+ Maya[agent].info.alias +"]=> "+ Maya[agent].info.description);
          //console.log("URL["+ Maya[agent].info.uri +"]");
          //console.log("\nA:"+agent+" ("+ JSON.stringify(maya[agent]) +")");
       }

        /**
         *  REST de la APP
         */
        // Avisa a geoffrey de que se ha recibido un nuevo evento
        // para REST: pide user y evento  || sin REST user, event y (function opc.)
        // newEvent: function(user, event, callback) con callback opcional, ya que si no es llamado, se evalua como un exec..
        maya.server.get('/api/events/new/:nameEvent/:nameUser',  maya.geoffrey.new_event); 

        // Avisa a Biix de que se ha recibido un nuevo evento
        // URL nueva /biix/newEvent/salida/pepe?hashID=djhfskjdhfkd
        maya.server.get('/biix/newEvent/:nameEvent/:nameUser',  maya.biix.new_event);

        // Calendar: lista de los eventos de hoy
        // URL nueva /calendar/agendaHoy/pepe?hashID=djhfskjdhfkd
        maya.server.get('/calendar/agendaHoy/:nameUser',  maya.calendar.agenda_hoy);
        maya.server.get('/calendar/listaCalendarios/:nameUser',  maya.calendar.lista_calendarios);

        // Devuelve la siguiente notificación pendiente de ser enviada.
        maya.server.get('/api/notify/:nameEvent',  maya.notify.show_notification_event);

        // Modifica en la base de datos la notificación marcándola como que ya ha sido recibida y enviada.
        maya.server.get('/api/notify/ack/:hashNotif',  maya.notify.notification_received);

        // Creamos el servidor y lo lanzamos 
        http.createServer(maya.server).listen(maya.server.get('port'), function(){
          //console.log('\n\n...Maya server listening on port ' + maya.server.get('port'));
        });
  });
});

