"use strict";
var cache = require( "../utils" ).cache;

module.exports = function( app, config ) {

	var dbagent = require( config.dbagent );
	app.use( function( req, res, next ) {

		var permissions = {};
		req.permissions = permissions;
		if( !req.authenticated ) return next();

		var userEntitlementCache = cache.bucket( "user-entitlements" );
		var roleEntitlementCache = cache.bucket( "role-entitlements" );

		// attempt to retrieve the user entitlements from cache
		var entitlements = userEntitlementCache.retrieve( req.user );
		if( entitlements )
			process.nextTick( processUserEntitlements.bind( this, null, entitlements ) );
		else
			// fetch user entitlements from the database
			dbagent.fetchUserEntitlements( config, req.user, processUserEntitlements );

		function processUserEntitlements( err, entitlements ) {

			if( err ) return next( err );
			entitlements = entitlements || {};
			// ensure we cache the user entitlements
			userEntitlementCache.deposit( req.user, entitlements );

			function addPermissions( entitlements ) {

				for( var item in entitlements ) {

					if( item in permissions ) {

						permissions[ item ] = permissions[ item ] && entitlements[ item ];

					} else {

						permissions[ item ] = entitlements[ item ];

					}

				}

			}

			// map entitlements other than roles into the permissions object
			addPermissions( entitlements );
			// get roles
			req.roles = permissions.roles || [];
			delete permissions.roles;
			// if no roles, then exit
			if( !( req.roles && req.roles.length ) ) return next();
			// get entitlements due to role participation

			var pending = {};
			req.roles.forEach( function( role ) { pending[ role ] = true; } );
			req.roles.forEach( function( role ) {

				// try to retrieve role entitlements from cache
				var roleEntitlements = roleEntitlementCache.retrieve( role );
				if( roleEntitlements )
					process.nextTick( processRoleEntitlements.bind( this, null, roleEntitlements ) );
				else
					// fetch role entitlements from the database
					dbagent.fetchRoleEntitlements( config, role, processRoleEntitlements );

				function processRoleEntitlements( err, entitlements ) {

					if( err ) return next( err );
					entitlements = entitlements || {};
					// ensure we cache the role entitlements
					roleEntitlementCache.deposit( role, entitlements );
					// map entitlements from the role in to the permissions object
					addPermissions( entitlements );
					delete pending[ role ];
					if( Object.keys( pending ).length == 0 ) next();

				}

			} );

		}

	} );

};