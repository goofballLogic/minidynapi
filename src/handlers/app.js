"use strict";

module.exports = function( app, config ) {

	app.get( config.path, function( req, res ) {

console.log( req.user, req.roles, req.permissions );
		if( !req.permissions.APIGET ) {

			return res.send( 401 );

		}
		res.send( {} );

	} );

};