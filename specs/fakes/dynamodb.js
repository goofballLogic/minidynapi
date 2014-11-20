var state = {};

module.exports = {

	init: function( ns, manifest, entitlements ) {

		state[ ns + ".definition" ] = manifest;
		for( var uid in entitlements ) {

			state[ ns + ".entitlements." + uid ] = entitlements[ uid ];

		}

	},
	fakeEntitlements: function( ns, entitlements ) {

		for( var x in entitlements || {} ) {

			state[ ns + ".entitlements." + x ] = entitlements[ x ];

		}

	},
	fetchAppDefinition: function( config, callback ) {

		var def = state[ config.ns + ".definition" ];
		callback( null, def );

	},
	fetchUserEntitlements: function( config, uid, callback ) {

		var entitlements = state[ config.ns + ".entitlements." + uid ] || {};
		callback( null, entitlements );

	},
	fetchRoleEntitlements: function( config, role, callback ) {

		var entitlements = state[ config.ns + ".entitlements." + role ] || {};
		callback( null, entitlements );

	}

};