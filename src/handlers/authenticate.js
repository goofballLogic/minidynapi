var express = require( "express" );

module.exports = function( app, config ) {

	app.use( function( req, res, next ) {

		var auth = req.headers.authorization;
		if( !auth ) return next();
		if( auth.indexOf( "Test" ) == 0 ) {

			req.authmethod = "Test";
			req.authenticated = true;
			req.user = auth.slice( 5 );

		}
		next();

	} );

};