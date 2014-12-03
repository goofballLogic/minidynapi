"use strict";
var utils = require( "../utils" );

module.exports = function( app, config ) {

	var dbagent = require( config.dbagent );

	app.get( config.path + "/:set/:uid/:iid", function( req, res, next ) {

		var set = req.params.set;
		var uid = req.params.uid;
		var iid = req.params.iid;
		if( uid != req.user ) return res.sendStatus( 403 );
		var selfLink = utils.links.buildForUserItem( config, req.permissions, set, uid, iid );
		var verbs = selfLink.verbs;
		if( !~verbs.indexOf( "get" ) ) return res.sendStatus( 403 );
		dbagent.fetchUserItem( config, set, uid, iid, function( err, payload, exists ) {

			if( err ) return next( err );
			if( !exists ) {

				return res.sendStatus( 404 );

			}
			var body = { "value" : payload };
// TODO: return links
			res.send( body );

		} );

	} );

	app.put( config.path + "/:set/:uid/:iid", function( req, res, next ) {

		var set = req.params.set;
		var uid = req.params.uid;
		var iid = req.params.iid;
		if( uid != req.user ) return res.sendStatus( 403 );
		var selfLink = utils.links.buildForUserItem( config, req.permissions, set, uid, iid );
		var verbs = selfLink.verbs;
		if( !~verbs.indexOf( "put" ) ) return res.sendStatus( 403 );
		dbagent.setUserItem( config, set, uid, iid, req.body, function( err, iid ) {

			if( err ) return next( err );
			res.sendStatus( 204 );

		} );

	} );

	app.delete( config.path + "/:set/:uid/:iid", function( req, res, next ) {

		var set = req.params.set;
		var uid = req.params.uid;
		var iid = req.params.iid;
		if( uid != req.user ) return res.sendStatus( 403 );
		var selfLink = utils.links.buildForUserItem( config, req.permissions, set, uid, iid );
		var verbs = selfLink.verbs;
		if( !~verbs.indexOf( "put" ) ) return res.sendStatus( 403 );
		dbagent.removeUserItem( config, set, uid, iid, function( err ) {

			if( err ) return next( err );
			res.sendStatus( 200 );

		} );

	} );

};
