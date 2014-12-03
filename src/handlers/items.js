"use strict";
var utils = require( "../utils" );

module.exports = function( app, config ) {

	var dbagent = require( config.dbagent );

	function buildKey( req ) {

		return JSON.stringify( req.params );

	}

	app.get( config.path + "/:set/:uid/:iid", function( req, res, next ) {

		var set = req.params.set;
		var uid = req.params.uid;
		var iid = req.params.iid;
		if( uid != req.user ) return res.sendStatus( 403 );
		var selfLink = utils.links.buildForUserItem( config, req.permissions, set, uid, iid );
		var verbs = selfLink.verbs;
		if( !~verbs.indexOf( "get" ) ) return res.sendStatus( 403 );

		var itemsCache = utils.cache.bucket( "items" );
		var key = buildKey( req );
		var payload = itemsCache.retrieve( key );
		if( payload )
			process.nextTick( fetchUserItemCallback.bind( null, payload, true ) );
		else
			dbagent.fetchUserItem( config, set, uid, iid, fetchUserItemCallback );

		function fetchUserItemCallback( err, payload, exists ) {

			if( err ) return next( err );
			if( !exists ) {

				return res.sendStatus( 404 );

			}
			var body = { "value" : payload };
// TODO: return links
			res.send( body );

		}

	} );

	app.put( config.path + "/:set/:uid/:iid", function( req, res, next ) {

		var set = req.params.set;
		var uid = req.params.uid;
		var iid = req.params.iid;
		if( uid != req.user ) return res.sendStatus( 403 );
		var selfLink = utils.links.buildForUserItem( config, req.permissions, set, uid, iid );
		var verbs = selfLink.verbs;
		if( !~verbs.indexOf( "put" ) ) return res.sendStatus( 403 );

		var itemsCache = utils.cache.bucket( "items" );
		var key = buildKey( req );
		itemsCache.remove( key );

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

		var itemsCache = utils.cache.bucket( "items" );
		var key = buildKey( req );
		itemsCache.remove( key );

		dbagent.removeUserItem( config, set, uid, iid, function( err ) {

			if( err ) return next( err );
			res.sendStatus( 200 );

		} );

	} );

};
