"use strict";
module.exports = function( app, config ) {

	var dbagent = require( config.dbagent );
	app.use( function( req, res, next ) {

		var permissions = {};
		req.permissions = permissions;
		if( !req.authenticated ) return next();
		dbagent.fetchUserEntitlements( config, req.user, function( err, entitlements ) {

			if( err ) return next( err );
			entitlements = entitlements || {};

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

				dbagent.fetchRoleEntitlements( config, role, function( err, entitlements ) {

					if( err ) return next( err );
					addPermissions( entitlements );
					delete pending[ role ];
					if( Object.keys( pending ).length == 0 ) next();

				} );

			} );

		} );

	} );

};