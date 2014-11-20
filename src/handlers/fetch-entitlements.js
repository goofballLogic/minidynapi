module.exports = function( app, config ) {

	var dbagent = require( config.dbagent );
	app.use( function( req, res, next ) {

		if( !req.authenticated ) return next();
		dbagent.fetchUserEntitlements( config, req.user, function( err, entitlements ) {

			if( err ) return next( err );
			var permissions = {};
			for( var item in entitlements )
				if( item !== "roles" ) meld( permissions, item, entitlements[ item ] );
			req.roles = entitlements.roles || [];
			var pending = {};
			req.roles.forEach( function( role ) { pending[ role ] = true; } );
			req.roles.forEach( function( role ) {

				dbagent.fetchRoleEntitlements( config, role, function( err, entitlements ) {

					if( err ) return next( err );
					for( var item in entitlements ) meld( permissions, item, entitlements[ item ] );
					delete pending[ role ];
					if( Object.keys( pending ).length == 0 ) {

						req.permissions = permissions;
						next();

					}

				} );

			} );

		} );

	} );

	function meld( obj, key, value ) {

		if( key in obj ) {

			obj[ key ] = obj[ key ] && value;

		} else {

			obj[ key ] = value;

		}
	}

};