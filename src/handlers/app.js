"use strict";
var utils = require( "../utils" );

module.exports = function( app, config ) {

	app.get( config.path, function( req, res ) {

		var body = { };
		if( req.permissions.APIGET ) {

			var def = app.get( "def" ) || {};
			var sets = def.sets || [];
			body.links = sets
				.map( buildSetLink.bind( this, config, req.permissions) )
				.filter( function( link ) { return !!link; } );

		} else {

			body.links = [];

		}
		res.send( body );

	} );

};

function buildSetLink( config, permissions, set ) {

	function has( x ) { return !!~CRUD.indexOf( x ); }
	var CRUD = "";
	( permissions.sets || [] )
		.filter( function( setPermission ) { return setPermission.CRUD; } )
		.filter( function( setPermission ) { return setPermission.name.test( set ); } )
		.forEach( function( setPermission ) {

			for( var i = 0; i < setPermission.CRUD.length; i++ ) {

				var perm = setPermission.CRUD[ i ].toLowerCase();
				if( !has( perm ) ) CRUD = CRUD + perm;

			}

		} );

	var canRead = has( "r" );
	var canCreate = has( "c" );
	if( !( canRead || canCreate ) ) return null;
	var verbs = [];
	if( canRead ) verbs.push( "get" );
	if( canCreate ) verbs.push( "post" );
	return {

		"rel" : set,
		"href" : utils.makeSetURI( config, set ),
		"verbs" : verbs

	};

}