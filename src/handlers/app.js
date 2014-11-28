"use strict";
var utils = require( "../utils" );

module.exports = function( app, config ) {

	app.get( config.path, function( req, res ) {

		var body = { };
		if( req.permissions.APIGET ) {

			var def = app.get( "def" ) || {};
			var sets = def.sets || [];

			body.links = sets
				.map( utils.links.buildForSet.bind( this, config, req.permissions) )
				.filter( function( link ) { return !!link; } );

		} else {

			body.links = [];

		}
		res.send( body );

	} );

};