var express = require('express');
var csurf = require('csurf');
var stormpath = require('express-stormpath');
var extend = require('xtend');

// Export a function which will create the
// router and return it




module.exports = function dataupload(xmldata){
  var router = express.Router();
  router.use(csurf({ sessionKey: 'stormpathSession' }));

  console.log(xmldata);

  return router;

};