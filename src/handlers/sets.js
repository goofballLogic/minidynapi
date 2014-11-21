"use strict";
var utils = require( "../utils" );

module.exports = function( app, config ) {

	var dbagent = require( config.dbagent );

	app.get( config.path + "/:set/", function( req, res ) {

		var set = req.params.set;
		var uid = req.user;
		var body = { links: [] };
		var selfLink = utils.links.buildForSet( config, req.permissions, set, uid );
		if( selfLink ) {

			selfLink.rel = "self";
			body.links.push( selfLink );

		}
		dbagent.fetchSetUserIndex( config, req.params.set, uid, function( err, index ) {

			if( err ) throw err;
			for( var item in index ) {

				var itemLink = utils.links.buildForUserItem( config, req.permissions, set, uid, item );
				if( itemLink ) body.links.push( itemLink );

			}
			body.itemCount = Object.keys( index ).length;
			res.send( body );

		} );

	} );

	app.post( config.path + "/:set/", function( req, res ) {

		var set = req.params.set;
		var uid = req.user;
		dbagent.setUserItem( config, set, uid, null, req.body, function( err, iid ) {

			if( err ) throw err;
			var itemLink = utils.links.buildForUserItem( config, req.permissions, req.params.set, req.user, iid );
			res.set( "Location", itemLink.href );
			res.sendStatus( 201 );

		} );

	} );

}