	var express = require('express');
	var stormpath = require('express-stormpath');




	var app = express();

	app.set('views', './views');
	app.set('view engine', 'jade');
	app.use(express.static('./public'));
	app.use(express.static('./bower_components/blockly'));
	app.use(express.static('./bower_components/threejs/build'));



	var stormpathMiddleware = stormpath.init(app, {
		apiKeyFile: 
		application: 
		secretKey: 

	   // redirectUrl: '/home',
	});

	app.use(stormpathMiddleware);


	app.get('/', require('./main')());

	//app.use('/home',stormpath.loginRequired,require('./main')());
	app.use('/:username',stormpath.loginRequired, function(req, res, next) {
		if(req.user.username == req.params.username){
			next();
		}
		else{ 
			res.render('404', {
			title: 'no page found'
			});
			res.end('');
		}
		
	  });

	app.use('/:username', stormpath.loginRequired,require('./main')());

	app.use('/profile',stormpath.loginRequired,require('./profile')());

	app.use('/:username/:projectName',stormpath.loginRequired, function(req, res) {

		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;

		if(req.user.username == req.params.username){

			      for (i = 0; i < req.user.customData.projects.length; ++i) {
	    				entry = req.user.customData.projects[i];
	    				
	    				
	        			if(entry.nameofProject == req.params.projectName){

				if(typeof query.xml === 'undefined'){
	   		res.render('newfabcode', {
	    	title: 'My Fabcode',
	    	projectName: entry.nameofProject,
	  		});
			}
	   	else if(query.xml === 'render'){
			      
	        				res.setHeader('Content-Type', 'application/json');
	              			res.send(req.user.customData.projects[i].dataofProject);
			      			 				
					}
	   		
	 	else {
	 	res.setHeader('Content-Type', 'application/json');
		console.log("xsc s", req.user.customData.projects.length);
			      for (i = 0; i < req.user.customData.projects.length; ++i) {
	    				entry = req.user.customData.projects[i];
	    				
	        			if(entry.nameofProject == req.params.projectName){
			      		req.user.customData.projects[i].dataofProject = query.xml;
						req.user.save();
						res.send(entry.dataofProject);
						res.end(JSON.stringify({ a: query }));
			      			}    				
					}
	 	}
			
		}
	}
	}
		else{ 
			res.render('404', {
			title: 'no page found'
			});
			res.end('');
		}
		
		
		

		
		
	  });

	app.listen(process.env.PORT || 3000);