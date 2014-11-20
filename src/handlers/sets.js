"use strict";
var utils = require( "../utils" );

module.exports = function( app, config ) {

	var dbagent = require( config.dbagent );
	app.get( config.path + "/:set", function( req, res ) {

		var body = { links: [] };
		var set = req.params.set;
		var selfLink = utils.links.buildForSet( config, req.permissions, set );
		if( selfLink ) {

			selfLink.rel = "self";
			body.links.push( selfLink );

		}
		dbagent.fetchSetUserIndex( config, req.params.set, req.user, function( err, index ) {

			if( err ) throw err;
			for( var item in index ) {

				var itemLink = utils.links.buildForItem( config, req.permissions, set, item);
				if( itemLink ) body.links.push( itemLink );

			}
			body.itemCount = Object.keys( index ).length;
			res.send( body );

		} );

	} );

}