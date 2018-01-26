var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
var stormpath = require('express-stormpath');
var extend = require('xtend');

// Declare the schema of our form:

var homeForm = forms.create({
  projectName: forms.fields.string({
    required: true
  })
 
});

// A render function that will render our form and
// provide the values of the fields, as well
// as any situation-specific locals

function renderHome(req,res,locals){
  res.render('home', extend({
    title: 'Welcome',
    csrfToken: req.csrfToken(),
    projectName: '', 
    projectlisting: req.user.customData.projects,
    nameofUser: req.user.username,
  },locals||{}));

}

function renderHomelogout(req,res){
  res.render('home', extend({
    title: 'Welcome',
  }));

}


function createProjectArray(req, res){
   
   if(typeof req.user.customData.projects == 'undefined'){
    req.user.customData.projects = [];
    console.log("project is empty");
    console.log('creating user project',req.user.customData.save());
   }
   else{
    console.log('check');
   }
   
        
   
}

// Export a function which will create the
// router and return it

module.exports = function main(){
  
  //console.log(areq.params.username);
  var router = express.Router();

  router.use(csurf({ sessionKey: 'stormpathSession' }));

  // Capture all requests, the form library will negotiate
  // between GET and POST requests

  router.all('/', function(req, res) {
    
    homeForm.handle(req,{
      success: function(form){
        // The form library calls this success method if the
        // form is being POSTED and does not have errors

        // The express-stormpath library will populate req.user,
        // all we have to do is set the properties that we care
        // about and then cal save() on the user object:
        req.user.customData.projects.push({ nameofProject: form.data.projectName, dataofProject: '<xml xmlns=\"http://www.w3.org/1999/xhtml\"></xml>'});
        req.user.customData.save();
        req.user.save(function(err){
          if(err){
            if(err.developerMessage){
              console.error(err);
            }
            renderHome(req,res,{
              errors: [{
                error: err.userMessage ||
                err.message || String(err)
              }]
            });
          }else{
            
            res.redirect('/'+req.user.username+'/'+form.data.projectName);
          }
        });
      },
      error: function(form){
        // The form library calls this method if the form
        // has validation errors.  We will collect the errors
        // and render the form again, showing the errors
        // to the user

        renderHome(req,res,{
          errors: collectFormErrors(form)
        });
      },
      empty: function(){
        // The form library calls this method if the
        // method is GET - thus we just need to render
        // the form
        console.log('called from the empty block');
        //console.log(req.user);
        if(!req.user){
          console.log('you are not logged in');
          renderHomelogout(req,res);
        }else{
          console.log(req.user.customData.projects);
          createProjectArray(req, res);
          renderHome(req,res);
        }
        
      }
    });
  });

  // This is an error handler for this router

  router.use(function (err, req, res, next) {
    // This handler catches errors for this router
    if (err.code === 'EBADCSRFTOKEN'){
      // The csurf library is telling us that it can't
      // find a valid token on the form
      if(req.user){
        // session token is invalid or expired.
        // render the form anyways, but tell them what happened
        renderHome(req,res,{
          errors:[{error:'Your form has expired.  Please try again.'}]
        });
      }else{
        // the user's cookies have been deleted, we dont know
        // their intention is - send them back to the home page
        res.redirect('/');
      }
    }else{
      // Let the parent app handle the error
      return next(err);
    }
  });

  return router;
};


