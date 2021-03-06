
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Maya' });
};


exports.unknown_event = function(req, res){
  res.render('unknown_event', { title: 'Unknown Event' });
};

exports.login = function(req, res){
  res.render('login', { 
  	title: 'Maya',
  	subtitle: 'User autentication'
  });
};

exports.ioe = function(req, res){
  res.render('ioe', { 
  	title: 'Maya',
  	subtitle: 'IOE Manager'
  });
};

exports.ioe_thing_add = function(req, res){
  res.render('ioe_addThing', { 
  	title: 'Maya',
  	subtitle: 'Things Manager',
    info: 'Add a new Thing'
  });
};

exports.ioe_env_add = function(req, res){
  res.render('ioe_addEnvironment', { 
    title: 'Maya',
    subtitle: 'Environment Manager',
    info: 'Add a new Environment'
  });
};

exports.ioe_type_add = function(req, res){
  res.render('ioe_addType', { 
  	title: 'Maya',
  	subtitle: 'Format Manager',
    info: 'Add a new Format'
  });
};

exports.ioe_error = function(req, res){
  res.render('ioe_error', { 
    title: 'Maya',
    subtitle: 'ERROR',
    info_error: ''
  });
};

exports.ioe_success = function(req, res){
  res.render('ioe_success', { 
    title: 'Maya',
    subtitle: ' ',
    info_success: ''
  });
};

exports.book_detail = function(req, res){
  res.render('book_detail', { 
    title: 'BeevaLibs',
    subtitle: 'Book',
    info_details: 'Details'
  });
};

exports.book_list = function(req, res){
  res.render('book_list', { 
    title: 'BeevaLibs',
    subtitle: 'Book',
    info_details: ''
  });
};