var express = require('express');
var csurf = require('csurf');
var stormpath = require('express-stormpath');
var extend = require('xtend');

// Export a function which will create the
// router and return it


function renderFabcode(req,res,locals){
  console.log(req.projectName);
  res.render('newfabcode', extend({
    title: 'My Fabcode',
  },locals||{}));
}


module.exports = function fabcode(){

  var router = express.Router();


  router.use(csurf({ sessionKey: 'stormpathSession' }));

  router.all('/', function(req, res) {
    renderFabcode(req,res,{
              saved:true
            });
  }); 



  return router;
  };

  