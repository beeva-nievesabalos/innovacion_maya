var WeMo = require('../../node_modules/wemo/index.js');

exports.switch_on = function(){
  WeMo.discover(function(WeMos) {

    WeMos.forEach(function(thisWeMo) {

      console.log('Found %s at %s',thisWeMo.info.device.friendlyName,thisWeMo.location.host);
      var client = WeMo.createClient(thisWeMo.location.host);
      client.state(function(err,state) {

        if (state===1) {
          // WeMo if on, turn it off
          //console.log('Turning %s Off',thisWeMo.info.device.friendlyName)
          //client.off();
          console.log('Already turned on');
        } else {
          // WeMo is off, turn it on
          console.log('Turning %s On',thisWeMo.info.device.friendlyName);
          client.on();
        }
      });
    });
  });
}

exports.switch_off = function(){
  WeMo.discover(function(WeMos) {

    WeMos.forEach(function(thisWeMo) {

      console.log('Found %s at %s',thisWeMo.info.device.friendlyName,thisWeMo.location.host);
      var client = WeMo.createClient(thisWeMo.location.host);
      client.state(function(err,state) {

        if (state===1) {
          // WeMo if on, turn it off
          console.log('Turning %s Off',thisWeMo.info.device.friendlyName)
          client.off();
        } else {
          // WeMo is off, turn it on
          console.log('Already turned off');
          //console.log('Turning %s On',thisWeMo.info.device.friendlyName)
          //client.on();
        }
      });
    });
  });
}