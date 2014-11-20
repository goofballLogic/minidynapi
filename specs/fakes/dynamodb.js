"use strict";
var state = {};

module.exports = {

	// behaviours
	fetchAppDefinition: function( config, callback ) {

		var manifest = this.ensureAppTable( config ).manifest || {};
		callback( null, manifest );

	},
	fetchUserEntitlements: function( config, uid, callback ) {

		var appTable = this.ensureAppTable( config );
		var entitlements = appTable[ userEntitlement( uid ) ] || {};
		callback( null, entitlements );

	},
	fetchRoleEntitlements: function( config, role, callback ) {

		var appTable = this.ensureAppTable( config );
		var entitlements = appTable[ roleEntitlement( role ) ] || {};
		callback( null, entitlements );

	},
	fetchSetUserIndex: function( config, set, uid, callback ) {

		var userIndex = this.ensureUserIndex( config, set, uid );
		callback( null, userIndex );

	},

	// test seams
	init: function( config, manifest ) {

		var appTable = this.ensureAppTable( config );
		appTable.manifest = manifest;

	},
	fakeUserEntitlements: function( config, entitlements ) {

		var appTable = this.ensureAppTable( config );
		for( var uid in entitlements || {} ) {

			appTable[ userEntitlement( uid ) ] = entitlements[ uid ];

		}

	},
	fakeRoleEntitlements: function( config, entitlements ) {

		var appTable = this.ensureAppTable( config );
		for( var role in entitlements || {} ) {

			appTable[ roleEntitlement( role ) ] = entitlements[ role ];

		}

	},
	forceItems: function( config, set, uid, itemsToAdd ) {

		var userIndex = this.ensureUserIndex( config, set, uid );
		var items = this.ensureSetTable( config, set );
		for( var iid in itemsToAdd ) {

			// save the item
			var itemVersionId = itemVersion( uid, iid );
			items[ itemVersionId ] = itemsToAdd[ iid ];
			// update the users item index
			var itemIndex = this.ensureItemIndex( config, set, uid, iid );
			itemIndex.push( itemVersionId );
			// update the user index
			userIndex[ iid ] = extractTimestamp( itemVersionId );

		}

	},
	// helper methods
	ensureAppTable: function( config ) {

		var appTableName = appTable( config );
		return ( state[ appTableName ] = state[ appTableName ] || {} );

	},
	ensureItemIndex: function( config, set, uid, iid ) {

		var setTable = this.ensureSetTable( config, set );
		var indexName = itemIndexName( uid, iid );
		setTable[ indexName ] = setTable[ indexName ] || [];
		return setTable[ indexName ];

	},
	ensureSetTable: function( config, set ) {

		var setTableName = setTable( config, set );
		state[ setTableName ] = state[ setTableName ] || {};
		return state[ setTableName ];

	},
	ensureUserIndex: function( config, set, uid ) {

		var setTable = this.ensureSetTable( config, set );
		var indexName = userIndexName( uid );
		setTable[ indexName ] = setTable[ indexName ] || {};
		return setTable[ indexName ];

	}

};

function appTable( config ) {

	return config.ns + ".definition";

}
function setTable( config, set ) {

	return config.ns + "." + set;

}

function userEntitlement( user ) {

	return "user-entitlements." + user;

}
function roleEntitlement( role ) {

	return "role-entitlements." + role;

}
function userIndexName( uid ) {

	return uid + ".index";

}
function itemVersion( uid, iid ) {

	return uid + "." + iid + "." + createTimestamp();

}
function itemIndexName( uid, iid ) {

	return uid + "." + iid + ".index";

}
function createTimestamp() {

	return Date.now() + "." + process.hrtime().join( "." );

}
function extractTimestamp( itemVersionId ) {

	return itemVersionId.split( "." ).slice( -3 ).join( "." );

}